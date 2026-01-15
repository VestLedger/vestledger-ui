"use client";

import { Badge, Card } from "@/ui";
import type { WaterfallScenario } from "@/types/waterfall";
import { formatCurrencyCompact, formatPercent } from "@/utils/formatting";
import { ShieldCheck, ShieldAlert } from "lucide-react";

export interface ClawbackCalculatorProps {
  scenario?: WaterfallScenario | null;
}

export function ClawbackCalculator({ scenario }: ClawbackCalculatorProps) {
  const provision = scenario?.clawbackProvision;
  const clawback = scenario?.results?.clawback;

  const status = clawback?.status ?? "clear";
  const statusLabel = status === "triggered" ? "Triggered" : status === "at-risk" ? "At Risk" : "Clear";
  const statusClass =
    status === "triggered"
      ? "bg-[var(--app-danger-bg)] text-[var(--app-danger)]"
      : status === "at-risk"
        ? "bg-[var(--app-warning-bg)] text-[var(--app-warning)]"
        : "bg-[var(--app-success-bg)] text-[var(--app-success)]";

  return (
    <Card padding="lg" className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">Clawback Provision</h3>
          <p className="text-sm text-[var(--app-text-muted)]">
            Validate GP carry against fund-level return thresholds.
          </p>
        </div>
        <Badge size="sm" variant="flat" className={statusClass}>
          {statusLabel}
        </Badge>
      </div>

      {!provision?.enabled || !clawback ? (
        <div className="rounded-lg border border-dashed border-[var(--app-border)] p-4 text-sm text-[var(--app-text-muted)]">
          Enable clawback terms to calculate GP carry adjustments.
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-2 text-xs text-[var(--app-text-muted)]">
            <Badge size="sm" variant="flat">
              Hurdle {formatPercent(provision.hurdleRate, 1)}
            </Badge>
            <Badge size="sm" variant="flat">
              Clawback {formatPercent(provision.clawbackRate, 0)}
            </Badge>
            <Badge size="sm" variant="flat">
              {provision.distributionLifeYears} yr fund life
            </Badge>
          </div>

          <div className="grid gap-3 text-sm md:grid-cols-2">
            <div className="rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2">
              <div className="text-xs text-[var(--app-text-muted)]">Carry Paid</div>
              <div className="font-semibold">{formatCurrencyCompact(clawback.totalCarryPaid)}</div>
            </div>
            <div className="rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2">
              <div className="text-xs text-[var(--app-text-muted)]">Required Return</div>
              <div className="font-semibold">{formatCurrencyCompact(clawback.requiredReturn)}</div>
            </div>
            <div className="rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2">
              <div className="text-xs text-[var(--app-text-muted)]">Return Shortfall</div>
              <div className="font-semibold">{formatCurrencyCompact(clawback.shortfall)}</div>
            </div>
            <div className="rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2">
              <div className="text-xs text-[var(--app-text-muted)]">Clawback Due</div>
              <div className="font-semibold">{formatCurrencyCompact(clawback.clawbackDue)}</div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-[var(--app-text-muted)]">
            {status === "clear" ? (
              <ShieldCheck className="h-4 w-4 text-[var(--app-success)]" />
            ) : (
              <ShieldAlert className="h-4 w-4 text-[var(--app-warning)]" />
            )}
            Net GP carry after clawback: {formatCurrencyCompact(clawback.netCarryAfterClawback)}
          </div>
        </>
      )}
    </Card>
  );
}
