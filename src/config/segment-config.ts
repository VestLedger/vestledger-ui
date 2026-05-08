import { ROUTE_PATHS } from "@/config/routes";
import {
  DEFAULT_SEGMENT_KEY,
  type DashboardBlockVisibility,
  type DemoDataTier,
  type ModuleProminence,
  type SegmentKey,
  type SegmentModuleId,
  normalizeSegmentKey,
} from "@/types/segments";

export type SegmentEmptyState = {
  title: string;
  description: string;
  ctaLabel?: string;
  ctaHref?: string;
};

export type SegmentModuleConfig = {
  moduleId: SegmentModuleId;
  label: string;
  sourceWeight: string;
  prominence: ModuleProminence;
  order: number;
  emptyState: SegmentEmptyState;
};

export type SegmentDashboardBlockConfig = {
  id: string;
  label: string;
  sourceModules: string;
  sourceFunctionalBucket: string;
  sourceWeight: string;
  prominence: ModuleProminence;
  visibility: DashboardBlockVisibility;
  rank: number;
  vestaSuggestion?: string;
  demoDataTier: DemoDataTier;
};

export type SegmentConfig = {
  key: SegmentKey;
  label: string;
  skuLabel: string;
  primaryWedge: string;
  dashboardTitle: string;
  dashboardEmptyState: SegmentEmptyState;
  demoLabel: string;
  topbarExamples: readonly string[];
  modules: Record<SegmentModuleId, SegmentModuleConfig>;
  dashboardBlocks: readonly SegmentDashboardBlockConfig[];
  vestaSuggestions: readonly string[];
};

const prominenceRank: Record<ModuleProminence, number> = {
  high: 0,
  medium: 1,
  low_medium: 2,
  low: 3,
};

export function getProminenceLabel(prominence: ModuleProminence): string {
  switch (prominence) {
    case "high":
      return "Primary";
    case "medium":
      return "Visible";
    case "low_medium":
      return "Secondary";
    case "low":
      return "De-emphasized";
  }
}

function moduleConfig(
  moduleId: SegmentModuleId,
  label: string,
  sourceWeight: string,
  prominence: ModuleProminence,
  order: number,
  emptyState: SegmentEmptyState,
): SegmentModuleConfig {
  return { moduleId, label, sourceWeight, prominence, order, emptyState };
}

function dashboardBlock(
  id: string,
  label: string,
  sourceModules: string,
  sourceFunctionalBucket: string,
  sourceWeight: string,
  prominence: ModuleProminence,
  visibility: DashboardBlockVisibility,
  rank: number,
  demoDataTier: DemoDataTier,
  vestaSuggestion?: string,
): SegmentDashboardBlockConfig {
  return {
    id,
    label,
    sourceModules,
    sourceFunctionalBucket,
    sourceWeight,
    prominence,
    visibility,
    rank,
    demoDataTier,
    vestaSuggestion,
  };
}

