"""Promotion and Rollback Engine for OMNICODE AI 5.0.

Enforces strict evaluation benchmarks, regression checks, and human-approval gates
before promoting any agent configuration, prompt, or skill update.
"""

from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field
from core.improvement.proposals import ImprovementProposal


class PromotionDecision(BaseModel):
    proposal_id: str
    approved: bool
    baseline_score: float
    candidate_score: float
    regression_detected: bool
    reason: str


class PromotionGate:
    """Evaluates improvement proposals against baseline benchmarks."""

    def evaluate_proposal(
        self,
        proposal: ImprovementProposal,
        baseline_score: float,
        candidate_score: float,
        require_human_approval: bool = True,
        human_approved: bool = False,
    ) -> PromotionDecision:
        """Determines whether a proposed improvement meets criteria for production promotion."""
        # 1. Check for regression
        if candidate_score < baseline_score:
            return PromotionDecision(
                proposal_id=proposal.proposal_id,
                approved=False,
                baseline_score=baseline_score,
                candidate_score=candidate_score,
                regression_detected=True,
                reason=f"Candidate score ({candidate_score}) is lower than baseline ({baseline_score}). Rejected to prevent regressions.",
            )

        # 2. Check for human approval gate
        if require_human_approval and not human_approved:
            return PromotionDecision(
                proposal_id=proposal.proposal_id,
                approved=False,
                baseline_score=baseline_score,
                candidate_score=candidate_score,
                regression_detected=False,
                reason="Benchmark passed, but human authorization is required prior to promotion.",
            )

        # 3. Approved
        proposal.status = "promoted"
        return PromotionDecision(
            proposal_id=proposal.proposal_id,
            approved=True,
            baseline_score=baseline_score,
            candidate_score=candidate_score,
            regression_detected=False,
            reason=f"Candidate score ({candidate_score}) exceeded baseline ({baseline_score}) with zero regressions and verified approval.",
        )
