"use client";

import React, { useState, useEffect, useRef } from "react";

interface FooterProps {
  onStartBuilding?: () => void;
  isFixed?: boolean;
}

export function Footer({ onStartBuilding, isFixed = true }: FooterProps = {}) {
  const [timeString, setTimeString] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Precise UTC+1 calculation
      const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;
      const utcPlusOne = new Date(utcTime + 3600000 * 1);
      const hours24 = utcPlusOne.getHours();
      const ampm = hours24 >= 12 ? "PM" : "AM";
      const formattedHours = ((hours24 + 11) % 12 + 1).toString().padStart(2, "0");
      const minutes = utcPlusOne.getMinutes().toString().padStart(2, "0");
      const seconds = utcPlusOne.getSeconds().toString().padStart(2, "0");
      setTimeString(`${formattedHours}:${minutes}:${seconds} ${ampm}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Web Audio API Synth for subtle ambient drone
  const toggleSound = () => {
    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        audioCtxRef.current = ctx;

        // Master Gain
        const masterGain = ctx.createGain();
        masterGain.gain.setValueAtTime(0.035, ctx.currentTime);
        masterGain.connect(ctx.destination);
        gainNodeRef.current = masterGain;

        // Low-pass Filter for dark, deep-tech warmth
        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(280, ctx.currentTime);
        filter.connect(masterGain);

        // Sub oscillator (55Hz root note A1)
        const osc1 = ctx.createOscillator();
        osc1.type = "sine";
        osc1.frequency.setValueAtTime(55, ctx.currentTime);
        osc1.connect(filter);
        osc1.start();

        // 5th harmonic oscillator (82.4Hz E2)
        const osc2 = ctx.createOscillator();
        osc2.type = "sine";
        osc2.frequency.setValueAtTime(82.4, ctx.currentTime);
        osc2.connect(filter);
        osc2.start();

        setIsPlaying(true);
      } else {
        const ctx = audioCtxRef.current;
        if (ctx.state === "suspended") {
          ctx.resume();
          if (gainNodeRef.current) {
            gainNodeRef.current.gain.setTargetAtTime(0.035, ctx.currentTime, 0.2);
          }
          setIsPlaying(true);
        } else if (ctx.state === "running") {
          if (gainNodeRef.current) {
            gainNodeRef.current.gain.setTargetAtTime(0, ctx.currentTime, 0.15);
          }
          setTimeout(() => {
            if (ctx.state === "running") ctx.suspend();
          }, 200);
          setIsPlaying(false);
        }
      }
    } catch (e) {
      console.warn("Audio playback not supported or blocked by policy", e);
      setIsPlaying(!isPlaying);
    }
  };

  const containerClasses = isFixed
    ? "fixed bottom-0 left-0 right-0 h-14 px-8 sm:px-14 flex items-center justify-between text-[12px] sm:text-[13px] text-[#888888] font-sans z-30 pointer-events-auto select-none bg-gradient-to-t from-black via-black/80 to-transparent"
    : "w-full h-14 px-8 sm:px-14 flex items-center justify-between text-[12px] sm:text-[13px] text-[#888888] font-sans z-30 pointer-events-auto select-none border-t border-[#520c15]/40 bg-[#060002]";

  return (
    <footer className={containerClasses}>
      {/* 1. Left: Copyright */}
      <div className="flex items-center min-w-[80px]">
        <span className="text-[#888888] tracking-tight">©2026</span>
      </div>

      {/* 2. Center-Left: Timezone and Live UTC+1 Clock */}
      <div className="flex items-center gap-6 sm:gap-10">
        <span className="text-[#888888] font-mono text-[12px]">(UTC+1)</span>
        <span className="text-[#D0D0D0] font-mono tracking-wider tabular-nums">
          {timeString || "12:38:50 AM"}
        </span>
      </div>

      {/* 3. Right: Sound control with wave bars and Sound text */}
      <button
        onClick={toggleSound}
        className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer group"
        title={isPlaying ? "Mute Ambient Sound" : "Play Ambient Sound"}
        aria-label="Toggle ambient sound"
      >
        <span className="flex items-end gap-[3px] h-3.5" aria-hidden="true">
          <span className={`w-[2px] bg-[#ff2626] rounded-full transition-all duration-300 ${isPlaying ? "h-3.5 animate-pulse" : "h-1.5"}`} />
          <span className={`w-[2px] bg-[#ff2626] rounded-full transition-all duration-300 ${isPlaying ? "h-2 animate-bounce" : "h-1"}`} />
          <span className={`w-[2px] bg-[#ff2626] rounded-full transition-all duration-300 ${isPlaying ? "h-3 animate-pulse" : "h-2"}`} />
        </span>
        <span className="text-[12px] text-[#A0A0A0] group-hover:text-white font-sans tracking-tight">
          {isPlaying ? "Playing" : "Sound"}
        </span>
      </button>
    </footer>
  );
}
