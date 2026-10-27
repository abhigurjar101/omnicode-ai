"""Production Hybrid RAG Engine for NEMI-CO.

Combines Dense Semantic Embeddings + BM25 Lexical Matching + AST Code Symbols
using Reciprocal Rank Fusion (RRF), Cross-Encoder Reranking, and Context Budgeting.
"""

import re
import math
import asyncio
from pathlib import Path
from typing import Dict, Any, List, Optional, Set
from pydantic import BaseModel, Field

from core.code_intelligence.parser import CodeParser, SymbolNode
from core.code_intelligence.symbols import SymbolTable
from core.nvidia.embeddings import NvidiaEmbeddings
from core.nvidia.reranking import NvidiaReranker
from core.tools.filesystem import FilesystemTools

try:
    from rank_bm25 import BM25Okapi
except ImportError:
    BM25Okapi = None


class RetrievedRecord(BaseModel):
    """Standardized retrieval context record matching NEMI-CO Specification."""
    source: str = "local"  # "github" | "docs" | "local"
    repository: str = "primary_workspace"
    file_path: str
    symbol: Optional[str] = None
    language: str = "typescript"
    content: str
    version: str = "current"
    relevance_score: float = 0.0
    source_url: Optional[str] = None
    retrieval_method: str = "hybrid_rrf"


