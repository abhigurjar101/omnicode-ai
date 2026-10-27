"""NEMI-CODE Standardized Benchmark & Evaluation Suite.

Provides standardized, reproducible evaluations of autonomous coding agent
capabilities across algorithm synthesis, self-healing debugging, multi-file
refactoring, security auditing, and competitor comparison matrices.
"""

from core.benchmarks.suite import BenchmarkSuite, BenchmarkTask, DifficultyLevel
from core.benchmarks.runner import BenchmarkRunner, BenchmarkRunResult
from core.benchmarks.comparisons import CompetitorCapabilityMatrix

__all__ = [
    "BenchmarkSuite",
    "BenchmarkTask",
    "DifficultyLevel",
    "BenchmarkRunner",
    "BenchmarkRunResult",
    "CompetitorCapabilityMatrix",
]
