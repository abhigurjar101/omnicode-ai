"use client";

import React from "react";

export function CockpitCanopyArch() {
  return (
    <div className="absolute top-14 left-0 right-0 h-8 pointer-events-none z-20 overflow-hidden select-none flex items-center justify-center">
      {/* Curving structural arch bar */}
      <div className="w-[96%] max-w-7xl h-7 border-t border-b border-[#ED3327]/60 rounded-t-[14px] bg-gradient-to-b from-[#140406]/95 via-[#0a0203]/70 to-transparent shadow-[0_0_20px_rgba(237,51,39,0.35)] flex items-center justify-center relative">
        {/* Subtle neon glow tube running along top arch */}
        <div className="absolute -top-[1.5px] left-10 right-10 h-[2px] bg-gradient-to-r from-transparent via-[#ED3327] to-transparent shadow-[0_0_12px_#ED3327]" />

        {/* Left Arch Neon Accent & Trusses */}
        <div className="absolute left-6 hidden sm:flex items-center gap-1.5 opacity-80">
          <div className="w-16 h-[2px] bg-gradient-to-r from-transparent to-[#ED3327]" />
          <div className="w-2 h-2 rounded-[2px] bg-[#ED3327]/80" />
          <div className="w-8 h-[2px] bg-[#ED3327]" />
        </div>

        {/* Overhead Center Badge: "NEMI CORE-01" matching reference image exactly */}
        <div className="px-5 py-0.5 rounded-md bg-[#07080a] border border-[#ED3327]/90 shadow-[0_0_20px_rgba(237,51,39,0.5),_inset_0_0_10px_rgba(237,51,39,0.2)] flex items-center gap-3">
          {/* Left red indicator bar */}
          <div className="flex items-center gap-1">
            <span className="w-3 h-[2px] bg-[#ED3327]" />
            <span className="w-1.5 h-1.5 rounded-full bg-[#ED3327] animate-pulse" />
          </div>

          <span className="text-[11px] font-mono font-bold tracking-widest text-white uppercase drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">
            NEMI CORE-01
          </span>

          {/* Right red indicator bar */}
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ED3327] animate-pulse" />
            <span className="w-3 h-[2px] bg-[#ED3327]" />
          </div>
        </div>

        {/* Right Arch Neon Accent & Trusses */}
        <div className="absolute right-6 hidden sm:flex items-center gap-1.5 opacity-80">
          <div className="w-8 h-[2px] bg-[#ED3327]" />
          <div className="w-2 h-2 rounded-[2px] bg-[#ED3327]/80" />
          <div className="w-16 h-[2px] bg-gradient-to-l from-transparent to-[#ED3327]" />
        </div>
      </div>
    </div>
  );
}
