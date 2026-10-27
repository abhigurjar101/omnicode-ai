"""Test Runner and Outcome Parser for OMNICODE AI 5.0.

Executes test suites via the sandboxed runner, parses pass/fail results,
and extracts actionable stack traces for autonomous repair.
"""

import re
import time
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field
from core.runtime.sandbox import CommandSandbox, ExecutionResult


class TestFailure(BaseModel):
    __test__ = False
    test_name: str
    error_type: str
    message: str
    traceback: str


class TestRunResult(BaseModel):
    __test__ = False
    success: bool
    tests_run: int = 0
    passed: int = 0
    failed: int = 0
    errors: int = 0
    duration_seconds: float = 0.0
    failures: List[TestFailure] = Field(default_factory=list)
    raw_stdout: str = ""
    raw_stderr: str = ""


class TestRunner:
    """Executes automated test suites and parses structured failure diagnostics."""
    __test__ = False

    def __init__(self, workspace_root: str):
        self.workspace_root = workspace_root
        self.sandbox = CommandSandbox(workspace_root)

    def parse_pytest_output(self, stdout: str, stderr: str, duration: float) -> TestRunResult:
        """Parses standard pytest terminal output into structured results."""
        combined = stdout + "\n" + stderr

        # Summary line regex: e.g. "== 2 failed, 10 passed in 0.42s =="
        passed_m = re.search(r'(\d+)\s+passed', combined)
        failed_m = re.search(r'(\d+)\s+failed', combined)
        errors_m = re.search(r'(\d+)\s+error', combined)

        passed = int(passed_m.group(1)) if passed_m else 0
        failed = int(failed_m.group(1)) if failed_m else 0
        errors = int(errors_m.group(1)) if errors_m else 0
        total = passed + failed + errors

        # Extract failure details
        failures: List[TestFailure] = []
        failure_blocks = re.findall(r'_{3,}\s+([^\s_]+)\s+_{3,}(.*?)(?=(?:_{3,}|\Z))', combined, re.DOTALL)
        for name, block in failure_blocks:
            lines = [l.strip() for l in block.splitlines() if l.strip()]
            err_line = lines[-1] if lines else "Test failure"
            err_type = err_line.split(":", 1)[0] if ":" in err_line else "AssertionError"
            failures.append(
                TestFailure(
                    test_name=name.strip(),
                    error_type=err_type.strip(),
                    message=err_line.strip(),
                    traceback=block.strip()[:1000],
                )
            )

        success = (failed == 0 and errors == 0 and total > 0)
        return TestRunResult(
            success=success,
            tests_run=total,
            passed=passed,
            failed=failed,
            errors=errors,
            duration_seconds=round(duration, 3),
            failures=failures,
            raw_stdout=stdout,
            raw_stderr=stderr,
        )

    async def run_tests(
        self,
        test_path: Optional[str] = None,
        custom_command: Optional[str] = None,
        timeout_seconds: int = 60,
    ) -> TestRunResult:
        """Runs the test suite inside the sandbox."""
        import sys
        cmd = custom_command or f"{sys.executable} -m pytest {test_path or 'tests/unit'}"
        start = time.time()
        exec_res: ExecutionResult = await self.sandbox.run_command(cmd, timeout_seconds=timeout_seconds)
        duration = time.time() - start


        return self.parse_pytest_output(exec_res.stdout, exec_res.stderr, duration)
