"use client";

import React, { useRef, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import {
  Code2,
  Play,
  Plus,
  Save,
  Undo2,
  X,
  Sparkles,
  PanelLeft,
  PanelRight,
  Terminal as TerminalIcon,
  Layout,
  FileCode,
  FileText,
  FileJson,
  File,
  Trophy,
  Maximize2,
  Minimize2,
} from "lucide-react";

// Dynamically import Monaco Editor to avoid SSR mismatch
const Editor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

export interface OpenTab {
  path: string;
  name: string;
  content: string;
  language: string;
  dirty: boolean;
  history?: string[];
}

interface MonacoWorkspaceEditorProps {
  openTabs: OpenTab[];
  activeTabIdx: number;
  onSelectTab: (idx: number) => void;
  onCloseTab?: (idx: number) => void;
  onNewTab?: () => void;
  onContentChange: (newContent: string) => void;
  onFormat?: () => void;
  onRun?: () => void;
  onSave?: () => void;
  onUndo?: () => void;
  canUndo?: boolean;
  isSaving?: boolean;
  apiBase?: string;
  className?: string;
  toggleSidebar?: () => void;
  isSidebarOpen?: boolean;
  toggleChat?: () => void;
  isChatOpen?: boolean;
  toggleTerminal?: () => void;
  isTerminalOpen?: boolean;
  toggleInspector?: () => void;
  isInspectorOpen?: boolean;
  toggleProblemPanel?: () => void;
  isProblemPanelOpen?: boolean;
}

function getTabIcon(name: string) {
  const ext = name.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "ts":
    case "tsx":
    case "js":
    case "jsx":
    case "py":
      return FileCode;
    case "json":
      return FileJson;
    case "md":
    case "txt":
    case "env":
      return FileText;
    default:
      return File;
  }
}

// Fallback preview before Monaco scripts finish loading
const CodePreviewFallback = () => (
  <div className="w-full h-full p-4 font-mono text-[12px] leading-[21px] text-[#A7A7A7] select-text overflow-hidden bg-black/40">
    <div className="flex items-center gap-2 text-xs text-[#ED3327]">
      <span className="w-2 h-2 rounded-full bg-[#ED3327] animate-pulse" />
      <span>Loading editor canvas...</span>
    </div>
  </div>
);

