"use client";

import React, { useState } from "react";
import {
  ExternalLink,
  Code2,
  Play,
  Sparkles,
  ChevronDown,
  Layers,
  Copy,
  Check,
  CheckCircle2,
  XCircle,
  AlertCircle
} from "lucide-react";

export interface BenchmarkProblem {
  id: string;
  source: string;
  source_url: string;
  title: string;
  category: string;
  difficulty: string;
  level: number;
  language: string;
  problem_statement: string;
  input_format: string;
  output_format: string;
  constraints: string[];
  samples: Array<{ input: string; output: string }>;
  test_cases?: Array<any>;
  time_limit?: number;
  memory_limit?: number;
  target_file: string;
  status?: string;
  solution_code?: string;
}

interface ProblemPanelProps {
  challenges: BenchmarkProblem[];
  selectedChallenge: BenchmarkProblem | null;
  onSelectChallenge: (challenge: BenchmarkProblem) => void;
  onSolveChallenge: (challengeId: string) => void;
  onRunTests: (challengeId: string) => void;
  isSolving?: boolean;
  isTesting?: boolean;
  agentStatus?: string;
  className?: string;
}

export function ProblemPanel({
  challenges = [],
  selectedChallenge,
  onSelectChallenge,
  onSolveChallenge,
  onRunTests,
  isSolving = false,
  isTesting = false,
  agentStatus = "Idle",
  className = "",
}: ProblemPanelProps) {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [selectedLevelFilter, setSelectedLevelFilter] = useState<number | "all">("all");

  const filteredChallenges = selectedLevelFilter === "all"
    ? challenges
    : challenges.filter((c) => c.level === selectedLevelFilter);

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div
      data-testid="problem-panel"
      className={`flex flex-col h-full bg-[#08080a]/95 backdrop-blur-xl border border-[#3d0b10] rounded-2xl overflow-hidden text-xs select-text ${className}`}
    >
      {/* 1. Header & Problem Selector */}
      <div className="p-3 border-b border-[#2b0f0f] bg-black/60 flex flex-col gap-2 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#ED3327]" />
            <span className="font-bold text-white text-[12px] tracking-wide">CHALLENGE LIBRARY</span>
          </div>

          {/* Level Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto">
            <button
              onClick={() => setSelectedLevelFilter("all")}
              className={`px-1.5 py-0.5 rounded text-[10px] transition-colors ${
                selectedLevelFilter === "all"
                  ? "bg-[#ED3327] text-white font-semibold"
                  : "text-[#888888] hover:text-white"
              }`}
            >
              All
            </button>
            {[1, 2, 3, 4, 5, 6, 7].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setSelectedLevelFilter(lvl)}
                className={`px-1.5 py-0.5 rounded text-[10px] transition-colors ${
                  selectedLevelFilter === lvl
                    ? "bg-[#ED3327] text-white font-semibold"
                    : "text-[#888888] hover:text-white"
                }`}
                title={`Level ${lvl}`}
              >
                L{lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Dropdown Selector */}
        <div className="relative">
          <select
            data-testid="challenge-selector"
            value={selectedChallenge?.id || ""}
            onChange={(e) => {
              const ch = challenges.find((c) => c.id === e.target.value);
              if (ch) onSelectChallenge(ch);
            }}
            className="w-full h-8 px-2.5 rounded-lg bg-[#140608] border border-[#3d0b10] text-white text-[11px] font-medium appearance-none focus:outline-none focus:border-[#ED3327] cursor-pointer"
          >
            {filteredChallenges.map((c) => (
              <option key={c.id} value={c.id} className="bg-[#120306] text-white">
                [L{c.level} • {c.source}] {c.title}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-[#888888] absolute right-2.5 top-2.5 pointer-events-none" />
        </div>
      </div>

      {/* 2. Challenge Details Body */}
      {selectedChallenge ? (
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar text-[#D4D4D4]">
          {/* Title & Metadata */}
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="px-2 py-0.5 rounded-full bg-[#ED3327]/20 border border-[#ED3327]/60 text-[#ED3327] text-[10px] font-bold">
                LEVEL {selectedChallenge.level}
              </span>
              <span className="px-2 py-0.5 rounded bg-black/60 border border-[#2b0f0f] text-[#A7A7A7] text-[10px]">
                {selectedChallenge.difficulty}
              </span>
              <span className="px-2 py-0.5 rounded bg-black/60 border border-[#2b0f0f] text-[#A7A7A7] text-[10px]">
                {selectedChallenge.category.replace("_", " ").toUpperCase()}
              </span>
            </div>

            <h1 className="text-sm md:text-base font-bold text-white mb-1.5 flex items-center justify-between">
              <span>{selectedChallenge.title}</span>
              <a
                href={selectedChallenge.source_url}
                target="_blank"
                rel="noreferrer"
                className="text-[#888888] hover:text-[#ED3327] transition-colors p-1"
                title={`Open on ${selectedChallenge.source}`}
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </h1>

            <div className="text-[10px] text-[#777777] font-mono flex items-center gap-3">
              <span>Source: <strong className="text-white">{selectedChallenge.source}</strong></span>
              <span>Time Limit: <strong className="text-white">{selectedChallenge.time_limit || 2.0}s</strong></span>
              <span>Memory: <strong className="text-white">{selectedChallenge.memory_limit || 256}MB</strong></span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h2 className="text-[11px] font-bold text-white uppercase tracking-wider mb-1">
              Description
            </h2>
            <div className="p-3 rounded-xl bg-black/40 border border-[#200a0d] text-[11.5px] leading-relaxed whitespace-pre-line text-[#CCCCCC]">
              {selectedChallenge.problem_statement}
            </div>
          </div>

          {/* Input & Output Format */}
          <div className="grid grid-cols-1 gap-2.5">
            <div>
              <h2 className="text-[11px] font-bold text-white uppercase tracking-wider mb-1">
                Input Format
              </h2>
              <div className="p-2.5 rounded-xl bg-black/40 border border-[#200a0d] text-[11px] leading-relaxed text-[#AAAAAA]">
                {selectedChallenge.input_format}
              </div>
            </div>
            <div>
              <h2 className="text-[11px] font-bold text-white uppercase tracking-wider mb-1">
                Output Format
              </h2>
              <div className="p-2.5 rounded-xl bg-black/40 border border-[#200a0d] text-[11px] leading-relaxed text-[#AAAAAA]">
                {selectedChallenge.output_format}
              </div>
            </div>
          </div>

          {/* Constraints */}
          {selectedChallenge.constraints && selectedChallenge.constraints.length > 0 && (
            <div>
              <h2 className="text-[11px] font-bold text-white uppercase tracking-wider mb-1">
                Constraints
              </h2>
              <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-[#A7A7A7] font-mono">
                {selectedChallenge.constraints.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Sample Cases */}
          {selectedChallenge.samples && selectedChallenge.samples.length > 0 && (
            <div>
              <h2 className="text-[11px] font-bold text-white uppercase tracking-wider mb-1.5">
                Sample Cases
              </h2>
              <div className="space-y-2">
                {selectedChallenge.samples.map((sample, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-black/50 border border-[#2b0f0f] text-[11px]">
                    <div className="flex items-center justify-between mb-1 text-[10px] text-[#888888]">
                      <span className="font-bold text-white">Sample #{idx + 1}</span>
                      <button
                        onClick={() => handleCopy(sample.input, idx)}
                        className="flex items-center gap-1 hover:text-white transition-colors"
                      >
                        {copiedIdx === idx ? <Check className="w-3 h-3 text-[#55ee99]" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedIdx === idx ? "Copied" : "Copy Input"}</span>
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-1 font-mono text-[10.5px]">
                      <div>
                        <span className="text-[9px] uppercase tracking-wider text-[#666666] block">Input</span>
                        <pre className="p-1.5 rounded bg-black/70 border border-[#1b080b] text-[#CCCCCC] whitespace-pre overflow-x-auto">
                          {sample.input.trim()}
                        </pre>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase tracking-wider text-[#666666] block">Expected</span>
                        <pre className="p-1.5 rounded bg-black/70 border border-[#1b080b] text-[#55ee99] whitespace-pre overflow-x-auto">
                          {sample.output.trim()}
                        </pre>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-center p-6 text-[#888888]">
          <p>Select a challenge from the library above to begin.</p>
        </div>
      )}

      {/* 3. Action Footer Bar */}
      {selectedChallenge && (
        <div className="p-3 border-t border-[#2b0f0f] bg-black/60 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1.5 text-[11px] font-mono">
            <span className="text-[#888888]">Agent:</span>
            <span
              data-testid="problem-agent-status"
              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                agentStatus === "Passed"
                  ? "bg-[#10301a] text-[#55ee99]"
                  : agentStatus === "Failed"
                  ? "bg-[#330f14] text-[#ff6677]"
                  : agentStatus !== "Idle"
                  ? "bg-[#3a1500] text-[#ffaa44] animate-pulse"
                  : "bg-black/60 text-[#888888]"
              }`}
            >
              {agentStatus}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onRunTests(selectedChallenge.id)}
              disabled={isTesting || isSolving}
              className="h-7 px-3 rounded-lg bg-black/60 hover:bg-white/10 border border-[#3d0b10] text-[#A7A7A7] hover:text-white text-[11px] font-medium flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              <Play className="w-3 h-3 text-[#ED3327]" />
              <span>{isTesting ? "Testing..." : "Run Tests"}</span>
            </button>

            <button
              data-testid="solve-challenge-btn"
              onClick={() => onSolveChallenge(selectedChallenge.id)}
              disabled={isSolving || isTesting}
              className="h-7 px-3.5 rounded-lg bg-[#ED3327] hover:bg-[#db2b20] active:bg-[#c42319] text-white text-[11px] font-semibold flex items-center gap-1.5 shadow-[0_0_12px_rgba(237,51,39,0.4)] transition-all disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isSolving ? "Solving..." : "Multi-Agent Solve"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
