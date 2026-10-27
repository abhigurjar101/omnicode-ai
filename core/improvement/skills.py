"""Skill Evolution Engine for OMNICODE AI 5.0.

Synthesizes repeated, proven coding and debugging patterns into versioned,
reusable skills that accelerate future agent task execution.
"""

import time
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field


class VersionedSkill(BaseModel):
    skill_id: str
    name: str
    version: str = "1.0.0"
    trigger_conditions: List[str] = Field(default_factory=list)
    system_instructions: str
    recommended_tools: List[str] = Field(default_factory=list)
    preferred_model_tier: str = "balanced"
    verified_uses: int = 0
    created_at: float = Field(default_factory=time.time)


class SkillStore:
    """Manages versioned agent skills derived from verified past experience."""

    def __init__(self):
        self._skills: Dict[str, VersionedSkill] = {}
        self._seed_default_skills()

    def _seed_default_skills(self) -> None:
        self.register(
            VersionedSkill(
                skill_id="bug_fix_expert",
                name="Minimal Bugfix and Regression Guard",
                trigger_conditions=["fix", "bug", "error", "failing", "exception"],
                system_instructions=(
                    "1. Reproduce error with the smallest possible test.\n"
                    "2. Identify exact root cause in AST.\n"
                    "3. Apply minimum sufficient patch.\n"
                    "4. Run full test suite to guarantee zero regressions."
                ),
                recommended_tools=["search_symbols", "read_file", "edit_file", "run_tests"],
                preferred_model_tier="balanced",
            )
        )
        self.register(
            VersionedSkill(
                skill_id="kiss_refactoring",
                name="KISS Architecture Simplification",
                trigger_conditions=["simplify", "refactor", "cleanup", "remove complexity"],
                system_instructions=(
                    "1. Audit for single-use abstractions and intermediate wrappers.\n"
                    "2. Eliminate duplicate logic and unused imports.\n"
                    "3. Flatten conditionals into early guard clauses.\n"
                    "4. Verify that all behavioral tests continue to pass."
                ),
                recommended_tools=["read_file", "edit_file", "run_tests", "review_code"],
                preferred_model_tier="balanced",
            )
        )

    def register(self, skill: VersionedSkill) -> None:
        self._skills[skill.skill_id] = skill

    def find_skills_for_task(self, task_description: str) -> List[VersionedSkill]:
        """Finds applicable skills matching task description keywords."""
        desc_lower = task_description.lower()
        matched = []
        for s in self._skills.values():
            if any(cond in desc_lower for cond in s.trigger_conditions):
                matched.append(s)
        return matched

    def list_skills(self) -> List[VersionedSkill]:
        return list(self._skills.values())
