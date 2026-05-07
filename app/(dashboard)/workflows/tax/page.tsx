"use client";

import { WorkflowsModule } from "@/components/workflows-module";
import { useUIKey } from "@/store/ui";
import { useEffect } from "react";

export default function WorkflowsTaxPage() {
  const { patch } = useUIKey("workflows-module", { selectedTab: "tax" });

  useEffect(() => {
    patch({ selectedTab: "tax" });
  }, [patch]);

  return <WorkflowsModule />;
}
