export const SEEDED_AUDIT_PASSWORD = "Password123!";

export type AuditPersonaId =
  | "superadmin"
  | "gp"
  | "analyst"
  | "ops"
  | "ir"
  | "researcher"
  | "lp"
  | "auditor"
  | "service-provider"
  | "strategic-partner";

export type AuditPersona = {
  id: AuditPersonaId;
  role: string;
  label: string;
  email?: string;
  password?: string;
  defaultPath: string;
  envEmailVar?: string;
  envPasswordVar?: string;
};

export const AUDIT_PERSONAS: Record<AuditPersonaId, AuditPersona> = {
  superadmin: {
    id: "superadmin",
    role: "superadmin",
    label: "Superadmin",
    email: "superadmin@vestledger.com",
    password: SEEDED_AUDIT_PASSWORD,
    defaultPath: "/superadmin",
  },
  gp: {
    id: "gp",
    role: "gp",
    label: "GP",
    email: "james.chen@apexventures.com",
    password: SEEDED_AUDIT_PASSWORD,
    defaultPath: "/home",
  },
  analyst: {
    id: "analyst",
    role: "analyst",
    label: "Analyst",
    email: "emily.taylor@apexventures.com",
    password: SEEDED_AUDIT_PASSWORD,
    defaultPath: "/pipeline",
  },
  ops: {
    id: "ops",
    role: "ops",
    label: "Ops",
    email: "michael.ross@apexventures.com",
    password: SEEDED_AUDIT_PASSWORD,
    defaultPath: "/fund-admin",
  },
  ir: {
    id: "ir",
    role: "ir",
    label: "IR",
    email: "kevin.ng@apexventures.com",
    password: SEEDED_AUDIT_PASSWORD,
    defaultPath: "/lp-management",
  },
  researcher: {
    id: "researcher",
    role: "researcher",
    label: "Researcher",
    email: "alex.rivera@apexventures.com",
    password: SEEDED_AUDIT_PASSWORD,
    defaultPath: "/reports",
  },
  lp: {
    id: "lp",
    role: "lp",
    label: "LP",
    email: "portal@endowmentalpha.com",
    password: SEEDED_AUDIT_PASSWORD,
    defaultPath: "/lp-portal",
  },
  auditor: {
    id: "auditor",
    role: "auditor",
    label: "Auditor",
    email: "victor.ellis@apexventures.com",
    password: SEEDED_AUDIT_PASSWORD,
    defaultPath: "/compliance",
  },
  "service-provider": {
    id: "service-provider",
    role: "service_provider",
    label: "Service Provider",
    email: "morgan.reed@apexventures.com",
    password: SEEDED_AUDIT_PASSWORD,
    defaultPath: "/fund-admin",
  },
  "strategic-partner": {
    id: "strategic-partner",
    role: "strategic_partner",
    label: "Strategic Partner",
    defaultPath: "/dealflow-review",
    envEmailVar: "TEST_USER_STRATEGIC_PARTNER_EMAIL",
    envPasswordVar: "TEST_USER_STRATEGIC_PARTNER_PASSWORD",
  },
};

export type ScreenTargetKind =
  | "public-route"
  | "auth-route"
  | "dashboard-route"
  | "admin-route"
  | "persona-route"
  | "contextual-tab"
  | "deal-intelligence-fund"
  | "deal-intelligence-deal-tab"
  | "distribution-wizard-step"
  | "distribution-detail";

export type ScreenTarget = {
  id: string;
  kind: ScreenTargetKind;
  label: string;
  path: string;
  personaId?: AuditPersonaId;
  contextualRootLabel?: string;
  tabLabel?: string;
  tabId?: string;
  dynamic?: "first-distribution-detail";
};

const publicRoutes: ScreenTarget[] = [
  { id: "public-home", kind: "public-route", label: "Public Home", path: "/" },
  { id: "public-about", kind: "public-route", label: "About", path: "/about" },
  {
    id: "public-features",
    kind: "public-route",
    label: "Features",
    path: "/features",
  },
  {
    id: "public-how-it-works",
    kind: "public-route",
    label: "How It Works",
    path: "/how-it-works",
  },
  {
    id: "public-security",
    kind: "public-route",
    label: "Security",
    path: "/security",
  },
  {
    id: "public-privacy",
    kind: "public-route",
    label: "Privacy",
    path: "/privacy",
  },
  { id: "public-terms", kind: "public-route", label: "Terms", path: "/terms" },
  { id: "public-eoi", kind: "public-route", label: "EOI", path: "/eoi" },
  { id: "auth-login", kind: "auth-route", label: "Login", path: "/login" },
];

