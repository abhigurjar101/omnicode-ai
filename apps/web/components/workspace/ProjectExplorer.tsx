"use client";

import React, { useState, useMemo } from "react";
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Folder,
  FolderOpen,
  FileCode,
  FileText,
  FileJson,
  File,
  Check,
  X,
  Trash2,
  Edit2,
  Atom,
} from "lucide-react";

interface ProjectExplorerProps {
  files: string[];
  activeFile: string;
  onSelectFile: (path: string) => void;
  onNewFile?: () => void;
  onCreateFile?: (name: string) => void;
  onDeleteFile?: (path: string) => void;
  onRenameFile?: (oldPath: string, newPath: string) => void;
  className?: string;
}

function getFileIcon(name: string) {
  const ext = name.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "tsx":
    case "jsx":
      return Atom;
    case "ts":
    case "js":
    case "py":
      return FileCode;
    case "json":
      return FileJson;
    case "css":
    case "html":
    case "md":
    case "txt":
      return FileText;
    default:
      return File;
  }
}

export function ProjectExplorer({
  files,
  activeFile,
  onSelectFile,
  onNewFile,
  onCreateFile,
  onDeleteFile,
  onRenameFile,
  className = "",
}: ProjectExplorerProps) {
  const [collapsedFolders, setCollapsedFolders] = useState<Record<string, boolean>>({
    "components": true,
    "assets": true,
    "agent": true,
    "core": true,
  });

  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const [renamingPath, setRenamingPath] = useState<string | null>(null);
  const [renameVal, setRenameVal] = useState("");

  const toggleFolder = (folderPath: string) => {
    setCollapsedFolders((prev) => ({
      ...prev,
      [folderPath]: !prev[folderPath],
    }));
  };

  const handleStartRename = (e: React.MouseEvent, path: string, currentName: string) => {
    e.stopPropagation();
    setRenamingPath(path);
    setRenameVal(currentName);
  };

  const handleConfirmRename = () => {
    if (!renamingPath || !renameVal.trim()) {
      setRenamingPath(null);
      return;
    }
    const parts = renamingPath.split("/");
    parts[parts.length - 1] = renameVal.trim();
    const newPath = parts.join("/");
    if (newPath !== renamingPath && onRenameFile) {
      onRenameFile(renamingPath, newPath);
    }
    setRenamingPath(null);
  };

  const handleStartCreate = () => {
    setIsCreatingFile(true);
    setNewFileName("");
  };

  const handleConfirmCreate = () => {
    const trimmed = newFileName.trim();
    if (trimmed) {
      if (onCreateFile) {
        onCreateFile(trimmed);
      } else if (onNewFile) {
        onNewFile();
      }
    }
    setIsCreatingFile(false);
    setNewFileName("");
  };

  const handleCancelCreate = () => {
    setIsCreatingFile(false);
    setNewFileName("");
  };

  // Prioritize my-app files first to match reference image cleanly
  const displayList = useMemo(() => {
    const defaultList = [
      "my-app/src/App.tsx",
      "my-app/src/main.tsx",
      "my-app/src/index.css",
      "my-app/components",
      "my-app/assets",
      "my-app/index.html",
      "my-app/package.json",
    ];

    if (!files || files.length === 0) return defaultList;

    const filtered = files.filter(
      (f) =>
        !f.startsWith(".") &&
        !f.startsWith("~") &&
        !f.includes("/.") &&
        !f.includes("node_modules") &&
        !f.includes("__pycache__") &&
        !f.includes(".git") &&
        !f.includes(".venv")
    );

    const myAppFiles = filtered.filter((f) => f.startsWith("my-app/"));
    if (myAppFiles.length > 0) {
      return myAppFiles;
    }
    return defaultList;
  }, [files]);

  // Build tree
  const tree = useMemo(() => {
    const root: { [key: string]: any } = {};

    for (const filePath of displayList) {
      const parts = filePath.split("/").filter(Boolean);
      let curr = root;
      let currPath = "";

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        currPath = currPath ? `${currPath}/${part}` : part;
        const isLast = i === parts.length - 1;

        if (isLast && part.includes(".")) {
          curr[part] = { __isFile: true, path: filePath, name: part };
        } else {
          if (!curr[part]) {
            curr[part] = { __isFolder: true, path: currPath, name: part, __children: {} };
          }
          curr = curr[part].__children;
        }
      }
    }
    return root;
  }, [displayList]);

  const renderNode = (nodeName: string, nodeData: any, level: number = 0) => {
    if (nodeData.__isFile) {
      const Icon = getFileIcon(nodeData.name);
      const isSelected =
        activeFile === nodeData.path ||
        activeFile === nodeData.name ||
        activeFile.endsWith(nodeData.name);

      if (renamingPath === nodeData.path) {
        return (
          <div
            key={nodeData.path}
            style={{ paddingLeft: `${level * 14 + 10}px` }}
            className="flex items-center gap-1.5 py-1 pr-2 my-0.5 bg-[#170a0e] rounded-lg border border-[#ED3327]/40"
          >
            <Icon className="w-3.5 h-3.5 text-[#ED3327] shrink-0" />
            <input
              type="text"
              autoFocus
              value={renameVal}
              onChange={(e) => setRenameVal(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleConfirmRename();
                if (e.key === "Escape") setRenamingPath(null);
              }}
              onBlur={handleConfirmRename}
              className="flex-1 bg-black/90 border border-[#ED3327]/60 rounded px-1.5 py-0.5 text-xs text-white focus:outline-none font-mono"
            />
          </div>
        );
      }

      return (
        <div
          key={nodeData.path}
          onClick={() => onSelectFile(nodeData.path)}
          style={{ paddingLeft: `${level * 14 + 10}px` }}
          className={`group flex items-center justify-between py-1.5 pr-2.5 my-0.5 rounded-lg text-xs cursor-pointer transition-all ${
            isSelected
              ? "bg-[#28070b] border border-[#ED3327]/60 text-white font-medium shadow-[0_0_16px_rgba(237,51,39,0.3)]"
              : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
          }`}
        >
          <div className="flex items-center gap-2 truncate">
            <Icon
              className={`w-3.5 h-3.5 shrink-0 ${
                isSelected ? "text-[#ED3327]" : "text-zinc-500 group-hover:text-zinc-300"
              }`}
            />
            <span className="truncate">{nodeData.name}</span>
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {onRenameFile && (
              <button
                onClick={(e) => handleStartRename(e, nodeData.path, nodeData.name)}
                className="p-0.5 hover:text-zinc-200 text-zinc-500 transition-colors"
                title="Rename file"
              >
                <Edit2 className="w-3 h-3" />
              </button>
            )}
            {onDeleteFile && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm(`Delete ${nodeData.name}?`)) onDeleteFile(nodeData.path);
                }}
                className="p-0.5 hover:text-red-400 text-zinc-500 transition-colors"
                title="Delete file"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      );
    }

    if (nodeData.__isFolder) {
      const isCollapsed = !!collapsedFolders[nodeData.path];
      const hasChildren = Object.keys(nodeData.__children || {}).length > 0;

      return (
        <div key={nodeData.path} className="select-none">
          <div
            onClick={() => toggleFolder(nodeData.path)}
            style={{ paddingLeft: `${level * 14 + 10}px` }}
            className="flex items-center gap-1.5 py-1.5 pr-2 text-xs text-zinc-300 hover:text-white hover:bg-white/[0.03] rounded-lg cursor-pointer transition-colors"
          >
            {hasChildren ? (
              isCollapsed ? (
                <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
              )
            ) : (
              <span className="w-3.5" />
            )}

            {isCollapsed ? (
              <Folder className="w-3.5 h-3.5 text-[#ED3327]/80" />
            ) : (
              <FolderOpen className="w-3.5 h-3.5 text-[#ED3327]" />
            )}

            <span className="font-medium truncate">{nodeData.name}</span>
          </div>

          {!isCollapsed && hasChildren && (
            <div>
              {Object.keys(nodeData.__children)
                .sort((a, b) => {
                  const aIsFolder = !!nodeData.__children[a].__isFolder;
                  const bIsFolder = !!nodeData.__children[b].__isFolder;
                  if (aIsFolder && !bIsFolder) return -1;
                  if (!aIsFolder && bIsFolder) return 1;
                  return a.localeCompare(b);
                })
                .map((childKey) => renderNode(childKey, nodeData.__children[childKey], level + 1))}
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <div
      className={`h-full flex flex-col bg-[#0b0b0e] border border-white/[0.08] rounded-xl overflow-hidden shadow-2xl relative select-none ${className}`}
    >
      {/* Background Subtle Cosmic Horizon Bleed */}
      <div
        className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full pointer-events-none opacity-20 blur-xl"
        style={{
          background: "radial-gradient(circle, rgba(237, 51, 39, 0.8) 0%, transparent 70%)",
        }}
      />

      {/* 1. Header: Project + Add Button */}
      <div className="h-10 px-3 bg-[#111116] border-b border-white/[0.08] flex items-center justify-between shrink-0">
        <span className="text-xs font-semibold text-white tracking-wide">Project</span>
        <button
          onClick={handleStartCreate}
          className="p-1 hover:bg-white/10 text-white/60 hover:text-white rounded transition-colors cursor-pointer"
          title="New File"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Inline File Creator Input */}
      {isCreatingFile && (
        <div className="p-2 bg-[#170a0e] border-b border-[#ED3327]/30 flex items-center gap-1.5 shrink-0 animate-in fade-in">
          <input
            type="text"
            autoFocus
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleConfirmCreate();
              if (e.key === "Escape") handleCancelCreate();
            }}
            placeholder="my-app/src/NewComponent.tsx"
            className="flex-1 bg-black/80 border border-[#ED3327]/50 rounded px-2 py-1 text-xs text-white focus:outline-none font-mono"
          />
          <button
            onClick={handleConfirmCreate}
            className="p-1 text-emerald-400 hover:text-emerald-300 rounded"
          >
            <Check className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleCancelCreate}
            className="p-1 text-zinc-400 hover:text-white rounded"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 2. Scrollable Tree List */}
      <div className="flex-1 min-h-0 overflow-y-auto p-2 relative z-10 space-y-0.5">
        {Object.keys(tree)
          .sort((a, b) => {
            const aIsFolder = !!tree[a].__isFolder;
            const bIsFolder = !!tree[b].__isFolder;
            if (aIsFolder && !bIsFolder) return -1;
            if (!aIsFolder && bIsFolder) return 1;
            return a.localeCompare(b);
          })
          .map((rootKey) => renderNode(rootKey, tree[rootKey], 0))}
      </div>
    </div>
  );
}
