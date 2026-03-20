"use client";

import { formatCurrencyCompact } from "@/utils/formatting";
import type { PortfolioRevenueRow } from "@/data/mocks/hooks/dashboard-data";
import { ExpandableSection } from "@/ui/composites";
import { sortPortfolioRevenueRowsByAttention } from "./home-dashboard-helpers";

interface HomePortfolioHealthListProps {
  rows: PortfolioRevenueRow[];
  onRowClick: (companyName: string) => void;
  previewRows?: number;
}

const getRiskClasses = (riskFlag: PortfolioRevenueRow["riskFlag"]) => {
  if (riskFlag === "critical") return "text-[var(--app-danger)]";
  if (riskFlag === "watch") return "text-[var(--app-warning)]";
  return "text-[var(--app-success)]";
};

const getPotentialClass = (
  potential: PortfolioRevenueRow["valuationPotential"],
) => {
  if (potential === "high")
    return "text-[var(--app-success)] bg-[var(--app-success-bg)]";
  if (potential === "watch")
    return "text-[var(--app-danger)] bg-[var(--app-danger-bg)]";
  return "text-[var(--app-info)] bg-[var(--app-info-bg)]";
};

export function HomePortfolioHealthList({
  rows,
  onRowClick,
  previewRows = 5,
}: HomePortfolioHealthListProps) {
  const prioritizedRows = sortPortfolioRevenueRowsByAttention(rows);
  const preview = prioritizedRows.slice(0, previewRows);
  const hiddenCount = Math.max(prioritizedRows.length - preview.length, 0);

  const renderRows = (
    visibleRows: PortfolioRevenueRow[],
    state: "preview" | "full",
  ) => (
    <>
      <div className="grid grid-cols-12 border-b border-[var(--app-border)] bg-[var(--app-surface-hover)] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--app-text-subtle)]">
        <div className="col-span-3">Company</div>
        <div className="col-span-2 text-right">ARR</div>
        <div className="col-span-1 text-right">QoQ</div>
        <div className="col-span-2 text-right">Valuation</div>
        <div className="col-span-2">Upside</div>
        <div className="col-span-1 text-right">Runway</div>
        <div className="col-span-1 text-right">Risk</div>
      </div>

      {visibleRows.length === 0 ? (
        <div className="px-3 py-6 text-center text-sm text-[var(--app-text-muted)]">
          No portfolio companies available.
        </div>
      ) : (
        <div>
          {visibleRows.map((row, index) => {
            const growthClass =
              row.arrGrowthQoq >= 0
                ? "text-[var(--app-success)]"
                : "text-[var(--app-danger)]";
            const runwayClass =
              row.runwayMonths <= 9
                ? "text-[var(--app-danger)]"
                : row.runwayMonths <= 12
                  ? "text-[var(--app-warning)]"
                  : "text-[var(--app-text)]";
            const rowKey = `${row.id}-${index}`;

            return (
              <div
                key={rowKey}
                data-testid="portfolio-health-row"
                className="grid cursor-pointer grid-cols-12 border-t border-[var(--app-border)] px-3 py-3 transition-colors hover:bg-[var(--app-surface-hover)]"
                onClick={() => onRowClick(row.name)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onRowClick(row.name);
                  }
                }}
                role="button"
                tabIndex={0}
              >
                <div className="col-span-3 min-w-0 pr-2">
                  <p className="truncate text-sm font-semibold text-[var(--app-text)]">
                    {row.name}
                  </p>
                  <p className={`text-xs ${getRiskClasses(row.riskFlag)}`}>
                    {row.riskFlag === "critical"
                      ? "Revenue at risk"
                      : row.riskFlag === "watch"
                        ? "Monitor trajectory"
                        : "Healthy momentum"}
                  </p>
                </div>

                <div className="col-span-2 text-right text-sm font-semibold text-[var(--app-text)]">{`$${row.arr.toFixed(1)}M`}</div>
                <div
                  className={`col-span-1 text-right text-sm font-semibold ${growthClass}`}
                >
                  {row.arrGrowthQoq >= 0 ? "+" : ""}
                  {row.arrGrowthQoq.toFixed(0)}%
                </div>
                <div
                  className="col-span-2 text-right text-sm font-semibold text-[var(--app-text)]"
                  title={formatCurrencyCompact(row.valuation * 1_000_000)}
                >
                  {`$${row.valuation.toFixed(0)}M`}
                </div>

                <div className="col-span-2 pr-2">
                  <p className="line-clamp-1 text-xs font-medium text-[var(--app-text)]">
                    {row.upsideLabel}
                  </p>
                  <span
                    className={[
                      "inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em]",
                      getPotentialClass(row.valuationPotential),
                    ].join(" ")}
                  >
                    {row.valuationPotential}
                  </span>
                </div>

                <div
                  className={`col-span-1 text-right text-sm font-semibold ${runwayClass}`}
                >
                  {row.runwayMonths}m
                </div>
                <div
                  className={`col-span-1 text-right text-sm font-semibold ${getRiskClasses(row.riskFlag)}`}
                >
                  {row.anomalyCount > 0 ? `${row.anomalyCount}` : "0"}
                </div>
              </div>
            );
          })}

          {state === "preview" && hiddenCount > 0 && (
            <div className="border-t border-[var(--app-border)] px-3 py-3 text-xs text-[var(--app-text-muted)]">
              Showing {preview.length} of {prioritizedRows.length} companies
              prioritized by risk, runway, and growth pressure.
            </div>
          )}
        </div>
      )}
    </>
  );

  return (
    <ExpandableSection
      title="Portfolio Health"
      subtitle="ARR momentum, growth trajectory, valuation potential, and risk compression."
      badge={`${rows.length} companies`}
      tone="portfolio"
      preview={renderRows(preview, "preview")}
      expandLabel="Show table"
      collapseLabel="Hide table"
      previewClassName="px-0 py-0"
      contentClassName="px-0 py-0"
      testId="portfolio-health-list"
    >
      {renderRows(prioritizedRows, "full")}
    </ExpandableSection>
  );
}
