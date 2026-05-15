import { Bell, FileText, LayoutDashboard } from "lucide-react";
import type { ContextualTabConfig } from "./contextual-tabs";
import { ROUTE_PATHS } from "./routes";

export const PORTFOLIO_TABS: ContextualTabConfig[] = [
  {
    id: "overview",
    label: "Overview",
    icon: LayoutDashboard,
    route: ROUTE_PATHS.portfolio,
    state: "live",
    permission: null,
    owner: "portfolio",
  },
  {
    id: "updates",
    label: "Updates",
    icon: Bell,
    route: ROUTE_PATHS.portfolio,
    state: "live",
    permission: null,
    owner: "portfolio",
  },
  {
    id: "documents",
    label: "Documents",
    icon: FileText,
    route: ROUTE_PATHS.portfolio,
    state: "live",
    permission: "documents.read",
    owner: "portfolio",
  },
];

export const DEFAULT_PORTFOLIO_TAB_ID = PORTFOLIO_TABS[0]?.id ?? "overview";

export const PORTFOLIO_TAB_IDS = new Set(PORTFOLIO_TABS.map((tab) => tab.id));
