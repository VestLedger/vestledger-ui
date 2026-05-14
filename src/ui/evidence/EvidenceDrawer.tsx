"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { X } from "lucide-react";

import { CitationList } from "./CitationList";
import { SourceConfidenceBadge } from "./SourceConfidenceBadge";
import type { Confidence, EvidenceCitation } from "./types";

/**
 * EvidenceDrawer — in-grid panel that surfaces the source/evidence behind
 * a single claim (P2-006). Mounts into the P2-002 S5 right rail slot or
 * directly above content; it is NOT a modal-over-page surface (per
 * P2-002 S6 rule "in-grid, not modal").
 *
 * The drawer is intentionally simple: header (claim + confidence),
 * citation list (P2-005 `CitationChip` via `CitationList`), optional
 * snippet preview, optional notes, and a close affordance. Layout
 * decisions (right-rail width, stacking on mobile) belong to the parent
 * shell.
 */
export interface EvidenceDrawerProps {
  /** Whether the drawer is currently visible. */
  isOpen: boolean;
  /** Close handler. Triggered by the close button and ESC. */
  onClose: () => void;
  /**
   * The claim the drawer is opened against (e.g. "Founder previously
   * built and exited a Series B company"). Rendered verbatim in the
   * header.
   */
  claim: string;
  /** Categorical or numeric confidence — same vocabulary as SourceConfidenceBadge. */
  confidence: Confidence | number;
  /** Citations to display. */
  citations: EvidenceCitation[];
  /** Optional inline notes (e.g. reviewer comment, missing-evidence rationale). */
  notes?: ReactNode;
  /** Optional `data-testid`; defaults to `evidence-drawer`. */
  testId?: string;
}

export function EvidenceDrawer({
  isOpen,
  onClose,
  claim,
  confidence,
  citations,
  notes,
  testId = "evidence-drawer",
}: EvidenceDrawerProps) {
  useEffect(() => {
    if (!isOpen) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const hasSnippets = citations.some((c) => Boolean(c.snippet));

  return (
    <aside
      role="dialog"
      aria-modal="false"
      aria-label="Evidence"
      data-testid={testId}
      className="flex flex-col gap-3 rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] p-4 shadow-[var(--app-shadow-1)]"
    >
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wide text-[var(--app-text-subtle)]">
            Evidence
          </p>
          <p
            className="mt-1 text-sm font-medium text-[var(--app-text)]"
            data-testid="evidence-drawer-claim"
          >
            {claim}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close evidence drawer"
          data-testid="evidence-drawer-close"
          className="rounded-md p-1 text-[var(--app-text-muted)] hover:bg-[var(--app-surface-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--app-primary)]"
        >
          <X className="h-4 w-4" />
        </button>
      </header>

      <div>
        <SourceConfidenceBadge
          confidence={confidence}
          testId="evidence-drawer-confidence"
        />
      </div>

      <div>
        <p className="mb-1 text-xs uppercase tracking-wide text-[var(--app-text-subtle)]">
          Sources
        </p>
        <CitationList
          citations={citations}
          variant="stacked"
          testId="evidence-drawer-citations"
        />
      </div>

      {hasSnippets && (
        <div data-testid="evidence-drawer-snippets">
          <p className="mb-1 text-xs uppercase tracking-wide text-[var(--app-text-subtle)]">
            Snippets
          </p>
          <ul className="flex flex-col gap-2">
            {citations
              .filter((c) => Boolean(c.snippet))
              .map((c) => (
                <li
                  key={`${c.id}-snippet`}
                  className="rounded-md border border-[var(--app-border)] bg-[var(--app-surface-hover)] p-2 text-xs text-[var(--app-text-muted)]"
                  data-testid={`evidence-drawer-snippet-${c.id}`}
                >
                  <p className="font-medium text-[var(--app-text)]">
                    {c.source}
                  </p>
                  <p className="mt-1">{c.snippet}</p>
                </li>
              ))}
          </ul>
        </div>
      )}

      {notes && (
        <div
          className="text-xs text-[var(--app-text-muted)]"
          data-testid="evidence-drawer-notes"
        >
          {notes}
        </div>
      )}
    </aside>
  );
}
