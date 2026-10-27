"""Dependency and Import Graph Engine for OMNICODE AI 5.0.

Analyzes module dependencies, file imports, and test-to-source mappings.
"""

import os
from pathlib import Path
from typing import Dict, Any, List, Set


class DependencyGraph:
    """Tracks imports, file dependencies, and links tests to source code."""

    def __init__(self):
        # file_path -> set of imported module names
        self._imports: Dict[str, Set[str]] = {}
        # module_name -> set of files that import it
        self._reverse_imports: Dict[str, Set[str]] = {}

    def register_file_imports(self, file_path: str, imports: List[str]) -> None:
        """Registers the import statements detected in a file."""
        self._imports[file_path] = set(imports)
        for imp in imports:
            self._reverse_imports.setdefault(imp, set()).add(file_path)

    def get_file_imports(self, file_path: str) -> List[str]:
        """Returns the modules imported by a file."""
        return sorted(list(self._imports.get(file_path, set())))

    def get_dependent_files(self, module_name: str) -> List[str]:
        """Finds files that import a given module."""
        return sorted(list(self._reverse_imports.get(module_name, set())))

    @staticmethod
    def map_test_to_source(test_path: str, all_files: List[str]) -> List[str]:
        """Heuristically maps a test file to candidate source files."""
        base_name = Path(test_path).stem
        if base_name.startswith("test_"):
            target_name = base_name[5:]
        elif base_name.endswith("_test"):
            target_name = base_name[:-5]
        else:
            target_name = base_name

        candidates = []
        for f in all_files:
            p = Path(f)
            if p.stem == target_name and "test" not in str(p).lower():
                candidates.append(f)

        return candidates
