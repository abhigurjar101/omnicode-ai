"""Terminal Execution Tool for OMNICODE AI 5.0.

Provides risk-aware, sandboxed command execution with strict permission evaluation.
"""

from typing import Dict, Any, Optional
from core.runtime.sandbox import CommandSandbox, ExecutionResult
from core.runtime.permissions import SecurityPolicy, ActionRiskLevel


class TerminalTool:
    """Executes commands inside the sandboxed environment subject to policy checks."""

    def __init__(self, workspace_root: str, strict_mode: bool = False):
        self.workspace_root = workspace_root
        self.sandbox = CommandSandbox(workspace_root)
        self.policy = SecurityPolicy(workspace_root, strict_mode=strict_mode)

    async def execute(
        self,
        command: str,
        timeout_seconds: Optional[int] = None,
        bypass_approval_check: bool = False,
    ) -> Dict[str, Any]:
        """Assesses command risk and executes if authorized."""
        risk_level, requires_approval, rationale = self.policy.assess_command_risk(command)

        if requires_approval and not bypass_approval_check:
            return {
                "success": False,
                "blocked": True,
                "requires_approval": True,
                "risk_level": risk_level.value,
                "rationale": rationale,
                "command": command,
            }

        result: ExecutionResult = await self.sandbox.run_command(
            command=command,
            timeout_seconds=timeout_seconds,
        )

        return {
            "success": result.exit_code == 0,
            "exit_code": result.exit_code,
            "stdout": result.stdout,
            "stderr": result.stderr,
            "duration_ms": result.duration_ms,
            "timed_out": result.timed_out,
            "truncated": result.truncated,
            "artifact_ref": result.artifact_ref,
            "risk_level": risk_level.value,
        }
