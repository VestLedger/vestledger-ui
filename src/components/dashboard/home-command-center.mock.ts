import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  BarChart3,
  CalendarClock,
  ClipboardList,
  FileSearch,
  FileSignature,
  FileText,
  Landmark,
  Mail,
  PenSquare,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { ROUTE_PATHS } from "@/config/routes";

// ─────────────────────────────────────────────────────────────────────────────
// Mock data for the GP Home Command Center.
//
// Values mirror the approved design reference screenshots. This is intentionally
// static mock content — the component reads from here instead of the live
// dashboard data service. Swap these exports for a data hook when wiring real data.
// See docs/superpowers/specs/2026-06-05-home-command-center-redesign-design.md
// ─────────────────────────────────────────────────────────────────────────────

export type HomeTone = "violet" | "cyan" | "orange" | "green" | "blue";

export type MockRailItem = {
  title: string;
  description: string;
  icon: LucideIcon;
  tone: HomeTone;
  route: string;
};

export type MockPriorityAction = {
  id: string;
  title: string;
  description: string;
  priority: string;
  duration: string;
  due: string;
  badge: string;
  action: string;
  icon: LucideIcon;
  tone: HomeTone;
  route: string;
};

export type MockDeckItem = {
  id: string;
  title: string;
  icon: LucideIcon;
  tone: HomeTone;
  route: string;
  /** Optional priority pill rendered inline after the title (e.g. "High Priority"). */
  badge?: string;
  badgeTone?: HomeTone;
  /** Right-aligned status text. */
  status?: string;
  statusTone?: HomeTone | "muted";
};

export type MockPipelineItem = {
  company: string;
  round: string;
  amount: string;
  tone: HomeTone;
  route: string;
};

export type MockMetric = { value: string; label: string };

export type MockQueueScenario = {
  priorityActions: MockPriorityAction[];
  deckItems: MockDeckItem[];
};

export const HOME_QUEUE_SIZES = [1, 3, 7] as const;
export type HomeQueueSize = (typeof HOME_QUEUE_SIZES)[number];
export const DEFAULT_HOME_QUEUE_SIZE: HomeQueueSize = 3;

// ── Left rail ────────────────────────────────────────────────────────────────

export const smartActions: MockRailItem[] = [
  {
    title: "IC Meeting",
    description: "Deck, memo, and talking points",
    icon: Users,
    tone: "blue",
    route: ROUTE_PATHS.analytics,
  },
  {
    title: "Portfolio Performance",
    description: "KPIs and attribution summary",
    icon: BarChart3,
    tone: "blue",
    route: ROUTE_PATHS.analytics,
  },
  {
    title: "LP Updates",
    description: "Draft, review, and send updates",
    icon: Mail,
    tone: "blue",
    route: ROUTE_PATHS.lpManagement,
  },
  {
    title: "Research Briefing",
    description: "Market and sector intelligence",
    icon: FileText,
    tone: "blue",
    route: ROUTE_PATHS.reports,
  },
];

export const vestaSuggestions: MockRailItem[] = [
  {
    title: "LP update draft ready for review",
    description: "22 results overview",
    icon: Sparkles,
    tone: "violet",
    route: ROUTE_PATHS.lpManagement,
  },
  {
    title: "3 investments approaching key milestones",
    description: "Review timeline and risks",
    icon: Users,
    tone: "violet",
    route: ROUTE_PATHS.portfolio,
  },
];

export const vestaPrompts: string[] = [
  "How is Fund I performing?",
  "Summarize recent updates",
  "What needs my attention?",
];

// ── Right rail ───────────────────────────────────────────────────────────────

export const fundHealth = {
  metrics: [
    { value: "1.8x", label: "Net TVPI" },
    { value: "21%", label: "IRR" },
    { value: "58%", label: "DPI" },
  ] as MockMetric[],
  note: "Performance remains strong across vintage and strategy.",
};

