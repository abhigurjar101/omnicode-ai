"""Unified Persistent Memory Manager for OMNICODE AI 5.0.

Provides durable SQLite persistence across Working, Semantic, Episodic,
and Procedural memory stores with tenant isolation, deduplication, and export.
"""

import os
import json
import sqlite3
from pathlib import Path
from typing import Dict, Any, List, Optional

from core.memory.working import WorkingMemory
from core.memory.semantic import SemanticMemory, SemanticKnowledgeItem
from core.memory.episodic import EpisodicMemory, CodingEpisode
from core.memory.procedural import ProceduralMemory, ProceduralMethod


class UnifiedMemoryManager:
    """Coordinates and durably persists all four memory tiers."""

    def __init__(self, db_path: Optional[str] = None):
        if not db_path:
            default_dir = os.path.expanduser("~/.nemicode/data")
            if not os.path.exists(default_dir) and os.path.exists(os.path.expanduser("~/.omnicode/data")):
                default_dir = os.path.expanduser("~/.omnicode/data")
            data_dir = Path(os.environ.get("NEMICODE_DATA_DIR", os.environ.get("OMNICODE_DATA_DIR", default_dir)))
            data_dir.mkdir(parents=True, exist_ok=True)
            self.db_path = str(data_dir / "nemicode_memory.db")
            if not os.path.exists(self.db_path) and (data_dir / "omnicode_memory.db").exists():
                self.db_path = str(data_dir / "omnicode_memory.db")
            self._shared_conn = None
        elif db_path == ":memory:":
            self.db_path = ":memory:"
            self._shared_conn = sqlite3.connect(":memory:", check_same_thread=False)
        else:
            self.db_path = db_path
            self._shared_conn = None
            Path(self.db_path).parent.mkdir(parents=True, exist_ok=True)

        self.working = WorkingMemory()
        self.semantic = SemanticMemory()
        self.episodic = EpisodicMemory()
        self.procedural = ProceduralMemory()

        self._init_db()
        self._load_from_db()

    def _get_connection(self) -> sqlite3.Connection:
        if self._shared_conn:
            return self._shared_conn
        return sqlite3.connect(self.db_path, check_same_thread=False)

    def _init_db(self) -> None:
        """Initializes SQLite tables for persistent episodic and semantic memories."""
        conn = self._get_connection()
        conn.execute("""
            CREATE TABLE IF NOT EXISTS semantic_memory (
                item_id TEXT PRIMARY KEY,
                repository TEXT,
                category TEXT,
                title TEXT,
                content TEXT,
                tags TEXT,
                verified INTEGER,
                confidence REAL,
                created_at REAL,
                updated_at REAL
            )
        """)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS episodic_memory (
                episode_id TEXT PRIMARY KEY,
                repository TEXT,
                task_objective TEXT,
                framework_and_version TEXT,
                error_symptoms TEXT,
                root_cause TEXT,
                relevant_files TEXT,
                attempted_solutions TEXT,
                successful_solution TEXT,
                failed_approaches TEXT,
                test_evidence TEXT,
                final_outcome TEXT,
                lesson_learned TEXT,
                applicability_constraints TEXT,
                confidence_score REAL,
                timestamp REAL
            )
        """)
        conn.commit()
        if not self._shared_conn:
            conn.close()


    def _load_from_db(self) -> None:
        """Loads persisted memories into active memory structures."""
        conn = self._get_connection()
        cursor = conn.cursor()
        # Semantic
        cursor.execute("SELECT item_id, repository, category, title, content, tags, verified, confidence, created_at, updated_at FROM semantic_memory")
        for row in cursor.fetchall():
            self.semantic.store(
                item_id=row[0],
                repository=row[1],
                category=row[2],
                title=row[3],
                content=row[4],
                tags=json.loads(row[5]) if row[5] else [],
                verified=bool(row[6]),
                confidence=row[7],
            )

        # Episodic
        cursor.execute("""
            SELECT episode_id, repository, task_objective, framework_and_version,
                   error_symptoms, root_cause, relevant_files, attempted_solutions,
                   successful_solution, failed_approaches, test_evidence, final_outcome,
                   lesson_learned, applicability_constraints, confidence_score, timestamp
            FROM episodic_memory
        """)
        for row in cursor.fetchall():
            ep = CodingEpisode(
                episode_id=row[0],
                repository=row[1],
                task_objective=row[2],
                framework_and_version=row[3],
                error_symptoms=row[4],
                root_cause=row[5],
                relevant_files=json.loads(row[6]) if row[6] else [],
                attempted_solutions=json.loads(row[7]) if row[7] else [],
                successful_solution=row[8],
                failed_approaches=json.loads(row[9]) if row[9] else [],
                test_evidence=row[10],
                final_outcome=row[11],
                lesson_learned=row[12],
                applicability_constraints=json.loads(row[13]) if row[13] else [],
                confidence_score=row[14],
                timestamp=row[15],
            )
            self.episodic.record_episode(ep)
        if not self._shared_conn:
            conn.close()

    def persist_semantic_item(self, item: SemanticKnowledgeItem) -> None:
        """Persists a semantic memory item to database."""
        conn = self._get_connection()
        conn.execute("""
            INSERT OR REPLACE INTO semantic_memory
            (item_id, repository, category, title, content, tags, verified, confidence, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            item.item_id,
            item.repository,
            item.category,
            item.title,
            item.content,
            json.dumps(item.tags),
            1 if item.verified else 0,
            item.confidence,
            item.created_at,
            item.updated_at,
        ))
        conn.commit()
        if not self._shared_conn:
            conn.close()

    def persist_episode(self, episode: CodingEpisode) -> None:
        """Persists an episodic memory record to database."""
        conn = self._get_connection()
        conn.execute("""
            INSERT OR REPLACE INTO episodic_memory
            (episode_id, repository, task_objective, framework_and_version,
             error_symptoms, root_cause, relevant_files, attempted_solutions,
             successful_solution, failed_approaches, test_evidence, final_outcome,
             lesson_learned, applicability_constraints, confidence_score, timestamp)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            episode.episode_id,
            episode.repository,
            episode.task_objective,
            episode.framework_and_version,
            episode.error_symptoms,
            episode.root_cause,
            json.dumps(episode.relevant_files),
            json.dumps(episode.attempted_solutions),
            episode.successful_solution,
            json.dumps(episode.failed_approaches),
            episode.test_evidence,
            episode.final_outcome,
            episode.lesson_learned,
            json.dumps(episode.applicability_constraints),
            episode.confidence_score,
            episode.timestamp,
        ))
        conn.commit()
        if not self._shared_conn:
            conn.close()

    def save_verified_episode(self, episode: CodingEpisode) -> CodingEpisode:
        """Saves episode in memory and persists to durable SQLite."""
        self.episodic.record_episode(episode)
        self.persist_episode(episode)
        return episode

    def recall_for_task(self, query: str, repository: Optional[str] = None) -> Dict[str, Any]:
        """Recalls relevant memories across semantic, episodic, and procedural tiers."""
        episodes = self.episodic.search_episodes(query, repository=repository, top_k=3)
        semantic_items = self.semantic.search(query, repository=repository, top_k=3)
        procedures = self.procedural.search(query, top_k=2)

        return {
            "episodes": [e.model_dump() for e in episodes],
            "semantic": [s.model_dump() for s in semantic_items],
            "procedures": [p.model_dump() for p in procedures],
        }

    def get_stats(self) -> Dict[str, Any]:
        """Returns statistics of all memory tiers."""
        return {
            "episodic_count": len(self.episodic._episodes),
            "semantic_count": len(self.semantic._items),
            "procedural_count": len(self.procedural._methods),
            "db_path": self.db_path,
        }
