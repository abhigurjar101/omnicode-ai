# OmniCode AI

A Python and TypeScript coding-agent project by **Abhi Kumar Gurjar**. It combines a LangGraph controller, repository retrieval, code-editing tools, test/quality checks, SQLite-backed memory, a FastAPI service, CLI commands and a Next.js/Monaco workspace.

**[Source code](https://github.com/abhigurjar101/omnicode-ai)** · **[Linked frontend preview](https://web-azure-psi-54.vercel.app)** · [Architecture](docs/ARCHITECTURE.md) · [Publication scope](PUBLICATION.md)

![Checks](https://github.com/abhigurjar101/omnicode-ai/actions/workflows/checks.yml/badge.svg)

The original application uses both OmniCode AI and NEMI-CODE names. Internal imports, environment aliases and API response labels are preserved for compatibility. This project is separate from my NEMI GraphRAG desktop assistant.

## What is implemented

- A unified graph controller covering understanding, recall, retrieval, planning, model selection, execution, testing, review, simplification, learning and reporting.
- Repository intelligence modules for symbols, lexical retrieval, embeddings and reranking, with deterministic fallback behavior when hosted inference is not configured.
- Filesystem, terminal and Git tools; command timeouts, path checks and a permissions policy.
- Memory modules for working state, semantic knowledge, coding episodes and procedural methods, with SQLite-backed persistence for implemented stores.
- Code-quality checks, a simplifier, static security checks and test-result reporting.
- FastAPI routes, a Click CLI, and a Next.js web workspace with Monaco editor components and task/output panels.
- Internal benchmark examples and evaluation fixtures. Their existence does not establish general autonomous coding performance or superiority to commercial agents.

## Architecture

```text
Next.js / Monaco workspace or CLI
                 |
             FastAPI
                 |
       LangGraph controller
        /       |        \
 retrieval    tools     memory
 AST/BM25   files/Git   SQLite
 embeddings terminal   lessons
        \       |        /
           test + review
                 |
             task report
```

## Python setup

```bash
git clone https://github.com/abhigurjar101/omnicode-ai.git
cd omnicode-ai
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

The template contains no key. Leave `NVIDIA_API_KEY` blank for deterministic fallback behavior. For hosted inference, configure your own account, a supported model/routing configuration and the endpoint. Hosted calls send task/code context to the configured provider and may incur charges. Model availability and pricing are not guaranteed by this repository.

Use project-local state directories when experimenting:

```bash
export OMNICODE_DATA_DIR="$PWD/.local-data"
export NEMICODE_DATA_DIR="$PWD/.local-data"
export OMNICODE_VAULT_DIR="$PWD/.local-vault"
export NEMICODE_VAULT_DIR="$PWD/.local-vault"
python cli/main.py models
python cli/main.py --help
```

The backend loads `.env`; export settings explicitly for CLI runs when needed. Work on a disposable repository copy before invoking a coding task.

## Run the service and workspace

```bash
# Terminal 1, from repository root:
uvicorn services.api.main:app --host 127.0.0.1 --port 8000

# Terminal 2:
cd apps/web
npm ci
npm run dev
```

API docs: `http://127.0.0.1:8000/docs`. Web workspace: `http://localhost:3000`. Inspect `apps/web` configuration and API routes when pointing the frontend at a separate backend. The linked Vercel URL is a frontend preview; it is not evidence that every local agent/backend feature operates there.

## Verification

```bash
python -m pytest tests/unit tests/integration -q
cd apps/web
npm run build
```

During publication, **32 unit/integration tests passed**, and the main Next.js frontend production build passed. CI runs those checks with empty model credentials and temporary/local state paths. The evaluation folder and browser automation are included as source but were not part of that passing test count.

Some internal “benchmark” tests apply a known fix themselves before verifying it. Such tests validate components rather than measuring a model's independent repair ability. Competitor profiles in `core/benchmarks/comparisons.py` are historical reference examples, not current verified comparisons. No SWE-bench score, competitor advantage, live inference performance or production-readiness result is claimed here.

## Execution and security boundary

Commands execute as local subprocesses. Timeouts, a credential-name denylist and working-directory checks do **not** provide container/VM isolation, prevent every network request or guarantee protection from untrusted code. The API includes file/command operations and permissive development CORS; keep it local and do not expose it as a multi-user service without authentication and stronger isolation. See [Security boundary](docs/SECURITY.md).

## Repository map

| Path | Contents |
|---|---|
| `core/agent/` | Controller, planner, state, executor, router and verifier |
| `core/code_intelligence/` | Parsing, symbols, indexes and retrieval |
| `core/memory/` | Working, semantic, episodic and procedural modules |
| `core/nvidia/` | Provider client, routing registry, embeddings and reranking |
| `core/runtime/`, `core/tools/` | Execution policy and workspace tools |
| `core/quality/`, `core/improvement/` | Static checks, simplification and recorded learning workflows |
| `services/api/` | FastAPI service |
| `cli/` | Command-line interface |
| `apps/web/` | Main Next.js frontend |
| `tests/` | Unit, integration, evaluation and browser test sources |
| `solutions/`, `my-app/`, `demo/`, `agent/` | Original examples and alternate/compatibility modules |
| `docs/`, `REFERENCES.md` | Design and implementation notes |

Local keys, environment files, memory databases, generated builds and installed dependencies are excluded. Existing third-party notices are retained; this publication does not add a license grant for third-party assets.

[LinkedIn](https://www.linkedin.com/in/abhigurjar) · [GitHub profile](https://github.com/abhigurjar101)
