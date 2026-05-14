"use client";

import { CheckCircle, AlertTriangle, Loader2, RefreshCw } from "lucide-react";

/**
 * SyncStateIndicator — compact icon-plus-label affordance that names the
 * sync state of a connector / background job (P0-009 DTVL-01/DTVL-04/DTVL-05).
 *
 * States:
 *   • `live`     — connector healthy, last sync within freshness policy.
 *   • `syncing`  — sync currently running.
 *   • `stale`    — connector last sync exceeded the policy window.
 *   • `error`    — connector failed.
 *   • `idle`     — connector configured but not yet run.
 */
export type SyncState = "live" | "syncing" | "stale" | "error" | "idle";

export interface SyncStateIndicatorProps {
  state: SyncState;
  /** Optional explicit label override. */
  label?: string;
  /** Optional `data-testid`; defaults to `sync-state-indicator`. */
  testId?: string;
}

const CONFIG: Record<
  SyncState,
  { label: string; tone: string; Icon: typeof CheckCircle; spin?: boolean }
> = {
  live: {
    label: "Live",
    tone: "text-[var(--app-success)]",
    Icon: CheckCircle,
  },
  syncing: {
    label: "Syncing",
    tone: "text-[var(--app-info)]",
    Icon: Loader2,
    spin: true,
  },
  stale: {
    label: "Stale",
    tone: "text-[var(--app-warning)]",
    Icon: RefreshCw,
  },
  error: {
    label: "Error",
    tone: "text-[var(--app-danger)]",
    Icon: AlertTriangle,
  },
  idle: {
    label: "Idle",
    tone: "text-[var(--app-text-muted)]",
    Icon: RefreshCw,
  },
};

export function SyncStateIndicator({
  state,
  label,
  testId = "sync-state-indicator",
}: SyncStateIndicatorProps) {
  const cfg = CONFIG[state];
  const Icon = cfg.Icon;
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium ${cfg.tone}`}
      data-testid={testId}
      data-state={state}
    >
      <Icon
        className={`h-3.5 w-3.5 ${cfg.spin ? "animate-spin" : ""}`}
        aria-hidden
      />
      {label ?? cfg.label}
    </span>
  );
}
