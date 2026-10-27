"use client";

import React from "react";

const TESTIMONIALS = [
  {
    name: "Martin Laroche",
    role: "Co-Founder & CEO, Hylight (YC S23)",
    quote: "Junca delivered a brand and 3D web experience that elevated our aerospace hardware directly into tier-1 investor conversations. Their technical depth is rare.",
    avatar: "/images/clients/martin.webp",
  },
  {
    name: "Luigi Ferrara",
    role: "Founder & Lead Engineer, BotBlox",
    quote: "They understood our avionics boards immediately. The 3D viewer in the browser is blazing fast and has directly increased international enterprise inquiries.",
    avatar: "/images/clients/luigi.webp",
  },
  {
    name: "Lucy Lyons",
    role: "Co-Founder & CEO, Kestrix",
    quote: "Working directly with the creators made all the difference. Our thermal data is complex, but Junca turned it into an intuitive, high-converting story.",
    avatar: "/images/clients/lucy.webp",
  },
  {
    name: "Josh Gittins",
    role: "Head of Product, Skipper NDT",
    quote: "The visual polish and custom code performance blew away our expectations. It positioned us as the undisputed benchmark in terrestrial pipeline inspection.",
    avatar: "/images/clients/josh.webp",
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-24 sm:py-36 px-6 sm:px-12 paper-texture text-[#080808] border-t border-[#e5e6e2]">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-2xl mb-16">
          <span className="font-mono text-[11px] tracking-widest uppercase text-[#ed3327] block mb-3">
            Client Voices
          </span>
          <h2 className="font-heading text-3xl sm:text-5xl font-medium tracking-tight text-[#080808]">
            Our clients speak for themselves.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {TESTIMONIALS.map((t, idx) => (
            <div
              key={idx}
              className="p-8 sm:p-10 border border-[#c2c2c2] bg-white/70 hover:bg-white transition-colors flex flex-col justify-between"
            >
              <p className="font-heading text-lg sm:text-xl font-normal text-[#080808] leading-relaxed mb-8">
                &ldquo;{t.quote}&rdquo;
              </p>

              <div className="flex items-center gap-4 pt-6 border-t border-[#e5e6e2]">
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="w-12 h-12 rounded-full object-cover grayscale"
                  loading="lazy"
                />
                <div>
                  <h4 className="font-heading text-[16px] font-medium text-[#080808]">
                    {t.name}
                  </h4>
                  <p className="font-mono text-[11px] text-[#666666] uppercase tracking-wider">
                    {t.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
