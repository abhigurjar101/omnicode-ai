"use client";

import React from "react";
import Image from "next/image";

const CLIENTS = [
  { name: "Hylight", logo: "/images/clients/logos/hylight.svg" },
  { name: "Kestrix", logo: "/images/clients/logos/kestrix.svg" },
  { name: "Skipper NDT", logo: "/images/clients/logos/skipper-ndt.svg" },
  { name: "BotBlox", logo: "/images/clients/logos/botblox.svg" },
  { name: "Blink", logo: "/images/clients/logos/blink.svg" },
  { name: "Artefact", logo: "/images/clients/logos/artefact.svg" },
  { name: "Blushmed", logo: "/images/clients/logos/blushmed.svg" },
  { name: "Alt-A", logo: "/images/clients/logos/alt-a.svg" },
  { name: "Une Autre Ile", logo: "/images/clients/logos/une-autre-ile.svg" },
];

export function ClientsMarquee() {
  return (
    <section className="py-24 sm:py-32 paper-texture text-[#080808] border-t border-[#e5e6e2] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-12 mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="max-w-xl">
          <span className="font-mono text-[11px] tracking-widest uppercase text-[#666666] block mb-3">
            Trusted by Innovators
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight leading-[1.08] text-[#080808]">
            Working with founders who take hardware, deep tech and software to the world.
          </h2>
        </div>
        <p className="font-body text-[#666666] text-[16px] max-w-sm leading-relaxed">
          From Y Combinator cohorts to established deep-tech leaders across Europe and the US.
        </p>
      </div>

      {/* Infinite Horizontal Marquee */}
      <div className="w-full relative overflow-hidden py-6 border-y border-[#e5e6e2] bg-[#f7f7f7]/60">
        <div className="animate-marquee flex items-center gap-16 sm:gap-24">
          {[...CLIENTS, ...CLIENTS, ...CLIENTS].map((client, index) => (
            <div
              key={index}
              className="flex-none flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity"
            >
              <img
                src={client.logo}
                alt={client.name}
                className="h-7 sm:h-9 w-auto max-w-[140px] object-contain invert opacity-80 hover:opacity-100 transition-all"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
