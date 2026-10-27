"use client";

import React from "react";
import { ArrowUpRight } from "lucide-react";

const SERVICES = [
  {
    num: "01",
    title: "Websites",
    desc: "Custom high-performance platforms built in Next.js, Astro or Framer. Clean code, sub-second load times, and structured content models your team can update anytime.",
    tags: ["Custom Code", "Next.js", "Framer", "Astro"],
  },
  {
    num: "02",
    title: "3D & Motion",
    desc: "Real-time WebGL and Three.js environments that make complex hardware, chips, and industrial tech tangible in the browser without slowing down the page.",
    tags: ["Three.js", "WebGL", "Blender", "Interactive 3D"],
  },
  {
    num: "03",
    title: "Brand & Identity",
    desc: "Strategic positioning, visual identity, design systems, and typography that communicate engineering authority to enterprise clients and venture investors.",
    tags: ["Visual Identity", "Positioning", "Art Direction"],
  },
  {
    num: "04",
    title: "Fundraising Platforms",
    desc: "Launch pads and investor portals crafted for series announcements and Y Combinator demos. Designed to turn complex technology into immediate clarity.",
    tags: ["Pitch Platforms", "Launch Kits", "Demo Portals"],
  },
  {
    num: "05",
    title: "Technical SEO & AI Search",
    desc: "Semantic HTML5, automated schema.org graphing, and Core Web Vitals tuned so your tech ranks at the top of Google, Perplexity, and ChatGPT answers.",
    tags: ["Core Web Vitals", "AI Search", "JSON-LD Schema"],
  },
];

export function ServicesSection() {
  return (
    <section id="services" className="py-24 sm:py-32 px-6 sm:px-12 bg-[#080808] text-white border-t border-white/10">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <span className="font-mono text-[11px] tracking-widest uppercase text-[#ed3327] block mb-3">
              Capabilities
            </span>
            <h2 className="font-heading text-3xl sm:text-5xl font-normal tracking-tight text-white">
              Websites, 3D, brand and search from one team.
            </h2>
          </div>
          <p className="font-body text-white/50 text-[16px] max-w-sm">
            Everything designed and engineered in-house, tailored to high-growth tech companies.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/10 border border-white/10">
          {SERVICES.map((s, idx) => (
            <div
              key={idx}
              className="bg-[#080808] p-8 sm:p-10 flex flex-col justify-between group hover:bg-[#111111] transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-8">
                  <span className="font-mono text-[13px] text-[#ed3327]">{s.num}</span>
                  <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowUpRight className="w-3.5 h-3.5 text-[#ed3327]" />
                  </div>
                </div>
                <h3 className="font-heading text-2xl font-normal text-white mb-4 group-hover:text-[#ed3327] transition-colors">
                  {s.title}
                </h3>
                <p className="font-body text-white/60 text-[15px] leading-relaxed mb-8">
                  {s.desc}
                </p>
              </div>

              <div className="flex flex-wrap gap-2 pt-4 border-t border-white/10">
                {s.tags.map((tag, tIdx) => (
                  <span
                    key={tIdx}
                    className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 bg-white/5 text-white/70 border border-white/10"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}

          {/* Quick CTA card */}
          <div className="bg-[#120306] p-8 sm:p-10 flex flex-col justify-between border-t md:border-t-0 border-[#3d0b10]">
            <div>
              <span className="font-mono text-[13px] text-[#ed3327]">COLLABORATE</span>
              <h3 className="font-heading text-2xl font-normal text-white mt-8 mb-4">
                Have a project in mind?
              </h3>
              <p className="font-body text-white/60 text-[15px] leading-relaxed mb-8">
                We review briefs within 24 hours. Schedule an intro call or open the live studio workspace.
              </p>
            </div>
            <a
              href="#contact"
              className="inline-flex items-center justify-between px-6 py-3.5 bg-[#ed3327] hover:bg-[#d6261c] text-white text-[14px] font-medium transition-colors"
            >
              <span>Get in touch</span>
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
