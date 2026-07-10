import { FAMILY_OFFICE_GROUP_ID, type NavGroupId } from "./navigation-stages";
import { ROUTE_PATHS } from "./routes";
import { patternsForStage } from "./workflow-index";

export type CoverageState =
  | "existing"
  | "needs_tab"
  | "needs_shell"
  | "deferred_persona";

export type PersonaScope = "gp" | "family_office";

export type NavDestination = {
  id: string;
  label: string;
  stage: NavGroupId;
  route: string;
  tabId?: string;
  sectionId?: string;
  keywords: readonly string[];
  workflowPatterns: readonly string[];
  workflowIds?: readonly string[];
  coverageState: CoverageState;
  fallbackRoute?: string;
  personaScope: PersonaScope;
  isRedesignedFrameReady: boolean;
};

type DestinationInput = Omit<
  NavDestination,
  "personaScope" | "isRedesignedFrameReady" | "workflowPatterns"
> & {
  personaScope?: PersonaScope;
  workflowPatterns?: readonly string[];
};

function dest(input: DestinationInput): NavDestination {
  return {
    workflowPatterns: [],
    personaScope: "gp",
    isRedesignedFrameReady:
      input.route === ROUTE_PATHS.dashboard ||
      input.route === ROUTE_PATHS.pipeline,
    ...input,
  };
}

const OVERVIEW: readonly NavDestination[] = [
  dest({
    id: "overview-home",
    label: "Overview home",
    stage: "overview",
    route: ROUTE_PATHS.dashboard,
    coverageState: "existing",
    keywords: ["home", "dashboard", "today", "blockers", "gp cockpit"],
    workflowPatterns: patternsForStage("overview"),
  }),
  dest({
    id: "overview-morning-brief",
    label: "Morning Brief",
    stage: "overview",
    route: ROUTE_PATHS.dashboard,
    sectionId: "morning-brief",
    coverageState: "needs_tab",
    fallbackRoute: ROUTE_PATHS.dashboard,
    keywords: ["briefing", "daily brief", "weekly brief", "synthesis"],
  }),
  dest({
    id: "overview-priority-work",
    label: "Priority Work",
    stage: "overview",
    route: ROUTE_PATHS.dashboard,
    sectionId: "priority-work",
    coverageState: "needs_tab",
    fallbackRoute: ROUTE_PATHS.dashboard,
    keywords: ["tasks", "priorities", "meeting prep", "call prep"],
  }),
  dest({
    id: "overview-approvals",
    label: "Approvals inbox",
    stage: "overview",
    route: ROUTE_PATHS.dashboard,
    sectionId: "approvals",
    coverageState: "needs_tab",
    fallbackRoute: ROUTE_PATHS.dashboard,
    keywords: ["approvals", "pending", "sign-off", "gates"],
  }),
  dest({
    id: "overview-institutional-memory",
    label: "Institutional Memory",
    stage: "overview",
    route: ROUTE_PATHS.dashboard,
    sectionId: "institutional-memory",
    coverageState: "needs_shell",
    fallbackRoute: ROUTE_PATHS.dashboard,
    keywords: ["memory", "write-back", "outcomes", "track record", "lessons"],
  }),
];

