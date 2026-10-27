"use client";

import React, { useState } from "react";
import { Plus, Minus } from "lucide-react";

const FAQS = [
  {
    q: "What does the studio do?",
    a: "We are a web, brand and 3D studio for tech and deep tech companies whose technology has matured faster than their brand and website. We close that gap with one team that handles positioning, visual identity, custom code in Next.js/Astro, and real-time 3D built in Three.js and Blender.",
  },
  {
    q: "Which technologies do you build with?",
    a: "We select the stack that fits your technical requirements: Next.js or Astro paired with headless CMS (like Sanity) for lightning-fast sites with custom real-time 3D in the browser, or Framer for marketing sites your team wants to visually edit and iterate on rapidly.",
  },
  {
    q: "How long does a project take?",
    a: "A high-performance marketing website typically ships in 4 to 6 weeks once the brief is agreed upon. Projects incorporating custom brand identity, interactive 3D WebGL scenes, or complex hardware viewers usually take 8 to 12 weeks with clear weekly milestones.",
  },
  {
    q: "Can our team update content after launch?",
    a: "Yes. On Next.js and Astro, we connect a headless CMS where your team can edit text, publish articles, and update product specs in real time without touching source code. On Framer, your team edits directly on canvas.",
  },
  {
    q: "Where is the studio based and do you work internationally?",
    a: "We operate remotely with tech companies across the United States, United Kingdom, and Europe, maintaining direct Slack communication and scheduled demo syncs throughout the project.",
  },
];

export function FaqSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-24 sm:py-36 px-6 sm:px-12 bg-[#080808] text-white border-t border-white/10">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-5">
            <span className="font-mono text-[11px] tracking-widest uppercase text-[#ed3327] block mb-3">
              FAQ
            </span>
            <h2 className="font-heading text-3xl sm:text-5xl font-normal tracking-tight text-white mb-6">
              Got a question? We answer it here.
            </h2>
            <p className="font-body text-white/50 text-[16px] leading-relaxed max-w-sm mb-8">
              Everything you need to know about our process, technology stack, and how we collaborate with technical founders.
            </p>
            <div className="flex items-center gap-2 text-white/40 font-mono text-[12px]">
              <span className="w-2 h-2 rounded-full bg-[#ed3327]" />
              Direct founder responses
            </div>
          </div>

          <div className="lg:col-span-7 divide-y divide-white/10 border-y border-white/10">
            {FAQS.map((faq, idx) => (
              <div key={idx} className="py-6">
                <button
                  onClick={() => toggle(idx)}
                  className="w-full flex items-center justify-between text-left group"
                >
                  <span className="font-heading text-xl sm:text-2xl font-normal text-white group-hover:text-[#ed3327] transition-colors pr-6">
                    {faq.q}
                  </span>
                  <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center flex-none group-hover:border-[#ed3327] transition-colors">
                    {openIdx === idx ? (
                      <Minus className="w-4 h-4 text-[#ed3327]" />
                    ) : (
                      <Plus className="w-4 h-4 text-white/70 group-hover:text-[#ed3327]" />
                    )}
                  </div>
                </button>

                {openIdx === idx && (
                  <div className="mt-4 pr-12">
                    <p className="font-body text-white/70 text-[16px] leading-relaxed">
                      {faq.a}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
