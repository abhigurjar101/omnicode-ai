"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Code2,
  Terminal,
  Bug,
  ShieldCheck,
  Zap,
  BookOpen,
  Settings,
  Cpu,
  Layers,
  ArrowRight,
  X,
} from "lucide-react";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction: (actionId: string, param?: any) => void;
}

export function CommandPalette({ isOpen, onClose, onSelectAction }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const actions = [
    { id: "build_feature", label: "Build a feature", category: "Agent Actions", icon: Zap, shortcut: "⌘B" },
    { id: "debug_file", label: "Debug current file", category: "Agent Actions", icon: Bug, shortcut: "⌘D" },
    { id: "review_code", label: "Review code standards & security", category: "Agent Actions", icon: ShieldCheck, shortcut: "⌘R" },
    { id: "run_tests", label: "Run test suite", category: "Workspace", icon: Terminal, shortcut: "⌘T" },
    { id: "goto_workspace", label: "Open Workspace", category: "Navigation", icon: Code2, shortcut: "G W" },
    { id: "goto_memory", label: "View Memory & Past Solutions", category: "Navigation", icon: BookOpen, shortcut: "G M" },
    { id: "goto_settings", label: "NVIDIA Model & Inference Settings", category: "Navigation", icon: Cpu, shortcut: "G S" },
  ];

  const filtered = actions.filter(
    (a) =>
      a.label.toLowerCase().includes(query.toLowerCase()) ||
      a.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) onClose();
      } else if (e.key === "Escape" && isOpen) {
        onClose();
      } else if (isOpen) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % (filtered.length || 1));
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + filtered.length) % (filtered.length || 1));
        } else if (e.key === "Enter" && filtered[selectedIndex]) {
          e.preventDefault();
          onSelectAction(filtered[selectedIndex].id);
          onClose();
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, selectedIndex, filtered, onClose, onSelectAction]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/80 backdrop-blur-md font-mono select-none">
      <div className="w-full max-w-xl bg-[#080808] border border-[#3A1515] shadow-[0_25px_60px_rgba(0,0,0,0.9)] overflow-hidden animate-in fade-in zoom-in-95 duration-100">
        {/* Search Input Bar */}
        <div className="h-13 px-4 border-b border-[#3A1515] flex items-center gap-3 bg-black">
          <Search className="w-4 h-4 text-[#ED3327]" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search commands, tools, or navigation..."
            className="flex-1 text-xs text-white placeholder-[#555555] bg-transparent focus:outline-none"
          />
          <button onClick={onClose} className="p-1 hover:text-white text-[#A7A7A7]">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action List */}
        <div className="max-h-72 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-xs text-[#555555]">No matching commands found.</div>
          ) : (
            filtered.map((action, idx) => {
              const Icon = action.icon;
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={action.id}
                  onClick={() => {
                    onSelectAction(action.id);
                    onClose();
                  }}
                  className={`px-3 py-2.5 flex items-center justify-between cursor-pointer transition-all border ${
                    isSelected
                      ? "bg-[#140808] border-[#ED3327] text-white"
                      : "bg-transparent border-transparent text-[#A7A7A7] hover:text-white hover:bg-[#110505]"
                  }`}
                >
                  <div className="flex items-center gap-2.5 text-xs">
                    <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-[#ED3327]" : "text-[#777777]"}`} />
                    <span className="font-semibold">{action.label}</span>
                    <span className="text-[10px] text-[#555555] uppercase">({action.category})</span>
                  </div>
                  {action.shortcut && (
                    <kbd className="px-1.5 py-0.5 bg-black border border-[#2b1010] text-[10px] text-[#A7A7A7]">
                      {action.shortcut}
                    </kbd>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer Keys Help */}
        <div className="h-8 px-4 border-t border-[#3A1515] bg-black flex items-center justify-between text-[10px] text-[#555555]">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>Esc Close</span>
          </div>
          <span>NEMI-CODE COMMANDS</span>
        </div>
      </div>
    </div>
  );
}