const microVcEmptyStates = {
  dashboard: {
    title: "Set up the fund cockpit",
    description:
      "Add deals, portfolio companies, funds, and LP activity to populate the five-block operating dashboard.",
    ctaLabel: "Open Deals",
    ctaHref: ROUTE_PATHS.deals,
  },
  portfolio: {
    title: "No portfolio companies yet",
    description:
      "Add a portfolio company or import from your latest LP report to start health and runway tracking.",
    ctaLabel: "Open Portfolio",
    ctaHref: ROUTE_PATHS.portfolio,
  },
  deals: {
    title: "No deals in pipeline yet",
    description:
      "Import from Affinity, Notion, or CSV, then use Vesta to spot stalled diligence.",
    ctaLabel: "Open Pipeline",
    ctaHref: ROUTE_PATHS.dealsPipeline,
  },
  funds: {
    title: "No fund configured yet",
    description:
      "Create the active fund so deployment, NAV, and pacing blocks can bind to live data.",
    ctaLabel: "Open Funds",
    ctaHref: ROUTE_PATHS.funds,
  },
  lps: {
    title: "No LPs invited yet",
    description:
      "Invite LPs and record commitments to unlock reporting gaps and capital activity.",
    ctaLabel: "Open LPs",
    ctaHref: ROUTE_PATHS.lps,
  },
  signals: {
    title: "No signals yet",
    description:
      "Signals appear after deals, portfolio updates, LP responses, or compliance items need attention.",
    ctaLabel: "Open Signals",
    ctaHref: ROUTE_PATHS.signals,
  },
  reports: {
    title: "No reports generated yet",
    description:
      "Start with an LP letter, NAV report, or performance summary once fund data is available.",
    ctaLabel: "Open Reports",
    ctaHref: ROUTE_PATHS.reports,
  },
  documents: {
    title: "No documents uploaded yet",
    description:
      "Drop fund formation docs, decks, LP letters, and close artifacts here so Vesta can cite evidence.",
    ctaLabel: "Open Documents",
    ctaHref: ROUTE_PATHS.documents,
  },
  workflows: {
    title: "No workflow queue items",
    description:
      "Capital calls, distributions, compliance deadlines, and approvals surface here when due.",
    ctaLabel: "Open Workflows",
    ctaHref: ROUTE_PATHS.workflows,
  },
  settings: {
    title: "Settings are ready",
    description:
      "Workspace preferences, Vesta controls, integrations, and profile settings live here.",
    ctaLabel: "Open Settings",
    ctaHref: ROUTE_PATHS.settings,
  },
  vesta: {
    title: "Vesta has no context yet",
    description:
      "Ask a question or open a fund, deal, portfolio company, report, or workflow to ground suggestions.",
    ctaLabel: "Open Vesta",
    ctaHref: ROUTE_PATHS.vesta,
  },
} satisfies Record<SegmentModuleId, SegmentEmptyState>;

const angelEmptyStates: Record<SegmentModuleId, SegmentEmptyState> = {
  ...microVcEmptyStates,
  dashboard: {
    title: "Add your first portfolio company",
    description:
      "Add your first portfolio company to start receiving the weekly brief.",
    ctaLabel: "Open Portfolio",
    ctaHref: ROUTE_PATHS.portfolio,
  },
  portfolio: {
    title: "No portfolio companies yet",
    description:
      "Vesta will summarize founder updates and flag missing ones once a company is added.",
    ctaLabel: "Open Portfolio",
    ctaHref: ROUTE_PATHS.portfolio,
  },
  signals: {
    title: "No portfolio signals yet",
    description:
      "Missing updates, follow-on candidates, and dilution changes will appear as signal cards.",
    ctaLabel: "Open Signals",
    ctaHref: ROUTE_PATHS.signals,
  },
  documents: {
    title: "No founder updates or decks yet",
    description:
      "Forward founder updates here or drag in a deck; Vesta extracts the rest.",
    ctaLabel: "Open Documents",
    ctaHref: ROUTE_PATHS.documents,
  },
  reports: {
    title: "No stakeholder note yet",
    description:
      "Draft a quarterly stakeholder note once portfolio updates are available.",
    ctaLabel: "Open Reports",
    ctaHref: ROUTE_PATHS.reports,
  },
  deals: {
    title: "Deal tracking is optional",
    description:
      "Track deals you are considering when your angel or syndicate pipeline grows.",
    ctaLabel: "Open Deals",
    ctaHref: ROUTE_PATHS.deals,
  },
  funds: {
    title: "SPV economics available when needed",
    description:
      "Funds stay available for SPV-style tracking but are not central to the angel workflow.",
    ctaLabel: "Open Funds",
    ctaHref: ROUTE_PATHS.funds,
  },
  lps: {
    title: "No stakeholders added yet",
    description:
      "Use Stakeholders for SPV backers or other lightweight investor relationships.",
    ctaLabel: "Open Stakeholders",
    ctaHref: ROUTE_PATHS.lps,
  },
  workflows: {
    title: "No workflow queue",
    description:
      "Compliance-lite workflows are available, but most angel work starts in Portfolio and Signals.",
    ctaLabel: "Open Workflows",
    ctaHref: ROUTE_PATHS.workflows,
  },
};

