"use client";

import { Badge, Card } from "@/ui";
import type { WaterfallScenario } from "@/types/waterfall";
import { formatCurrencyCompact } from "@/utils/formatting";
import { TrendingDown, TrendingUp } from "lucide-react";
import { SectionHeader } from "@/ui/composites";

export interface LookbackTrackerProps {
  scenario?: WaterfallScenario | null;
}

export function LookbackTracker({ scenario }: LookbackTrackerProps) {
  const provision = scenario?.lookbackProvision;
  const lookback = scenario?.results?.lookback;

  const status = lookback?.status ?? "monitor";
  const statusLabel =
    status === "cleared" ? "Cleared" : status === "at-risk" ? "At Risk" : "Monitor";
  const statusClass =
    status === "cleared"
      ? "bg-[var(--app-success-bg)] text-[var(--app-success)]"
      : status === "at-risk"
        ? "bg-[var(--app-warning-bg)] text-[var(--app-warning)]"
        : "bg-[var(--app-info-bg)] text-[var(--app-info)]";

  return (
    <Card padding="lg" className="space-y-4">
      <SectionHeader
        title="Lookback Tracking"
        description="Monitor carry exposure against historical loss recovery requirements."
        action={(
          <Badge size="sm" variant="flat" className={statusClass}>
            {statusLabel}
          </Badge>
        )}
      />

      {!provision?.enabled || !lookback ? (
        <div className="rounded-lg border border-dashed border-[var(--app-border)] p-4 text-sm text-[var(--app-text-muted)]">
          Lookback monitoring is not enabled for this scenario.
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-2 text-xs text-[var(--app-text-muted)]">
            <Badge size="sm" variant="flat">
              {lookback.lookbackYears} yr lookback
            </Badge>
            <Badge size="sm" variant="flat">
              Carry at risk {provision.carryAtRiskRate}%
            </Badge>
            <Badge size="sm" variant="flat">
              Loss carryforward {formatCurrencyCompact(provision.lossCarryForward)}
            </Badge>
          </div>

          <div className="grid gap-3 text-sm md:grid-cols-2">
            <div className="rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2">
              <div className="text-xs text-[var(--app-text-muted)]">Losses to Recover</div>
              <div className="font-semibold">{formatCurrencyCompact(lookback.lossesToRecover)}</div>
            </div>
            <div className="rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2">
              <div className="text-xs text-[var(--app-text-muted)]">Carry At Risk</div>
              <div className="font-semibold">{formatCurrencyCompact(lookback.carryAtRisk)}</div>
            </div>
            <div className="rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2">
              <div className="text-xs text-[var(--app-text-muted)]">Carry Released</div>
              <div className="font-semibold">{formatCurrencyCompact(lookback.carryReleased)}</div>
            </div>
            <div className="rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2">
              <div className="text-xs text-[var(--app-text-muted)]">Status Signal</div>
              <div className="flex items-center gap-2 font-semibold">
                {status === "cleared" ? (
                  <TrendingUp className="h-4 w-4 text-[var(--app-success)]" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-[var(--app-warning)]" />
                )}
                {statusLabel}
              </div>
            </div>
          </div>
        </>
      )}
    </Card>
  );
}