export const pipeline: MockPipelineItem[] = [
  {
    company: "Helios Robotics",
    round: "Series B",
    amount: "$45M",
    tone: "green",
    route: ROUTE_PATHS.pipeline,
  },
  {
    company: "Arcadia Health",
    round: "Series A",
    amount: "$28M",
    tone: "violet",
    route: ROUTE_PATHS.pipeline,
  },
  {
    company: "Nexora AI",
    round: "Seed II",
    amount: "$12M",
    tone: "blue",
    route: ROUTE_PATHS.pipeline,
  },
];

export const portfolioIntel: MockMetric[] = [
  { value: "47", label: "Companies" },
  { value: "12", label: "Watchlist" },
  { value: "5", label: "Risks" },
];

// ── Center action queue (one scenario per load state) ────────────────────────

const reviewFundingUpdates = (updates: number): MockPriorityAction => ({
  id: "review-funding-updates",
  title: "Review 3 funding updates",
  description:
    "Apex Bio, Luma AI, and FleetOps submitted updates requiring your review.",
  priority: "High Priority",
  duration: "15 min",
  due: "Due today",
  badge: `${updates} update${updates === 1 ? "" : "s"}`,
  action: "Review now",
  icon: FileText,
  tone: "violet",
  route: ROUTE_PATHS.portfolio,
});

const approveCapitalCalls: MockPriorityAction = {
  id: "approve-capital-calls",
  title: "Approve 2 capital calls",
  description: "Summit Series B and Nexora Seed II are awaiting your approval.",
  priority: "High Priority",
  duration: "10 min",
  due: "Due tomorrow",
  badge: "$4.2M",
  action: "Review & approve",
  icon: Landmark,
  tone: "green",
  route: ROUTE_PATHS.fundAdmin,
};

const monitorPortfolioRisk = (priority: string): MockPriorityAction => ({
  id: "monitor-portfolio-risk",
  title: "Monitor 1 portfolio risk",
  description: "Vector Metrics flagged for potential revenue shortfall in Q3.",
  priority,
  duration: "20 min",
  due: "Due this week",
  badge: "At risk",
  action: "View details",
  icon: AlertTriangle,
  tone: "orange",
  route: ROUTE_PATHS.portfolio,
});

// Extra priority items that only contribute to the count + "view remaining"
// expander in the heavy-load scenario. They are never rendered as cards.
const overflowPriorityActions: MockPriorityAction[] = [
  {
    id: "vertex-safe-amendment",
    title: "Sign Vertex SAFE amendment",
    description: "Counsel-reviewed amendment awaiting signature.",
    priority: "High Priority",
    duration: "5 min",
    due: "Due this week",
    badge: "1 doc",
    action: "Review now",
    icon: FileSignature,
    tone: "violet",
    route: ROUTE_PATHS.fundAdmin,
  },
  {
    id: "q3-reforecast",
    title: "Review Q3 reforecast assumptions",
    description: "Updated model assumptions ready for sign-off.",
    priority: "Medium Priority",
    duration: "25 min",
    due: "Due this week",
    badge: "Updated",
    action: "Review now",
    icon: BarChart3,
    tone: "cyan",
    route: ROUTE_PATHS.analytics,
  },
  {
    id: "helios-board-seat",
    title: "Confirm Helios board seat terms",
    description: "Board observer rights pending confirmation.",
    priority: "Medium Priority",
    duration: "15 min",
    due: "Due next week",
    badge: "Pending",
    action: "Review now",
    icon: ShieldCheck,
    tone: "blue",
    route: ROUTE_PATHS.portfolio,
  },
  {
    id: "lp-side-letter",
    title: "Approve updated LP side letter",
    description: "Revised side letter awaiting GP approval.",
    priority: "Medium Priority",
    duration: "10 min",
    due: "Due next week",
    badge: "1 doc",
    action: "Review now",
    icon: FileSignature,
    tone: "violet",
    route: ROUTE_PATHS.lpManagement,
  },
];

