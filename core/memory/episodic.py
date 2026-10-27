"""Episodic Memory for OMNICODE AI 5.0.

Records and recalls historical coding problems, root causes, attempted solutions,
test evidence, and verified lessons learned.
"""

import time
import re
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field


class CodingEpisode(BaseModel):
    episode_id: str
    repository: str
    task_objective: str
    framework_and_version: str = "generic"
    error_symptoms: str
    root_cause: str
    relevant_files: List[str] = Field(default_factory=list)
    attempted_solutions: List[str] = Field(default_factory=list)
    successful_solution: str
    failed_approaches: List[str] = Field(default_factory=list)
    test_evidence: str
    final_outcome: str = "success"  # success, partial, failed
    lesson_learned: str
    applicability_constraints: List[str] = Field(default_factory=list)
    confidence_score: float = 1.0
    timestamp: float = Field(default_factory=time.time)


class EpisodicMemory:
    """Manages verified coding and debugging episodes."""

    def __init__(self):
        self._episodes: Dict[str, CodingEpisode] = {}

    def record_episode(self, episode: CodingEpisode) -> CodingEpisode:
        """Stores a new verified coding episode."""
        self._episodes[episode.episode_id] = episode
        return episode

    def get_episode(self, episode_id: str) -> Optional[CodingEpisode]:
        """Retrieves episode by ID."""
        return self._episodes.get(episode_id)

    def search_episodes(
        self,
        query: str,
        repository: Optional[str] = None,
        top_k: int = 3,
    ) -> List[CodingEpisode]:
        """Recalls relevant historical episodes matching symptoms or objectives."""
        tokens = [t.lower() for t in re.findall(r"[a-zA-Z0-9_]+", query)]
        if not tokens:
            return []

        scored: List[tuple[CodingEpisode, float]] = []

        for ep in self._episodes.values():
            if repository and ep.repository != repository:
                continue

            score = 0.0
            obj_lower = ep.task_objective.lower()
            sym_lower = ep.error_symptoms.lower()
            rc_lower = ep.root_cause.lower()
            lesson_lower = ep.lesson_learned.lower()

            for tok in tokens:
                if tok in obj_lower:
                    score += 2.0
                if tok in sym_lower:
                    score += 3.0
                if tok in rc_lower:
                    score += 2.5
                if tok in lesson_lower:
                    score += 1.5

            # Weight by confidence score
            score *= ep.confidence_score

            if score > 0.0:
                scored.append((ep, score))

        scored.sort(key=lambda x: x[1], reverse=True)
        return [ep for ep, _ in scored[:top_k]]

    def list_all(self, repository: Optional[str] = None) -> List[CodingEpisode]:
        """Lists stored episodes."""
        if repository:
            return [e for e in self._episodes.values() if e.repository == repository]
        return list(self._episodes.values())

    def delete(self, episode_id: str) -> bool:
        """Deletes an episode."""
        if episode_id in self._episodes:
            del self._episodes[episode_id]
            return True
        return False
