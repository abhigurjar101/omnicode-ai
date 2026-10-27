"use client";

import React, { useState } from "react";
import { Check, Play, Circle, Terminal } from "lucide-react";

interface ExecutionOutputPanelProps {
  className?: string;
  isExecuting?: boolean;
  activeTab?: string;
}

export function ExecutionOutputPanel({
  className = "",
  isExecuting = false,
}: ExecutionOutputPanelProps) {
  const [activeOutputTab, setActiveOutputTab] = useState<"output" | "api" | "tests" | "logs">("output");

  const timelineSteps = isExecuting
    ? [
        { label: "Initializing NEMI agent...", status: "done", time: "00:00" },
        { label: "Loading project...", status: "done", time: "00:00" },
        { label: "Compiling TypeScript...", status: "done", time: "00:01" },
        { label: "Executing current file...", status: "running", time: "00:01" },
        { label: "Generating predictions...", status: "pending", time: "" },
      ]
    : [
        { label: "Initializing NEMI agent...", status: "done", time: "00:00" },
        { label: "Loading project...", status: "done", time: "00:00" },
        { label: "Installing dependencies...", status: "done", time: "00:02" },
        { label: "Compiling TypeScript...", status: "done", time: "00:02" },
        { label: "Running tests...", status: "done", time: "00:02" },
        { label: "All systems healthy...", status: "done", time: "00:00" },
        { label: "Ready.", status: "done", time: "00:00" },
      ];

  return (
    <div
      className={`rounded-2xl border border-[#ED3327]/60 bg-[#08080a]/80 backdrop-blur-xl shadow-[0_15px_35px_rgba(0,0,0,0.85)] flex flex-col overflow-hidden text-xs font-mono select-none ${className}`}
    >
      {/* 1. Header Bar: Title + Live Indicator + Elapsed Timer */}
      <div className="h-9 px-4 border-b border-[#2b0f0f] bg-black/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-sans font-bold text-white uppercase text-[11px] tracking-wide">
            Execution & Output
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[11px] text-[#4ade80]">
            <span className="w-2 h-2 rounded-full bg-[#4ade80] animate-pulse" />
            <span className="font-semibold">Live</span>
          </div>
          <span className="text-[#A7A7A7] text-[11px] tracking-wider">00:02:14</span>
        </div>
      </div>

      {/* 2. Compact Timeline Steps */}
      <div className="px-3 py-1 border-b border-[#200b0b] space-y-0 bg-black/20 text-[10px]">
        {timelineSteps.map((step, idx) => {
          const isDone = step.status === "done";
          const isRunning = step.status === "running";

          return (
            <div
              key={idx}
              className={`flex items-center justify-between py-0.2 ${
                isRunning
                  ? "text-[#ED3327] font-semibold"
                  : isDone
                  ? "text-[#CCCCCC]"
                  : "text-[#666666]"
              }`}
            >
              <div className="flex items-center gap-1.5 truncate">
                {isRunning ? (
                  <Play className="w-2.5 h-2.5 fill-[#ED3327] text-[#ED3327] shrink-0" />
                ) : (
                  <span className="text-[#888888] text-[9px]">&gt;</span>
                )}
                <span className="truncate">{step.label}</span>
              </div>

              <div className="flex items-center gap-1 shrink-0 ml-1.5">
                {isDone && <Check className="w-2.5 h-2.5 text-[#4ade80]" />}
                {isRunning && <span className="w-1.5 h-1.5 rounded-full bg-[#ED3327] animate-ping" />}
                <span className="text-[9px] text-[#888888]">{step.time}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Sub-Navigation Tabs */}
      <div className="h-7 px-2.5 border-b border-[#200b0b] bg-black/50 flex items-center gap-1 text-[10.5px]">
        <button
          onClick={() => setActiveOutputTab("output")}
          className={`px-2.5 py-0.5 rounded transition-all ${
            activeOutputTab === "output"
              ? "bg-[#ED3327] text-white font-semibold shadow-[0_0_8px_rgba(237,51,39,0.4)]"
              : "text-[#A7A7A7] hover:text-white"
          }`}
        >
          Output
        </button>
        <button
          onClick={() => setActiveOutputTab("api")}
          className={`px-2.5 py-0.5 rounded transition-all ${
            activeOutputTab === "api"
              ? "bg-[#ED3327] text-white font-semibold shadow-[0_0_8px_rgba(237,51,39,0.4)]"
              : "text-[#A7A7A7] hover:text-white"
          }`}
        >
          API Response
        </button>
        <button
          onClick={() => setActiveOutputTab("tests")}
          className={`px-2.5 py-0.5 rounded transition-all ${
            activeOutputTab === "tests"
              ? "bg-[#ED3327] text-white font-semibold shadow-[0_0_8px_rgba(237,51,39,0.4)]"
              : "text-[#A7A7A7] hover:text-white"
          }`}
        >
          Test Results
        </button>
        <button
          onClick={() => setActiveOutputTab("logs")}
          className={`px-2.5 py-0.5 rounded transition-all ${
            activeOutputTab === "logs"
              ? "bg-[#ED3327] text-white font-semibold shadow-[0_0_8px_rgba(237,51,39,0.4)]"
              : "text-[#A7A7A7] hover:text-white"
          }`}
        >
          Logs
        </button>
      </div>

      {/* 4. Tab Content: Formatted JSON with syntax highlighting matching image */}
      <div className="flex-1 p-2.5 overflow-y-auto bg-black/40 text-[10.5px] leading-[18px] custom-scrollbar">
        {activeOutputTab === "output" && (
          <div className="text-[#EAEAEA]">
            <div><span className="text-[#888888] mr-2">1</span>&#123;</div>
            <div><span className="text-[#888888] mr-2">2</span>  <span className="text-[#93c5fd]">&quot;status&quot;</span>: <span className="text-[#f59e0b]">200</span>,</div>
            <div><span className="text-[#888888] mr-2">3</span>  <span className="text-[#93c5fd]">&quot;message&quot;</span>: <span className="text-[#86efac]">&quot;Agent executed successfully&quot;</span>,</div>
            <div><span className="text-[#888888] mr-2">4</span>  <span className="text-[#93c5fd]">&quot;data&quot;</span>: &#123;</div>
            <div><span className="text-[#888888] mr-2">5</span>    <span className="text-[#93c5fd]">&quot;workspaceId&quot;</span>: <span className="text-[#86efac]">&quot;ws_12345&quot;</span>,</div>
            <div><span className="text-[#888888] mr-2">6</span>    <span className="text-[#93c5fd]">&quot;files&quot;</span>: [<span className="text-[#86efac]">&quot;auth.service.ts&quot;</span>, <span className="text-[#86efac]">&quot;api.ts&quot;</span>],</div>
            <div><span className="text-[#888888] mr-2">7</span>    <span className="text-[#93c5fd]">&quot;tests&quot;</span>: &#123;</div>
            <div><span className="text-[#888888] mr-2">8</span>      <span className="text-[#93c5fd]">&quot;passed&quot;</span>: <span className="text-[#f59e0b]">12</span>,</div>
            <div><span className="text-[#888888] mr-2">9</span>      <span className="text-[#93c5fd]">&quot;failed&quot;</span>: <span className="text-[#f59e0b]">1</span>,</div>
            <div><span className="text-[#888888] mr-2">10</span>     <span className="text-[#93c5fd]">&quot;skipped&quot;</span>: <span className="text-[#f59e0b]">3</span></div>
            <div><span className="text-[#888888] mr-2">11</span>   &#125;,</div>
            <div><span className="text-[#888888] mr-2">12</span>   <span className="text-[#93c5fd]">&quot;executionTime&quot;</span>: <span className="text-[#86efac]">&quot;2.34s&quot;</span></div>
            <div><span className="text-[#888888] mr-2">13</span> &#125;</div>
            <div><span className="text-[#888888] mr-2">14</span>&#125;</div>
          </div>
        )}

        {activeOutputTab === "api" && (
          <div className="text-[#CCCCCC] space-y-1">
            <div className="text-[#4ade80]">HTTP 200 OK — POST /api/agent/run</div>
            <div className="text-[#888888]">Latency: 142ms | NVIDIA H100 Tensor Core</div>
            <div className="text-[#EAEAEA]">&#123; &quot;success&quot;: true, &quot;model&quot;: &quot;meta/llama-3.3-70b-instruct&quot; &#125;</div>
          </div>
        )}

        {activeOutputTab === "tests" && (
          <div className="text-[#CCCCCC] space-y-1">
            <div className="text-[#4ade80]">✔ test_agent_workflow.py (12 passed)</div>
            <div className="text-[#ef4444]">✘ test_auth_token.py (1 failed)</div>
            <div className="text-[#888888]">36 total tests in 1.59s</div>
          </div>
        )}

        {activeOutputTab === "logs" && (
          <div className="text-[#888888] space-y-0.5">
            <div>[INFO] Initialized LangGraph checkpointer (SQLite)</div>
            <div>[INFO] NVIDIA inference endpoint: integrate.api.nvidia.com</div>
            <div>[DEBUG] Synthesizing minimal patch AST</div>
          </div>
        )}
      </div>
    </div>
  );
}
