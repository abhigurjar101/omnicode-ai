"use client";

import React from "react";
import { ArrowUpRight } from "lucide-react";

export function ReelSection() {
  return (
    <section className="py-24 sm:py-36 px-6 sm:px-12 bg-[#080808] text-white border-t border-white/10">
      <div className="max-w-7xl mx-auto">
        <span className="font-mono text-[11px] tracking-widest uppercase text-[#ed3327] block mb-4">
          The Observation
        </span>
        <h2 className="font-heading text-3xl sm:text-5xl lg:text-6xl font-normal leading-[1.05] tracking-[-0.035em] text-white max-w-5xl mb-16">
          Great technology, undersold by its website. That&apos;s what founders tell us, every week.
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7">
            <div className="aspect-[16/10] bg-[#141414] overflow-hidden rounded-[2px] relative border border-white/10">
              <img
                src="/images/team/team-pixel.webp"
                alt="Studio Founders & Engineering Team"
                className="w-full h-full object-cover grayscale contrast-125"
                loading="lazy"
              />
              <div className="absolute bottom-4 left-4 font-mono text-[11px] text-white/80 bg-black/80 px-3 py-1.5 backdrop-blur-md border border-white/15">
                NEMI-CO Studio Core Team • Paris & Remote
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col justify-between space-y-8">
            <div className="space-y-6">
              <span className="font-mono text-[12px] text-white/40 uppercase tracking-wider block">
                Founding Philosophy
              </span>
              <p className="font-body text-white/80 text-[18px] leading-relaxed">
                When you build cutting-edge chips, quantum sensors, or autonomous software, traditional agency templates fail. They don&apos;t understand your benchmarks, your telemetry, or your audience.
              </p>
              <p className="font-body text-white/60 text-[16px] leading-relaxed">
                We combine technical fluency with world-class digital craftsmanship so your digital presence matches the caliber of your engineering.
              </p>
            </div>

            <div className="pt-6 border-t border-white/10 flex items-center gap-6">
              <div>
                <span className="font-heading text-xl text-white block">Jules, Nathan & Corentin</span>
                <span className="font-mono text-[11px] text-[#ed3327] uppercase">Co-Founders</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
