import { Clock, Calculator, DollarSign } from "lucide-react";
import type { ContextualTabConfig } from "./contextual-tabs";

export const VALUATION_409A_TABS: ContextualTabConfig[] = [
  { id: "valuations", label: "Valuations", icon: Calculator },
  { id: "strike-prices", label: "Strike Prices", icon: DollarSign },
  { id: "history", label: "Valuation History", icon: Clock },
];

export const DEFAULT_VALUATION_409A_TAB_ID =
  VALUATION_409A_TABS[0]?.id ?? "valuations";

export const VALUATION_409A_TAB_IDS = new Set(
  VALUATION_409A_TABS.map((tab) => tab.id),
);
