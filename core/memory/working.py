"""Working Memory for OMNICODE AI 5.0.

Maintains active execution context, scratchpad notes, active step state,
and intermediate observations during task execution.
"""

from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field


class WorkingMemory(BaseModel):
    task_id: str = ""
    objective: str = ""
    current_step: int = 0
    scratchpad: List[str] = Field(default_factory=list)
    variables: Dict[str, Any] = Field(default_factory=dict)
    recent_observations: List[str] = Field(default_factory=list)

    def add_note(self, note: str) -> None:
        """Appends a scratchpad note."""
        self.scratchpad.append(note)

    def set_var(self, key: str, value: Any) -> None:
        """Stores a variable in working memory."""
        self.variables[key] = value

    def get_var(self, key: str, default: Any = None) -> Any:
        """Retrieves a variable from working memory."""
        return self.variables.get(key, default)

    def add_observation(self, observation: str) -> None:
        """Records an execution observation, retaining the last 20."""
        self.recent_observations.append(observation)
        if len(self.recent_observations) > 20:
            self.recent_observations.pop(0)

    def clear(self) -> None:
        """Resets working memory."""
        self.scratchpad.clear()
        self.variables.clear()
        self.recent_observations.clear()
        self.current_step = 0
