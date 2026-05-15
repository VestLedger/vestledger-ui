import { BookOpen, FileText, LayoutDashboard, Scale } from "lucide-react";
import type { ContextualTabConfig } from "./contextual-tabs";
import { ROUTE_PATHS } from "./routes";

const COMPLIANCE_DEFAULTS = {
  route: ROUTE_PATHS.compliance,
  state: "live" as const,
  permission: "compliance.read" as string | null,
  owner: "compliance" as const,
};

export const COMPLIANCE_TABS: ContextualTabConfig[] = [
  {
    id: "overview",
    label: "Overview",
    icon: LayoutDashboard,
    ...COMPLIANCE_DEFAULTS,
    permission: null,
  },
  {
    id: "filings",
    label: "Regulatory Filings",
    icon: FileText,
    ...COMPLIANCE_DEFAULTS,
  },
  {
    id: "audits",
    label: "Audit Schedule",
    icon: Scale,
    ...COMPLIANCE_DEFAULTS,
  },
  {
    id: "resources",
    label: "Resources",
    icon: BookOpen,
    ...COMPLIANCE_DEFAULTS,
    permission: null,
  },
];

export const DEFAULT_COMPLIANCE_TAB_ID = COMPLIANCE_TABS[0]?.id ?? "overview";

export const COMPLIANCE_TAB_IDS = new Set(COMPLIANCE_TABS.map((tab) => tab.id));
