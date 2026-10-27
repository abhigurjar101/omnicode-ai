# OMNICODE AI 5.0 — Permanent Coding Standards Engine

This document establishes the permanent coding principles enforced by OMNICODE AI 5.0.

---

## 1. Core Engineering Principles

### 1.1 KISS — Keep It Simple
- Always prefer the least complicated implementation that meets requirements.
- Avoid unnecessary classes and single-use wrapper layers.
- Avoid deeply nested conditionals; use early guard clauses.
- Prefer understandable control flow over clever metaprogramming tricks.
- If a problem can be solved in 20 lines of clear standard code, never build a 100-line multi-class framework.

### 1.2 DRY — Don't Repeat Yourself
- Eliminate genuinely duplicated knowledge and business rules.
- Extract reusable functions only when meaningful duplication exists across multiple call sites.
- Avoid creating complex speculative abstractions merely because two short pieces of code share similar syntax.
- **Rule**: *A small amount of clear duplication is preferable to a premature, misleading abstraction.*

### 1.3 YAGNI — You Aren't Gonna Need It
- Implement only what the current task objective requires.
- Never generate speculative future configuration systems, placeholder tables, or unrequested plugin frameworks.
- Build the smallest complete useful feature.

### 1.4 SOLID Principles
- **Single Responsibility**: Each module, class, and function has one cohesive purpose.
- **Open/Closed**: Prefer simple extension points where genuine variation exists.
- **Liskov Substitution**: Subtypes must honor behavioral guarantees of their interfaces.
- **Interface Segregation**: Keep contracts narrow and focused.
- **Dependency Inversion**: Depend on stable abstractions at system boundaries.

### 1.5 Minimum Sufficient Patch Principle
When fixing bugs in an existing repository:
1. Locate root cause using AST analysis and test failures.
2. Develop a focused fix modifying the minimum necessary code.
3. Add a targeted regression test.
4. Run verification and avoid unrelated cleanup.
5. A safe, readable 15-line fix is far superior to a fragile 2-line hack.

---

## 2. Python Standards (PEP 8 & Modern Python 3.11+)

- Use descriptive snake_case identifiers.
- Type hints are required on all public interfaces and data contracts.
- Use `Pydantic` v2 or `dataclasses` for structured inputs/outputs.
- Use context managers (`with`) for file and database resources.
- Avoid bare `except:`; catch specific exceptions. Never silently swallow exceptions with `pass`.
- Never use mutable default arguments (`def func(items=[])`).
- Keep async operations explicit; use `asyncio` for I/O concurrency only.

---

## 3. TypeScript & React Standards

- Enable TypeScript `strict` mode with zero `any`.
- Use accurate interfaces and discriminated unions.
- In React/Next.js: Keep components small and focused. Derive state values rather than duplicating state.
- Keep credentials on the server side. Never expose API keys to browser client bundles.

---

## 4. Test-Driven Development (TDD) Workflow

1. **RED**: Write a failing unit test that reproduces the bug or validates acceptance criteria.
2. **GREEN**: Implement the minimal sufficient patch to pass the test.
3. **REFACTOR**: Simplify code using KISS principles while keeping tests passing.
4. **VERIFY**: Run full test suite, linting, and security audits before completion.
