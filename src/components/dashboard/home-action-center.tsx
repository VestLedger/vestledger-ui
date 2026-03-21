"use client";

import type {
  DailyBriefItem,
  HomeBlocker,
  HomeOpportunity,
} from "@/data/mocks/hooks/dashboard-data";
import { Badge } from "@/ui";
import { KpiChip, ExpandableSection } from "@/ui/composites";
import { HomePriorityMatrix } from "./home-priority-matrix";
import { HomeOpportunitiesRail } from "./home-opportunities-rail";
import {
  getTopBlocker,
  getTopOpportunity,
  getUrgentSignalsCount,
} from "./home-dashboard-helpers";

interface HomeActionCenterProps {
  items: DailyBriefItem[];
  blockers: HomeBlocker[];
  opportunities: HomeOpportunity[];
  onItemClick: (item: DailyBriefItem) => void;
  onBlockerClick: (blocker: HomeBlocker) => void;
  onOpportunityClick: (opportunity: HomeOpportunity) => void;
  blockGapClass: string;
}

export function HomeActionCenter({
  items,
  blockers,
  opportunities,
  onItemClick,
  onBlockerClick,
  onOpportunityClick,
  blockGapClass,
}: HomeActionCenterProps) {
  const urgentSignals = getUrgentSignalsCount(items);
  const topBlocker = getTopBlocker(blockers);
  const topOpportunity = getTopOpportunity(opportunities);

  const collapsedPreview = (
    <div className="grid grid-cols-1 gap-3 px-4 py-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <KpiChip
          label="Urgent items"
          value={urgentSignals}
          tone={urgentSignals > 0 ? "warning" : "neutral"}
        />
        <KpiChip
          label="Blockers"
          value={blockers.length}
          tone={blockers.length > 0 ? "danger" : "neutral"}
        />
        <KpiChip
          label="Opportunities"
          value={opportunities.length}
          tone={opportunities.length > 0 ? "info" : "neutral"}
        />
      </div>

      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        <button
          type="button"
          className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-3 text-left transition-colors hover:border-[var(--app-primary)] hover:bg-[var(--app-surface-hover)]"
          onClick={() => topBlocker && onBlockerClick(topBlocker)}
          disabled={!topBlocker}
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--app-text-subtle)]">
            Top blocker
          </p>
          <p className="mt-1 text-sm font-semibold text-[var(--app-text)]">
            {topBlocker?.title ?? "No active blockers"}
          </p>
          {topBlocker && (
            <Badge
              size="sm"
              variant="flat"
              className="mt-3 bg-[var(--app-warning-bg)] text-[var(--app-warning)]"
            >
              {topBlocker.blockedDays}d blocked
            </Badge>
          )}
        </button>

        <button
          type="button"
          className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-3 text-left transition-colors hover:border-[var(--app-primary)] hover:bg-[var(--app-surface-hover)]"
          onClick={() => topOpportunity && onOpportunityClick(topOpportunity)}
          disabled={!topOpportunity}
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--app-text-subtle)]">
            Top opportunity
          </p>
          <p className="mt-1 text-sm font-semibold text-[var(--app-text)]">
            {topOpportunity?.title ?? "No active opportunities"}
          </p>
          {topOpportunity && (
            <Badge
              size="sm"
              variant="flat"
              className="mt-3 bg-[var(--app-info-bg)] text-[var(--app-info)]"
            >
              {(topOpportunity.confidence * 100).toFixed(0)}% confidence
            </Badge>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <ExpandableSection
      title="Action Center"
      subtitle="Decisions, blockers, and upside opportunities generated from current portfolio and fund signals."
      badge={`${items.length} signals`}
      tone="warning"
      preview={collapsedPreview}
      expandLabel="Show actions"
      collapseLabel="Hide actions"
      contentClassName="px-0 py-0"
      previewClassName="px-0 py-0"
      testId="gp-home-action-center"
    >
      <div
        className={`grid grid-cols-1 ${blockGapClass} px-4 py-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]`}
      >
        <HomePriorityMatrix items={items} onItemClick={onItemClick} />
        <HomeOpportunitiesRail
          opportunities={opportunities}
          onOpportunityClick={onOpportunityClick}
        />
      </div>
    </ExpandableSection>
  );
}
