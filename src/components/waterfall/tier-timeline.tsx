"use client";

import { Card } from "@/ui";
import type { WaterfallScenario } from "@/types/waterfall";
import { SectionHeader, Timeline, type TimelineItem } from '@/ui/composites';
import { formatCurrencyCompact, formatDate } from "@/utils/formatting";

export interface TierTimelineProps {
  scenario?: WaterfallScenario | null;
}

export function TierTimeline({ scenario }: TierTimelineProps) {
  const timeline = scenario?.results?.tierTimeline ?? [];

  const items: TimelineItem[] = timeline.map((entry) => ({
    id: entry.tierId,
    title: entry.tierName,
    subtitle: `${formatDate(entry.reachedAt)} • Threshold ${formatCurrencyCompact(entry.exitValue)}`,
    dotColor: "var(--app-primary)",
  }));

  return (
    <Card padding="lg" className="space-y-4">
      <SectionHeader
        title="Tier Timeline"
        description="Track when each tier clears as proceeds move through the waterfall."
      />

      {items.length === 0 ? (
        <div className="text-sm text-[var(--app-text-muted)]">
          Tier timeline will appear once calculations are available.
        </div>
      ) : (
        <Timeline items={items} />
      )}
    </Card>
  );
}
