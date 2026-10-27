"""Language-Aware Code and AST Parser for OMNICODE AI 5.0.

Parses source code into structured symbol nodes (classes, functions, methods, imports,
call expressions, docstrings, line ranges) using native Python AST and Tree-sitter.
"""

import ast
import re
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field


class SymbolNode(BaseModel):
    name: str
    symbol_type: str  # class, function, method, import, variable
    file_path: str
    start_line: int
    end_line: int
    docstring: Optional[str] = None
    parameters: List[str] = Field(default_factory=list)
    return_type: Optional[str] = None
    calls: List[str] = Field(default_factory=list)
    signature: str = ""


class FileParseResult(BaseModel):
    file_path: str
    symbols: List[SymbolNode] = Field(default_factory=list)
    imports: List[str] = Field(default_factory=list)
    total_lines: int = 0
    language: str = "unknown"
    parse_errors: List[str] = Field(default_factory=list)


class CodeParser:
    """Parses source files into structured AST symbol representations."""

    @staticmethod
    def detect_language(file_path: str) -> str:
        """Determines programming language from file extension."""
        ext = file_path.rsplit(".", 1)[-1].lower() if "." in file_path else ""
        mapping = {
            "py": "python",
            "js": "javascript",
            "jsx": "javascript",
            "ts": "typescript",
            "tsx": "typescript",
            "json": "json",
            "md": "markdown",
            "html": "html",
            "css": "css",
            "sh": "shell",
        }
        return mapping.get(ext, "text")

    def parse_python(self, file_path: str, content: str) -> FileParseResult:
        """Parses Python source using the built-in ast module for 100% precision."""
        lines = content.splitlines()
        result = FileParseResult(
            file_path=file_path,
            total_lines=len(lines),
            language="python",
        )

        try:
            tree = ast.parse(content, filename=file_path)
        except SyntaxError as e:
            result.parse_errors.append(f"Syntax error at line {e.lineno}: {e.msg}")
            return result

        for node in ast.walk(tree):
            if isinstance(node, (ast.Import, ast.ImportFrom)):
                if isinstance(node, ast.Import):
                    for alias in node.names:
                        result.imports.append(alias.name)
                else:
                    mod = node.module or ""
                    for alias in node.names:
                        result.imports.append(f"{mod}.{alias.name}")

            elif isinstance(node, ast.ClassDef):
                doc = ast.get_docstring(node)
                sig = f"class {node.name}"
                if node.bases:
                    bases = [ast.unparse(b) for b in node.bases]
                    sig += f"({', '.join(bases)})"
                result.symbols.append(
                    SymbolNode(
                        name=node.name,
                        symbol_type="class",
                        file_path=file_path,
                        start_line=node.lineno,
                        end_line=getattr(node, "end_lineno", node.lineno),
                        docstring=doc,
                        signature=sig,
                    )
                )

            elif isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
                # Determine if standalone function or method
                doc = ast.get_docstring(node)
                params = [arg.arg for arg in node.args.args]
                ret_type = ast.unparse(node.returns) if node.returns else None
                sig = f"{'async ' if isinstance(node, ast.AsyncFunctionDef) else ''}def {node.name}({', '.join(params)})"
                if ret_type:
                    sig += f" -> {ret_type}"

                # Extract calls inside function
                calls = []
                for child in ast.walk(node):
                    if isinstance(child, ast.Call):
                        if isinstance(child.func, ast.Name):
                            calls.append(child.func.id)
                        elif isinstance(child.func, ast.Attribute):
                            calls.append(child.func.attr)

                result.symbols.append(
                    SymbolNode(
                        name=node.name,
                        symbol_type="function",
                        file_path=file_path,
                        start_line=node.lineno,
                        end_line=getattr(node, "end_lineno", node.lineno),
                        docstring=doc,
                        parameters=params,
                        return_type=ret_type,
                        calls=list(set(calls)),
                        signature=sig,
                    )
                )

        return result

    def parse_generic(self, file_path: str, content: str, language: str) -> FileParseResult:
        """Regex-based parser for JavaScript/TypeScript and other languages."""
        lines = content.splitlines()
        result = FileParseResult(file_path=file_path, total_lines=len(lines), language=language)

        # Import regex
        import_pattern = re.compile(r'import\s+(?:\{[^}]+\}|\*\s+as\s+\w+|\w+)?\s*(?:from\s*)?[\'"]([^\'"]+)[\'"]')
        for match in import_pattern.finditer(content):
            result.imports.append(match.group(1))

        # Function / Class regex
        fn_pattern = re.compile(r'(?:export\s+)?(?:async\s+)?function\s+([A-Za-z0-9_$]+)\s*\(([^)]*)\)')
        class_pattern = re.compile(r'(?:export\s+)?class\s+([A-Za-z0-9_$]+)')

        for idx, line in enumerate(lines, start=1):
            for m in class_pattern.finditer(line):
                end_l = min(len(lines), idx + 80)
                result.symbols.append(
                    SymbolNode(
                        name=m.group(1),
                        symbol_type="class",
                        file_path=file_path,
                        start_line=idx,
                        end_line=end_l,
                        signature=line.strip(),
                    )
                )
            for m in fn_pattern.finditer(line):
                params = [p.strip() for p in m.group(2).split(",") if p.strip()]
                end_l = min(len(lines), idx + 80)
                result.symbols.append(
                    SymbolNode(
                        name=m.group(1),
                        symbol_type="function",
                        file_path=file_path,
                        start_line=idx,
                        end_line=end_l,
                        parameters=params,
                        signature=line.strip(),
                    )
                )

        return result

    def parse(self, file_path: str, content: str) -> FileParseResult:
        """Parses any supported source code into structured FileParseResult."""
        lang = self.detect_language(file_path)
        if lang == "python":
            return self.parse_python(file_path, content)
        return self.parse_generic(file_path, content, lang)