const gpDashboardRoutes: ScreenTarget[] = [
  {
    id: "dashboard-home",
    kind: "dashboard-route",
    label: "Dashboard",
    path: "/home",
    personaId: "gp",
  },
  {
    id: "dashboard-vesta",
    kind: "dashboard-route",
    label: "Vesta",
    path: "/vesta",
    personaId: "gp",
  },
  {
    id: "dashboard-pipeline",
    kind: "dashboard-route",
    label: "Pipeline",
    path: "/pipeline",
    personaId: "gp",
  },
  {
    id: "dashboard-portfolio",
    kind: "dashboard-route",
    label: "Portfolio",
    path: "/portfolio",
    personaId: "gp",
  },
  {
    id: "dashboard-analytics",
    kind: "dashboard-route",
    label: "Analytics",
    path: "/analytics",
    personaId: "gp",
  },
  {
    id: "dashboard-lp-management",
    kind: "dashboard-route",
    label: "LP Management",
    path: "/lp-management",
    personaId: "gp",
  },
  {
    id: "dashboard-fund-admin",
    kind: "dashboard-route",
    label: "Fund Admin",
    path: "/fund-admin",
    personaId: "gp",
  },
  {
    id: "dashboard-documents",
    kind: "dashboard-route",
    label: "Documents",
    path: "/documents",
    personaId: "gp",
  },
  {
    id: "dashboard-reports",
    kind: "dashboard-route",
    label: "Reports",
    path: "/reports",
    personaId: "gp",
  },
  {
    id: "dashboard-compliance",
    kind: "dashboard-route",
    label: "Compliance",
    path: "/compliance",
    personaId: "gp",
  },
  {
    id: "dashboard-audit-trail",
    kind: "dashboard-route",
    label: "Audit Trail",
    path: "/audit-trail",
    personaId: "gp",
  },
  {
    id: "dashboard-409a-valuations",
    kind: "dashboard-route",
    label: "409A Valuations",
    path: "/409a-valuations",
    personaId: "gp",
  },
  {
    id: "dashboard-integrations",
    kind: "dashboard-route",
    label: "Integrations",
    path: "/integrations",
    personaId: "gp",
  },
  {
    id: "dashboard-collaboration",
    kind: "dashboard-route",
    label: "Collaboration",
    path: "/collaboration",
    personaId: "gp",
  },
  {
    id: "dashboard-settings",
    kind: "dashboard-route",
    label: "Settings",
    path: "/settings",
    personaId: "gp",
  },
  {
    id: "dashboard-tax-center",
    kind: "dashboard-route",
    label: "Tax Center",
    path: "/tax-center",
    personaId: "gp",
  },
  {
    id: "dashboard-waterfall",
    kind: "dashboard-route",
    label: "Waterfall",
    path: "/waterfall",
    personaId: "gp",
  },
  {
    id: "dashboard-ai-tools",
    kind: "dashboard-route",
    label: "AI Tools",
    path: "/ai-tools",
    personaId: "gp",
  },
  {
    id: "dashboard-notifications",
    kind: "dashboard-route",
    label: "Notifications",
    path: "/notifications",
    personaId: "gp",
  },
  {
    id: "dashboard-deal-intelligence",
    kind: "deal-intelligence-fund",
    label: "Deal Intelligence Fund View",
    path: "/deal-intelligence",
    personaId: "gp",
  },
  {
    id: "dashboard-dealflow-review",
    kind: "dashboard-route",
    label: "Dealflow Review",
    path: "/dealflow-review",
    personaId: "gp",
  },
  {
    id: "dashboard-contacts",
    kind: "dashboard-route",
    label: "Contacts",
    path: "/contacts",
    personaId: "gp",
  },
  {
    id: "dashboard-lp-portal",
    kind: "dashboard-route",
    label: "LP Portal",
    path: "/lp-portal",
    personaId: "lp",
  },
];

const personaRoutes: ScreenTarget[] = Object.values(AUDIT_PERSONAS).map(
  (persona) => ({
    id: `persona-${persona.id}`,
    kind: persona.id === "superadmin" ? "admin-route" : "persona-route",
    label: `${persona.label} Default Route`,
    path: persona.defaultPath,
    personaId: persona.id,
  }),
);

