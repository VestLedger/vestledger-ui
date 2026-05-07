import {
  BarChart3,
  Briefcase,
  TrendingDown,
  TrendingUp,
  Calculator,
} from "lucide-react";
import type { ContextualTabConfig } from "./contextual-tabs";

export const FUNDS_MODULE_TABS: ContextualTabConfig[] = [
  { id: "analytics", label: "Analytics", icon: TrendingUp },
  { id: "waterfall", label: "Waterfall", icon: TrendingDown },
  { id: "fund-setup", label: "Fund Setup", icon: Briefcase },
  { id: "nav-calculator", label: "NAV Calculator", icon: BarChart3 },
  { id: "carried-interest", label: "Carried Interest", icon: Calculator },
];

export const DEFAULT_FUNDS_MODULE_TAB_ID =
  FUNDS_MODULE_TABS[0]?.id ?? "analytics";

export const FUNDS_MODULE_TAB_IDS = new Set(
  FUNDS_MODULE_TABS.map((tab) => tab.id),
);