const familyOfficeEmptyStates: Record<SegmentModuleId, SegmentEmptyState> = {
  ...microVcEmptyStates,
  dashboard: {
    title: "Connect holdings and manager commitments",
    description:
      "Connect direct holdings and external fund commitments to see total exposure.",
    ctaLabel: "Open Portfolio",
    ctaHref: ROUTE_PATHS.portfolio,
  },
  portfolio: {
    title: "No direct holdings yet",
    description:
      "Add direct holdings and co-investments so Vesta can roll up total exposure.",
    ctaLabel: "Open Portfolio",
    ctaHref: ROUTE_PATHS.portfolio,
  },
  funds: {
    title: "No manager exposure yet",
    description:
      "Add external fund commitments to track manager exposure, vintage, and concentration.",
    ctaLabel: "Open Funds",
    ctaHref: ROUTE_PATHS.funds,
  },
  signals: {
    title: "No strategic signals yet",
    description:
      "Concentration, manager-silence, and exception signals appear once holdings are connected.",
    ctaLabel: "Open Signals",
    ctaHref: ROUTE_PATHS.signals,
  },
  reports: {
    title: "No IC briefing yet",
    description:
      "Generate IC memos, family-principal summaries, or regulatory packs from current exposure.",
    ctaLabel: "Open Reports",
    ctaHref: ROUTE_PATHS.reports,
  },
  documents: {
    title: "No review queue yet",
    description:
      "Manager reports, IC briefings, side letters, and audit packs will appear by entity.",
    ctaLabel: "Open Documents",
    ctaHref: ROUTE_PATHS.documents,
  },
  deals: {
    title: "No direct-investment opportunities",
    description:
      "Track discretionary direct-investment opportunities without promoting pipeline throughput.",
    ctaLabel: "Open Deals",
    ctaHref: ROUTE_PATHS.deals,
  },
  lps: {
    title: "No internal stakeholders yet",
    description:
      "Use this layer for trust beneficiaries, principals, and internal stakeholder reporting.",
    ctaLabel: "Open LPs",
    ctaHref: ROUTE_PATHS.lps,
  },
  workflows: {
    title: "No compliance queue items",
    description:
      "Compliance and review queues surface here; capital-call operations stay quiet by default.",
    ctaLabel: "Open Workflows",
    ctaHref: ROUTE_PATHS.workflows,
  },
};

const privateEquityEmptyStates: Record<SegmentModuleId, SegmentEmptyState> = {
  ...microVcEmptyStates,
  dashboard: {
    title: "Build the operating-rhythm grid",
    description:
      "Add portfolio metrics, value-creation owners, DD workstreams, and compliance evidence to populate the PE cockpit.",
    ctaLabel: "Open Workflows",
    ctaHref: ROUTE_PATHS.workflows,
  },
  portfolio: {
    title: "No operating metrics yet",
    description:
      "Add platform companies and operating metrics to track value creation and board cadence.",
    ctaLabel: "Open Portfolio",
    ctaHref: ROUTE_PATHS.portfolio,
  },
  deals: {
    title: "No diligence workstreams yet",
    description:
      "Create a deal and assign commercial, financial, legal, ops, or tech workstreams.",
    ctaLabel: "Open Deals",
    ctaHref: ROUTE_PATHS.deals,
  },
  workflows: {
    title: "No queue items yet",
    description:
      "Queue capital calls, distributions, compliance, audit, expenses, and approvals with owners and SLAs.",
    ctaLabel: "Open Workflows",
    ctaHref: ROUTE_PATHS.workflows,
  },
  signals: {
    title: "No owner-routed signals",
    description:
      "Signals will include owner and evidence fields for PE diligence, value creation, and audit exceptions.",
    ctaLabel: "Open Signals",
    ctaHref: ROUTE_PATHS.signals,
  },
  documents: {
    title: "No evidence room yet",
    description:
      "Board packs, IC memos, DD evidence, audit logs, K-1s, and side letters belong here.",
    ctaLabel: "Open Documents",
    ctaHref: ROUTE_PATHS.documents,
  },
};