const contextualTabs: Array<{
  routeId: string;
  root: string;
  path: string;
  personaId: AuditPersonaId;
  tabs: Array<{ id: string; label: string }>;
}> = [
  {
    routeId: "portfolio",
    root: "Portfolio",
    path: "/portfolio",
    personaId: "gp",
    tabs: [
      { id: "overview", label: "Overview" },
      { id: "updates", label: "Updates" },
      { id: "documents", label: "Documents" },
    ],
  },
  {
    routeId: "analytics",
    root: "Analytics",
    path: "/analytics",
    personaId: "gp",
    tabs: [
      { id: "performance", label: "Performance" },
      { id: "j-curve", label: "J-Curve" },
      { id: "cohort", label: "Cohort Analysis" },
      { id: "valuation", label: "Valuation Trends" },
      { id: "deployment", label: "Deployment" },
      { id: "risk", label: "Risk Analysis" },
    ],
  },
  {
    routeId: "fund-admin",
    root: "Fund Admin",
    path: "/fund-admin",
    personaId: "ops",
    tabs: [
      { id: "fund-setup", label: "Fund Setup" },
      { id: "capital-calls", label: "Capital Calls" },
      { id: "distributions", label: "Distributions" },
      { id: "lp-responses", label: "LP Responses" },
      { id: "nav-calculator", label: "NAV Calculator" },
      { id: "carried-interest", label: "Carried Interest" },
      { id: "expenses", label: "Expenses" },
      { id: "secondary-transfers", label: "Secondary Transfers" },
    ],
  },
  {
    routeId: "lp-management",
    root: "LP Management",
    path: "/lp-management",
    personaId: "gp",
    tabs: [
      { id: "overview", label: "LP Overview" },
      { id: "reports", label: "Reports" },
      { id: "capital", label: "Capital Activity" },
      { id: "performance", label: "Performance" },
    ],
  },
  {
    routeId: "compliance",
    root: "Compliance",
    path: "/compliance",
    personaId: "auditor",
    tabs: [
      { id: "overview", label: "Overview" },
      { id: "filings", label: "Regulatory Filings" },
      { id: "audits", label: "Audit Schedule" },
      { id: "resources", label: "Resources" },
    ],
  },
  {
    routeId: "409a-valuations",
    root: "409A Valuations",
    path: "/409a-valuations",
    personaId: "ops",
    tabs: [
      { id: "valuations", label: "Valuations" },
      { id: "strike-prices", label: "Strike Prices" },
      { id: "history", label: "Valuation History" },
    ],
  },
  {
    routeId: "tax-center",
    root: "Tax Center",
    path: "/tax-center",
    personaId: "ops",
    tabs: [
      { id: "overview", label: "Tax Documents" },
      { id: "k1-generator", label: "K-1 Generator" },
      { id: "fund-summary", label: "Fund Summary" },
      { id: "portfolio", label: "Portfolio Companies" },
      { id: "communications", label: "LP Communications" },
    ],
  },
  {
    routeId: "lp-portal",
    root: "LP Portal",
    path: "/lp-portal",
    personaId: "lp",
    tabs: [
      { id: "reports", label: "Reports" },
      { id: "transactions", label: "Transactions" },
      { id: "distributions", label: "Distributions" },
      { id: "portfolio", label: "Portfolio" },
      { id: "account", label: "Account" },
    ],
  },
  {
    routeId: "collaboration",
    root: "Collaboration",
    path: "/collaboration",
    personaId: "gp",
    tabs: [
      { id: "threads", label: "Threads" },
      { id: "tasks", label: "Tasks" },
    ],
  },
  {
    routeId: "ai-tools",
    root: "AI Tools",
    path: "/ai-tools",
    personaId: "gp",
    tabs: [
      { id: "decision-writer", label: "AI Decision Writer" },
      { id: "pitch-deck-reader", label: "AI Pitch Deck Reader" },
      { id: "dd-assistant", label: "AI Due Diligence Assistant" },
    ],
  },
];

const dealIntelligenceTabs: ScreenTarget[] = [
  "Overview & Status",
  "Deal Analytics",
  "DD Documents",
  "Analysis & Insights",
  "IC Materials",
].map((label) => ({
  id: `deal-intelligence-deal-${label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")}`,
  kind: "deal-intelligence-deal-tab",
  label: `Deal Intelligence - ${label}`,
  path: "/deal-intelligence",
  personaId: "gp",
  contextualRootLabel: "Deal Intelligence",
  tabLabel: label,
}));

