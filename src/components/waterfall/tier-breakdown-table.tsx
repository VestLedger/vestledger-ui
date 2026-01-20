'use client';

import type { WaterfallScenario } from '@/types/waterfall';
import { formatCurrencyCompact } from '@/utils/formatting';

const formatTierType = (type: string) =>
  type
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

export interface TierBreakdownTableProps {
  scenario: WaterfallScenario | null;
}

export function TierBreakdownTable({ scenario }: TierBreakdownTableProps) {
  const results = scenario?.results;
  const tiers = results?.tierBreakdown ?? [];
  const total = results?.totalExitValue || scenario?.exitValue || 0;

  if (!scenario || tiers.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-[var(--app-border)] p-6 text-center text-sm text-[var(--app-text-muted)]">
        Tier breakdown will appear once calculations are available.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)]">
      <table className="w-full text-sm">
        <thead className="bg-[var(--app-surface-hover)] text-[var(--app-text-muted)]">
          <tr>
            <th className="px-4 py-3 text-left font-medium">Tier</th>
            <th className="px-4 py-3 text-left font-medium">Type</th>
            <th className="px-4 py-3 text-right font-medium">Total</th>
            <th className="px-4 py-3 text-right font-medium">LP</th>
            <th className="px-4 py-3 text-right font-medium">GP</th>
            <th className="px-4 py-3 text-right font-medium">%</th>
            <th className="px-4 py-3 text-right font-medium">Cumulative</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--app-border-subtle)]">
          {tiers.map((tier) => {
            const percent = total > 0 ? (tier.totalAmount / total) * 100 : 0;
            return (
              <tr key={tier.tierId} className="hover:bg-[var(--app-surface-hover)]">
                <td className="px-4 py-3 font-medium">{tier.tierName}</td>
                <td className="px-4 py-3 text-[var(--app-text-muted)]">
                  {formatTierType(tier.tierType)}
                </td>
                <td className="px-4 py-3 text-right">{formatCurrencyCompact(tier.totalAmount)}</td>
                <td className="px-4 py-3 text-right">{formatCurrencyCompact(tier.lpAmount)}</td>
                <td className="px-4 py-3 text-right">{formatCurrencyCompact(tier.gpAmount)}</td>
                <td className="px-4 py-3 text-right">{percent.toFixed(1)}%</td>
                <td className="px-4 py-3 text-right">{formatCurrencyCompact(tier.cumulativeAmount)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
