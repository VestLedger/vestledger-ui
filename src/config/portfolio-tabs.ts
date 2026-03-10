import { Bell, FileText, LayoutDashboard } from "lucide-react";
import type { ContextualTabConfig } from "./contextual-tabs";

export const PORTFOLIO_TABS: ContextualTabConfig[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "updates", label: "Updates", icon: Bell },
  { id: "documents", label: "Documents", icon: FileText },
];

export const DEFAULT_PORTFOLIO_TAB_ID = PORTFOLIO_TABS[0]?.id ?? "overview";

export const PORTFOLIO_TAB_IDS = new Set(PORTFOLIO_TABS.map((tab) => tab.id));
