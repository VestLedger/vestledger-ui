"use client";

import { WorkflowsModule } from "@/components/workflows-module";
import { useUIKey } from "@/store/ui";
import { useEffect } from "react";

export default function WorkflowsCompliancePage() {
  const { patch } = useUIKey("workflows-module", { selectedTab: "compliance" });

  useEffect(() => {
    patch({ selectedTab: "compliance" });
  }, [patch]);

  return <WorkflowsModule />;
}
