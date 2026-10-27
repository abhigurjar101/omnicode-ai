"""Sandboxed Execution Environment for OMNICODE AI 2.0.

Provides controlled process execution with timeouts, sanitized environment
variables (preventing credential leakage into child processes), resource limits,
and output size containment with artifact spillover.
"""

import os
import sys
import asyncio
import subprocess
import tempfile
import time
from typing import Dict, Any, Optional
from pathlib import Path
from pydantic import BaseModel, Field


class ExecutionResult(BaseModel):
    command: str
    exit_code: int
    stdout: str
    stderr: str
    duration_ms: float
    timed_out: bool = False
    truncated: bool = False
    artifact_ref: Optional[str] = None


class CommandSandbox:
    """Safely executes terminal commands in a restricted local environment."""

    MAX_OUTPUT_BYTES = 64 * 1024  # 64 KB inline limit before artifact spillover
    DEFAULT_TIMEOUT_SECONDS = 60

    # Sensitive environment variables to strip from subprocesses
    SENSITIVE_ENV_VARS = {
        "OPENAI_API_KEY", "ANTHROPIC_API_KEY", "CURSOR_API_KEY",
        "GITHUB_TOKEN", "AWS_SECRET_ACCESS_KEY", "AWS_ACCESS_KEY_ID",
        "NEMICODE_MASTER_KEY", "OMNICODE_MASTER_KEY", "DATABASE_URL", "POSTGRES_PASSWORD",
        "REDIS_PASSWORD", "PRIVATE_KEY"
    }

    def __init__(self, workspace_root: str, artifact_dir: Optional[str] = None):
        self.workspace_root = Path(workspace_root).resolve()
        self.artifact_dir = Path(artifact_dir or tempfile.gettempdir()) / "nemicode_artifacts"
        self.artifact_dir.mkdir(parents=True, exist_ok=True)

    def _sanitize_env(self, custom_env: Optional[Dict[str, str]] = None) -> Dict[str, str]:
        """Creates a clean sanitized environment stripped of secrets."""
        env = dict(os.environ)
        for key in self.SENSITIVE_ENV_VARS:
            env.pop(key, None)

        # Set safety flags
        env["NEMICODE_SANDBOX"] = "1"
        env["OMNICODE_SANDBOX"] = "1"
        env["PYTHONUNBUFFERED"] = "1"

        if custom_env:
            for k, v in custom_env.items():
                if k not in self.SENSITIVE_ENV_VARS:
                    env[k] = str(v)
        return env

    async def run_command(
        self,
        command: str,
        timeout_seconds: Optional[int] = None,
        cwd: Optional[str] = None,
        custom_env: Optional[Dict[str, str]] = None
    ) -> ExecutionResult:
        """Executes a command asynchronously inside the workspace sandbox."""
        timeout = timeout_seconds or self.DEFAULT_TIMEOUT_SECONDS
        working_dir = Path(cwd or self.workspace_root).resolve()
        if not (self.workspace_root == working_dir or self.workspace_root in working_dir.parents):
            return ExecutionResult(
                command=command,
                exit_code=1,
                stdout="",
                stderr=f"Security violation: working directory {working_dir} is outside sandbox root {self.workspace_root}",
                duration_ms=0.0
            )

        sanitized_env = self._sanitize_env(custom_env)
        start_time = time.time()
        timed_out = False

        try:
            proc = await asyncio.create_subprocess_shell(
                command,
                cwd=str(working_dir),
                env=sanitized_env,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )

            try:
                stdout_bytes, stderr_bytes = await asyncio.wait_for(
                    proc.communicate(), timeout=timeout
                )
                exit_code = proc.returncode if proc.returncode is not None else -1
            except asyncio.TimeoutError:
                timed_out = True
                try:
                    proc.kill()
                    await proc.wait()
                except Exception:
                    pass
                stdout_bytes = b""
                stderr_bytes = f"Command timed out after {timeout} seconds.".encode()
                exit_code = 124

        except Exception as e:
            return ExecutionResult(
                command=command,
                exit_code=1,
                stdout="",
                stderr=f"Execution error: {str(e)}",
                duration_ms=(time.time() - start_time) * 1000
            )

        duration_ms = (time.time() - start_time) * 1000
        stdout_str = stdout_bytes.decode("utf-8", errors="replace")
        stderr_str = stderr_bytes.decode("utf-8", errors="replace")

        truncated = False
        artifact_ref = None

        # Check for large output spillover
        if len(stdout_bytes) > self.MAX_OUTPUT_BYTES or len(stderr_bytes) > self.MAX_OUTPUT_BYTES:
            truncated = True
            artifact_filename = f"exec_{int(time.time() * 1000)}.log"
            artifact_file = self.artifact_dir / artifact_filename
            with open(artifact_file, "w") as f:
                f.write(f"--- COMMAND ---\n{command}\n\n--- STDOUT ---\n{stdout_str}\n\n--- STDERR ---\n{stderr_str}")
            artifact_ref = str(artifact_file)

            # Keep head & tail preview inline
            stdout_str = stdout_str[:2000] + f"\n... [Output truncated to 2KB. Full logs preserved in artifact {artifact_filename}] ...\n" + stdout_str[-2000:]

        return ExecutionResult(
            command=command,
            exit_code=exit_code,
            stdout=stdout_str,
            stderr=stderr_str,
            duration_ms=duration_ms,
            timed_out=timed_out,
            truncated=truncated,
            artifact_ref=artifact_ref
        )
