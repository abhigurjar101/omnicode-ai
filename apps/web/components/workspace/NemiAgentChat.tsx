"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Send,
  Loader2,
  Trash2,
  Cpu,
  FileCode,
  CheckCircle2,
  XCircle,
  Undo2,
  Check,
  X,
} from "lucide-react";

export type AgentShortStatus =
  | "Analyzing"
  | "Coding"
  | "Testing"
  | "Debugging"
  | "Passed"
  | "Failed"
  | "Writing code"
  | "Fixed"
  | "Idle";

export interface ChatMessage {
  id?: string;
  role: "user" | "agent";
  content: string;
  status?: AgentShortStatus;
  fileModified?: string;
  diff?: string;
  canUndo?: boolean;
  hasPendingPatch?: boolean;
}

interface NemiAgentChatProps {
  className?: string;
  onSendMessage: (msg: string) => void;
  isLoading?: boolean;
  agentStatus?: AgentShortStatus;
  messages?: ChatMessage[];
  onClearChat?: () => void;
  onUndoPatch?: () => void;
  onAcceptPatch?: () => void;
  onRejectPatch?: () => void;
}

export function NemiAgentChat({
  className = "",
  onSendMessage,
  isLoading = false,
  agentStatus = "Idle",
  messages: externalMessages,
  onClearChat,
  onUndoPatch,
  onAcceptPatch,
  onRejectPatch,
}: NemiAgentChatProps) {
  const [input, setInput] = useState("");
  const [internalMessages, setInternalMessages] = useState<ChatMessage[]>([
    {
      role: "agent",
      content: "AI coding agent ready. Describe what you want to build, edit, or test.",
    },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const displayMessages = externalMessages && externalMessages.length > 0 ? externalMessages : internalMessages;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [displayMessages, isLoading, agentStatus]);

  const quickActions = [
    {
      label: "Build a modern landing page",
      prompt: "Build a high-converting, modern landing page with dark crimson aesthetics.",
    },
    {
      label: "Create a REST API with authentication",
      prompt: "Create a fast FastAPI REST API with JWT authentication and rate limiting.",
    },
    {
      label: "Set up a database schema",
      prompt: "Design and implement a PostgreSQL database schema with migration scripts.",
    },
    {
      label: "Debug this error message",
      prompt: "Analyze the open file and failing test suite, identify the bug, and apply a minimal fix.",
    },
  ];

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    if (!externalMessages) {
      setInternalMessages((prev) => [...prev, { role: "user", content: userText }]);
    }
    setInput("");
    onSendMessage(userText);
  };

  const handleSelectChip = (prompt: string) => {
    if (!externalMessages) {
      setInternalMessages((prev) => [...prev, { role: "user", content: prompt }]);
    }
    onSendMessage(prompt);
  };

  const hasUserMessages = displayMessages.some((m) => m.role === "user");

  return (
    <div
      className={`rounded-2xl border border-[#ED3327]/60 bg-[#08080a]/90 backdrop-blur-xl shadow-[0_15px_35px_rgba(0,0,0,0.85)] flex flex-col overflow-hidden text-xs font-sans ${className}`}
    >
      {/* 1. Header: Minimalist Title + Status + Clear */}
      <div className="h-10 px-3 border-b border-[#2b0f0f] bg-black/60 flex items-center justify-between select-none shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5">
            <span className="w-1 h-3.5 bg-[#ED3327] -skew-x-12" />
            <span className="w-1 h-3.5 bg-[#ED3327] -skew-x-12" />
          </div>
          <span className="font-bold text-white text-[12px] tracking-wide">NEMI Agent</span>

          {/* Short Agent Status Pill */}
          {isLoading && agentStatus !== "Idle" ? (
            <span className="px-2 py-0.5 rounded-full bg-[#1e0709] border border-[#ED3327] text-[#ED3327] text-[10px] font-mono flex items-center gap-1 animate-pulse">
              <Loader2 className="w-2.5 h-2.5 animate-spin" />
              <span>{agentStatus}</span>
            </span>
          ) : agentStatus === "Passed" || agentStatus === "Fixed" ? (
            <span data-testid="chat-agent-status-passed" className="px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 text-[10px] font-mono flex items-center gap-1">
              <CheckCircle2 className="w-2.5 h-2.5" />
              <span>{agentStatus}</span>
            </span>
          ) : agentStatus === "Failed" ? (
            <span data-testid="chat-agent-status-failed" className="px-2 py-0.5 rounded-full bg-rose-950/60 border border-rose-500/40 text-rose-400 text-[10px] font-mono flex items-center gap-1">
              <XCircle className="w-2.5 h-2.5" />
              <span>Failed</span>
            </span>
          ) : null}
        </div>

        {onClearChat && (
          <button
            onClick={onClearChat}
            className="p-1.5 hover:bg-white/10 text-[#777777] hover:text-white rounded transition-colors"
            title="Clear conversation"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* 2. Chat Conversation Body */}
      <div className="flex-1 p-3 overflow-y-auto space-y-2.5 custom-scrollbar">
        {/* Quick prompt cards (only shown when conversation has not started) */}
        {!hasUserMessages && (
          <div className="space-y-2 pb-2">
            <div className="text-[12px] text-[#A7A7A7] font-medium">
              What would you like to build today?
            </div>
            <div className="grid grid-cols-1 gap-1.5">
              {quickActions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectChip(action.prompt)}
                  className="p-2 rounded-lg bg-black/50 hover:bg-[#1a0808] border border-[#2b0f0f] hover:border-[#ED3327]/60 text-[11px] text-[#D4D4D4] hover:text-white transition-all text-left flex items-center justify-between group cursor-pointer"
                >
                  <span>{action.label}</span>
                  <Sparkles className="w-3 h-3 text-[#ED3327] opacity-60 group-hover:opacity-100" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message Stream */}
        {displayMessages.map((m, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}
          >
            <div
              className={`max-w-[95%] px-3 py-2 rounded-xl text-[11.5px] leading-relaxed ${
                m.role === "user"
                  ? "bg-[#ED3327] text-white shadow-[0_0_10px_rgba(237,51,39,0.3)] font-medium"
                  : "bg-black/60 border border-[#260f0f] text-[#E0E0E0]"
              }`}
            >
              {m.role === "agent" && (
                <div className="flex items-center gap-1 mb-1 text-[10px] text-[#ED3327] font-mono font-bold">
                  <Cpu className="w-2.5 h-2.5" />
                  <span>Agent</span>
                </div>
              )}

              <div className="whitespace-pre-wrap font-sans select-text">{m.content}</div>

              {/* Diff snippet for proposed patches */}
              {m.diff && (
                <div className="mt-2 p-2 rounded bg-black/70 border border-[#331111] text-[10px] font-mono overflow-x-auto text-[#CCCCCC] custom-scrollbar max-h-36">
                  <pre className="whitespace-pre">{m.diff}</pre>
                </div>
              )}

              {/* Action buttons for pending patch */}
              {m.hasPendingPatch && onAcceptPatch && (
                <div className="mt-2.5 pt-2 border-t border-[#331111] flex items-center gap-2">
                  <button
                    onClick={onAcceptPatch}
                    className="px-2.5 py-1 rounded bg-[#ED3327] hover:bg-[#db2b20] active:bg-[#c42319] text-white font-medium text-[11px] flex items-center gap-1 shadow-[0_0_10px_rgba(237,51,39,0.3)] transition-all cursor-pointer"
                  >
                    <Check className="w-3 h-3" />
                    <span>Apply Patch</span>
                  </button>
                  {onRejectPatch && (
                    <button
                      onClick={onRejectPatch}
                      className="px-2.5 py-1 rounded bg-black/60 hover:bg-white/10 border border-[#331111] text-[#999999] hover:text-white text-[11px] transition-all cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                      <span>Dismiss</span>
                    </button>
                  )}
                </div>
              )}

              {/* Compact file patch badge */}
              {m.fileModified && (
                <div className="mt-2 pt-1.5 border-t border-[#260f0f] flex items-center justify-between gap-2 text-[10.5px] font-mono">
                  <div className="flex items-center gap-1 text-[#86efac]">
                    <FileCode className="w-3 h-3 text-[#ED3327]" />
                    <span className="truncate">{m.fileModified}</span>
                  </div>
                  {m.canUndo && onUndoPatch && (
                    <button
                      onClick={onUndoPatch}
                      className="px-2 py-0.5 rounded bg-black/60 hover:bg-[#1a0808] border border-[#ED3327]/50 text-[#ED3327] hover:text-white flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <Undo2 className="w-2.5 h-2.5" />
                      <span>Undo</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Short inline agent working status */}
        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-[#ED3327] font-mono p-2 bg-[#120406] border border-[#331111] rounded-xl">
            <Loader2 className="w-3 h-3 animate-spin shrink-0" />
            <span className="font-semibold">{agentStatus !== "Idle" ? agentStatus : "Writing code"}...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 3. Bottom Minimalist Composer */}
      <div className="p-2.5 border-t border-[#2b0f0f] bg-black/60 shrink-0 select-none">
        <form
          onSubmit={handleSend}
          className="rounded-xl border border-[#2b0f0f] focus-within:border-[#ED3327]/80 bg-[#050608] p-2 transition-all flex items-center gap-2 shadow-[0_4px_12px_rgba(0,0,0,0.6)]"
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask agent to write code, edit file, or debug (Enter to send)..."
            rows={1}
            className="flex-1 bg-transparent text-xs text-white placeholder-[#555555] focus:outline-none resize-none font-sans leading-relaxed py-1"
          />

          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="w-7 h-7 rounded-lg bg-[#ED3327] hover:bg-[#db2b20] active:bg-[#c42319] disabled:opacity-30 text-white flex items-center justify-center transition-all shadow-[0_0_10px_rgba(237,51,39,0.4)] shrink-0"
            title="Send instruction"
          >
            <Send className="w-3 h-3" />
          </button>
        </form>
      </div>
    </div>
  );
}