const distributionWizardSteps: ScreenTarget[] = [
  "event",
  "fees",
  "waterfall",
  "allocations",
  "tax",
  "advanced",
  "impact",
  "preview",
  "submit",
].map((step) => ({
  id: `distribution-wizard-${step}`,
  kind: "distribution-wizard-step",
  label: `New Distribution - ${step}`,
  path: `/fund-admin/distributions/new?step=${step}`,
  personaId: "ops",
  tabId: step,
}));

export const CONTEXTUAL_TAB_SCREEN_TARGETS: ScreenTarget[] =
  contextualTabs.flatMap((group) =>
    group.tabs.map((tab) => ({
      id: `${group.routeId}-tab-${tab.id}`,
      kind: "contextual-tab",
      label: `${group.root} - ${tab.label}`,
      path: group.path,
      personaId: group.personaId,
      contextualRootLabel: group.root,
      tabLabel: tab.label,
      tabId: tab.id,
    })),
  );

export const SCREEN_TARGETS: ScreenTarget[] = [
  ...publicRoutes,
  ...personaRoutes,
  ...gpDashboardRoutes,
  ...CONTEXTUAL_TAB_SCREEN_TARGETS,
  ...dealIntelligenceTabs,
  {
    id: "distribution-calendar",
    kind: "dashboard-route",
    label: "Distribution Calendar",
    path: "/fund-admin/distributions/calendar",
    personaId: "ops",
  },
  ...distributionWizardSteps,
  {
    id: "distribution-detail-first-seeded",
    kind: "distribution-detail",
    label: "Distribution Detail - First Seeded",
    path: "/fund-admin/distributions/__first__",
    personaId: "ops",
    dynamic: "first-distribution-detail",
  },
];

export type OverlayTargetKind =
  | "shared-shell"
  | "button"
  | "keyboard"
  | "custom"
  | "first-record-detail";

export type OverlayTarget = {
  id: string;
  label: string;
  path: string;
  personaId?: AuditPersonaId;
  kind: OverlayTargetKind;
  tabLabel?: string;
  triggerName?: string;
  routePreparation?: "deal-intelligence-first-deal";
  destructiveConfirmation?: boolean;
  notes?: string;
};

