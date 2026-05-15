"use client";

import type { ReactNode } from "react";
import { AlertCircle, AlertTriangle, Info } from "lucide-react";

/**
 * InlineValidation — inline-on-blur per-field validation message per the
 * P2-010 spec. The spec forbids modal validation summaries; every field
 * surfaces its own error/warning/info beneath the control.
 *
 * The `fieldId` is used to wire up `aria-describedby` from the field, so
 * the message is announced to assistive tech as part of the field.
 */
export type InlineValidationTone = "error" | "warning" | "info";

export interface InlineValidationProps {
  /** Message rendered when the field has a validation result. */
  message?: ReactNode;
  /** Severity tone. Defaults to `error`. */
  tone?: InlineValidationTone;
  /**
   * Stable id for the message. Wire `aria-describedby={fieldId}` on the
   * associated field control so screen readers announce the validation.
   */
  fieldId?: string;
  className?: string;
  testId?: string;
}

const TONE_TO_STYLE: Record<
  InlineValidationTone,
  { icon: typeof AlertCircle; color: string }
> = {
  error: {
    icon: AlertCircle,
    color: "text-[var(--app-danger)]",
  },
  warning: {
    icon: AlertTriangle,
    color: "text-[var(--app-warning)]",
  },
  info: {
    icon: Info,
    color: "text-[var(--app-info)]",
  },
};

export function InlineValidation({
  message,
  tone = "error",
  fieldId,
  className,
  testId = "inline-validation",
}: InlineValidationProps) {
  if (!message) return null;
  const { icon: Icon, color } = TONE_TO_STYLE[tone];
  const role = tone === "error" ? "alert" : "status";
  return (
    <p
      id={fieldId}
      role={role}
      className={["flex items-center gap-1.5 text-xs", color, className ?? ""]
        .filter(Boolean)
        .join(" ")}
      data-testid={testId}
      data-tone={tone}
    >
      <Icon className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
      <span>{message}</span>
    </p>
  );
}
