"use client";

import type { ReactNode } from "react";
import { ShieldCheck, AlertTriangle } from "lucide-react";

import { KeyValueRow } from "@/ui/composites/KeyValueRow";

/**
 * ReviewPanel — mandatory penultimate wizard step per the P2-010 spec.
 *
 * Surfaces every value about to be committed, any warnings, the policy that
 * will be invoked, and the audit-event name that will be written. Consumers
 * supply sections (one per wizard step) so the review groups mirror the
 * stepper labels — the spec calls this out explicitly to keep reviews from
 * becoming a wall of text.
 */
export interface ReviewPanelRow {
  label: ReactNode;
  value: ReactNode;
  /** When true, surfaces the row with a warning tone (e.g., out-of-range value). */
  warning?: boolean;
}

export interface ReviewPanelSection {
  /** Section label (typically the wizard step label). */
  label: ReactNode;
  rows: ReviewPanelRow[];
}

export interface ReviewPanelProps {
  /** Sections corresponding to each wizard step. */
  sections: ReviewPanelSection[];
  /** Warnings derived from the wizard values + context. */
  warnings?: ReactNode[];
  /**
   * Audit-event name that will be recorded on submit. The spec requires the
   * review step to surface this so the user sees what will be logged.
   */
  auditEvent?: string;
  /** Policy / permission name that gates submission. */
  policy?: string;
  className?: string;
  testId?: string;
}

export function ReviewPanel({
  sections,
  warnings,
  auditEvent,
  policy,
  className,
  testId = "review-panel",
}: ReviewPanelProps) {
  const hasWarnings = warnings && warnings.length > 0;
  return (
    <section
      className={[
        "flex flex-col gap-5 rounded-md border border-[var(--app-border)] bg-[var(--app-surface)] p-5",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
      data-testid={testId}
      aria-label="Review before submit"
    >
      {hasWarnings && (
        <div
          role="status"
          className="flex flex-col gap-2 rounded-md border border-[var(--app-warning-bg)] bg-[var(--app-warning-bg)] px-3 py-2 text-sm text-[var(--app-warning)]"
          data-testid={`${testId}-warnings`}
        >
          <div className="flex items-center gap-2 font-medium">
            <AlertTriangle className="h-4 w-4" aria-hidden="true" />
            <span>Warnings</span>
          </div>
          <ul className="ml-6 list-disc space-y-1 text-[var(--app-text)]">
            {warnings!.map((warning, i) => (
              <li key={i} className="text-xs">
                {warning}
              </li>
            ))}
          </ul>
        </div>
      )}

      {sections.map((section, sectionIndex) => (
        <div
          key={sectionIndex}
          className="flex flex-col gap-1"
          data-testid={`${testId}-section`}
        >
          <h4 className="text-sm font-semibold text-[var(--app-text)]">
            {section.label}
          </h4>
          <div className="divide-y divide-[var(--app-border)]">
            {section.rows.map((row, rowIndex) => (
              <KeyValueRow
                key={rowIndex}
                label={row.label}
                value={row.value}
                valueClassName={
                  row.warning
                    ? "text-[var(--app-warning)] font-medium"
                    : undefined
                }
                paddingYClassName="py-1.5"
              />
            ))}
          </div>
        </div>
      ))}

      {(auditEvent || policy) && (
        <footer
          className="flex flex-wrap items-center gap-3 border-t border-[var(--app-border)] pt-3 text-xs text-[var(--app-text-muted)]"
          data-testid={`${testId}-footer`}
        >
          <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
          {policy && (
            <span>
              Policy: <code className="font-mono">{policy}</code>
            </span>
          )}
          {auditEvent && (
            <span>
              Audit event: <code className="font-mono">{auditEvent}</code>
            </span>
          )}
        </footer>
      )}
    </section>
  );
}
