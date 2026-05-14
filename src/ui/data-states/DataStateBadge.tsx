"use client";

import { DATA_STATE_DESCRIPTORS, TONE_TO_CLASS, type DataState } from "./types";

/**
 * DataStateBadge — single source of truth for the eight P0-009 data states
 * rendered as a compact chip near a row, metric, or claim (P2-005).
 *
 * Components MUST use this badge instead of ad-hoc `Badge color="success"`
 * styling for data state per P2-001 T21/T22 (badge vocabulary discipline).
 */
export interface DataStateBadgeProps {
  state: DataState;
  /** Optional override label (e.g. "Live · 12s ago"). Defaults to the canonical descriptor. */
  label?: string;
  /** Optional override tooltip. Defaults to the canonical description. */
  title?: string;
  /** Size variant. Defaults to `sm`. */
  size?: "sm" | "md";
  /** Optional `data-testid` for tests. Defaults to `data-state-badge`. */
  testId?: string;
  className?: string;
}

const SIZE_CLASS: Record<NonNullable<DataStateBadgeProps["size"]>, string> = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-1 text-sm",
};

export function DataStateBadge({
  state,
  label,
  title,
  size = "sm",
  testId = "data-state-badge",
  className = "",
}: DataStateBadgeProps) {
  const descriptor = DATA_STATE_DESCRIPTORS[state];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md font-medium ${SIZE_CLASS[size]} ${TONE_TO_CLASS[descriptor.tone]} ${className}`.trim()}
      title={title ?? descriptor.description}
      data-testid={testId}
      data-state={state}
      data-tone={descriptor.tone}
    >
      {label ?? descriptor.label}
    </span>
  );
}
