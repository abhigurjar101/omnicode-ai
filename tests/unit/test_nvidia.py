"""Unit tests for NVIDIA AI inference client, model registry, embeddings, and reranker."""

import pytest
from core.nvidia import (
    NvidiaClient,
    NvidiaModelRegistry,
    NvidiaEmbeddings,
    NvidiaReranker,
    RoutingMode,
    ModelCapability,
)


@pytest.mark.asyncio
async def test_nvidia_client_deterministic_fallback():
    client = NvidiaClient(api_key="")
    messages = [{"role": "user", "content": "Create a plan for adding a health endpoint"}]
    result = await client.generate_completion(messages, mode=RoutingMode.FAST)
    assert result is not None
    assert result.content != ""
    assert "plan" in result.content.lower() or "step" in result.content.lower()
    assert result.tokens_in > 0
    assert result.tokens_out > 0


@pytest.mark.asyncio
async def test_nvidia_client_review_simplification():
    client = NvidiaClient(api_key="")
    messages = [{"role": "user", "content": "Review and simplify this code: def add(a, b): return a + b\nRespond with APPROVED."}]
    result = await client.generate_completion(messages, mode=RoutingMode.BALANCED)
    assert result is not None
    assert len(result.content) > 0


def test_nvidia_model_registry_selection():
    registry = NvidiaModelRegistry()
    fast_model = registry.select_model(mode=RoutingMode.FAST)
    assert fast_model == "meta/llama-3.1-8b-instruct"

    deep_model = registry.select_model(mode=RoutingMode.DEEP)
    assert deep_model == "deepseek-ai/deepseek-r1"

    balanced_model = registry.select_model(mode=RoutingMode.BALANCED)
    assert balanced_model == "meta/llama-3.3-70b-instruct"


def test_nvidia_model_registry_usage_accounting():
    registry = NvidiaModelRegistry()
    registry.record_usage("meta/llama-3.3-70b-instruct", tokens_in=1000, tokens_out=500, latency_ms=120.0)
    summary = registry.get_usage_summary()
    assert summary["total_calls"] == 1
    assert summary["total_tokens_in"] == 1000
    assert summary["total_tokens_out"] == 500
    assert summary["total_cost_usd"] > 0.0


@pytest.mark.asyncio
async def test_nvidia_embeddings_and_cosine():
    embeddings = NvidiaEmbeddings(client=NvidiaClient(api_key=""))
    vectors = await embeddings.embed_documents(["hello world", "goodbye world"])
    assert len(vectors) == 2
    assert len(vectors[0]) in (128, 2048)
    sim = embeddings.cosine_similarity(vectors[0], vectors[0])
    assert pytest.approx(sim, 0.01) == 1.0


@pytest.mark.asyncio
async def test_nvidia_reranker():
    reranker = NvidiaReranker()
    docs = [
        {"content": "def calculate_tax(): pass"},
        {"content": "def authenticate_user(): return True"},
        {"content": "def calculate_discount(): pass"},
    ]
    results = await reranker.rerank("authenticate", docs, top_k=2)
    assert len(results) == 2
    assert "authenticate_user" in results[0]["content"]
