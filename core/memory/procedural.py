"""Procedural Memory for OMNICODE AI 5.0.

Maintains verified reusable coding, debugging, refactoring, and verification procedures.
"""

import time
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field


class ProceduralMethod(BaseModel):
    method_id: str
    name: str
    description: str
    steps: List[str] = Field(default_factory=list)
    applicability: List[str] = Field(default_factory=list)
    success_rate: float = 1.0
    times_used: int = 0
    created_at: float = Field(default_factory=time.time)


class ProceduralMemory:
    """Stores established procedural methods and engineering recipes."""

    def __init__(self):
        self._methods: Dict[str, ProceduralMethod] = {}
        self._seed_default_procedures()

    def _seed_default_procedures(self) -> None:
        """Seeds standard verified procedures."""
        self.register(
            ProceduralMethod(
                method_id="tdd_bugfix",
                name="Red-Green-Refactor Bugfix Procedure",
                description="Standard TDD procedure for isolating and repairing software defects.",
                steps=[
                    "Reproduce error with a targeted failing unit test (RED)",
                    "Inspect stack trace and locate exact root cause in source",
                    "Apply the minimum sufficient patch to pass the test (GREEN)",
                    "Run static checks and simplify redundant code (REFACTOR)",
                    "Verify full test suite passes with zero regressions (VERIFY)",
                ],
                applicability=["python", "javascript", "typescript", "bugfix"],
            )
        )
        self.register(
            ProceduralMethod(
                method_id="kiss_simplification",
                name="KISS Code Simplification Procedure",
                description="Systematic reduction of unnecessary complexity and wrappers.",
                steps=[
                    "Scan for single-use abstractions and intermediate wrappers",
                    "Flatten deeply nested conditionals into early return guard clauses",
                    "Replace custom loops/algorithms with standard-library utilities",
                    "Remove dead code and unused imports",
                    "Re-run verification test suite to ensure behavioral invariance",
                ],
                applicability=["refactor", "simplification", "code_review"],
            )
        )

    def register(self, method: ProceduralMethod) -> None:
        """Registers a procedural method."""
        self._methods[method.method_id] = method

    def get(self, method_id: str) -> Optional[ProceduralMethod]:
        """Gets procedural method by ID."""
        return self._methods.get(method_id)

    def search(self, query: str, top_k: int = 3) -> List[ProceduralMethod]:
        """Searches procedural methods by keyword."""
        q = query.lower()
        scored = []
        for m in self._methods.values():
            score = 0.0
            if q in m.name.lower():
                score += 3.0
            if q in m.description.lower():
                score += 2.0
            for app in m.applicability:
                if q in app.lower():
                    score += 2.0
            if score > 0.0:
                scored.append((m, score))
        scored.sort(key=lambda x: x[1], reverse=True)
        return [m for m, _ in scored[:top_k]]

    def record_usage(self, method_id: str, success: bool) -> None:
        """Updates success rate statistics for a procedure."""
        if method_id in self._methods:
            m = self._methods[method_id]
            total_successes = m.success_rate * m.times_used + (1.0 if success else 0.0)
            m.times_used += 1
            m.success_rate = total_successes / m.times_used
