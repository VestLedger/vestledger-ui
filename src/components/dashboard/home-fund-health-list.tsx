"use client";

import { formatCurrencyCompact } from "@/utils/formatting";
import type { FundTrustRow } from "@/data/mocks/hooks/dashboard-data";
import { ExpandableSection, KpiChip } from "@/ui/composites";
import {
  countByRiskFlag,
  getAverageTrustScore,
  sortFundTrustRowsByAttention,
} from "./home-dashboard-helpers";

interface HomeFundHealthListProps {
  rows: FundTrustRow[];
  onRowClick: (fundId: string) => void;
  previewRows?: number;
}

const getRiskClasses = (riskFlag: FundTrustRow["riskFlag"]) => {
  if (riskFlag === "critical") return "text-[var(--app-danger)]";
  if (riskFlag === "watch") return "text-[var(--app-warning)]";
  return "text-[var(--app-success)]";
};

const formatStatus = (status: FundTrustRow["status"]) =>
  status
    .split("-")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");

function TrustOverview({ rows }: { rows: FundTrustRow[] }) {
  const riskBreakdown = countByRiskFlag(rows);
  const averageTrust = getAverageTrustScore(rows);
  const total = rows.length;
  const watchFunds = riskBreakdown.watch + riskBreakdown.critical;

  const segments = [
    {
      key: "stable",
      label: "Stable",
      count: riskBreakdown.stable,
      barClass: "bg-[var(--app-success)]",
      tone: "success" as const,
    },
    {
      key: "watch",
      label: "Watch",
      count: riskBreakdown.watch,
      barClass: "bg-[var(--app-warning)]",
      tone: "warning" as const,
    },
    {
      key: "critical",
      label: "Critical",
      count: riskBreakdown.critical,
      barClass: "bg-[var(--app-danger)]",
      tone: "danger" as const,
    },
  ];

  return (
    <div
      className="grid gap-3 border-b border-[var(--app-border)] bg-[var(--app-surface-hover)]/60 px-4 py-4 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]"
      data-testid="fund-trust-overview"
    >
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--app-text-subtle)]">
          Trust distribution
        </p>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--app-surface-2)]">
          {total === 0 ? (
            <div className="h-full w-full bg-[var(--app-border)]" />
          ) : (
            <div className="flex h-full w-full">
              {segments.map((segment) => (
                <div
                  key={segment.key}
                  className={segment.barClass}
                  style={{ width: `${(segment.count / total) * 100}%` }}
                />
              ))}
            </div>
          )}
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {segments.map((segment) => (
            <div
              key={segment.key}
              className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2"
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--app-text-subtle)]">
                {segment.label}
              </p>
              <p className="mt-1 text-lg font-semibold text-[var(--app-text)]">
                {segment.count}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <KpiChip
          label="Avg trust"
          value={averageTrust}
          tone={watchFunds > 0 ? "warning" : "success"}
        />
        <KpiChip
          label="Watch funds"
          value={watchFunds}
          tone={watchFunds > 0 ? "warning" : "success"}
        />
        <KpiChip
          label="Commitment risk"
          value={`${rows.filter((row) => row.lpCommitmentRate < 85).length}`}
          tone={
            rows.some((row) => row.lpCommitmentRate < 85)
              ? "warning"
              : "neutral"
          }
        />
        <KpiChip
          label="Low deployment"
          value={`${rows.filter((row) => row.deploymentPct < 20).length}`}
          tone={rows.some((row) => row.deploymentPct < 20) ? "info" : "neutral"}
        />
      </div>
    </div>
  );
}

