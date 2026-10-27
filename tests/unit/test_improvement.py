"""Unit tests for Continuous Improvement Engine (Experiences, Skills, Proposals, Promotion)."""

import pytest
from core.improvement import (
    TaskExperience,
    ExperienceCollector,
    SkillStore,
    ProposalEngine,
    PromotionGate,
)


def test_experience_collector():
    collector = ExperienceCollector()
    collector.record(
        TaskExperience(
            experience_id="exp_1",
            task_id="t1",
            objective="Fix bug in auth",
            routing_mode="BALANCED",
            selected_model="meta/llama-3.3-70b-instruct",
            status="success",
            tokens_in=500,
            tokens_out=200,
            duration_ms=450.0,
        )
    )

    metrics = collector.get_summary_metrics()
    assert metrics["total_tasks"] == 1
    assert metrics["success_rate"] == 1.0
    assert metrics["avg_duration_ms"] == 450.0


def test_skill_store():
    store = SkillStore()
    skills = store.find_skills_for_task("Fix the failing pytest in math service")
    assert len(skills) >= 1
    assert any("bug" in s.skill_id for s in skills)


def test_promotion_gate():
    gate = PromotionGate()
    engine = ProposalEngine()

    proposal = engine.create_proposal(
        proposal_id="prop_01",
        target_component="retriever",
        title="Increase hybrid top_k",
        rationale="Improves symbol coverage",
        proposed_change={"top_k": 5},
        baseline_metric=8.0,
        target_metric=9.0,
    )

    # Rejection on regression
    dec_reg = gate.evaluate_proposal(proposal, baseline_score=8.5, candidate_score=8.0)
    assert dec_reg.approved is False
    assert dec_reg.regression_detected is True

    # Needs human approval
    dec_wait = gate.evaluate_proposal(proposal, baseline_score=8.0, candidate_score=9.0, human_approved=False)
    assert dec_wait.approved is False
    assert "human authorization is required" in dec_wait.reason

    # Approved with human authorization
    dec_ok = gate.evaluate_proposal(proposal, baseline_score=8.0, candidate_score=9.0, human_approved=True)
    assert dec_ok.approved is True
    assert proposal.status == "promoted"