export function MonacoWorkspaceEditor({
  openTabs,
  activeTabIdx,
  onSelectTab,
  onCloseTab,
  onNewTab,
  onContentChange,
  onFormat,
  onRun,
  onSave,
  onUndo,
  canUndo = false,
  isSaving = false,
  apiBase = "http://localhost:8000",
  className = "",
  toggleSidebar,
  isSidebarOpen = true,
  toggleChat,
  isChatOpen = true,
  toggleTerminal,
  isTerminalOpen = true,
  toggleInspector,
  isInspectorOpen = false,
  toggleProblemPanel,
  isProblemPanelOpen = false,
}: MonacoWorkspaceEditorProps) {
  const activeTab = openTabs[activeTabIdx];
  const activeTabRef = useRef<OpenTab | undefined>(activeTab);
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);
  const inlineProviderRegistered = useRef<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    activeTabRef.current = activeTab;
    if (editorRef.current && activeTab) {
      const model = editorRef.current.getModel();
      if (model && model.getValue() !== activeTab.content) {
        model.setValue(activeTab.content);
      }
    }
  }, [activeTab?.path, activeTab?.content]);

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Focus editor on mount
    editor.focus();

    if (typeof window !== "undefined") {
      (window as any).__monacoEditor = editor;
      (window as any).__monaco = monaco;
    }

    // Bind Monaco editor keyboard shortcuts directly
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      onSave?.();
    });
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      onRun?.();
    });
    if (onFormat) {
      editor.addCommand(monaco.KeyMod.Shift | monaco.KeyMod.Alt | monaco.KeyCode.KeyF, () => {
        onFormat();
      });
    }

    // Register inline completions provider (ghost text) once with debouncing
    if (!inlineProviderRegistered.current) {
      inlineProviderRegistered.current = true;
      const supportedLangs = ["typescript", "javascript", "python", "json", "html", "css", "markdown", "shell"];

      supportedLangs.forEach((lang) => {
        try {
          monaco.languages.registerInlineCompletionsProvider(lang, {
            provideInlineCompletions: async (model: any, position: any, context: any, token: any) => {
              // Ignore if cancelled
              if (token.isCancellationRequested) return { items: [] };

              const lineContent = model.getLineContent(position.lineNumber);
              // Do not query for purely blank lines or single characters
              if (!lineContent || lineContent.trim().length < 2) {
                return { items: [] };
              }

              // Smooth 350ms pause to ensure user finished typing
              await new Promise((resolve) => setTimeout(resolve, 350));
              if (token.isCancellationRequested) return { items: [] };

              try {
                const currentFile = activeTabRef.current?.path || "active_file";
                const fullContent = model.getValue();
                const offset = model.getOffsetAt(position);

                const response = await fetch(`${apiBase}/api/workspace/next-code`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    file_path: currentFile,
                    current_content: fullContent,
                    cursor_position: offset,
                  }),
                });

                if (!response.ok || token.isCancellationRequested) return { items: [] };
                const data = await response.json();

                if (data.suggestions && data.suggestions.length > 0 && !token.isCancellationRequested) {
                  const first = data.suggestions[0];
                  const insertText = first.code || "";
                  return {
                    items: [
                      {
                        insertText,
                        range: new monaco.Range(
                          position.lineNumber,
                          position.column,
                          position.lineNumber,
                          position.column
                        ),
                      },
                    ],
                  };
                }
              } catch (e) {
                // Silently fallback without interrupting typing
              }
              return { items: [] };
            },
            freeInlineCompletions() {},
          });
        } catch (e) {
          console.warn("Could not register inline completion for", lang, e);
        }
      });
    }
  };

  return (
    <div
      className={`h-full w-full flex-1 min-h-0 rounded-2xl border border-[#ED3327]/60 bg-[#08080a]/90 backdrop-blur-xl shadow-[0_15px_35px_rgba(0,0,0,0.85)] flex flex-col overflow-hidden text-xs font-mono transition-all duration-200 ${
        isFullscreen ? "fixed inset-2 z-50 rounded-2xl border-[#ED3327]/40 shadow-[0_0_80px_rgba(237,51,39,0.3)]" : ""
      } ${className}`}
    >
      {/* 1. Editor Tab Bar & Actions */}
      <div className="h-10 px-2.5 border-b border-[#2b0f0f] bg-black/60 flex items-center justify-between select-none shrink-0">
        {/* Left: Sidebar Toggle + Tab List */}
        <div className="flex items-center gap-1.5 overflow-x-auto min-w-0 max-w-[65%] custom-scrollbar py-1">
          {toggleSidebar && (
            <button
              onClick={toggleSidebar}
              className={`p-1.5 rounded hover:bg-white/10 text-[#888888] hover:text-white transition-colors shrink-0 ${
                !isSidebarOpen ? "text-[#ED3327] bg-[#1a0507]" : ""
              }`}
              title={isSidebarOpen ? "Hide Explorer" : "Show Explorer"}
            >
              <PanelLeft className="w-3.5 h-3.5" />
            </button>
          )}

          {openTabs.map((tab, idx) => {
            const isActive = idx === activeTabIdx;
            const Icon = getTabIcon(tab.name);

            return (
              <div
                key={tab.path}
                onClick={() => onSelectTab(idx)}
                className={`h-7 px-2.5 rounded-md cursor-pointer flex items-center gap-1.5 transition-all text-[11px] shrink-0 font-sans ${
                  isActive
                    ? "bg-[#ED3327] text-white font-medium shadow-[0_0_12px_rgba(237,51,39,0.35)]"
                    : "bg-black/40 hover:bg-white/5 text-[#A7A7A7] hover:text-white border border-[#220a0a]"
                }`}
              >
                <Icon className={`w-3 h-3 ${isActive ? "text-white" : "text-[#777777]"}`} />
                <span className="truncate max-w-[120px] font-mono text-[11px]">{tab.name}</span>
                {tab.dirty ? (
                  <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-white" : "bg-[#ED3327]"}`} />
                ) : null}
                {onCloseTab && openTabs.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onCloseTab(idx);
                    }}
                    className="p-0.5 rounded hover:bg-white/20 text-white/70 hover:text-white ml-0.5"
                    title="Close tab"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                )}
              </div>
            );
          })}

          {onNewTab && (
            <button
              onClick={onNewTab}
              className="w-6 h-6 rounded bg-black/40 hover:bg-white/10 flex items-center justify-center text-[#888888] hover:text-white transition-colors shrink-0"
              title="New File"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Right Tab Actions: Save, Undo, Format, Run, Panel Toggles */}
        <div className="flex items-center gap-1.5 shrink-0">
          {canUndo && onUndo && (
            <button
              onClick={onUndo}
              className="h-7 px-2 rounded-md bg-[#1f0608] hover:bg-[#2d090c] border border-[#ED3327]/60 text-[#ED3327] hover:text-white flex items-center gap-1 text-[11px] font-sans transition-all"
              title="Undo AI edit"
            >
              <Undo2 className="w-3 h-3" />
              <span>Undo AI</span>
            </button>
          )}

          {onSave && (
            <button
              onClick={onSave}
              disabled={isSaving || !activeTab?.dirty}
              className={`h-7 px-2.5 rounded-md border flex items-center gap-1 text-[11px] font-sans transition-all ${
                activeTab?.dirty
                  ? "bg-[#180507] border-[#ED3327] text-white hover:bg-[#ED3327]"
                  : "bg-black/40 border-[#2b0f0f] text-[#777777] cursor-default"
              }`}
              title="Save file (⌘S)"
            >
              <Save className="w-3 h-3" />
              <span>{activeTab?.dirty ? "Save" : "Saved"}</span>
            </button>
          )}

          {onFormat && (
            <button
              onClick={onFormat}
              className="h-7 px-2.5 rounded-md bg-black/60 hover:bg-white/10 border border-[#331111] hover:border-[#ED3327]/60 text-[#CCCCCC] hover:text-white flex items-center gap-1 text-[11px] transition-all font-sans"
              title="Format Document (Shift+Alt+F)"
            >
              <Code2 className="w-3 h-3 text-[#888888]" />
              <span className="hidden sm:inline">Format</span>
            </button>
          )}

          {onRun && (
            <button
              onClick={onRun}
              className="h-7 px-3 rounded-md bg-[#ED3327] hover:bg-[#db2b20] active:bg-[#c42319] text-white flex items-center gap-1 text-[11px] font-medium transition-all shadow-[0_0_12px_rgba(237,51,39,0.4)] font-sans"
              title="Run current file (⌘Enter)"
            >
              <Play className="w-3 h-3 fill-white text-white" />
              <span>Run</span>
            </button>
          )}

          {/* Panel toggles: Terminal & Chat */}
          <div className="flex items-center gap-0.5 pl-1 border-l border-[#2b0f0f]">
            {toggleProblemPanel && (
              <button
                data-testid="toggle-problem-panel-btn"
                onClick={toggleProblemPanel}
                className={`p-1.5 rounded hover:bg-white/10 text-[#888888] hover:text-white transition-colors ${
                  isProblemPanelOpen ? "text-[#ED3327]" : ""
                }`}
                title={isProblemPanelOpen ? "Hide Challenge Panel" : "Show Challenge Panel"}
              >
                <Trophy className="w-3.5 h-3.5" />
              </button>
            )}

            {toggleInspector && (
              <button
                onClick={toggleInspector}
                className={`p-1.5 rounded hover:bg-white/10 text-[#888888] hover:text-white transition-colors ${
                  isInspectorOpen ? "text-[#ED3327]" : ""
                }`}
                title={isInspectorOpen ? "Hide Inspector Panels" : "Show Inspector Panels"}
              >
                <Layout className="w-3.5 h-3.5" />
              </button>
            )}

            {toggleTerminal && (
              <button
                onClick={toggleTerminal}
                className={`p-1.5 rounded hover:bg-white/10 text-[#888888] hover:text-white transition-colors ${
                  isTerminalOpen ? "text-[#ED3327]" : ""
                }`}
                title={isTerminalOpen ? "Hide Terminal" : "Show Terminal"}
              >
                <TerminalIcon className="w-3.5 h-3.5" />
              </button>
            )}

            {toggleChat && (
              <button
                onClick={toggleChat}
                className={`p-1.5 rounded hover:bg-white/10 text-[#888888] hover:text-white transition-colors ${
                  isChatOpen ? "text-[#ED3327]" : ""
                }`}
                title={isChatOpen ? "Hide AI Assistant" : "Show AI Assistant"}
              >
                <PanelRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Expand to Fullscreen (Matching Reference Image ⛶) */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 hover:bg-white/10 text-white/60 hover:text-white rounded transition-colors ml-0.5 cursor-pointer"
            title={isFullscreen ? "Exit Fullscreen" : "Expand Editor (⛶)"}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* 2. Monaco Canvas */}
      <div className="flex-1 bg-black/30 relative min-h-0 overflow-hidden">
        <div className="absolute inset-0">
          {activeTab ? (
            <Editor
              path={activeTab.path}
              height="100%"
              language={activeTab.language}
              theme="nemi-codeckpit-dark"
              value={activeTab.content}
              loading={<CodePreviewFallback />}
              beforeMount={(monaco) => {
                try {
                  monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
                    noSemanticValidation: true,
                    noSyntaxValidation: false,
                  });
                  monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
                    noSemanticValidation: true,
                    noSyntaxValidation: false,
                  });
                  monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
                    target: monaco.languages.typescript.ScriptTarget.Latest,
                    allowNonTextExtensions: true,
                    moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
                    module: monaco.languages.typescript.ModuleKind.CommonJS,
                    noEmit: true,
                    esModuleInterop: true,
                    jsx: monaco.languages.typescript.JsxEmit.ReactJSX,
                    reactNamespace: "React",
                    allowJs: true,
                  });
                } catch (e) {
                  console.warn("Monaco typescript config error", e);
                }

                monaco.editor.defineTheme("nemi-codeckpit-dark", {
                  base: "vs-dark",
                  inherit: true,
                  rules: [
                    { token: "keyword", foreground: "ED3327", fontStyle: "bold" },
                    { token: "string", foreground: "86efac" },
                    { token: "number", foreground: "f59e0b" },
                    { token: "type", foreground: "60a5fa" },
                    { token: "identifier", foreground: "d8dde8" },
                    { token: "comment", foreground: "666666", fontStyle: "italic" },
                  ],
                  colors: {
                    "editor.background": "#05060800",
                    "editor.lineHighlightBackground": "#38090940",
                    "editorLineNumber.foreground": "#555555",
                    "editorLineNumber.activeForeground": "#ED3327",
                    "editorCursor.foreground": "#ED3327",
                    "editor.selectionBackground": "#ED332733",
                    "editorGhostText.foreground": "#ED3327aa",
                  },
                });
              }}
              onMount={handleEditorDidMount}
              onChange={(val) => onContentChange(val || "")}
              options={{
                fontSize: 13,
                fontFamily: "Geist Mono, JetBrains Mono, Courier New, monospace",
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 2,
                renderLineHighlight: "all",
                lineNumbers: "on",
                overviewRulerBorder: false,
                cursorBlinking: "smooth",
                cursorSmoothCaretAnimation: "on",
                lineHeight: 21,
                padding: { top: 10, bottom: 10 },
                readOnly: false,
                domReadOnly: false,
                selectOnLineNumbers: true,
                contextmenu: true,
                wordWrap: "on",
                dragAndDrop: true,
                links: true,
                multiCursorModifier: "alt",
                formatOnPaste: true,
                formatOnType: true,
                inlineSuggest: {
                  enabled: true,
                  mode: "subwordSmart",
                },
                suggest: {
                  preview: true,
                  showWords: true,
                },
                quickSuggestions: {
                  other: true,
                  comments: false,
                  strings: false,
                },
              }}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-[#666666] font-sans">
              Select or create a file to start coding
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
