"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  Circle,
  Clock,
  ChevronDown,
  ChevronRight,
  Terminal,
  Award,
  Layers,
} from "lucide-react";

export type ExecutionStage = "idle" | "understanding" | "planning" | "building" | "testing" | "completed" | "failed";

interface TaskTimelineProps {
  currentStage: ExecutionStage;
  planSteps?: Array<{ step_id: number; description: string; tool_hint?: string }>;
  report?: string;
  scorecard?: any;
  toolCalls?: any[];
  modelName?: string;
}

export function TaskTimeline({
  currentStage,
  planSteps = [],
  report = "",
  scorecard = null,
  toolCalls = [],
  modelName = "meta/llama-3.3-70b-instruct",
}: TaskTimelineProps) {
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  const stages = [
    { id: "understanding", name: "Understanding", description: "Parsing AST & semantic memory recall" },
    { id: "planning", name: "Planning", description: "Synthesizing minimal sufficient patch" },
    { id: "building", name: "Building", description: "Applying edits inside sandboxed runtime" },
    { id: "testing", name: "Testing", description: "Executing automated verification suite" },
    { id: "completed", name: "Completed", description: "KISS optimization & episodic consolidation" },
  ];

  const getStageStatus = (stageId: string) => {
    if (currentStage === "idle") return "pending";
    if (currentStage === "completed") return "done";
    if (currentStage === "failed") return "failed";

    const order = ["understanding", "planning", "building", "testing", "completed"];
    const currentIndex = order.indexOf(currentStage);
    const stageIndex = order.indexOf(stageId);

    if (stageIndex < currentIndex) return "done";
    if (stageIndex === currentIndex) return "active";
    return "pending";
  };

  return (
    <div className="w-full bg-[#080808]/90 backdrop-blur-xl border border-[#3A1515] p-5 sm:p-6 space-y-5 text-left font-mono select-none">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between pb-3.5 border-b border-[#3A1515] gap-2">
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-[#ED3327] animate-pulse"></span>
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Autonomous Execution Timeline
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[#A7A7A7] bg-black px-2.5 py-1 border border-[#3A1515]">
            MODEL: {modelName.split("/").pop()}
          </span>
          {scorecard && (
            <span
              className={`px-2.5 py-0.5 text-[10px] font-bold border ${
                scorecard.release_gate_passed
                  ? "bg-[#140808] text-[#ED3327] border-[#ED3327]"
                  : "bg-black text-[#B63849] border-[#B63849]"
              }`}
            >
              {scorecard.release_gate_passed ? "RELEASE GATE PASSED" : "BLOCKED"}
            </span>
          )}
        </div>
      </div>

      {/* 5-Stage Stepper Component */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
        {stages.map((stage) => {
          const status = getStageStatus(stage.id);
          return (
            <div
              key={stage.id}
              className={`p-3 border transition-all ${
                status === "done"
                  ? "bg-[#140808] border-[#ED3327] text-white"
                  : status === "active"
                  ? "bg-[#1f0a0a] border-[#ED3327] text-white shadow-[0_0_15px_rgba(237,51,39,0.3)]"
                  : "bg-black/60 border-[#260f0f] text-[#555555]"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                {status === "done" ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#ED3327] flex-shrink-0" />
                ) : status === "active" ? (
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-[#ED3327] border-t-transparent animate-spin flex-shrink-0" />
                ) : (
                  <Circle className="w-3.5 h-3.5 text-[#3A1515] flex-shrink-0" />
                )}
                <span className="text-xs font-bold uppercase tracking-wider">{stage.name}</span>
              </div>
              <p className="text-[10px] leading-tight text-[#A7A7A7] font-sans">
                {stage.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Plan Steps if available */}
      {planSteps.length > 0 && (
        <div className="space-y-1.5 pt-1">
          <div className="text-[11px] font-bold text-white uppercase tracking-wider">
            Synthesized Plan
          </div>
          <div className="space-y-1">
            {planSteps.map((step) => (
              <div
                key={step.step_id}
                className="p-2 bg-black border border-[#2b1010] flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 bg-[#140808] border border-[#3A1515] text-[#ED3327] flex items-center justify-center text-[10px] font-bold">
                    {step.step_id}
                  </span>
                  <span className="text-[#EAEAEA]">{step.description}</span>
                </div>
                {step.tool_hint && (
                  <span className="px-1.5 py-0.5 bg-[#140808] text-[9px] text-[#ED3327] border border-[#3A1515]">
                    {step.tool_hint}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Scorecard Quality Matrix */}
      {scorecard && (
        <div className="p-3.5 bg-black border border-[#3A1515] space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-[#ED3327]" />
              <span className="text-xs font-bold text-white uppercase">Quality Verification</span>
            </div>
            <div className="text-lg font-bold text-white">
              {scorecard.overall_score}
              <span className="text-xs font-normal text-[#A7A7A7]"> / 10.0</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-[10px]">
            {scorecard.metrics &&
              Object.entries(scorecard.metrics).map(([key, metric]: [string, any]) => (
                <div key={key} className="p-2 bg-[#0c0505] border border-[#260f0f]">
                  <div className="text-[#A7A7A7] uppercase">{key.replace(/_/g, " ")}</div>
                  <div className="font-bold text-white mt-0.5">{metric.score} / 10.0</div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Final Markdown Report */}
      {report && (
        <div className="space-y-1.5 pt-1">
          <div className="text-[11px] font-bold text-white uppercase tracking-wider">
            Execution Report
          </div>
          <div className="p-3 bg-black text-[#EAEAEA] text-xs leading-relaxed whitespace-pre-wrap overflow-x-auto border border-[#3A1515]">
            {report}
          </div>
        </div>
      )}

      {/* Expandable Technical Details */}
      <div className="pt-2 border-t border-[#3A1515]">
        <button
          onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
          className="flex items-center gap-1.5 text-[11px] text-[#A7A7A7] hover:text-white"
        >
          {showTechnicalDetails ? (
            <ChevronDown className="w-3.5 h-3.5 text-[#ED3327]" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-[#ED3327]" />
          )}
          <span>Advanced Diagnostics (LangGraph, StateGraph, SQLite Persistence)</span>
        </button>

        {showTechnicalDetails && (
          <div className="mt-2.5 p-3 bg-black border border-[#2b1010] space-y-1 text-[11px] text-[#A7A7A7]">
            <div>• Controller: LangGraph StateGraph (Deterministic cycle)</div>
            <div>• Checkpoint: SQLite persistence with thread resumption</div>
            <div>• NVIDIA Inference: {modelName}</div>
            <div>• Sandbox Status: Subprocess isolation with credential sanitization</div>
          </div>
        )}
      </div>
    </div>
  );
}
