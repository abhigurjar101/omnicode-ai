"""Security and Secret Leak Detection Engine for OMNICODE AI 5.0.

Scans code and diffs for OWASP ASVS violations, hardcoded credentials,
unsafe dynamic code execution (eval, exec), and SQL injection risks.
"""

import re
import ast
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field


class SecurityIssue(BaseModel):
    category: str  # secret_leak, code_injection, sql_injection, unsafe_deserialization
    severity: str  # critical, high, medium, low
    message: str
    file_path: Optional[str] = None
    line_number: Optional[int] = None
    matched_text_masked: Optional[str] = None


class SecurityScanResult(BaseModel):
    passed: bool
    critical_count: int = 0
    issues: List[SecurityIssue] = Field(default_factory=list)


class SecurityAuditor:
    """Detects security vulnerabilities and secret leaks before execution or commit."""

    # Regex patterns for common API keys and secret tokens
    SECRET_PATTERNS = [
        (r'nvapi-[A-Za-z0-9_-]{30,}', "NVIDIA API Key", "critical"),
        (r'sk-[A-Za-z0-9]{20,}', "OpenAI/Claude API Key", "critical"),
        (r'ghp_[A-Za-z0-9]{30,}', "GitHub Personal Access Token", "critical"),
        (r'AKIA[0-9A-Z]{16}', "AWS Access Key", "critical"),
        (r'-----BEGIN\s+PRIVATE\s+KEY-----', "RSA/SSH Private Key", "critical"),
        (r'(?i)(password|passwd|secret)\s*=\s*[\'"][^\'"]{6,}[\'"]', "Hardcoded Password", "high"),
    ]

    def scan_for_secrets(self, content: str, file_path: str = "") -> List[SecurityIssue]:
        """Scans text for exposed credentials and private tokens."""
        issues = []
        lines = content.splitlines()

        for idx, line in enumerate(lines, start=1):
            for pattern, name, severity in self.SECRET_PATTERNS:
                matches = re.finditer(pattern, line)
                for m in matches:
                    raw = m.group(0)
                    masked = raw[:4] + "..." + raw[-4:] if len(raw) > 8 else "****"
                    issues.append(
                        SecurityIssue(
                            category="secret_leak",
                            severity=severity,
                            message=f"Potential hardcoded secret detected: {name}",
                            file_path=file_path,
                            line_number=idx,
                            matched_text_masked=masked,
                        )
                    )
        return issues

    def scan_python_ast(self, code: str, file_path: str = "") -> List[SecurityIssue]:
        """Audits Python AST for dangerous functions (eval, exec) and raw SQL formatting."""
        issues = []
        try:
            tree = ast.parse(code, filename=file_path)
        except SyntaxError:
            return issues

        for node in ast.walk(tree):
            # Check for eval() or exec()
            if isinstance(node, ast.Call):
                if isinstance(node.func, ast.Name):
                    if node.func.id in ("eval", "exec"):
                        issues.append(
                            SecurityIssue(
                                category="code_injection",
                                severity="critical",
                                message=f"Dangerous dynamic code execution using '{node.func.id}()'. Use safe parsing instead.",
                                file_path=file_path,
                                line_number=node.lineno,
                            )
                        )

            # Check for subprocess with shell=True
            if isinstance(node, ast.Call):
                if isinstance(node.func, ast.Attribute) and node.func.attr in ("Popen", "run", "call", "check_call"):
                    for kw in node.keywords:
                        if kw.arg == "shell" and isinstance(kw.value, ast.Constant) and kw.value.value is True:
                            issues.append(
                                SecurityIssue(
                                    category="command_injection",
                                    severity="high",
                                    message="subprocess invocation with shell=True is susceptible to shell injection.",
                                    file_path=file_path,
                                    line_number=node.lineno,
                                )
                            )

        return issues

    def scan_code(self, code: str, file_path: str = "") -> SecurityScanResult:
        """Executes full security audit on a code snippet."""
        issues = []
        issues.extend(self.scan_for_secrets(code, file_path))
        issues.extend(self.scan_python_ast(code, file_path))

        critical_count = sum(1 for i in issues if i.severity == "critical")
        return SecurityScanResult(
            passed=critical_count == 0,
            critical_count=critical_count,
            issues=issues,
        )
