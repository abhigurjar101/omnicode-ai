"""Standardized Benchmark Tasks for Autonomous Coding Agents.

Defines real programming tasks of increasing difficulty with rigorous,
reproducible test assertions, environments, and quality gates.
"""

from enum import Enum
from typing import Dict, Any, List, Callable, Optional
from pydantic import BaseModel, Field


class DifficultyLevel(str, Enum):
    LEVEL_1_SYNTAX_ALGO = "Level 1: Syntax & Basic Algorithm"
    LEVEL_2_ASYNC_API = "Level 2: Asynchronous REST API"
    LEVEL_3_AST_DATA_STRUCTURE = "Level 3: AST & Advanced Data Structures"
    LEVEL_4_AUTONOMOUS_DEBUG = "Level 4: Self-Healing Bug Repair"
    LEVEL_5_SECURITY_HARDENING = "Level 5: Security & Vulnerability Remediation"
    LEVEL_6_KISS_REFACTORING = "Level 6: Multi-File KISS Refactoring"
    LEVEL_7_MEMORY_TRANSFER = "Level 7: Episodic Experience Transfer"
    LEVEL_8_MULTI_AGENT_DAG = "Level 8: Multi-Agent Orchestration & Gate"


class BenchmarkTask(BaseModel):
    task_id: str
    title: str
    difficulty: DifficultyLevel
    category: str
    description: str
    initial_files: Dict[str, str] = Field(default_factory=dict)
    test_files: Dict[str, str] = Field(default_factory=dict)
    expected_artifacts: List[str] = Field(default_factory=list)
    timeout_seconds: int = 30
    min_quality_score: float = 8.0
    must_pass_security: bool = True


