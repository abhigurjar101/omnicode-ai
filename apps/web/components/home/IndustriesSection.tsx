"use client";

import React, { useState } from "react";

const INDUSTRIES = [
  {
    id: "robotics",
    name: "Robotics & Hardware",
    stat: "Sub-millimeter",
    statLabel: "Inspection Precision",
    desc: "Autonomous drones, edge computers, sensor payloads, and embedded avionics requiring 3D exploded views and interactive CAD models.",
    image: "/images/industries/robotics-hardware.webp",
  },
  {
    id: "climate",
    name: "Climate Tech",
    stat: "100% Zero-Carbon",
    statLabel: "Decarbonization Impact",
    desc: "Hydrogen flight, renewable microgrids, and carbon-removal technologies communicating planetary scale and verifiable measurement.",
    image: "/images/industries/climate-tech.webp",
  },
  {
    id: "deeptech",
    name: "Deep Tech",
    stat: "Physics-Native",
    statLabel: "Scientific Validation",
    desc: "Quantum sensing, advanced materials, and optical systems translating peer-reviewed research into commercial buyer confidence.",
    image: "/images/industries/deeptech.webp",
  },
  {
    id: "ai",
    name: "AI & Automation",
    stat: "Autonomous",
    statLabel: "Execution Graphs",
    desc: "Multi-agent coding systems, foundation model pipelines, and synthetic intelligence platforms proven with live interactive benchmarks.",
    image: "/images/industries/ai-automation.webp",
  },
  {
    id: "saas",
    name: "SaaS & Dev Tools",
    stat: "< 100ms",
    statLabel: "Latency SLA",
    desc: "High-velocity developer tooling, cloud infrastructure, and technical platforms engineered for rapid adoption and self-serve onboarding.",
    image: "/images/industries/saas.webp",
  },
];

export function IndustriesSection() {
  const [activeIdx, setActiveIdx] = useState(0);

  return (
    <section id="industries" className="py-24 sm:py-36 px-6 sm:px-12 bg-[#080808] text-white border-t border-white/10">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-3xl mb-16">
          <span className="font-mono text-[11px] tracking-widest uppercase text-[#ed3327] block mb-3">
            Industry Focus
          </span>
          <h2 className="font-heading text-3xl sm:text-5xl font-normal tracking-tight text-white">
            Every tech sector convinces a different way.
          </h2>
          <p className="font-body text-white/50 text-[16px] mt-4">
            We adapt positioning and visual fidelity to the specific psychology of your buyers and investors.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap gap-2 border-b border-white/10 pb-6 mb-12">
          {INDUSTRIES.map((ind, idx) => (
            <button
              key={ind.id}
              onClick={() => setActiveIdx(idx)}
              className={`font-heading text-[16px] sm:text-[18px] px-5 py-2.5 transition-all ${
                activeIdx === idx
                  ? "bg-white text-black font-medium"
                  : "bg-white/5 text-white/70 hover:text-white hover:bg-white/10"
              }`}
            >
              {ind.name}
            </button>
          ))}
        </div>

        {/* Active Industry Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7">
            <div className="aspect-[16/10] bg-[#141414] overflow-hidden rounded-[2px] relative border border-white/10">
              <img
                src={INDUSTRIES[activeIdx].image}
                alt={INDUSTRIES[activeIdx].name}
                className="w-full h-full object-cover transition-all duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
                <div>
                  <span className="font-mono text-[11px] uppercase tracking-wider text-[#ed3327] block">
                    Core Metric
                  </span>
                  <span className="font-heading text-2xl sm:text-3xl text-white font-medium">
                    {INDUSTRIES[activeIdx].stat}
                  </span>
                  <span className="font-mono text-[12px] text-white/60 block">
                    {INDUSTRIES[activeIdx].statLabel}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <span className="font-mono text-[12px] text-[#ed3327] uppercase tracking-wider block">
              0{activeIdx + 1} / Sector Narrative
            </span>
            <h3 className="font-heading text-3xl font-normal text-white">
              {INDUSTRIES[activeIdx].name}
            </h3>
            <p className="font-body text-white/70 text-[17px] leading-relaxed">
              {INDUSTRIES[activeIdx].desc}
            </p>
            <div className="pt-6 border-t border-white/10 flex items-center gap-4">
              <span className="w-2 h-2 rounded-full bg-[#ed3327]" />
              <span className="font-mono text-[12px] text-white/50">
                Verified Sector Case Studies Available
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
