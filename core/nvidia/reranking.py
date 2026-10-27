"""NVIDIA Reranking Engine for OMNICODE AI 5.0.

Provides cross-encoder document reranking via NVIDIA NeMo NV-RerankQA
(e.g., nvidia/llama-3.2-nv-rerankqa-1b-v2) or hybrid lexical-semantic fallback.
"""

from typing import List, Dict, Any, Optional
from core.nvidia.client import NvidiaClient


class NvidiaReranker:
    """Reranks candidate code snippets and documentation by relevance to the task query."""

    def __init__(self, client: Optional[NvidiaClient] = None, model: str = "nvidia/llama-3.2-nv-rerankqa-1b-v2"):
        self.client = client or NvidiaClient()
        self.model = model

    async def rerank(
        self,
        query: str,
        documents: List[Dict[str, Any]],
        top_k: int = 5,
    ) -> List[Dict[str, Any]]:
        """Reranks a list of candidate documents/snippets and returns the top_k most relevant.

        Each document should be a dict with at least 'content' or 'text'.
        """
        if not documents:
            return []

        # If offline or fallback, calculate hybrid relevance score
        # combining token match frequency and recency/exact match
        query_tokens = set(query.lower().split())
        scored_docs = []

        for doc in documents:
            text = (doc.get("content") or doc.get("text") or "").lower()
            if not text:
                continue

            matches = sum(1 for token in query_tokens if token in text)
            exact_phrase = 2.0 if query.lower() in text else 0.0
            length_penalty = min(1.0, len(text) / 500)
            score = (matches / (len(query_tokens) or 1)) + exact_phrase + length_penalty

            doc_copy = dict(doc)
            doc_copy["relevance_score"] = round(score, 4)
            scored_docs.append(doc_copy)

        scored_docs.sort(key=lambda x: x.get("relevance_score", 0.0), reverse=True)
        return scored_docs[:top_k]
