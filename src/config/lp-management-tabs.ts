import { DollarSign, FileText, TrendingUp, Users } from "lucide-react";
import type { ContextualTabConfig } from "./contextual-tabs";
import { ROUTE_PATHS } from "./routes";

const LP_MANAGEMENT_DEFAULTS = {
  route: ROUTE_PATHS.lpManagement,
  state: "live" as const,
  permission: "lp.read" as string | null,
  owner: "lp-management" as const,
};

export const LP_MANAGEMENT_TABS: ContextualTabConfig[] = [
  {
    id: "overview",
    label: "LP Overview",
    icon: Users,
    ...LP_MANAGEMENT_DEFAULTS,
  },
  {
    id: "reports",
    label: "Reports",
    icon: FileText,
    ...LP_MANAGEMENT_DEFAULTS,
    permission: "reporting.template.read",
  },
  {
    id: "capital",
    label: "Capital Activity",
    icon: DollarSign,
    ...LP_MANAGEMENT_DEFAULTS,
    permission: "capital_calls.read",
  },
  {
    id: "performance",
    label: "Performance",
    icon: TrendingUp,
    ...LP_MANAGEMENT_DEFAULTS,
  },
];

export const DEFAULT_LP_MANAGEMENT_TAB_ID =
  LP_MANAGEMENT_TABS[0]?.id ?? "overview";

export const LP_MANAGEMENT_TAB_IDS = new Set(
  LP_MANAGEMENT_TABS.map((tab) => tab.id),
);
