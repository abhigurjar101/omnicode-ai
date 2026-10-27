"""Integration tests for the Single Unified LangGraph Agent Controller."""

import tempfile
import pytest
from langgraph.checkpoint.memory import MemorySaver

from core.agent import OmnicodeAgentController
from core.memory import UnifiedMemoryManager
from core.nvidia import NvidiaClient
from core.tools.filesystem import FilesystemTools


@pytest.mark.asyncio
async def test_agent_end_to_end_workflow():
    with tempfile.TemporaryDirectory() as tmpdir:
        # Create minimal repository file
        fs = FilesystemTools(tmpdir)
        fs.write_file("main.py", "def health():\n    return {'status': 'healthy'}\n")

        saver = MemorySaver()
        mem_mgr = UnifiedMemoryManager(f"{tmpdir}/test_memory.db")
        client = NvidiaClient()

        agent = OmnicodeAgentController(
            workspace_root=tmpdir,
            memory_manager=mem_mgr,
            nvidia_client=client,
            checkpointer=saver,
        )

        final_state = await agent.run(
            instruction="Inspect main.py and verify health endpoint",
            thread_id="test_thread_001",
            routing_mode="BALANCED",
        )

        assert final_state["execution_status"] == "succeeded"
        assert final_state["selected_provider"] == "nvidia"
        assert "llama-3.3-70b-instruct" in final_state["selected_model"]
        assert len(final_state["plan"]) > 0
        assert final_state["consolidated_memory_id"] is not None
        assert "NEMI-CODE TASK REPORT" in final_state["final_response"]

        # Check that episodic memory was stored
        episodes = mem_mgr.episodic.list_all()
        assert len(episodes) >= 1
        assert "health" in episodes[0].task_objective.lower()
