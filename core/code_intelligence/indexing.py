"""Hybrid Inverted and Vector Indexing for OMNICODE AI 5.0.

Provides BM25 Okapi lexical search combined with vector embeddings
for fast, accurate code snippet indexing and retrieval.
"""

import math
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field

try:
    from rank_bm25 import BM25Okapi
except ImportError:
    BM25Okapi = None

from core.nvidia.embeddings import NvidiaEmbeddings


class IndexedChunk(BaseModel):
    chunk_id: str
    file_path: str
    start_line: int
    end_line: int
    content: str
    symbol_name: Optional[str] = None
    embedding: Optional[List[float]] = None


class CodeIndex:
    """Maintains hybrid lexical (BM25) and vector indexes for repository code."""

    def __init__(self, embeddings: Optional[NvidiaEmbeddings] = None):
        self.embeddings = embeddings or NvidiaEmbeddings()
        self.chunks: List[IndexedChunk] = []
        self._bm25: Optional[Any] = None
        self._tokenized_corpus: List[List[str]] = []

    def clear(self) -> None:
        """Resets the index."""
        self.chunks = []
        self._bm25 = None
        self._tokenized_corpus = []

    async def add_chunks(self, chunks: List[IndexedChunk], generate_embeddings: bool = True) -> None:
        """Adds code chunks to the index and builds lexical & vector representations."""
        if not chunks:
            return

        start_idx = len(self.chunks)
        self.chunks.extend(chunks)

        if generate_embeddings:
            texts = [c.content for c in chunks]
            vectors = await self.embeddings.embed_documents(texts)
            for i, vec in enumerate(vectors):
                self.chunks[start_idx + i].embedding = vec

        # Rebuild BM25 tokenized corpus
        import re
        self._tokenized_corpus = [
            re.findall(r"[a-zA-Z0-9_]+", c.content.lower())
            for c in self.chunks
        ]
        if BM25Okapi and self._tokenized_corpus:
            self._bm25 = BM25Okapi(self._tokenized_corpus)

    def search_lexical(self, query: str, top_k: int = 10) -> List[Dict[str, Any]]:
        """Performs BM25 lexical search over indexed chunks."""
        if not self.chunks:
            return []

        import re
        tokens = re.findall(r"[a-zA-Z0-9_]+", query.lower())
        if not tokens:
            return []

        if self._bm25:
            scores = self._bm25.get_scores(tokens)
            indexed_scores = [(idx, float(score)) for idx, score in enumerate(scores)]
        else:
            # Fallback simple token overlap
            indexed_scores = []
            for idx, c in enumerate(self.chunks):
                text_lower = c.content.lower()
                matches = sum(1 for t in tokens if t in text_lower)
                indexed_scores.append((idx, float(matches)))

        indexed_scores.sort(key=lambda x: x[1], reverse=True)
        results = []
        for idx, score in indexed_scores[:top_k]:
            if score > 0.0:
                chunk = self.chunks[idx]
                results.append({
                    "chunk": chunk,
                    "score": round(score, 4),
                    "match_type": "lexical",
                })
        return results

    async def search_semantic(self, query: str, top_k: int = 10) -> List[Dict[str, Any]]:
        """Performs vector similarity search using NVIDIA embeddings."""
        if not self.chunks:
            return []

        query_vec = await self.embeddings.embed_query(query)
        scored = []

        for chunk in self.chunks:
            if chunk.embedding:
                sim = self.embeddings.cosine_similarity(query_vec, chunk.embedding)
                scored.append((chunk, sim))

        scored.sort(key=lambda x: x[1], reverse=True)
        return [
            {"chunk": chunk, "score": round(sim, 4), "match_type": "semantic"}
            for chunk, sim in scored[:top_k]
            if sim > 0.1
        ]
