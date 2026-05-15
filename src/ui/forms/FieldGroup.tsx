"use client";

import type { ReactNode } from "react";

/**
 * FieldGroup — labels a cluster of related form fields per the P2-010 spec.
 *
 * The spec caps forms at ≤ 12 visible fields and ≤ 3 groups; this primitive
 * gives every form a consistent group header so consumers do not invent
 * bespoke section dividers or nested cards.
 */
export interface FieldGroupProps {
  /** Group label (e.g., "Banking details"). */
  label: ReactNode;
  /** Optional supporting copy explaining the group. */
  description?: ReactNode;
  /** Optional `(optional)`-style suffix or chip rendered next to the label. */
  badge?: ReactNode;
  /** Field controls (Input/Select/etc.). */
  children: ReactNode;
  /**
   * When true, suppresses the bottom divider. Defaults to false — the spec
   * requires section dividers via `border-b`, no nested cards.
   */
  hideDivider?: boolean;
  className?: string;
  testId?: string;
}

export function FieldGroup({
  label,
  description,
  badge,
  children,
  hideDivider = false,
  className,
  testId = "field-group",
}: FieldGroupProps) {
  return (
    <section
      className={[
        "flex flex-col gap-3 pb-5",
        hideDivider ? "" : "border-b border-[var(--app-border)]",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
      data-testid={testId}
    >
      <header className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-semibold text-[var(--app-text)]">
            {label}
          </h4>
          {badge}
        </div>
        {description && (
          <p className="text-xs text-[var(--app-text-muted)]">{description}</p>
        )}
      </header>
      <div className="flex flex-col gap-3">{children}</div>
    </section>
  );
}
