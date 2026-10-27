"""Unit tests for core tools (filesystem, terminal, git, mcp) and runtime security."""

import os
import tempfile
import pytest
from core.tools import FilesystemTools, TerminalTool, GitTools, MCPToolRegistry
from core.runtime import CommandSandbox, SecurityPolicy, ActionRiskLevel, CheckpointManager


def test_filesystem_read_write_edit():
    with tempfile.TemporaryDirectory() as tmpdir:
        fs = FilesystemTools(tmpdir)

        # Write
        res_write = fs.write_file("src/hello.py", "def greet():\n    return 'hello'\n")
        assert res_write["success"] is True

        # Read
        res_read = fs.read_file("src/hello.py")
        assert res_read["success"] is True
        assert "def greet():" in res_read["content"]

        # Edit
        res_edit = fs.edit_file("src/hello.py", "return 'hello'", "return 'hello world'")
        assert res_edit["success"] is True

        # Verify edited content
        res_read_after = fs.read_file("src/hello.py")
        assert "return 'hello world'" in res_read_after["content"]

        # List files
        res_list = fs.list_files()
        assert res_list["success"] is True
        assert "src/hello.py" in res_list["files"]

        # Grep search
        res_grep = fs.grep_search("greet")
        assert res_grep["success"] is True
        assert len(res_grep["matches"]) > 0


def test_filesystem_path_escape_blocked():
    with tempfile.TemporaryDirectory() as tmpdir:
        fs = FilesystemTools(tmpdir)
        with pytest.raises(PermissionError):
            fs.read_file("/etc/passwd")


@pytest.mark.asyncio
async def test_terminal_tool_and_sandbox():
    with tempfile.TemporaryDirectory() as tmpdir:
        terminal = TerminalTool(tmpdir)
        res = await terminal.execute("echo 'nemicode_test'")
        assert res["success"] is True
        assert "nemicode_test" in res["stdout"]


def test_security_policy_classification():
    policy = SecurityPolicy("/tmp")
    risk, approval, _ = policy.assess_command_risk("rm -rf /")
    assert risk == ActionRiskLevel.DESTRUCTIVE
    assert approval is True

    risk_ro, approval_ro, _ = policy.assess_command_risk("ls -la")
    assert risk_ro == ActionRiskLevel.READ_ONLY
    assert approval_ro is False


@pytest.mark.asyncio
async def test_mcp_registry():
    registry = MCPToolRegistry()

    def add_numbers(a: int, b: int) -> int:
        return a + b

    registry.register_tool(
        name="add",
        description="Add two numbers",
        parameters={
            "properties": {"a": {"type": "integer"}, "b": {"type": "integer"}},
            "required": ["a", "b"],
        },
        handler=add_numbers,
    )

    tools = registry.list_tools()
    assert len(tools) == 1
    assert tools[0]["name"] == "add"

    call_result = await registry.call_tool("add", {"a": 10, "b": 20})
    assert call_result["isError"] is False
    assert call_result["structured"] == {"output": 30}


def test_checkpoint_manager():
    with tempfile.TemporaryDirectory() as tmpdir:
        db_file = os.path.join(tmpdir, "checkpoints.db")
        cm = CheckpointManager(db_file)
        saver = cm.get_saver()
        assert saver is not None
