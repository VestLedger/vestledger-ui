import {
  DollarSign,
  Receipt,
  Shield,
  Database,
  MessageSquare,
} from "lucide-react";
import type { ContextualTabConfig } from "./contextual-tabs";

export const WORKFLOWS_MODULE_TABS: ContextualTabConfig[] = [
  { id: "fund-ops", label: "Fund Operations", icon: DollarSign },
  { id: "tax", label: "Tax & Reporting", icon: Receipt },
  { id: "compliance", label: "Compliance", icon: Shield },
  { id: "audit", label: "Audit Trail", icon: Database },
  { id: "collaboration", label: "Collaboration", icon: MessageSquare },
];

export const DEFAULT_WORKFLOWS_MODULE_TAB_ID =
  WORKFLOWS_MODULE_TABS[0]?.id ?? "fund-ops";

export const WORKFLOWS_MODULE_TAB_IDS = new Set(
  WORKFLOWS_MODULE_TABS.map((tab) => tab.id),
);
