"use client";

import { CitationChip } from "@/ui/data-states";
import type { EvidenceCitation } from "./types";

/**
 * CitationList — renders the citations attached to a claim (P2-006).
 *
 * Backed by the P2-005 `CitationChip` primitive so the visual treatment
 * matches every other source-bearing surface (UX-07). When the list is
 * empty, renders a single muted "No sources attached" notice so users do
 * not mistake an unsupported claim for a confident one.
 */
export interface CitationListProps {
  citations: EvidenceCitation[];
  /** Optional override for the empty-state message. */
  emptyMessage?: string;
  /** Optional `data-testid`; defaults to `citation-list`. */
  testId?: string;
  /** Visual layout. Defaults to `inline` (wraps). */
  variant?: "inline" | "stacked";
}

export function CitationList({
  citations,
  emptyMessage = "No sources attached",
  testId = "citation-list",
  variant = "inline",
}: CitationListProps) {
  if (citations.length === 0) {
    return (
      <p
        className="text-xs text-[var(--app-text-muted)]"
        data-testid={testId}
        data-state="empty"
      >
        {emptyMessage}
      </p>
    );
  }

  return (
    <ul
      className={
        variant === "stacked"
          ? "flex flex-col gap-1.5"
          : "flex flex-wrap items-center gap-1.5"
      }
      data-testid={testId}
      data-count={citations.length}
    >
      {citations.map((c) => (
        <li key={c.id}>
          <CitationChip
            source={c.source}
            href={c.href}
            onOpen={c.onOpen}
            confidence={c.confidence}
            freshness={c.freshness}
            notApplicable={c.notApplicable}
            testId={`citation-${c.id}`}
          />
        </li>
      ))}
    </ul>
  );
}
