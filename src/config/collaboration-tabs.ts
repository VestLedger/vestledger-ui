import { CheckCircle2, MessageSquare } from "lucide-react";
import type { ContextualTabConfig } from "./contextual-tabs";

export const COLLABORATION_TABS: ContextualTabConfig[] = [
  { id: "threads", label: "Threads", icon: MessageSquare },
  { id: "tasks", label: "Tasks", icon: CheckCircle2 },
];

export const DEFAULT_COLLABORATION_TAB_ID = "threads";

export const COLLABORATION_TAB_IDS = new Set(
  COLLABORATION_TABS.map((tab) => tab.id),
);
