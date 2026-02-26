'use client';

import { formatCurrencyCompact } from '@/utils/formatting';
import type { PortfolioRevenueRow } from '@/data/mocks/hooks/dashboard-data';
import { CompactLaneHeader } from '@/ui/composites';

interface HomePortfolioHealthListProps {
  rows: PortfolioRevenueRow[];
  onRowClick: (companyName: string) => void;
}

const getRiskClasses = (riskFlag: PortfolioRevenueRow['riskFlag']) => {
  if (riskFlag === 'critical') return 'text-[var(--app-danger)]';
  if (riskFlag === 'watch') return 'text-[var(--app-warning)]';
  return 'text-[var(--app-success)]';
};

const getPotentialClass = (potential: PortfolioRevenueRow['valuationPotential']) => {
  if (potential === 'high') return 'text-[var(--app-success)] bg-[var(--app-success-bg)]';
  if (potential === 'watch') return 'text-[var(--app-danger)] bg-[var(--app-danger-bg)]';
  return 'text-[var(--app-info)] bg-[var(--app-info-bg)]';
};

export function HomePortfolioHealthList({ rows, onRowClick }: HomePortfolioHealthListProps) {
  return (
    <section data-testid="portfolio-health-list" className="overflow-hidden rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)]">
      <CompactLaneHeader
        title="Portfolio Revenue Makers"
        subtitle="ARR momentum, growth trajectory, valuation potential, and risk compression."
        badge={`${rows.length} companies`}
        tone="portfolio"
      />

      <div className="grid grid-cols-12 border-b border-[var(--app-border)] bg-[var(--app-surface-hover)] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--app-text-subtle)]">
        <div className="col-span-3">Company</div>
        <div className="col-span-2 text-right">ARR</div>
        <div className="col-span-1 text-right">QoQ</div>
        <div className="col-span-2 text-right">Valuation</div>
        <div className="col-span-2">Upside</div>
        <div className="col-span-1 text-right">Runway</div>
        <div className="col-span-1 text-right">Risk</div>
      </div>

      {rows.length === 0 ? (
        <div className="px-3 py-6 text-center text-sm text-[var(--app-text-muted)]">No portfolio companies available.</div>
      ) : (
        <div>
          {rows.map((row) => {
            const growthClass = row.arrGrowthQoq >= 0 ? 'text-[var(--app-success)]' : 'text-[var(--app-danger)]';
            const runwayClass = row.runwayMonths <= 9
              ? 'text-[var(--app-danger)]'
              : row.runwayMonths <= 12
                ? 'text-[var(--app-warning)]'
                : 'text-[var(--app-text)]';

            return (
              <div
                key={row.id}
                data-testid="portfolio-health-row"
                className="grid cursor-pointer grid-cols-12 border-t border-[var(--app-border)] px-3 py-3 transition-colors hover:bg-[var(--app-surface-hover)]"
                onClick={() => onRowClick(row.name)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onRowClick(row.name);
                  }
                }}
                role="button"
                tabIndex={0}
              >
                <div className="col-span-3 min-w-0 pr-2">
                  <p className="truncate text-sm font-semibold text-[var(--app-text)]">{row.name}</p>
                  <p className={`text-xs ${getRiskClasses(row.riskFlag)}`}>
                    {row.riskFlag === 'critical' ? 'Revenue at risk' : row.riskFlag === 'watch' ? 'Monitor trajectory' : 'Healthy momentum'}
                  </p>
                </div>

                <div className="col-span-2 text-right text-sm font-semibold text-[var(--app-text)]">{`$${row.arr.toFixed(1)}M`}</div>
                <div className={`col-span-1 text-right text-sm font-semibold ${growthClass}`}>
                  {row.arrGrowthQoq >= 0 ? '+' : ''}{row.arrGrowthQoq.toFixed(0)}%
                </div>
                <div className="col-span-2 text-right text-sm font-semibold text-[var(--app-text)]" title={formatCurrencyCompact(row.valuation * 1_000_000)}>
                  {`$${row.valuation.toFixed(0)}M`}
                </div>

                <div className="col-span-2 pr-2">
                  <p className="line-clamp-1 text-xs font-medium text-[var(--app-text)]">{row.upsideLabel}</p>
                  <span className={[
                    'inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em]',
                    getPotentialClass(row.valuationPotential),
                  ].join(' ')}>
                    {row.valuationPotential}
                  </span>
                </div>

                <div className={`col-span-1 text-right text-sm font-semibold ${runwayClass}`}>{row.runwayMonths}m</div>
                <div className={`col-span-1 text-right text-sm font-semibold ${getRiskClasses(row.riskFlag)}`}>
                  {row.anomalyCount > 0 ? `${row.anomalyCount}` : '0'}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
