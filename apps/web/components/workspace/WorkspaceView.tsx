"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import {
  Code2,
  FolderTree,
  Terminal,
  Play,
  Save,
  Wand2,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  CheckCircle2,
  PanelRightClose,
  PanelRightOpen,
  PanelBottomClose,
  PanelBottomOpen,
  ArrowRight,
  Layers,
} from "lucide-react";

// Dynamically import Monaco Editor to avoid SSR issues
const Editor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

interface OpenTab {
  path: string;
  name: string;
  content: string;
  language: string;
  dirty: boolean;
}

interface WorkspaceViewProps {
  files: string[];
  openTabs: OpenTab[];
  activeTabIdx: number;
  onSelectTab: (idx: number) => void;
  onOpenFile: (filePath: string) => void;
  onContentChange: (newContent: string) => void;
  onSaveFile: () => void;
  onSimplifyFile: () => void;
  terminalOutput: string;
  onClearTerminal: () => void;
  onRunAutonomousTask: (instruction: string) => void;
  isAgentRunning: boolean;
}

export function WorkspaceView({
  files,
  openTabs,
  activeTabIdx,
  onSelectTab,
  onOpenFile,
  onContentChange,
  onSaveFile,
  onSimplifyFile,
  terminalOutput,
  onClearTerminal,
  onRunAutonomousTask,
  isAgentRunning,
}: WorkspaceViewProps) {
  const [showExplorer, setShowExplorer] = useState(true);
  const [showAssistant, setShowAssistant] = useState(true);
  const [showTerminal, setShowTerminal] = useState(true);
  const [assistantInput, setAssistantInput] = useState("");

  const activeTab = openTabs[activeTabIdx];

  const handleAssistantSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assistantInput.trim() || isAgentRunning) return;
    onRunAutonomousTask(assistantInput.trim());
    setAssistantInput("");
  };

  return (
    <div className="flex-1 flex overflow-hidden bg-transparent select-none text-xs font-mono relative">
      {/* Optional Left Panel: Collapsible File Explorer */}
      {showExplorer && (
        <div className="w-60 border-r border-[#3A1515] bg-[#080808]/90 backdrop-blur-xl flex flex-col overflow-hidden animate-in slide-in-from-left-2 duration-150 z-20">
          <div className="h-9 border-b border-[#3A1515] px-3.5 flex items-center justify-between font-bold uppercase tracking-wider text-[#A7A7A7] text-[10px]">
            <div className="flex items-center gap-2">
              <FolderTree className="w-3.5 h-3.5 text-[#ED3327]" />
              <span>Workspace Files</span>
            </div>
            <button
              onClick={() => setShowExplorer(false)}
              className="p-1 hover:text-white rounded"
              title="Collapse Explorer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5">
            {files.map((f) => (
              <div
                key={f}
                onClick={() => onOpenFile(f)}
                className="px-2.5 py-1.5 hover:bg-[#150606] border border-transparent hover:border-[#3A1515] cursor-pointer truncate text-[#A7A7A7] hover:text-white flex items-center gap-2 transition-colors text-[11px]"
              >
                <Code2 className="w-3.5 h-3.5 text-[#ED3327] flex-shrink-0" />
                <span className="truncate">{f}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Toggle explorer button when collapsed */}
      {!showExplorer && (
        <button
          onClick={() => setShowExplorer(true)}
          className="w-7 border-r border-[#3A1515] bg-[#080808]/80 hover:bg-[#150606] flex items-center justify-center text-[#A7A7A7] hover:text-white transition-colors z-20"
          title="Open Explorer"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Center: Monaco Editor & Terminal Drawer */}
      <div className="flex-1 flex flex-col overflow-hidden border-r border-[#3A1515] bg-[#080808]/85 backdrop-blur-xl z-10">
        {/* Editor Tab Bar */}
        <div className="h-9 border-b border-[#3A1515] bg-black/80 flex items-center justify-between px-2 text-xs">
          <div className="flex items-center gap-1 overflow-x-auto max-w-[70%]">
            {openTabs.map((t, idx) => (
              <div
                key={t.path}
                onClick={() => onSelectTab(idx)}
                className={`px-3.5 py-1.5 border-t-2 cursor-pointer flex items-center gap-2 transition-all text-[11px] ${
                  idx === activeTabIdx
                    ? "bg-[#140808] border-[#ED3327] text-white font-bold"
                    : "bg-transparent border-transparent text-[#777777] hover:text-[#A7A7A7]"
                }`}
              >
                <span className="truncate max-w-[140px]">{t.name}</span>
                {t.dirty && <span className="w-1.5 h-1.5 rounded-full bg-[#ED3327]"></span>}
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={onSimplifyFile}
              className="px-2.5 py-1 bg-black hover:bg-[#140808] border border-[#3A1515] hover:border-[#ED3327] text-[#A7A7A7] hover:text-white flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider transition-all"
              title="KISS Code Simplifier"
            >
              <Wand2 className="w-3 h-3 text-[#ED3327]" />
              <span>Simplify</span>
            </button>
            <button
              onClick={onSaveFile}
              className="px-3 py-1 bg-[#ED3327] hover:bg-[#d92b20] active:bg-[#bf2016] text-white flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider transition-all shadow-[0_0_10px_rgba(237,51,39,0.3)]"
              title="Save changes"
            >
              <Save className="w-3 h-3" />
              <span>Save</span>
            </button>
            <button
              onClick={() => setShowAssistant(!showAssistant)}
              className="p-1 hover:text-white text-[#A7A7A7]"
              title={showAssistant ? "Hide Assistant" : "Show Assistant"}
            >
              {showAssistant ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Monaco Canvas */}
        <div className="flex-1 bg-[#060606] relative">
          {activeTab ? (
            <Editor
              height="100%"
              language={activeTab.language}
              theme="vs-dark"
              value={activeTab.content}
              onChange={(val) => onContentChange(val || "")}
              options={{
                fontSize: 13,
                fontFamily: "Geist Mono, JetBrains Mono, monospace",
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 4,
                renderLineHighlight: "line",
                lineNumbers: "on",
                overviewRulerBorder: false,
                cursorBlinking: "smooth",
              }}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-[#555555]">
              Select a file from the explorer to open.
            </div>
          )}
        </div>

        {/* Bottom Terminal Drawer */}
        {showTerminal && (
          <div className="h-44 border-t border-[#3A1515] bg-[#050505]/95 flex flex-col font-mono text-[11px] animate-in slide-in-from-bottom-2 duration-150">
            <div className="h-7 border-b border-[#3A1515] bg-black px-3.5 flex items-center justify-between text-[#A7A7A7]">
              <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-[10px]">
                <Terminal className="w-3 h-3 text-[#ED3327]" />
                <span className="text-white">NEMI-CODE Console & Output</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={onClearTerminal} className="hover:text-white text-[10px] uppercase">
                  Clear
                </button>
                <button onClick={() => setShowTerminal(false)} className="hover:text-white" title="Hide Terminal">
                  <PanelBottomClose className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <pre className="flex-1 overflow-y-auto p-3 text-[#EAEAEA] whitespace-pre-wrap leading-relaxed select-text font-mono text-xs">
              {terminalOutput}
            </pre>
          </div>
        )}

        {!showTerminal && (
          <button
            onClick={() => setShowTerminal(true)}
            className="h-6 border-t border-[#3A1515] bg-black hover:bg-[#120808] flex items-center px-3 text-[10px] text-[#A7A7A7] font-mono gap-1.5"
          >
            <PanelBottomOpen className="w-3 h-3 text-[#ED3327]" />
            <span>Open Console</span>
          </button>
        )}
      </div>

      {/* Optional Right Panel: NEMI-CODE Assistant */}
      {showAssistant && (
        <div className="w-80 bg-[#080808]/90 backdrop-blur-xl flex flex-col overflow-hidden text-xs animate-in slide-in-from-right-2 duration-150 z-20">
          <div className="h-9 border-b border-[#3A1515] px-3.5 flex items-center justify-between font-bold text-white uppercase tracking-wider text-[10px]">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ED3327] animate-pulse"></span>
              <span>NEMI-CODE Assistant</span>
            </div>
            <button onClick={() => setShowAssistant(false)} className="p-1 hover:text-white text-[#A7A7A7]">
              <PanelRightClose className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Assistant Prompt Input */}
          <form onSubmit={handleAssistantSubmit} className="p-3 border-b border-[#3A1515] space-y-2">
            <textarea
              value={assistantInput}
              onChange={(e) => setAssistantInput(e.target.value)}
              placeholder="Ask NEMI-CODE to edit, refactor, or test..."
              rows={3}
              className="w-full p-2.5 bg-black border border-[#3A1515] focus:border-[#ED3327] text-white placeholder-[#555555] text-xs resize-none focus:outline-none font-mono"
            />
            <button
              type="submit"
              disabled={isAgentRunning || !assistantInput.trim()}
              className="w-full py-2 bg-[#ED3327] hover:bg-[#d92b20] active:bg-[#bf2016] text-white font-bold tracking-wider uppercase flex items-center justify-center gap-1.5 disabled:opacity-50 transition-all text-xs shadow-[0_0_15px_rgba(237,51,39,0.3)]"
            >
              {isAgentRunning ? (
                <>
                  <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                  <span>Synthesizing...</span>
                </>
              ) : (
                <>
                  <span>Run Instruction</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Context Details */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5 text-[#A7A7A7] text-[11px] leading-relaxed">
            <div className="p-2.5 bg-black border border-[#2b1010] space-y-1">
              <div className="text-white font-bold flex items-center gap-1.5 uppercase text-[10px]">
                <CheckCircle2 className="w-3 h-3 text-[#ED3327]" />
                <span>Autonomous Pipeline</span>
              </div>
              <p className="font-sans text-[#A7A7A7]">
                NEMI-CODE synthesizes minimal code edits, enforces KISS/DRY simplicity, and verifies with automated tests before committing.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
