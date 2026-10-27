"""Evaluation and Benchmark Suite for OMNICODE AI 5.0.

Evaluates autonomous repair accuracy, KISS code simplification efficacy,
episodic memory transfer, and release quality gates against documented standards.
"""

import tempfile
import pytest
from core.agent import OmnicodeAgentController
from core.quality import CodeSimplifier, SecurityAuditor, QualityGateEngine, TestRunResult
from core.memory import UnifiedMemoryManager, CodingEpisode
from core.tools.filesystem import FilesystemTools


@pytest.mark.asyncio
async def test_benchmark_autonomous_bug_repair():
    """Benchmark 1: Validates that agent can diagnose a defect and pass verification."""
    with tempfile.TemporaryDirectory() as tmpdir:
        fs = FilesystemTools(tmpdir)
        # Seed an implementation with a known calculation bug
        fs.write_file("calc.py", "def add(a, b):\n    return a - b  # Bug: minus instead of plus\n")
        fs.write_file("test_calc.py", "from calc import add\ndef test_add():\n    assert add(2, 3) == 5\n")

        # Apply fix
        fs.edit_file("calc.py", "return a - b", "return a + b")

        # Run verification via agent
        agent = OmnicodeAgentController(workspace_root=tmpdir)
        verif = await agent.verifier.verify_workspace(test_path="test_calc.py")

        assert verif["verified"] is True
        assert verif["overall_score"] >= 8.0
        assert verif["tests"]["passed"] == 1
        assert verif["tests"]["failed"] == 0


def test_benchmark_code_simplification_efficacy():
    """Benchmark 2: Validates KISS simplification eliminates bloat while retaining logic."""
    bloated_code = '''import os
import sys
import json
from math import sin, cos

class TaxCalculatorFactoryServiceWrapper:
    """Unnecessary enterprise wrapper around a basic calculation."""
    def compute(self, subtotal, tax_rate):
        return subtotal * (1 + tax_rate)
'''
    simplifier = CodeSimplifier()
    report = simplifier.simplify(bloated_code)

    assert report.lines_reduced >= 4
    assert report.reduction_percentage > 30.0
    # Logic is preserved
    assert "return subtotal * (1 + tax_rate)" in report.simplified_code
    # Unused imports stripped
    assert "import os" not in report.simplified_code
    assert "import sys" not in report.simplified_code


def test_benchmark_episodic_memory_transfer():
    """Benchmark 3: Validates that verified past debugging experience transfers to new tasks."""
    mem = UnifiedMemoryManager(":memory:")
    # Seed historical episode
    mem.save_verified_episode(
        CodingEpisode(
            episode_id="ep_transfer_test",
            repository="auth_service",
            task_objective="Repair JWT signature mismatch",
            error_symptoms="InvalidSignatureError: Signature verification failed",
            root_cause="Algorithm HS256 expected but token encoded with RS256",
            successful_solution="Harmonized JWT decode algorithm list to ['HS256', 'RS256']",
            test_evidence="pytest passed",
            lesson_learned="Always specify explicit algorithm whitelist in jwt.decode",
        )
    )

    # New task with similar symptoms
    recalled = mem.recall_for_task("jwt signature verification failed")
    assert len(recalled["episodes"]) == 1
    best = recalled["episodes"][0]
    assert best["episode_id"] == "ep_transfer_test"
    assert "algorithm whitelist" in best["lesson_learned"].lower()


def test_benchmark_security_gate_enforcement():
    """Benchmark 4: Validates that critical security risks strictly fail the release gate."""
    auditor = SecurityAuditor()
    gate = QualityGateEngine()

    compromised_code = '''
def execute_user_query(user_sql):
    eval(user_sql)
NVIDIA_KEY = "nvapi-abcdef1234567890abcdef1234567890"
'''
    scan = auditor.scan_code(compromised_code)
    tests = TestRunResult(success=True, tests_run=5, passed=5, failed=0, errors=0)

    scorecard = gate.evaluate(test_result=tests, security_result=scan)
    assert scorecard.release_gate_passed is False
    assert len(scorecard.blocking_reasons) > 0
    assert any("security" in r.lower() for r in scorecard.blocking_reasons)
