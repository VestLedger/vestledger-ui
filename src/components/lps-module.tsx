"use client";

import { useEffect } from "react";
import { useUIKey } from "@/store/ui";
import {
  DEFAULT_LPS_MODULE_TAB_ID,
  LPS_MODULE_TAB_IDS,
} from "@/config/lps-module-tabs";
import {
  DEFAULT_LP_MANAGEMENT_TAB_ID,
  LP_MANAGEMENT_TAB_IDS,
} from "@/config/lp-management-tabs";
import { LPManagement } from "./lp-portal/lp-management";
import { Contacts } from "./crm/contacts";

export function LPsModule() {
  const { value: ui, patch: patchUI } = useUIKey<{
    selectedTab: string;
    selectedLP: unknown | null;
  }>("lp-management", {
    selectedTab: DEFAULT_LPS_MODULE_TAB_ID,
    selectedLP: null,
  });
  const { selectedTab } = ui;

  useEffect(() => {
    if (
      !LPS_MODULE_TAB_IDS.has(selectedTab) &&
      !LP_MANAGEMENT_TAB_IDS.has(selectedTab)
    ) {
      patchUI({ selectedTab: DEFAULT_LPS_MODULE_TAB_ID });
    }
  }, [selectedTab, patchUI]);

  if (selectedTab === "contacts") {
    return <Contacts />;
  }

  return <LPManagement />;
}
