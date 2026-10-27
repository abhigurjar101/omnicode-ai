"""NVIDIA Model Registry and Capability Router for OMNICODE AI 5.0.

Discovers, verifies, and routes requests across NVIDIA hosted models
and local NVIDIA NIM instances based on task requirements, context length,
tool calling support, latency, and budget.
"""

import time
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field

from core.nvidia.capabilities import (
    NvidiaModelSpec,
    NVIDIA_MODEL_CATALOG,
    ROUTING_PROFILES,
    RoutingMode,
    ModelCapability,
)


class ModelUsageStats(BaseModel):
    calls: int = 0
    total_tokens_in: int = 0
    total_tokens_out: int = 0
    total_latency_ms: float = 0.0
    total_cost_usd: float = 0.0

    @property
    def avg_latency_ms(self) -> float:
        return (self.total_latency_ms / self.calls) if self.calls > 0 else 0.0


class NvidiaModelRegistry:
    """Capability-aware model discovery, caching, and routing manager."""

    def __init__(self, custom_catalog: Optional[Dict[str, NvidiaModelSpec]] = None):
        self._catalog: Dict[str, NvidiaModelSpec] = dict(custom_catalog or NVIDIA_MODEL_CATALOG)
        self._usage_stats: Dict[str, ModelUsageStats] = {
            m: ModelUsageStats() for m in self._catalog
        }
        self._verified_online: Dict[str, bool] = {}

    def get_model(self, model_id: str) -> Optional[NvidiaModelSpec]:
        """Returns specification for a given model ID."""
        return self._catalog.get(model_id)

    def list_models(self, capability: Optional[ModelCapability] = None) -> List[NvidiaModelSpec]:
        """Lists models, optionally filtered by required capability."""
        if capability is None:
            return list(self._catalog.values())
        return [m for m in self._catalog.values() if capability in m.capabilities]

    def register_model(self, spec: NvidiaModelSpec) -> None:
        """Dynamically registers or updates a model specification (e.g. self-hosted NIM)."""
        self._catalog[spec.model_id] = spec
        if spec.model_id not in self._usage_stats:
            self._usage_stats[spec.model_id] = ModelUsageStats()

    def select_model(
        self,
        mode: RoutingMode = RoutingMode.BALANCED,
        required_capability: Optional[ModelCapability] = None,
        min_context_window: int = 0,
        budget_constrained: bool = False,
    ) -> str:
        """Selects the optimal model matching the designated constraints."""
        if budget_constrained:
            mode = RoutingMode.BUDGET

        preferred_id = ROUTING_PROFILES.get(mode, "meta/llama-3.3-70b-instruct")
        preferred_spec = self._catalog.get(preferred_id)

        # Validate suitability
        if preferred_spec:
            has_cap = required_capability is None or required_capability in preferred_spec.capabilities
            fits_ctx = preferred_spec.context_window >= min_context_window
            if has_cap and fits_ctx:
                return preferred_id

        # Fallback: search catalog for best candidate
        candidates = list(self._catalog.values())
        if required_capability:
            candidates = [c for c in candidates if required_capability in c.capabilities]
        if min_context_window > 0:
            candidates = [c for c in candidates if c.context_window >= min_context_window]

        if not candidates:
            return preferred_id

        # Sort by tier / cost
        tier_weights = {"fast": 1, "budget": 2, "balanced": 3, "deep": 4}
        if mode in (RoutingMode.FAST, RoutingMode.BUDGET):
            candidates.sort(key=lambda x: (tier_weights.get(x.tier, 99), x.cost_per_million_input))
        else:
            candidates.sort(key=lambda x: -tier_weights.get(x.tier, 0))

        return candidates[0].model_id

    def record_usage(
        self,
        model_id: str,
        tokens_in: int,
        tokens_out: int,
        latency_ms: float,
    ) -> None:
        """Records token usage and latency for observability and cost accounting."""
        stats = self._usage_stats.setdefault(model_id, ModelUsageStats())
        stats.calls += 1
        stats.total_tokens_in += tokens_in
        stats.total_tokens_out += tokens_out
        stats.total_latency_ms += latency_ms

        spec = self._catalog.get(model_id)
        if spec:
            cost = (
                (tokens_in / 1_000_000) * spec.cost_per_million_input
                + (tokens_out / 1_000_000) * spec.cost_per_million_output
            )
            stats.total_cost_usd += cost

    def get_usage_summary(self) -> Dict[str, Any]:
        """Provides an aggregated summary of inference costs and latencies."""
        total_calls = sum(s.calls for s in self._usage_stats.values())
        total_in = sum(s.total_tokens_in for s in self._usage_stats.values())
        total_out = sum(s.total_tokens_out for s in self._usage_stats.values())
        total_cost = sum(s.total_cost_usd for s in self._usage_stats.values())
        return {
            "total_calls": total_calls,
            "total_tokens_in": total_in,
            "total_tokens_out": total_out,
            "total_tokens": total_in + total_out,
            "total_cost_usd": round(total_cost, 6),
            "by_model": {
                k: {
                    "calls": v.calls,
                    "tokens_in": v.total_tokens_in,
                    "tokens_out": v.total_tokens_out,
                    "avg_latency_ms": round(v.avg_latency_ms, 2),
                    "cost_usd": round(v.total_cost_usd, 6),
                }
                for k, v in self._usage_stats.items()
                if v.calls > 0
            },
        }
