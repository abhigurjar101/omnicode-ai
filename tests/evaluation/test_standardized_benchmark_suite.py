"""Integration tests for NEMI-CODE Standardized Benchmark Suite."""

import pytest
from core.benchmarks.runner import BenchmarkRunner
from core.benchmarks.comparisons import CompetitorCapabilityMatrix


@pytest.mark.asyncio
async def test_standardized_benchmark_execution():
    runner = BenchmarkRunner()
    result = await runner.run_full_suite()

    # Verify pass rate and quality metrics
    assert result.total_tasks == 8
    assert result.passed_tasks == 8, f"Failed tasks: {[t.task_id for t in result.task_results if not t.passed]}"
    assert result.pass_rate == 1.0
    assert result.security_clean_rate == 1.0
    assert result.avg_quality_score >= 8.5

    # Verify comparison matrix synthesis
    report = CompetitorCapabilityMatrix.generate_comparison_summary({
        "benchmarks_passed": result.passed_tasks,
        "pass_rate": result.pass_rate,
        "avg_duration_ms": result.total_duration_ms / result.total_tasks,
    })

    assert len(report.competitor_profiles) >= 8
    assert "Cursor" in report.competitor_profiles
    assert "Claude Code" in report.competitor_profiles
    assert "GitHub Copilot" in report.competitor_profiles
    assert "Aider" in report.competitor_profiles
    assert "Windsurf" in report.competitor_profiles
    assert "Cline" in report.competitor_profiles
    assert "Roo Code" in report.competitor_profiles
    assert "OpenAI Codex" in report.competitor_profiles
    assert "Google Antigravity" in report.competitor_profiles
    assert len(report.verified_advantages) >= 4
