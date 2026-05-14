"use client";

import { BookOpen } from "lucide-react";

/**
 * CitationChip — compact chip that surfaces the source/evidence behind a
 * claim, score, metric, or AI-generated text (UX-07, P0-009 DTVL-07/DTVL-08).
 *
 * Either rendered as a link (when `href` is supplied) or a button (when
 * `onOpen` is supplied). When neither is supplied the chip falls back to a
 * static label — useful for surfacing an explicit "not_applicable" evidence
 * state where there is no source to open.
 *
 * Confidence and freshness are optional inline metadata; both render only
 * when supplied.
 */
export interface CitationChipProps {
  /** Source label (e.g. "NAV ledger", "Doc: Q3 PCAP", "Crunchbase"). */
  source: string;
  /** Optional source URL. When supplied the chip is rendered as an anchor. */
  href?: string;
  /** Optional click handler. When supplied (and no `href`) renders as a button. */
  onOpen?: () => void;
  /** Optional confidence label (e.g. "high", "0.84"). */
  confidence?: string;
  /** Optional freshness stamp (e.g. "Updated 2h ago"). */
  freshness?: string;
  /**
   * Optional explicit "no source applies" state. When `true`, renders a
   * muted "not applicable" chip instead of a link/button — keeps the claim
   * visibly attached to its evidence rule per P0-009 DTVL-07.
   */
  notApplicable?: boolean;
  /** Optional `data-testid`; defaults to `citation-chip`. */
  testId?: string;
}

const BASE_CLASS =
  "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-xs font-medium";

export function CitationChip({
  source,
  href,
  onOpen,
  confidence,
  freshness,
  notApplicable,
  testId = "citation-chip",
}: CitationChipProps) {
  const body = (
    <>
      <BookOpen className="h-3 w-3" aria-hidden />
      <span>{source}</span>
      {confidence && (
        <span className="text-[var(--app-text-subtle)]">· {confidence}</span>
      )}
      {freshness && (
        <span className="text-[var(--app-text-subtle)]">· {freshness}</span>
      )}
    </>
  );

  if (notApplicable) {
    return (
      <span
        className={`${BASE_CLASS} border-[var(--app-border)] bg-[var(--app-surface-hover)] text-[var(--app-text-muted)]`}
        data-testid={testId}
        data-state="not_applicable"
        title="No source applies to this claim."
      >
        <BookOpen className="h-3 w-3" aria-hidden />
        <span>{source} · not applicable</span>
      </span>
    );
  }

  const interactiveClass = `${BASE_CLASS} border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-text)] hover:border-[var(--app-primary)] hover:text-[var(--app-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--app-primary)]`;

  if (href) {
    return (
      <a
        href={href}
        className={interactiveClass}
        data-testid={testId}
        data-state="citation_link"
      >
        {body}
      </a>
    );
  }
  if (onOpen) {
    return (
      <button
        type="button"
        onClick={onOpen}
        className={interactiveClass}
        data-testid={testId}
        data-state="citation_button"
      >
        {body}
      </button>
    );
  }
  return (
    <span
      className={`${BASE_CLASS} border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-text-muted)]`}
      data-testid={testId}
      data-state="citation_static"
    >
      {body}
    </span>
  );
}