const RAISE: readonly NavDestination[] = [
  dest({
    id: "raise-lp-management",
    label: "Raise & LP Onboarding",
    stage: "raise",
    route: ROUTE_PATHS.lpManagement,
    coverageState: "existing",
    keywords: ["fundraising", "raise", "capital formation", "lp crm"],
    workflowPatterns: patternsForStage("raise"),
  }),
  dest({
    id: "raise-fundraising-pipeline",
    label: "Fundraising Pipeline",
    stage: "raise",
    route: ROUTE_PATHS.lpManagement,
    tabId: "fundraising-pipeline",
    coverageState: "needs_tab",
    fallbackRoute: ROUTE_PATHS.lpManagement,
    keywords: [
      "lp pipeline",
      "outreach",
      "soft-circle",
      "anchor lp",
      "deal book",
    ],
  }),
  dest({
    id: "raise-ddq",
    label: "DDQ & Questionnaires",
    stage: "raise",
    route: ROUTE_PATHS.lpManagement,
    tabId: "ddq-questionnaires",
    coverageState: "needs_tab",
    fallbackRoute: ROUTE_PATHS.lpManagement,
    keywords: ["ddq", "ilpa", "questionnaire", "dei", "esg questionnaire"],
  }),
  dest({
    id: "raise-data-rooms",
    label: "Fundraising Data Rooms",
    stage: "raise",
    route: ROUTE_PATHS.documents,
    sectionId: "fundraising-data-rooms",
    coverageState: "needs_shell",
    fallbackRoute: ROUTE_PATHS.documents,
    keywords: ["data room", "watermark", "redaction", "external share"],
  }),
  dest({
    id: "raise-lp-onboarding",
    label: "LP Onboarding & Subscriptions",
    stage: "raise",
    route: ROUTE_PATHS.fundAdmin,
    tabId: "lp-responses",
    coverageState: "existing",
    keywords: ["subscription", "onboarding", "commitment", "side letter"],
  }),
];

const PIPELINE: readonly NavDestination[] = [
  dest({
    id: "pipeline-board",
    label: "Pipeline board",
    stage: "pipeline",
    route: ROUTE_PATHS.pipeline,
    coverageState: "existing",
    keywords: ["deals", "kanban", "board", "opportunities", "deal flow"],
    workflowPatterns: patternsForStage("pipeline"),
  }),
  dest({
    id: "pipeline-intake",
    label: "Deal Intake",
    stage: "pipeline",
    route: ROUTE_PATHS.pipeline,
    sectionId: "intake",
    coverageState: "needs_tab",
    fallbackRoute: ROUTE_PATHS.pipeline,
    keywords: ["inbound", "capture", "referral", "banker", "conference"],
  }),
  dest({
    id: "pipeline-triage",
    label: "Triage",
    stage: "pipeline",
    route: ROUTE_PATHS.pipeline,
    sectionId: "triage",
    coverageState: "needs_tab",
    fallbackRoute: ROUTE_PATHS.pipeline,
    keywords: ["thesis fit", "mandate fit", "red flag", "screening", "ips"],
  }),
  dest({
    id: "pipeline-sources",
    label: "Sources",
    stage: "pipeline",
    route: ROUTE_PATHS.pipeline,
    sectionId: "sources",
    coverageState: "needs_tab",
    fallbackRoute: ROUTE_PATHS.pipeline,
    keywords: ["source attribution", "funnel", "dedupe", "entity resolution"],
  }),
];

const DEAL_INTELLIGENCE: readonly NavDestination[] = [
  dest({
    id: "di-page",
    label: "Deal Intelligence",
    stage: "deal-intelligence",
    route: ROUTE_PATHS.dealIntelligence,
    coverageState: "existing",
    keywords: ["diligence", "dd", "due diligence", "deal room"],
    workflowPatterns: patternsForStage("deal-intelligence"),
  }),
  dest({
    id: "di-overview",
    label: "Overview & Status",
    stage: "deal-intelligence",
    route: ROUTE_PATHS.dealIntelligence,
    tabId: "overview",
    coverageState: "existing",
    keywords: ["deal status", "open questions"],
  }),
  dest({
    id: "di-analytics",
    label: "Deal Analytics",
    stage: "deal-intelligence",
    route: ROUTE_PATHS.dealIntelligence,
    tabId: "analytics",
    coverageState: "existing",
    keywords: ["deal metrics", "comparables"],
  }),
  dest({
    id: "di-documents",
    label: "DD Documents",
    stage: "deal-intelligence",
    route: ROUTE_PATHS.dealIntelligence,
    tabId: "documents",
    coverageState: "existing",
    keywords: ["dd documents", "evidence pack", "qoe", "findings"],
  }),
  dest({
    id: "di-analysis",
    label: "Analysis & Insights",
    stage: "deal-intelligence",
    route: ROUTE_PATHS.dealIntelligence,
    tabId: "analysis",
    coverageState: "existing",
    keywords: ["analysis", "insights", "bear case", "reasoning"],
  }),
  dest({
    id: "di-ic-materials",
    label: "IC Materials",
    stage: "deal-intelligence",
    route: ROUTE_PATHS.dealIntelligence,
    tabId: "ic-materials",
    coverageState: "existing",
    keywords: ["ic memo", "pre-read", "investment committee"],
  }),
];

