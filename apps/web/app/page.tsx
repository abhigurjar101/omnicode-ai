"use client";

import React, { useState } from "react";
import { JuncaHeader } from "@/components/navigation/JuncaHeader";
import { JuncaHero } from "@/components/home/JuncaHero";
import { ClientsMarquee } from "@/components/home/ClientsMarquee";
import { StatementSection } from "@/components/home/StatementSection";
import { ServicesSection } from "@/components/home/ServicesSection";
import { ProjectsSection } from "@/components/home/ProjectsSection";
import { ReelSection } from "@/components/home/ReelSection";
import { WhyUsSection } from "@/components/home/WhyUsSection";
import { IndustriesSection } from "@/components/home/IndustriesSection";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { FaqSection } from "@/components/home/FaqSection";
import { JuncaFooter } from "@/components/navigation/JuncaFooter";
import { CockpitStudio } from "@/components/workspace/CockpitStudio";

export default function HomePage() {
  const [currentView, setCurrentView] = useState<"home" | "workspace">("home");

  const toggleWorkspace = () => {
    setCurrentView((prev) => (prev === "home" ? "workspace" : "home"));
  };

  if (currentView === "workspace") {
    return (
      <main className="w-full h-screen bg-black text-white overflow-hidden">
        <CockpitStudio workspaceId="primary" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white selection:bg-[#ed3327] selection:text-white overflow-x-hidden">
      {/* 1. Minimal Header */}
      <JuncaHeader onOpenWorkspace={toggleWorkspace} isWorkspaceOpen={false} />

      {/* 2. Hero Section with Real 3D Robot */}
      <JuncaHero onOpenWorkspace={toggleWorkspace} />

      {/* 3. Clients Infinite Marquee */}
      <ClientsMarquee />

      {/* 4. Editorial Statement */}
      <StatementSection />

      {/* 5. Services & Capabilities */}
      <ServicesSection />

      {/* 6. Selected Case Studies */}
      <ProjectsSection />

      {/* 7. Philosophy & Observation */}
      <ReelSection />

      {/* 8. Studio Methodology (Why Us) */}
      <WhyUsSection />

      {/* 9. Industry Breakdown */}
      <IndustriesSection />

      {/* 10. Client Testimonials */}
      <TestimonialsSection />

      {/* 11. Minimal FAQ */}
      <FaqSection />

      {/* 12. Minimalist Footer */}
      <JuncaFooter onOpenWorkspace={toggleWorkspace} />
    </main>
  );
}
