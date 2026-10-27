"""NVIDIA Model Capabilities and Routing Profiles for OMNICODE AI 5.0.

Defines the NVIDIA model registry, capabilities matrix, routing profiles
(FAST, BALANCED, DEEP, BUDGET, PRIVATE_NIM), context limits, and tool-calling support.
"""

from enum import Enum
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field


class RoutingMode(str, Enum):
    FAST = "FAST"
    BALANCED = "BALANCED"
    DEEP = "DEEP"
    BUDGET = "BUDGET"
    PRIVATE_NIM = "PRIVATE_NIM"


class ModelCapability(str, Enum):
    REASONING = "reasoning"
    CODE_GEN = "code_gen"
    TOOL_CALLING = "tool_calling"
    STRUCTURED_OUTPUT = "structured_output"
    EMBEDDINGS = "embeddings"
    RERANKING = "reranking"


class NvidiaModelSpec(BaseModel):
    model_id: str
    display_name: str
    provider: str = "nvidia"
    context_window: int = 128000
    supports_tool_calling: bool = True
    supports_structured_output: bool = True
    capabilities: List[ModelCapability] = Field(default_factory=list)
    tier: str = "balanced"  # fast, balanced, deep, budget
    cost_per_million_input: float = 0.0
    cost_per_million_output: float = 0.0
    is_embedding: bool = False
    is_reranker: bool = False


