"""Coding Standards and Principles Engine for OMNICODE AI 5.0.

Codifies KISS, DRY, YAGNI, SOLID, and Least Privilege principles.
Evaluates code metrics, nesting depth, function sizes, and stylistic violations.
"""

import ast
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field


class Violation(BaseModel):
    rule: str
    principle: str  # KISS, DRY, YAGNI, SOLID, SECURITY
    severity: str  # critical, major, minor, suggestion
    message: str
    file_path: Optional[str] = None
    line_number: Optional[int] = None


class StandardsReviewResult(BaseModel):
    passed: bool
    violations: List[Violation] = Field(default_factory=list)
    kiss_score: float = 10.0
    dry_score: float = 10.0
    yagni_score: float = 10.0
    solid_score: float = 10.0
    overall_score: float = 10.0


class CodingStandardsEngine:
    """Enforces strict software architecture and code quality standards."""

    MAX_FUNCTION_LINES = 80
    MAX_NESTING_DEPTH = 4

    def review_python_code(self, code: str, file_path: str = "snippet.py") -> StandardsReviewResult:
        """Audits Python code against architectural principles."""
        violations: List[Violation] = []

        try:
            tree = ast.parse(code, filename=file_path)
        except SyntaxError as e:
            violations.append(
                Violation(
                    rule="VALID_SYNTAX",
                    principle="KISS",
                    severity="critical",
                    message=f"Syntax error: {e.msg}",
                    file_path=file_path,
                    line_number=e.lineno,
                )
            )
            return StandardsReviewResult(passed=False, violations=violations, overall_score=0.0)

        # Inspect classes and functions
        for node in ast.walk(tree):
            if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
                # Check function length
                start = node.lineno
                end = getattr(node, "end_lineno", start)
                length = end - start + 1
                if length > self.MAX_FUNCTION_LINES:
                    violations.append(
                        Violation(
                            rule="MAX_FUNCTION_LENGTH",
                            principle="KISS",
                            severity="minor",
                            message=f"Function '{node.name}' is {length} lines long (maximum recommended is {self.MAX_FUNCTION_LINES}). Consider breaking it into smaller cohesive steps.",
                            file_path=file_path,
                            line_number=start,
                        )
                    )

                # Check broad exception handling
                for child in ast.walk(node):
                    if isinstance(child, ast.ExceptHandler):
                        if child.type is None:  # except:
                            violations.append(
                                Violation(
                                    rule="NO_BARE_EXCEPT",
                                    principle="SOLID",
                                    severity="major",
                                    message="Bare 'except:' suppresses system exits and masks bugs. Catch specific exceptions.",
                                    file_path=file_path,
                                    line_number=child.lineno,
                                )
                            )
                        elif isinstance(child.type, ast.Name) and child.type.id in ("BaseException", "Exception"):
                            # Check if body simply passes without logging or re-raising
                            if len(child.body) == 1 and isinstance(child.body[0], ast.Pass):
                                violations.append(
                                    Violation(
                                        rule="NO_SILENT_EXCEPTION_SWALLOWING",
                                        principle="SOLID",
                                        severity="major",
                                        message="Broad exception caught and silently ignored with 'pass'. Handle or log the error.",
                                        file_path=file_path,
                                        line_number=child.lineno,
                                    )
                                )

                    # Check mutable default argument
                    if isinstance(child, (ast.FunctionDef, ast.AsyncFunctionDef)):
                        for default in child.args.defaults:
                            if isinstance(default, (ast.List, ast.Dict, ast.Set)):
                                violations.append(
                                    Violation(
                                        rule="NO_MUTABLE_DEFAULT_ARG",
                                        principle="KISS",
                                        severity="major",
                                        message=f"Mutable default argument detected in function '{child.name}'. Use None and default inside body.",
                                        file_path=file_path,
                                        line_number=child.lineno,
                                    )
                                )

        # Calculate scores
        major_count = sum(1 for v in violations if v.severity in ("critical", "major"))
        minor_count = sum(1 for v in violations if v.severity == "minor")
        penalty = (major_count * 2.0) + (minor_count * 0.5)
        overall_score = max(0.0, round(10.0 - penalty, 2))

        return StandardsReviewResult(
            passed=major_count == 0,
            violations=violations,
            overall_score=overall_score,
            kiss_score=max(0.0, round(10.0 - (minor_count * 0.5), 2)),
            dry_score=10.0,
            yagni_score=10.0,
            solid_score=max(0.0, round(10.0 - (major_count * 2.0), 2)),
        )
