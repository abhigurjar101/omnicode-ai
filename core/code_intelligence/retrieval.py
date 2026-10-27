"""Agentic Repository Retriever for OMNICODE AI 5.0.

Implements the complete multi-stage Agentic RAG retrieval pipeline:
Query Interpretation -> Candidate Filtering -> Semantic + Lexical Retrieval ->
Symbol Graph Traversal -> Cross-Encoder Reranking -> Context Compression.
"""

from pathlib import Path
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field

from core.code_intelligence.parser import CodeParser, FileParseResult, SymbolNode
from core.code_intelligence.symbols import SymbolTable
from core.code_intelligence.dependencies import DependencyGraph
from core.code_intelligence.indexing import CodeIndex, IndexedChunk
from core.nvidia.embeddings import NvidiaEmbeddings
from core.nvidia.reranking import NvidiaReranker
from core.tools.filesystem import FilesystemTools


class RetrievedEvidence(BaseModel):
    file_path: str
    symbol_name: Optional[str] = None
    start_line: int
    end_line: int
    content: str
    score: float
    retrieval_method: str  # lexical, semantic, symbol_graph, definition


class AgenticRetriever:
    """Multi-stage Agentic RAG engine for deep repository intelligence."""

    def __init__(self, workspace_root: str):
        self.workspace_root = Path(workspace_root).resolve()
        self.fs = FilesystemTools(str(self.workspace_root))
        self.parser = CodeParser()
        self.symbols = SymbolTable()
        self.dependencies = DependencyGraph()
        self.embeddings = NvidiaEmbeddings()
        self.reranker = NvidiaReranker()
        self.index = CodeIndex(self.embeddings)
        self._indexed = False

    async def index_workspace(self, force_refresh: bool = False) -> Dict[str, Any]:
        """Scans workspace, parses ASTs, indexes symbols, and builds search indexes."""
        if self._indexed and not force_refresh:
            return {"status": "already_indexed", "chunks": len(self.index.chunks)}

        self.index.clear()
        files_res = self.fs.list_files(max_depth=5)
        files = files_res.get("files", [])

        chunks_to_index: List[IndexedChunk] = []
        parsed_count = 0

        for f_path in files:
            # Skip non-code files
            if not any(f_path.endswith(ext) for ext in [".py", ".ts", ".js", ".tsx", ".jsx"]):
                continue

            read_res = self.fs.read_file(f_path)
            if not read_res.get("success"):
                continue

            content = read_res["content"]
            parse_res = self.parser.parse(f_path, content)
            self.symbols.index_file_parse(parse_res)
            self.dependencies.register_file_imports(f_path, parse_res.imports)
            parsed_count += 1

            # Symbol-based chunking
            if parse_res.symbols:
                for sym in parse_res.symbols:
                    # Extract lines
                    sym_lines = content.splitlines()[sym.start_line - 1 : sym.end_line]
                    sym_text = "\n".join(sym_lines)
                    chunks_to_index.append(
                        IndexedChunk(
                            chunk_id=f"{f_path}:{sym.name}:{sym.start_line}",
                            file_path=f_path,
                            start_line=sym.start_line,
                            end_line=sym.end_line,
                            content=sym_text,
                            symbol_name=sym.name,
                        )
                    )
            else:
                # File-level chunking
                chunks_to_index.append(
                    IndexedChunk(
                        chunk_id=f"{f_path}:1:{parse_res.total_lines}",
                        file_path=f_path,
                        start_line=1,
                        end_line=min(100, parse_res.total_lines),
                        content="\n".join(content.splitlines()[:100]),
                    )
                )

        await self.index.add_chunks(chunks_to_index, generate_embeddings=True)
        self._indexed = True
        return {
            "status": "indexed",
            "files_parsed": parsed_count,
            "symbols_indexed": len(self.symbols._symbols_by_name),
            "chunks_indexed": len(self.index.chunks),
        }

    async def retrieve_evidence(
        self,
        query: str,
        top_k: int = 5,
        context_budget_chars: int = 16000,
    ) -> List[RetrievedEvidence]:
        """Executes the full 7-stage agentic retrieval workflow."""
        if not self._indexed:
            await self.index_workspace()

        # Step 1: Lexical Search
        lexical_matches = self.index.search_lexical(query, top_k=top_k * 2)

        # Step 2: Semantic Search
        semantic_matches = await self.index.search_semantic(query, top_k=top_k * 2)

        # Step 3: Exact Symbol Definition Traversal
        symbol_nodes = self.symbols.search_symbols(query)

        # Step 4: Aggregate candidates
        seen_keys = set()
        candidates: List[Dict[str, Any]] = []

        for m in lexical_matches:
            c = m["chunk"]
            key = f"{c.file_path}:{c.start_line}"
            if key not in seen_keys:
                seen_keys.add(key)
                candidates.append({
                    "file_path": c.file_path,
                    "symbol_name": c.symbol_name,
                    "start_line": c.start_line,
                    "end_line": c.end_line,
                    "content": c.content,
                    "score": m["score"],
                    "method": "lexical",
                })

        for m in semantic_matches:
            c = m["chunk"]
            key = f"{c.file_path}:{c.start_line}"
            if key not in seen_keys:
                seen_keys.add(key)
                candidates.append({
                    "file_path": c.file_path,
                    "symbol_name": c.symbol_name,
                    "start_line": c.start_line,
                    "end_line": c.end_line,
                    "content": c.content,
                    "score": m["score"],
                    "method": "semantic",
                })

        for s in symbol_nodes[:5]:
            read_res = self.fs.read_file(s.file_path, start_line=s.start_line, end_line=s.end_line)
            if read_res.get("success"):
                key = f"{s.file_path}:{s.start_line}"
                if key not in seen_keys:
                    seen_keys.add(key)
                    candidates.append({
                        "file_path": s.file_path,
                        "symbol_name": s.name,
                        "start_line": s.start_line,
                        "end_line": s.end_line,
                        "content": read_res["content"],
                        "score": 10.0,
                        "method": "symbol_graph",
                    })

        # Step 5: Cross-Encoder Reranking
        reranked = await self.reranker.rerank(query, candidates, top_k=top_k)

        # Step 6: Context Budget Compression
        results: List[RetrievedEvidence] = []
        current_chars = 0

        for r in reranked:
            content = r.get("content", "")
            if current_chars + len(content) > context_budget_chars and results:
                break
            results.append(
                RetrievedEvidence(
                    file_path=r["file_path"],
                    symbol_name=r.get("symbol_name"),
                    start_line=r["start_line"],
                    end_line=r["end_line"],
                    content=content,
                    score=r.get("relevance_score", 1.0),
                    retrieval_method=r.get("method", "hybrid"),
                )
            )
            current_chars += len(content)

        return results

    # Atomic retrieval helper tools:
    def search_symbols(self, query: str) -> List[Dict[str, Any]]:
        nodes = self.symbols.search_symbols(query)
        return [
            {
                "name": n.name,
                "type": n.symbol_type,
                "file_path": n.file_path,
                "line": n.start_line,
                "signature": n.signature,
            }
            for n in nodes
        ]

    def find_definition(self, symbol_name: str) -> List[Dict[str, Any]]:
        nodes = self.symbols.find_definition(symbol_name)
        return [
            {
                "name": n.name,
                "type": n.symbol_type,
                "file_path": n.file_path,
                "line": n.start_line,
                "signature": n.signature,
            }
            for n in nodes
        ]

    def find_references(self, symbol_name: str) -> List[Dict[str, Any]]:
        return self.symbols.find_references(symbol_name)

    def inspect_imports(self, file_path: str) -> List[str]:
        return self.dependencies.get_file_imports(file_path)

    def inspect_dependencies(self, module_name: str) -> List[str]:
        return self.dependencies.get_dependent_files(module_name)
