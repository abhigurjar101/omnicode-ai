"""Static Analysis and Syntax Verification for OMNICODE AI 5.0.

Performs syntax validation, AST analysis, and cyclomatic complexity estimation.
"""

import ast
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field


class StaticCheckResult(BaseModel):
    is_valid_syntax: bool
    syntax_error: Optional[str] = None
    cyclomatic_complexity: int = 1
    total_functions: int = 0
    total_classes: int = 0
    warnings: List[str] = Field(default_factory=list)


class StaticChecker:
    """Runs fast AST static checks on code snippets or source files."""

    @staticmethod
    def validate_syntax(code: str, file_path: str = "snippet.py") -> StaticCheckResult:
        """Checks if code is syntactically valid and calculates basic complexity."""
        try:
            tree = ast.parse(code, filename=file_path)
        except SyntaxError as e:
            return StaticCheckResult(
                is_valid_syntax=False,
                syntax_error=f"Line {e.lineno}: {e.msg}",
            )

        complexity = 1
        fn_count = 0
        cls_count = 0
        warnings = []

        for node in ast.walk(tree):
            if isinstance(node, (ast.If, ast.While, ast.For, ast.ExceptHandler, ast.With)):
                complexity += 1
            elif isinstance(node, ast.BoolOp):
                complexity += len(node.values) - 1
            elif isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
                fn_count += 1
            elif isinstance(node, ast.ClassDef):
                cls_count += 1

        if complexity > 15:
            warnings.append(f"High cyclomatic complexity ({complexity}). Consider decomposing into smaller subroutines.")

        return StaticCheckResult(
            is_valid_syntax=True,
            cyclomatic_complexity=complexity,
            total_functions=fn_count,
            total_classes=cls_count,
            warnings=warnings,
        )
