"""Secure Filesystem Tools for OMNICODE AI 5.0.

Provides workspace-bounded file reading, writing, atomic search-and-replace patching,
directory tree listing, and grep searching.
"""

import os
import re
from pathlib import Path
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field

from core.runtime.permissions import SecurityPolicy


class FileSearchResult(BaseModel):
    file_path: str
    line_number: int
    line_content: str


class FilesystemTools:
    """Safely executes filesystem operations within the designated workspace root."""

    def __init__(self, workspace_root: str):
        self.workspace_root = Path(workspace_root).resolve()
        self.security = SecurityPolicy(str(self.workspace_root))

    def _resolve_and_validate(self, file_path: str) -> Path:
        """Resolves target path and enforces containment within workspace root."""
        path_obj = Path(file_path)
        if not path_obj.is_absolute():
            resolved = (self.workspace_root / path_obj).resolve()
        else:
            resolved = path_obj.resolve()

        if not (self.workspace_root == resolved or self.workspace_root in resolved.parents):
            raise PermissionError(f"Access denied: {file_path} is outside workspace root {self.workspace_root}")
        return resolved

    def read_file(
        self,
        file_path: str,
        start_line: Optional[int] = None,
        end_line: Optional[int] = None,
    ) -> Dict[str, Any]:
        """Reads content from a file, optionally bounded by line numbers (1-indexed)."""
        target = self._resolve_and_validate(file_path)
        if not target.exists():
            return {"error": f"File not found: {file_path}", "success": False}
        if target.is_dir():
            return {"error": f"Target is a directory: {file_path}", "success": False}

        try:
            content = target.read_text(encoding="utf-8", errors="replace")
            lines = content.splitlines(keepends=True)
            total_lines = len(lines)

            if start_line is not None or end_line is not None:
                s = max(1, start_line or 1)
                e = min(total_lines, end_line or total_lines)
                selected_lines = lines[s - 1:e]
                sliced_content = "".join(selected_lines)
                return {
                    "content": sliced_content,
                    "total_lines": total_lines,
                    "start_line": s,
                    "end_line": e,
                    "success": True,
                }

            return {
                "content": content,
                "total_lines": total_lines,
                "start_line": 1,
                "end_line": total_lines,
                "success": True,
            }
        except Exception as e:
            return {"error": f"Failed reading file: {str(e)}", "success": False}

    def write_file(self, file_path: str, content: str, overwrite: bool = True) -> Dict[str, Any]:
        """Writes content to a file, creating parent directories if needed."""
        target = self._resolve_and_validate(file_path)
        if target.exists() and not overwrite:
            return {"error": f"File exists and overwrite is False: {file_path}", "success": False}

        try:
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_text(content, encoding="utf-8")
            return {
                "success": True,
                "file_path": str(target),
                "bytes_written": len(content.encode("utf-8")),
            }
        except Exception as e:
            return {"error": f"Failed writing file: {str(e)}", "success": False}

    def edit_file(
        self,
        file_path: str,
        target_snippet: str,
        replacement_snippet: str,
    ) -> Dict[str, Any]:
        """Performs atomic, exact search-and-replace patching."""
        target = self._resolve_and_validate(file_path)
        if not target.exists():
            return {"error": f"File not found: {file_path}", "success": False}

        try:
            content = target.read_text(encoding="utf-8")
            if target_snippet not in content:
                return {
                    "error": f"Target snippet not found in {file_path}",
                    "success": False,
                }

            count = content.count(target_snippet)
            if count > 1:
                return {
                    "error": f"Target snippet matches multiple ({count}) locations in {file_path}. Please provide more surrounding context.",
                    "success": False,
                }

            new_content = content.replace(target_snippet, replacement_snippet, 1)
            target.write_text(new_content, encoding="utf-8")
            return {
                "success": True,
                "file_path": str(target),
                "diff_summary": f"Replaced 1 occurrence of {len(target_snippet)} chars with {len(replacement_snippet)} chars",
            }
        except Exception as e:
            return {"error": f"Failed editing file: {str(e)}", "success": False}

    def list_files(
        self,
        sub_dir: Optional[str] = None,
        max_depth: int = 3,
        exclude_dirs: Optional[List[str]] = None,
    ) -> Dict[str, Any]:
        """Recursively lists files and directories up to max_depth."""
        base = self.workspace_root
        if sub_dir:
            base = self._resolve_and_validate(sub_dir)

        excludes = set(exclude_dirs or [".git", ".venv", "__pycache__", "node_modules", ".pytest_cache", ".next"])
        results = []

        try:
            for root, dirs, files in os.walk(base):
                # Filter dirs in-place
                dirs[:] = [d for d in dirs if d not in excludes]
                rel_root = os.path.relpath(root, self.workspace_root)
                depth = 0 if rel_root == "." else len(Path(rel_root).parts)
                if depth > max_depth:
                    dirs[:] = []
                    continue

                for f in files:
                    rel_file = os.path.normpath(os.path.join(rel_root, f))
                    if rel_file.startswith("./"):
                        rel_file = rel_file[2:]
                    results.append(rel_file)

            return {"files": sorted(results), "count": len(results), "success": True}
        except Exception as e:
            return {"error": f"Failed listing files: {str(e)}", "success": False}

    def grep_search(
        self,
        query: str,
        sub_dir: Optional[str] = None,
        is_regex: bool = False,
        case_sensitive: bool = True,
        max_results: int = 50,
    ) -> Dict[str, Any]:
        """Searches for pattern occurrences across files in the workspace."""
        base = self.workspace_root
        if sub_dir:
            base = self._resolve_and_validate(sub_dir)

        excludes = {".git", ".venv", "__pycache__", "node_modules", ".pytest_cache", ".next"}
        flags = 0 if case_sensitive else re.IGNORECASE
        try:
            pattern = re.compile(query, flags) if is_regex else None
        except Exception as e:
            return {"error": f"Invalid regex: {e}", "success": False}

        matches: List[Dict[str, Any]] = []

        for root, dirs, files in os.walk(base):
            dirs[:] = [d for d in dirs if d not in excludes]
            for file_name in files:
                file_path = Path(root) / file_name
                try:
                    with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                        for idx, line in enumerate(f, start=1):
                            matched = False
                            if pattern:
                                if pattern.search(line):
                                    matched = True
                            else:
                                if case_sensitive:
                                    matched = query in line
                                else:
                                    matched = query.lower() in line.lower()

                            if matched:
                                rel_path = str(file_path.relative_to(self.workspace_root))
                                matches.append({
                                    "file_path": rel_path,
                                    "line_number": idx,
                                    "line_content": line.strip()[:200],
                                })
                                if len(matches) >= max_results:
                                    return {"matches": matches, "total": len(matches), "truncated": True, "success": True}
                except Exception:
                    continue

        return {"matches": matches, "total": len(matches), "truncated": False, "success": True}
