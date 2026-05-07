"use client";

import { WorkflowsModule } from "@/components/workflows-module";
import { useUIKey } from "@/store/ui";
import { useEffect } from "react";

export default function WorkflowsFundOpsPage() {
  const { patch } = useUIKey("workflows-module", { selectedTab: "fund-ops" });

  useEffect(() => {
    patch({ selectedTab: "fund-ops" });
  }, [patch]);

  return <WorkflowsModule />;
}
