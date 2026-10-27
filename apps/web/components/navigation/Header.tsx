"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown, Menu, X, Terminal, Cpu, ShieldCheck } from "lucide-react";

interface HeaderProps {
  currentView?: "home" | "workspace" | "runs" | "memory" | "settings";
  onViewChange?: (view: "home" | "workspace" | "runs" | "memory" | "settings") => void;
  onOpenCommandPalette?: () => void;
  nvidiaConnected?: boolean;
  onStartBuilding?: () => void;
}

export function Header({
  currentView = "home",
  onViewChange,
  onOpenCommandPalette,
  nvidiaConnected = false,
  onStartBuilding,
}: HeaderProps) {
  const [servicesOpen, setServicesOpen] = useState(false);
  const [industriesOpen, setIndustriesOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleStartProject = () => {
    if (onStartBuilding) {
      onStartBuilding();
    } else if (onViewChange) {
      onViewChange("workspace");
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full h-[58px] bg-[#080101]/96 backdrop-blur-md border-b border-white/[0.07] flex items-stretch select-none font-sans text-[13.5px] tracking-tight">
      {/* 1. Logo Segment (framed in red box matching Junca Studio reference) */}
      <div className="flex items-center px-4 sm:px-6 lg:px-8 border-r border-white/[0.07] bg-transparent shrink-0">
        <Link
          href="/"
          onClick={(e) => {
            if (onViewChange) {
              e.preventDefault();
              onViewChange("home");
            }
          }}
          className="border border-white/[0.28] px-3.5 py-1.5 flex items-baseline gap-1 hover:border-white/[0.55] hover:shadow-[0_0_14px_rgba(255,255,255,0.12)] transition-all cursor-pointer"
        >
          <span className="font-semibold text-white tracking-tight text-[15px]">NEMI-CODE</span>
          <span className="text-[10px] text-[#A7A7A7] font-normal">™</span>
        </Link>
      </div>

      {/* 2. Desktop Navigation Segments (Exact matching: Services, Industries, Projects, Studio, News) */}
      <nav className="hidden md:flex items-stretch flex-1 overflow-visible" role="navigation">
        {/* Services Dropdown */}
        <div
          className="relative flex items-stretch"
          onMouseEnter={() => setServicesOpen(true)}
          onMouseLeave={() => setServicesOpen(false)}
        >
          <button
            onClick={() => setServicesOpen(!servicesOpen)}
            className={`px-6 lg:px-7 flex items-center gap-2.5 border-r border-white/[0.07] text-[#D4D4D4] hover:text-white hover:bg-white/[0.04] transition-colors whitespace-nowrap ${
              servicesOpen ? "bg-white/[0.06] text-white" : ""
            }`}
          >
            <span>Services</span>
            <div className="w-3.5 h-3.5 rounded-[2px] border border-white/[0.15] flex items-center justify-center">
              <ChevronDown className="w-2.5 h-2.5 text-[#B8B8B8]" />
            </div>
          </button>

          {servicesOpen && (
            <div className="absolute top-[58px] left-0 w-72 bg-[#0a0101]/96 backdrop-blur-xl border border-white/[0.08] shadow-[0_20px_40px_rgba(0,0,0,0.85)] py-2 z-50 text-[13px]">
              <div className="px-4 py-1.5 text-[10px] uppercase font-mono tracking-widest text-[#888]">Platform Services</div>
              <Link
                href="/workspace"
                onClick={() => onViewChange && onViewChange("workspace")}
                className="flex items-start gap-3 px-4 py-2.5 hover:bg-[#ff2a2a]/15 hover:text-white text-[#CCCCCC] transition-colors"
              >
                <Terminal className="w-4 h-4 text-[#ff2a2a] mt-0.5 shrink-0" />
                <div>
                  <div className="font-medium text-white">Autonomous Engineering</div>
                  <div className="text-[11px] text-[#888]">Multi-agent planning, synthesis & execution</div>
                </div>
              </Link>
              <div
                onClick={onOpenCommandPalette}
                className="flex items-start gap-3 px-4 py-2.5 hover:bg-[#ff2a2a]/15 hover:text-white text-[#CCCCCC] cursor-pointer transition-colors"
              >
                <Cpu className="w-4 h-4 text-[#ff6666] mt-0.5 shrink-0" />
                <div>
                  <div className="font-medium text-white">LangGraph DAG Orchestration</div>
                  <div className="text-[11px] text-[#888]">Coordinated multi-agent workflow pipelines</div>
                </div>
              </div>
              <div
                onClick={onOpenCommandPalette}
                className="flex items-start gap-3 px-4 py-2.5 hover:bg-[#ff2a2a]/15 hover:text-white text-[#CCCCCC] cursor-pointer transition-colors"
              >
                <ShieldCheck className="w-4 h-4 text-[#ff2a2a] mt-0.5 shrink-0" />
                <div>
                  <div className="font-medium text-white">Automated Code Review</div>
                  <div className="text-[11px] text-[#888]">Closed-loop testing & security verification</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Industries Dropdown */}
        <div
          className="relative flex items-stretch"
          onMouseEnter={() => setIndustriesOpen(true)}
          onMouseLeave={() => setIndustriesOpen(false)}
        >
          <button
            onClick={() => setIndustriesOpen(!industriesOpen)}
            className={`px-6 lg:px-7 flex items-center gap-2.5 border-r border-white/[0.07] text-[#D4D4D4] hover:text-white hover:bg-white/[0.04] transition-colors whitespace-nowrap ${
              industriesOpen ? "bg-white/[0.06] text-white" : ""
            }`}
          >
            <span>Industries</span>
            <div className="w-3.5 h-3.5 rounded-[2px] border border-white/[0.15] flex items-center justify-center">
              <ChevronDown className="w-2.5 h-2.5 text-[#B8B8B8]" />
            </div>
          </button>

          {industriesOpen && (
            <div className="absolute top-[58px] left-0 w-72 bg-[#0a0101]/96 backdrop-blur-xl border border-white/[0.08] shadow-[0_20px_40px_rgba(0,0,0,0.85)] py-2 z-50 text-[13px]">
              <div className="px-4 py-1.5 text-[10px] uppercase font-mono tracking-widest text-[#888]">Target Sectors</div>
              <div
                onClick={onOpenCommandPalette}
                className="px-4 py-2 hover:bg-[#ff2a2a]/15 text-[#CCCCCC] cursor-pointer"
              >
                <div className="font-medium text-white">Autonomous AI & DevTools</div>
                <div className="text-[11px] text-[#888]">Next-generation software development tools</div>
              </div>
              <div
                onClick={onOpenCommandPalette}
                className="px-4 py-2 hover:bg-[#ff2a2a]/15 text-[#CCCCCC] cursor-pointer"
              >
                <div className="font-medium text-white">FinTech & High-Frequency Systems</div>
                <div className="text-[11px] text-[#888]">Ultra low latency algorithmic pipelines</div>
              </div>
              <div
                onClick={onOpenCommandPalette}
                className="px-4 py-2 hover:bg-[#ff2a2a]/15 text-[#CCCCCC] cursor-pointer"
              >
                <div className="font-medium text-white">Enterprise Cloud & Infrastructure</div>
                <div className="text-[11px] text-[#888]">High scale distributed architectures</div>
              </div>
            </div>
          )}
        </div>

        {/* Projects Segment */}
        <a
          href="#platform"
          className="px-6 lg:px-7 flex items-center border-r border-white/[0.07] text-[#D4D4D4] hover:text-white hover:bg-white/[0.04] transition-colors whitespace-nowrap"
        >
          <span>Projects</span>
        </a>

        {/* Studio Segment */}
        <a
          href="#architecture"
          className="px-6 lg:px-7 flex items-center border-r border-white/[0.07] text-[#D4D4D4] hover:text-white hover:bg-white/[0.04] transition-colors whitespace-nowrap"
        >
          <span>Studio</span>
        </a>

        {/* Workspace Segment */}
        <a
          href="/workspace"
          className={`px-6 lg:px-7 flex items-center border-r border-white/[0.07] transition-colors whitespace-nowrap ${
            currentView === "workspace" ? "text-white bg-white/[0.06]" : "text-[#D4D4D4] hover:text-white hover:bg-white/[0.04]"
          }`}
        >
          <span>Workspace</span>
        </a>

        {/* News Segment */}
        <button
          onClick={onOpenCommandPalette}
          className="px-6 lg:px-7 flex items-center border-r border-white/[0.07] text-[#D4D4D4] hover:text-white hover:bg-white/[0.04] transition-colors whitespace-nowrap"
        >
          <span>News</span>
        </button>

        {/* Middle Spacer - stretches across with matching dark burgundy translucent fill */}
        <div className="flex-1 bg-transparent" />
      </nav>

      {/* 3. Right: Contact & Start a project red button (Exact Junca Studio match) */}
      <div className="flex items-stretch shrink-0">
        <button
          onClick={onOpenCommandPalette}
          className="hidden sm:flex px-6 lg:px-8 border-l border-white/[0.07] items-center text-[#D4D4D4] hover:text-white hover:bg-white/[0.04] transition-colors whitespace-nowrap"
        >
          <span>Contact</span>
        </button>

        <button
          onClick={handleStartProject}
          className="px-6 sm:px-8 flex items-center gap-2.5 bg-[#ff2626] hover:bg-[#e01f1f] active:bg-[#c91a1a] text-white font-medium text-[13.5px] sm:text-[14px] transition-all shadow-[0_0_22px_rgba(255,38,38,0.38)] whitespace-nowrap cursor-pointer group"
        >
          <span>Start a project</span>
          <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-0.5 transition-transform" />
        </button>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden px-4 flex items-center justify-center border-l border-white/[0.07] text-[#D4D4D4] hover:text-white"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-[58px] left-0 right-0 bg-[#080101]/98 border-b border-white/[0.07] shadow-2xl flex flex-col p-4 space-y-3 z-50 text-[14px]">
          <Link
            href="/workspace"
            onClick={() => {
              if (onViewChange) onViewChange("workspace");
              setMobileMenuOpen(false);
            }}
            className="px-4 py-2.5 rounded bg-[#250409] text-white font-medium flex items-center justify-between"
          >
            <span>Start a project</span>
            <ArrowRight className="w-4 h-4 text-[#ff2626]" />
          </Link>
          <a
            href="#platform"
            onClick={() => setMobileMenuOpen(false)}
            className="px-4 py-2 text-[#CCCCCC] hover:text-white"
          >
            Services
          </a>
          <a
            href="#architecture"
            onClick={() => setMobileMenuOpen(false)}
            className="px-4 py-2 text-[#CCCCCC] hover:text-white"
          >
            Industries
          </a>
          <a
            href="#projects"
            onClick={() => setMobileMenuOpen(false)}
            className="px-4 py-2 text-[#CCCCCC] hover:text-white"
          >
            Projects
          </a>
          <a
            href="#studio"
            onClick={() => setMobileMenuOpen(false)}
            className="px-4 py-2 text-[#CCCCCC] hover:text-white"
          >
            Studio
          </a>
          <button
            onClick={() => {
              onOpenCommandPalette?.();
              setMobileMenuOpen(false);
            }}
            className="text-left px-4 py-2 text-[#CCCCCC] hover:text-white"
          >
            News & Releases
          </button>
          <button
            onClick={() => {
              onOpenCommandPalette?.();
              setMobileMenuOpen(false);
            }}
            className="text-left px-4 py-2 text-[#CCCCCC] hover:text-white"
          >
            Contact
          </button>
        </div>
      )}
    </header>
  );
}
