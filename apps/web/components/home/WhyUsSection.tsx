"use client";

import React from "react";

const REASONS = [
  {
    num: "01",
    title: "Engineers Who Design",
    desc: "We read your white papers, inspect your CAD and codebases, and understand the physics, data, or AI behind your product before designing anything.",
  },
  {
    num: "02",
    title: "Direct Founder Access",
    desc: "You collaborate directly with the people designing and coding your platform. Zero account managers, zero telephone game, zero lost context.",
  },
  {
    num: "03",
    title: "Built for High Conversion",
    desc: "Visually breathtaking design calibrated to turn skeptical technical leads, corporate procurement directors, and tier-1 investors into partners.",
  },
];

export function WhyUsSection() {
  return (
    <section id="about" className="py-24 sm:py-36 px-6 sm:px-12 paper-texture text-[#080808] border-t border-[#e5e6e2]">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-20">
          <div>
            <span className="font-mono text-[11px] tracking-widest uppercase text-[#ed3327] block mb-3">
              Studio Methodology
            </span>
            <h2 className="font-heading text-3xl sm:text-5xl font-medium tracking-tight text-[#080808]">
              Why work with us?
            </h2>
          </div>
          <p className="font-body text-[#666666] text-[16px] max-w-sm">
            Closing the gap between deep-tech maturity and brand authority.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {REASONS.map((r, idx) => (
            <div
              key={idx}
              className="p-8 sm:p-10 border border-[#c2c2c2] bg-white/60 hover:bg-white hover:border-[#ed3327] transition-all flex flex-col justify-between"
            >
              <div>
                <span className="font-mono text-[12px] text-[#ed3327] block mb-8">{r.num}</span>
                <h3 className="font-heading text-2xl font-medium text-[#080808] mb-4">
                  {r.title}
                </h3>
                <p className="font-body text-[#666666] text-[15px] leading-relaxed">
                  {r.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