function buildModules(
  source: Record<SegmentModuleId, [string, string, ModuleProminence]>,
  order: readonly SegmentModuleId[],
  emptyStates: Record<SegmentModuleId, SegmentEmptyState>,
): Record<SegmentModuleId, SegmentModuleConfig> {
  const result = {} as Record<SegmentModuleId, SegmentModuleConfig>;
  order.forEach((moduleId, index) => {
    const [label, sourceWeight, prominence] = source[moduleId];
    result[moduleId] = moduleConfig(
      moduleId,
      label,
      sourceWeight,
      prominence,
      index + 1,
      emptyStates[moduleId],
    );
  });
  return result;
}

const angelOrder: readonly SegmentModuleId[] = [
  "dashboard",
  "portfolio",
  "signals",
  "documents",
  "reports",
  "deals",
  "lps",
  "funds",
  "workflows",
  "settings",
  "vesta",
];

const defaultNavOrder: readonly SegmentModuleId[] = [
  "dashboard",
  "portfolio",
  "deals",
  "funds",
  "lps",
  "signals",
  "reports",
  "documents",
  "workflows",
  "settings",
  "vesta",
];

const familyOfficeOrder: readonly SegmentModuleId[] = [
  "dashboard",
  "portfolio",
  "funds",
  "signals",
  "reports",
  "documents",
  "deals",
  "lps",
  "workflows",
  "settings",
  "vesta",
];

