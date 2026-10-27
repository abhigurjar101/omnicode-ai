"""Model and Capability Router for OMNICODE AI 5.0.

Evaluates task complexity and selects the best NVIDIA model.
"""

from typing import Dict, Any, Optional
from core.nvidia.capabilities import RoutingMode, ModelCapability
from core.nvidia.model_registry import NvidiaModelRegistry


class AgentRouter:
    """Routes execution requests to optimal NVIDIA models."""

    def __init__(self, registry: Optional[NvidiaModelRegistry] = None):
        self.registry = registry or NvidiaModelRegistry()

    def determine_routing(
        self,
        task_objective: str,
        task_complexity: Optional[str] = None,
        requested_mode: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Calculates optimal routing mode and selects model ID."""
        if requested_mode:
            try:
                mode = RoutingMode(requested_mode)
            except ValueError:
                mode = RoutingMode.BALANCED
        else:
            q_lower = task_objective.lower()
            if any(k in q_lower for k in ["architect", "deep reasoning", "prove", "formal", "redesign system"]):
                mode = RoutingMode.DEEP
            elif any(k in q_lower for k in ["quick", "explain", "outline", "list", "check"]):
                mode = RoutingMode.FAST
            elif any(k in q_lower for k in ["budget", "cheap", "minimal cost"]):
                mode = RoutingMode.BUDGET
            else:
                mode = RoutingMode.BALANCED

        selected_model = self.registry.select_model(
            mode=mode,
            required_capability=ModelCapability.CODE_GEN,
        )

        return {
            "routing_mode": mode.value,
            "selected_model": selected_model,
            "provider": "nvidia",
        }
