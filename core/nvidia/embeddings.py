"""NVIDIA Embedding Engine for OMNICODE AI 5.0.

Provides vector embedding generation via NVIDIA NeMo NV-EmbedQA models
(e.g., nvidia/llama-3.2-nv-embedqa-1b-v2) or deterministic hashing fallback.
"""

import math
import hashlib
from typing import List, Optional
from core.nvidia.client import NvidiaClient


class NvidiaEmbeddings:
    """Generates normalized vector embeddings for code retrieval and semantic memory."""

    def __init__(self, client: Optional[NvidiaClient] = None, model: str = "nvidia/llama-3.2-nv-embedqa-1b-v2"):
        self.client = client or NvidiaClient()
        self.model = model

    async def embed_documents(self, texts: List[str]) -> List[List[float]]:
        """Embeds a batch of code snippets or documentation texts."""
        if not texts:
            return []
        return await self.client.get_embeddings(texts)

    async def embed_query(self, text: str) -> List[float]:
        """Embeds a single query string."""
        results = await self.embed_documents([text])
        return results[0] if results else [0.0] * 128

    @staticmethod
    def cosine_similarity(vec_a: List[float], vec_b: List[float]) -> float:
        """Computes cosine similarity between two normalized vectors."""
        if not vec_a or not vec_b or len(vec_a) != len(vec_b):
            return 0.0
        dot = sum(a * b for a, b in zip(vec_a, vec_b))
        norm_a = math.sqrt(sum(a * a for a in vec_a))
        norm_b = math.sqrt(sum(b * b for b in vec_b))
        if norm_a == 0.0 or norm_b == 0.0:
            return 0.0
        return dot / (norm_a * norm_b)
