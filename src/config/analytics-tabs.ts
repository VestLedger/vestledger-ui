import {
  Activity,
  AlertTriangle,
  DollarSign,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import type { ContextualTabConfig } from "./contextual-tabs";

export const ANALYTICS_TABS: ContextualTabConfig[] = [
  { id: "performance", label: "Performance", icon: TrendingUp },
  { id: "j-curve", label: "J-Curve", icon: TrendingDown },
  { id: "cohort", label: "Cohort Analysis", icon: Users },
  { id: "valuation", label: "Valuation Trends", icon: DollarSign },
  { id: "deployment", label: "Deployment", icon: Activity },
  { id: "risk", label: "Risk Analysis", icon: AlertTriangle },
];

export const DEFAULT_ANALYTICS_TAB_ID = ANALYTICS_TABS[0]?.id ?? "performance";

export const ANALYTICS_TAB_IDS = new Set(ANALYTICS_TABS.map((tab) => tab.id));
