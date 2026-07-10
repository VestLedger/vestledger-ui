export type NavStageId =
  | "overview"
  | "raise"
  | "pipeline"
  | "deal-intelligence"
  | "deal-review"
  | "deal-execution"
  | "fund-admin"
  | "portfolio"
  | "analytics"
  | "reporting-lps"
  | "tax"
  | "compliance"
  | "network"
  | "data-integrations";

export const FAMILY_OFFICE_GROUP_ID = "family-office" as const;

export type NavGroupId = NavStageId | typeof FAMILY_OFFICE_GROUP_ID;

export type NavStage = {
  id: NavStageId;
  label: string;
  description: string;
};

export const NAV_STAGES: readonly NavStage[] = Object.freeze([
  {
    id: "overview",
    label: "Overview",
    description: "Daily GP operating surface",
  },
  {
    id: "raise",
    label: "Raise & LP Onboarding",
    description: "Fundraising, DDQs, and LP onboarding",
  },
  {
    id: "pipeline",
    label: "Pipeline",
    description: "Deal intake, sourcing, and triage",
  },
  {
    id: "deal-intelligence",
    label: "Deal Intelligence",
    description: "Due diligence and IC preparation",
  },
  {
    id: "deal-review",
    label: "Deal Review",
    description: "Scoring, votes, and decision logs",
  },
  {
    id: "deal-execution",
    label: "Deal Execution & Closing",
    description: "Term sheets through funds flow",
  },
  {
    id: "fund-admin",
    label: "Capital & Fund Admin",
    description: "Vehicles, capital calls, and distributions",
  },
  {
    id: "portfolio",
    label: "Portfolio",
    description: "Monitoring, rights, and exits",
  },
  {
    id: "analytics",
    label: "Analytics & Valuation",
    description: "Performance, marks, and scenarios",
  },
  {
    id: "reporting-lps",
    label: "Reporting & LPs",
    description: "LP reporting, governance, and Q&A",
  },
  { id: "tax", label: "Tax & Reporting", description: "K-1s and tax workflow" },
  {
    id: "compliance",
    label: "Compliance & Records",
    description: "Filings, evidence, and audit trail",
  },
  {
    id: "network",
    label: "Network & Service Providers",
    description: "Relationships and provider workflows",
  },
  {
    id: "data-integrations",
    label: "Data & Integrations",
    description: "Ingestion, entity graph, connectors",
  },
]);

export const NAV_STAGE_LABEL_BY_ID: Readonly<Record<NavStageId, string>> =
  Object.freeze(
    Object.fromEntries(NAV_STAGES.map((s) => [s.id, s.label])) as Record<
      NavStageId,
      string
    >,
  );

export const NAV_GROUP_IDS: ReadonlySet<string> = new Set([
  ...NAV_STAGES.map((s) => s.id),
  FAMILY_OFFICE_GROUP_ID,
]);
