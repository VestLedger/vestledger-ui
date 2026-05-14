"use client";

import type { ReactNode } from "react";
import { Clock } from "lucide-react";

import { formatDateTime } from "@/utils/formatting";

/**
 * StaleDataNotice — inline banner shown above an S4 content slot when the
 * underlying data has not refreshed within the freshness policy window
 * (P0-009 DTVL-05).
 *
 * Renders a compact warning-toned strip that names the last successful
 * sync timestamp and optionally exposes a refresh affordance.
 */
export interface StaleDataNoticeProps {
  /** Last successful sync timestamp. */
  lastUpdated: Date | string;
  /** Optional explicit explanation (e.g. "NAV data older than policy window"). */
  message?: string;
  /** Refresh affordance (e.g. a button). */
  action?: ReactNode;
  /** Optional `data-testid`; defaults to `stale-data-notice`. */
  testId?: string;
}

export function StaleDataNotice({
  lastUpdated,
  message,
  action,
  testId = "stale-data-notice",
}: StaleDataNoticeProps) {
  let stamp: string;
  try {
    stamp = formatDateTime(lastUpdated);
  } catch {
    stamp = String(lastUpdated);
  }
  return (
    <div
      role="status"
      className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-[var(--app-warning-bg)] bg-[var(--app-warning-bg)] px-3 py-2 text-sm text-[var(--app-warning)]"
      data-testid={testId}
      data-state="stale"
    >
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4" />
        <span className="font-medium">Stale data</span>
        <span className="text-[var(--app-text-muted)]">
          Last updated {stamp}
          {message ? ` — ${message}` : ""}
        </span>
      </div>
      {action}
    </div>
  );
}
