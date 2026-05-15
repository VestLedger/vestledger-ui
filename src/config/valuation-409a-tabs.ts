import { Clock, Calculator, DollarSign } from "lucide-react";
import type { ContextualTabConfig } from "./contextual-tabs";
import { ROUTE_PATHS } from "./routes";

const VALUATION_409A_DEFAULTS = {
  route: ROUTE_PATHS.valuations409a,
  state: "live" as const,
  permission: "valuations.read" as string | null,
  owner: "valuation-409a" as const,
};

export const VALUATION_409A_TABS: ContextualTabConfig[] = [
  {
    id: "valuations",
    label: "Valuations",
    icon: Calculator,
    ...VALUATION_409A_DEFAULTS,
  },
  {
    id: "strike-prices",
    label: "Strike Prices",
    icon: DollarSign,
    ...VALUATION_409A_DEFAULTS,
  },
  {
    id: "history",
    label: "Valuation History",
    icon: Clock,
    ...VALUATION_409A_DEFAULTS,
  },
];

export const DEFAULT_VALUATION_409A_TAB_ID =
  VALUATION_409A_TABS[0]?.id ?? "valuations";

export const VALUATION_409A_TAB_IDS = new Set(
  VALUATION_409A_TABS.map((tab) => tab.id),
);
