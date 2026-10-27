"""Integration tests for the FastAPI service endpoints."""

import pytest
from fastapi.testclient import TestClient
from services.api.main import app


@pytest.fixture
def client():
    return TestClient(app)


def test_api_health(client):
    res = client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert "NEMI-CODE 5.0" in data["system"]


def test_api_models(client):
    res = client.get("/api/agent/models")
    assert res.status_code == 200
    data = res.json()
    assert "BALANCED" in data["routing_profiles"]
    assert len(data["catalog"]) > 0


def test_api_workspace_files(client):
    res = client.get("/api/workspace/files?max_depth=2")
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert len(data["files"]) > 0


def test_api_memory_stats(client):
    res = client.get("/api/memory/stats")
    assert res.status_code == 200
    data = res.json()
    assert "episodic_count" in data


def test_api_run_agent_task(client):
    res = client.post(
        "/api/agent/run",
        json={"instruction": "Inspect health and return report", "routing_mode": "FAST"},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert data["status"] == "succeeded"
    assert "NEMI-CODE TASK REPORT" in data["response"]
