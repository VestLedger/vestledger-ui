"use client";

import type { ReactNode } from "react";
import { AlertCircle } from "lucide-react";

import type { DataModeUnavailableReason } from "@/config/data-mode";
import { UNAVAILABLE_REASON_MESSAGE } from "./types";

/**
 * UnavailableState — replaces a data slot (table, panel, drawer field) when
 * a feature is intentionally unavailable. Surfaces:
 *
 *   • the typed reason from the no-silent-mock guard (P1-003), and
 *   • the friendly human message + optional next-step affordance.
 *
 * Use in place of bespoke "feature coming soon" copy.
 */
export interface UnavailableStateProps {
  /** Canonical reason from the no-silent-mock guard. */
  reason: DataModeUnavailableReason;
  /** Optional explicit headline. Defaults to "Not available". */
  title?: string;
  /**
   * Override the friendly message. Defaults to the canonical mapping in
   * `UNAVAILABLE_REASON_MESSAGE`.
   */
  message?: string;
  /** Optional action (e.g. "Connect data source") rendered below the message. */
  action?: ReactNode;
  /** Optional correlation id (P1-015) for support tickets. */
  correlationId?: string;
  /** Optional `data-testid`; defaults to `unavailable-state`. */
  testId?: string;
}

export function UnavailableState({
  reason,
  title = "Not available",
  message,
  action,
  correlationId,
  testId = "unavailable-state",
}: UnavailableStateProps) {
  const friendly = message ?? UNAVAILABLE_REASON_MESSAGE[reason];
  return (
    <div
      role="status"
      className="flex flex-col items-start gap-2 rounded-md border border-[var(--app-border)] bg-[var(--app-surface-hover)] p-4 text-[var(--app-text-muted)]"
      data-testid={testId}
      data-reason={reason}
    >
      <div className="flex items-center gap-2 text-[var(--app-text)]">
        <AlertCircle className="h-4 w-4 text-[var(--app-text-muted)]" />
        <p className="text-sm font-medium">{title}</p>
      </div>
      <p className="text-sm">{friendly}</p>
      {action && <div className="mt-1">{action}</div>}
      {correlationId && (
        <p className="text-xs text-[var(--app-text-subtle)]">
          Correlation ID: <code>{correlationId}</code>
        </p>
      )}
    </div>
  );
}