const DEAL_REVIEW: readonly NavDestination[] = [
  dest({
    id: "dr-page",
    label: "Deal Review",
    stage: "deal-review",
    route: ROUTE_PATHS.dealflowReview,
    coverageState: "existing",
    keywords: ["ic", "committee", "review", "decision"],
    workflowPatterns: patternsForStage("deal-review"),
  }),
  dest({
    id: "dr-score",
    label: "Score",
    stage: "deal-review",
    route: ROUTE_PATHS.dealflowReview,
    sectionId: "score",
    coverageState: "existing",
    keywords: ["scoring", "company score"],
  }),
  dest({
    id: "dr-vote",
    label: "Vote",
    stage: "deal-review",
    route: ROUTE_PATHS.dealflowReview,
    sectionId: "vote",
    coverageState: "needs_tab",
    fallbackRoute: ROUTE_PATHS.dealflowReview,
    keywords: ["vote capture", "quorum", "recusal", "dissent"],
  }),
  dest({
    id: "dr-committee",
    label: "Committee",
    stage: "deal-review",
    route: ROUTE_PATHS.dealflowReview,
    sectionId: "committee",
    coverageState: "needs_tab",
    fallbackRoute: ROUTE_PATHS.dealflowReview,
    keywords: ["ic committee", "members", "conditions precedent"],
  }),
  dest({
    id: "dr-decision-log",
    label: "Decision Log",
    stage: "deal-review",
    route: ROUTE_PATHS.dealflowReview,
    sectionId: "decision-log",
    coverageState: "needs_tab",
    fallbackRoute: ROUTE_PATHS.dealflowReview,
    keywords: ["decision log", "drift", "memory", "rationale"],
  }),
];

const DEAL_EXECUTION: readonly NavDestination[] = [
  dest({
    id: "de-execution",
    label: "Deal Execution & Closing",
    stage: "deal-execution",
    route: ROUTE_PATHS.dealIntelligence,
    tabId: "execution",
    coverageState: "needs_tab",
    fallbackRoute: ROUTE_PATHS.dealIntelligence,
    keywords: [
      "term sheet",
      "loi",
      "closing checklist",
      "definitive docs",
      "negotiation",
      "lender",
      "capital stack",
      "exclusivity",
    ],
    workflowPatterns: patternsForStage("deal-execution"),
  }),
  dest({
    id: "de-funds-flow",
    label: "Signature & Funds Flow",
    stage: "deal-execution",
    route: ROUTE_PATHS.fundAdmin,
    sectionId: "money-movement",
    coverageState: "existing",
    keywords: ["wire", "funds flow", "signature", "money movement"],
  }),
];