class BenchmarkSuite:
    """Standardized suite containing 8 progressive real-world programming benchmarks."""

    @staticmethod
    def get_all_tasks() -> List[BenchmarkTask]:
        return [
            # 1. Level 1: Algorithm & Syntax
            BenchmarkTask(
                task_id="BM-01-ALGO-FIB",
                title="Dynamic Programming Memoized Fibonacci & Factorial",
                difficulty=DifficultyLevel.LEVEL_1_SYNTAX_ALGO,
                category="algorithms",
                description="Synthesize an efficient, typed memoized fibonacci and factorial module.",
                initial_files={
                    "math_ops.py": "# Implement memoized fibonacci(n) and factorial(n)\n"
                },
                test_files={
                    "test_math_ops.py": (
                        "from math_ops import fibonacci, factorial\n"
                        "def test_fibonacci():\n"
                        "    assert fibonacci(0) == 0\n"
                        "    assert fibonacci(1) == 1\n"
                        "    assert fibonacci(10) == 55\n"
                        "    assert fibonacci(30) == 832040\n\n"
                        "def test_factorial():\n"
                        "    assert factorial(0) == 1\n"
                        "    assert factorial(5) == 120\n"
                        "    assert factorial(10) == 3628800\n"
                    )
                },
                expected_artifacts=["math_ops.py"],
            ),

            # 2. Level 2: Async REST API Endpoint
            BenchmarkTask(
                task_id="BM-02-API-AUTH",
                title="Asynchronous Token Verification and Role Authorizer",
                difficulty=DifficultyLevel.LEVEL_2_ASYNC_API,
                category="api_services",
                description="Implement an asynchronous token validator with expiration check and role-based access.",
                initial_files={
                    "auth.py": (
                        "import time\n"
                        "from typing import Optional, Dict\n"
                        "# Implement async def verify_token(token: str, required_role: str = 'user')\n"
                    )
                },
                test_files={
                    "test_auth.py": (
                        "import pytest\n"
                        "import asyncio\n"
                        "from auth import verify_token\n\n"
                        "@pytest.mark.asyncio\n"
                        "async def test_auth_success():\n"
                        "    res = await verify_token('valid_token_admin_secret', 'admin')\n"
                        "    assert res['valid'] is True\n"
                        "    assert res['role'] == 'admin'\n\n"
                        "@pytest.mark.asyncio\n"
                        "async def test_auth_rejection():\n"
                        "    res = await verify_token('short', 'admin')\n"
                        "    assert res['valid'] is False\n"
                    )
                },
                expected_artifacts=["auth.py"],
            ),

            # 3. Level 3: AST & Topological Sort Data Structure
            BenchmarkTask(
                task_id="BM-03-DATA-DAG",
                title="Directed Acyclic Graph (DAG) Topological Dependency Resolver",
                difficulty=DifficultyLevel.LEVEL_3_AST_DATA_STRUCTURE,
                category="data_structures",
                description="Implement a robust DAG dependency graph with topological ordering and cycle detection.",
                initial_files={
                    "dag_resolver.py": (
                        "from typing import Dict, List\n"
                        "# Implement class DependencyDAG with add_dependency and resolve_order\n"
                    )
                },
                test_files={
                    "test_dag.py": (
                        "import pytest\n"
                        "from dag_resolver import DependencyDAG, CyclicDependencyError\n\n"
                        "def test_topological_sort():\n"
                        "    dag = DependencyDAG()\n"
                        "    dag.add_dependency('build', 'lint')\n"
                        "    dag.add_dependency('test', 'build')\n"
                        "    dag.add_dependency('deploy', 'test')\n"
                        "    order = dag.resolve_order()\n"
                        "    assert order.index('lint') < order.index('build') < order.index('test') < order.index('deploy')\n\n"
                        "def test_cycle_detection():\n"
                        "    dag = DependencyDAG()\n"
                        "    dag.add_dependency('A', 'B')\n"
                        "    dag.add_dependency('B', 'A')\n"
                        "    with pytest.raises(CyclicDependencyError):\n"
                        "        dag.resolve_order()\n"
                    )
                },
                expected_artifacts=["dag_resolver.py"],
            ),

            # 4. Level 4: Self-Healing Bug Diagnostics & Repair
            BenchmarkTask(
                task_id="BM-04-DEBUG-REPAIR",
                title="Autonomous Diagnosis of Off-by-One and Null Dereference",
                difficulty=DifficultyLevel.LEVEL_4_AUTONOMOUS_DEBUG,
                category="debugging",
                description="Given a buggy pagination chunker that throws IndexError, diagnose and heal automatically.",
                initial_files={
                    "paginator.py": (
                        "def paginate(items, page_size, page_number):\n"
                        "    # Bug: 1-indexed calculation causes IndexError on boundary\n"
                        "    start = page_number * page_size\n"
                        "    end = start + page_size\n"
                        "    return items[start:end]\n"
                    )
                },
                test_files={
                    "test_paginator.py": (
                        "from paginator import paginate\n"
                        "def test_pagination_page_1():\n"
                        "    items = [1, 2, 3, 4, 5, 6, 7]\n"
                        "    # Page 1 with size 3 should return [1, 2, 3]\n"
                        "    assert paginate(items, page_size=3, page_number=1) == [1, 2, 3]\n"
                        "def test_pagination_page_3():\n"
                        "    items = [1, 2, 3, 4, 5, 6, 7]\n"
                        "    assert paginate(items, page_size=3, page_number=3) == [7]\n"
                        "def test_empty():\n"
                        "    assert paginate([], page_size=5, page_number=1) == []\n"
                    )
                },
                expected_artifacts=["paginator.py"],
            ),

            # 5. Level 5: Security Hardening & Zero Vulnerability
            BenchmarkTask(
                task_id="BM-05-SEC-HARDEN",
                title="Remediation of Remote Code Execution and Hardcoded Secrets",
                difficulty=DifficultyLevel.LEVEL_5_SECURITY_HARDENING,
                category="security",
                description="Audit a vulnerable handler containing eval() and hardcoded API tokens, replacing with safe AST parsing.",
                initial_files={
                    "query_service.py": (
                        "import os\n"
                        "API_SECRET = 'nvapi-sk-1234567890abcdef1234567890'\n\n"
                        "def evaluate_expression(user_input: str):\n"
                        "    return eval(user_input)\n"
                    )
                },
                test_files={
                    "test_query.py": (
                        "import os\n"
                        "from query_service import evaluate_expression\n"
                        "def test_safe_arithmetic():\n"
                        "    assert evaluate_expression('10 + 25') == 35\n"
                        "def test_malicious_rejection():\n"
                        "    # Arbitrary code execution should raise ValueError, not execute\n"
                        "    import pytest\n"
                        "    with pytest.raises((ValueError, TypeError, SyntaxError)):\n"
                        "        evaluate_expression(\"__import__('os').system('ls')\")\n"
                    )
                },
                expected_artifacts=["query_service.py"],
            ),

            # 6. Level 6: KISS Multi-File Refactoring
            BenchmarkTask(
                task_id="BM-06-KISS-REFACTOR",
                title="KISS Architectural Simplification of Over-Engineered Factory",
                difficulty=DifficultyLevel.LEVEL_6_KISS_REFACTORING,
                category="refactoring",
                description="Simplify heavily nested 80-line boilerplate into a direct, high-performance module (<25 lines).",
                initial_files={
                    "transformer.py": (
                        "import os\nimport sys\nimport json\nimport math\n\n"
                        "class AbstractTokenNormalizerInterfaceBase:\n"
                        "    pass\n\n"
                        "class ConcreteTokenNormalizerService(AbstractTokenNormalizerInterfaceBase):\n"
                        "    def __init__(self, prefix='nemi'):\n"
                        "        self.prefix = prefix\n"
                        "    def normalize(self, raw_token: str) -> str:\n"
                        "        if not raw_token:\n"
                        "            return ''\n"
                        "        return f'{self.prefix}_{raw_token.strip().lower()}'\n"
                    )
                },
                test_files={
                    "test_transformer.py": (
                        "from transformer import ConcreteTokenNormalizerService\n"
                        "def test_normalize():\n"
                        "    norm = ConcreteTokenNormalizerService()\n"
                        "    assert norm.normalize('  AUTH_KEY  ') == 'nemi_auth_key'\n"
                        "    assert norm.normalize('') == ''\n"
                    )
                },
                expected_artifacts=["transformer.py"],
            ),

            # 7. Level 7: Episodic Memory Experience Transfer
            BenchmarkTask(
                task_id="BM-07-MEM-TRANSFER",
                title="Cross-Session Episodic Transfer of Debugging Knowledge",
                difficulty=DifficultyLevel.LEVEL_7_MEMORY_TRANSFER,
                category="memory",
                description="Recall verified historical episodes from SQLite to immediately resolve a recurring fault.",
                initial_files={
                    "session.py": (
                        "# Resolves connection drop under keep-alive timeout\n"
                    )
                },
                test_files={
                    "test_session.py": (
                        "from session import KEEPALIVE_TIMEOUT\n"
                        "def test_session_keepalive():\n"
                        "    assert KEEPALIVE_TIMEOUT == 60\n"
                    )
                },
                expected_artifacts=["session.py"],
            ),

            # 8. Level 8: Multi-Agent Orchestration & Gate
            BenchmarkTask(
                task_id="BM-08-MULTI-AGENT-DAG",
                title="Full Autonomous Multi-Agent Cycle with Quality Gate",
                difficulty=DifficultyLevel.LEVEL_8_MULTI_AGENT_DAG,
                category="orchestration",
                description="Orchestrate Planner -> Code -> Review -> Test -> Verify across LangGraph with scorecard gate >= 9.0.",
                initial_files={
                    "orchestrated.py": "# Multi-agent targeted module\n"
                },
                test_files={
                    "test_orchestrated.py": (
                        "from orchestrated import run_pipeline\n"
                        "def test_pipeline():\n"
                        "    assert run_pipeline() is True\n"
                    )
                },
                expected_artifacts=["orchestrated.py"],
            ),
        ]
