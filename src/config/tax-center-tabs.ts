import { BarChart3, Briefcase, FileDown, FileText, Mail } from "lucide-react";
import type { ContextualTabConfig } from "./contextual-tabs";
import { ROUTE_PATHS } from "./routes";

const TAX_CENTER_DEFAULTS = {
  route: ROUTE_PATHS.taxCenter,
  state: "live" as const,
  permission: "tax.read" as string | null,
  owner: "tax-center" as const,
};

export const TAX_CENTER_TABS: ContextualTabConfig[] = [
  {
    id: "overview",
    label: "Tax Documents",
    icon: FileText,
    ...TAX_CENTER_DEFAULTS,
  },
  {
    id: "k1-generator",
    label: "K-1 Generator",
    icon: FileDown,
    ...TAX_CENTER_DEFAULTS,
    permission: "tax.k1.generate",
  },
  {
    id: "fund-summary",
    label: "Fund Summary",
    icon: BarChart3,
    ...TAX_CENTER_DEFAULTS,
  },
  {
    id: "portfolio",
    label: "Portfolio Companies",
    icon: Briefcase,
    ...TAX_CENTER_DEFAULTS,
  },
  {
    id: "communications",
    label: "LP Communications",
    icon: Mail,
    ...TAX_CENTER_DEFAULTS,
    permission: "lp.distribution.notice.send",
  },
];

export const DEFAULT_TAX_CENTER_TAB_ID = TAX_CENTER_TABS[0]?.id ?? "overview";

export const TAX_CENTER_TAB_IDS = new Set(TAX_CENTER_TABS.map((tab) => tab.id));
