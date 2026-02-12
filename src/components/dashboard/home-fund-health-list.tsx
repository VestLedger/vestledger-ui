'use client';

import { formatCurrencyCompact } from '@/utils/formatting';
import type { FundHealthRow } from '@/data/mocks/hooks/dashboard-data';

interface HomeFundHealthListProps {
  rows: FundHealthRow[];
  onRowClick: (fundId: string) => void;
}

const getRiskClasses = (riskFlag: FundHealthRow['riskFlag']) => {
  if (riskFlag === 'critical') return 'text-[var(--app-danger)]';
  if (riskFlag === 'watch') return 'text-[var(--app-warning)]';
  return 'text-[var(--app-success)]';
};

const formatStatus = (status: FundHealthRow['status']) =>
  status
    .split('-')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');

export function HomeFundHealthList({ rows, onRowClick }: HomeFundHealthListProps) {
  return (
    <section data-testid="fund-health-list" className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)]">
      <div className="border-b border-[var(--app-border)] px-4 py-3">
        <h2 className="text-sm font-semibold text-[var(--app-text)]">Funds</h2>
        <p className="text-xs text-[var(--app-text-muted)]">Health score, pacing, and performance. Click a row to open Fund Setup detail.</p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-[var(--app-surface-hover)] text-[var(--app-text-muted)]">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium">Fund</th>
              <th className="px-3 py-2 text-left text-xs font-medium">Health</th>
              <th className="px-3 py-2 text-left text-xs font-medium">Status</th>
              <th className="px-3 py-2 text-right text-xs font-medium">Deploy</th>
              <th className="px-3 py-2 text-right text-xs font-medium">Available</th>
              <th className="px-3 py-2 text-right text-xs font-medium">IRR</th>
              <th className="px-3 py-2 text-right text-xs font-medium">TVPI</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-3 py-6 text-center text-sm text-[var(--app-text-muted)]">
                  No funds available.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={row.id}
                  data-testid="fund-health-row"
                  className="cursor-pointer border-t border-[var(--app-border)] hover:bg-[var(--app-surface-hover)]"
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
                  <td className="px-3 py-2">
                    <div className="font-medium text-[var(--app-text)]">{row.displayName}</div>
                  </td>
                  <td className="px-3 py-2">
                    <div className={`inline-flex items-center gap-2 ${getRiskClasses(row.riskFlag)}`}>
                      <span className="inline-block h-2 w-2 rounded-full bg-current" />
                      <span className="font-semibold">{row.healthScore}</span>
                      <span className="text-xs">{row.healthDelta >= 0 ? `+${row.healthDelta}` : row.healthDelta}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-[var(--app-text-muted)]">{formatStatus(row.status)}</td>
                  <td className="px-3 py-2 text-right text-[var(--app-text)]">{row.deploymentPct}%</td>
                  <td className="px-3 py-2 text-right text-[var(--app-text)]">{formatCurrencyCompact(row.availableCapital)}</td>
                  <td className="px-3 py-2 text-right text-[var(--app-text)]">{row.irr.toFixed(1)}%</td>
                  <td className="px-3 py-2 text-right text-[var(--app-text)]">{row.tvpi.toFixed(2)}x</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
