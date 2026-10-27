"""Tool and Patch Executor for OMNICODE AI 5.0.

Dispatches tool calls, applies filesystem edits, executes terminal commands,
and tracks changesets and execution history in agent state.
"""

import time
from typing import Dict, Any, List, Optional
from core.tools.filesystem import FilesystemTools
from core.tools.terminal import TerminalTool
from core.tools.git import GitTools
from core.tools.mcp import MCPToolRegistry


class AgentExecutor:
    """Executes planned actions using secure tools."""

    def __init__(self, workspace_root: str):
        self.workspace_root = workspace_root
        self.fs = FilesystemTools(workspace_root)
        self.terminal = TerminalTool(workspace_root)
        self.git = GitTools(workspace_root)
        self.mcp = MCPToolRegistry()
        self._register_default_tools()

    def _register_default_tools(self) -> None:
        """Registers all built-in tools into MCP-compatible registry."""
        self.mcp.register_tool(
            name="read_file",
            description="Reads file contents with optional line range",
            parameters={
                "properties": {
                    "file_path": {"type": "string"},
                    "start_line": {"type": "integer"},
                    "end_line": {"type": "integer"},
                },
                "required": ["file_path"],
            },
            handler=self.fs.read_file,
        )
        self.mcp.register_tool(
            name="write_file",
            description="Writes new content to a file",
            parameters={
                "properties": {
                    "file_path": {"type": "string"},
                    "content": {"type": "string"},
                    "overwrite": {"type": "boolean"},
                },
                "required": ["file_path", "content"],
            },
            handler=self.fs.write_file,
        )
        self.mcp.register_tool(
            name="edit_file",
            description="Performs exact atomic search-and-replace on a file",
            parameters={
                "properties": {
                    "file_path": {"type": "string"},
                    "target_snippet": {"type": "string"},
                    "replacement_snippet": {"type": "string"},
                },
                "required": ["file_path", "target_snippet", "replacement_snippet"],
            },
            handler=self.fs.edit_file,
        )
        self.mcp.register_tool(
            name="run_terminal_command",
            description="Executes a command inside the workspace sandbox",
            parameters={
                "properties": {
                    "command": {"type": "string"},
                    "timeout_seconds": {"type": "integer"},
                },
                "required": ["command"],
            },
            handler=self.terminal.execute,
        )

    async def execute_tool_call(self, tool_name: str, arguments: Dict[str, Any]) -> Dict[str, Any]:
        """Dispatches a single tool call with timing and logging."""
        start = time.time()
        res = await self.mcp.call_tool(tool_name, arguments)
        duration_ms = (time.time() - start) * 1000

        return {
            "tool_name": tool_name,
            "arguments": arguments,
            "output": res.get("structured", {}),
            "is_error": res.get("isError", False),
            "duration_ms": duration_ms,
        }
