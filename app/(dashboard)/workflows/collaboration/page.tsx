"use client";

import { WorkflowsModule } from "@/components/workflows-module";
import { useUIKey } from "@/store/ui";
import { useEffect } from "react";

export default function WorkflowsCollaborationPage() {
  const { patch } = useUIKey("workflows-module", {
    selectedTab: "collaboration",
  });

  useEffect(() => {
    patch({ selectedTab: "collaboration" });
  }, [patch]);

  return <WorkflowsModule />;
}