const FUND_ADMIN: readonly NavDestination[] = [
  dest({
    id: "fa-page",
    label: "Capital & Fund Admin",
    stage: "fund-admin",
    route: ROUTE_PATHS.fundAdmin,
    coverageState: "existing",
    keywords: ["fund admin", "capital", "vehicles", "spv"],
    workflowPatterns: patternsForStage("fund-admin"),
  }),
  dest({
    id: "fa-fund-setup",
    label: "Fund Setup",
    stage: "fund-admin",
    route: ROUTE_PATHS.fundAdmin,
    tabId: "fund-setup",
    coverageState: "existing",
    keywords: ["fund setup", "spv setup", "vehicle"],
  }),
  dest({
    id: "fa-capital-calls",
    label: "Capital Calls",
    stage: "fund-admin",
    route: ROUTE_PATHS.fundAdmin,
    tabId: "capital-calls",
    coverageState: "existing",
    keywords: ["capital call", "ilpa", "notice", "reconciliation"],
  }),
  dest({
    id: "fa-distributions",
    label: "Distributions",
    stage: "fund-admin",
    route: ROUTE_PATHS.fundAdmin,
    tabId: "distributions",
    coverageState: "existing",
    keywords: ["distribution", "in-kind", "proceeds", "statement"],
  }),
  dest({
    id: "fa-lp-responses",
    label: "LP Responses",
    stage: "fund-admin",
    route: ROUTE_PATHS.fundAdmin,
    tabId: "lp-responses",
    coverageState: "existing",
    keywords: ["lp responses", "commitments"],
  }),
  dest({
    id: "fa-nav-calculator",
    label: "NAV Calculator",
    stage: "fund-admin",
    route: ROUTE_PATHS.fundAdmin,
    tabId: "nav-calculator",
    coverageState: "existing",
    keywords: ["nav", "net asset value", "capital account"],
  }),
  dest({
    id: "fa-carried-interest",
    label: "Carried Interest",
    stage: "fund-admin",
    route: ROUTE_PATHS.fundAdmin,
    tabId: "carried-interest",
    coverageState: "existing",
    keywords: ["carry", "promote", "crystallization", "economics"],
  }),
  dest({
    id: "fa-expenses",
    label: "Expenses",
    stage: "fund-admin",
    route: ROUTE_PATHS.fundAdmin,
    tabId: "expenses",
    coverageState: "existing",
    keywords: ["expenses", "fees", "cost allocation"],
  }),
  dest({
    id: "fa-secondary-transfers",
    label: "Secondary Transfers",
    stage: "fund-admin",
    route: ROUTE_PATHS.fundAdmin,
    tabId: "secondary-transfers",
    coverageState: "existing",
    keywords: ["secondary", "transfer", "lp transfer"],
  }),
];

const PORTFOLIO: readonly NavDestination[] = [
  dest({
    id: "pf-page",
    label: "Portfolio",
    stage: "portfolio",
    route: ROUTE_PATHS.portfolio,
    coverageState: "existing",
    keywords: ["portfolio", "companies", "monitoring", "kpi"],
    workflowPatterns: patternsForStage("portfolio"),
  }),
  dest({
    id: "pf-overview",
    label: "Portfolio Overview",
    stage: "portfolio",
    route: ROUTE_PATHS.portfolio,
    tabId: "overview",
    coverageState: "existing",
    keywords: ["holdings", "positions", "cap table"],
  }),
  dest({
    id: "pf-updates",
    label: "Portfolio Updates",
    stage: "portfolio",
    route: ROUTE_PATHS.portfolio,
    tabId: "updates",
    coverageState: "existing",
    keywords: ["founder updates", "kpi collection", "stale updates"],
  }),
  dest({
    id: "pf-documents",
    label: "Portfolio Documents",
    stage: "portfolio",
    route: ROUTE_PATHS.portfolio,
    tabId: "documents",
    coverageState: "existing",
    keywords: ["portfolio documents", "board decks"],
  }),
  dest({
    id: "pf-rights-board",
    label: "Rights & Board",
    stage: "portfolio",
    route: ROUTE_PATHS.portfolio,
    tabId: "rights-board",
    coverageState: "needs_tab",
    fallbackRoute: ROUTE_PATHS.portfolio,
    keywords: [
      "pro-rata",
      "reserves",
      "board meeting",
      "exit readiness",
      "rofr",
    ],
  }),
  dest({
    id: "pf-risk",
    label: "Portfolio Risk",
    stage: "portfolio",
    route: ROUTE_PATHS.portfolio,
    tabId: "risk",
    coverageState: "needs_tab",
    fallbackRoute: ROUTE_PATHS.portfolio,
    keywords: ["risk signals", "runway", "burn", "red flags", "overlays"],
  }),
];

