"use client";

import { useEffect } from "react";
import { ListChecks } from "lucide-react";
import { useUIKey } from "@/store/ui";
import { getRouteConfig, ROUTE_PATHS } from "@/config/routes";
import { PageScaffold } from "@/ui/composites";
import {
  DEFAULT_WORKFLOWS_MODULE_TAB_ID,
  WORKFLOWS_MODULE_TAB_IDS,
} from "@/config/workflows-module-tabs";

import { FundAdmin } from "./back-office/fund-admin";
import { TaxCenter } from "./back-office/tax-center";
import { Compliance } from "./back-office/compliance";
import { BlockchainAuditTrail } from "./blockchain/audit-trail";
import { CollaborationWorkspace } from "./collaboration";

type WorkflowsModuleUIState = {
  selectedTab: string;
};

export function WorkflowsModule() {
  const { value: ui, patch: patchUI } = useUIKey<WorkflowsModuleUIState>(
    "workflows-module",
    { selectedTab: DEFAULT_WORKFLOWS_MODULE_TAB_ID },
  );
  const { selectedTab } = ui;

  useEffect(() => {
    if (!WORKFLOWS_MODULE_TAB_IDS.has(selectedTab)) {
      patchUI({ selectedTab: DEFAULT_WORKFLOWS_MODULE_TAB_ID });
    }
  }, [selectedTab, patchUI]);

  const routeConfig = getRouteConfig(ROUTE_PATHS.workflows);

  return (
    <PageScaffold
      breadcrumbs={routeConfig?.breadcrumbs}
      aiSuggestion={routeConfig?.aiSuggestion}
      containerProps={{ className: "space-y-4" }}
      header={{
        title: "Workflows",
        description:
          "Operational queues: capital calls, distributions, compliance, audit, and tax workflows.",
        icon: ListChecks,
      }}
    >
      {selectedTab === "fund-ops" && <FundAdmin />}
      {selectedTab === "tax" && <TaxCenter />}
      {selectedTab === "compliance" && <Compliance />}
      {selectedTab === "audit" && <BlockchainAuditTrail />}
      {selectedTab === "collaboration" && <CollaborationWorkspace />}
    </PageScaffold>
  );
}
