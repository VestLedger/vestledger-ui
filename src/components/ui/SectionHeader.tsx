"use client";

import type { ReactNode } from "react";

export interface SectionHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function SectionHeader({ title, description, action, className }: SectionHeaderProps) {
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
        <h3 className="text-lg font-semibold">{title}</h3>
        {description && (
          <p className="text-sm text-[var(--app-text-muted)]">{description}</p>
        )}
      </div>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
  );
}
