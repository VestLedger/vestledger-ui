/**
 * Data state component library (P2-005).
 *
 * Centralizes every visual contract for the P0-009 data-truth taxonomy
 * (Live, Demo, Unavailable, Syncing, Stale, Needs review, AI draft, Approved)
 * plus the citation surface required by UX-07.
 *
 * Components MUST be used instead of bespoke inline placeholders:
 *
 *   • DataStateBadge       — chip next to a row / metric / claim.
 *   • EmptyState           — "no rows yet" placeholder (re-exported from async-states).
 *   • UnavailableState     — typed "not implemented / no permission" block.
 *   • StaleDataNotice      — banner above a content slot when freshness lapsed.
 *   • SyncStateIndicator   — connector/job sync icon-plus-label.
 *   • CitationChip         — source/evidence chip near a claim.
 */

export { DataStateBadge } from "./DataStateBadge";
export type { DataStateBadgeProps } from "./DataStateBadge";

export { UnavailableState } from "./UnavailableState";
export type { UnavailableStateProps } from "./UnavailableState";

export { StaleDataNotice } from "./StaleDataNotice";
export type { StaleDataNoticeProps } from "./StaleDataNotice";

export { SyncStateIndicator } from "./SyncStateIndicator";
export type { SyncStateIndicatorProps, SyncState } from "./SyncStateIndicator";

export { CitationChip } from "./CitationChip";
export type { CitationChipProps } from "./CitationChip";

// EmptyState already lives in async-states; re-export so consumers have a
// single import path for the P2-005 truth-state vocabulary.
export { EmptyState } from "@/ui/async-states/EmptyState";

export {
  DATA_STATE_DESCRIPTORS,
  TONE_TO_CLASS,
  UNAVAILABLE_REASON_MESSAGE,
  type DataState,
  type DataStateDescriptor,
  type DataStateTone,
} from "./types";
