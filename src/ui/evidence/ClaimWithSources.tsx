"use client";

import { useState, type ReactNode } from "react";

import { CitationList } from "./CitationList";
import { EvidenceDrawer } from "./EvidenceDrawer";
import { SourceConfidenceBadge } from "./SourceConfidenceBadge";
import type { Confidence, EvidenceCitation } from "./types";

/**
 * ClaimWithSources — composite that renders a single inspectable claim
 * (score, metric, memo line, AI answer) alongside its confidence and
 * inline citations, with an "Open evidence" affordance that mounts an
 * `EvidenceDrawer` (P2-006).
 *
 * The drawer can be driven by the parent (controlled `drawerOpen` /
 * `onDrawerOpenChange`) or left to manage its own state (uncontrolled,
 * the default).
 */
export interface ClaimWithSourcesProps {
  /** The claim text or React node (e.g. a score line, a sentence). */
  claim: ReactNode;
  /** Optional plain-text version of the claim used for the drawer header. */
  claimText?: string;
  /** Confidence band or numeric score. */
  confidence: Confidence | number;
  /** Citations attached to this claim. */
  citations: EvidenceCitation[];
  /** When true, suppresses the inline citation chips (drawer-only). */
  hideInlineCitations?: boolean;
  /** Override the inspect-trigger label. Defaults to "Open evidence". */
  inspectLabel?: string;
  /** Controlled drawer open state. */
  drawerOpen?: boolean;
  /** Called whenever the drawer open state changes (controlled or uncontrolled). */
  onDrawerOpenChange?: (open: boolean) => void;
  /**
   * Optional notes rendered inside the drawer (e.g. reviewer comment,
   * missing-evidence rationale, AI-approval signature).
   */
  drawerNotes?: ReactNode;
  /** Optional `data-testid`; defaults to `claim-with-sources`. */
  testId?: string;
}

function nodeToText(node: ReactNode): string {
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  return "";
}

export function ClaimWithSources({
  claim,
  claimText,
  confidence,
  citations,
  hideInlineCitations,
  inspectLabel = "Open evidence",
  drawerOpen,
  onDrawerOpenChange,
  drawerNotes,
  testId = "claim-with-sources",
}: ClaimWithSourcesProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = typeof drawerOpen === "boolean";
  const open = isControlled ? drawerOpen : internalOpen;

  const setOpen = (next: boolean) => {
    if (!isControlled) setInternalOpen(next);
    onDrawerOpenChange?.(next);
  };

  const resolvedClaimText = claimText ?? nodeToText(claim);

  return (
    <div className="flex flex-col gap-2" data-testid={testId}>
      <div className="flex flex-wrap items-center gap-2">
        <span
          className="text-sm text-[var(--app-text)]"
          data-testid={`${testId}-claim`}
        >
          {claim}
        </span>
        <SourceConfidenceBadge
          confidence={confidence}
          testId={`${testId}-confidence`}
        />
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="text-xs font-medium text-[var(--app-primary)] hover:underline focus:outline-none focus:ring-2 focus:ring-[var(--app-primary)] rounded-sm"
          data-testid={`${testId}-inspect`}
        >
          {inspectLabel}
        </button>
      </div>

      {!hideInlineCitations && (
        <CitationList
          citations={citations}
          variant="inline"
          testId={`${testId}-inline-citations`}
        />
      )}

      <EvidenceDrawer
        isOpen={open}
        onClose={() => setOpen(false)}
        claim={resolvedClaimText}
        confidence={confidence}
        citations={citations}
        notes={drawerNotes}
        testId={`${testId}-drawer`}
      />
    </div>
  );
}
