"""NVIDIA AI Inference Engine Module for OMNICODE AI 5.0."""

from core.nvidia.capabilities import (
    NvidiaModelSpec,
    NVIDIA_MODEL_CATALOG,
    ROUTING_PROFILES,
    RoutingMode,
    ModelCapability,
    ACTIVE_LIVE_FALLBACKS,
)
from core.nvidia.client import NvidiaClient, NvidiaCompletionResult
from core.nvidia.model_registry import NvidiaModelRegistry
from core.nvidia.embeddings import NvidiaEmbeddings
from core.nvidia.reranking import NvidiaReranker

__all__ = [
    "NvidiaModelSpec",
    "NVIDIA_MODEL_CATALOG",
    "ROUTING_PROFILES",
    "RoutingMode",
    "ModelCapability",
    "NvidiaClient",
    "NvidiaCompletionResult",
    "NvidiaModelRegistry",
    "NvidiaEmbeddings",
    "NvidiaReranker",
]