export const OVERLAY_TARGETS: OverlayTarget[] = [
  {
    id: "shell-sidebar-expanded",
    label: "Left Sidebar Expanded",
    path: "/pipeline",
    personaId: "gp",
    kind: "shared-shell",
  },
  {
    id: "shell-sidebar-collapsed",
    label: "Left Sidebar Collapsed",
    path: "/pipeline",
    personaId: "gp",
    kind: "shared-shell",
  },
  {
    id: "shell-vesta-panel",
    label: "Vesta Right Panel",
    path: "/pipeline",
    personaId: "gp",
    kind: "shared-shell",
  },
  {
    id: "shell-vesta-minimized",
    label: "Vesta Minimized Bubble",
    path: "/pipeline",
    personaId: "gp",
    kind: "shared-shell",
  },
  {
    id: "shell-vesta-fullscreen",
    label: "Vesta Fullscreen",
    path: "/pipeline",
    personaId: "gp",
    kind: "shared-shell",
  },
  {
    id: "shell-command-palette",
    label: "Command Palette",
    path: "/pipeline",
    personaId: "gp",
    kind: "keyboard",
  },
  {
    id: "shell-topbar-search-results",
    label: "Topbar Search Results",
    path: "/pipeline",
    personaId: "gp",
    kind: "custom",
  },
  {
    id: "shell-topbar-search-empty",
    label: "Topbar Search Empty",
    path: "/pipeline",
    personaId: "gp",
    kind: "custom",
  },
  {
    id: "shell-notifications-dropdown",
    label: "Notification Dropdown",
    path: "/pipeline",
    personaId: "gp",
    kind: "button",
    triggerName: "Notifications",
  },
  {
    id: "shell-profile-dropdown",
    label: "Profile Dropdown",
    path: "/pipeline",
    personaId: "gp",
    kind: "custom",
  },
  {
    id: "shell-theme-toggle",
    label: "Theme Toggle State",
    path: "/pipeline",
    personaId: "gp",
    kind: "button",
    triggerName: "Toggle theme",
  },
  {
    id: "pipeline-add-deal",
    label: "Pipeline Add Deal Modal",
    path: "/pipeline",
    personaId: "gp",
    kind: "button",
    triggerName: "Add Deal",
  },
  {
    id: "contacts-first-contact",
    label: "Contacts Detail Drawer",
    path: "/contacts",
    personaId: "gp",
    kind: "first-record-detail",
  },
  {
    id: "contacts-drawer-overview",
    label: "Contacts Drawer Overview Tab",
    path: "/contacts",
    personaId: "gp",
    kind: "custom",
  },
  {
    id: "contacts-drawer-timeline",
    label: "Contacts Drawer Timeline Tab",
    path: "/contacts",
    personaId: "gp",
    kind: "custom",
  },
  {
    id: "contacts-drawer-email",
    label: "Contacts Drawer Email Tab",
    path: "/contacts",
    personaId: "gp",
    kind: "custom",
  },
  {
    id: "documents-preview",
    label: "Documents Preview Modal",
    path: "/documents",
    personaId: "gp",
    kind: "custom",
  },
  {
    id: "portfolio-documents-preview",
    label: "Portfolio Document Preview",
    path: "/portfolio",
    personaId: "gp",
    tabLabel: "Documents",
    kind: "custom",
  },
  {
    id: "waterfall-export-preview",
    label: "Waterfall Export Preview",
    path: "/waterfall",
    personaId: "gp",
    kind: "button",
    triggerName: "Export",
  },
  {
    id: "waterfall-custom-tier",
    label: "Waterfall Custom Tier Modal",
    path: "/waterfall",
    personaId: "gp",
    kind: "button",
    triggerName: "Add Tier",
  },
  {
    id: "waterfall-investor-class",
    label: "Waterfall Investor Class Modal",
    path: "/waterfall",
    personaId: "gp",
    kind: "button",
    triggerName: "Add Class",
  },
  {
    id: "fund-setup-form",
    label: "Fund Setup Form Modal",
    path: "/fund-admin",
    personaId: "ops",
    tabLabel: "Fund Setup",
    kind: "button",
    triggerName: "Create Fund",
  },
  {
    id: "fund-close-confirm",
    label: "Fund Close Confirmation Modal",
    path: "/fund-admin",
    personaId: "ops",
    tabLabel: "Fund Setup",
    kind: "button",
    triggerName: "Close Fund",
    destructiveConfirmation: true,
  },
  {
    id: "capital-call-create",
    label: "Capital Call Modal",
    path: "/fund-admin",
    personaId: "ops",
    tabLabel: "Capital Calls",
    kind: "button",
    triggerName: "Create Capital Call",
  },
  {
    id: "distribution-tax-preview",
    label: "Distribution Tax Preview",
    path: "/fund-admin/distributions/new?step=tax",
    personaId: "ops",
    kind: "button",
    triggerName: "Tax form preview",
  },
  {
    id: "distribution-statement-preview",
    label: "Distribution Statement Preview",
    path: "/fund-admin/distributions/new?step=preview",
    personaId: "ops",
    kind: "button",
    triggerName: "Preview Statement",
  },
  {
    id: "tax-document-preview",
    label: "Tax Document Preview",
    path: "/tax-center",
    personaId: "ops",
    tabLabel: "Tax Documents",
    kind: "button",
    triggerName: "Preview",
  },
  {
    id: "tax-config-modal",
    label: "Tax Configuration Modal",
    path: "/tax-center",
    personaId: "ops",
    tabLabel: "Tax Documents",
    kind: "button",
    triggerName: "Configure",
  },
  {
    id: "ai-pitch-deck-preview",
    label: "AI Pitch Deck Preview",
    path: "/ai-tools",
    personaId: "gp",
    tabLabel: "AI Pitch Deck Reader",
    kind: "button",
    triggerName: "Preview",
  },
  {
    id: "ai-dd-document-preview",
    label: "AI DD Assistant Document Preview",
    path: "/ai-tools",
    personaId: "gp",
    tabLabel: "AI Due Diligence Assistant",
    kind: "button",
    triggerName: "Preview",
  },
  {
    id: "lp-statement-preview",
    label: "LP Statement Preview",
    path: "/lp-portal",
    personaId: "lp",
    tabLabel: "Distributions",
    kind: "button",
    triggerName: "Preview",
  },
];
