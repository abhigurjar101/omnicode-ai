"""Semantic Memory for OMNICODE AI 5.0.

Stores verified repository architecture, conventions, APIs, schemas, and dependencies.
"""

import time
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field


class SemanticKnowledgeItem(BaseModel):
    item_id: str
    repository: str
    category: str  # architecture, convention, api, schema, dependency
    title: str
    content: str
    tags: List[str] = Field(default_factory=list)
    verified: bool = True
    confidence: float = 1.0
    created_at: float = Field(default_factory=time.time)
    updated_at: float = Field(default_factory=time.time)


class SemanticMemory:
    """Maintains verified domain and codebase knowledge."""

    def __init__(self):
        self._items: Dict[str, SemanticKnowledgeItem] = {}

    def store(
        self,
        item_id: str,
        repository: str,
        category: str,
        title: str,
        content: str,
        tags: Optional[List[str]] = None,
        verified: bool = True,
        confidence: float = 1.0,
    ) -> SemanticKnowledgeItem:
        """Stores or updates a semantic knowledge item."""
        now = time.time()
        existing = self._items.get(item_id)
        created_at = existing.created_at if existing else now

        item = SemanticKnowledgeItem(
            item_id=item_id,
            repository=repository,
            category=category,
            title=title,
            content=content,
            tags=tags or [],
            verified=verified,
            confidence=confidence,
            created_at=created_at,
            updated_at=now,
        )
        self._items[item_id] = item
        return item

    def get(self, item_id: str) -> Optional[SemanticKnowledgeItem]:
        """Gets knowledge item by ID."""
        return self._items.get(item_id)

    def search(
        self,
        query: str,
        repository: Optional[str] = None,
        category: Optional[str] = None,
        top_k: int = 5,
    ) -> List[SemanticKnowledgeItem]:
        """Searches semantic knowledge by keywords, repository, and category."""
        q_lower = query.lower()
        scored: List[tuple[SemanticKnowledgeItem, float]] = []

        for item in self._items.values():
            if repository and item.repository != repository:
                continue
            if category and item.category != category:
                continue

            score = 0.0
            if q_lower in item.title.lower():
                score += 3.0
            if q_lower in item.content.lower():
                score += 1.5
            for tag in item.tags:
                if q_lower in tag.lower():
                    score += 2.0

            if score > 0.0:
                scored.append((item, score))

        scored.sort(key=lambda x: x[1], reverse=True)
        return [item for item, _ in scored[:top_k]]

    def list_all(self, repository: Optional[str] = None) -> List[SemanticKnowledgeItem]:
        """Lists all items, optionally filtered by repository."""
        if not repository:
            return list(self._items.values())
        return [i for i in self._items.values() if i.repository == repository]

    def delete(self, item_id: str) -> bool:
        """Deletes a knowledge item."""
        if item_id in self._items:
            del self._items[item_id]
            return True
        return False
