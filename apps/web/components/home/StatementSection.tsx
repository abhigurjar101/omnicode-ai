"use client";

import React from "react";

export function StatementSection() {
  return (
    <section className="py-28 sm:py-36 px-6 sm:px-12 paper-texture text-[#080808] border-t border-[#e5e6e2]">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-4xl">
          <span className="font-mono text-[11px] tracking-widest uppercase text-[#ed3327] block mb-6">
            The Premise
          </span>
          <p className="font-heading text-3xl sm:text-5xl lg:text-6xl font-normal leading-[1.08] tracking-[-0.035em] text-[#080808]">
            Your technology matured. Your website and brand didn&apos;t.
          </p>
          <p className="mt-8 font-body text-xl sm:text-2xl text-[#666666] leading-relaxed max-w-3xl">
            We close that gap with one team that handles positioning, brand identity, custom code and real-time 3D in-house. No handoff friction, no generic agency templates.
          </p>
        </div>
      </div>
    </section>
  );
}