export function HomeFundHealthList({
  rows,
  onRowClick,
  previewRows = 5,
}: HomeFundHealthListProps) {
  const prioritizedRows = sortFundTrustRowsByAttention(rows);
  const preview = prioritizedRows.slice(0, previewRows);
  const hiddenCount = Math.max(prioritizedRows.length - preview.length, 0);

  const renderRows = (
    visibleRows: FundTrustRow[],
    state: "preview" | "full",
  ) => (
    <>
      <TrustOverview rows={rows} />

      <div className="grid grid-cols-12 border-b border-[var(--app-border)] bg-[var(--app-surface-hover)] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--app-text-subtle)]">
        <div className="col-span-3">Fund</div>
        <div className="col-span-2">Trust</div>
        <div className="col-span-1 text-right">LP Commit</div>
        <div className="col-span-1 text-right">Report</div>
        <div className="col-span-1 text-right">Satisf.</div>
        <div className="col-span-1 text-right">Efficiency</div>
        <div className="col-span-1 text-right">Deploy</div>
        <div className="col-span-1 text-right">IRR</div>
        <div className="col-span-1 text-right">TVPI</div>
      </div>

      {visibleRows.length === 0 ? (
        <div className="px-3 py-6 text-center text-sm text-[var(--app-text-muted)]">
          No funds available.
        </div>
      ) : (
        <div>
          {visibleRows.map((row) => {
            const trustClass = getRiskClasses(row.riskFlag);
            const deltaLabel =
              row.trustDelta >= 0 ? `+${row.trustDelta}` : row.trustDelta;

            return (
              <div
                key={row.id}
                data-testid="fund-health-row"
                className="grid cursor-pointer grid-cols-12 border-t border-[var(--app-border)] px-3 py-3 transition-colors hover:bg-[var(--app-surface-hover)]"
                onClick={() => onRowClick(row.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onRowClick(row.id);
                  }
                }}
                role="button"
                tabIndex={0}
              >
                <div className="col-span-3 min-w-0 pr-2">
                  <p className="truncate text-sm font-semibold text-[var(--app-text)]">
                    {row.displayName}
                  </p>
                  <p className="text-xs text-[var(--app-text-muted)]">
                    {formatStatus(row.status)}
                  </p>
                  <p
                    className="truncate text-[11px] text-[var(--app-text-subtle)]"
                    title={formatCurrencyCompact(row.availableCapital)}
                  >
                    Available {formatCurrencyCompact(row.availableCapital)}
                  </p>
                </div>

                <div className="col-span-2 pr-2">
                  <div className={`mb-1 flex items-center gap-2 ${trustClass}`}>
                    <span className="inline-block h-2 w-2 rounded-full bg-current" />
                    <span className="text-sm font-semibold">
                      {row.trustScore}
                    </span>
                    <span className="text-xs">{deltaLabel}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-[var(--app-surface-2)]">
                    <div
                      className="h-full bg-current"
                      style={{
                        width: `${Math.max(4, Math.min(100, row.trustScore))}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="col-span-1 text-right text-sm font-semibold text-[var(--app-text)]">
                  {row.lpCommitmentRate}%
                </div>
                <div className="col-span-1 text-right text-sm font-semibold text-[var(--app-text)]">
                  {row.reportingQuality}%
                </div>
                <div className="col-span-1 text-right text-sm font-semibold text-[var(--app-text)]">
                  {row.lpSatisfaction}%
                </div>
                <div className="col-span-1 text-right text-sm font-semibold text-[var(--app-text)]">
                  {row.capitalEfficiency}%
                </div>
                <div className="col-span-1 text-right text-sm font-semibold text-[var(--app-text)]">
                  {row.deploymentPct}%
                </div>
                <div className="col-span-1 text-right text-sm font-semibold text-[var(--app-text)]">
                  {row.irr.toFixed(1)}%
                </div>
                <div className="col-span-1 text-right text-sm font-semibold text-[var(--app-text)]">
                  {row.tvpi.toFixed(2)}x
                </div>
              </div>
            );
          })}

          {state === "preview" && hiddenCount > 0 && (
            <div className="border-t border-[var(--app-border)] px-3 py-3 text-xs text-[var(--app-text-muted)]">
              Showing {preview.length} of {prioritizedRows.length} funds
              prioritized by trust, commitment, and deployment pressure.
            </div>
          )}
        </div>
      )}
    </>
  );

  return (
    <ExpandableSection
      title="Fund Health & LP Trust"
      subtitle="Trust durability and operating context by fund. Select any row to open Fund Setup details."
      badge={`${rows.length} funds`}
      tone="trust"
      preview={renderRows(preview, "preview")}
      expandLabel="Show table"
      collapseLabel="Hide table"
      previewClassName="px-0 py-0"
      contentClassName="px-0 py-0"
      testId="fund-health-list"
    >
      {renderRows(prioritizedRows, "full")}
    </ExpandableSection>
  );
}
