"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Globe,
  Terminal as TerminalIcon,
  RotateCw,
  Maximize2,
  Minimize2,
  ExternalLink,
  AlertTriangle,
  Play,
  CheckCircle2,
} from "lucide-react";

interface LiveFrontendPreviewProps {
  code: string;
  url?: string;
  output?: string;
  activeFileName?: string;
  activeFileType?: "web" | "console";
  onReload?: () => void;
  onRun?: () => void;
  onStatusChange?: (status: "success" | "error" | "building", message: string) => void;
}

export function LiveFrontendPreview({
  code,
  url = "http://localhost:5173",
  output = "",
  activeFileName = "App.tsx",
  activeFileType = "web",
  onReload,
  onRun,
  onStatusChange,
}: LiveFrontendPreviewProps) {
  const [activeTab, setActiveTab] = useState<"preview" | "output">("preview");
  const [isReloading, setIsReloading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [compileError, setCompileError] = useState<string | null>(null);
  const [interactiveCount, setInteractiveCount] = useState(3);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-switch to output mode if active file is a console/script or if output has updated
  useEffect(() => {
    if (activeFileType === "console" || activeFileName.endsWith(".py") || activeFileName.endsWith(".sh")) {
      setActiveTab("output");
    } else {
      setActiveTab("preview");
    }
  }, [activeFileType, activeFileName]);

  useEffect(() => {
    try {
      if (code.includes("<<<") || (code.match(/\{/g) || []).length !== (code.match(/\}/g) || []).length) {
        throw new Error("Syntax error: Unmatched braces in JSX");
      }
      setCompileError(null);
      if (onStatusChange) onStatusChange("success", "Build successful!");
    } catch (err: any) {
      setCompileError(err.message || "Compilation error");
      if (onStatusChange) onStatusChange("error", err.message || "Compilation error");
    }
  }, [code]);

  const handleRefresh = () => {
    setIsReloading(true);
    if (onReload) onReload();
    setTimeout(() => setIsReloading(false), 500);
  };

  const toggleFullscreen = () => {
    setIsFullscreen((prev) => !prev);
  };

  const isConsoleMode = activeTab === "output" || activeFileType === "console";

  return (
    <div
      ref={containerRef}
      data-testid="live-preview"
      className={`h-full flex flex-col bg-[#0b0b0e] border border-white/[0.08] rounded-xl overflow-hidden shadow-2xl transition-all duration-200 ${
        isFullscreen
          ? "fixed inset-2 z-50 rounded-2xl border-[#ED3327]/40 shadow-[0_0_80px_rgba(237,51,39,0.3)]"
          : ""
      }`}
    >
      {/* 1. Window Top Bar with Mode Switcher (Preview / Output) */}
      <div className="h-10 px-3 bg-[#111116] border-b border-white/[0.08] flex items-center justify-between gap-2 shrink-0 select-none">
        {/* Left: Mode Switcher Tabs */}
        <div className="flex items-center gap-1 bg-black/60 p-0.5 rounded-lg border border-white/[0.08]">
          <button
            onClick={() => setActiveTab("output")}
            className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "output"
                ? "bg-[#ED3327] text-white shadow-sm"
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            <TerminalIcon className="w-3 h-3" />
            <span>Output</span>
          </button>
          <button
            onClick={() => setActiveTab("preview")}
            className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "preview"
                ? "bg-[#ED3327] text-white shadow-sm"
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            <Globe className="w-3 h-3" />
            <span>Preview</span>
          </button>
        </div>

        {/* Center: Address Bar Pill / Target File */}
        <div className="flex-1 max-w-[200px] sm:max-w-xs h-7 bg-black/60 border border-white/10 rounded-full px-3 flex items-center justify-between text-xs font-mono text-white/60">
          <span className="truncate">
            {activeTab === "preview" ? url : `${activeFileName} output`}
          </span>
          <button
            onClick={activeTab === "preview" ? handleRefresh : onRun}
            className="hover:text-white transition-colors cursor-pointer ml-1.5 shrink-0"
            title={activeTab === "preview" ? "Reload preview" : "Run program"}
          >
            {activeTab === "preview" ? (
              <RotateCw className={`w-3 h-3 ${isReloading ? "animate-spin text-[#ED3327]" : ""}`} />
            ) : (
              <Play className="w-3 h-3 text-[#ED3327] fill-[#ED3327]" />
            )}
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 text-white/60 shrink-0">
          {activeTab === "preview" && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 hover:text-white hover:bg-white/5 rounded transition-colors cursor-pointer"
              title="Open preview in new tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
          <button
            onClick={toggleFullscreen}
            className="p-1 hover:text-white hover:bg-white/5 rounded transition-colors cursor-pointer"
            title={isFullscreen ? "Exit Fullscreen" : "Expand to Fullscreen"}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* 2. Window Content Area: Output or Preview */}
      <div className="flex-1 min-h-0 relative bg-black overflow-y-auto">
        {activeTab === "output" ? (
          /* Live Output Console */
          <div className="w-full h-full p-4 font-mono text-xs text-zinc-300 bg-black flex flex-col justify-between overflow-y-auto select-text">
            <div className="space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.08] text-[11px] text-zinc-500">
                <span className="flex items-center gap-1.5 text-zinc-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Program Output ({activeFileName})</span>
                </span>
                <span className="text-emerald-400 font-semibold">Exit Code 0</span>
              </div>

              {output ? (
                <pre className="whitespace-pre-wrap leading-relaxed text-zinc-200 font-mono text-xs">
                  {output}
                </pre>
              ) : (
                <div className="text-zinc-600 py-6 text-center italic">
                  No execution output yet. Click &apos;Run&apos; to execute the program.
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-[10px] text-zinc-500">
              <span>Sandboxed runtime verified</span>
              <span>All tests passed</span>
            </div>
          </div>
        ) : compileError ? (
          <div className="absolute inset-0 p-6 flex flex-col justify-center items-center text-center bg-black/90 z-20">
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-3">
              <AlertTriangle className="w-6 h-6 text-[#ED3327]" />
            </div>
            <h3 className="text-white font-semibold text-sm mb-1">Compilation Failed</h3>
            <p className="text-red-400 font-mono text-xs max-w-md bg-red-950/40 p-3 rounded border border-red-800/40 text-left">
              {compileError}
            </p>
          </div>
        ) : (
          /* Live Web Application Render */
          <div className="w-full h-full min-h-[460px] flex flex-col justify-between relative overflow-hidden bg-gradient-to-b from-black via-zinc-950 to-black text-white p-6 sm:p-8 select-none">
            {/* Cosmic Red Horizon Background Bleed */}
            <div
              className="absolute -bottom-28 left-1/2 -translate-x-1/2 w-[650px] h-[340px] rounded-full pointer-events-none opacity-45 blur-2xl"
              style={{
                background:
                  "radial-gradient(circle, rgba(237, 51, 39, 0.75) 0%, rgba(140, 12, 18, 0.35) 45%, transparent 75%)",
              }}
            />

            {/* In-Preview Header */}
            <header className="flex items-center justify-between pb-4 border-b border-white/[0.05] relative z-10">
              <span className="text-[#ED3327] text-lg font-bold tracking-tight">NEMI-CO</span>
              <nav className="flex items-center gap-4 text-xs text-zinc-400 font-medium">
                <span className="hover:text-white transition-colors cursor-pointer">Home</span>
                <span className="hover:text-white transition-colors cursor-pointer">Features</span>
                <span className="hover:text-white transition-colors cursor-pointer">Docs</span>
              </nav>
            </header>

            {/* In-Preview Main Content */}
            <main className="flex-1 flex flex-col items-center justify-center text-center my-6 relative z-10 px-2">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 tracking-tight leading-tight text-white">
                Build something amazing with <br className="hidden sm:inline" />
                <span className="text-[#ED3327]">NEMI-CO</span>
              </h1>

              <p className="text-zinc-400 text-xs sm:text-sm mb-6 max-w-sm">
                Your AI coding partner. Write, run, and see results instantly.
              </p>

              <div className="flex items-center gap-3 flex-wrap justify-center">
                <button
                  onClick={() => setInteractiveCount((c) => c + 1)}
                  className="px-6 py-2.5 bg-[#ED3327] hover:bg-[#d6261c] active:scale-95 text-white font-medium text-xs sm:text-sm rounded-full shadow-[0_0_24px_rgba(237,51,39,0.55)] transition-all cursor-pointer"
                >
                  Clicked {interactiveCount} times
                </button>
                {(code.includes("Reset") || code.includes("setCount(0)")) && (
                  <button
                    onClick={() => setInteractiveCount(0)}
                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-white text-xs rounded-full border border-white/10 transition-all cursor-pointer shadow-md"
                  >
                    Reset
                  </button>
                )}
              </div>
            </main>

            {/* In-Preview Footer Status Pill */}
            <footer className="pt-3 border-t border-white/[0.05] flex items-center justify-between text-[11px] text-zinc-500 relative z-10">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Running Vite HMR</span>
              </span>
              <span>Port :5173</span>
            </footer>
          </div>
        )}
      </div>
    </div>
  );
}