export const queueScenarios: Record<HomeQueueSize, MockQueueScenario> = {
  1: {
    priorityActions: [reviewFundingUpdates(1)],
    deckItems: [
      {
        id: "approve-capital-calls",
        title: "Approve 2 capital calls",
        icon: Landmark,
        tone: "green",
        route: ROUTE_PATHS.fundAdmin,
        badge: "High Priority",
        badgeTone: "cyan",
        status: "$4.2M",
        statusTone: "green",
      },
      {
        id: "monitor-portfolio-risk",
        title: "Monitor 1 portfolio risk",
        icon: AlertTriangle,
        tone: "orange",
        route: ROUTE_PATHS.portfolio,
        badge: "Medium Priority",
        badgeTone: "orange",
        status: "At risk",
        statusTone: "orange",
      },
      {
        id: "lp-update-draft",
        title: "LP update draft ready for review",
        icon: FileText,
        tone: "cyan",
        route: ROUTE_PATHS.lpManagement,
      },
      {
        id: "investments-milestones",
        title: "3 investments approaching key milestones",
        icon: Users,
        tone: "violet",
        route: ROUTE_PATHS.portfolio,
      },
    ],
  },
  3: {
    priorityActions: [
      reviewFundingUpdates(3),
      approveCapitalCalls,
      monitorPortfolioRisk("Medium Priority"),
    ],
    deckItems: [
      {
        id: "lp-q2-newsletter",
        title: "LP Update: Q2 newsletter draft",
        icon: Mail,
        tone: "cyan",
        route: ROUTE_PATHS.lpManagement,
        status: "Draft in progress",
        statusTone: "muted",
      },
      {
        id: "research-ai-infra",
        title: "Research: AI infrastructure market scan",
        icon: FileSearch,
        tone: "blue",
        route: ROUTE_PATHS.reports,
        status: "New data available",
        statusTone: "muted",
      },
      {
        id: "memo-helios",
        title: "Portfolio memo: Helios Robotics check-in",
        icon: FileText,
        tone: "violet",
        route: ROUTE_PATHS.portfolio,
        status: "Last updated 3 days ago",
        statusTone: "muted",
      },
      {
        id: "compliance-quarterly",
        title: "Compliance: Quarterly document review",
        icon: ShieldCheck,
        tone: "orange",
        route: ROUTE_PATHS.compliance,
        status: "Due in 5 days",
        statusTone: "muted",
      },
    ],
  },
  7: {
    priorityActions: [
      reviewFundingUpdates(3),
      approveCapitalCalls,
      monitorPortfolioRisk("High Priority"),
      ...overflowPriorityActions,
    ],
    deckItems: [
      {
        id: "quarterly-deck",
        title: "Update quarterly performance deck",
        icon: BarChart3,
        tone: "blue",
        route: ROUTE_PATHS.analytics,
      },
      {
        id: "ic-memo-helios",
        title: "Prep IC memo: Helios Robotics follow-on",
        icon: ClipboardList,
        tone: "violet",
        route: ROUTE_PATHS.analytics,
      },
      {
        id: "lp-call-arcadia",
        title: "Schedule LP call: Arcadia Health update",
        icon: CalendarClock,
        tone: "cyan",
        route: ROUTE_PATHS.lpManagement,
      },
      {
        id: "nexora-term-sheet",
        title: "Review Nexora AI Seed II term sheet",
        icon: PenSquare,
        tone: "green",
        route: ROUTE_PATHS.pipeline,
      },
    ],
  },
};

export function resolveQueueSize(
  raw: string | null | undefined,
): HomeQueueSize {
  const parsed = Number(raw);
  return (HOME_QUEUE_SIZES as readonly number[]).includes(parsed)
    ? (parsed as HomeQueueSize)
    : DEFAULT_HOME_QUEUE_SIZE;
}
