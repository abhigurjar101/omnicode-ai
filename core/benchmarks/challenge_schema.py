"""Standardized Schema for Competitive Programming & Software Engineering Challenges.

Adheres strictly to NEMI-CO benchmark standard:
- Validated Pydantic schema
- Exact input/output specifications, constraints, samples, and evaluation harnesses
- Traceable source links (Codeforces, AtCoder, CSES, ICPC, Project Euler, SWE-bench, etc.)
"""

from enum import Enum
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field


class ChallengeLevel(int, Enum):
    LEVEL_1 = 1  # Fundamentals & basic data structures
    LEVEL_2 = 2  # Intermediate algorithms & implementation
    LEVEL_3 = 3  # Advanced graphs, trees, dynamic programming
    LEVEL_4 = 4  # Expert competitive programming (2400-3000+)
    LEVEL_5 = 5  # ICPC World Finals & IOI championship
    LEVEL_6 = 6  # Complex real-world software engineering
    LEVEL_7 = 7  # Long-horizon autonomous coding tasks


class ChallengeCategory(str, Enum):
    ALGORITHM = "algorithm"
    DYNAMIC_PROGRAMMING = "dynamic_programming"
    GRAPH_THEORY = "graph_theory"
    DATA_STRUCTURES = "data_structures"
    NUMBER_THEORY = "number_theory"
    COMBINATORICS = "combinatorics"
    STRING_ALGORITHMS = "string_algorithms"
    COMPUTATIONAL_GEOMETRY = "computational_geometry"
    SOFTWARE_ENGINEERING = "software_engineering"
    CONCURRENCY = "concurrency"
    API_SYSTEMS = "api_systems"
    REFACTORING = "refactoring"


class TestCase(BaseModel):
    test_id: int
    input_data: str
    expected_output: str
    is_sample: bool = False
    explanation: Optional[str] = None


class BenchmarkChallenge(BaseModel):
    id: str
    source: str
    source_url: str
    title: str
    category: str
    difficulty: str
    level: ChallengeLevel = ChallengeLevel.LEVEL_1
    language: str = "python"
    problem_statement: str
    input_format: str
    output_format: str
    constraints: List[str] = Field(default_factory=list)
    samples: List[Dict[str, str]] = Field(default_factory=list)
    test_cases: List[TestCase] = Field(default_factory=list)
    time_limit: Optional[float] = 2.0
    memory_limit: Optional[int] = 256
    evaluation_method: str = "judge_or_test_harness"
    status: str = "pending"  # pending | attempting | passed | failed
    solution_code: Optional[str] = None
    target_file: str = "solution.py"
    initial_template: str = ""
    last_runtime_ms: Optional[float] = None
    last_error: Optional[str] = None
    last_attempt_at: Optional[float] = None


class TestExecutionResult(BaseModel):
    test_id: int
    passed: bool
    input_data: str
    expected_output: str
    actual_output: str
    execution_time_ms: float
    memory_mb: float = 0.0
    error_message: Optional[str] = None


class ChallengeEvaluationReport(BaseModel):
    challenge_id: str
    title: str
    level: int
    passed: bool
    total_tests: int
    tests_passed: int
    tests_failed: int
    total_duration_ms: float
    test_results: List[TestExecutionResult] = Field(default_factory=list)
    solution_code: str
    agent_steps: List[Dict[str, Any]] = Field(default_factory=list)
    error_summary: Optional[str] = None
