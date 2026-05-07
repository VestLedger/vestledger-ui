import {
  DollarSign,
  FileText,
  TrendingUp,
  Users,
  UserCheck,
} from "lucide-react";
import type { ContextualTabConfig } from "./contextual-tabs";

export const LPS_MODULE_TABS: ContextualTabConfig[] = [
  { id: "overview", label: "LP Overview", icon: UserCheck },
  { id: "capital", label: "Capital Activity", icon: DollarSign },
  { id: "performance", label: "Performance", icon: TrendingUp },
  { id: "reports", label: "Reports", icon: FileText },
  { id: "contacts", label: "Contacts", icon: Users },
];

export const DEFAULT_LPS_MODULE_TAB_ID = LPS_MODULE_TABS[0]?.id ?? "overview";

export const LPS_MODULE_TAB_IDS = new Set(LPS_MODULE_TABS.map((tab) => tab.id));
