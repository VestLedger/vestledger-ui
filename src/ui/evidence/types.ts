/**
 * Evidence / citation primitives (P2-006).
 *
 * The shapes below pin a single vocabulary every claim-bearing surface
 * uses — scorecards, memo claims, valuation metrics, AI answers, portfolio
 * health signals — so future API integration (P3-018) does not need to
 * renegotiate per-screen models.
 */

/**
 * A source / evidence record attached to a claim.
 *
 * Either `href` or `onOpen` should be supplied. When neither is supplied
 * the citation renders as a static label — useful for surfacing an
 * explicit "not applicable" evidence state per P0-009 DTVL-07.
 */
export interface EvidenceCitation {
  /** Stable ID for keying and selection. */
  id: string;
  /** Source label (e.g. "NAV ledger", "Doc: Q3 PCAP §3", "Crunchbase"). */
  source: string;
  /** Optional URL to open the source in a new tab or detail panel. */
  href?: string;
  /** Optional click handler when the source is opened in-app. */
  onOpen?: () => void;
  /** Optional confidence label / score for this individual citation. */
  confidence?: string;
  /** Optional freshness stamp (e.g. "Updated 2h ago"). */
  freshness?: string;
  /** Optional quoted snippet shown in the EvidenceDrawer. */
  snippet?: string;
  /**
   * Explicit "no source applies" marker (e.g. manual entry, expert opinion).
   * When `true`, the chip renders the not-applicable variant.
   */
  notApplicable?: boolean;
}

/**
 * Confidence buckets used by `SourceConfidenceBadge` (P2-006).
 *
 * `none` is reserved for claims that have no usable evidence at all — it
 * renders the `Missing evidence` treatment per P0-009 DTVL-08 so users do
 * not mistake an unsupported claim for a confident one.
 */
export type Confidence = "high" | "medium" | "low" | "none";

export interface ConfidenceDescriptor {
  label: string;
  tone: "success" | "info" | "warning" | "danger" | "muted";
  description: string;
}

export const CONFIDENCE_DESCRIPTORS: Record<Confidence, ConfidenceDescriptor> =
  {
    high: {
      label: "High confidence",
      tone: "success",
      description: "Multiple corroborating sources or first-party data.",
    },
    medium: {
      label: "Medium confidence",
      tone: "info",
      description: "At least one corroborating source.",
    },
    low: {
      label: "Low confidence",
      tone: "warning",
      description: "Limited corroboration; verify before relying.",
    },
    none: {
      label: "Missing evidence",
      tone: "danger",
      description: "No source is attached. Treat as unverified.",
    },
  };

/**
 * Maps a numeric confidence score in [0, 1] to a confidence bucket. Centralized
 * so every component (`SourceConfidenceBadge`, `ClaimWithSources`,
 * `EvidenceDrawer`) bucketizes identically.
 *
 * Defaults:
 *   • ≥ 0.75 → high
 *   • ≥ 0.5  → medium
 *   • > 0    → low
 *   • ≤ 0 or NaN → none
 */
export function bucketConfidence(score: number | undefined): Confidence {
  if (typeof score !== "number" || !Number.isFinite(score) || score <= 0) {
    return "none";
  }
  if (score >= 0.75) return "high";
  if (score >= 0.5) return "medium";
  return "low";
}