const ANALYTICS: readonly NavDestination[] = [
  dest({
    id: "an-page",
    label: "Analytics & Valuation",
    stage: "analytics",
    route: ROUTE_PATHS.analytics,
    coverageState: "existing",
    keywords: ["analytics", "performance", "valuation", "marks"],
    workflowPatterns: patternsForStage("analytics"),
  }),
  dest({
    id: "an-performance",
    label: "Performance",
    stage: "analytics",
    route: ROUTE_PATHS.analytics,
    tabId: "performance",
    coverageState: "existing",
    keywords: ["irr", "tvpi", "dpi", "attribution"],
  }),
  dest({
    id: "an-j-curve",
    label: "J-Curve",
    stage: "analytics",
    route: ROUTE_PATHS.analytics,
    tabId: "j-curve",
    coverageState: "existing",
    keywords: ["j-curve", "cash flow"],
  }),
  dest({
    id: "an-cohort",
    label: "Cohort Analysis",
    stage: "analytics",
    route: ROUTE_PATHS.analytics,
    tabId: "cohort",
    coverageState: "existing",
    keywords: ["cohort", "vintage"],
  }),
  dest({
    id: "an-valuation-trends",
    label: "Valuation Trends",
    stage: "analytics",
    route: ROUTE_PATHS.analytics,
    tabId: "valuation",
    coverageState: "existing",
    keywords: ["valuation trends", "mark approval", "fmv"],
  }),
  dest({
    id: "an-deployment",
    label: "Deployment",
    stage: "analytics",
    route: ROUTE_PATHS.analytics,
    tabId: "deployment",
    coverageState: "existing",
    keywords: ["deployment pace", "dry powder"],
  }),
  dest({
    id: "an-risk",
    label: "Risk Analysis",
    stage: "analytics",
    route: ROUTE_PATHS.analytics,
    tabId: "risk",
    coverageState: "existing",
    keywords: ["exposure", "concentration", "vehicle roster"],
  }),
  dest({
    id: "an-409a",
    label: "409A Valuations",
    stage: "analytics",
    route: ROUTE_PATHS.valuations409a,
    coverageState: "existing",
    keywords: ["409a", "strike price", "valuation history"],
  }),
  dest({
    id: "an-waterfall",
    label: "Waterfall Modeling",
    stage: "analytics",
    route: ROUTE_PATHS.waterfall,
    coverageState: "existing",
    keywords: [
      "waterfall",
      "exit scenario",
      "proceeds",
      "distribution modeling",
    ],
  }),
];

const REPORTING_LPS: readonly NavDestination[] = [
  dest({
    id: "rl-lp-management",
    label: "LP Management",
    stage: "reporting-lps",
    route: ROUTE_PATHS.lpManagement,
    coverageState: "existing",
    keywords: ["lp", "investor relations", "reporting"],
    workflowPatterns: patternsForStage("reporting-lps"),
  }),
  dest({
    id: "rl-lp-overview",
    label: "LP Overview",
    stage: "reporting-lps",
    route: ROUTE_PATHS.lpManagement,
    tabId: "overview",
    coverageState: "existing",
    keywords: ["lp roster", "commitments"],
  }),
  dest({
    id: "rl-reports",
    label: "LP Reports",
    stage: "reporting-lps",
    route: ROUTE_PATHS.lpManagement,
    tabId: "reports",
    coverageState: "existing",
    keywords: ["quarterly report", "annual report", "report approval"],
  }),
  dest({
    id: "rl-capital-activity",
    label: "Capital Activity",
    stage: "reporting-lps",
    route: ROUTE_PATHS.lpManagement,
    tabId: "capital",
    coverageState: "existing",
    keywords: ["capital activity", "statements"],
  }),
  dest({
    id: "rl-performance",
    label: "LP Performance",
    stage: "reporting-lps",
    route: ROUTE_PATHS.lpManagement,
    tabId: "performance",
    coverageState: "existing",
    keywords: ["track record", "performance reporting"],
  }),
  dest({
    id: "rl-governance-memory",
    label: "Governance & Memory",
    stage: "reporting-lps",
    route: ROUTE_PATHS.lpManagement,
    tabId: "governance-memory",
    coverageState: "needs_tab",
    fallbackRoute: ROUTE_PATHS.lpManagement,
    keywords: ["lpac", "side letter", "mfn", "ips", "minutes", "governance"],
  }),
  dest({
    id: "rl-lp-portal",
    label: "LP Portal",
    stage: "reporting-lps",
    route: ROUTE_PATHS.lpPortal,
    coverageState: "existing",
    keywords: ["lp portal", "investor view", "backer"],
  }),
  dest({
    id: "rl-report-export",
    label: "Report Export",
    stage: "reporting-lps",
    route: ROUTE_PATHS.reports,
    coverageState: "existing",
    keywords: ["export", "render", "package", "stakeholder reporting"],
  }),
];

