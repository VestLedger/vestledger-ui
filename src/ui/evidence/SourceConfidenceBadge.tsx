"use client";

import { ShieldCheck, ShieldAlert, Shield, ShieldOff } from "lucide-react";

import { TONE_TO_CLASS } from "@/ui/data-states/types";
import {
  CONFIDENCE_DESCRIPTORS,
  bucketConfidence,
  type Confidence,
} from "./types";

/**
 * SourceConfidenceBadge — renders the canonical confidence treatment
 * (P0-009 DTVL-07/DTVL-08) for a claim or score.
 *
 * Accepts either a categorical bucket (`'high' | 'medium' | 'low' | 'none'`)
 * or a numeric score in [0, 1]. Numeric inputs use `bucketConfidence` so
 * the entire app surfaces the same band at the same threshold.
 */
export interface SourceConfidenceBadgeProps {
  /** Categorical bucket or numeric score in [0, 1]. */
  confidence: Confidence | number;
  /** Optional override label (e.g. "0.84 · 3 sources"). */
  label?: string;
  /** Size variant. Defaults to `sm`. */
  size?: "sm" | "md";
  /** Optional `data-testid`; defaults to `source-confidence-badge`. */
  testId?: string;
}

const ICON: Record<Confidence, typeof ShieldCheck> = {
  high: ShieldCheck,
  medium: Shield,
  low: ShieldAlert,
  none: ShieldOff,
};

const SIZE_CLASS: Record<
  NonNullable<SourceConfidenceBadgeProps["size"]>,
  string
> = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-1 text-sm",
};

export function SourceConfidenceBadge({
  confidence,
  label,
  size = "sm",
  testId = "source-confidence-badge",
}: SourceConfidenceBadgeProps) {
  let bucket: Confidence;
  if (typeof confidence === "number") {
    bucket = bucketConfidence(confidence);
  } else if (
    confidence === "high" ||
    confidence === "medium" ||
    confidence === "low"
  ) {
    bucket = confidence;
  } else {
    // Anything else (undefined, "none", unexpected value) falls back to the
    // `none` "missing evidence" treatment so an unsupported claim cannot
    // be styled like a confident one.
    bucket = "none";
  }
  const descriptor = CONFIDENCE_DESCRIPTORS[bucket];
  const Icon = ICON[bucket];

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md font-medium ${SIZE_CLASS[size]} ${TONE_TO_CLASS[descriptor.tone]}`.trim()}
      title={descriptor.description}
      data-testid={testId}
      data-confidence={bucket}
      data-tone={descriptor.tone}
    >
      <Icon className="h-3 w-3" aria-hidden />
      {label ?? descriptor.label}
    </span>
  );
}
