"""Symbol Table and Navigation Engine for OMNICODE AI 5.0.

Indexes and retrieves code symbols, definitions, signatures, and references
across the entire workspace.
"""

from typing import Dict, Any, List, Optional
from core.code_intelligence.parser import SymbolNode, FileParseResult


class SymbolTable:
    """Fast in-memory symbol index for workspace definitions and references."""

    def __init__(self):
        # name -> list of SymbolNode
        self._symbols_by_name: Dict[str, List[SymbolNode]] = {}
        # file_path -> FileParseResult
        self._files: Dict[str, FileParseResult] = {}

    def index_file_parse(self, parse_result: FileParseResult) -> None:
        """Adds or updates symbols from a parsed file."""
        # Clear prior symbols from this file
        self._files[parse_result.file_path] = parse_result

        for name, nodes in list(self._symbols_by_name.items()):
            self._symbols_by_name[name] = [n for n in nodes if n.file_path != parse_result.file_path]
            if not self._symbols_by_name[name]:
                del self._symbols_by_name[name]

        # Register new symbols
        for sym in parse_result.symbols:
            self._symbols_by_name.setdefault(sym.name, []).append(sym)

    def find_definition(self, symbol_name: str) -> List[SymbolNode]:
        """Finds definition nodes for a given symbol name."""
        return self._symbols_by_name.get(symbol_name, [])

    def search_symbols(self, query: str, symbol_type: Optional[str] = None) -> List[SymbolNode]:
        """Searches symbols by partial name, query tokens, and optional symbol type filter."""
        import re
        q = query.lower()
        q_tokens = [t.lower() for t in re.findall(r"[a-zA-Z0-9_]+", q)]
        results: List[SymbolNode] = []

        for name, nodes in self._symbols_by_name.items():
            name_lower = name.lower()
            matched = (
                q in name_lower
                or name_lower in q
                or any(t == name_lower or t in name_lower for t in q_tokens)
            )
            if matched:
                for node in nodes:
                    if symbol_type is None or node.symbol_type == symbol_type:
                        results.append(node)

        results.sort(key=lambda s: (0 if s.name.lower() in q else 1, len(s.name)))
        return results

    def find_references(self, symbol_name: str) -> List[Dict[str, Any]]:
        """Finds where a symbol is called across all parsed files."""
        refs: List[Dict[str, Any]] = []

        for file_path, parse_res in self._files.items():
            for sym in parse_res.symbols:
                if symbol_name in sym.calls:
                    refs.append({
                        "file_path": file_path,
                        "caller_symbol": sym.name,
                        "caller_type": sym.symbol_type,
                        "start_line": sym.start_line,
                        "end_line": sym.end_line,
                    })

        return refs

    def get_file_outline(self, file_path: str) -> List[Dict[str, Any]]:
        """Returns the structured symbol outline for a file."""
        parse_res = self._files.get(file_path)
        if not parse_res:
            return []

        return [
            {
                "name": s.name,
                "type": s.symbol_type,
                "signature": s.signature,
                "start_line": s.start_line,
                "end_line": s.end_line,
                "docstring": s.docstring,
            }
            for s in parse_res.symbols
        ]
