import { Activity, FileText, PieChart, Receipt, User } from "lucide-react";
import type { ContextualTabConfig } from "./contextual-tabs";
import { ROUTE_PATHS } from "./routes";

const LP_PORTAL_DEFAULTS = {
  route: ROUTE_PATHS.lpPortal,
  state: "live" as const,
  permission: null,
  owner: "lp-portal" as const,
};

export const LP_PORTAL_TABS: ContextualTabConfig[] = [
  {
    id: "reports",
    label: "Reports",
    icon: FileText,
    ...LP_PORTAL_DEFAULTS,
  },
  {
    id: "transactions",
    label: "Transactions",
    icon: Activity,
    ...LP_PORTAL_DEFAULTS,
  },
  {
    id: "distributions",
    label: "Distributions",
    icon: Receipt,
    ...LP_PORTAL_DEFAULTS,
  },
  {
    id: "portfolio",
    label: "Portfolio",
    icon: PieChart,
    ...LP_PORTAL_DEFAULTS,
  },
  {
    id: "account",
    label: "Account",
    icon: User,
    ...LP_PORTAL_DEFAULTS,
  },
];

export const DEFAULT_LP_PORTAL_TAB_ID = "distributions";

export const LP_PORTAL_TAB_IDS = new Set(LP_PORTAL_TABS.map((tab) => tab.id));
