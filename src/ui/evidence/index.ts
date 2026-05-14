/**
 * Evidence and citation UI primitives (P2-006).
 *
 * Use this barrel for every claim-bearing surface:
 *
 *   • SourceConfidenceBadge — render the confidence of a claim or score.
 *   • CitationList          — list of citations (anchor / button / static).
 *   • EvidenceDrawer        — in-grid panel that surfaces sources behind a claim.
 *   • ClaimWithSources      — composite that wires claim + confidence + drawer.
 *
 * All primitives accept the shared `EvidenceCitation` and `Confidence`
 * vocabulary defined in `./types`, so future API integration (P3-018) does
 * not need per-surface adapters.
 */

export { SourceConfidenceBadge } from "./SourceConfidenceBadge";
export type { SourceConfidenceBadgeProps } from "./SourceConfidenceBadge";

export { CitationList } from "./CitationList";
export type { CitationListProps } from "./CitationList";

export { EvidenceDrawer } from "./EvidenceDrawer";
export type { EvidenceDrawerProps } from "./EvidenceDrawer";

export { ClaimWithSources } from "./ClaimWithSources";
export type { ClaimWithSourcesProps } from "./ClaimWithSources";

export {
  bucketConfidence,
  CONFIDENCE_DESCRIPTORS,
  type Confidence,
  type ConfidenceDescriptor,
  type EvidenceCitation,
} from "./types";

export { SAMPLE_SCORECARD_CLAIM, type ScorecardClaimFixture } from "./fixtures";
