import { DollarSign, FileText, TrendingUp, Users } from "lucide-react";
import type { ContextualTabConfig } from "./contextual-tabs";

export const LP_MANAGEMENT_TABS: ContextualTabConfig[] = [
  { id: "overview", label: "LP Overview", icon: Users },
  { id: "reports", label: "Reports", icon: FileText },
  { id: "capital", label: "Capital Activity", icon: DollarSign },
  { id: "performance", label: "Performance", icon: TrendingUp },
];

export const DEFAULT_LP_MANAGEMENT_TAB_ID =
  LP_MANAGEMENT_TABS[0]?.id ?? "overview";

export const LP_MANAGEMENT_TAB_IDS = new Set(
  LP_MANAGEMENT_TABS.map((tab) => tab.id),
);