# Supported NVIDIA hosted & NIM models catalog
NVIDIA_MODEL_CATALOG: Dict[str, NvidiaModelSpec] = {
    # Fast / Autocomplete / Quick inspection
    "meta/llama-3.1-8b-instruct": NvidiaModelSpec(
        model_id="meta/llama-3.1-8b-instruct",
        display_name="Meta LLaMA 3.1 8B Instruct (NVIDIA Hosted)",
        context_window=131072,
        supports_tool_calling=True,
        supports_structured_output=True,
        capabilities=[ModelCapability.CODE_GEN, ModelCapability.TOOL_CALLING],
        tier="fast",
        cost_per_million_input=0.10,
        cost_per_million_output=0.10,
    ),
    # Balanced Default: Industry standard for code generation and tool calling
    "meta/llama-3.3-70b-instruct": NvidiaModelSpec(
        model_id="meta/llama-3.3-70b-instruct",
        display_name="Meta LLaMA 3.3 70B Instruct (NVIDIA Hosted)",
        context_window=131072,
        supports_tool_calling=True,
        supports_structured_output=True,
        capabilities=[ModelCapability.REASONING, ModelCapability.CODE_GEN, ModelCapability.TOOL_CALLING, ModelCapability.STRUCTURED_OUTPUT],
        tier="balanced",
        cost_per_million_input=0.70,
        cost_per_million_output=0.80,
    ),
    # Deep Codebase Reasoning & Architecture
    "deepseek-ai/deepseek-r1": NvidiaModelSpec(
        model_id="deepseek-ai/deepseek-r1",
        display_name="DeepSeek R1 (NVIDIA Hosted Reasoning)",
        context_window=131072,
        supports_tool_calling=True,
        supports_structured_output=True,
        capabilities=[ModelCapability.REASONING, ModelCapability.CODE_GEN],
        tier="deep",
        cost_per_million_input=1.00,
        cost_per_million_output=2.00,
    ),
    # High-Parameter Code & Enterprise Generation
    "nvidia/nemotron-4-340b-instruct": NvidiaModelSpec(
        model_id="nvidia/nemotron-4-340b-instruct",
        display_name="NVIDIA Nemotron-4 340B Instruct",
        context_window=131072,
        supports_tool_calling=True,
        supports_structured_output=True,
        capabilities=[ModelCapability.REASONING, ModelCapability.CODE_GEN, ModelCapability.TOOL_CALLING],
        tier="deep",
        cost_per_million_input=1.50,
        cost_per_million_output=3.00,
    ),
    # Multi-lingual & Refactoring
    "mistralai/mixtral-8x22b-instruct-v0.1": NvidiaModelSpec(
        model_id="mistralai/mixtral-8x22b-instruct-v0.1",
        display_name="Mistral Mixtral 8x22B Instruct (NVIDIA Hosted)",
        context_window=65536,
        supports_tool_calling=True,
        supports_structured_output=True,
        capabilities=[ModelCapability.CODE_GEN, ModelCapability.TOOL_CALLING],
        tier="balanced",
        cost_per_million_input=0.90,
        cost_per_million_output=0.90,
    ),
    # Embeddings for Agentic RAG
    "nvidia/llama-3.2-nv-embedqa-1b-v2": NvidiaModelSpec(
        model_id="nvidia/llama-3.2-nv-embedqa-1b-v2",
        display_name="NVIDIA NeMo NV-EmbedQA 1B v2",
        context_window=8192,
        supports_tool_calling=False,
        supports_structured_output=False,
        capabilities=[ModelCapability.EMBEDDINGS],
        tier="budget",
        is_embedding=True,
    ),
    # Active High-Performance NVIDIA Hosted Embeddings
    "nvidia/nemotron-3-embed-1b": NvidiaModelSpec(
        model_id="nvidia/nemotron-3-embed-1b",
        display_name="NVIDIA Nemotron-3 Embed 1B",
        context_window=8192,
        supports_tool_calling=False,
        supports_structured_output=False,
        capabilities=[ModelCapability.EMBEDDINGS],
        tier="fast",
        is_embedding=True,
    ),
    # Active High-Throughput Autocomplete & Fast Coding
    "nvidia/nemotron-3.5-bolt-e4b": NvidiaModelSpec(
        model_id="nvidia/nemotron-3.5-bolt-e4b",
        display_name="NVIDIA Nemotron-3.5 Bolt e4b (Ultra Fast Autocomplete & Prediction)",
        context_window=131072,
        supports_tool_calling=True,
        supports_structured_output=True,
        capabilities=[ModelCapability.CODE_GEN, ModelCapability.TOOL_CALLING],
        tier="fast",
        cost_per_million_input=0.10,
        cost_per_million_output=0.10,
    ),
    # Active Balanced Reasoning & Autonomous Software Engineering
    "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning": NvidiaModelSpec(
        model_id="nvidia/nemotron-3-nano-omni-30b-a3b-reasoning",
        display_name="NVIDIA Nemotron-3 Nano Omni 30B Reasoning (Live Balanced)",
        context_window=131072,
        supports_tool_calling=True,
        supports_structured_output=True,
        capabilities=[ModelCapability.REASONING, ModelCapability.CODE_GEN, ModelCapability.TOOL_CALLING, ModelCapability.STRUCTURED_OUTPUT],
        tier="balanced",
        cost_per_million_input=0.60,
        cost_per_million_output=0.70,
    ),
    # Active 550B Flagship Architecture & Deep Reasoning
    "nvidia/nemotron-3-ultra-550b-a55b": NvidiaModelSpec(
        model_id="nvidia/nemotron-3-ultra-550b-a55b",
        display_name="NVIDIA Nemotron-3 Ultra 550B (Deep Reasoning)",
        context_window=131072,
        supports_tool_calling=True,
        supports_structured_output=True,
        capabilities=[ModelCapability.REASONING, ModelCapability.CODE_GEN, ModelCapability.TOOL_CALLING],
        tier="deep",
        cost_per_million_input=1.50,
        cost_per_million_output=3.00,
    ),
    # Cross-encoder Reranker
    "nvidia/llama-3.2-nv-rerankqa-1b-v2": NvidiaModelSpec(
        model_id="nvidia/llama-3.2-nv-rerankqa-1b-v2",
        display_name="NVIDIA NeMo NV-RerankQA 1B v2",
        context_window=8192,
        supports_tool_calling=False,
        supports_structured_output=False,
        capabilities=[ModelCapability.RERANKING],
        tier="fast",
        is_reranker=True,
    ),
}

# Mode-to-Model mappings
ROUTING_PROFILES: Dict[RoutingMode, str] = {
    RoutingMode.FAST: "meta/llama-3.1-8b-instruct",
    RoutingMode.BALANCED: "meta/llama-3.3-70b-instruct",
    RoutingMode.DEEP: "deepseek-ai/deepseek-r1",
    RoutingMode.BUDGET: "meta/llama-3.1-8b-instruct",
    RoutingMode.PRIVATE_NIM: "meta/llama-3.3-70b-instruct",
}

# Active working fallback map for NVIDIA Hosted Build API endpoints (handles EOL/decommissioned upstream IDs)
ACTIVE_LIVE_FALLBACKS: Dict[str, str] = {
    "meta/llama-3.3-70b-instruct": "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning",
    "meta/llama-3.1-8b-instruct": "nvidia/nemotron-3.5-bolt-e4b",
    "deepseek-ai/deepseek-r1": "nvidia/nemotron-3-ultra-550b-a55b",
    "nvidia/nemotron-4-340b-instruct": "nvidia/nemotron-3-ultra-550b-a55b",
    "mistralai/mixtral-8x22b-instruct-v0.1": "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning",
    "nvidia/llama-3.2-nv-embedqa-1b-v2": "nvidia/nemotron-3-embed-1b",
}
