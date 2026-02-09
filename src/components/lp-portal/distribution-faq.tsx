"use client";

import { Card } from "@/ui";
import type { LPFAQItem } from "@/data/mocks/lp-portal/lp-investor-portal";
import { SectionHeader } from "@/ui/composites";

export interface DistributionFAQProps {
  items: LPFAQItem[];
}

export function DistributionFAQ({ items }: DistributionFAQProps) {
  return (
    <Card padding="lg">
      <SectionHeader
        title="Distribution FAQ"
        description="Answers to common distribution questions."
      />

      <div className="mt-4 space-y-3">
        {items.length === 0 ? (
          <div className="text-sm text-[var(--app-text-muted)]">
            No FAQ entries available.
          </div>
        ) : (
          items.map((item) => (
            <details
              key={item.id}
              className="rounded-lg border border-[var(--app-border)] px-3 py-2"
            >
              <summary className="cursor-pointer text-sm font-semibold">
                {item.question}
              </summary>
              <div className="mt-2 text-sm text-[var(--app-text-muted)]">
                {item.answer}
              </div>
            </details>
          ))
        )}
      </div>
    </Card>
  );
}
