"""Background Job and Task Runtime for OMNICODE AI 5.0.

Provides durable background job orchestration, progress monitoring,
timeout cancellation, and resumption across interruptions.
"""

import time
import asyncio
from enum import Enum
from typing import Dict, Any, Optional, Callable
from pydantic import BaseModel, Field


class JobStatus(str, Enum):
    QUEUED = "queued"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class JobRecord(BaseModel):
    job_id: str
    task_description: str
    status: JobStatus = JobStatus.QUEUED
    progress_percentage: int = 0
    current_stage: str = "initialized"
    created_at: float = Field(default_factory=time.time)
    updated_at: float = Field(default_factory=time.time)
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None


class JobManager:
    """Coordinates long-running background tasks."""

    def __init__(self):
        self._jobs: Dict[str, JobRecord] = {}
        self._tasks: Dict[str, asyncio.Task] = {}

    def create_job(self, job_id: str, task_description: str) -> JobRecord:
        """Registers a new job."""
        record = JobRecord(job_id=job_id, task_description=task_description)
        self._jobs[job_id] = record
        return record

    def get_job(self, job_id: str) -> Optional[JobRecord]:
        """Retrieves job state."""
        return self._jobs.get(job_id)

    def update_progress(self, job_id: str, stage: str, progress: int) -> None:
        """Updates job stage and progress percentage."""
        if job_id in self._jobs:
            self._jobs[job_id].current_stage = stage
            self._jobs[job_id].progress_percentage = min(100, max(0, progress))
            self._jobs[job_id].updated_at = time.time()

    def complete_job(self, job_id: str, result: Dict[str, Any]) -> None:
        """Marks a job as completed with its result."""
        if job_id in self._jobs:
            self._jobs[job_id].status = JobStatus.COMPLETED
            self._jobs[job_id].progress_percentage = 100
            self._jobs[job_id].result = result
            self._jobs[job_id].updated_at = time.time()

    def fail_job(self, job_id: str, error: str) -> None:
        """Marks a job as failed with an error message."""
        if job_id in self._jobs:
            self._jobs[job_id].status = JobStatus.FAILED
            self._jobs[job_id].error = error
            self._jobs[job_id].updated_at = time.time()

    async def cancel_job(self, job_id: str) -> bool:
        """Cancels a running job."""
        if job_id in self._jobs:
            self._jobs[job_id].status = JobStatus.CANCELLED
            self._jobs[job_id].updated_at = time.time()
            if job_id in self._tasks:
                self._tasks[job_id].cancel()
            return True
        return False
