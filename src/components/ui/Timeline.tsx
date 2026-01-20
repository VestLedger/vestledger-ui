import type { ReactNode } from "react";

export interface TimelineItem {
  id: string;
  title: ReactNode;
  subtitle?: ReactNode;
  dotColor?: string;
}

export interface TimelineProps {
  items: TimelineItem[];
}

export function Timeline({ items }: TimelineProps) {
  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div
          key={item.id}
          className={`relative pl-6 ${index < items.length - 1 ? "border-l border-[var(--app-border)]" : ""}`}
        >
          <span
            className="absolute left-0 top-0 h-3 w-3 -translate-x-1/2 rounded-full border-2 border-[var(--app-surface)]"
            style={{ backgroundColor: item.dotColor ?? "var(--app-border)" }}
          />
          <div className="text-sm font-medium">{item.title}</div>
          {item.subtitle && (
            <div className="text-xs text-[var(--app-text-muted)]">{item.subtitle}</div>
          )}
        </div>
      ))}
    </div>
  );
}
