"use client";

import React, { useState, useRef, useEffect } from "react";
import { Sparkles, MoreHorizontal, Send, CheckCircle2, AlertCircle, ArrowUpRight, Undo2, RotateCw } from "lucide-react";
import { NemiRobotScene, RobotState } from "@/components/canvas/NemiRobotScene";

export interface ChatMsg {
  id?: string;
  role: "user" | "agent";
  content: string;
  fileModified?: string;
  canUndo?: boolean;
}

interface NemiRobotAssistantPanelProps {
  robotState?: RobotState;
  statusTitle?: string;
  statusSubtitle?: string;
  previewUrl?: string;
  messages?: ChatMsg[];
  isExecuting?: boolean;
  onSendMessage?: (msg: string) => void;
  onUndoLastEdit?: () => void;
  onClearChat?: () => void;
}

export function NemiRobotAssistantPanel({
  robotState = "idle",
  statusTitle = "Build successful!",
  statusSubtitle = "Preview live at",
  previewUrl = "http://localhost:5173",
  messages = [],
  isExecuting = false,
  onSendMessage,
  onUndoLastEdit,
  onClearChat,
}: NemiRobotAssistantPanelProps) {
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isExecuting) return;
    const msg = inputValue.trim();
    setInputValue("");
    if (onSendMessage) onSendMessage(msg);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getStatusIcon = () => {
    if (robotState === "error") {
      return <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />;
    }
    if (isExecuting || robotState === "thinking" || robotState === "coding" || robotState === "testing") {
      return <RotateCw className="w-4 h-4 text-[#ED3327] shrink-0 animate-spin" />;
    }
    return <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />;
  };

  const getStatusTextColor = () => {
    if (robotState === "error") return "text-red-400";
    if (isExecuting) return "text-[#ED3327]";
    return "text-white";
  };

  return (
    <div className="h-full flex flex-col bg-[#0b0b0e] border border-white/[0.08] rounded-xl overflow-hidden shadow-2xl select-none">
      {/* 1. Header (✦ NEMI AI Coding Agent ...) */}
      <div className="h-12 px-4 bg-[#111116] border-b border-white/[0.08] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-4 h-4 text-[#ED3327] flex items-center justify-center">
            <Sparkles className="w-4 h-4 fill-[#ED3327]" />
          </div>
          <div className="flex flex-col">
            <span className="font-heading font-semibold text-sm tracking-tight text-white leading-none">
              NEMI
            </span>
            <span className="text-[10px] text-white/40 tracking-wider font-mono">
              AI Coding Agent
            </span>
          </div>
        </div>

        <button
          onClick={onClearChat}
          className="text-white/40 hover:text-white transition-colors p-1 rounded"
          title="Chat Options / Clear"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* 2. Robot Display Card */}
      <div className="relative h-[240px] sm:h-[260px] bg-gradient-to-b from-[#111116]/80 via-black to-[#0e0709] overflow-hidden shrink-0 border-b border-white/[0.06]">
        {/* Soft crimson radial aura behind robot head */}
        <div
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{
            background: "radial-gradient(circle at 50% 45%, rgba(237, 51, 39, 0.45) 0%, rgba(20, 2, 4, 0.1) 60%, transparent 80%)",
          }}
        />

        {/* 3D WebGL Nemi Robot Scene */}
        <div className="w-full h-full relative z-10 pointer-events-auto">
          <NemiRobotScene state={robotState} />
        </div>
      </div>

      {/* 3. Minimalist AI Chat Feed (Scrollable, concise) */}
      <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-2.5 text-xs">
        {messages.map((msg, idx) => (
          <div
            key={msg.id || idx}
            className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
          >
            <div
              className={`max-w-[90%] px-3 py-2 rounded-lg leading-relaxed ${
                msg.role === "user"
                  ? "bg-[#ED3327] text-white shadow-sm"
                  : "bg-white/[0.04] border border-white/[0.08] text-zinc-300"
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>

              {msg.fileModified && (
                <div className="mt-1.5 pt-1.5 border-t border-white/10 flex items-center justify-between gap-2 text-[10px] text-zinc-400 font-mono">
                  <span>Modified: {msg.fileModified}</span>
                  {msg.canUndo && onUndoLastEdit && (
                    <button
                      onClick={onUndoLastEdit}
                      className="text-[#ED3327] hover:underline flex items-center gap-0.5 cursor-pointer"
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
        <div ref={messagesEndRef} />
      </div>

      {/* 5. Minimal AI Chat Input Box (Matching Reference Image) */}
      <form
        onSubmit={handleSubmit}
        className="p-3 bg-[#111116] border-t border-white/[0.08] shrink-0"
      >
        <div className="h-10 bg-black/60 border border-white/[0.12] focus-within:border-[#ED3327]/60 rounded-lg px-3 flex items-center gap-2 transition-all">
          <Sparkles className="w-3.5 h-3.5 text-[#ED3327] shrink-0 opacity-70" />
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isExecuting}
            placeholder="Ask NEMI anything..."
            className="flex-1 bg-transparent text-xs text-white placeholder:text-white/40 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isExecuting}
            className="w-7 h-7 bg-[#ED3327] hover:bg-[#d6261c] disabled:opacity-30 disabled:hover:bg-[#ED3327] text-white rounded flex items-center justify-center transition-all cursor-pointer shadow-md shadow-[#ED3327]/30"
          >
            <Send className="w-3 h-3" />
          </button>
        </div>
      </form>
    </div>
  );
}
