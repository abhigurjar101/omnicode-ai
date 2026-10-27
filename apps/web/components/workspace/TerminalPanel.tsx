"use client";

import React, { useState } from "react";
import { Terminal as TerminalIcon, ChevronUp, ChevronDown, Trash2 } from "lucide-react";

interface TerminalPanelProps {
  className?: string;
  output?: string;
  onClear?: () => void;
  onExecuteCommand?: (command: string) => void;
  onClose?: () => void;
  isExecuting?: boolean;
}

export function TerminalPanel({
  className = "",
  output = "",
  onClear,
  onExecuteCommand,
  onClose,
  isExecuting = false,
}: TerminalPanelProps) {
  const [commandInput, setCommandInput] = useState("");

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commandInput.trim() || isExecuting) return;
    if (onExecuteCommand) {
      onExecuteCommand(commandInput.trim());
    }
    setCommandInput("");
  };

  const defaultViteLog = `> npm run dev\n\x1b[32m  ✓\x1b[0m VITE v5.2.0  ready in 362ms\n\n  ➜  Local:   http://localhost:5173\n  ➜  press h to show help\n`;

  const formatText = (text: string) => {
    return text.replace(/\x1b\[32m/g, "").replace(/\x1b\[0m/g, "");
  };

  return (
    <div
      className={`h-full flex flex-col bg-[#0b0b0e] border border-white/[0.08] rounded-xl overflow-hidden shadow-2xl text-xs font-mono select-none ${className}`}
    >
      {/* 1. Header Bar: >_ Terminal + Collapse toggle */}
      <div className="h-9 px-3 bg-[#111116] border-b border-white/[0.08] flex items-center justify-between shrink-0 select-none">
        <div className="flex items-center gap-2">
          {/* Active Terminal Tab with bottom indicator */}
          <div className="h-9 px-2 flex items-center gap-1.5 text-white font-medium text-xs border-b-2 border-[#ED3327]">
            <TerminalIcon className="w-3.5 h-3.5 text-[#ED3327]" />
            <span>Terminal</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onClear && (
            <button
              onClick={onClear}
              className="p-1 hover:bg-white/10 text-white/50 hover:text-white rounded transition-colors"
              title="Clear Terminal"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}

          {onClose && (
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/10 text-white/60 hover:text-white rounded transition-colors cursor-pointer"
              title="Collapse Terminal"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Terminal Output Stream */}
      <div className="flex-1 min-h-0 p-3 bg-black/60 overflow-y-auto flex flex-col justify-between font-mono text-zinc-300 select-text">
        <div className="space-y-1">
          {output ? (
            <div className="whitespace-pre-wrap text-zinc-300 text-[11px] leading-relaxed">
              {formatText(output)}
            </div>
          ) : (
            <div className="text-zinc-600 text-[11px] py-1 select-none">
              Terminal ready. Type a command (e.g. python3 palindrome.py, ls) or run code from the editor.
            </div>
          )}
        </div>

        {/* 3. Interactive Command Input Prompt */}
        <form
          onSubmit={handleCommandSubmit}
          className="flex items-center gap-2 pt-2 border-t border-white/[0.06] shrink-0 mt-2"
        >
          <span className="text-[#ED3327] font-bold select-none">&gt;</span>
          <input
            type="text"
            value={commandInput}
            onChange={(e) => setCommandInput(e.target.value)}
            disabled={isExecuting}
            placeholder={isExecuting ? "Running process..." : "type command (e.g. npm test, git status, ls)..."}
            className="flex-1 bg-transparent text-white placeholder-zinc-600 focus:outline-none font-mono text-xs"
          />
          {isExecuting && (
            <span className="w-2 h-2 rounded-full bg-[#ED3327] animate-ping shrink-0" />
          )}
        </form>
      </div>
    </div>
  );
}
