"""Minimal Implementation Planner for OMNICODE AI 5.0.

Formulates concise, verified execution plans conforming to KISS and YAGNI.
Generates explicit acceptance criteria and step-by-step tasks.
"""

from typing import Dict, Any, List, Optional
from core.nvidia.client import NvidiaClient
from core.nvidia.capabilities import RoutingMode


class AgentPlanner:
    """Creates minimal sufficient task plans and acceptance criteria."""

    def __init__(self, nvidia_client: Optional[NvidiaClient] = None):
        self.nvidia = nvidia_client or NvidiaClient()

    async def create_plan(
        self,
        task_objective: str,
        retrieved_evidence: List[Dict[str, Any]],
        recalled_memories: List[Dict[str, Any]],
        routing_mode: RoutingMode = RoutingMode.BALANCED,
    ) -> Dict[str, Any]:
        """Formulates acceptance criteria and minimal step plan."""
        evidence_summary = "\n".join(
            f"- {e.get('file_path')}:{e.get('start_line', 1)} ({e.get('symbol_name', 'code')})"
            for e in retrieved_evidence[:5]
        )
        memory_summary = "\n".join(
            f"- Lesson: {m.get('lesson_learned', '')}"
            for m in recalled_memories[:2]
        )

        prompt = f"""Task Objective: {task_objective}

Evidence Found in Repository:
{evidence_summary or 'No specific files indexed yet.'}

Relevant Past Experiences:
{memory_summary or 'No prior identical episodes found.'}

Create a minimal implementation plan adhering strictly to KISS, DRY, and YAGNI:
1. Identify acceptance criteria.
2. Outline 3 to 5 minimal essential steps.
3. Keep changes focused with zero unnecessary wrappers or abstractions."""

        messages = [
            {"role": "system", "content": "You are OMNICODE AI 5.0's minimal planner. Generate concise plans."},
            {"role": "user", "content": prompt},
        ]

        result = await self.nvidia.generate_completion(messages, mode=routing_mode)

        # Build structured step list
        default_steps = [
            {"step_id": 1, "description": f"Analyze requirements: {task_objective[:80]}", "tool_hint": "read_file"},
            {"step_id": 2, "description": "Formulate and apply minimum sufficient patch", "tool_hint": "edit_file"},
            {"step_id": 3, "description": "Execute automated verification tests", "tool_hint": "run_tests"},
            {"step_id": 4, "description": "Review code against KISS/DRY and simplify", "tool_hint": "simplify_code"},
        ]

        return {
            "summary": result.content[:300],
            "acceptance_criteria": [
                "Requirements fully addressed with passing automated tests",
                "No critical security vulnerabilities or credential leaks",
                "Zero unnecessary wrappers or dead code",
            ],
            "steps": default_steps,
        }