const SEGMENT_CONFIGS: Record<SegmentKey, SegmentConfig> = {
  angel_syndicate: {
    key: "angel_syndicate",
    label: "Angel / Syndicate",
    skuLabel: "Vesta for Angels",
    primaryWedge: "Weekly portfolio intelligence brief",
    dashboardTitle: "Weekly portfolio intelligence brief",
    dashboardEmptyState: angelEmptyStates.dashboard,
    demoLabel: "Angel / Syndicate demo defaults",
    topbarExamples: [
      "summarize this week's founder updates",
      "flag missing portfolio updates",
      "draft a stakeholder note",
    ],
    modules: buildModules(
      {
        dashboard: ["Dashboard", "Core", "high"],
        portfolio: ["Portfolio", "Core", "high"],
        deals: ["Deals", "Core Light", "low_medium"],
        funds: ["Funds", "Light", "low"],
        lps: ["Stakeholders", "Light / Stakeholders", "low"],
        signals: ["Signals", "Core", "high"],
        reports: ["Reports", "Core Light", "low_medium"],
        documents: ["Documents", "Core", "high"],
        workflows: ["Workflows", "Light", "low"],
        settings: ["Settings", "Baseline", "medium"],
        vesta: ["Vesta", "Core", "high"],
      },
      angelOrder,
      angelEmptyStates,
    ),
    dashboardBlocks: [
      dashboardBlock(
        "portfolio_updates_received",
        "Portfolio updates received",
        "Portfolio, Documents",
        "Portfolio Intelligence & Monitoring",
        "Core",
        "high",
        "default",
        1,
        "rich",
        "Summarize this week's founder updates.",
      ),
      dashboardBlock(
        "missing_founder_updates",
        "Missing founder updates",
        "Portfolio, Signals",
        "Portfolio Intelligence & Monitoring",
        "Core",
        "high",
        "default",
        2,
        "rich",
        "Flag companies with missing or stale updates.",
      ),
      dashboardBlock(
        "follow_on_candidates",
        "Follow-on candidates",
        "Portfolio, Funds (Analytics)",
        "Portfolio Intelligence & Monitoring",
        "Core",
        "high",
        "default",
        3,
        "rich",
        "Which of my companies are most likely to raise in the next 60 days?",
      ),
      dashboardBlock(
        "dilution_ownership_changes",
        "Dilution / ownership changes",
        "Portfolio, 409A, Secondary Transfers",
        "Portfolio Intelligence & Monitoring",
        "Core",
        "high",
        "default",
        4,
        "standard",
        "Estimate dilution if I do/skip a follow-on at the next round.",
      ),
      dashboardBlock(
        "investor_newsletter_draft",
        "Investor newsletter draft",
        "Reports, Vesta",
        "Knowledge Base & Document Intelligence",
        "Secondary",
        "low_medium",
        "default",
        5,
        "standard",
        "Draft a quarterly note for my SPV backers.",
      ),
      dashboardBlock(
        "deal_pipeline_momentum",
        "Deal pipeline momentum",
        "Deals",
        "Deal Intake & Pipeline",
        "Secondary",
        "low_medium",
        "collapsed",
        6,
        "standard",
      ),
      dashboardBlock(
        "dd_blockers",
        "DD blockers",
        "Deals",
        "Diligence & Decisioning",
        "Secondary",
        "low_medium",
        "collapsed",
        7,
        "standard",
      ),
      dashboardBlock(
        "fund_deployment_status",
        "Fund deployment status",
        "Funds",
        "Fund Performance & Analytics",
        "De-emphasized",
        "low",
        "collapsed",
        8,
        "minimal",
      ),
      dashboardBlock(
        "lp_reporting_gaps",
        "LP reporting gaps",
        "LPs",
        "LP & Stakeholder Management",
        "De-emphasized",
        "low",
        "collapsed",
        9,
        "minimal",
      ),
      dashboardBlock(
        "compliance_audit_exceptions",
        "Compliance / audit exceptions",
        "Workflows",
        "Compliance, Audit & Governance",
        "De-emphasized",
        "low",
        "collapsed",
        10,
        "stub",
      ),
    ],
    vestaSuggestions: [
      "Summarize this week's founder updates.",
      "Which of my companies are most likely to raise in the next 60 days?",
      "Draft a quarterly note for my SPV backers.",
      "Flag companies with missing or stale updates.",
      "Estimate dilution if I do/skip a follow-on at the next round.",
    ],
  },
  micro_vc: {
    key: "micro_vc",
    label: "Micro VC",
    skuLabel: "Vestledger for Micro VCs",
    primaryWedge: "Fund intelligence OS",
    dashboardTitle: "Fund intelligence OS",
    dashboardEmptyState: microVcEmptyStates.dashboard,
    demoLabel: "Micro VC demo defaults",
    topbarExamples: [
      "which deals are stalled",
      "draft my Q1 LP letter",
      "show deployment vs plan",
    ],
    modules: buildModules(
      {
        dashboard: ["Dashboard", "Core", "high"],
        portfolio: ["Portfolio", "Core", "high"],
        deals: ["Deals", "Core", "high"],
        funds: ["Funds", "Core", "high"],
        lps: ["LPs", "Core", "high"],
        signals: ["Signals", "Core", "high"],
        reports: ["Reports", "Core", "high"],
        documents: ["Documents", "Core", "high"],
        workflows: ["Workflows", "Medium", "medium"],
        settings: ["Settings", "Baseline", "medium"],
        vesta: ["Vesta", "Core", "high"],
      },
      defaultNavOrder,
      microVcEmptyStates,
    ),
    dashboardBlocks: [
      dashboardBlock(
        "deal_pipeline_momentum",
        "Deal pipeline momentum",
        "Pipeline, Deal Intelligence",
        "Deal Intake & Pipeline",
        "Core",
        "high",
        "default",
        1,
        "rich",
        "Which deals in pipeline are stalled and need a nudge?",
      ),
      dashboardBlock(
        "dd_blockers",
        "DD blockers",
        "Deal Intelligence, Issue Management",
        "Diligence & Decisioning",
        "Core",
        "high",
        "default",
        2,
        "rich",
        "Generate an IC memo from this deal's diligence pack.",
      ),
      dashboardBlock(
        "portfolio_health",
        "Portfolio health",
        "Portfolio, Analytics",
        "Portfolio Intelligence & Monitoring",
        "Core",
        "high",
        "default",
        3,
        "rich",
        "Summarize portfolio risks since the last LP update.",
      ),
      dashboardBlock(
        "lp_reporting_gaps",
        "LP reporting gaps",
        "LP Management, Reports",
        "LP & Stakeholder Management",
        "Core",
        "high",
        "default",
        4,
        "rich",
        "Which LPs haven't responded to the last capital call?",
      ),
      dashboardBlock(
        "fund_deployment_status",
        "Fund deployment status",
        "Analytics > Deployment",
        "Fund Performance & Analytics",
        "Core",
        "high",
        "default",
        5,
        "rich",
        "Where am I behind on deployment vs. plan?",
      ),
      dashboardBlock(
        "investor_newsletter_draft",
        "Investor newsletter draft",
        "Reports",
        "Knowledge Base & Document Intelligence",
        "Core",
        "high",
        "default",
        6,
        "rich",
        "Draft my Q[X] LP letter from current portfolio and fund data.",
      ),
      dashboardBlock(
        "compliance_audit_exceptions",
        "Compliance / audit exceptions",
        "Workflows",
        "Compliance, Audit & Governance",
        "Secondary",
        "medium",
        "conditional",
        7,
        "standard",
      ),
    ],
    vestaSuggestions: [
      "Draft my Q[X] LP letter from current portfolio and fund data.",
      "Which deals in pipeline are stalled and need a nudge?",
      "Summarize portfolio risks since the last LP update.",
      "Where am I behind on deployment vs. plan?",
      "Which LPs haven't responded to the last capital call?",
      "Generate an IC memo from this deal's diligence pack.",
    ],
  },
  family_office: {
    key: "family_office",
    label: "Family Office",
    skuLabel: "Vesta for Family Offices",
    primaryWedge: "Investment exposure and signal intelligence",
    dashboardTitle: "Investment exposure and signal intelligence",
    dashboardEmptyState: familyOfficeEmptyStates.dashboard,
    demoLabel: "Family Office demo defaults",
    topbarExamples: [
      "show total investment exposure",
      "flag concentration risk",
      "summarize manager updates",
    ],
    modules: buildModules(
      {
        dashboard: ["Dashboard", "Core", "high"],
        portfolio: ["Portfolio", "Core", "high"],
        deals: ["Deals", "Medium", "medium"],
        funds: ["Funds", "Core", "high"],
        lps: ["LPs", "Medium", "medium"],
        signals: ["Signals", "Core", "high"],
        reports: ["Reports", "Core", "high"],
        documents: ["Documents", "Core", "high"],
        workflows: ["Workflows", "Medium Light", "low_medium"],
        settings: ["Settings", "Baseline", "medium"],
        vesta: ["Vesta", "Core", "high"],
      },
      familyOfficeOrder,
      familyOfficeEmptyStates,
    ),
    dashboardBlocks: [
      dashboardBlock(
        "total_investment_exposure",
        "Total investment exposure",
        "Portfolio, Funds",
        "Fund Performance & Analytics",
        "Core",
        "high",
        "default",
        1,
        "rich",
        "What is our total investment exposure across direct and fund holdings?",
      ),
      dashboardBlock(
        "portfolio_manager_updates",
        "Portfolio / manager updates",
        "Portfolio Updates, Documents",
        "Portfolio Intelligence & Monitoring",
        "Core",
        "high",
        "default",
        2,
        "rich",
        "Summarize all manager and portfolio updates from this month.",
      ),
      dashboardBlock(
        "concentration_risk",
        "Concentration risk",
        "Analytics > Risk Analysis",
        "Fund Performance & Analytics",
        "Core",
        "high",
        "default",
        3,
        "rich",
        "Where are we concentrated by sector / geography / vintage / single name?",
      ),
      dashboardBlock(
        "strategic_signals",
        "Strategic signals",
        "Signals",
        "Vesta Agent Layer",
        "Core",
        "high",
        "default",
        4,
        "rich",
        "Flag any material risk exceptions or anomalies.",
      ),
      dashboardBlock(
        "documents_requiring_review",
        "Documents requiring review",
        "Documents, Workflows",
        "Knowledge Base & Document Intelligence",
        "Core",
        "high",
        "default",
        5,
        "rich",
        "Which documents need review before the next IC?",
      ),
      dashboardBlock(
        "deal_pipeline_momentum",
        "Deal pipeline momentum",
        "Deals",
        "Deal Intake & Pipeline",
        "Secondary",
        "medium",
        "collapsed",
        6,
        "standard",
      ),
      dashboardBlock(
        "lp_reporting_gaps",
        "LP reporting gaps",
        "LPs",
        "LP & Stakeholder Management",
        "Secondary",
        "medium",
        "collapsed",
        7,
        "standard",
      ),
      dashboardBlock(
        "fund_deployment_status",
        "Fund deployment status",
        "Funds",
        "Fund Performance & Analytics",
        "Secondary",
        "medium",
        "collapsed",
        8,
        "standard",
      ),
      dashboardBlock(
        "compliance_audit_exceptions",
        "Compliance / audit exceptions",
        "Workflows",
        "Compliance, Audit & Governance",
        "De-emphasized",
        "low_medium",
        "conditional",
        9,
        "minimal",
      ),
    ],
    vestaSuggestions: [
      "What is our total investment exposure across direct and fund holdings?",
      "Where are we concentrated by sector / geography / vintage / single name?",
      "Summarize all manager and portfolio updates from this month.",
      "Which documents need review before the next IC?",
      "Flag any material risk exceptions or anomalies.",
      "Draft an IC memo on our top three exposures.",
    ],
  },
  private_equity: {
    key: "private_equity",
    label: "Private Equity",
    skuLabel: "Vestledger for PE",
    primaryWedge: "Diligence, portfolio and fund operations intelligence",
    dashboardTitle: "Operating-rhythm cockpit",
    dashboardEmptyState: privateEquityEmptyStates.dashboard,
    demoLabel: "Private Equity demo defaults",
    topbarExamples: [
      "show DD workstream blockers",
      "find overdue value-creation items",
      "draft a board-pack narrative",
    ],
    modules: buildModules(
      {
        dashboard: ["Dashboard", "Core", "high"],
        portfolio: ["Portfolio", "Core Deep", "high"],
        deals: ["Deals", "Core Deep", "high"],
        funds: ["Funds", "Core", "high"],
        lps: ["LPs", "Core", "high"],
        signals: ["Signals", "Core", "high"],
        reports: ["Reports", "Core", "high"],
        documents: ["Documents", "Core", "high"],
        workflows: ["Workflows", "Core Deep", "high"],
        settings: ["Settings", "Baseline", "medium"],
        vesta: ["Vesta", "Core", "high"],
      },
      defaultNavOrder,
      privateEquityEmptyStates,
    ),
    dashboardBlocks: [
      dashboardBlock(
        "portfolio_operating_metrics",
        "Portfolio operating metrics",
        "Portfolio, Analytics",
        "Portfolio Intelligence & Monitoring",
        "Core Deep",
        "high",
        "default",
        1,
        "rich",
        "What changed in portfolio operating metrics this month, by company?",
      ),
      dashboardBlock(
        "value_creation_action_items",
        "Value creation action items",
        "Workflows, Portfolio",
        "Portfolio Intelligence & Monitoring",
        "Core Deep",
        "high",
        "default",
        2,
        "rich",
        "Which value-creation items are overdue, and who owns them?",
      ),
      dashboardBlock(
        "board_update_status",
        "Board update status",
        "Portfolio Updates, Reports",
        "Knowledge Base & Document Intelligence",
        "Core",
        "high",
        "default",
        3,
        "rich",
        "Which board updates are missing or late?",
      ),
      dashboardBlock(
        "dd_workstream_blockers",
        "DD workstream blockers",
        "Deal Intelligence",
        "Diligence & Decisioning",
        "Core Deep",
        "high",
        "default",
        4,
        "rich",
        "Which DD workstreams are blocked, by severity?",
      ),
      dashboardBlock(
        "compliance_audit_exceptions",
        "Compliance / audit exceptions",
        "Compliance, Audit Trail",
        "Compliance, Audit & Governance",
        "Core",
        "high",
        "default",
        5,
        "rich",
        "Show all compliance and audit exceptions with evidence gaps.",
      ),
      dashboardBlock(
        "deal_pipeline_momentum",
        "Deal pipeline momentum",
        "Deals",
        "Deal Intake & Pipeline",
        "Core Deep",
        "high",
        "default",
        6,
        "rich",
      ),
      dashboardBlock(
        "portfolio_health",
        "Portfolio health",
        "Portfolio",
        "Portfolio Intelligence & Monitoring",
        "Core Deep",
        "high",
        "default",
        7,
        "rich",
      ),
      dashboardBlock(
        "fund_deployment_status",
        "Fund deployment status",
        "Funds",
        "Fund Performance & Analytics",
        "Core",
        "high",
        "default",
        8,
        "rich",
      ),
      dashboardBlock(
        "lp_reporting_gaps",
        "LP reporting gaps",
        "LPs",
        "LP & Stakeholder Management",
        "Core",
        "high",
        "default",
        9,
        "rich",
      ),
      dashboardBlock(
        "investor_newsletter_draft",
        "Investor newsletter draft",
        "Reports",
        "Knowledge Base & Document Intelligence",
        "Core",
        "high",
        "default",
        10,
        "rich",
        "Generate the next quarterly LP letter from fund and portfolio data.",
      ),
    ],
    vestaSuggestions: [
      "What changed in portfolio operating metrics this month, by company?",
      "Which value-creation items are overdue, and who owns them?",
      "Which DD workstreams are blocked, by severity?",
      "Which board updates are missing or late?",
      "Show all compliance and audit exceptions with evidence gaps.",
      "Draft a board-pack narrative for [company] from current data.",
      "Generate the next quarterly LP letter from fund and portfolio data.",
    ],
  },
};

