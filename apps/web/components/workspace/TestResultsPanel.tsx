"use client";

import React from "react";
import { CheckCircle2, XCircle, Clock, Database, Play } from "lucide-react";

export interface TestResultItem {
  test_id: number;
  passed: boolean;
  input_data: string;
  expected_output: string;
  actual_output: string;
  execution_time_ms: number;
  memory_mb?: number;
  error_message?: string | null;
}

interface TestResultsPanelProps {
  results: TestResultItem[];
  isRunning?: boolean;
  onRerun?: () => void;
  className?: string;
}

export function TestResultsPanel({
  results = [],
  isRunning = false,
  onRerun,
  className = "",
}: TestResultsPanelProps) {
  const total = results.length;
  const passedCount = results.filter((r) => r.passed).length;
  const allPassed = total > 0 && passedCount === total;

  if (total === 0 && !isRunning) {
    return (
      <div className={`p-6 flex flex-col items-center justify-center text-center text-[#888888] ${className}`}>
        <p className="text-xs mb-3 font-mono">No benchmark test results yet.</p>
        {onRerun && (
          <button
            onClick={onRerun}
            className="px-3 py-1.5 rounded-lg bg-[#ED3327] hover:bg-[#db2b20] text-white text-xs font-medium flex items-center gap-1.5 transition-all shadow-[0_0_12px_rgba(237,51,39,0.35)]"
          >
            <Play className="w-3 h-3" />
            <span>Run Test Harness</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full overflow-hidden text-xs font-mono select-text ${className}`}>
      {/* Summary Header */}
      <div className="px-3 py-2 border-b border-[#2b0f0f] bg-black/40 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div
            className={`px-2 py-0.5 rounded text-[11px] font-bold flex items-center gap-1 ${
              allPassed
                ? "bg-[#10301a] text-[#55ee99] border border-[#1b502b]"
                : "bg-[#330f14] text-[#ff6677] border border-[#551a22]"
            }`}
          >
            {allPassed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
            <span>
              {allPassed ? "PASSED" : "FAILED"} ({passedCount}/{total})
            </span>
          </div>

          <span className="text-[#888888] text-[11px]">
            Avg Runtime:{" "}
            <span className="text-white font-medium">
              {total > 0
                ? (results.reduce((acc, r) => acc + r.execution_time_ms, 0) / total).toFixed(1)
                : 0}
              ms
            </span>
          </span>
        </div>

        {onRerun && (
          <button
            onClick={onRerun}
            disabled={isRunning}
            className="h-6 px-2.5 rounded bg-black/40 hover:bg-white/10 border border-[#2b0f0f] text-[#A7A7A7] hover:text-white flex items-center gap-1 transition-all disabled:opacity-50"
          >
            <Play className="w-3 h-3 text-[#ED3327]" />
            <span>{isRunning ? "Testing..." : "Rerun Tests"}</span>
          </button>
        )}
      </div>

      {/* Test Cases List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 custom-scrollbar">
        {results.map((res) => (
          <div
            key={res.test_id}
            data-testid={`test-result-${res.test_id}`}
            className={`p-2.5 rounded-xl border ${
              res.passed
                ? "bg-[#091a10]/60 border-[#1a4025]"
                : "bg-[#1c080b]/60 border-[#4a1219]"
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                {res.passed ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#55ee99]" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 text-[#ff5566]" />
                )}
                <span className="font-bold text-white text-[11px]">Test Case #{res.test_id}</span>
                <span
                  className={`px-1.5 py-0.2 rounded text-[10px] font-semibold ${
                    res.passed ? "text-[#55ee99]" : "text-[#ff5566]"
                  }`}
                >
                  {res.passed ? "PASSED" : "FAILED"}
                </span>
              </div>

              <div className="flex items-center gap-2.5 text-[10px] text-[#888888]">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#ED3327]" />
                  <span>{res.execution_time_ms.toFixed(1)}ms</span>
                </span>
                {res.memory_mb && (
                  <span className="flex items-center gap-1">
                    <Database className="w-3 h-3 text-[#ED3327]" />
                    <span>{res.memory_mb.toFixed(1)}MB</span>
                  </span>
                )}
              </div>
            </div>

            {/* Error Message if any */}
            {res.error_message && (
              <div className="mb-2 p-1.5 rounded bg-[#2b080d] border border-[#6b1622] text-[#ff8899] text-[10.5px]">
                {res.error_message}
              </div>
            )}

            {/* Input vs Expected vs Actual */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[10.5px]">
              <div>
                <span className="text-[#777777] block text-[9.5px] uppercase tracking-wider mb-0.5">Input</span>
                <pre className="p-1.5 rounded bg-black/60 border border-[#200a0d] text-[#CCCCCC] overflow-x-auto whitespace-pre">
                  {res.input_data.trim() || "<empty>"}
                </pre>
              </div>
              <div>
                <span className="text-[#777777] block text-[9.5px] uppercase tracking-wider mb-0.5">Expected Output</span>
                <pre className="p-1.5 rounded bg-black/60 border border-[#200a0d] text-[#55ee99] overflow-x-auto whitespace-pre">
                  {res.expected_output.trim() || "<empty>"}
                </pre>
              </div>
              <div>
                <span className="text-[#777777] block text-[9.5px] uppercase tracking-wider mb-0.5">Actual Output</span>
                <pre
                  className={`p-1.5 rounded bg-black/60 border border-[#200a0d] overflow-x-auto whitespace-pre ${
                    res.passed ? "text-[#55ee99]" : "text-[#ff6677]"
                  }`}
                >
                  {res.actual_output.trim() || "<no output>"}
                </pre>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
