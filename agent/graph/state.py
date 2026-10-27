"""Canonical LangGraph State definition for OMNICODE AI 2.0.

Provides typed state with Annotated reducers for appending histories,
merging context, managing task execution stages, tracking permissions,
budgets, and test verification outcomes.
"""

from typing import Annotated, Any, Dict, List, Optional
from typing_extensions import TypedDict
import operator
from pydantic import BaseModel, Field


def append_list(current: Optional[List[Any]], update: Optional[List[Any]]) -> List[Any]:
    """Reducer that appends items from update to current list."""
    current = current or []
    if not update:
        return current
    if isinstance(update, list):
        return current + update
    return current + [update]


def merge_dict(current: Optional[Dict[str, Any]], update: Optional[Dict[str, Any]]) -> Dict[str, Any]:
    """Reducer that merges dict updates into current dict."""
    res = dict(current or {})
    if update:
        res.update(update)
    return res


def replace_or_keep(current: Any, update: Any) -> Any:
    """Reducer that updates a field if non-None, else keeps current."""
    return update if update is not None else current


class PlanStep(BaseModel):
    step_id: int
    description: str
    status: str = "pending"  # pending, in_progress, completed, failed, skipped
    tool_hint: Optional[str] = None
    verification: Optional[str] = None


class ToolCallRecord(BaseModel):
    call_id: str
    tool_name: str
    arguments: Dict[str, Any] = Field(default_factory=dict)
    output_summary: str = ""
    artifact_ref: Optional[str] = None
    is_error: bool = False
    duration_ms: float = 0.0


class TestResultRecord(BaseModel):
    suite_name: str = "default"
    tests_run: int = 0
    passed: int = 0
    failed: int = 0
    errors: int = 0
    duration_seconds: float = 0.0
    failure_details: List[str] = Field(default_factory=list)
    raw_output_artifact_ref: Optional[str] = None


class ChangeRecord(BaseModel):
    file_path: str
    action: str  # create, modify, delete
    diff: str = ""
    staged: bool = False


class EvidenceItem(BaseModel):
    source_type: str  # rag, test, git, tool, memory
    title: str
    content: str
    file_path: Optional[str] = None
    line_range: Optional[str] = None
    relevance_score: float = 1.0


class OmnicodeState(TypedDict, total=False):
    """Canonical Unified Agent State for LangGraph StateGraph."""
    # Identity & Context
    user_id: str
    workspace_id: str
    conversation_id: str
    task_id: str
    thread_id: str

    # Instructions & Messages
    current_instruction: str
    message_history: Annotated[List[Dict[str, Any]], append_list]

    # Intent & Analysis
    task_intent: str
    task_complexity: str  # simple, moderate, complex
    repository_metadata: Annotated[Dict[str, Any], merge_dict]

    # Context & Memories
    retrieved_context: Annotated[List[Dict[str, Any]], append_list]
    relevant_memory_ids: Annotated[List[str], append_list]
    recalled_episodes: Annotated[List[Dict[str, Any]], append_list]
    recalled_semantic: Annotated[List[Dict[str, Any]], append_list]
    recalled_procedural: Annotated[List[Dict[str, Any]], append_list]

    # Planning & Lifecycle
    plan: List[Dict[str, Any]]
    current_step_index: int
    execution_status: str  # initialized, planning, retrieved, awaiting_approval, acting, verifying, healing, succeeded, failed, blocked

    # Provider & Model Selection
    routing_mode: str  # FAST, BALANCED, DEEP, BUDGET, LOCAL_ONLY
    selected_provider: str  # openai, anthropic, cursor, copilot, local, custom
    selected_model: str
    selected_tool: Optional[str]

    # Execution History & Artifacts
    tool_call_history: Annotated[List[Dict[str, Any]], append_list]
    changeset: Annotated[List[Dict[str, Any]], append_list]
    sandbox_reference: Optional[str]

    # Verification & Review
    test_results: Annotated[List[Dict[str, Any]], append_list]
    review_results: Annotated[Dict[str, Any], merge_dict]

    # Permissions & Human Approval
    permissions: Annotated[Dict[str, Any], merge_dict]
    approval_required: bool
    approval_granted: Optional[bool]
    approval_prompt: Optional[str]

    # Budgets & Controls
    token_budget: int
    tokens_used: int
    monetary_budget: float
    monetary_cost_spent: float
    retry_count: int
    max_retries: int

    # Evidence & Output
    evidence: Annotated[List[Dict[str, Any]], append_list]
    final_response: str
    error_message: Optional[str]
