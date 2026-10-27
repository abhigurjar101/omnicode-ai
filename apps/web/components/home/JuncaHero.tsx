"use client";

import React, { useState, useEffect } from "react";
import { JuncaRobotCanvas } from "@/components/canvas/JuncaRobotCanvas";
import { turbineAudio } from "@/lib/audioTurbine";
import { ArrowUpRight, Terminal } from "lucide-react";

interface JuncaHeroProps {
  onOpenWorkspace?: () => void;
}

export function JuncaHero({ onOpenWorkspace }: JuncaHeroProps) {
  const [soundActive, setSoundActive] = useState(false);
  const [timeString, setTimeString] = useState("--:--:--");

  // Live ticking clock (UTC+1 style)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(
        now.toLocaleTimeString("en-US", {
          hour12: true,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleSound = () => {
    const active = turbineAudio.toggle();
    setSoundActive(active);
  };

  return (
    <section
      className="relative w-full h-screen min-h-screen flex flex-col justify-between pt-[64px] pb-8 px-6 sm:px-12 lg:px-16 bg-black text-white overflow-hidden select-none"
      style={{
        background:
          "radial-gradient(ellipse 70% 65% at 76% 40%, rgba(105, 4, 8, 0.55) 0%, rgba(45, 2, 4, 0.32) 44%, #000000 82%)",
      }}
    >
      {/* 3D Robot Canvas in Center/Right Background */}
      <div className="absolute inset-0 pointer-events-none z-10 touch-pan-y">
        <JuncaRobotCanvas isSoundActive={soundActive} />
      </div>

      {/* Top spacer (under fixed header) */}
      <div className="relative z-20 w-full" />

      {/* Main Headline (Lower Left Aligned, Clean with NO Clutter) */}
      <div className="relative z-20 w-full mt-auto mb-16">
        <div className="max-w-xl sm:max-w-2xl lg:max-w-[720px]">
          <h1 className="font-heading text-[38px] sm:text-[54px] lg:text-[64px] font-normal leading-[1.05] tracking-[-0.035em] text-white">
            We build premium web experiences for the world&apos;s most ambitious tech companies.
          </h1>
        </div>
      </div>

      {/* Bottom Bar: Copyright, Time, and Turbine Sound Toggle */}
      <div className="relative z-30 w-full flex items-center justify-between text-white/70 text-[13px] font-mono">
        {/* Left: Copyright & Live Clock */}
        <div className="flex items-center gap-6 sm:gap-10">
          <span>©2026</span>
          <div className="flex items-center gap-3">
            <span className="text-white/40">(UTC+1)</span>
            <span className="text-white/90">{timeString}</span>
          </div>
        </div>

        {/* Right: Sound Turbine Button */}
        <button
          onClick={handleToggleSound}
          className="flex items-center gap-2.5 text-white/80 hover:text-white transition-colors cursor-pointer group"
          aria-label="Toggle turbine sound"
        >
          {/* Turbine 3-Blade SVG matching Junca Studio */}
          <svg
            className={`w-4 h-4 text-white transition-transform duration-700 ${
              soundActive ? "animate-spin text-[#ED3327]" : "group-hover:rotate-45"
            }`}
            style={{ animationDuration: soundActive ? "1.2s" : undefined }}
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 12 C 13.6 8.6, 13.2 4.6, 10.1 2.5 C 15.6 2, 19.3 6.4, 18.7 10.6 C 16.6 11.7, 14.2 12.1, 12 12 Z" />
            <path
              d="M12 12 C 13.6 8.6, 13.2 4.6, 10.1 2.5 C 15.6 2, 19.3 6.4, 18.7 10.6 C 16.6 11.7, 14.2 12.1, 12 12 Z"
              transform="rotate(120 12 12)"
            />
            <path
              d="M12 12 C 13.6 8.6, 13.2 4.6, 10.1 2.5 C 15.6 2, 19.3 6.4, 18.7 10.6 C 16.6 11.7, 14.2 12.1, 12 12 Z"
              transform="rotate(240 12 12)"
            />
            <circle cx="12" cy="12" r="2.2" />
          </svg>
          <span className="text-[13px] font-normal tracking-wide">
            Sound
          </span>
        </button>
      </div>
    </section>
  );
}
