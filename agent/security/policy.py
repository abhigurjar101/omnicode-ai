"""Security Policy and Permission Engine for OMNICODE AI 2.0.

Classifies tool operations, checks workspace boundaries, prevents directory traversal,
and enforces human approval gates for destructive or production-affecting actions.
"""

from enum import Enum
from typing import Dict, Any, Tuple
from pathlib import Path


class ActionRiskLevel(str, Enum):
    READ_ONLY = "read_only"
    SAFE_WRITE = "safe_write"
    NETWORK_ACCESS = "network_access"
    DESTRUCTIVE = "destructive"
    PRODUCTION_DEPLOY = "production_deploy"


class SecurityPolicy:
    """Evaluates whether an action requires explicit human approval."""

    DESTRUCTIVE_COMMANDS = {
        "rm", "rmdir", "mkfs", "dd", "shutdown", "reboot",
        "drop", "truncate", "kill", "pkill", "chmod -R 777",
        "git push -f", "git push --force", "git reset --hard"
    }

    DEPLOYMENT_KEYWORDS = {
        "deploy", "publish", "release", "prod", "production",
        "kubectl apply", "docker push", "terraform apply"
    }

    def __init__(self, workspace_root: str, strict_mode: bool = False):
        self.workspace_root = Path(workspace_root).resolve()
        self.strict_mode = strict_mode

    def validate_path_safety(self, target_path: str) -> Tuple[bool, str]:
        """Validates that a path is strictly inside the authorized workspace root."""
        try:
            full_path = Path(target_path)
            if not full_path.is_absolute():
                full_path = (self.workspace_root / full_path).resolve()
            else:
                full_path = full_path.resolve()

            # Check if within workspace_root
            if self.workspace_root == full_path or self.workspace_root in full_path.parents:
                return True, str(full_path)
            return False, f"Path escape attempt rejected: {target_path} is outside workspace root {self.workspace_root}"
        except Exception as e:
            return False, f"Invalid path syntax: {e}"

    def assess_command_risk(self, command: str) -> Tuple[ActionRiskLevel, bool, str]:
        """Assesses command risk and determines if human approval is required.
        
        Returns:
            (ActionRiskLevel, requires_approval, rationale)
        """
        cmd_lower = command.lower().strip()

        # Check for destructive commands
        for bad in self.DESTRUCTIVE_COMMANDS:
            if bad in cmd_lower:
                return (
                    ActionRiskLevel.DESTRUCTIVE,
                    True,
                    f"Command contains destructive keyword '{bad}' requiring human authorization."
                )

        # Check for deployment keywords
        for dep in self.DEPLOYMENT_KEYWORDS:
            if dep in cmd_lower:
                return (
                    ActionRiskLevel.PRODUCTION_DEPLOY,
                    True,
                    f"Command references production or deployment action '{dep}'."
                )

        # Common read-only commands
        if any(cmd_lower.startswith(r) for r in ["ls", "cat", "find", "grep", "git status", "git log", "git diff", "pwd"]):
            return (ActionRiskLevel.READ_ONLY, False, "Read-only inspection command.")

        # Build / Test / Lint commands
        if any(cmd_lower.startswith(c) for c in ["pytest", "npm test", "pnpm test", "python -m pytest", "cargo test", "npm run build", "ruff", "flake8"]):
            return (ActionRiskLevel.SAFE_WRITE, False, "Automated test or build verification command.")

        # Network install commands
        if any(cmd_lower.startswith(pkg) for pkg in ["pip install", "npm install", "pnpm add", "cargo add", "curl", "wget"]):
            if self.strict_mode:
                return (ActionRiskLevel.NETWORK_ACCESS, True, "Package installation or external network access in strict mode.")
            return (ActionRiskLevel.NETWORK_ACCESS, False, "Package dependency installation.")

        # Default modification command
        if self.strict_mode:
            return (ActionRiskLevel.SAFE_WRITE, True, "Strict mode requires approval for modification.")
        return (ActionRiskLevel.SAFE_WRITE, False, "Workspace internal execution.")

    def assess_tool_call(self, tool_name: str, arguments: Dict[str, Any]) -> Tuple[ActionRiskLevel, bool, str]:
        """Assesses risk for any registered tool call."""
        if tool_name in ["read_file", "list_files", "grep_search", "git_status", "git_diff", "search_symbols"]:
            return (ActionRiskLevel.READ_ONLY, False, "Read-only inspection.")

        if tool_name in ["write_file", "edit_file", "create_branch", "git_commit"]:
            path = arguments.get("path") or arguments.get("file_path", "")
            if path:
                is_safe, resolved = self.validate_path_safety(path)
                if not is_safe:
                    return (ActionRiskLevel.DESTRUCTIVE, True, resolved)
            return (ActionRiskLevel.SAFE_WRITE, False, "Standard workspace file modification.")

        if tool_name == "run_terminal_command":
            cmd = arguments.get("command", "")
            return self.assess_command_risk(cmd)

        if tool_name in ["delete_file", "git_reset", "git_push"]:
            return (ActionRiskLevel.DESTRUCTIVE, True, f"Operation '{tool_name}' may delete or publish code.")

        return (ActionRiskLevel.SAFE_WRITE, False, "Tool call allowed under default policy.")
