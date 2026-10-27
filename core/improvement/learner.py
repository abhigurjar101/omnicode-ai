"""Structured Learning and Self-Improvement Engine for NEMI-CO.

Maintains SQLite persistence for:
- Problem attempt histories & code submissions
- Failure diagnostics & root-cause categorizations
- Verified reusable algorithm strategies & prompt enhancements
- Regression validation suites
"""

import json
import sqlite3
import time
from pathlib import Path
from typing import Dict, Any, List, Optional
from core.benchmarks.challenge_schema import TestExecutionResult


class BenchmarkLearner:
    """Manages persistent memory of problem attempts, diagnostics, and reusable learnings."""

    def __init__(self, db_path: Optional[str] = None):
        if not db_path:
            db_path = str(Path.cwd() / ".benchmark_learning.db")
        self.db_path = db_path
        self._init_db()

    def _get_conn(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_db(self):
        with self._get_conn() as conn:
            conn.executescript("""
                CREATE TABLE IF NOT EXISTS problem_attempts (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    problem_id TEXT NOT NULL,
                    source TEXT NOT NULL,
                    level INTEGER NOT NULL,
                    attempt_number INTEGER NOT NULL,
                    selected_algorithm TEXT,
                    code TEXT NOT NULL,
                    passed INTEGER NOT NULL,
                    tests_passed INTEGER NOT NULL,
                    total_tests INTEGER NOT NULL,
                    runtime_ms REAL,
                    error_type TEXT,
                    error_message TEXT,
                    timestamp REAL NOT NULL
                );

                CREATE TABLE IF NOT EXISTS failure_diagnostics (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    attempt_id INTEGER NOT NULL,
                    problem_id TEXT NOT NULL,
                    failure_category TEXT NOT NULL,
                    root_cause TEXT NOT NULL,
                    alternative_strategies TEXT,
                    implemented_correction TEXT NOT NULL,
                    timestamp REAL NOT NULL,
                    FOREIGN KEY (attempt_id) REFERENCES problem_attempts(id)
                );

                CREATE TABLE IF NOT EXISTS verified_strategies (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    category TEXT NOT NULL,
                    problem_type TEXT NOT NULL,
                    lesson TEXT NOT NULL,
                    reusable_strategy TEXT NOT NULL,
                    success_count INTEGER DEFAULT 1,
                    created_at REAL NOT NULL
                );

                CREATE TABLE IF NOT EXISTS regression_records (
                    problem_id TEXT PRIMARY KEY,
                    verified_code TEXT NOT NULL,
                    last_passed_at REAL NOT NULL,
                    duration_ms REAL NOT NULL
                );
            """)
            conn.commit()

    def record_attempt(
        self,
        problem_id: str,
        source: str,
        level: int,
        attempt_number: int,
        selected_algorithm: str,
        code: str,
        passed: bool,
        tests_passed: int,
        total_tests: int,
        runtime_ms: float,
        error_type: Optional[str] = None,
        error_message: Optional[str] = None
    ) -> int:
        now = time.time()
        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO problem_attempts (
                    problem_id, source, level, attempt_number,
                    selected_algorithm, code, passed, tests_passed,
                    total_tests, runtime_ms, error_type, error_message, timestamp
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                problem_id, source, level, attempt_number,
                selected_algorithm, code, 1 if passed else 0,
                tests_passed, total_tests, runtime_ms,
                error_type, error_message, now
            ))
            attempt_id = cursor.lastrowid
            conn.commit()

            # If passed, register in regression table
            if passed:
                cursor.execute("""
                    INSERT OR REPLACE INTO regression_records (problem_id, verified_code, last_passed_at, duration_ms)
                    VALUES (?, ?, ?, ?)
                """, (problem_id, code, now, runtime_ms))
                conn.commit()

            return attempt_id

    def record_failure_diagnosis(
        self,
        attempt_id: int,
        problem_id: str,
        failure_category: str,
        root_cause: str,
        alternative_strategies: List[str],
        implemented_correction: str
    ):
        now = time.time()
        with self._get_conn() as conn:
            conn.execute("""
                INSERT INTO failure_diagnostics (
                    attempt_id, problem_id, failure_category,
                    root_cause, alternative_strategies, implemented_correction, timestamp
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                attempt_id, problem_id, failure_category,
                root_cause, json.dumps(alternative_strategies),
                implemented_correction, now
            ))
            conn.commit()

    def record_verified_strategy(
        self,
        category: str,
        problem_type: str,
        lesson: str,
        reusable_strategy: str
    ):
        now = time.time()
        with self._get_conn() as conn:
            # Check if strategy already exists
            existing = conn.execute(
                "SELECT id, success_count FROM verified_strategies WHERE category = ? AND problem_type = ?",
                (category, problem_type)
            ).fetchone()
            if existing:
                conn.execute(
                    "UPDATE verified_strategies SET success_count = success_count + 1, reusable_strategy = ? WHERE id = ?",
                    (reusable_strategy, existing["id"])
                )
            else:
                conn.execute("""
                    INSERT INTO verified_strategies (category, problem_type, lesson, reusable_strategy, created_at)
                    VALUES (?, ?, ?, ?, ?)
                """, (category, problem_type, lesson, reusable_strategy, now))
            conn.commit()

    def query_reusable_strategies(self, category: str, problem_type: Optional[str] = None) -> List[Dict[str, Any]]:
        with self._get_conn() as conn:
            if problem_type:
                rows = conn.execute(
                    "SELECT * FROM verified_strategies WHERE category = ? OR problem_type = ? ORDER BY success_count DESC",
                    (category, problem_type)
                ).fetchall()
            else:
                rows = conn.execute(
                    "SELECT * FROM verified_strategies WHERE category = ? ORDER BY success_count DESC",
                    (category,)
                ).fetchall()
            return [dict(r) for r in rows]

    def get_benchmark_stats(self) -> Dict[str, Any]:
        with self._get_conn() as conn:
            total_attempts = conn.execute("SELECT COUNT(*) as c FROM problem_attempts").fetchone()["c"]
            distinct_problems = conn.execute("SELECT COUNT(DISTINCT problem_id) as c FROM problem_attempts").fetchone()["c"]
            passed_distinct = conn.execute("SELECT COUNT(DISTINCT problem_id) as c FROM problem_attempts WHERE passed = 1").fetchone()["c"]
            failed_attempts = conn.execute("SELECT COUNT(*) as c FROM problem_attempts WHERE passed = 0").fetchone()["c"]
            
            avg_duration = conn.execute("SELECT AVG(runtime_ms) as a FROM problem_attempts").fetchone()["a"] or 0.0
            
            # Max level achieved
            max_level_row = conn.execute("SELECT MAX(level) as m FROM problem_attempts WHERE passed = 1").fetchone()
            current_level = max_level_row["m"] if max_level_row and max_level_row["m"] is not None else 1

            # Improvements count
            diagnostics_count = conn.execute("SELECT COUNT(*) as c FROM failure_diagnostics").fetchone()["c"]
            verified_strategies_count = conn.execute("SELECT COUNT(*) as c FROM verified_strategies").fetchone()["c"]

            success_rate = (passed_distinct / distinct_problems * 100) if distinct_problems > 0 else 0.0

            return {
                "total_attempts": total_attempts,
                "attempted_problems": distinct_problems,
                "passed_problems": passed_distinct,
                "failed_attempts": failed_attempts,
                "success_rate": round(success_rate, 1),
                "current_difficulty_level": current_level,
                "average_execution_time_ms": round(avg_duration, 2),
                "failure_diagnoses": diagnostics_count,
                "verified_improvements": verified_strategies_count + diagnostics_count
            }

    def get_recent_history(self, limit: int = 50) -> List[Dict[str, Any]]:
        with self._get_conn() as conn:
            rows = conn.execute("""
                SELECT p.*, f.failure_category, f.root_cause, f.implemented_correction
                FROM problem_attempts p
                LEFT JOIN failure_diagnostics f ON p.id = f.attempt_id
                ORDER BY p.id DESC
                LIMIT ?
            """, (limit,)).fetchall()
            return [dict(r) for r in rows]


benchmark_learner = BenchmarkLearner()
