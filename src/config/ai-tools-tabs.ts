import { FileDown, FileText, MessageSquare } from "lucide-react";
import type { ContextualTabConfig } from "./contextual-tabs";
import { ROUTE_PATHS } from "./routes";

const AI_TOOLS_DEFAULTS = {
  route: ROUTE_PATHS.aiTools,
  // AI tools surfaced as `unavailable` in the registry per P1-004
  // (degraded live contract) — UI consumers can use this to render the
  // P2-005 UnavailableState rather than implying production readiness.
  state: "unavailable" as const,
  permission: "ai.feature.read" as string | null,
  owner: "ai-tools" as const,
};

export const AI_TOOLS_TABS: ContextualTabConfig[] = [
  {
    id: "decision-writer",
    label: "AI Decision Writer",
    icon: FileText,
    ...AI_TOOLS_DEFAULTS,
  },
  {
    id: "pitch-deck-reader",
    label: "AI Pitch Deck Reader",
    icon: FileDown,
    ...AI_TOOLS_DEFAULTS,
  },
  {
    id: "dd-assistant",
    label: "AI Due Diligence Assistant",
    icon: MessageSquare,
    ...AI_TOOLS_DEFAULTS,
  },
];

export const DEFAULT_AI_TOOLS_TAB_ID =
  AI_TOOLS_TABS[0]?.id ?? "decision-writer";

export const AI_TOOLS_TAB_IDS = new Set(AI_TOOLS_TABS.map((tab) => tab.id));
