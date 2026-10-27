"use client";

import React from "react";
import { useParams } from "next/navigation";
import { CockpitStudio } from "@/components/workspace/CockpitStudio";

export default function DynamicStudioPage() {
  const params = useParams();
  const workspaceId = (params?.workspaceId as string) || "studio-ws";

  return <CockpitStudio workspaceId={workspaceId} />;
}
