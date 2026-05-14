import type { DataModeUnavailableReason } from "@/config/data-mode";

/**
 * Data state vocabulary for the P2-005 component library.
 *
 * The eight canonical states from `data-truth-visual-language-p0-009.csv`
 * (DTVL-01..DTVL-08). Components in this library accept this type so
 * call-sites cannot drift into bespoke vocabulary.
 */
export type DataState =
  | "live"
  | "demo"
  | "unavailable"
  | "syncing"
  | "stale"
  | "needs_review"
  | "ai_generated"
  | "human_approved";

export type DataStateTone =
  | "success"
  | "info"
  | "warning"
  | "danger"
  | "muted"
  | "primary";

export interface DataStateDescriptor {
  /** Compact, capitalized label shown in the badge / chip. */
  label: string;
  /** Semantic tone for color treatment (see P2-001 token decisions). */
  tone: DataStateTone;
  /** Human-readable description for the tooltip / aria-label. */
  description: string;
}

/**
 * Canonical descriptors for every supported state. Keeping the table in a
 * single place ensures every component (`DataStateBadge`, `SyncStateIndicator`,
 * `UnavailableState`, etc.) renders the same label / tone for the same state.
 */
export const DATA_STATE_DESCRIPTORS: Record<DataState, DataStateDescriptor> = {
  live: {
    label: "Live",
    tone: "success",
    description: "Production-backed and current.",
  },
  demo: {
    label: "Demo",
    tone: "warning",
    description: "Demo / seed / mock data. Not suitable for production work.",
  },
  unavailable: {
    label: "Unavailable",
    tone: "muted",
    description: "This feature is not available in the current environment.",
  },
  syncing: {
    label: "Syncing",
    tone: "info",
    description: "Background sync in progress.",
  },
  stale: {
    label: "Stale",
    tone: "warning",
    description: "Data has not refreshed within the freshness policy window.",
  },
  needs_review: {
    label: "Needs review",
    tone: "warning",
    description: "Pending human review before action.",
  },
  ai_generated: {
    label: "AI draft",
    tone: "primary",
    description: "Drafted by AI. Requires citation review or approval.",
  },
  human_approved: {
    label: "Approved",
    tone: "success",
    description: "Reviewed and approved by a human.",
  },
};

export const TONE_TO_CLASS: Record<DataStateTone, string> = {
  success:
    "bg-[var(--app-success-bg)] text-[var(--app-success)] border border-[var(--app-success-bg)]",
  info: "bg-[var(--app-info-bg)] text-[var(--app-info)] border border-[var(--app-info-bg)]",
  warning:
    "bg-[var(--app-warning-bg)] text-[var(--app-warning)] border border-[var(--app-warning-bg)]",
  danger:
    "bg-[var(--app-danger-bg)] text-[var(--app-danger)] border border-[var(--app-danger-bg)]",
  muted:
    "bg-[var(--app-surface-hover)] text-[var(--app-text-muted)] border border-[var(--app-border)]",
  primary:
    "bg-[var(--app-primary-bg)] text-[var(--app-primary)] border border-[var(--app-primary-bg)]",
};

/**
 * Maps a `DataModeUnavailableReason` (the wire-level reason from the
 * `no-silent-mock` guard in P1-003) to a friendly human-readable message that
 * the `UnavailableState` component can render to end users.
 */
export const UNAVAILABLE_REASON_MESSAGE: Record<
  DataModeUnavailableReason,
  string
> = {
  demo_only_feature: "This feature is only available in demo mode.",
  api_only_feature:
    "This feature is only available against the live API and is not implemented in demo mode.",
  mock_fallback_blocked:
    "Mock fallback is not allowed here. Connect the live API to continue.",
  backend_not_implemented:
    "Backend support for this workflow is not yet implemented.",
  provider_unavailable:
    "The required provider is not available in this environment.",
  connector_missing: "Required connector is not configured.",
  no_artifact: "No downloadable artifact is available for this record.",
  no_permission: "You do not have permission to view this data.",
  source_unavailable: "The source for this data is currently unreachable.",
};
