"use client";

import React from "react";

interface NemiLogoProps {
  size?: number;
  className?: string;
  showWordmark?: boolean;
}

export function NemiSymbol({ size = 28, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="NEMI-CODE Symbol"
    >
      <defs>
        <linearGradient id="nemi-red-grad" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ED3327" />
          <stop offset="100%" stopColor="#5F0000" />
        </linearGradient>
      </defs>

      {/* Left Column: Pure white precision bar */}
      <rect x="5" y="6" width="5" height="20" rx="1" fill="#FFFFFF" />

      {/* Diagonal kinetic bridge: Signal Red gradient */}
      <path
        d="M9.5 7.5L22.5 24.5H18L6.5 9.5L9.5 7.5Z"
        fill="url(#nemi-red-grad)"
      />

      {/* Right Column: Signal Red pillar */}
      <rect x="22" y="6" width="5" height="20" rx="1" fill="#ED3327" />

      {/* Ocular Core indicator */}
      <circle cx="24.5" cy="8.5" r="2" fill="#FFFFFF" />
    </svg>
  );
}

export function NemiLogo({
  size = 28,
  className = "",
  showWordmark = true,
}: NemiLogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <NemiSymbol size={size} />
      {showWordmark && (
        <div className="flex items-baseline font-mono select-none">
          <span className="font-extrabold text-[16px] tracking-[-0.04em] text-white">
            NEMI
          </span>
          <span className="font-bold text-[16px] text-[#ED3327] mx-[1px]">
            -
          </span>
          <span className="font-extrabold text-[16px] tracking-[-0.04em] text-white">
            CO
          </span>
        </div>
      )}
    </div>
  );
}
