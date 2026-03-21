"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/ui";
import { CompactLaneHeader, type CompactLaneTone } from "./compact-lane-header";

export interface ExpandableSectionProps {
  title: string;
  subtitle?: string;
  badge?: string;
  tone?: CompactLaneTone;
  preview: ReactNode;
  children: ReactNode;
  defaultExpanded?: boolean;
  expandLabel?: string;
  collapseLabel?: string;
  className?: string;
  previewClassName?: string;
  contentClassName?: string;
  testId?: string;
}

export function ExpandableSection({
  title,
  subtitle,
  badge,
  tone = "default",
  preview,
  children,
  defaultExpanded = false,
  expandLabel = "Show detail",
  collapseLabel = "Hide detail",
  className,
  previewClassName,
  contentClassName,
  testId = "expandable-section",
}: ExpandableSectionProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <section
      data-testid={testId}
      className={[
        "overflow-hidden rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)]",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <CompactLaneHeader
        title={title}
        subtitle={subtitle}
        badge={badge}
        tone={tone}
        action={
          <Button
            size="sm"
            variant="flat"
            aria-expanded={expanded}
            data-testid={`${testId}-toggle`}
            onPress={() => setExpanded((current) => !current)}
            className="min-w-[116px]"
          >
            <span className="mr-1 text-xs">
              {expanded ? collapseLabel : expandLabel}
            </span>
            <ChevronDown
              className={[
                "h-4 w-4 transition-transform",
                expanded ? "rotate-180" : "rotate-0",
              ].join(" ")}
            />
          </Button>
        }
      />

      <div
        data-testid={`${testId}-${expanded ? "content" : "preview"}`}
        className={expanded ? contentClassName : previewClassName}
      >
        {expanded ? children : preview}
      </div>
    </section>
  );
}