export function resolveSegmentKey(value: unknown): SegmentKey {
  return (
    normalizeSegmentKey(value) ??
    normalizeSegmentKey(process.env.NEXT_PUBLIC_DEFAULT_SEGMENT) ??
    DEFAULT_SEGMENT_KEY
  );
}

export function getSegmentConfig(segment: unknown): SegmentConfig {
  return SEGMENT_CONFIGS[resolveSegmentKey(segment)];
}

export function getSegmentModuleConfig(
  segment: unknown,
  moduleId: string,
): SegmentModuleConfig | null {
  const config = getSegmentConfig(segment);
  return config.modules[moduleId as SegmentModuleId] ?? null;
}

export function getDefaultVisibleDashboardBlocks(
  segment: unknown,
): SegmentDashboardBlockConfig[] {
  return getSegmentConfig(segment).dashboardBlocks.filter(
    (block) => block.visibility === "default",
  );
}

export function getConditionalDashboardBlocks(
  segment: unknown,
): SegmentDashboardBlockConfig[] {
  return getSegmentConfig(segment).dashboardBlocks.filter(
    (block) => block.visibility === "conditional",
  );
}

export function getCollapsedDashboardBlocks(
  segment: unknown,
): SegmentDashboardBlockConfig[] {
  return getSegmentConfig(segment).dashboardBlocks.filter(
    (block) => block.visibility === "collapsed",
  );
}