class HybridRAGService:
    """Enterprise-grade hybrid semantic search and retrieval service."""

    def __init__(self, workspace_root: str):
        self.workspace_root = Path(workspace_root).resolve()
        self.fs = FilesystemTools(str(self.workspace_root))
        self.parser = CodeParser()
        self.symbols = SymbolTable()
        self.embeddings = NvidiaEmbeddings()
        self.reranker = NvidiaReranker()

        # Indexed chunks storage
        self.chunks: List[Dict[str, Any]] = []
        self._bm25: Optional[Any] = None
        self._tokenized_corpus: List[List[str]] = []
        self._indexed = False
        self._file_hashes: Dict[str, str] = {}

    def _hash_content(self, text: str) -> str:
        import hashlib
        return hashlib.md5(text.encode("utf-8")).hexdigest()

    async def index_workspace(self, force: bool = False) -> Dict[str, Any]:
        """Performs incremental AST-aware parsing and hybrid indexing."""
        if self._indexed and not force:
            return {"status": "indexed", "total_chunks": len(self.chunks)}

        ignored_dirs = {"node_modules", ".next", ".git", "__pycache__", "venv", ".venv", "dist", "build", ".turbo", ".gemini", "coverage", "tests"}
        files_res = self.fs.list_files(max_depth=4)
        files = files_res.get("files", [])
        code_files = [
            f for f in files
            if not any(part in ignored_dirs for part in Path(f).parts)
            and any(f.endswith(ext) for ext in [".py", ".ts", ".tsx", ".js", ".jsx", ".css", ".json", ".md"])
        ]

        new_chunks = []
        for file_path in code_files:
            read_res = self.fs.read_file(file_path)
            if not read_res.get("success"):
                continue

            content = read_res["content"]
            content_hash = self._hash_content(content)

            # Skip unchanged files if incremental
            if not force and self._file_hashes.get(file_path) == content_hash:
                continue

            self._file_hashes[file_path] = content_hash
            language = self.parser.detect_language(file_path)
            parse_res = self.parser.parse(file_path, content)
            self.symbols.index_file_parse(parse_res)

            # AST Structural Boundary Chunking
            lines = content.splitlines()
            if parse_res.symbols:
                for sym in parse_res.symbols:
                    s_idx = max(0, sym.start_line - 1)
                    e_idx = min(len(lines), sym.end_line)
                    sym_code = "\n".join(lines[s_idx:e_idx])
                    new_chunks.append({
                        "id": f"{file_path}:{sym.name}:{sym.start_line}",
                        "file_path": file_path,
                        "symbol": sym.name,
                        "language": language,
                        "start_line": sym.start_line,
                        "end_line": sym.end_line,
                        "content": sym_code,
                        "source": "local",
                    })
            else:
                # File-level chunk with 80-line windows
                window = 80
                for start in range(0, max(1, len(lines)), window):
                    end = min(len(lines), start + window)
                    chunk_code = "\n".join(lines[start:end])
                    if chunk_code.strip():
                        new_chunks.append({
                            "id": f"{file_path}:{start + 1}:{end}",
                            "file_path": file_path,
                            "symbol": None,
                            "language": language,
                            "start_line": start + 1,
                            "end_line": end,
                            "content": chunk_code,
                            "source": "local",
                        })

        if new_chunks:
            # Generate dense embeddings
            texts = [c["content"] for c in new_chunks]
            vectors = await self.embeddings.embed_documents(texts)
            for i, vec in enumerate(vectors):
                new_chunks[i]["embedding"] = vec

            self.chunks.extend(new_chunks)

            # Build / Rebuild BM25 tokenized corpus
            self._tokenized_corpus = [
                re.findall(r"[a-zA-Z0-9_]+", c["content"].lower())
                for c in self.chunks
            ]
            if BM25Okapi and self._tokenized_corpus:
                self._bm25 = BM25Okapi(self._tokenized_corpus)

        self._indexed = True
        return {
            "status": "ready",
            "indexed_files": len(code_files),
            "total_chunks": len(self.chunks),
            "total_symbols": len(self.symbols._symbols_by_name),
        }

    def decompose_query(self, query: str) -> List[str]:
        """Expands and decomposes complex query into sub-queries and symbol keywords."""
        sub_queries = [query.strip()]
        tokens = re.findall(r"[a-zA-Z0-9_]+", query)

        # Extract file mentions (e.g. App.tsx, palindrome.py)
        file_mentions = [t for t in tokens if "." in t or any(t.endswith(ext) for ext in ["tsx", "ts", "py", "js"])]
        if file_mentions:
            sub_queries.extend(file_mentions)

        # Extract code symbols (camelCase, PascalCase, snake_case)
        code_identifiers = [
            t for t in tokens
            if "_" in t or (any(c.isupper() for c in t) and any(c.islower() for c in t))
        ]
        if code_identifiers:
            sub_queries.extend(code_identifiers)

        return list(dict.fromkeys(sub_queries))

    async def search_dense(self, query: str, top_k: int = 15) -> List[Dict[str, Any]]:
        """Dense semantic retrieval via vector cosine similarity."""
        if not self.chunks:
            return []

        query_vec = await self.embeddings.embed_query(query)
        scored = []
        for idx, chunk in enumerate(self.chunks):
            emb = chunk.get("embedding")
            if emb:
                sim = self.embeddings.cosine_similarity(query_vec, emb)
                scored.append((idx, float(sim)))

        scored.sort(key=lambda x: x[1], reverse=True)
        return [
            {"chunk_idx": idx, "score": score, "method": "dense"}
            for idx, score in scored[:top_k]
        ]

    def search_sparse(self, query: str, top_k: int = 15) -> List[Dict[str, Any]]:
        """Sparse lexical retrieval via BM25 Okapi with exact keyword boosting."""
        if not self.chunks:
            return []

        tokens = re.findall(r"[a-zA-Z0-9_]+", query.lower())
        if not tokens:
            return []

        if self._bm25:
            scores = self._bm25.get_scores(tokens)
            indexed_scores = [(idx, float(score)) for idx, score in enumerate(scores)]
        else:
            indexed_scores = []
            for idx, c in enumerate(self.chunks):
                text_lower = c["content"].lower()
                matches = sum(1 for t in tokens if t in text_lower)
                indexed_scores.append((idx, float(matches)))

        indexed_scores.sort(key=lambda x: x[1], reverse=True)
        return [
            {"chunk_idx": idx, "score": score, "method": "bm25"}
            for idx, score in indexed_scores[:top_k]
            if score > 0.0
        ]

    def search_symbol_graph(self, query: str) -> List[Dict[str, Any]]:
        """AST symbol lookup returning exact function/class definitions."""
        nodes = self.symbols.search_symbols(query)
        results = []
        for n in nodes[:10]:
            # Find matching chunk
            for idx, c in enumerate(self.chunks):
                if c["file_path"] == n.file_path and c.get("symbol") == n.name:
                    results.append({"chunk_idx": idx, "score": 10.0, "method": "symbol_ast"})
                    break
        return results

    def reciprocal_rank_fusion(
        self,
        dense_results: List[Dict[str, Any]],
        sparse_results: List[Dict[str, Any]],
        symbol_results: List[Dict[str, Any]],
        rrf_k: int = 60,
    ) -> List[Dict[str, Any]]:
        """Combines multiple ranked candidate lists using standard RRF: score = sum(1 / (k + rank))."""
        rrf_scores: Dict[int, float] = {}
        methods_map: Dict[int, Set[str]] = {}

        def accumulate(ranked_list: List[Dict[str, Any]], method_name: str):
            for rank, item in enumerate(ranked_list):
                c_idx = item["chunk_idx"]
                rrf_scores[c_idx] = rrf_scores.get(c_idx, 0.0) + (1.0 / (rrf_k + rank + 1))
                methods_map.setdefault(c_idx, set()).add(method_name)

        accumulate(dense_results, "dense")
        accumulate(sparse_results, "bm25")
        accumulate(symbol_results, "symbol")

        sorted_candidates = sorted(rrf_scores.items(), key=lambda x: x[1], reverse=True)
        return [
            {
                "chunk_idx": c_idx,
                "rrf_score": score,
                "methods": list(methods_map[c_idx]),
            }
            for c_idx, score in sorted_candidates
        ]

    async def search(
        self,
        query: str,
        top_k: int = 5,
        context_budget_chars: int = 12000,
    ) -> List[RetrievedRecord]:
        """Executes full multi-stage hybrid RAG pipeline:
        Query Decomposition -> Dense + Sparse + Symbol Search -> RRF Fusion -> Reranking -> Budget Compression.
        """
        if not self._indexed:
            await self.index_workspace()

        # Step 1: Query expansion
        sub_queries = self.decompose_query(query)

        # Step 2: Parallel retrieval across all channels
        dense_candidates = []
        sparse_candidates = []
        symbol_candidates = []

        for q in sub_queries[:3]:
            d_res = await self.search_dense(q, top_k=top_k * 2)
            s_res = self.search_sparse(q, top_k=top_k * 2)
            sym_res = self.search_symbol_graph(q)
            dense_candidates.extend(d_res)
            sparse_candidates.extend(s_res)
            symbol_candidates.extend(sym_res)

        # Deduplicate rankings per channel
        def dedup(cand_list):
            seen = set()
            out = []
            for item in cand_list:
                if item["chunk_idx"] not in seen:
                    seen.add(item["chunk_idx"])
                    out.append(item)
            return out

        dense_candidates = dedup(dense_candidates)
        sparse_candidates = dedup(sparse_candidates)
        symbol_candidates = dedup(symbol_candidates)

        # Step 3: Reciprocal Rank Fusion
        fused = self.reciprocal_rank_fusion(dense_candidates, sparse_candidates, symbol_candidates)

        # Step 4: Cross-Encoder Reranking
        candidates_for_rerank = []
        for item in fused[:top_k * 3]:
            chunk = self.chunks[item["chunk_idx"]]
            candidates_for_rerank.append({
                "chunk": chunk,
                "content": chunk["content"],
                "file_path": chunk["file_path"],
                "symbol": chunk.get("symbol"),
                "language": chunk["language"],
                "methods": item["methods"],
                "rrf_score": item["rrf_score"],
            })

        reranked = await self.reranker.rerank(query, candidates_for_rerank, top_k=top_k)

        # Step 5: Context Budget Compression & Output Standardization
        records: List[RetrievedRecord] = []
        total_chars = 0

        for item in reranked:
            content = item.get("content", "")
            if total_chars + len(content) > context_budget_chars and records:
                break

            records.append(
                RetrievedRecord(
                    source=item.get("source", "local"),
                    repository="primary_workspace",
                    file_path=item["file_path"],
                    symbol=item.get("symbol"),
                    language=item.get("language", "typescript"),
                    content=content,
                    version="current",
                    relevance_score=round(item.get("relevance_score", 1.0), 4),
                    source_url=f"workspace://{item['file_path']}",
                    retrieval_method="+".join(item.get("methods", ["hybrid"])),
                )
            )
            total_chars += len(content)

        return records

    search_hybrid = search
