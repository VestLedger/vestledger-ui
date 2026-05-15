import {
  Activity,
  AlertTriangle,
  DollarSign,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import type { ContextualTabConfig } from "./contextual-tabs";
import { ROUTE_PATHS } from "./routes";

const ANALYTICS_DEFAULTS = {
  route: ROUTE_PATHS.analytics,
  state: "live" as const,
  permission: null,
  owner: "analytics" as const,
};

export const ANALYTICS_TABS: ContextualTabConfig[] = [
  {
    id: "performance",
    label: "Performance",
    icon: TrendingUp,
    ...ANALYTICS_DEFAULTS,
  },
  {
    id: "j-curve",
    label: "J-Curve",
    icon: TrendingDown,
    ...ANALYTICS_DEFAULTS,
  },
  {
    id: "cohort",
    label: "Cohort Analysis",
    icon: Users,
    ...ANALYTICS_DEFAULTS,
  },
  {
    id: "valuation",
    label: "Valuation Trends",
    icon: DollarSign,
    ...ANALYTICS_DEFAULTS,
  },
  {
    id: "deployment",
    label: "Deployment",
    icon: Activity,
    ...ANALYTICS_DEFAULTS,
  },
  {
    id: "risk",
    label: "Risk Analysis",
    icon: AlertTriangle,
    ...ANALYTICS_DEFAULTS,
  },
];

export const DEFAULT_ANALYTICS_TAB_ID = ANALYTICS_TABS[0]?.id ?? "performance";

export const ANALYTICS_TAB_IDS = new Set(ANALYTICS_TABS.map((tab) => tab.id));
