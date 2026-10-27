"use client";

import React, { useState } from "react";
import { Search, Settings, ChevronDown, LogOut, ExternalLink } from "lucide-react";

interface NemiTopNavigationProps {
  currentTab?: "workspace" | "runs" | "memory" | "settings";
  onTabChange?: (tab: "workspace" | "runs" | "memory" | "settings") => void;
  onOpenCommandPalette: () => void;
  onOpenSettings?: () => void;
  onLogoClick?: () => void;
}

export function NemiTopNavigation({
  currentTab = "workspace",
  onTabChange,
  onOpenCommandPalette,
  onOpenSettings,
  onLogoClick,
}: NemiTopNavigationProps) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <header className="h-14 w-full px-5 flex items-center justify-between z-40 select-none text-xs font-sans border-b border-white/[0.08] bg-[#0c0c10]/95 backdrop-blur-xl relative">
      {/* Subtle Cosmic Crimson Top Arc Glow */}
      <div
        className="absolute top-0 left-1/4 right-1/4 h-[2px] pointer-events-none opacity-80"
        style={{
          background: "radial-gradient(ellipse at center, rgba(237, 51, 39, 0.9) 0%, rgba(237, 51, 39, 0.2) 60%, transparent 100%)",
          filter: "drop-shadow(0 0 8px rgba(237, 51, 39, 0.8))",
        }}
      />

      {/* 1. Left: [N] NEMI-CO Wordmark */}
      <div className="flex items-center gap-3">
        <button
          onClick={onLogoClick}
          className="flex items-center gap-2.5 hover:opacity-90 transition-opacity text-left cursor-pointer group"
          title="Return to Landing Page"
        >
          {/* Red Glowing 'N' Badge Icon (Matching Reference Image) */}
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#ff4438] to-[#cc1810] flex items-center justify-center font-bold text-white text-sm shadow-[0_0_18px_rgba(237,51,39,0.55)] group-hover:scale-105 transition-transform">
            N
          </div>
          <span className="font-heading font-bold text-white tracking-tight text-[17px] group-hover:text-[#ED3327] transition-colors">
            NEMI-CO
          </span>
        </button>
      </div>

      {/* 2. Right: Search, Settings, User Avatar */}
      <div className="flex items-center gap-3">
        {/* Search / Command Palette Button */}
        <button
          onClick={onOpenCommandPalette}
          className="p-2 text-white/60 hover:text-white hover:bg-white/[0.06] rounded-lg transition-colors cursor-pointer"
          title="Search / Command Palette (⌘P or ⌘K)"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Settings Button */}
        <button
          onClick={() => {
            if (onOpenSettings) onOpenSettings();
            else if (onTabChange) onTabChange("settings");
          }}
          className="p-2 text-white/60 hover:text-white hover:bg-white/[0.06] rounded-lg transition-colors cursor-pointer"
          title="Settings & API Configuration"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* User Avatar Circle: Red 'A' + Chevron (Matching Reference Image) */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-1.5 p-1 pl-1.5 hover:bg-white/[0.06] rounded-full transition-colors cursor-pointer"
          >
            <div className="w-7 h-7 rounded-full bg-[#ED3327] flex items-center justify-center font-bold text-white text-xs shadow-[0_0_10px_rgba(237,51,39,0.4)]">
              A
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-white/50" />
          </button>

          {/* User Dropdown Menu */}
          {userMenuOpen && (
            <div
              onMouseLeave={() => setUserMenuOpen(false)}
              className="absolute right-0 top-10 w-48 bg-[#111116] border border-white/[0.12] rounded-xl shadow-2xl p-2 z-50 animate-in fade-in duration-150 flex flex-col gap-1"
            >
              <div className="px-3 py-1.5 border-b border-white/[0.08] text-[11px] text-white/40 font-mono">
                abhigurjar@staff
              </div>
              <button
                onClick={() => {
                  setUserMenuOpen(false);
                  if (onLogoClick) onLogoClick();
                }}
                className="w-full text-left px-3 py-2 text-xs text-white/80 hover:text-white hover:bg-white/5 rounded flex items-center justify-between transition-colors"
              >
                <span>Landing Page</span>
                <ExternalLink className="w-3 h-3 text-white/40" />
              </button>
              <button
                onClick={() => {
                  setUserMenuOpen(false);
                  if (onOpenSettings) onOpenSettings();
                  else if (onTabChange) onTabChange("settings");
                }}
                className="w-full text-left px-3 py-2 text-xs text-white/80 hover:text-white hover:bg-white/5 rounded flex items-center justify-between transition-colors"
              >
                <span>Model Settings</span>
                <Settings className="w-3 h-3 text-white/40" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
