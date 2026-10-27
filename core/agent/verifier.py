"""Verification and Healing Engine for OMNICODE AI 5.0.

Executes tests, runs static audits and security scans, and computes quality scorecard.
"""

from typing import Dict, Any, Optional
from core.quality.test_runner import TestRunner, TestRunResult
from core.quality.security import SecurityAuditor, SecurityScanResult
from core.quality.standards import CodingStandardsEngine, StandardsReviewResult
from core.quality.scorecard import QualityGateEngine, QualityScorecard


class AgentVerifier:
    """Verifies changes against test suites and architectural quality gates."""

    def __init__(self, workspace_root: str):
        self.workspace_root = workspace_root
        self.test_runner = TestRunner(workspace_root)
        self.security = SecurityAuditor()
        self.standards = CodingStandardsEngine()
        self.gate_engine = QualityGateEngine()

    async def verify_workspace(
        self,
        test_path: Optional[str] = None,
        custom_test_command: Optional[str] = None,
        code_to_audit: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Runs full verification suite and compiles quality scorecard."""
        # 1. Run tests
        test_res: TestRunResult = await self.test_runner.run_tests(
            test_path=test_path,
            custom_command=custom_test_command,
        )

        # 2. Security audit
        sec_res: SecurityScanResult = self.security.scan_code(code_to_audit or "")

        # 3. Standards review
        std_res: StandardsReviewResult = self.standards.review_python_code(code_to_audit or "")

        # 4. Quality Gate
        scorecard: QualityScorecard = self.gate_engine.evaluate(
            test_result=test_res,
            security_result=sec_res,
            standards_result=std_res,
        )

        return {
            "verified": scorecard.release_gate_passed,
            "overall_score": scorecard.overall_score,
            "blocking_reasons": scorecard.blocking_reasons,
            "tests": test_res.model_dump(),
            "security": sec_res.model_dump(),
            "standards": std_res.model_dump(),
            "scorecard": scorecard.model_dump(),
        }
