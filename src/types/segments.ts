export const SEGMENT_KEYS = [
  "angel_syndicate",
  "micro_vc",
  "family_office",
  "private_equity",
] as const;

export type SegmentKey = (typeof SEGMENT_KEYS)[number];

export const DEFAULT_SEGMENT_KEY: SegmentKey = "micro_vc";

export type ModuleProminence = "high" | "medium" | "low_medium" | "low";

export type SegmentModuleId =
  | "dashboard"
  | "portfolio"
  | "deals"
  | "funds"
  | "lps"
  | "signals"
  | "reports"
  | "documents"
  | "workflows"
  | "settings"
  | "vesta";

export type DemoDataTier = "rich" | "standard" | "minimal" | "stub";

export type DashboardBlockVisibility = "default" | "conditional" | "collapsed";

const SEGMENT_ALIASES: Record<string, SegmentKey> = {
  angel: "angel_syndicate",
  angels: "angel_syndicate",
  angel_syndicate: "angel_syndicate",
  angel_syndicates: "angel_syndicate",
  angel_syndicate_lead: "angel_syndicate",
  "angel-syndicate": "angel_syndicate",
  "angel / syndicate": "angel_syndicate",
  syndicate: "angel_syndicate",
  micro_vc: "micro_vc",
  "micro-vc": "micro_vc",
  microvc: "micro_vc",
  "micro vc": "micro_vc",
  vc: "micro_vc",
  family_office: "family_office",
  "family-office": "family_office",
  "family office": "family_office",
  fo: "family_office",
  private_equity: "private_equity",
  "private-equity": "private_equity",
  "private equity": "private_equity",
  pe: "private_equity",
};

export function isSegmentKey(value: string): value is SegmentKey {
  return SEGMENT_KEYS.includes(value as SegmentKey);
}

export function normalizeSegmentKey(value: unknown): SegmentKey | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim().toLowerCase().replace(/\s+/g, " ");
  if (!normalized) {
    return null;
  }

  const underscoreKey = normalized.replace(/[-\s/]+/g, "_");
  if (isSegmentKey(underscoreKey)) {
    return underscoreKey;
  }

  return SEGMENT_ALIASES[normalized] ?? SEGMENT_ALIASES[underscoreKey] ?? null;
}