export function getSegmentVestaSuggestions(
  segment: unknown,
  limit?: number,
): string[] {
  const suggestions = [...getSegmentConfig(segment).vestaSuggestions];
  return typeof limit === "number" ? suggestions.slice(0, limit) : suggestions;
}

export function getSegmentTopbarPlaceholder(segment: unknown): string {
  const config = getSegmentConfig(segment);
  const examples = config.topbarExamples.slice(0, 2);

  if (examples.length === 0) {
    return "Ask Vesta anything...";
  }

  return `Ask Vesta anything... (e.g., '${examples.join("', '")}')`;
}

export function sortItemsBySegmentNavigation<T extends { id: string }>(
  segment: unknown,
  items: readonly T[],
): T[] {
  const config = getSegmentConfig(segment);
  return [...items].sort((left, right) => {
    const leftModule = config.modules[left.id as SegmentModuleId];
    const rightModule = config.modules[right.id as SegmentModuleId];
    if (!leftModule || !rightModule) {
      if (leftModule) return -1;
      if (rightModule) return 1;
      return 0;
    }

    const prominenceDelta =
      prominenceRank[leftModule.prominence] -
      prominenceRank[rightModule.prominence];
    if (prominenceDelta !== 0) {
      return prominenceDelta;
    }

    return leftModule.order - rightModule.order;
  });
}

export { DEFAULT_SEGMENT_KEY, SEGMENT_CONFIGS };
