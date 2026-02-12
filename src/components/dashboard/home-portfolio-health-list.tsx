'use client';

import type { PortfolioSignalRow } from '@/data/mocks/hooks/dashboard-data';

interface HomePortfolioHealthListProps {
  rows: PortfolioSignalRow[];
  onRowClick: (companyName: string) => void;
}

const getRiskClasses = (riskFlag: PortfolioSignalRow['riskFlag']) => {
  if (riskFlag === 'critical') return 'text-[var(--app-danger)]';
  if (riskFlag === 'watch') return 'text-[var(--app-warning)]';
  return 'text-[var(--app-success)]';
};

export function HomePortfolioHealthList({ rows, onRowClick }: HomePortfolioHealthListProps) {
  return (
    <section data-testid="portfolio-health-list" className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)]">
      <div className="border-b border-[var(--app-border)] px-4 py-3">
        <h2 className="text-sm font-semibold text-[var(--app-text)]">Portfolio</h2>
        <p className="text-xs text-[var(--app-text-muted)]">Company health and near-term risk indicators. Click a row to open Portfolio details.</p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-[var(--app-surface-hover)] text-[var(--app-text-muted)]">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium">Company</th>
              <th className="px-3 py-2 text-left text-xs font-medium">Health</th>
              <th className="px-3 py-2 text-right text-xs font-medium">Runway</th>
              <th className="px-3 py-2 text-right text-xs font-medium">Anomalies</th>
              <th className="px-3 py-2 text-right text-xs font-medium">Trend</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-sm text-[var(--app-text-muted)]">
                  No portfolio companies available.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={row.id}
                  data-testid="portfolio-health-row"
                  className="cursor-pointer border-t border-[var(--app-border)] hover:bg-[var(--app-surface-hover)]"
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
                  <td className="px-3 py-2">
                    <div className="font-medium text-[var(--app-text)]">{row.name}</div>
                  </td>
                  <td className="px-3 py-2">
                    <div className={`inline-flex items-center gap-2 ${getRiskClasses(row.riskFlag)}`}>
                      <span className="inline-block h-2 w-2 rounded-full bg-current" />
                      <span className="font-semibold">{row.healthScore}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-right text-[var(--app-text)]">{row.runwayMonths}m</td>
                  <td className="px-3 py-2 text-right text-[var(--app-text)]">{row.anomalyCount}</td>
                  <td className="px-3 py-2 text-right">
                    <span className={row.healthDelta >= 0 ? 'text-[var(--app-success)]' : 'text-[var(--app-danger)]'}>
                      {row.healthDelta >= 0 ? `+${row.healthDelta}` : row.healthDelta}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