const TAX: readonly NavDestination[] = [
  dest({
    id: "tax-page",
    label: "Tax Center",
    stage: "tax",
    route: ROUTE_PATHS.taxCenter,
    coverageState: "existing",
    keywords: ["tax", "k-1", "k-3", "fatca", "treaty"],
    workflowPatterns: patternsForStage("tax"),
  }),
  dest({
    id: "tax-documents",
    label: "Tax Documents",
    stage: "tax",
    route: ROUTE_PATHS.taxCenter,
    tabId: "overview",
    coverageState: "existing",
    keywords: ["tax documents"],
  }),
  dest({
    id: "tax-k1-generator",
    label: "K-1 Generator",
    stage: "tax",
    route: ROUTE_PATHS.taxCenter,
    tabId: "k1-generator",
    coverageState: "existing",
    keywords: ["k-1", "1065", "data pack", "preparer"],
  }),
  dest({
    id: "tax-fund-summary",
    label: "Fund Tax Summary",
    stage: "tax",
    route: ROUTE_PATHS.taxCenter,
    tabId: "fund-summary",
    coverageState: "existing",
    keywords: ["fund summary", "ubti", "eci", "pfic"],
  }),
  dest({
    id: "tax-portfolio",
    label: "Portfolio Companies (Tax)",
    stage: "tax",
    route: ROUTE_PATHS.taxCenter,
    tabId: "portfolio",
    coverageState: "existing",
    keywords: ["qsbs", "portco tax"],
  }),
  dest({
    id: "tax-communications",
    label: "Tax LP Communications",
    stage: "tax",
    route: ROUTE_PATHS.taxCenter,
    tabId: "communications",
    coverageState: "existing",
    keywords: ["tax communications", "estimates"],
  }),
];

const COMPLIANCE: readonly NavDestination[] = [
  dest({
    id: "comp-page",
    label: "Compliance & Records",
    stage: "compliance",
    route: ROUTE_PATHS.compliance,
    coverageState: "existing",
    keywords: ["compliance", "regulatory", "filings", "kyc", "aml", "adv"],
    workflowPatterns: patternsForStage("compliance"),
  }),
  dest({
    id: "comp-overview",
    label: "Compliance Overview",
    stage: "compliance",
    route: ROUTE_PATHS.compliance,
    tabId: "overview",
    coverageState: "existing",
    keywords: ["calendar", "deadlines", "obligations", "fund-life"],
  }),
  dest({
    id: "comp-filings",
    label: "Regulatory Filings",
    stage: "compliance",
    route: ROUTE_PATHS.compliance,
    tabId: "filings",
    coverageState: "existing",
    keywords: [
      "form adv",
      "form d",
      "form pf",
      "blue sky",
      "aifmd",
      "annex iv",
    ],
  }),
  dest({
    id: "comp-audits",
    label: "Audit Schedule",
    stage: "compliance",
    route: ROUTE_PATHS.compliance,
    tabId: "audits",
    coverageState: "existing",
    keywords: ["audit", "exam", "surprise audit", "custody rule"],
  }),
  dest({
    id: "comp-resources",
    label: "Compliance Resources",
    stage: "compliance",
    route: ROUTE_PATHS.compliance,
    tabId: "resources",
    coverageState: "existing",
    keywords: [
      "policies",
      "code of ethics",
      "insurance program",
      "information barriers",
    ],
  }),
  dest({
    id: "comp-documents",
    label: "Documents",
    stage: "compliance",
    route: ROUTE_PATHS.documents,
    coverageState: "existing",
    keywords: ["documents", "evidence", "books and records", "repository"],
  }),
  dest({
    id: "comp-audit-trail",
    label: "Audit Trail",
    stage: "compliance",
    route: ROUTE_PATHS.auditTrail,
    coverageState: "existing",
    keywords: ["audit trail", "immutable", "history", "log"],
  }),
];

