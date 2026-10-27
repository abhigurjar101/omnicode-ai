"use client";

import React from "react";
import { CockpitStudio } from "@/components/workspace/CockpitStudio";

export default function NewWorkspacePage() {
  return <CockpitStudio workspaceId="new-project" isNew={true} />;
}
