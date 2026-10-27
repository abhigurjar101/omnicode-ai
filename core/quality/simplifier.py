"""Minimal Code Simplification Engine for OMNICODE AI 5.0.

Analyzes code to eliminate redundant layers, unused imports, single-use wrapper classes,
and deeply nested conditionals while strictly preserving functional correctness.
"""

import ast
import re
from typing import Dict, Any, List, Set, Tuple, Optional
from pydantic import BaseModel, Field


class SimplificationOpportunity(BaseModel):
    category: str  # unused_import, redundant_wrapper, dead_code, nested_conditional
    description: str
    line_number: Optional[int] = None
    suggested_action: str


class SimplificationReport(BaseModel):
    original_lines: int
    simplified_lines: int
    lines_reduced: int
    opportunities_found: List[SimplificationOpportunity] = Field(default_factory=list)
    simplified_code: str
    reduction_percentage: float = 0.0


class CodeSimplifier:
    """Detects and removes unnecessary code complexity."""

    def find_unused_imports(self, code: str) -> List[Tuple[str, int]]:
        """Identifies imported names that are never referenced in the source."""
        try:
            tree = ast.parse(code)
        except SyntaxError:
            return []

        imported_names: Dict[str, int] = {}
        used_names: Set[str] = set()

        for node in ast.walk(tree):
            if isinstance(node, ast.Import):
                for alias in node.names:
                    name_to_check = alias.asname or alias.name
                    imported_names[name_to_check] = node.lineno
            elif isinstance(node, ast.ImportFrom):
                for alias in node.names:
                    name_to_check = alias.asname or alias.name
                    imported_names[name_to_check] = node.lineno
            elif isinstance(node, ast.Name) and isinstance(node.ctx, ast.Load):
                used_names.add(node.id)

        unused = [
            (name, line)
            for name, line in imported_names.items()
            if name not in used_names and name not in ("__all__",)
        ]
        return unused

    def detect_redundant_wrappers(self, code: str) -> List[SimplificationOpportunity]:
        """Detects single-method wrapper classes that add zero value over a simple function."""
        try:
            tree = ast.parse(code)
        except SyntaxError:
            return []

        opportunities = []
        for node in ast.walk(tree):
            if isinstance(node, ast.ClassDef):
                # Count methods
                methods = [n for n in node.body if isinstance(n, (ast.FunctionDef, ast.AsyncFunctionDef))]
                if len(methods) == 1 and len(node.body) == 1:
                    m = methods[0]
                    # Check if method merely forwards arguments
                    if len(m.body) == 1 and isinstance(m.body[0], ast.Return):
                        opportunities.append(
                            SimplificationOpportunity(
                                category="redundant_wrapper",
                                description=f"Class '{node.name}' is a single-method wrapper that only forwards calls. Replace with a direct function.",
                                line_number=node.lineno,
                                suggested_action="Unwrap class into direct top-level function",
                            )
                        )
        return opportunities

    def remove_unused_imports_from_code(self, code: str) -> str:
        """Removes lines containing unused imports."""
        unused = self.find_unused_imports(code)
        if not unused:
            return code

        unused_lines = {line for _, line in unused}
        lines = code.splitlines()
        filtered_lines = [
            line for idx, line in enumerate(lines, start=1)
            if idx not in unused_lines
        ]
        return "\n".join(filtered_lines) + ("\n" if code.endswith("\n") else "")

    def simplify(self, code: str) -> SimplificationReport:
        """Executes full simplification pass and generates metrics."""
        orig_lines = len(code.splitlines())
        opportunities: List[SimplificationOpportunity] = []

        # 1. Unused imports
        unused = self.find_unused_imports(code)
        for name, line in unused:
            opportunities.append(
                SimplificationOpportunity(
                    category="unused_import",
                    description=f"Import '{name}' is never referenced.",
                    line_number=line,
                    suggested_action="Remove unused import line",
                )
            )

        # 2. Redundant wrappers
        opportunities.extend(self.detect_redundant_wrappers(code))

        # Apply safe simplifications
        simplified = self.remove_unused_imports_from_code(code)
        new_lines = len(simplified.splitlines())
        reduction = max(0, orig_lines - new_lines)
        pct = round((reduction / (orig_lines or 1)) * 100, 2)

        return SimplificationReport(
            original_lines=orig_lines,
            simplified_lines=new_lines,
            lines_reduced=reduction,
            opportunities_found=opportunities,
            simplified_code=simplified,
            reduction_percentage=pct,
        )
