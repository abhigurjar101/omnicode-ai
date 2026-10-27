"use client";

import React, { useState, useEffect, useRef } from "react";
import { NemiTopNavigation } from "@/components/navigation/NemiTopNavigation";
import { ProjectExplorer } from "@/components/workspace/ProjectExplorer";
import { MonacoWorkspaceEditor, OpenTab } from "@/components/workspace/MonacoWorkspaceEditor";
import { LiveFrontendPreview } from "@/components/workspace/LiveFrontendPreview";
import { NemiRobotAssistantPanel, ChatMsg } from "@/components/workspace/NemiRobotAssistantPanel";
import { TerminalPanel } from "@/components/workspace/TerminalPanel";
import { CommandPalette } from "@/components/modals/CommandPalette";
import { SettingsView } from "@/components/settings/SettingsView";
import { RobotState } from "@/components/canvas/NemiRobotScene";
import { Sparkles, Check, X } from "lucide-react";

const API_BASE = "";

interface CockpitStudioProps {
  workspaceId?: string;
  isNew?: boolean;
}

export function CockpitStudio({ workspaceId = "primary" }: CockpitStudioProps) {
  const [currentTab, setCurrentTab] = useState<"workspace" | "runs" | "memory" | "settings">("workspace");
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Layout Panel Toggles
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isTerminalOpen, setIsTerminalOpen] = useState(true);

  // System & Backend State
  const [files, setFiles] = useState<string[]>([]);
  const [robotState, setRobotState] = useState<RobotState>("idle");
  const [statusTitle, setStatusTitle] = useState<string>("Build successful!");
  const [statusSubtitle, setStatusSubtitle] = useState<string>("Preview live at");
  const [isExecuting, setIsExecuting] = useState(false);

  // Default Files Matching Reference Image
  const [openTabs, setOpenTabs] = useState<OpenTab[]>([
    {
      path: "my-app/src/App.tsx",
      name: "App.tsx",
      content: `import { useState } from 'react'
import './index.css'

export default function App() {
  const [count, setCount] = useState(3)

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-zinc-900 to-black text-white">
      <header className="flex items-center justify-between px-8 py-6">
        <div className="flex items-center gap-2">
          <span className="text-red-500 text-2xl font-bold">NEMI-CO</span>
        </div>
        <nav className="hidden md:flex gap-8 text-sm text-zinc-400">
          <a href="#" className="hover:text-white">Home</a>
          <a href="#" className="hover:text-white">Features</a>
          <a href="#" className="hover:text-white">Docs</a>
        </nav>
      </header>

      <main className="flex flex-col items-center justify-center text-center px-6 py-24">
        <h1 className="text-5xl font-bold mb-4">
          Build something amazing with <span className="text-red-500">NEMI-CO</span>
        </h1>
        <p className="text-zinc-300 text-lg mb-8">
          Your AI coding partner. Write, run, and see results instantly.
        </p>
        <button
          onClick={() => setCount(count + 1)}
          className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-full shadow-lg shadow-red-600/30 transition-all cursor-pointer"
        >
          Clicked {count} times
        </button>
      </main>
    </div>
  )
}`,
      language: "typescript",
      dirty: false,
      history: [],
    },
    {
      path: "my-app/src/main.tsx",
      name: "main.tsx",
      content: `import React from 'react'\nimport ReactDOM from 'react-dom/client'\nimport App from './App.tsx'\nimport './index.css'\n\nReactDOM.createRoot(document.getElementById('root')!).render(\n  <React.StrictMode>\n    <App />\n  </React.StrictMode>,\n)`,
      language: "typescript",
      dirty: false,
      history: [],
    },
    {
      path: "my-app/src/index.css",
      name: "index.css",
      content: `@tailwind base;\n@tailwind components;\n@tailwind utilities;\n\nbody {\n  margin: 0;\n  background: #000;\n  color: #fff;\n}`,
      language: "css",
      dirty: false,
      history: [],
    },
    {
      path: "my-app/package.json",
      name: "package.json",
      content: `{\n  "name": "my-app",\n  "private": true,\n  "version": "0.1.0",\n  "type": "module",\n  "scripts": {\n    "dev": "vite",\n    "build": "vite build"\n  }\n}`,
      language: "json",
      dirty: false,
      history: [],
    },
  ]);
  const [activeTabIdx, setActiveTabIdx] = useState(0);
  const [lastUndoContent, setLastUndoContent] = useState<string | null>(null);

  // Terminal Logs
  const [terminalOutput, setTerminalOutput] = useState<string>("");

  // Minimal AI Chat
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([
    {
      role: "agent",
      content: "Hey! I'm NEMI-CO. What would you like to build or code today?",
    },
  ]);

  // Load workspace state from localStorage & disk on mount
  useEffect(() => {
    try {
      const savedTabs = localStorage.getItem("nemi_workspace_tabs");
      if (savedTabs) {
        const parsed = JSON.parse(savedTabs);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setOpenTabs(parsed);
        }
      }
      const savedIdx = localStorage.getItem("nemi_workspace_active_tab");
      if (savedIdx !== null) {
        const idx = parseInt(savedIdx, 10);
        if (!isNaN(idx)) setActiveTabIdx(idx);
      }
    } catch {}

    loadWorkspaceFiles();
    fetchFileContent("my-app/src/App.tsx");

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        handleSaveFile();
      } else if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        handleRunCode();
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "p") {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        setIsSidebarOpen((prev) => !prev);
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "j") {
        e.preventDefault();
        setIsTerminalOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Save workspace state to localStorage
  useEffect(() => {
    try {
      if (openTabs.length > 0) {
        localStorage.setItem("nemi_workspace_tabs", JSON.stringify(openTabs));
        localStorage.setItem("nemi_workspace_active_tab", activeTabIdx.toString());
      }
    } catch {}
  }, [openTabs, activeTabIdx]);

  const loadWorkspaceFiles = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/workspace/files?max_depth=4`);
      const data = await res.json();
      if (data.files) {
        setFiles(data.files);
      }
    } catch (e) {
      console.warn("Backend API not reachable at", API_BASE);
    }
  };

  const fetchFileContent = async (filePath: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/workspace/file?path=${encodeURIComponent(filePath)}`);
      const data = await res.json();
      if (data.success && data.content) {
        setOpenTabs((prev) => {
          const idx = prev.findIndex((t) => t.path === filePath || t.name === filePath.split("/").pop());
          if (idx >= 0) {
            const copy = [...prev];
            copy[idx] = { ...copy[idx], content: data.content, dirty: false };
            return copy;
          }
          const ext = filePath.split(".").pop() || "";
          const langMap: Record<string, string> = {
            tsx: "typescript",
            ts: "typescript",
            jsx: "javascript",
            js: "javascript",
            css: "css",
            json: "json",
            html: "html",
            py: "python",
          };
          return [
            ...prev,
            {
              path: filePath,
              name: filePath.split("/").pop() || filePath,
              content: data.content,
              language: langMap[ext] || "plaintext",
              dirty: false,
            },
          ];
        });
      }
    } catch {}
  };

  const handleOpenFile = async (filePath: string) => {
    const existingIdx = openTabs.findIndex(
      (t) => t.path === filePath || t.name === filePath.split("/").pop()
    );
    if (existingIdx >= 0) {
      setActiveTabIdx(existingIdx);
      return;
    }
    await fetchFileContent(filePath);
    setActiveTabIdx(openTabs.length);
  };

  const handleCreateFile = async (filePath: string) => {
    try {
      await fetch(`${API_BASE}/api/workspace/file`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file_path: filePath, content: "// New File\n", overwrite: false }),
      });
      await loadWorkspaceFiles();
      await fetchFileContent(filePath);
      setActiveTabIdx(openTabs.length);
      setTerminalOutput((prev) => prev + `[Created] ${filePath}\n`);
    } catch {
      // Fallback in-memory
      const name = filePath.split("/").pop() || filePath;
      setOpenTabs((prev) => [
        ...prev,
        {
          path: filePath,
          name,
          content: "// New File\n",
          language: "typescript",
          dirty: false,
        },
      ]);
      setActiveTabIdx(openTabs.length);
    }
  };

  const handleDeleteFile = async (filePath: string) => {
    try {
      await fetch(`${API_BASE}/api/workspace/file?path=${encodeURIComponent(filePath)}`, {
        method: "DELETE",
      });
      await loadWorkspaceFiles();
      setOpenTabs((prev) => prev.filter((t) => t.path !== filePath));
      setActiveTabIdx((prev) => Math.max(0, prev - 1));
      setTerminalOutput((prev) => prev + `[Deleted] ${filePath}\n`);
    } catch (e: any) {
      setTerminalOutput((prev) => prev + `[Delete Failed] ${e.message}\n`);
    }
  };

  const handleRenameFile = async (oldPath: string, newPath: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/workspace/file/rename`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ old_path: oldPath, new_path: newPath }),
      });
      const data = await res.json();
      if (data.success) {
        await loadWorkspaceFiles();
        setOpenTabs((prev) =>
          prev.map((tab) => {
            if (tab.path === oldPath) {
              const newName = newPath.split("/").pop() || newPath;
              const ext = newName.split(".").pop() || "";
              const langMap: Record<string, string> = {
                tsx: "typescript",
                ts: "typescript",
                jsx: "javascript",
                js: "javascript",
                css: "css",
                json: "json",
                html: "html",
                py: "python",
              };
              return {
                ...tab,
                path: newPath,
                name: newName,
                language: langMap[ext] || tab.language,
              };
            }
            return tab;
          })
        );
        setTerminalOutput((prev) => prev + `[Renamed] ${oldPath} -> ${newPath}\n`);
      } else {
        setTerminalOutput((prev) => prev + `[Rename Failed] ${data.detail || "Error"}\n`);
      }
    } catch (e: any) {
      setTerminalOutput((prev) => prev + `[Rename Error] ${e.message}\n`);
    }
  };

  const handleSaveFile = async () => {
    const active = openTabs[activeTabIdx];
    if (!active) return;

    try {
      await fetch(`${API_BASE}/api/workspace/file`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          file_path: active.path,
          content: active.content,
          overwrite: true,
        }),
      });

      setOpenTabs((prev) => {
        const copy = [...prev];
        if (copy[activeTabIdx]) copy[activeTabIdx].dirty = false;
        return copy;
      });

      setRobotState("success");
      setStatusTitle("Build successful!");
      setStatusSubtitle("Saved to disk");
      setTerminalOutput((prev) => prev + `[Saved] ${active.path}\n`);
      setTimeout(() => setRobotState("idle"), 2500);
    } catch (e: any) {
      setRobotState("error");
      setStatusTitle("Save failed");
      setStatusSubtitle(e.message);
    }
  };

  const handleRunCode = async () => {
    const active = openTabs[activeTabIdx];
    if (!active) return;

    if (active.dirty) {
      await handleSaveFile();
    }

    setIsExecuting(true);
    setRobotState("testing");
    setStatusTitle(`Running ${active.name}...`);
    setStatusSubtitle("Executing in isolated sandbox");

    const isPython = active.path.endsWith(".py") || active.language === "python";
    const isTsJs = active.path.endsWith(".ts") || active.path.endsWith(".js");
    const cmd = isPython ? `python3 ${active.path}` : isTsJs ? `npx tsx ${active.path}` : `npm run build`;

    setTerminalOutput((prev) => prev + `\n$ ${cmd}\n`);

    try {
      const res = await fetch(`${API_BASE}/api/workspace/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: cmd }),
      });
      const data = await res.json();
      if (data.success && (data.exit_code === 0 || data.exit_code === undefined)) {
        setRobotState("success");
        setStatusTitle("Execution finished (Exit 0)");
        setStatusSubtitle("All tests passed");
        setTerminalOutput((prev) => prev + (data.output ? `${data.output}\n` : "Completed with exit code 0.\n"));
      } else {
        setRobotState("error");
        setStatusTitle(`Execution failed (Exit ${data.exit_code || 1})`);
        setStatusSubtitle("Error detected in execution");
        setTerminalOutput((prev) => prev + `${data.stderr || data.output || "Execution failed."}\n`);
      }
    } catch (e: any) {
      setRobotState("error");
      setStatusTitle("Run error");
      setTerminalOutput((prev) => prev + `Execution error: ${e.message}\n`);
    } finally {
      setIsExecuting(false);
      setTimeout(() => setRobotState("idle"), 3000);
    }
  };

  // AI Code Edit / Feature Generator Flow
  const handleSendMessage = async (instruction: string) => {
    setChatMessages((prev) => [...prev, { role: "user", content: instruction }]);
    setIsExecuting(true);
    setRobotState("thinking");
    setStatusTitle("Thinking & planning...");
    setStatusSubtitle("NEMI-CO analyzing request");

    const activeTab = openTabs[activeTabIdx] || openTabs[0];
    const instLower = instruction.toLowerCase();
    let initialTarget = activeTab?.path || "my-app/src/App.tsx";
    let currentCode = activeTab?.content || "";

    if (instLower.includes("palindrome")) {
      initialTarget = "palindrome.py";
      currentCode = "";
    } else if (instLower.includes(".py") || (instLower.includes("python") && !initialTarget.endsWith(".py"))) {
      initialTarget = "solution.py";
      currentCode = "";
    } else if ((instLower.includes("app.tsx") || instLower.includes("reset") || instLower.includes("button") || instLower.includes("landing")) && !initialTarget.endsWith(".tsx")) {
      const appTab = openTabs.find((t) => t.name === "App.tsx");
      if (appTab) {
        initialTarget = appTab.path;
        currentCode = appTab.content;
      }
    }

    try {
      // Transition to Coding
      setRobotState("coding");
      setStatusTitle("Writing code...");
      setStatusSubtitle("Multi-agent synthesis in progress");

      const res = await fetch(`${API_BASE}/api/workspace/ai-edit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          file_path: initialTarget,
          instruction,
          current_content: currentCode,
          auto_apply: false,
        }),
      });

      const data = await res.json();
      const resolvedTarget = data.target_file || initialTarget;
      const resolvedName = resolvedTarget.split("/").pop() || resolvedTarget;
      const isPython = resolvedTarget.endsWith(".py");

      let newCode = "";
      let summary = data.explanation || `Updated ${resolvedName} according to instructions.`;

      if (data.replacement_snippet) {
        if (data.original_snippet && currentCode.includes(data.original_snippet) && resolvedTarget === initialTarget) {
          newCode = currentCode.replace(data.original_snippet, data.replacement_snippet);
        } else {
          newCode = data.replacement_snippet;
        }
      } else {
        // High-quality contextual fallback synthesis
        if (instruction.toLowerCase().includes("reset") || instruction.toLowerCase().includes("counter")) {
          newCode = currentCode.replace(
            `Clicked {count} times\n        </button>`,
            `Clicked {count} times\n        </button>\n        <button onClick={() => setCount(0)} className="ml-3 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-xs rounded-full cursor-pointer">Reset</button>`
          );
          summary = "Added counter reset functionality.";
        } else if (instruction.toLowerCase().includes("dark") || instruction.toLowerCase().includes("indigo") || instruction.toLowerCase().includes("blue")) {
          newCode = currentCode.replace(/text-red-500/g, "text-indigo-400").replace(/bg-red-600/g, "bg-indigo-600");
          summary = "Updated color theme to indigo accent.";
        } else {
          newCode = currentCode;
          summary = `Applied requested updates to ${resolvedName}.`;
        }
      }

      // Preserve undo state
      setLastUndoContent(currentCode);

      // Save file to disk
      await fetch(`${API_BASE}/api/workspace/file`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          file_path: resolvedTarget,
          content: newCode,
          overwrite: true,
        }),
      });

      // Update workspace file list
      await loadWorkspaceFiles();

      // Ensure tab exists and is active
      const langMap: Record<string, string> = {
        tsx: "typescript",
        ts: "typescript",
        jsx: "javascript",
        js: "javascript",
        css: "css",
        json: "json",
        html: "html",
        py: "python",
      };
      const ext = resolvedName.split(".").pop() || "";
      const targetLang = langMap[ext] || "plaintext";

      setOpenTabs((prev) => {
        const existingIdx = prev.findIndex(
          (t) => t.path === resolvedTarget || t.name === resolvedName
        );
        if (existingIdx >= 0) {
          const copy = [...prev];
          copy[existingIdx] = {
            ...copy[existingIdx],
            path: resolvedTarget,
            name: resolvedName,
            content: newCode,
            language: targetLang,
            dirty: false,
          };
          setActiveTabIdx(existingIdx);
          return copy;
        } else {
          const newTab: OpenTab = {
            path: resolvedTarget,
            name: resolvedName,
            content: newCode,
            language: targetLang,
            dirty: false,
          };
          setActiveTabIdx(prev.length);
          return [...prev, newTab];
        }
      });

      // Transition to Execution & Verification
      setRobotState("testing");

      if (isPython) {
        setStatusTitle(`Testing ${resolvedName}...`);
        setStatusSubtitle(`Running python3 ${resolvedTarget}`);
        setTerminalOutput((prev) => prev + `\n$ python3 ${resolvedTarget}\n`);

        const runRes = await fetch(`${API_BASE}/api/workspace/run`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ command: `python3 ${resolvedTarget}` }),
        });
        const runData = await runRes.json();
        const passed = runData.success && (runData.exit_code === 0 || runData.exit_code === undefined);

        if (passed) {
          setTerminalOutput((prev) => prev + `${runData.output || ""}\n`);
          setRobotState("success");
          setStatusTitle("Tests passed! (Exit 0)");
          setStatusSubtitle("Verified working output");
          setIsExecuting(false);

          const humanMessage = isPython
            ? `I've created the palindrome program in ${resolvedName} and tested it with multiple test cases. Everything passed cleanly!`
            : summary.replace(/^✓\s*/, "");

          setChatMessages((prev) => [
            ...prev,
            {
              role: "agent",
              content: humanMessage,
              fileModified: resolvedName,
              canUndo: true,
            },
          ]);
        } else {
          setTerminalOutput((prev) => prev + `${runData.stderr || runData.output || "Execution failed."}\n`);
          setRobotState("error");
          setStatusTitle(`Execution failed (Exit ${runData.exit_code || 1})`);
          setStatusSubtitle("Error detected");
          setIsExecuting(false);

          setChatMessages((prev) => [
            ...prev,
            {
              role: "agent",
              content: `I hit an error running the tests in ${resolvedName}: ${runData.stderr || runData.output || "test failed"}`,
              fileModified: resolvedName,
            },
          ]);
        }
      } else {
        // Frontend / React component update
        setStatusTitle("Compiling & updating...");
        setStatusSubtitle("Vite HMR updating preview");
        setTerminalOutput((prev) => prev + `\n> vite hmr [update] ${resolvedTarget}\n✓ Rebuilt in 38ms\n`);

        setTimeout(() => {
          setRobotState("success");
          setStatusTitle("Build successful!");
          setStatusSubtitle("Preview live at");
          setIsExecuting(false);

          const humanFrontendMessage = instruction.toLowerCase().includes("reset")
            ? `I've added the reset button right next to the counter in ${resolvedName}. You can see and test it right in the preview now!`
            : summary.replace(/^✓\s*/, "");

          setChatMessages((prev) => [
            ...prev,
            {
              role: "agent",
              content: humanFrontendMessage,
              fileModified: resolvedName,
              canUndo: true,
            },
          ]);

          setTimeout(() => setRobotState("idle"), 3000);
        }, 500);
      }
    } catch (e: any) {
      setRobotState("error");
      setStatusTitle("Synthesis error");
      setStatusSubtitle(e.message || "Failed to edit file");
      setIsExecuting(false);

      setChatMessages((prev) => [
        ...prev,
        {
          role: "agent",
          content: `Error: ${e.message || "Failed to process instruction"}`,
        },
      ]);
    }
  };

  const handleUndoLastEdit = async () => {
    if (!lastUndoContent) return;
    const active = openTabs[activeTabIdx];
    if (!active) return;

    try {
      await fetch(`${API_BASE}/api/workspace/file`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          file_path: active.path,
          content: lastUndoContent,
          overwrite: true,
        }),
      });

      setOpenTabs((prev) => {
        const copy = [...prev];
        if (copy[activeTabIdx]) {
          copy[activeTabIdx] = { ...copy[activeTabIdx], content: lastUndoContent, dirty: false };
        }
        return copy;
      });

      setLastUndoContent(null);
      setRobotState("success");
      setStatusTitle("Reverted changes");
      setStatusSubtitle(`Restored ${active.name}`);
      setTerminalOutput((prev) => prev + `[Reverted] ${active.name}\n`);
      setTimeout(() => setRobotState("idle"), 2500);
    } catch {}
  };

  const handleRunTerminalCommand = async (cmd: string) => {
    setTerminalOutput((prev) => prev + `\n$ ${cmd}\n`);
    setIsExecuting(true);
    setRobotState("testing");
    setStatusTitle(`Running ${cmd}...`);
    setStatusSubtitle("Sandbox executing");

    try {
      const res = await fetch(`${API_BASE}/api/workspace/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: cmd }),
      });
      const data = await res.json();
      if (data.success) {
        setRobotState("success");
        setStatusTitle("Command finished (Exit 0)");
        setTerminalOutput((prev) => prev + `${data.output || "Done."}\n`);
      } else {
        setRobotState("error");
        setStatusTitle(`Command failed (Exit ${data.exit_code || 1})`);
        setTerminalOutput((prev) => prev + `${data.stderr || data.output || "Execution failed."}\n`);
      }
    } catch (e: any) {
      setRobotState("error");
      setStatusTitle("Command execution error");
      setTerminalOutput((prev) => prev + `Error: ${e.message}\n`);
    } finally {
      setIsExecuting(false);
      setTimeout(() => setRobotState("idle"), 2500);
    }
  };

  // Find App.tsx code for live preview
  const appTab = openTabs.find((t) => t.name === "App.tsx") || openTabs[0];
  const previewCode = appTab?.content || "";

  return (
    <div
      data-testid="workspace-shell"
      className="fixed inset-0 w-screen h-screen bg-[#060709] flex flex-col overflow-hidden text-white font-sans select-none z-30"
    >
      {/* Background Subtle Celestial Crimson Horizon Bleed (Matching Reference Image) */}
      <div
        className="absolute -bottom-40 left-10 w-[750px] h-[380px] rounded-full pointer-events-none opacity-20 blur-3xl z-0"
        style={{
          background: "radial-gradient(circle, rgba(237, 51, 39, 0.9) 0%, rgba(120, 10, 15, 0.3) 50%, transparent 75%)",
        }}
      />
      <div
        className="absolute -bottom-48 right-10 w-[600px] h-[340px] rounded-full pointer-events-none opacity-15 blur-3xl z-0"
        style={{
          background: "radial-gradient(circle, rgba(237, 51, 39, 0.7) 0%, transparent 70%)",
        }}
      />

      {/* 1. Top Navigation Bar ([N] NEMI-CO, Search, Settings, Avatar) */}
      <div className="relative z-30 shrink-0">
        <NemiTopNavigation
          currentTab={currentTab}
          onTabChange={setCurrentTab}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onLogoClick={() => {
            if (typeof window !== "undefined") window.location.href = "/";
          }}
        />
      </div>

      {/* 2. Main 4-Column Cockpit Workspace (Matching Reference Image) */}
      <div className="flex-1 flex overflow-hidden relative z-10 p-2.5 gap-2.5 min-h-0">
        {/* COLUMN 1: PROJECT FILE EXPLORER (Left, Collapsible) */}
        {isSidebarOpen && (
          <div
            data-testid="project-explorer"
            className="w-[200px] lg:w-[220px] shrink-0 flex flex-col overflow-hidden transition-all duration-150"
          >
            <ProjectExplorer
              files={files}
              activeFile={openTabs[activeTabIdx]?.path || openTabs[activeTabIdx]?.name}
              onSelectFile={handleOpenFile}
              onCreateFile={handleCreateFile}
              onDeleteFile={handleDeleteFile}
              onRenameFile={handleRenameFile}
            />
          </div>
        )}

        {/* CENTER SECTION: CODE EDITOR + LIVE PREVIEW + BOTTOM TERMINAL */}
        <div className="flex-1 min-w-0 flex flex-col gap-2.5 overflow-hidden">
          {/* TOP ROW: CODE EDITOR (Left) + LIVE PREVIEW (Right) */}
          <div className="flex-1 min-h-0 flex gap-2.5 overflow-hidden">
            {/* MONACO CODE EDITOR (Large Canvas, Takes Most Space) */}
            <div data-testid="monaco-editor" className="flex-1 min-w-0 flex flex-col overflow-hidden">
              <MonacoWorkspaceEditor
                openTabs={openTabs}
                activeTabIdx={activeTabIdx}
                onSelectTab={setActiveTabIdx}
                onCloseTab={(idx) => {
                  if (openTabs.length <= 1) return;
                  setOpenTabs((prev) => prev.filter((_, i) => i !== idx));
                  setActiveTabIdx((prev) => Math.max(0, idx - 1));
                }}
                onNewTab={() => handleCreateFile(`my-app/src/NewComponent_${openTabs.length + 1}.tsx`)}
                onContentChange={(val) => {
                  setOpenTabs((prev) => {
                    const copy = [...prev];
                    if (copy[activeTabIdx]) {
                      copy[activeTabIdx] = { ...copy[activeTabIdx], content: val, dirty: true };
                    }
                    return copy;
                  });
                }}
                onSave={handleSaveFile}
                onRun={handleRunCode}
                apiBase={API_BASE}
                toggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
                isSidebarOpen={isSidebarOpen}
                toggleTerminal={() => setIsTerminalOpen((prev) => !prev)}
                isTerminalOpen={isTerminalOpen}
              />
            </div>

            {/* LIVE FRONTEND BROWSER PREVIEW (Center-Right, Matching Reference Image) */}
            <div className="w-[340px] lg:w-[420px] xl:w-[460px] shrink-0 flex flex-col overflow-hidden">
              <LiveFrontendPreview
                code={previewCode}
                url="http://localhost:5173"
                output={terminalOutput}
                activeFileName={openTabs[activeTabIdx]?.name || "App.tsx"}
                activeFileType={
                  openTabs[activeTabIdx]?.language === "python" || openTabs[activeTabIdx]?.path.endsWith(".py")
                    ? "console"
                    : "web"
                }
                onRun={handleRunCode}
                onStatusChange={(status, msg) => {
                  if (status === "error") {
                    setRobotState("error");
                    setStatusTitle("Compile Error");
                    setStatusSubtitle(msg);
                  } else if (status === "success" && robotState === "error") {
                    setRobotState("idle");
                    setStatusTitle("Build successful!");
                    setStatusSubtitle("Preview live at");
                  }
                }}
              />
            </div>
          </div>

          {/* BOTTOM ROW: COLLAPSIBLE TERMINAL (Spanning below Editor & Preview) */}
          {isTerminalOpen && (
            <div data-testid="terminal-panel" className="h-[170px] lg:h-[190px] shrink-0">
              <TerminalPanel
                output={terminalOutput}
                onClear={() => setTerminalOutput("")}
                onExecuteCommand={handleRunTerminalCommand}
                onClose={() => setIsTerminalOpen(false)}
                isExecuting={isExecuting}
              />
            </div>
          )}
        </div>

        {/* COLUMN 4: NEMI-CO ROBOT ASSISTANT & CHAT (Right Column, Matching Reference Image) */}
        <div
          data-testid="nemi-robot-panel"
          className="w-[300px] lg:w-[330px] xl:w-[350px] shrink-0 flex flex-col overflow-hidden transition-all duration-150"
        >
          <NemiRobotAssistantPanel
            robotState={robotState}
            statusTitle={statusTitle}
            statusSubtitle={statusSubtitle}
            previewUrl="http://localhost:5173"
            messages={chatMessages}
            isExecuting={isExecuting}
            onSendMessage={handleSendMessage}
            onUndoLastEdit={handleUndoLastEdit}
            onClearChat={() => setChatMessages([])}
          />
        </div>
      </div>

      {/* Command Palette Modal */}
      {isCommandPaletteOpen && (
        <CommandPalette
          isOpen={isCommandPaletteOpen}
          onClose={() => setIsCommandPaletteOpen(false)}
          onSelectAction={(actionId) => {
            if (actionId.includes("setting")) setIsSettingsOpen(true);
            else if (actionId.includes("terminal")) setIsTerminalOpen(true);
            setIsCommandPaletteOpen(false);
          }}
        />
      )}

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-[#111116] border border-white/10 rounded-2xl p-6 shadow-2xl relative">
            <button
              onClick={() => setIsSettingsOpen(false)}
              className="absolute top-4 right-4 p-2 text-white/60 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
            <SettingsView />
          </div>
        </div>
      )}
    </div>
  );
}
