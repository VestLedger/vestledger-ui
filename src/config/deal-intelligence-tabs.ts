import { BarChart3, Brain, Eye, FileCheck, FileText } from "lucide-react";
import type { ContextualTabConfig } from "./contextual-tabs";

export const DEAL_INTELLIGENCE_TABS: ContextualTabConfig[] = [
  { id: "overview", label: "Overview & Status", icon: Eye },
  { id: "analytics", label: "Deal Analytics", icon: BarChart3 },
  { id: "documents", label: "DD Documents", icon: FileText },
  { id: "analysis", label: "Analysis & Insights", icon: Brain },
  { id: "ic-materials", label: "IC Materials", icon: FileCheck },
];

export const DEFAULT_DEAL_INTELLIGENCE_TAB_ID = "overview";

export const DEAL_INTELLIGENCE_TAB_IDS = new Set(
  DEAL_INTELLIGENCE_TABS.map((tab) => tab.id),
);
