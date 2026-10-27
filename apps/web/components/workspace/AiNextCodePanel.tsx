"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  Sparkles,
  ArrowRight,
  RefreshCw,
  PlusCircle,
} from "lucide-react";

interface Suggestion {
  title: string;
  code: string;
  explanation: string;
}

interface AiNextCodePanelProps {
  className?: string;
  onApplyCode?: (code: string) => void;
  activeFile?: string;
  fileContent?: string;
  apiBase?: string;
}

export function AiNextCodePanel({
  className = "",
  onApplyCode,
  activeFile = "code.ts",
  fileContent = "",
  apiBase = "http://localhost:8000",
}: AiNextCodePanelProps) {
  const [copied, setCopied] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [modelName, setModelName] = useState<string>("nvidia/nemotron-3.5-bolt-e4b");

  const [suggestions, setSuggestions] = useState<Suggestion[]>([
    {
      title: "Token Refresh Handler",
      code: `const refreshToken = async () => {\n  const res = await fetch('/api/auth/refresh', {\n    method: 'POST',\n    headers: { 'Content-Type': 'application/json' },\n    body: JSON.stringify({ token })\n  });\n  return await res.json();\n};`,
      explanation: "Asynchronous bearer token refresh with automatic renewal.",
    },
    {
      title: "Agent Execution Stream",
      code: `const runAgentStream = async (instruction: string) => {\n  const response = await fetch('/api/agent/run', {\n    method: 'POST',\n    headers: { 'Content-Type': 'application/json' },\n    body: JSON.stringify({ instruction, routing_mode: 'BALANCED' })\n  });\n  return await response.json();\n};`,
      explanation: "Executes autonomous engineering LangGraph DAG with streaming response.",
    },
  ]);

  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      fetchPredictions();
    }, 800);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [activeFile, fileContent]);

  const fetchPredictions = async () => {
    if (!activeFile && !fileContent) return;
    setIsLoading(true);

    try {
      const res = await fetch(`${apiBase}/api/workspace/next-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          file_path: activeFile,
          current_content: fileContent,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.suggestions && Array.isArray(data.suggestions) && data.suggestions.length > 0) {
          setSuggestions(data.suggestions);
          setCurrentIdx(0);
        }
        if (data.model) {
          setModelName(data.model);
        }
      }
    } catch (e) {
      console.warn("Failed to fetch live code prediction", e);
    } finally {
      setIsLoading(false);
    }
  };

  const currentSuggestion = suggestions[currentIdx] || suggestions[0];

  const handleCopy = () => {
    if (!currentSuggestion?.code) return;
    navigator.clipboard.writeText(currentSuggestion.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApply = () => {
    if (onApplyCode && currentSuggestion?.code) {
      onApplyCode(currentSuggestion.code);
    }
  };

  const codeLines = (currentSuggestion?.code || "").split("\n");

  return (
    <div
      className={`flex flex-col overflow-hidden text-xs font-mono h-full w-full ${className}`}
    >
      {/* 1. Header Bar: Title + Pagination + Refresh + Copy Button */}
      <div className="h-9 px-3 border-b border-[#2b0f0f] bg-black/40 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1.5 truncate max-w-[55%]">
          <Sparkles className="w-3.5 h-3.5 text-[#ED3327] shrink-0" />
          <span className="font-sans font-bold text-white uppercase text-[11px] tracking-wide truncate">
            AI Next Code
          </span>
          <span className="text-[#888888] text-[10px] font-sans shrink-0">(Predicted)</span>
          {isLoading ? (
            <span className="w-1.5 h-1.5 rounded-full bg-[#ED3327] animate-ping shrink-0" />
          ) : (
            <span className="text-[#888888] text-[9px] font-sans truncate hidden sm:inline">
              ({currentIdx + 1}/{suggestions.length})
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {/* Refresh Button */}
          <button
            onClick={fetchPredictions}
            disabled={isLoading}
            className="p-1 rounded hover:bg-white/10 text-[#888888] hover:text-white transition-colors"
            title="Refresh AI predictions from NVIDIA"
          >
            <RefreshCw className={`w-3 h-3 ${isLoading ? "animate-spin text-[#ED3327]" : ""}`} />
          </button>

          {/* Pagination < > */}
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 1))}
              disabled={currentIdx === 0}
              className="p-1 rounded hover:bg-white/10 disabled:opacity-30 text-[#CCCCCC]"
              title="Previous suggestion"
            >
              <ChevronLeft className="w-3 h-3" />
            </button>
            <button
              onClick={() => setCurrentIdx((prev) => Math.min(suggestions.length - 1, prev + 1))}
              disabled={currentIdx === suggestions.length - 1}
              className="p-1 rounded hover:bg-white/10 disabled:opacity-30 text-[#CCCCCC]"
              title="Next suggestion"
            >
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="h-6 px-2 rounded bg-black/60 hover:bg-[#1a0808] border border-[#331111] hover:border-[#ED3327]/60 flex items-center gap-1 text-[10px] text-[#CCCCCC] hover:text-white transition-all"
            title="Copy snippet"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-[#4ade80]" />
                <span className="text-[#4ade80]">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 text-[#888888]" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Suggestion Title & Rationale Banner */}
      <div className="px-3 py-1.5 bg-[#140507] border-b border-[#2b0f0f] flex items-center justify-between text-[10.5px]">
        <div className="truncate mr-2">
          <span className="font-bold text-white uppercase text-[10px] font-sans">
            {currentSuggestion?.title || "Next Code Snippet"}
          </span>
          <span className="text-[#888888] font-sans ml-1.5 truncate hidden sm:inline">
            — {currentSuggestion?.explanation}
          </span>
        </div>

        {onApplyCode && (
          <button
            onClick={handleApply}
            className="px-2 py-0.5 rounded bg-[#ED3327] hover:bg-[#db2b20] active:bg-[#c42319] text-white text-[10px] font-medium font-sans flex items-center gap-1 shrink-0 transition-all shadow-[0_0_8px_rgba(237,51,39,0.3)]"
            title="Insert this code into active editor tab"
          >
            <PlusCircle className="w-2.5 h-2.5" />
            <span>Apply</span>
          </button>
        )}
      </div>

      {/* 2. Predicted Code Content */}
      <div className="flex-1 p-2.5 overflow-y-auto bg-black/40 text-[11px] leading-[18px] custom-scrollbar font-mono text-[#EAEAEA]">
        <div className="space-y-0.5">
          {codeLines.map((line, idx) => (
            <div key={idx} className="flex">
              <span className="text-[#555555] mr-2 w-5 text-right select-none shrink-0 font-mono text-[10px]">
                {idx + 1}
              </span>
              <span className="text-[#dcdfe4] font-mono whitespace-pre select-text">
                {line}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
