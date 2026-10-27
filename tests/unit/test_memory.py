"""Unit tests for Unified Memory Manager (Working, Semantic, Episodic, Procedural)."""

import os
import tempfile
import pytest
from core.memory import (
    WorkingMemory,
    SemanticMemory,
    EpisodicMemory,
    CodingEpisode,
    ProceduralMemory,
    UnifiedMemoryManager,
)


def test_working_memory():
    wm = WorkingMemory()
    wm.add_note("Examining authentication module")
    wm.set_var("failing_test", "test_auth_login")
    wm.add_observation("Received HTTP 401 Unauthorized")

    assert len(wm.scratchpad) == 1
    assert wm.get_var("failing_test") == "test_auth_login"
    assert len(wm.recent_observations) == 1

    wm.clear()
    assert len(wm.scratchpad) == 0
    assert len(wm.variables) == 0


def test_semantic_memory():
    sm = SemanticMemory()
    sm.store(
        item_id="jwt_auth",
        repository="repo_a",
        category="api",
        title="JWT Auth Standard",
        content="All endpoints require Bearer token signed with HS256",
        tags=["auth", "security"],
    )

    results = sm.search("Bearer token", repository="repo_a")
    assert len(results) == 1
    assert results[0].item_id == "jwt_auth"


def test_episodic_memory():
    em = EpisodicMemory()
    episode = CodingEpisode(
        episode_id="ep_001",
        repository="repo_a",
        task_objective="Fix off-by-one error in pagination",
        framework_and_version="fastapi>=0.112.0",
        error_symptoms="Page 2 skips the 10th item and duplicates 11th",
        root_cause="Offset was calculated as (page * limit) instead of ((page - 1) * limit)",
        relevant_files=["api/pagination.py"],
        attempted_solutions=["Adjusted page index in caller"],
        successful_solution="Fixed offset calculation in calculate_offset() helper",
        failed_approaches=["Mutating query param string in middleware"],
        test_evidence="pytest tests/test_pagination.py - 5 passed",
        final_outcome="success",
        lesson_learned="Always normalize 1-indexed human pages to 0-indexed database offsets in the central query builder",
        applicability_constraints=["pagination", "sql"],
    )
    em.record_episode(episode)

    recalled = em.search_episodes("pagination skips item off-by-one")
    assert len(recalled) == 1
    assert recalled[0].episode_id == "ep_001"
    assert "offset calculation" in recalled[0].successful_solution


def test_unified_memory_manager_persistence():
    with tempfile.TemporaryDirectory() as tmpdir:
        db_path = os.path.join(tmpdir, "test_memory.db")
        mgr = UnifiedMemoryManager(db_path)

        ep = CodingEpisode(
            episode_id="ep_persisted",
            repository="nemi-code",
            task_objective="Repair SQLite busy lock",
            error_symptoms="sqlite3.OperationalError: database is locked",
            root_cause="Unclosed connection in worker thread",
            successful_solution="Added connection context manager and timeout",
            test_evidence="test_concurrency.py passed",
            lesson_learned="Use context managers for all sqlite connections",
        )
        mgr.save_verified_episode(ep)

        # Re-initialize to verify reload from disk
        mgr2 = UnifiedMemoryManager(db_path)
        stats = mgr2.get_stats()
        assert stats["episodic_count"] >= 1

        recalled = mgr2.recall_for_task("database is locked operational error")
        assert len(recalled["episodes"]) >= 1
        assert recalled["episodes"][0]["episode_id"] == "ep_persisted"
