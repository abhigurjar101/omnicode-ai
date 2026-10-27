"use client";

import React, { useState } from "react";
import { ArrowRight, Cpu, Loader2 } from "lucide-react";

interface TaskComposerProps {
  onSubmit: (instruction: string, mode: string) => void;
  isLoading: boolean;
  defaultMode?: string;
  onFocusChange?: (focused: boolean) => void;
  onOpenWorkspace?: () => void;
}

export function TaskComposer({
  onSubmit,
  isLoading,
  defaultMode = "BALANCED",
  onFocusChange,
  onOpenWorkspace,
}: TaskComposerProps) {
  const [instruction, setInstruction] = useState("");
  const [mode, setMode] = useState(defaultMode);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!instruction.trim() || isLoading) return;
    onSubmit(instruction.trim(), mode);
  };

  const quickActions = [
    { label: "Build feature", prompt: "Build a new feature: " },
    { label: "Fix bug", prompt: "Diagnose failing tests and fix the bug in: " },
    { label: "Review code", prompt: "Run complete architectural KISS, DRY, and security review on workspace" },
    { label: "Run tests", prompt: "Run full automated verification test suite and verify quality gates" },
  ];

  return (
    <div className="w-full flex flex-col items-start text-left select-none max-w-xl">
      {/* Editorial Headline matching Junca Studio typography in Image 2 */}
      <h1 className="text-3xl sm:text-5xl font-normal tracking-tight text-white leading-[1.18] mb-8 font-sans">
        We build autonomous software intelligence for the world&apos;s most ambitious engineering teams.
      </h1>

      {/* Luxury Minimal Floating Prompt Input Bar */}
      <form onSubmit={handleSubmit} className="w-full space-y-3">
        <div className="w-full bg-[#050608]/90 backdrop-blur-xl border border-[#2b1010] hover:border-[#ED3327]/70 transition-all rounded-sm flex items-center p-1.5 shadow-[0_20px_40px_rgba(0,0,0,0.8)]">
          <div className="px-3 text-[#ED3327] font-mono text-sm font-bold">&gt;</div>
          <input
            type="text"
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            onFocus={() => onFocusChange?.(true)}
            onBlur={() => onFocusChange?.(false)}
            placeholder="What should we build today?"
            className="flex-1 bg-transparent py-2.5 text-sm text-white placeholder-[#666666] focus:outline-none font-sans"
          />

          {/* Model Mode Dropdown */}
          <div className="hidden sm:flex items-center gap-1 px-2 py-1 bg-black border border-[#222222] text-[11px] font-mono text-[#A7A7A7] mr-1.5">
            <Cpu className="w-3 h-3 text-[#ED3327]" />
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              className="bg-transparent text-[11px] focus:outline-none cursor-pointer pr-1 text-white"
            >
              <option value="FAST" className="bg-[#080808] text-white">LLaMA 8B</option>
              <option value="BALANCED" className="bg-[#080808] text-white">LLaMA 70B</option>
              <option value="DEEP" className="bg-[#080808] text-white">DeepSeek R1</option>
            </select>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={isLoading || !instruction.trim()}
            className={`px-4 py-2 text-xs font-sans font-medium flex items-center gap-2 rounded-sm transition-all ${
              isLoading || !instruction.trim()
                ? "bg-[#1f0a0a] text-[#666666] border border-[#2d1212] cursor-not-allowed"
                : "bg-[#ED3327] hover:bg-[#d92b20] active:bg-[#bf2016] text-white shadow-[0_0_15px_rgba(237,51,39,0.4)]"
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Running...</span>
              </>
            ) : (
              <>
                <span>Execute</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>

        {/* Quick Action Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[11px] text-[#666666] font-mono uppercase mr-1">Quick Tasks:</span>
          {quickActions.map((action) => (
            <button
              key={action.label}
              type="button"
              onClick={() => setInstruction(action.prompt)}
              className="px-2.5 py-1 bg-black/60 hover:bg-[#150505] border border-[#260f0f] hover:border-[#ED3327]/60 text-[#A7A7A7] hover:text-white text-[11px] font-mono transition-all rounded-sm"
            >
              {action.label}
            </button>
          ))}
        </div>
      </form>
    </div>
  );
}
