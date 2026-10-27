"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronDown, ArrowUpRight, Menu, X, Terminal } from "lucide-react";

interface JuncaHeaderProps {
  onOpenWorkspace?: () => void;
  isWorkspaceOpen?: boolean;
}

export function JuncaHeader({ onOpenWorkspace, isWorkspaceOpen }: JuncaHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const toggleDropdown = (name: string) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-[64px] bg-black/90 backdrop-blur-md border-b border-white/[0.12] text-white">
      <div className="w-full h-full flex items-center justify-between">
        {/* Left Cells: Logo + Nav Items */}
        <div className="h-full flex items-center">
          {/* Logo Cell */}
          <Link
            href="/"
            onClick={(e) => {
              if (isWorkspaceOpen && onOpenWorkspace) {
                e.preventDefault();
                onOpenWorkspace();
              }
            }}
            className="h-full flex items-center px-6 sm:px-8 border-r border-white/[0.12] hover:bg-white/[0.03] transition-colors group"
          >
            <span className="font-heading text-[19px] sm:text-[20px] font-semibold tracking-tight text-white group-hover:text-[#ED3327] transition-colors">
              NEMI-CO
            </span>
            <span className="text-[10px] font-mono text-white/50 ml-0.5 align-super">™</span>
          </Link>

          {/* Desktop Navigation Cells */}
          <nav className="hidden lg:flex items-center h-full">
            {/* Workspace Link (Prominent) */}
            <Link
              href="/workspace"
              className="h-full flex items-center gap-2 px-5 border-r border-white/[0.12] text-[14px] text-white hover:text-[#ED3327] hover:bg-white/[0.03] transition-colors font-medium cursor-pointer"
            >
              <Terminal className="w-3.5 h-3.5 text-[#ED3327]" />
              <span>Workspace</span>
            </Link>

            {/* Services with Chevron Box */}
            <div className="relative h-full">
              <button
                onClick={() => toggleDropdown("services")}
                onMouseEnter={() => setOpenDropdown("services")}
                className="h-full flex items-center gap-2 px-5 border-r border-white/[0.12] text-[14px] text-white/85 hover:text-white hover:bg-white/[0.03] transition-colors cursor-pointer"
              >
                <span>Services</span>
                <span className="w-3.5 h-3.5 border border-white/30 flex items-center justify-center text-[9px] text-white/70">
                  <ChevronDown className="w-2.5 h-2.5" />
                </span>
              </button>

              {/* Services Dropdown */}
              {openDropdown === "services" && (
                <div
                  onMouseLeave={() => setOpenDropdown(null)}
                  className="absolute top-[64px] left-0 w-64 bg-black/95 backdrop-blur-xl border border-white/[0.12] p-3 shadow-2xl flex flex-col gap-1 z-50 animate-in fade-in duration-150"
                >
                  <a
                    href="#services"
                    onClick={() => setOpenDropdown(null)}
                    className="px-3 py-2 text-[13px] text-white/75 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    Autonomous AI Development
                  </a>
                  <a
                    href="#services"
                    onClick={() => setOpenDropdown(null)}
                    className="px-3 py-2 text-[13px] text-white/75 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    3D & WebGL Systems
                  </a>
                  <a
                    href="#services"
                    onClick={() => setOpenDropdown(null)}
                    className="px-3 py-2 text-[13px] text-white/75 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    Full-Stack Agent Execution
                  </a>
                  <a
                    href="#services"
                    onClick={() => setOpenDropdown(null)}
                    className="px-3 py-2 text-[13px] text-white/75 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    Automated Debugging & Verification
                  </a>
                </div>
              )}
            </div>

            {/* Industries with Chevron Box */}
            <div className="relative h-full">
              <button
                onClick={() => toggleDropdown("industries")}
                onMouseEnter={() => setOpenDropdown("industries")}
                className="h-full flex items-center gap-2 px-5 border-r border-white/[0.12] text-[14px] text-white/85 hover:text-white hover:bg-white/[0.03] transition-colors cursor-pointer"
              >
                <span>Industries</span>
                <span className="w-3.5 h-3.5 border border-white/30 flex items-center justify-center text-[9px] text-white/70">
                  <ChevronDown className="w-2.5 h-2.5" />
                </span>
              </button>

              {/* Industries Dropdown */}
              {openDropdown === "industries" && (
                <div
                  onMouseLeave={() => setOpenDropdown(null)}
                  className="absolute top-[64px] left-0 w-64 bg-black/95 backdrop-blur-xl border border-white/[0.12] p-3 shadow-2xl flex flex-col gap-1 z-50 animate-in fade-in duration-150"
                >
                  <a
                    href="#industries"
                    onClick={() => setOpenDropdown(null)}
                    className="px-3 py-2 text-[13px] text-white/75 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    AI & Autonomous Software
                  </a>
                  <a
                    href="#industries"
                    onClick={() => setOpenDropdown(null)}
                    className="px-3 py-2 text-[13px] text-white/75 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    Robotics & Hard Tech
                  </a>
                  <a
                    href="#industries"
                    onClick={() => setOpenDropdown(null)}
                    className="px-3 py-2 text-[13px] text-white/75 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    Fintech & Cloud Systems
                  </a>
                </div>
              )}
            </div>

            {/* Projects */}
            <a
              href="#projects"
              className="h-full flex items-center px-5 border-r border-white/[0.12] text-[14px] text-white/85 hover:text-white hover:bg-white/[0.03] transition-colors"
            >
              Projects
            </a>

            {/* Studio */}
            <a
              href="#studio"
              className="h-full flex items-center px-5 border-r border-white/[0.12] text-[14px] text-white/85 hover:text-white hover:bg-white/[0.03] transition-colors"
            >
              Studio
            </a>

            {/* News */}
            <a
              href="#news"
              className="h-full flex items-center px-5 border-r border-white/[0.12] text-[14px] text-white/85 hover:text-white hover:bg-white/[0.03] transition-colors"
            >
              News
            </a>
          </nav>
        </div>

        {/* Right Cells: Contact + Solid Red CTA */}
        <div className="h-full flex items-center">
          {/* Contact Cell */}
          <button
            onClick={onOpenWorkspace}
            className="hidden sm:flex h-full items-center px-6 border-l border-white/[0.12] text-[14px] text-white/85 hover:text-white hover:bg-white/[0.03] transition-colors cursor-pointer"
          >
            Contact
          </button>

          {/* Solid Red Full-Height Button: Workspace -> */}
          <Link
            href="/workspace"
            className="h-full flex items-center gap-3 px-6 sm:px-8 bg-[#ED3327] hover:bg-[#d6261c] text-white font-medium text-[14px] transition-colors cursor-pointer group"
          >
            <span>Workspace</span>
            <span className="text-[16px] transition-transform group-hover:translate-x-1">→</span>
          </Link>

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden h-full px-4 flex items-center border-l border-white/[0.12] text-white/80 hover:text-white"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed top-[64px] inset-x-0 bottom-0 bg-black/98 backdrop-blur-2xl border-t border-white/[0.12] p-6 flex flex-col justify-between overflow-y-auto z-50">
          <nav className="flex flex-col gap-6 text-[20px] font-heading font-normal">
            <a
              href="#services"
              onClick={() => setMobileMenuOpen(false)}
              className="border-b border-white/10 pb-4 text-white/80 hover:text-white"
            >
              Services
            </a>
            <a
              href="#industries"
              onClick={() => setMobileMenuOpen(false)}
              className="border-b border-white/10 pb-4 text-white/80 hover:text-white"
            >
              Industries
            </a>
            <a
              href="#projects"
              onClick={() => setMobileMenuOpen(false)}
              className="border-b border-white/10 pb-4 text-white/80 hover:text-white"
            >
              Projects
            </a>
            <a
              href="#studio"
              onClick={() => setMobileMenuOpen(false)}
              className="border-b border-white/10 pb-4 text-white/80 hover:text-white"
            >
              Studio
            </a>
            <a
              href="#news"
              onClick={() => setMobileMenuOpen(false)}
              className="border-b border-white/10 pb-4 text-white/80 hover:text-white"
            >
              News
            </a>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                if (onOpenWorkspace) onOpenWorkspace();
              }}
              className="border-b border-white/10 pb-4 text-left text-white/90 hover:text-[#ED3327] flex items-center justify-between"
            >
              <span>Workspace & Code Editor</span>
              <Terminal className="w-4 h-4 text-[#ED3327]" />
            </button>
          </nav>

          <div className="pt-6">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                if (onOpenWorkspace) onOpenWorkspace();
              }}
              className="w-full h-[50px] bg-[#ED3327] text-white font-medium flex items-center justify-center gap-2"
            >
              <span>Start a project</span>
              <span>→</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
