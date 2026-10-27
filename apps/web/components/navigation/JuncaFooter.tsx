"use client";

import React from "react";
import { ArrowUpRight, Terminal } from "lucide-react";

interface JuncaFooterProps {
  onOpenWorkspace?: () => void;
}

export function JuncaFooter({ onOpenWorkspace }: JuncaFooterProps) {
  return (
    <footer id="contact" className="py-24 sm:py-32 px-6 sm:px-12 bg-black text-white border-t border-white/10">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 pb-20 border-b border-white/10">
          <div>
            <span className="font-mono text-[11px] tracking-widest uppercase text-[#ed3327] block mb-4">
              Get Started
            </span>
            <h2 className="font-heading text-4xl sm:text-6xl lg:text-7xl font-normal tracking-tight text-white leading-[0.95]">
              Let&apos;s build together.
            </h2>
          </div>

          <div className="max-w-md flex flex-col items-start gap-6">
            <p className="font-body text-white/60 text-[17px] leading-relaxed">
              We turn complex technologies into clear, premium and high-converting digital experiences. Reach out directly or jump into the workspace.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={onOpenWorkspace}
                className="inline-flex items-center gap-3 px-6 py-3.5 bg-[#ed3327] hover:bg-[#d6261c] text-white font-medium text-[14px] transition-colors"
              >
                <Terminal className="w-4 h-4" />
                <span>Launch Workspace</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
              <a
                href="mailto:contact@juncastudio.com"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-white/5 hover:bg-white/10 text-white border border-white/15 text-[14px] font-medium transition-colors"
              >
                <span>contact@juncastudio.com</span>
              </a>
            </div>
          </div>
        </div>

        {/* Footer Links & Metadata */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 py-16 border-b border-white/10 text-[15px]">
          <div>
            <h4 className="font-mono text-[11px] uppercase tracking-wider text-white/40 mb-4">
              Navigation
            </h4>
            <ul className="space-y-3 font-body text-white/70">
              <li>
                <a href="#services" className="hover:text-white transition-colors">
                  Services
                </a>
              </li>
              <li>
                <a href="#industries" className="hover:text-white transition-colors">
                  Industries
                </a>
              </li>
              <li>
                <a href="#projects" className="hover:text-white transition-colors">
                  Projects
                </a>
              </li>
              <li>
                <a href="#about" className="hover:text-white transition-colors">
                  Studio
                </a>
              </li>
              <li>
                <button
                  onClick={onOpenWorkspace}
                  className="hover:text-[#ed3327] transition-colors text-left"
                >
                  Workspace
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-mono text-[11px] uppercase tracking-wider text-white/40 mb-4">
              Capabilities
            </h4>
            <ul className="space-y-3 font-body text-white/70">
              <li>Websites & Code</li>
              <li>3D & Real-time WebGL</li>
              <li>Brand Systems</li>
              <li>Fundraising Portals</li>
              <li>Technical SEO</li>
            </ul>
          </div>

          <div>
            <h4 className="font-mono text-[11px] uppercase tracking-wider text-white/40 mb-4">
              Sectors
            </h4>
            <ul className="space-y-3 font-body text-white/70">
              <li>Robotics & Hardware</li>
              <li>Climate Tech</li>
              <li>Deep Tech & Optics</li>
              <li>AI & Autonomous Agents</li>
              <li>Developer Platforms</li>
            </ul>
          </div>

          <div>
            <h4 className="font-mono text-[11px] uppercase tracking-wider text-white/40 mb-4">
              Connect
            </h4>
            <ul className="space-y-3 font-body text-white/70">
              <li>
                <a
                  href="https://www.linkedin.com/company/junca/"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-1"
                >
                  LinkedIn
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-50" />
                </a>
              </li>
              <li>
                <a
                  href="https://x.com/Junca_Studio"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-1"
                >
                  Twitter / X
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-50" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.awwwards.com/junca-studio/"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-1"
                >
                  Awwwards
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-50" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom line */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-10 font-mono text-[12px] text-white/40">
          <div className="flex items-center gap-3">
            <span className="font-heading text-white text-[15px] font-medium">NEMI-CO</span>
            <span>•</span>
            <span>All Rights Reserved © 2026</span>
          </div>
          <div>
            <span>Web, Brand & 3D for Deep Tech</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
