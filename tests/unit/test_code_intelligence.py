"""Unit tests for Code Intelligence (Parser, Symbols, Dependencies, Index, and Agentic RAG)."""

import tempfile
import pytest
from core.code_intelligence import (
    CodeParser,
    SymbolTable,
    DependencyGraph,
    AgenticRetriever,
)
from core.tools.filesystem import FilesystemTools


def test_code_parser_python():
    parser = CodeParser()
    py_code = '''
import os
from math import sqrt

class Calculator:
    """A simple math calculator."""
    def add(self, a: int, b: int) -> int:
        return a + b

def calculate_hypotenuse(a: int, b: int) -> float:
    return sqrt(a**2 + b**2)
'''
    res = parser.parse("calc.py", py_code)
    assert res.language == "python"
    assert "os" in res.imports
    assert "math.sqrt" in res.imports

    symbols_by_name = {s.name: s for s in res.symbols}
    assert "Calculator" in symbols_by_name
    assert symbols_by_name["Calculator"].symbol_type == "class"
    assert "A simple math calculator" in (symbols_by_name["Calculator"].docstring or "")

    assert "calculate_hypotenuse" in symbols_by_name
    assert "sqrt" in symbols_by_name["calculate_hypotenuse"].calls


def test_symbol_table():
    table = SymbolTable()
    parser = CodeParser()
    code = '''
def process_data(item):
    validate(item)
    return item

def validate(x):
    return True
'''
    res = parser.parse("data.py", code)
    table.index_file_parse(res)

    defs = table.find_definition("validate")
    assert len(defs) == 1
    assert defs[0].name == "validate"

    refs = table.find_references("validate")
    assert len(refs) == 1
    assert refs[0]["caller_symbol"] == "process_data"


@pytest.mark.asyncio
async def test_agentic_retriever():
    with tempfile.TemporaryDirectory() as tmpdir:
        fs = FilesystemTools(tmpdir)
        fs.write_file(
            "auth/service.py",
            "class AuthService:\n    def login(self, username, password):\n        return True\n",
        )
        fs.write_file(
            "billing/service.py",
            "class BillingService:\n    def charge(self, user_id, amount):\n        return 100\n",
        )

        retriever = AgenticRetriever(tmpdir)
        index_res = await retriever.index_workspace()
        assert index_res["status"] == "indexed"
        assert index_res["files_parsed"] >= 2

        evidence = await retriever.retrieve_evidence("AuthService login", top_k=2)
        assert len(evidence) > 0
        assert any("AuthService" in e.content for e in evidence)
