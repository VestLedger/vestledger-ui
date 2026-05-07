"use client";

import { WorkflowsModule } from "@/components/workflows-module";
import { useUIKey } from "@/store/ui";
import { useEffect } from "react";

export default function WorkflowsAuditPage() {
  const { patch } = useUIKey("workflows-module", { selectedTab: "audit" });

  useEffect(() => {
    patch({ selectedTab: "audit" });
  }, [patch]);

  return <WorkflowsModule />;
}
