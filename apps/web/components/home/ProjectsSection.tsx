"use client";

import React from "react";
import { ArrowUpRight } from "lucide-react";

const PROJECTS = [
  {
    title: "BotBlox Systems",
    category: "Robotics & Avionics",
    desc: "Interactive 3D product catalog and custom e-commerce architecture for micro-format Ethernet switches deployed in space and defense.",
    image: "/images/industries/robotics-hardware.webp",
    tags: ["WebGL", "E-Commerce", "Hardware 3D"],
    award: "Awwwards Honorable Mention",
  },
  {
    title: "Hylight (YC S23)",
    category: "Aerospace & Climate Tech",
    desc: "Complete brand identity, investor-ready launch platform, and hydrogen airship 3D rendering for planetary infrastructure inspection.",
    image: "/images/industries/climate-tech.webp",
    tags: ["Brand", "3D Scene", "Custom Code"],
    award: "Featured on TechCrunch",
  },
  {
    title: "Kestrix",
    category: "Deep Tech & AI",
    desc: "Thermal imaging visualization platform translating drone heat loss data into actionable building retrofit analytics.",
    image: "/images/industries/deeptech.webp",
    tags: ["Data Viz", "Next.js", "Positioning"],
  },
  {
    title: "Skipper NDT",
    category: "Industrial Inspection",
    desc: "High-precision terrestrial pipeline magnetic inspection interface engineered for enterprise energy operators.",
    image: "/images/industries/industries-manufacturing.webp",
    tags: ["Deep Tech", "3D WebGL", "Astro"],
  },
  {
    title: "Blink AI",
    category: "AI & Autonomous Vision",
    desc: "Next-generation computer vision intelligence platform designed for edge robotics and automated manufacturing lines.",
    image: "/images/industries/ai-automation.webp",
    tags: ["AI SaaS", "Three.js", "Brand System"],
  },
];

export function ProjectsSection() {
  return (
    <section id="projects" className="py-24 sm:py-36 px-6 sm:px-12 paper-texture text-[#080808] border-t border-[#e5e6e2]">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-20">
          <div>
            <span className="font-mono text-[11px] tracking-widest uppercase text-[#ed3327] block mb-3">
              Selected Projects
            </span>
            <h2 className="font-heading text-3xl sm:text-5xl font-medium tracking-tight text-[#080808]">
              They trusted us with their image.
            </h2>
          </div>
          <p className="font-body text-[#666666] text-[16px] max-w-sm">
            Case studies blending technical fidelity with visceral digital experiences.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {PROJECTS.map((project, idx) => (
            <div
              key={idx}
              className={`group cursor-pointer flex flex-col ${
                idx === 0 ? "md:col-span-2" : ""
              }`}
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#e5e6e2] rounded-[2px] mb-6">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />

                {/* Floating Tags on hover */}
                <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
                  {project.tags.map((tag, tIdx) => (
                    <span
                      key={tIdx}
                      className="font-mono text-[10px] uppercase tracking-wider px-2.5 py-1 bg-black/80 backdrop-blur-md text-white border border-white/20"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {project.award && (
                  <div className="absolute top-4 right-4 font-mono text-[10px] tracking-wider uppercase px-2.5 py-1 bg-[#ed3327] text-white">
                    {project.award}
                  </div>
                )}
              </div>

              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="font-mono text-[11px] uppercase tracking-wider text-[#ed3327] block mb-1">
                    {project.category}
                  </span>
                  <h3 className="font-heading text-2xl font-medium text-[#080808] group-hover:text-[#ed3327] transition-colors">
                    {project.title}
                  </h3>
                  <p className="font-body text-[#666666] text-[15px] leading-relaxed mt-2 max-w-xl">
                    {project.desc}
                  </p>
                </div>

                <div className="w-10 h-10 rounded-full border border-[#c2c2c2] flex items-center justify-center flex-none group-hover:border-[#ed3327] group-hover:bg-[#ed3327] group-hover:text-white transition-all">
                  <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
