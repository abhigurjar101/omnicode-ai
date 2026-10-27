"""Comprehensive Verification Suite for NEMI-CO Advanced Coding Agent Training & Benchmark System.

Tests all 12 core requirements:
1. Standardized challenge schema and platform traceability (Codeforces, ICPC, AtCoder, CSES, Project Euler, SWE-bench, etc.)
2. Hardest-problem library across Levels 1 to 7 (Algorithms, Championship, Real Software Engineering)
3. Input/Output specifications, constraints, and sample preservation
4. Multi-agent solving pipeline (Planner, Algorithm, Coding, Testing, Debugging, Reviewing)
5. Sandbox execution with strict timeout, memory tracking, and output normalization
6. Automatic failure-based improvement and root cause diagnosis
7. Structured persistent learning database (SQLite)
8. Difficulty progression and benchmark statistics
9. API endpoints for catalog, selection, execution, and stats
"""

import sys
import pytest
from pathlib import Path
from pydantic import ValidationError

from core.benchmarks.challenge_schema import (
    BenchmarkChallenge,
    ChallengeLevel,
    ChallengeCategory,
    TestCase
)
from core.benchmarks.challenge_library import challenge_library
from core.benchmarks.sandbox import BenchmarkSandbox
from core.improvement.learner import BenchmarkLearner
from core.agent.problem_solver import MultiAgentProblemSolver


# ---------------------------------------------------------------------------
# 1. SCHEMA & PLATFORM VERIFICATION
# ---------------------------------------------------------------------------

def test_standardized_challenge_schema():
    """Validates that challenges strictly conform to schema and reject invalid fields."""
    valid_challenge = BenchmarkChallenge(
        id="unit_test_prob_01",
        source="Codeforces",
        source_url="https://codeforces.com/problemset/problem/4/A",
        title="Sample Watermelon",
        category="algorithm",
        difficulty="800",
        level=ChallengeLevel.LEVEL_1,
        language="python",
        problem_statement="Determine if weight can be split into two even parts.",
        input_format="Integer w",
        output_format="YES or NO",
        constraints=["1 <= w <= 100"],
        samples=[{"input": "8\n", "output": "YES"}],
        test_cases=[
            TestCase(test_id=1, input_data="8\n", expected_output="YES", is_sample=True)
        ],
        time_limit=1.0,
        memory_limit=256,
        target_file="solutions/unit_test_watermelon.py"
    )
    assert valid_challenge.id == "unit_test_prob_01"
    assert valid_challenge.time_limit == 1.0

    # Ensure missing mandatory field raises ValidationError
    with pytest.raises(ValidationError):
        BenchmarkChallenge(
            id="missing_fields",
            source="CSES"
            # Missing source_url, title, problem_statement, etc.
        )


def test_challenge_library_levels_and_traceability():
    """Validates that challenges span Levels 1 to 7 with valid traceable links."""
    all_challenges = challenge_library.list_all()
    assert len(all_challenges) >= 7, f"Expected at least 7 challenges, got {len(all_challenges)}"

    levels_present = {c.level.value for c in all_challenges}
    for lvl in range(1, 8):
        assert lvl in levels_present, f"Missing challenge for Level {lvl}"

    for ch in all_challenges:
        assert ch.source_url.startswith("http"), f"Invalid source URL for {ch.id}: {ch.source_url}"
        assert len(ch.problem_statement) > 10, f"Empty problem statement for {ch.id}"
        assert len(ch.test_cases) >= 1, f"No test cases for {ch.id}"
        assert ch.time_limit is not None and ch.time_limit > 0


# ---------------------------------------------------------------------------
# 2. SANDBOX EXECUTION & TIME/MEMORY SAFETY
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_sandbox_execution_and_normalization():
    """Validates subprocess stdin piping, timeout, and whitespace normalization."""
    sandbox = BenchmarkSandbox()

    # Correct logic with trailing spaces and newlines
    code = (
        "import sys\n"
        "for line in sys.stdin:\n"
        "    if line.strip():\n"
        "        a, b = map(int, line.split())\n"
        "        print(f'  {a + b}  \\n')\n"
    )
    tc = TestCase(test_id=1, input_data="10 20\n", expected_output="30")
    result = await sandbox.evaluate_test_case(code, tc)

    assert result.passed is True
    assert result.execution_time_ms > 0
    assert result.memory_mb > 0
    assert result.error_message is None


