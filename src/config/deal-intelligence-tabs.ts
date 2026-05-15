import { BarChart3, Brain, Eye, FileCheck, FileText } from "lucide-react";
import type { ContextualTabConfig } from "./contextual-tabs";
import { ROUTE_PATHS } from "./routes";

const DEAL_INTELLIGENCE_DEFAULTS = {
  route: ROUTE_PATHS.dealIntelligence,
  state: "live" as const,
  permission: "screening.opportunity.read" as string | null,
  owner: "deal-intelligence" as const,
};

export const DEAL_INTELLIGENCE_TABS: ContextualTabConfig[] = [
  {
    id: "overview",
    label: "Overview & Status",
    icon: Eye,
    ...DEAL_INTELLIGENCE_DEFAULTS,
  },
  {
    id: "analytics",
    label: "Deal Analytics",
    icon: BarChart3,
    ...DEAL_INTELLIGENCE_DEFAULTS,
  },
  {
    id: "documents",
    label: "DD Documents",
    icon: FileText,
    ...DEAL_INTELLIGENCE_DEFAULTS,
    permission: "documents.read",
  },
  {
    id: "analysis",
    label: "Analysis & Insights",
    icon: Brain,
    ...DEAL_INTELLIGENCE_DEFAULTS,
    // AI-backed; surfaces as ai_generated where present until P3/P5 promote.
    state: "ai_generated",
  },
  {
    id: "ic-materials",
    label: "IC Materials",
    icon: FileCheck,
    ...DEAL_INTELLIGENCE_DEFAULTS,
    permission: "screening.score.read",
  },
];

export const DEFAULT_DEAL_INTELLIGENCE_TAB_ID = "overview";

export const DEAL_INTELLIGENCE_TAB_IDS = new Set(
  DEAL_INTELLIGENCE_TABS.map((tab) => tab.id),
);
