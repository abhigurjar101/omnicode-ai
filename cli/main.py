"""Interactive Command-Line Interface for OMNICODE AI 5.0.

Provides developer workflows for autonomous coding, code review,
simplification, repository indexing, memory inspection, and NVIDIA model routing.
"""

import os
import sys
import asyncio
from pathlib import Path

# Ensure project root is in sys.path
sys.path.insert(0, str(Path(__file__).parent.parent.resolve()))

import click

from core.agent import OmnicodeAgentController
from core.quality import CodingStandardsEngine, CodeSimplifier, SecurityAuditor
from core.code_intelligence import AgenticRetriever
from core.memory import UnifiedMemoryManager
from core.nvidia import NvidiaModelRegistry, RoutingMode


@click.group()
@click.version_option(version="5.0.0", prog_name="NEMI-CODE")
def cli():
    """NEMI-CODE — Intelligent Autonomous Software Engineering Environment Powered by NVIDIA."""
    pass


@cli.command()
@click.argument("instruction", required=True)
@click.option("--mode", "-m", default="BALANCED", type=click.Choice(["FAST", "BALANCED", "DEEP", "BUDGET", "PRIVATE_NIM"], case_sensitive=False), help="NVIDIA model routing mode")
@click.option("--workspace", "-w", default=".", help="Target workspace path")
def run(instruction: str, mode: str, workspace: str):
    """Executes an autonomous software engineering task on the repository."""
    ws_path = str(Path(workspace).resolve())
    click.echo(f"[*] Initializing NEMI-CODE on workspace: {ws_path}")
    click.echo(f"[*] Objective: {instruction}")
    click.echo(f"[*] NVIDIA Routing Mode: {mode.upper()}")

    agent = OmnicodeAgentController(workspace_root=ws_path)

    async def _execute():
        return await agent.run(instruction=instruction, routing_mode=mode.upper())

    result = asyncio.run(_execute())
    click.echo("\n" + "=" * 60)
    click.echo(result.get("final_response", "Task completed."))
    click.echo("=" * 60)


@cli.command()
@click.option("--workspace", "-w", default=".", help="Target workspace path")
def review(workspace: str):
    """Audits repository code against KISS, DRY, SOLID, and OWASP security standards."""
    ws_path = str(Path(workspace).resolve())
    click.echo(f"[*] Reviewing workspace: {ws_path}")

    standards = CodingStandardsEngine()
    security = SecurityAuditor()

    # Walk python files
    total_files = 0
    violations_count = 0
    security_issues = 0

    for root, dirs, files in os.walk(ws_path):
        dirs[:] = [d for d in dirs if d not in (".git", ".venv", "__pycache__", "node_modules")]
        for f in files:
            if f.endswith(".py"):
                total_files += 1
                f_path = os.path.join(root, f)
                content = Path(f_path).read_text(encoding="utf-8", errors="ignore")

                std_res = standards.review_python_code(content, f_path)
                sec_res = security.scan_code(content, f_path)

                if std_res.violations:
                    for v in std_res.violations:
                        violations_count += 1
                        click.echo(f"  [{v.principle}] {f}:{v.line_number or 1} - {v.message}")

                if sec_res.issues:
                    for i in sec_res.issues:
                        security_issues += 1
                        click.echo(f"  [SECURITY-{i.severity.upper()}] {f}:{i.line_number or 1} - {i.message}")

    click.echo("\n" + "-" * 40)
    click.echo(f"Audited {total_files} files.")
    click.echo(f"Architectural violations found: {violations_count}")
    click.echo(f"Security issues found: {security_issues}")
    if violations_count == 0 and security_issues == 0:
        click.secho("[+] Repository passed all quality gates!", fg="green")


@cli.command()
@click.argument("file_path", required=True)
def simplify(file_path: str):
    """Simplifies a source file by removing unused imports and redundant wrappers."""
    path = Path(file_path).resolve()
    if not path.exists():
        click.secho(f"Error: File '{file_path}' does not exist.", fg="red")
        sys.exit(1)

    code = path.read_text(encoding="utf-8")
    simplifier = CodeSimplifier()
    report = simplifier.simplify(code)

    click.echo(f"[*] Simplification Report for {path.name}:")
    click.echo(f"  Original lines:   {report.original_lines}")
    click.echo(f"  Simplified lines: {report.simplified_lines}")
    click.echo(f"  Lines reduced:    {report.lines_reduced} ({report.reduction_percentage}%)")

    for opp in report.opportunities_found:
        click.echo(f"  - [{opp.category}] Line {opp.line_number or 1}: {opp.description}")

    if report.lines_reduced > 0:
        path.write_text(report.simplified_code, encoding="utf-8")
        click.secho(f"[+] Updated {path.name} with simplified implementation.", fg="green")
    else:
        click.secho("[+] Code is already minimal and concise.", fg="green")


@cli.command()
@click.option("--workspace", "-w", default=".", help="Target workspace path")
def index(workspace: str):
    """Parses AST symbols and builds hybrid lexical/vector search index."""
    ws_path = str(Path(workspace).resolve())
    click.echo(f"[*] Indexing workspace: {ws_path}")
    retriever = AgenticRetriever(ws_path)

    res = asyncio.run(retriever.index_workspace(force_refresh=True))
    click.echo(f"[+] Successfully indexed {res.get('files_parsed')} files, {res.get('symbols_indexed')} symbols, {res.get('chunks_indexed')} chunks.")


@cli.command()
def memory():
    """Displays memory statistics and verified episodic lessons."""
    mem = UnifiedMemoryManager()
    stats = mem.get_stats()
    click.echo("[*] NEMI-CODE Memory Tiers:")
    click.echo(f"  Episodic Memories:   {stats['episodic_count']}")
    click.echo(f"  Semantic Knowledge:  {stats['semantic_count']}")
    click.echo(f"  Procedural Methods:  {stats['procedural_count']}")
    click.echo(f"  Database Path:       {stats['db_path']}")

    episodes = mem.episodic.list_all()
    if episodes:
        click.echo("\n[*] Recent Verified Episodes:")
        for ep in episodes[-5:]:
            click.echo(f"  - [{ep.episode_id}] {ep.task_objective[:60]}")
            click.echo(f"    Lesson: {ep.lesson_learned[:80]}")


@cli.command()
def models():
    """Lists available NVIDIA models and routing profiles."""
    reg = NvidiaModelRegistry()
    click.echo("[*] NVIDIA AI Model Registry & Profiles:")
    for mode in RoutingMode:
        model_id = reg.select_model(mode=mode)
        spec = reg.get_model(model_id)
        name = spec.display_name if spec else model_id
        click.echo(f"  {mode.value:<12} -> {name}")


if __name__ == "__main__":
    cli()
