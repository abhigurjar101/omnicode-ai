"use client";

import React, { useEffect } from "react";
import { CockpitStudio } from "@/components/workspace/CockpitStudio";

export default function WorkspacePage() {
  useEffect(() => {
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    window.scrollTo(0, 0);
    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <main className="w-screen h-screen max-h-screen overflow-hidden bg-[#060709] fixed inset-0 select-none">
      <CockpitStudio workspaceId="primary" />
    </main>
  );
}