const NETWORK: readonly NavDestination[] = [
  dest({
    id: "net-contacts",
    label: "Contacts & Relationships",
    stage: "network",
    route: ROUTE_PATHS.contacts,
    coverageState: "existing",
    keywords: ["contacts", "crm", "relationships", "warm intro", "founders"],
    workflowPatterns: patternsForStage("network"),
  }),
  dest({
    id: "net-service-providers",
    label: "Service Providers",
    stage: "network",
    route: ROUTE_PATHS.contacts,
    tabId: "service-providers",
    coverageState: "needs_tab",
    fallbackRoute: ROUTE_PATHS.contacts,
    keywords: [
      "fund admin",
      "counsel",
      "auditor",
      "tax preparer",
      "engagement",
      "context grant",
      "provider output",
      "placement agent",
    ],
  }),
  dest({
    id: "net-collaboration",
    label: "Collaboration",
    stage: "network",
    route: ROUTE_PATHS.collaboration,
    coverageState: "existing",
    keywords: ["threads", "coordination", "handoffs"],
  }),
  dest({
    id: "net-threads",
    label: "Threads",
    stage: "network",
    route: ROUTE_PATHS.collaboration,
    tabId: "threads",
    coverageState: "existing",
    keywords: ["comments", "discussion"],
  }),
  dest({
    id: "net-tasks",
    label: "Tasks",
    stage: "network",
    route: ROUTE_PATHS.collaboration,
    tabId: "tasks",
    coverageState: "existing",
    keywords: ["tasks", "follow-up", "open loops", "workstreams"],
  }),
];

const DATA_INTEGRATIONS: readonly NavDestination[] = [
  dest({
    id: "din-integrations",
    label: "Integrations",
    stage: "data-integrations",
    route: ROUTE_PATHS.integrations,
    coverageState: "existing",
    keywords: ["integrations", "sync", "calendar", "email", "ingestion"],
    workflowPatterns: patternsForStage("data-integrations"),
  }),
  dest({
    id: "din-capture-review",
    label: "Capture Review",
    stage: "data-integrations",
    route: ROUTE_PATHS.integrations,
    sectionId: "capture-review",
    coverageState: "existing",
    keywords: ["captured meetings", "calls", "review queue"],
  }),
  dest({
    id: "din-connectors",
    label: "Connectors",
    stage: "data-integrations",
    route: ROUTE_PATHS.integrations,
    tabId: "connectors",
    coverageState: "needs_tab",
    fallbackRoute: ROUTE_PATHS.integrations,
    keywords: ["connectors", "crm sync", "data provider", "external systems"],
  }),
  dest({
    id: "din-ingestion-inbox",
    label: "Ingestion Inbox",
    stage: "data-integrations",
    route: ROUTE_PATHS.integrations,
    tabId: "ingestion-inbox",
    coverageState: "needs_tab",
    fallbackRoute: ROUTE_PATHS.integrations,
    keywords: ["ingestion", "extraction", "reconciliation", "data room import"],
  }),
  dest({
    id: "din-entity-resolution",
    label: "Entity Resolution",
    stage: "data-integrations",
    route: ROUTE_PATHS.integrations,
    tabId: "entity-resolution",
    coverageState: "needs_tab",
    fallbackRoute: ROUTE_PATHS.integrations,
    keywords: ["entity graph", "matching", "dedupe", "provenance"],
  }),
];

