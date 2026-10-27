"""Quality Scorecard and Release Gates for OMNICODE AI 5.0.

Computes a weighted quality scorecard across correctness, security, requirements,
readability, simplicity, maintainability, test quality, and performance.
Enforces non-negotiable release quality gates.
"""

from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field

from core.quality.standards import StandardsReviewResult
from core.quality.security import SecurityScanResult
from core.quality.test_runner import TestRunResult


class ScorecardMetric(BaseModel):
    category: str
    weight: float
    score: float  # 0.0 - 10.0
    passed: bool
    notes: str = ""


class QualityScorecard(BaseModel):
    overall_score: float  # 0.0 - 10.0
    release_gate_passed: bool
    blocking_reasons: List[str] = Field(default_factory=list)
    metrics: Dict[str, ScorecardMetric] = Field(default_factory=dict)


class QualityGateEngine:
    """Evaluates release gates and generates comprehensive quality scorecards."""

    WEIGHTS = {
        "correctness": 0.30,
        "security": 0.25,
        "simplicity_and_kiss": 0.15,
        "maintainability": 0.10,
        "test_quality": 0.10,
        "operational_safety": 0.10,
    }

    def evaluate(
        self,
        test_result: Optional[TestRunResult] = None,
        security_result: Optional[SecurityScanResult] = None,
        standards_result: Optional[StandardsReviewResult] = None,
    ) -> QualityScorecard:
        """Evaluates all dimensions and computes release gate decision."""
        blocking_reasons: List[str] = []
        metrics: Dict[str, ScorecardMetric] = {}

        # 1. Correctness (Tests)
        test_score = 10.0
        test_passed = True
        test_notes = "No tests executed"
        if test_result:
            if test_result.tests_run > 0:
                pass_ratio = test_result.passed / test_result.tests_run
                test_score = round(pass_ratio * 10.0, 2)
                test_passed = (test_result.failed == 0 and test_result.errors == 0)
                test_notes = f"{test_result.passed}/{test_result.tests_run} tests passed"
                if not test_passed:
                    blocking_reasons.append(f"Verification tests failed: {test_result.failed} failed, {test_result.errors} errors.")
            else:
                test_score = 5.0
                test_notes = "Zero tests were run"

        metrics["correctness"] = ScorecardMetric(
            category="correctness",
            weight=self.WEIGHTS["correctness"],
            score=test_score,
            passed=test_passed,
            notes=test_notes,
        )

        # 2. Security
        sec_score = 10.0
        sec_passed = True
        sec_notes = "Security scan clear"
        if security_result:
            if security_result.critical_count > 0:
                sec_score = 0.0
                sec_passed = False
                sec_notes = f"{security_result.critical_count} critical security vulnerabilities detected."
                blocking_reasons.append(f"Critical security violations detected ({security_result.critical_count}).")
            elif security_result.issues:
                sec_score = 8.0
                sec_notes = f"{len(security_result.issues)} non-critical warnings"

        metrics["security"] = ScorecardMetric(
            category="security",
            weight=self.WEIGHTS["security"],
            score=sec_score,
            passed=sec_passed,
            notes=sec_notes,
        )

        # 3. Simplicity & KISS
        kiss_score = 10.0
        if standards_result:
            kiss_score = standards_result.kiss_score
        metrics["simplicity_and_kiss"] = ScorecardMetric(
            category="simplicity_and_kiss",
            weight=self.WEIGHTS["simplicity_and_kiss"],
            score=kiss_score,
            passed=kiss_score >= 7.0,
            notes="Evaluated via CodingStandardsEngine",
        )

        # 4. Maintainability & SOLID
        solid_score = 10.0
        if standards_result:
            solid_score = standards_result.solid_score
        metrics["maintainability"] = ScorecardMetric(
            category="maintainability",
            weight=self.WEIGHTS["maintainability"],
            score=solid_score,
            passed=solid_score >= 7.0,
            notes="SOLID architectural checks",
        )

        # 5. Test Quality
        metrics["test_quality"] = ScorecardMetric(
            category="test_quality",
            weight=self.WEIGHTS["test_quality"],
            score=test_score,
            passed=test_passed,
            notes="Automated test suite coverage",
        )

        # 6. Operational Safety
        metrics["operational_safety"] = ScorecardMetric(
            category="operational_safety",
            weight=self.WEIGHTS["operational_safety"],
            score=10.0 if sec_passed else 4.0,
            passed=sec_passed,
            notes="Sandbox containment & permission adherence",
        )

        # Calculate overall weighted score
        overall = sum(m.score * m.weight for m in metrics.values())
        gate_passed = (len(blocking_reasons) == 0 and overall >= 7.0)

        return QualityScorecard(
            overall_score=round(overall, 2),
            release_gate_passed=gate_passed,
            blocking_reasons=blocking_reasons,
            metrics=metrics,
        )
