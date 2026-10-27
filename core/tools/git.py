"""Git Version Control Tools for OMNICODE AI 5.0.

Provides workspace-bounded git inspections, diff generation, branch creation,
and atomic commit workflows.
"""

from pathlib import Path
from typing import Dict, Any, Optional
from core.runtime.sandbox import CommandSandbox


class GitTools:
    """Manages git operations safely through the sandboxed runner."""

    def __init__(self, workspace_root: str):
        self.workspace_root = Path(workspace_root).resolve()
        self.sandbox = CommandSandbox(str(self.workspace_root))

    async def status(self) -> Dict[str, Any]:
        """Returns the current git repository status."""
        res = await self.sandbox.run_command("git status --short")
        if res.exit_code != 0:
            return {"error": res.stderr, "success": False}

        lines = [line.strip() for line in res.stdout.splitlines() if line.strip()]
        staged = [l for l in lines if l.startswith(("M ", "A ", "D ", "R "))]
        unstaged = [l for l in lines if l.startswith((" M", " D", "??"))]

        return {
            "success": True,
            "clean": len(lines) == 0,
            "total_changes": len(lines),
            "staged": staged,
            "unstaged": unstaged,
            "raw_output": res.stdout,
        }

    async def diff(self, staged: bool = False, file_path: Optional[str] = None) -> Dict[str, Any]:
        """Returns git diff for the workspace or a specific file."""
        cmd = "git diff --staged" if staged else "git diff"
        if file_path:
            cmd += f" -- {file_path}"

        res = await self.sandbox.run_command(cmd)
        if res.exit_code != 0:
            return {"error": res.stderr, "success": False}

        return {
            "success": True,
            "staged": staged,
            "diff": res.stdout,
            "is_empty": len(res.stdout.strip()) == 0,
        }

    async def stage(self, file_path: str = ".") -> Dict[str, Any]:
        """Stages files for commit."""
        res = await self.sandbox.run_command(f"git add {file_path}")
        return {
            "success": res.exit_code == 0,
            "error": res.stderr if res.exit_code != 0 else None,
        }

    async def commit(self, message: str) -> Dict[str, Any]:
        """Commits currently staged changes with a descriptive message."""
        escaped_msg = message.replace('"', '\\"')
        res = await self.sandbox.run_command(f'git commit -m "{escaped_msg}"')
        return {
            "success": res.exit_code == 0,
            "output": res.stdout if res.exit_code == 0 else res.stderr,
            "error": res.stderr if res.exit_code != 0 else None,
        }

    async def create_branch(self, branch_name: str) -> Dict[str, Any]:
        """Creates and checks out a new git branch."""
        res = await self.sandbox.run_command(f"git checkout -b {branch_name}")
        return {
            "success": res.exit_code == 0,
            "output": res.stdout or res.stderr,
            "error": res.stderr if res.exit_code != 0 else None,
        }
