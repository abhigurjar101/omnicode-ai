# OMNICODE AI 2.0 — Official Documentation & Integration References

This document records the official source specifications, SDK references, supported capabilities, integration levels, and technical constraints for all external systems integrated into OMNICODE AI 2.0.

---

## 1. LangGraph & LangChain

### Specifications & Sources
- **Official Documentation**: https://langchain-ai.github.io/langgraph/
- **StateGraph & TypedDict / Pydantic State**:
  - `langgraph.graph.StateGraph`
  - Reducer functions via `typing.Annotated` with `operator.add` or custom reducer callables.
- **Checkpointers & Persistence**:
  - `langgraph.checkpoint.sqlite.SqliteSaver` / `langgraph.checkpoint.sqlite.aio.AsyncSqliteSaver`
  - `langgraph.checkpoint.postgres.PostgresSaver`
  - Thread continuity via `config={"configurable": {"thread_id": "..."}}`
- **Human-in-the-Loop Interrupts**:
  - `interrupt()` function for pausing execution and requesting human approval/input.
  - Resumption via `Command(resume=...)`

### Integration Level: **Full Native Support**
- Used as the central single-agent orchestration engine across all stages.

---

## 2. Model Context Protocol (MCP)

### Specifications & Sources
- **Official Specification**: https://modelcontextprotocol.io/
- **MCP Python SDK**: `mcp` (v1.0+)
- **JSON-RPC 2.0 Protocol**:
  - Client-Server handshake (`initialize`, `notifications/initialized`)
  - Tool discovery (`tools/list`)
  - Tool execution (`tools/call`) with typed JSON Schema validation
  - Resource access (`resources/list`, `resources/read`)

### Integration Level: **Full Native Support**
- Built-in MCP client supporting STDIO and SSE transports for external tools.
- Internal MCP tool registry conforming to standard tool schemas (`inputSchema`, `name`, `description`).

---

## 3. OpenAI Models & Codex Execution

### Specifications & Sources
- **Official Documentation**: https://platform.openai.com/docs/api-reference
- **Official SDK**: `openai` (v1.30+)
- **Models**: `gpt-4o`, `gpt-4o-mini`, `o1`, `o3-mini`
- **Codex / Code Interpreter Capabilities**:
  - Historically the Codex standalone endpoint was superseded by GPT-4 family function calling and code execution backends.
  - Reproduces local isolated sandbox code execution conforming to OpenAI function calling / tool call standards.

### Integration Level: **Full Native Support**
- Structured tool calling, streaming responses, token budget estimation, sandboxed Python code execution.

---

## 4. Anthropic Claude & Claude Agent SDK

### Specifications & Sources
- **Official Documentation**: https://docs.anthropic.com/en/api/getting-started
- **Official SDK**: `anthropic` (v0.30+)
- **Models**: `claude-3-7-sonnet`, `claude-3-5-sonnet`, `claude-3-5-haiku`
- **Tool Use & Extended Thinking**:
  - Tool calling schemas via `tools=[{"name": ..., "description": ..., "input_schema": ...}]`
  - Extended thinking / reasoning tokens where enabled.

### Integration Level: **Full Native Support**
- Native adapter for tool use, terminal-oriented coding, and deep codebase reasoning.

---

## 5. Cursor Cloud Agents API

### Specifications & Sources
- **Reference**: https://cursor.com / Cursor Cloud Agent APIs (experimental / private beta interfaces)
- **Status & Limitations**:
  - Cursor's background agent features primarily run through proprietary Cursor editor services and invite-only cloud agent APIs.
  - When direct private cloud API credentials are not provided or supported, OMNICODE reproduces the Cursor workflow:
    - Deep repository symbol indexing
    - Multi-file contextual diff edits
    - Inline edit suggestions
    - Background autonomous patch generation

### Integration Level: **Supported (Adapter with Native Workflow Fallback)**

---

## 6. GitHub Copilot SDK & GitHub APIs

### Specifications & Sources
- **GitHub REST & GraphQL API**: https://docs.github.com/en/rest
- **GitHub Copilot Extensions & Chat API**: https://docs.github.com/en/copilot
- **Octokit / PyGithub**: `PyGithub` (v2.3+)
- **Workflows**:
  - Branch creation, commit generation, pull request preparation with structured markdown body.
  - Issue inspection and test workflow analysis.

### Integration Level: **Supported (GitHub API Native + Copilot Adapter)**

---

## 7. Local LLMs (Ollama / OpenAI-Compatible)

### Specifications & Sources
- **Ollama API Documentation**: https://github.com/ollama/ollama/blob/main/docs/api.md
- **Standard Endpoints**: `http://localhost:11434/api/generate`, `/api/chat`, `/api/embeddings`
- **OpenAI-compatible endpoints**: vllm, LM Studio, LocalAI

### Integration Level: **Full Native Support**
- Offline / local execution mode with BYOK (Bring Your Own Key) zero-cost operation.

---

## 8. Vector Databases & Hybrid Indexing (PostgreSQL pgvector / SQLite-vec)

### Specifications & Sources
- **pgvector**: https://github.com/pgvector/pgvector
- **BM25 Lexical Search**: `rank_bm25` (Python implementation of Okapi BM25)
- **AST Parsing**: Tree-sitter (`tree-sitter`, `tree-sitter-languages`) and Python AST for language-aware symbol extraction.

### Integration Level: **Full Native Support**
- Hybrid retrieval combines lexical scores + cosine similarity vector embeddings + symbol reference graph expansion.

---

## 9. Pinned Dependency Versions

| Component | Package | Tested Version |
| :--- | :--- | :--- |
| Agent Orchestration | `langgraph` | `>=0.2.20` |
| Agent Foundations | `langchain-core` | `>=0.3.0` |
| Validation & Schemas | `pydantic` | `>=2.8.0` |
| API Server | `fastapi` | `>=0.112.0` |
| ASGI Server | `uvicorn` | `>=0.30.0` |
| Database & ORM | `sqlalchemy` | `>=2.0.30` |
| Checkpointing | `aiosqlite` / `sqlite3` | Built-in / `>=0.20.0` |
| Model Integrations | `openai`, `anthropic`, `httpx` | Latest stable |
| Cryptography (Vault) | `cryptography` | `>=43.0.0` |
| Lexical Retrieval | `rank-bm25` | `>=0.2.2` |
| AST / Parsing | `tree-sitter` (or native AST) | Python 3.11 compatible |
