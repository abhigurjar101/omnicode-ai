"use client";

import React, { useState } from "react";
import { ArrowRight, Cpu, Loader2, Sparkles, X, Terminal } from "lucide-react";

interface AutonomousTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (instruction: string, mode: string) => void;
  isLoading: boolean;
  defaultMode?: string;
}

export function AutonomousTaskModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  defaultMode = "BALANCED",
}: AutonomousTaskModalProps) {
  const [instruction, setInstruction] = useState("");
  const [mode, setMode] = useState(defaultMode);

  if (!isOpen) return null;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!instruction.trim() || isLoading) return;
    onSubmit(instruction.trim(), mode);
    onClose();
  };

  const quickActions = [
    { label: "Build feature", prompt: "Build a new feature: " },
    { label: "Fix bug", prompt: "Diagnose failing tests and fix the bug in: " },
    { label: "Review code", prompt: "Run complete architectural KISS, DRY, and security review on workspace" },
    { label: "Run tests", prompt: "Run full automated verification test suite and verify quality gates" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl select-none animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-[#090a0d] border border-[#3A1515] shadow-[0_30px_90px_rgba(237,51,39,0.25)] rounded-none overflow-hidden">
        {/* Header Bar */}
        <div className="h-12 px-5 border-b border-[#260f0f] bg-black flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-[#ED3327] animate-pulse"></span>
            <span className="text-white font-semibold tracking-wider uppercase">NEMI-CODE // Autonomous Instruction</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#888888] hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Input Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-mono text-[#888888] uppercase tracking-wider flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-[#ED3327]" />
              <span>Prompt / Engineering Directive</span>
            </label>
            <div className="relative">
              <textarea
                autoFocus
                rows={4}
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
                placeholder="Instruct the autonomous agent: build a feature, refactor code, fix tests, or analyze repository..."
                className="w-full bg-black/70 border border-[#2b1010] focus:border-[#ED3327] p-3 text-sm text-white placeholder-[#555555] font-mono focus:outline-none resize-none leading-relaxed"
              />
            </div>
          </div>

          {/* Quick Action Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[11px] text-[#666666] font-mono uppercase mr-1">Quick Directives:</span>
            {quickActions.map((action) => (
              <button
                key={action.label}
                type="button"
                onClick={() => setInstruction(action.prompt)}
                className="px-2.5 py-1 bg-black/60 hover:bg-[#150505] border border-[#260f0f] hover:border-[#ED3327]/60 text-[#A7A7A7] hover:text-white text-[11px] font-mono transition-all"
              >
                {action.label}
              </button>
            ))}
          </div>

          {/* Controls Bar */}
          <div className="pt-3 border-t border-[#200b0b] flex items-center justify-between">
            {/* Model Mode Dropdown */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-black border border-[#260f0f] text-xs font-mono text-[#A7A7A7]">
              <Cpu className="w-3.5 h-3.5 text-[#ED3327]" />
              <span className="text-[#666666]">Inference:</span>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                className="bg-transparent text-xs focus:outline-none cursor-pointer pr-1 text-white font-mono"
              >
                <option value="FAST" className="bg-[#080808] text-white">meta/llama-3.3-8b (Ultra Fast)</option>
                <option value="BALANCED" className="bg-[#080808] text-white">meta/llama-3.3-70b-instruct (Recommended)</option>
                <option value="DEEP" className="bg-[#080808] text-white">deepseek-ai/deepseek-r1 (Deep Reasoning)</option>
              </select>
            </div>

            {/* Launch Button */}
            <button
              type="submit"
              disabled={isLoading || !instruction.trim()}
              className={`px-6 py-2.5 text-xs font-sans font-medium flex items-center gap-2 transition-all ${
                isLoading || !instruction.trim()
                  ? "bg-[#1f0a0a] text-[#666666] border border-[#2d1212] cursor-not-allowed"
                  : "bg-[#ED3327] hover:bg-[#d92b20] active:bg-[#bf2016] text-white shadow-[0_0_20px_rgba(237,51,39,0.45)] cursor-pointer"
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Synthesizing...</span>
                </>
              ) : (
                <>
                  <span>Execute Agent</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
