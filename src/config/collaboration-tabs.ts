import { CheckCircle2, MessageSquare } from "lucide-react";
import type { ContextualTabConfig } from "./contextual-tabs";
import { ROUTE_PATHS } from "./routes";

const COLLABORATION_DEFAULTS = {
  route: ROUTE_PATHS.collaboration,
  state: "live" as const,
  permission: null,
  owner: "collaboration" as const,
};

export const COLLABORATION_TABS: ContextualTabConfig[] = [
  {
    id: "threads",
    label: "Threads",
    icon: MessageSquare,
    ...COLLABORATION_DEFAULTS,
  },
  {
    id: "tasks",
    label: "Tasks",
    icon: CheckCircle2,
    ...COLLABORATION_DEFAULTS,
  },
];

export const DEFAULT_COLLABORATION_TAB_ID = "threads";

export const COLLABORATION_TAB_IDS = new Set(
  COLLABORATION_TABS.map((tab) => tab.id),
);
