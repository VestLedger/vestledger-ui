"use client";

import type { ReactNode } from "react";

export interface SectionHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  actionClassName?: string;
}

export function SectionHeader({
  title,
  description,
  action,
  className,
  titleClassName,
  descriptionClassName,
  actionClassName,
}: SectionHeaderProps) {
  return (
    <div
      className={[
        "flex flex-wrap items-start justify-between gap-3",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div>
        <h3
          className={[
            "text-lg font-semibold",
            titleClassName ?? "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {title}
        </h3>
        {description && (
          <p
            className={[
              "text-sm text-[var(--app-text-muted)]",
              descriptionClassName ?? "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {description}
          </p>
        )}
      </div>
      {action && (
        <div
          className={[
            "flex items-center gap-2",
            actionClassName ?? "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {action}
        </div>
      )}
    </div>
  );
}