@pytest.mark.asyncio
async def test_sandbox_timeout_enforcement():
    """Validates that infinite loops or slow code trigger Time Limit Exceeded."""
    sandbox = BenchmarkSandbox()
    infinite_loop_code = "import time\ntime.sleep(5.0)\n"
    tc = TestCase(test_id=1, input_data="", expected_output="")
    result = await sandbox.evaluate_test_case(infinite_loop_code, tc, time_limit=0.5)

    assert result.passed is False
    assert "Time Limit Exceeded" in (result.error_message or "")


# ---------------------------------------------------------------------------
# 3. PERSISTENT LEARNER & STRATEGY DATABASE
# ---------------------------------------------------------------------------

def test_persistent_learner_and_diagnostics(tmp_path):
    """Validates SQLite attempt recording, failure diagnosis, and strategy retrieval."""
    db_file = tmp_path / "test_learning.db"
    learner = BenchmarkLearner(db_path=str(db_file))

    # Record failed attempt
    att_id = learner.record_attempt(
        problem_id="cses_weird_algo",
        source="CSES",
        level=1,
        attempt_number=1,
        selected_algorithm="Simulation",
        code="print(0)",
        passed=False,
        tests_passed=0,
        total_tests=4,
        runtime_ms=15.2,
        error_type="WRONG_ANSWER",
        error_message="Expected '3 10 5 16 8 4 2 1', got '0'"
    )
    assert att_id > 0

    # Record root cause diagnosis
    learner.record_failure_diagnosis(
        attempt_id=att_id,
        problem_id="cses_weird_algo",
        failure_category="WRONG_ANSWER",
        root_cause="Dummy return value instead of iterative Collatz loop",
        alternative_strategies=["Iterate while n != 1", "Bitwise parity check"],
        implemented_correction="Implemented while n != 1 with 3*n + 1"
    )

    # Record successful attempt and strategy
    att_id_2 = learner.record_attempt(
        problem_id="cses_weird_algo",
        source="CSES",
        level=1,
        attempt_number=2,
        selected_algorithm="Iterative Collatz",
        code="while n != 1: ...",
        passed=True,
        tests_passed=4,
        total_tests=4,
        runtime_ms=18.5
    )
    learner.record_verified_strategy(
        category="algorithm",
        problem_type="introductory",
        lesson="Collatz sequence terminates reliably for positive n",
        reusable_strategy="Use iterative loop with fast parity test"
    )

    # Query metrics and strategy
    stats = learner.get_benchmark_stats()
    assert stats["total_attempts"] == 2
    assert stats["passed_problems"] == 1
    assert stats["failure_diagnoses"] == 1
    assert stats["verified_improvements"] >= 1

    strats = learner.query_reusable_strategies("algorithm")
    assert len(strats) >= 1
    assert "Collatz" in strats[0]["lesson"]


# ---------------------------------------------------------------------------
# 4. MULTI-AGENT SOLVING & REPAIR WORKFLOW
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_multi_agent_solving_workflow(tmp_path):
    """Validates the full multi-agent pipeline from planning to testing and review."""
    solver = MultiAgentProblemSolver(workspace_root=tmp_path)

    statuses = []
    final_report = None

    async for step in solver.solve("cses_1068_weird_algorithm"):
        statuses.append(step["status"])
        if step.get("stage") == "completed":
            final_report = step["report"]

    assert "Analyzing" in statuses
    assert "Coding" in statuses
    assert "Testing" in statuses
    assert "Passed" in statuses
    assert final_report is not None
    assert final_report["passed"] is True
    assert final_report["tests_passed"] == final_report["total_tests"]


@pytest.mark.asyncio
async def test_multi_agent_debug_repair_cycle(tmp_path):
    """Validates that a failed solution triggers Debug Agent and auto-repairs."""
    solver = MultiAgentProblemSolver(workspace_root=tmp_path)

    statuses = []
    # Inject buggy initial code
    buggy_code = "import sys\nprint('Wrong output')\n"
    final_report = None

    async for step in solver.solve("kattis_r2", user_code=buggy_code):
        statuses.append(step["status"])
        if step.get("stage") == "completed":
            final_report = step["report"]

    assert "Debugging" in statuses, f"Expected Debugging step, got {statuses}"
    assert final_report is not None
    assert final_report["passed"] is True
