import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  GitBranch,
  Briefcase,
  Search,
  Vote,
  TrendingUp,
  TrendingDown,
  Users,
  UserCheck,
  DollarSign,
  Shield,
  Scale,
  FileDown,
  Sparkles,
  Database,
  FileText,
  Plug,
  Settings,
  Receipt,
  Bell,
  CalendarDays,
  MessageSquare,
  Activity,
  Building2,
  ListChecks,
} from "lucide-react";
import type { BreadcrumbItem, AISuggestion } from "@/ui";

export interface RouteConfig {
  path: string;
  label: string;
  icon: LucideIcon;
  breadcrumbs: BreadcrumbItem[];
  aiSuggestion?: AISuggestion;
  description?: string;
}

export const routes: Record<string, RouteConfig> = {
  superadmin: {
    path: "/superadmin",
    label: "Superadmin Cockpit",
    icon: Shield,
    breadcrumbs: [
      { label: "Admin", href: "/superadmin" },
      { label: "Superadmin Cockpit" },
    ],
    description: "Internal VestLedger tenant and onboarding operations",
  },

  dashboard: {
    path: "/home",
    label: "Dashboard",
    icon: LayoutDashboard,
    breadcrumbs: [{ label: "Dashboard" }],
    aiSuggestion: {
      label: "Deals",
      href: "/deals",
      reasoning:
        "Start your day by reviewing active deals. Most users navigate here first.",
    },
    description: "AI-powered fund operations overview",
  },

  // Phase 2: Deals becomes a unified workbench. The `/deals` index renders
  // Pipeline by default; sub-routes own each workflow phase.
  deals: {
    path: "/deals",
    label: "Deals",
    icon: GitBranch,
    breadcrumbs: [{ label: "Dashboard", href: "/home" }, { label: "Deals" }],
    aiSuggestion: {
      label: "Dashboard",
      href: "/home",
      reasoning:
        "Return to the dashboard to see how deal activity affects the daily brief.",
    },
    description: "Deal intake, intelligence, and decisioning",
  },

  dealsPipeline: {
    path: "/deals/pipeline",
    label: "Pipeline",
    icon: GitBranch,
    breadcrumbs: [
      { label: "Dashboard", href: "/home" },
      { label: "Deals", href: "/deals" },
      { label: "Pipeline" },
    ],
    aiSuggestion: {
      label: "Deal Intelligence",
      href: "/deals/intelligence",
      reasoning:
        "Review AI-extracted insights after triaging the pipeline board.",
    },
    description: "Active deal pipeline and sourcing",
  },

  dealsIntelligence: {
    path: "/deals/intelligence",
    label: "Deal Intelligence",
    icon: Search,
    breadcrumbs: [
      { label: "Dashboard", href: "/home" },
      { label: "Deals", href: "/deals" },
      { label: "Deal Intelligence" },
    ],
    aiSuggestion: {
      label: "Pipeline",
      href: "/deals/pipeline",
      reasoning:
        "Reprioritize the pipeline based on the latest intelligence signals.",
    },
    description: "AI-powered deal sourcing, deck reading, and DD",
  },

  dealsReview: {
    path: "/deals/review",
    label: "Dealflow Review",
    icon: Vote,
    breadcrumbs: [
      { label: "Dashboard", href: "/home" },
      { label: "Deals", href: "/deals" },
      { label: "Dealflow Review" },
    ],
    aiSuggestion: {
      label: "Deal Intelligence",
      href: "/deals/intelligence",
      reasoning:
        "Surface diligence evidence before final decisions in IC review.",
    },
    description: "Team consensus, voting, and IC review",
  },

  dealsAITools: {
    path: "/deals/ai-tools",
    label: "AI Tools",
    icon: Sparkles,
    breadcrumbs: [
      { label: "Dashboard", href: "/home" },
      { label: "Deals", href: "/deals" },
      { label: "AI Tools" },
    ],
    aiSuggestion: {
      label: "Pipeline",
      href: "/deals/pipeline",
      reasoning:
        "Apply AI tooling outputs back to active deals in the pipeline.",
    },
    description:
      "AI Decision Writer, Pitch Deck Reader, and DD Assistant inside the Deals workflow",
  },

  pipeline: {
    path: "/pipeline",
    label: "Pipeline",
    icon: GitBranch,
    breadcrumbs: [
      { label: "Dashboard", href: "/home" },
      { label: "Deals", href: "/deals" },
      { label: "Pipeline" },
    ],
    aiSuggestion: {
      label: "Deal Intelligence",
      href: "/deal-intelligence",
      reasoning:
        "You typically review deal intelligence after viewing pipeline. AI detected this pattern from your navigation history.",
    },
    description: "Active deal pipeline and sourcing (legacy route)",
  },

  portfolio: {
    path: "/portfolio",
    label: "Portfolio",
    icon: Briefcase,
    breadcrumbs: [
      { label: "Dashboard", href: "/home" },
      { label: "Portfolio" },
    ],
    aiSuggestion: {
      label: "Funds",
      href: "/funds",
      reasoning:
        "After portfolio review, drill into fund-level performance for deeper insights.",
    },
    description: "Portfolio company health and metrics",
  },

  // Phase 2: 409A valuations rehome to /portfolio/valuations.
  portfolioValuations: {
    path: "/portfolio/valuations",
    label: "Valuations",
    icon: Receipt,
    breadcrumbs: [
      { label: "Dashboard", href: "/home" },
      { label: "Portfolio", href: "/portfolio" },
      { label: "Valuations" },
    ],
    aiSuggestion: {
      label: "Tax & Reporting",
      href: "/tax-center",
      reasoning:
        "409A valuations often impact tax calculations. Review tax implications after valuation updates.",
    },
    description: "Fair market value (409A) assessments under Portfolio",
  },

  // Phase 2: Portfolio-level analytics tabs (Valuation Trends, Cohorts, Risk,
  // Portfolio Performance) live here. Fund-level cuts (J-Curve, Deployment)
  // remain under /funds/analytics — splitting tab-by-tab is interior follow-up.
  portfolioAnalytics: {
    path: "/portfolio/analytics",
    label: "Portfolio Analytics",
    icon: TrendingUp,
    breadcrumbs: [
      { label: "Dashboard", href: "/home" },
      { label: "Portfolio", href: "/portfolio" },
      { label: "Analytics" },
    ],
    aiSuggestion: {
      label: "Portfolio",
      href: "/portfolio",
      reasoning:
        "Return to portfolio overview to track companies flagged in analytics.",
    },
    description: "Company-level analytics: valuation trends, cohorts, risk",
  },

  dealIntelligence: {
    path: "/deal-intelligence",
    label: "Deal Intelligence",
    icon: Search,
    breadcrumbs: [
      { label: "Dashboard", href: "/home" },
      { label: "Deals", href: "/deals" },
      { label: "Deal Intelligence" },
    ],
    aiSuggestion: {
      label: "Pipeline",
      href: "/pipeline",
      reasoning:
        "AI suggests viewing pipeline to assess deal prioritization based on intelligence insights.",
    },
    description: "AI-powered deal sourcing and analysis (legacy route)",
  },

  dealflowReview: {
    path: "/dealflow-review",
    label: "Dealflow Review",
    icon: Vote,
    breadcrumbs: [
      { label: "Dashboard", href: "/home" },
      { label: "Deals", href: "/deals" },
      { label: "Dealflow Review" },
    ],
    aiSuggestion: {
      label: "Deal Intelligence",
      href: "/deal-intelligence",
      reasoning:
        "After team voting, check deal intelligence for additional insights before final decisions.",
    },
    description: "Team consensus and voting on deals (legacy route)",
  },

  // New canonical top-level Funds route (Phase 1 nav anchor; Phase 3 redesigns interior).
  funds: {
    path: "/funds",
    label: "Funds",
    icon: Building2,
    breadcrumbs: [{ label: "Dashboard", href: "/home" }, { label: "Funds" }],
    aiSuggestion: {
      label: "LPs",
      href: "/lps",
      reasoning:
        "Fund performance often informs LP communication. Move to LPs after reviewing fund metrics.",
    },
    description: "Fund-level performance and economics",
  },

  analytics: {
    path: "/analytics",
    label: "Analytics",
    icon: TrendingUp,
    breadcrumbs: [
      { label: "Dashboard", href: "/home" },
      { label: "Funds", href: "/funds" },
      { label: "Analytics" },
    ],
    aiSuggestion: {
      label: "Portfolio",
      href: "/portfolio",
      reasoning:
        "Return to portfolio overview to track companies flagged in analytics.",
    },
    description: "Advanced portfolio analytics and forecasting (legacy route)",
  },

  // New canonical top-level Workflows route (Phase 1 nav anchor; Phase 4 redesigns interior).
  workflows: {
    path: "/workflows",
    label: "Workflows",
    icon: ListChecks,
    breadcrumbs: [
      { label: "Dashboard", href: "/home" },
      { label: "Workflows" },
    ],
    aiSuggestion: {
      label: "Dashboard",
      href: "/home",
      reasoning:
        "Return to the dashboard to track which workflow signals need attention.",
    },
    description:
      "Operational queues: capital calls, distributions, compliance, audit",
  },

  fundAdmin: {
    path: "/fund-admin",
    label: "Fund Admin",
    icon: DollarSign,
    breadcrumbs: [
      { label: "Dashboard", href: "/home" },
      { label: "Workflows", href: "/workflows" },
      { label: "Fund Admin" },
    ],
    aiSuggestion: {
      label: "LP Management",
      href: "/lp-management",
      reasoning:
        "Capital call operations often require LP communication, so LP data is usually needed next.",
    },
    description: "Capital calls and fund operations (legacy route)",
  },

  fundAdminDistributionsNew: {
    path: "/fund-admin/distributions/new",
    label: "New Distribution",
    icon: Receipt,
    breadcrumbs: [
      { label: "Dashboard", href: "/home" },
      { label: "Workflows", href: "/workflows" },
      { label: "Fund Admin", href: "/fund-admin" },
      { label: "New Distribution" },
    ],
    aiSuggestion: {
      label: "Waterfall Modeling",
      href: "/waterfall",
      reasoning: "Run waterfall scenarios before finalizing LP allocations.",
    },
    description: "Create a new distribution workflow",
  },

  fundAdminDistributionsCalendar: {
    path: "/fund-admin/distributions/calendar",
    label: "Distribution Calendar",
    icon: CalendarDays,
    breadcrumbs: [
      { label: "Dashboard", href: "/home" },
      { label: "Workflows", href: "/workflows" },
      { label: "Fund Admin", href: "/fund-admin" },
      { label: "Distribution Calendar" },
    ],
    aiSuggestion: {
      label: "New Distribution",
      href: "/fund-admin/distributions/new",
      reasoning: "Schedule a new distribution after reviewing the calendar.",
    },
    description: "Schedule and monitor upcoming distributions",
  },

  fundAdminDistributionDetail: {
    path: "/fund-admin/distributions/[id]",
    label: "Distribution Detail",
    icon: Receipt,
    breadcrumbs: [
      { label: "Dashboard", href: "/home" },
      { label: "Workflows", href: "/workflows" },
      { label: "Fund Admin", href: "/fund-admin" },
      { label: "Distribution Detail" },
    ],
    aiSuggestion: {
      label: "Distribution Calendar",
      href: "/fund-admin/distributions/calendar",
      reasoning: "Review upcoming distributions after approving this payout.",
    },
    description: "Review approvals, allocations, and statements",
  },

  // New canonical top-level LPs route (Phase 1 nav anchor; Phase 3 redesigns interior).
  lps: {
    path: "/lps",
    label: "LPs",
    icon: UserCheck,
    breadcrumbs: [{ label: "Dashboard", href: "/home" }, { label: "LPs" }],
    aiSuggestion: {
      label: "Reports",
      href: "/reports",
      reasoning:
        "Generate investor reports after reviewing LP data. Common workflow for quarterly updates.",
    },
    description: "Limited partner relationships and reporting",
  },

  lpManagement: {
    path: "/lp-management",
    label: "LP Management",
    icon: UserCheck,
    breadcrumbs: [
      { label: "Dashboard", href: "/home" },
      { label: "LPs", href: "/lps" },
      { label: "LP Management" },
    ],
    aiSuggestion: {
      label: "Reports",
      href: "/reports",
      reasoning:
        "Generate investor reports after reviewing LP data. Common workflow for quarterly updates.",
    },
    description: "Limited partner relationships and reporting (legacy route)",
  },

  lpPortal: {
    path: "/lp-portal",
    label: "LP Portal",
    icon: Users,
    breadcrumbs: [
      { label: "Dashboard", href: "/home" },
      { label: "LP Portal" },
    ],
    aiSuggestion: {
      label: "Distributions",
      href: "/fund-admin/distributions/calendar",
      reasoning: "Review distribution schedules that are surfaced to LPs.",
    },
    description: "Investor-facing portal for distributions and documents",
  },

  compliance: {
    path: "/compliance",
    label: "Compliance",
    icon: Shield,
    breadcrumbs: [
      { label: "Dashboard", href: "/home" },
      { label: "Workflows", href: "/workflows" },
      { label: "Compliance" },
    ],
    aiSuggestion: {
      label: "Audit Trail",
      href: "/audit-trail",
      reasoning:
        "Review audit trail for compliance verification. Recommended after checking compliance status.",
    },
    description: "Regulatory compliance and deadlines",
  },

  // Phase 2: legacy /409a-valuations is redirected to /portfolio/valuations
  // by next.config.js. This entry is retained so getRouteConfig still
  // resolves the old path during transitional internal navigation.
  valuations409a: {
    path: "/409a-valuations",
    label: "Valuations",
    icon: Receipt,
    breadcrumbs: [
      { label: "Dashboard", href: "/home" },
      { label: "Portfolio", href: "/portfolio" },
      { label: "Valuations" },
    ],
    aiSuggestion: {
      label: "Tax Center",
      href: "/tax-center",
      reasoning:
        "409A valuations often impact tax calculations. Review tax implications after valuation updates.",
    },
    description:
      "Fair market value assessments (legacy route — redirected to /portfolio/valuations)",
  },

  taxCenter: {
    path: "/tax-center",
    label: "Tax & Reporting",
    icon: Scale,
    breadcrumbs: [
      { label: "Dashboard", href: "/home" },
      { label: "Workflows", href: "/workflows" },
      { label: "Tax & Reporting" },
    ],
    aiSuggestion: {
      label: "Reports",
      href: "/reports",
      reasoning:
        "Export tax reports after K-1 generation for distribution to partners.",
    },
    description: "Tax planning and K-1 generation",
  },

  contacts: {
    path: "/contacts",
    label: "Contacts",
    icon: Users,
    breadcrumbs: [
      { label: "Dashboard", href: "/home" },
      { label: "LPs", href: "/lps" },
      { label: "Contacts" },
    ],
    aiSuggestion: {
      label: "Deal Intelligence",
      href: "/deal-intelligence",
      reasoning:
        "Find new opportunities from your network. AI can match contacts to potential deals.",
    },
    description: "Founders, LPs, and network contacts",
  },

  // New canonical top-level Signals route (first-class Phase 1 nav item).
  signals: {
    path: "/signals",
    label: "Signals",
    icon: Activity,
    breadcrumbs: [{ label: "Dashboard", href: "/home" }, { label: "Signals" }],
    aiSuggestion: {
      label: "Dashboard",
      href: "/home",
      reasoning:
        "After reviewing signals, return to the dashboard to prioritize today's work.",
    },
    description:
      "Cross-platform intelligence feed: risks, anomalies, blockers, missing updates",
  },

  notifications: {
    path: "/notifications",
    label: "Notifications",
    icon: Bell,
    breadcrumbs: [
      { label: "Dashboard", href: "/home" },
      { label: "Signals", href: "/signals" },
      { label: "Notifications" },
    ],
    aiSuggestion: {
      label: "Signals",
      href: "/signals",
      reasoning:
        "Notifications are now part of the Signals feed. Open Signals to see context, evidence, and recommended actions.",
    },
    description:
      "Alerts, reminders, and system updates (legacy route; now under Signals)",
  },

  reports: {
    path: "/reports",
    label: "Reports",
    icon: FileDown,
    breadcrumbs: [{ label: "Dashboard", href: "/home" }, { label: "Reports" }],
    aiSuggestion: {
      label: "Dashboard",
      href: "/home",
      reasoning:
        "Return to dashboard overview after generating reports to see updated metrics.",
    },
    description: "Generate and export reports",
  },

  // Phase 2: AI Tools rehome under Deals (per implementation_rules.md —
  // Decision Writer / Pitch Deck Reader / DD Assistant belong inside Deals).
  // The /ai-tools route is preserved for legacy bookmarks; the canonical
  // path is /deals/ai-tools. Vesta remains the contextual copilot.
  aiTools: {
    path: "/ai-tools",
    label: "AI Tools",
    icon: Sparkles,
    breadcrumbs: [
      { label: "Dashboard", href: "/home" },
      { label: "Deals", href: "/deals" },
      { label: "AI Tools" },
    ],
    aiSuggestion: {
      label: "Deals",
      href: "/deals",
      reasoning:
        "AI Tools embed inside the Deals workflow. Vesta remains the contextual copilot for in-product AI.",
    },
    description:
      "AI-powered workflows (rehomed under Deals; contextual AI runs through Vesta)",
  },

  waterfall: {
    path: "/waterfall",
    label: "Waterfall Modeling",
    icon: TrendingDown,
    breadcrumbs: [
      { label: "Dashboard", href: "/home" },
      { label: "Funds", href: "/funds" },
      { label: "Waterfall Modeling" },
    ],
    aiSuggestion: {
      label: "Fund Admin",
      href: "/fund-admin",
      reasoning:
        "Review capital call structures after modeling exit scenarios and distributions.",
    },
    description: "Model exit scenarios and distribution waterfalls",
  },

  auditTrail: {
    path: "/audit-trail",
    label: "Audit Trail",
    icon: Database,
    breadcrumbs: [
      { label: "Dashboard", href: "/home" },
      { label: "Workflows", href: "/workflows" },
      { label: "Audit Trail" },
    ],
    aiSuggestion: {
      label: "Compliance",
      href: "/compliance",
      reasoning:
        "Cross-reference audit records with compliance requirements to ensure regulatory adherence.",
    },
    description: "Immutable, cryptographically verified transaction history",
  },

  documents: {
    path: "/documents",
    label: "Documents",
    icon: FileText,
    breadcrumbs: [
      { label: "Dashboard", href: "/home" },
      { label: "Documents" },
    ],
    aiSuggestion: {
      label: "Reports",
      href: "/reports",
      reasoning:
        "Documents are institutional memory; Reports turn them into narratives.",
    },
    description: "Document management and storage",
  },

  integrations: {
    path: "/integrations",
    label: "Integrations",
    icon: Plug,
    breadcrumbs: [
      { label: "Dashboard", href: "/home" },
      { label: "Settings", href: "/settings" },
      { label: "Integrations" },
    ],
    aiSuggestion: {
      label: "Settings",
      href: "/settings",
      reasoning: "Configure integration settings and manage API credentials.",
    },
    description: "Connect external tools and services",
  },

  collaboration: {
    path: "/collaboration",
    label: "Collaboration",
    icon: MessageSquare,
    breadcrumbs: [
      { label: "Dashboard", href: "/home" },
      { label: "Workflows", href: "/workflows" },
      { label: "Collaboration" },
    ],
    aiSuggestion: {
      label: "Dashboard",
      href: "/home",
      reasoning:
        "Return to dashboard after clearing collaboration blockers to reprioritize work.",
    },
    description: "Cross-persona threads, comments, and task handoffs",
  },

  settings: {
    path: "/settings",
    label: "Settings",
    icon: Settings,
    breadcrumbs: [{ label: "Dashboard", href: "/home" }, { label: "Settings" }],
    aiSuggestion: {
      label: "Dashboard",
      href: "/home",
      reasoning:
        "Return to dashboard to see how your settings changes affect the overview.",
    },
    description: "Manage your account settings and preferences",
  },

  vesta: {
    path: "/vesta",
    label: "Vesta",
    icon: Sparkles,
    breadcrumbs: [{ label: "Vesta" }],
    description: "Conversation-first Vesta experience",
  },
};

export const ROUTE_PATHS = Object.freeze(
  Object.fromEntries(
    Object.entries(routes).map(([key, route]) => [key, route.path]),
  ) as { [K in keyof typeof routes]: (typeof routes)[K]["path"] },
);

export function withRouteParams(
  path: string,
  params: Record<string, string | number>,
): string {
  return Object.entries(params).reduce(
    (nextPath, [key, value]) =>
      nextPath.replace(`[${key}]`, encodeURIComponent(String(value))),
    path,
  );
}

/**
 * Get route configuration by path
 */
export function getRouteConfig(path: string): RouteConfig | undefined {
  return Object.values(routes).find((route) => route.path === path);
}

/**
 * Get breadcrumbs for current path
 */
export function getBreadcrumbs(path: string): BreadcrumbItem[] {
  const config = getRouteConfig(path);
  return config?.breadcrumbs || [{ label: "Home", href: "/home" }];
}

/**
 * Get AI suggestion for current path
 */
export function getAISuggestion(path: string): AISuggestion | undefined {
  const config = getRouteConfig(path);
  return config?.aiSuggestion;
}