const FAMILY_OFFICE: readonly NavDestination[] = [
  dest({
    id: "fo-entity-context",
    label: "Family Entity & Custodian Context",
    stage: FAMILY_OFFICE_GROUP_ID,
    route: ROUTE_PATHS.portfolio,
    coverageState: "deferred_persona",
    fallbackRoute: ROUTE_PATHS.portfolio,
    personaScope: "family_office",
    keywords: ["family office", "estate", "custodian", "multi-entity"],
    workflowPatterns: [
      "Family-office entity, residency, estate, and custodian context",
    ],
  }),
  dest({
    id: "fo-tax-estate",
    label: "Family Tax & Estate Decisions",
    stage: FAMILY_OFFICE_GROUP_ID,
    route: ROUTE_PATHS.taxCenter,
    coverageState: "deferred_persona",
    fallbackRoute: ROUTE_PATHS.taxCenter,
    personaScope: "family_office",
    keywords: ["family office", "gst", "harvesting", "daf", "charitable"],
    workflowPatterns: [
      "Family-office tax, estate, mandate, and access-route decisions",
    ],
  }),
  dest({
    id: "fo-nextgen",
    label: "Family Governance & NextGen",
    stage: FAMILY_OFFICE_GROUP_ID,
    route: ROUTE_PATHS.dashboard,
    coverageState: "deferred_persona",
    fallbackRoute: ROUTE_PATHS.dashboard,
    personaScope: "family_office",
    keywords: ["family office", "nextgen", "family governance", "education"],
    workflowPatterns: ["Family governance and next-generation continuity"],
  }),
];

export const NAV_DESTINATIONS: readonly NavDestination[] = Object.freeze([
  ...OVERVIEW,
  ...RAISE,
  ...PIPELINE,
  ...DEAL_INTELLIGENCE,
  ...DEAL_REVIEW,
  ...DEAL_EXECUTION,
  ...FUND_ADMIN,
  ...PORTFOLIO,
  ...ANALYTICS,
  ...REPORTING_LPS,
  ...TAX,
  ...COMPLIANCE,
  ...NETWORK,
  ...DATA_INTEGRATIONS,
  ...FAMILY_OFFICE,
]);

export { FAMILY_OFFICE_GROUP_ID };

export type NavQuickAction = {
  id: string;
  label: string;
  keywords: readonly string[];
  route?: string;
  tabId?: string;
  vestaPrompt?: string;
};

export const NAV_QUICK_ACTIONS: readonly NavQuickAction[] = Object.freeze([
  {
    id: "add-deal",
    label: "Add New Deal",
    keywords: ["create", "new", "opportunity", "deal"],
    route: ROUTE_PATHS.pipeline,
  },
  {
    id: "add-contact",
    label: "Add New Contact",
    keywords: ["create", "new", "person", "contact"],
    route: ROUTE_PATHS.contacts,
  },
  {
    id: "create-capital-call",
    label: "Create Capital Call",
    keywords: ["create", "lp", "funding", "capital call"],
    route: ROUTE_PATHS.fundAdmin,
    tabId: "capital-calls",
  },
  {
    id: "start-ic-memo",
    label: "Start IC Memo",
    keywords: ["ic", "memo", "investment committee", "pre-read"],
    route: ROUTE_PATHS.dealIntelligence,
    tabId: "ic-materials",
  },
  {
    id: "upload-evidence",
    label: "Upload Evidence",
    keywords: ["evidence", "document", "upload", "kyc", "dd"],
    route: ROUTE_PATHS.documents,
  },
  {
    id: "ask-vesta",
    label: "Ask Vesta",
    keywords: ["assistant", "help", "ai", "vesta"],
    vestaPrompt: "Help me find the right workflow for what I need to do.",
  },
]);
