'use client';

import { formatCurrencyCompact } from '@/utils/formatting';
import type { FundTrustRow } from '@/data/mocks/hooks/dashboard-data';
import { CompactLaneHeader } from '@/ui/composites';

interface HomeFundHealthListProps {
  rows: FundTrustRow[];
  onRowClick: (fundId: string) => void;
}

const getRiskClasses = (riskFlag: FundTrustRow['riskFlag']) => {
  if (riskFlag === 'critical') return 'text-[var(--app-danger)]';
  if (riskFlag === 'watch') return 'text-[var(--app-warning)]';
  return 'text-[var(--app-success)]';
};

const formatStatus = (status: FundTrustRow['status']) =>
  status
    .split('-')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');

export function HomeFundHealthList({ rows, onRowClick }: HomeFundHealthListProps) {
  return (
    <section data-testid="fund-health-list" className="overflow-hidden rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)]">
      <CompactLaneHeader
        title="Fund Health & LP Trust"
        subtitle="Trust durability and operating context by fund. Select any row to open Fund Setup details."
        badge={`${rows.length} funds`}
        tone="trust"
      />

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

      {rows.length === 0 ? (
        <div className="px-3 py-6 text-center text-sm text-[var(--app-text-muted)]">No funds available.</div>
      ) : (
        <div>
          {rows.map((row) => {
            const trustClass = getRiskClasses(row.riskFlag);
            const deltaLabel = row.trustDelta >= 0 ? `+${row.trustDelta}` : row.trustDelta;

            return (
              <div
                key={row.id}
                data-testid="fund-health-row"
                className="grid cursor-pointer grid-cols-12 border-t border-[var(--app-border)] px-3 py-3 transition-colors hover:bg-[var(--app-surface-hover)]"
                onClick={() => onRowClick(row.id)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onRowClick(row.id);
                  }
                }}
                role="button"
                tabIndex={0}
              >
                <div className="col-span-3 min-w-0 pr-2">
                  <p className="truncate text-sm font-semibold text-[var(--app-text)]">{row.displayName}</p>
                  <p className="text-xs text-[var(--app-text-muted)]">{formatStatus(row.status)}</p>
                  <p className="truncate text-[11px] text-[var(--app-text-subtle)]" title={formatCurrencyCompact(row.availableCapital)}>
                    Available {formatCurrencyCompact(row.availableCapital)}
                  </p>
                </div>

                <div className="col-span-2 pr-2">
                  <div className={`mb-1 flex items-center gap-2 ${trustClass}`}>
                    <span className="inline-block h-2 w-2 rounded-full bg-current" />
                    <span className="text-sm font-semibold">{row.trustScore}</span>
                    <span className="text-xs">{deltaLabel}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-[var(--app-surface-2)]">
                    <div className="h-full bg-current" style={{ width: `${Math.max(4, Math.min(100, row.trustScore))}%` }} />
                  </div>
                </div>

                <div className="col-span-1 text-right text-sm font-semibold text-[var(--app-text)]">{row.lpCommitmentRate}%</div>
                <div className="col-span-1 text-right text-sm font-semibold text-[var(--app-text)]">{row.reportingQuality}%</div>
                <div className="col-span-1 text-right text-sm font-semibold text-[var(--app-text)]">{row.lpSatisfaction}%</div>
                <div className="col-span-1 text-right text-sm font-semibold text-[var(--app-text)]">{row.capitalEfficiency}%</div>
                <div className="col-span-1 text-right text-sm font-semibold text-[var(--app-text)]">{row.deploymentPct}%</div>
                <div className="col-span-1 text-right text-sm font-semibold text-[var(--app-text)]">{row.irr.toFixed(1)}%</div>
                <div className="col-span-1 text-right text-sm font-semibold text-[var(--app-text)]">{row.tvpi.toFixed(2)}x</div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
