"use client";

import React, { useState, useEffect } from "react";
import {
  Trophy,
  CheckCircle2,
  XCircle,
  Clock,
  Zap,
  TrendingUp,
  RotateCcw,
  ExternalLink,
  Code2,
  ChevronRight,
  Layers,
  Sparkles,
  Play
} from "lucide-react";
import { BenchmarkProblem } from "./ProblemPanel";
import { TestResultsPanel, TestResultItem } from "./TestResultsPanel";

interface BenchmarkStats {
  total_attempts: number;
  attempted_problems: number;
  passed_problems: number;
  failed_attempts: number;
  success_rate: number;
  current_difficulty_level: number;
  average_execution_time_ms: number;
  failure_diagnoses: number;
  verified_improvements: number;
}

interface BenchmarkDashboardProps {
  apiBase?: string;
  onOpenInEditor?: (challenge: BenchmarkProblem) => void;
  className?: string;
}

export function BenchmarkDashboard({
  apiBase = "http://localhost:8000",
  onOpenInEditor,
  className = "",
}: BenchmarkDashboardProps) {
  const [stats, setStats] = useState<BenchmarkStats | null>(null);
  const [challenges, setChallenges] = useState<BenchmarkProblem[]>([]);
  const [selectedChallenge, setSelectedChallenge] = useState<BenchmarkProblem | null>(null);
  const [selectedTestResults, setSelectedTestResults] = useState<TestResultItem[]>([]);
  const [selectedCode, setSelectedCode] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [evaluatingAll, setEvaluatingAll] = useState<boolean>(false);
  const [evalProgress, setEvalProgress] = useState<string>("");

  const fetchStatsAndCatalog = async () => {
    try {
      const [statsRes, catRes] = await Promise.all([
        fetch(`${apiBase}/api/benchmark/stats`).then((r) => r.json()),
        fetch(`${apiBase}/api/benchmark/catalog`).then((r) => r.json()),
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (catRes.success) {
        setChallenges(catRes.challenges);
        if (catRes.challenges.length > 0 && !selectedChallenge) {
          handleSelectChallenge(catRes.challenges[0]);
        }
      }
    } catch (e) {
      console.error("Failed to load benchmark metrics:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatsAndCatalog();
  }, [apiBase]);

  const handleSelectChallenge = async (ch: BenchmarkProblem) => {
    setSelectedChallenge(ch);
    // Fetch latest code from target file or solution
    try {
      const res = await fetch(`${apiBase}/api/benchmark/select`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challenge_id: ch.id }),
      }).then((r) => r.json());

      if (res.success) {
        setSelectedCode(res.code || "");
        // Run tests to get fresh real results
        const testRes = await fetch(`${apiBase}/api/benchmark/run-test`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ challenge_id: ch.id, code: res.code || "" }),
        }).then((r) => r.json());

        if (testRes.success) {
          setSelectedTestResults(testRes.results || []);
        }
      }
    } catch (e) {
      console.error("Error inspecting challenge:", e);
    }
  };

  const handleRunFullSuite = async () => {
    setEvaluatingAll(true);
    for (let i = 0; i < challenges.length; i++) {
      const ch = challenges[i];
      setEvalProgress(`Evaluating [L${ch.level}] ${ch.title} (${i + 1}/${challenges.length})...`);
      try {
        await fetch(`${apiBase}/api/benchmark/solve`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ challenge_id: ch.id }),
        });
      } catch (e) {
        console.error(`Error solving ${ch.id}:`, e);
      }
    }
    setEvalProgress("Suite evaluation complete.");
    await fetchStatsAndCatalog();
    setEvaluatingAll(false);
  };

  return (
    <div
      data-testid="benchmark-dashboard"
      className={`flex flex-col h-full bg-[#08080a]/95 text-white p-6 overflow-y-auto custom-scrollbar select-text ${className}`}
    >
      {/* 1. Header & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#2b0f0f]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Trophy className="w-5 h-5 text-[#ED3327]" />
            <h1 className="text-xl font-bold tracking-tight text-white">
              NEMI-CO Benchmark & Autonomous Training System
            </h1>
          </div>
          <p className="text-xs text-[#888888] font-mono">
            Standardized multi-agent evaluation across 14 competitive programming & SWE-bench platforms.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchStatsAndCatalog}
            disabled={loading || evaluatingAll}
            className="h-8 px-3 rounded-lg bg-black/60 hover:bg-white/10 border border-[#2b0f0f] text-[#A7A7A7] hover:text-white text-xs font-medium flex items-center gap-1.5 transition-all"
            title="Refresh statistics"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>

          <button
            data-testid="run-benchmark-suite-btn"
            onClick={handleRunFullSuite}
            disabled={evaluatingAll}
            className="h-8 px-4 rounded-lg bg-[#ED3327] hover:bg-[#db2b20] active:bg-[#c42319] text-white text-xs font-semibold flex items-center gap-1.5 shadow-[0_0_15px_rgba(237,51,39,0.45)] transition-all disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{evaluatingAll ? "Running Suite..." : "Run Benchmark Suite"}</span>
          </button>
        </div>
      </div>

      {evalProgress && (
        <div className="mb-4 px-3 py-2 rounded-lg bg-[#20080b] border border-[#50151c] text-[#ff99aa] text-xs font-mono animate-pulse">
          {evalProgress}
        </div>
      )}

      {/* 2. Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
        {/* Total Problems */}
        <div className="p-3 rounded-xl bg-black/50 border border-[#2b0f0f] flex flex-col">
          <span className="text-[10px] text-[#888888] uppercase tracking-wider font-mono">Total</span>
          <span className="text-xl font-bold text-white mt-1">{challenges.length}</span>
        </div>

        {/* Attempted */}
        <div className="p-3 rounded-xl bg-black/50 border border-[#2b0f0f] flex flex-col">
          <span className="text-[10px] text-[#888888] uppercase tracking-wider font-mono">Attempted</span>
          <span className="text-xl font-bold text-white mt-1">{stats?.attempted_problems || 0}</span>
        </div>

        {/* Passed */}
        <div className="p-3 rounded-xl bg-[#091a10]/60 border border-[#1a4025] flex flex-col">
          <span className="text-[10px] text-[#55ee99] uppercase tracking-wider font-mono">Passed</span>
          <span className="text-xl font-bold text-[#55ee99] mt-1">{stats?.passed_problems || 0}</span>
        </div>

        {/* Failed */}
        <div className="p-3 rounded-xl bg-[#1c080b]/60 border border-[#4a1219] flex flex-col">
          <span className="text-[10px] text-[#ff6677] uppercase tracking-wider font-mono">Failed</span>
          <span className="text-xl font-bold text-[#ff6677] mt-1">{stats?.failed_attempts || 0}</span>
        </div>

        {/* Success Rate */}
        <div className="p-3 rounded-xl bg-black/50 border border-[#2b0f0f] flex flex-col">
          <span className="text-[10px] text-[#888888] uppercase tracking-wider font-mono">Success Rate</span>
          <span className="text-xl font-bold text-[#ED3327] mt-1">{stats?.success_rate || 0}%</span>
        </div>

        {/* Current Difficulty */}
        <div className="p-3 rounded-xl bg-black/50 border border-[#2b0f0f] flex flex-col">
          <span className="text-[10px] text-[#888888] uppercase tracking-wider font-mono">Current Level</span>
          <span className="text-xl font-bold text-white mt-1">L{stats?.current_difficulty_level || 1}</span>
        </div>

        {/* Avg Runtime */}
        <div className="p-3 rounded-xl bg-black/50 border border-[#2b0f0f] flex flex-col">
          <span className="text-[10px] text-[#888888] uppercase tracking-wider font-mono">Avg Runtime</span>
          <span className="text-xl font-bold text-white mt-1">
            {stats?.average_execution_time_ms ? `${stats.average_execution_time_ms.toFixed(0)}ms` : "0ms"}
          </span>
        </div>

        {/* Verified Improvements */}
        <div className="p-3 rounded-xl bg-black/50 border border-[#2b0f0f] flex flex-col">
          <span className="text-[10px] text-[#888888] uppercase tracking-wider font-mono">Learned Rules</span>
          <span className="text-xl font-bold text-[#55ee99] mt-1">{stats?.verified_improvements || 0}</span>
        </div>
      </div>

      {/* 3. Challenge Matrix & Inspector View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 min-h-[420px]">
        {/* Left: Challenge Library Table (7 cols) */}
        <div className="lg:col-span-7 flex flex-col rounded-2xl bg-black/60 border border-[#2b0f0f] overflow-hidden">
          <div className="p-3 border-b border-[#2b0f0f] bg-black/80 flex items-center justify-between">
            <span className="font-bold text-xs text-white uppercase tracking-wider font-mono">
              Challenge Catalog (Levels 1–7)
            </span>
            <span className="text-[11px] text-[#888888] font-mono">
              {challenges.length} Verified Tasks
            </span>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-[#1e0709]">
            {challenges.map((ch) => {
              const isSelected = selectedChallenge?.id === ch.id;
              return (
                <div
                  key={ch.id}
                  data-testid={`benchmark-row-${ch.id}`}
                  onClick={() => handleSelectChallenge(ch)}
                  className={`p-3 flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-[#2b070a]/80 border-l-4 border-l-[#ED3327]"
                      : "hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="px-2 py-0.5 rounded bg-[#ED3327]/20 border border-[#ED3327]/40 text-[#ED3327] font-bold text-[10px] font-mono shrink-0">
                      L{ch.level}
                    </span>

                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-white truncate flex items-center gap-2">
                        <span>{ch.title}</span>
                      </div>
                      <div className="text-[10px] text-[#888888] font-mono flex items-center gap-2 mt-0.5">
                        <span className="text-[#AAAAAA]">{ch.source}</span>
                        <span>•</span>
                        <span>{ch.difficulty}</span>
                        <span>•</span>
                        <span>{ch.category}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold font-mono ${
                        ch.status === "passed"
                          ? "bg-[#10301a] text-[#55ee99]"
                          : ch.status === "failed"
                          ? "bg-[#330f14] text-[#ff6677]"
                          : "bg-black/40 text-[#888888]"
                      }`}
                    >
                      {ch.status || "ready"}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-[#666666]" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Challenge Inspector (5 cols) */}
        <div className="lg:col-span-5 flex flex-col rounded-2xl bg-black/60 border border-[#2b0f0f] overflow-hidden">
          {selectedChallenge ? (
            <div className="flex flex-col h-full overflow-hidden">
              {/* Header */}
              <div className="p-3 border-b border-[#2b0f0f] bg-black/80 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-xs text-white truncate">{selectedChallenge.title}</h3>
                  <div className="text-[10px] text-[#888888] font-mono flex items-center gap-2 mt-0.5">
                    <span>{selectedChallenge.source}</span>
                    <span>•</span>
                    <a
                      href={selectedChallenge.source_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#ED3327] hover:underline flex items-center gap-0.5"
                    >
                      <span>Link</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                </div>

                {onOpenInEditor && (
                  <button
                    onClick={() => onOpenInEditor(selectedChallenge)}
                    className="h-7 px-2.5 rounded bg-[#ED3327] hover:bg-[#db2b20] text-white text-[11px] font-medium flex items-center gap-1 transition-all shadow-[0_0_8px_rgba(237,51,39,0.3)]"
                  >
                    <Code2 className="w-3 h-3" />
                    <span>Open in Editor</span>
                  </button>
                )}
              </div>

              {/* Inspector Content: Test Results & Source Code */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                {/* Real Test Results */}
                <div>
                  <span className="text-[10px] text-[#888888] uppercase tracking-wider font-mono block mb-1">
                    Evaluation Results
                  </span>
                  <div className="rounded-xl border border-[#2b0f0f] overflow-hidden max-h-[220px]">
                    <TestResultsPanel
                      results={selectedTestResults}
                      onRerun={() => handleSelectChallenge(selectedChallenge)}
                    />
                  </div>
                </div>

                {/* Generated / Verified Source Code */}
                <div>
                  <span className="text-[10px] text-[#888888] uppercase tracking-wider font-mono block mb-1">
                    Verified Solution Code ({selectedChallenge.target_file})
                  </span>
                  <pre className="p-3 rounded-xl bg-black/80 border border-[#2b0f0f] text-[#CCCCCC] text-[11px] font-mono overflow-x-auto max-h-[220px] whitespace-pre">
                    {selectedCode || selectedChallenge.solution_code || "# No code loaded"}
                  </pre>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-center p-6 text-[#888888] text-xs font-mono">
              Select a challenge to inspect verified results and code.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
