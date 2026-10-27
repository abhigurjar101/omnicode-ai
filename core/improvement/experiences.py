"""Task Experience Collector for OMNICODE AI 5.0.

Collects structured telemetry, execution results, tool invocations,
and failure patterns to drive evidence-based continuous improvement.
"""

import time
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field


class TaskExperience(BaseModel):
    experience_id: str
    task_id: str
    objective: str
    routing_mode: str
    selected_model: str
    status: str  # success, failure, partial
    tokens_in: int = 0
    tokens_out: int = 0
    duration_ms: float = 0.0
    tool_sequence: List[str] = Field(default_factory=list)
    tests_passed: bool = True
    simplifications_count: int = 0
    timestamp: float = Field(default_factory=time.time)
    failure_reason: Optional[str] = None


class ExperienceCollector:
    """Records and aggregates task performance metrics."""

    def __init__(self):
        self._experiences: List[TaskExperience] = []

    def record(self, experience: TaskExperience) -> None:
        """Stores a task execution experience."""
        self._experiences.append(experience)

    def list_experiences(self, limit: int = 50) -> List[TaskExperience]:
        """Returns the most recent experiences."""
        return self._experiences[-limit:]

    def get_summary_metrics(self) -> Dict[str, Any]:
        """Aggregates pass rates, average duration, and token consumption."""
        if not self._experiences:
            return {"total_tasks": 0, "success_rate": 1.0, "avg_duration_ms": 0.0}

        total = len(self._experiences)
        successes = sum(1 for e in self._experiences if e.status == "success")
        total_duration = sum(e.duration_ms for e in self._experiences)
        total_tokens = sum(e.tokens_in + e.tokens_out for e in self._experiences)

        return {
            "total_tasks": total,
            "successes": successes,
            "success_rate": round(successes / total, 3),
            "avg_duration_ms": round(total_duration / total, 2),
            "avg_tokens_per_task": round(total_tokens / total, 1),
        }
