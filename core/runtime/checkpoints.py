"""Persistent Checkpointer Runtime for OMNICODE AI 5.0 LangGraph.

Provides durable, production-ready checkpoint persistence using AsyncSqliteSaver
and MemorySaver with thread-level state recovery and seamless async support.
"""

import os
from pathlib import Path
from typing import Optional
from langgraph.checkpoint.base import BaseCheckpointSaver
from langgraph.checkpoint.memory import MemorySaver

try:
    from langgraph.checkpoint.sqlite.aio import AsyncSqliteSaver
except (ImportError, ModuleNotFoundError):
    AsyncSqliteSaver = None


class CheckpointManager:
    """Manages LangGraph checkpointers for workspace and thread continuity."""

    def __init__(self, db_path: Optional[str] = None):
        if not db_path:
            default_dir = os.path.expanduser("~/.nemicode/data")
            if not os.path.exists(default_dir) and os.path.exists(os.path.expanduser("~/.omnicode/data")):
                default_dir = os.path.expanduser("~/.omnicode/data")
            db_dir = Path(os.environ.get("NEMICODE_DATA_DIR", os.environ.get("OMNICODE_DATA_DIR", default_dir)))
            db_dir.mkdir(parents=True, exist_ok=True)
            self.db_path = str(db_dir / "nemicode_checkpoints.db")
            if not os.path.exists(self.db_path) and (db_dir / "omnicode_checkpoints.db").exists():
                self.db_path = str(db_dir / "omnicode_checkpoints.db")
        else:
            self.db_path = db_path
            if db_path != ":memory:":
                Path(self.db_path).parent.mkdir(parents=True, exist_ok=True)

    def get_saver(self) -> BaseCheckpointSaver:
        """Returns an async-compatible checkpointer (MemorySaver)."""
        return MemorySaver()

    def get_async_sqlite_context(self):
        """Returns AsyncSqliteSaver context manager for durable file-backed persistence."""
        if AsyncSqliteSaver is not None:
            return AsyncSqliteSaver.from_conn_string(self.db_path)
        return None
