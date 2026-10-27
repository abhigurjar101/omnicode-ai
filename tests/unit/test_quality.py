"""Unit tests for Code Quality, Simplifier, Security, and Quality Scorecard."""

import pytest
from core.quality import (
    CodingStandardsEngine,
    CodeSimplifier,
    SecurityAuditor,
    QualityGateEngine,
    TestRunResult,
    SecurityScanResult,
    SecurityIssue,
)


def test_coding_standards_violations():
    engine = CodingStandardsEngine()
    bad_code = '''
def process(items=[]):  # Mutable default
    try:
        x = 1
    except:  # Bare except
        pass  # Silent swallowing
'''
    res = engine.review_python_code(bad_code)
    assert res.passed is False
    assert res.overall_score < 10.0
    rules = [v.rule for v in res.violations]
    assert "NO_MUTABLE_DEFAULT_ARG" in rules
    assert "NO_BARE_EXCEPT" in rules


def test_code_simplifier():
    simplifier = CodeSimplifier()
    redundant_code = '''import os
import sys
from math import sqrt

class CalculatorWrapper:
    def add(self, a, b):
        return a + b
'''
    report = simplifier.simplify(redundant_code)
    assert report.lines_reduced > 0
    categories = [op.category for op in report.opportunities_found]
    assert "unused_import" in categories
    assert "redundant_wrapper" in categories
    assert "import os" not in report.simplified_code


def test_security_auditor():
    auditor = SecurityAuditor()
    unsafe_code = '''
import os
def run_dynamic(cmd):
    eval(cmd)
API_KEY = "nvapi-1234567890abcdef1234567890abcdef"
'''
    res = auditor.scan_code(unsafe_code)
    assert res.passed is False
    assert res.critical_count >= 2
    cats = [i.category for i in res.issues]
    assert "secret_leak" in cats
    assert "code_injection" in cats


def test_quality_scorecard_release_gates():
    engine = QualityGateEngine()

    # Case 1: Failing tests block release gate
    fail_tests = TestRunResult(success=False, tests_run=10, passed=8, failed=2, errors=0)
    scorecard_fail = engine.evaluate(test_result=fail_tests)
    assert scorecard_fail.release_gate_passed is False
    assert any("failed" in b.lower() for b in scorecard_fail.blocking_reasons)

    # Case 2: Clean tests and no security issues pass gate
    pass_tests = TestRunResult(success=True, tests_run=10, passed=10, failed=0, errors=0)
    clean_sec = SecurityScanResult(passed=True, critical_count=0, issues=[])
    scorecard_pass = engine.evaluate(test_result=pass_tests, security_result=clean_sec)
    assert scorecard_pass.release_gate_passed is True
    assert scorecard_pass.overall_score >= 8.0
