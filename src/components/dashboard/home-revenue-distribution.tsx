'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { RevenueDistributionSlice } from '@/data/mocks/hooks/dashboard-data';
import { CompactLaneHeader } from '@/ui/composites';
import { formatCurrencyCompact } from '@/utils/formatting';

interface HomeRevenueDistributionProps {
  slices: RevenueDistributionSlice[];
}

export function HomeRevenueDistribution({ slices }: HomeRevenueDistributionProps) {
  const total = slices.reduce((sum, item) => sum + item.value, 0);

  return (
    <section data-testid="gp-home-revenue-distribution" className="overflow-hidden rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)]">
      <CompactLaneHeader
        title="Revenue Distribution"
        subtitle="Which portfolio companies drive the most ARR"
        badge={formatCurrencyCompact(total * 1_000_000)}
        tone="portfolio"
      />

      <div className="grid gap-3 px-3 py-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)]">
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={slices}
                cx="50%"
                cy="50%"
                innerRadius={48}
                outerRadius={78}
                paddingAngle={2}
                dataKey="value"
              >
                {slices.map((slice) => (
                  <Cell key={slice.id} fill={slice.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => [`$${value.toFixed(1)}M`, 'ARR']}
                contentStyle={{
                  borderRadius: '12px',
                  borderColor: 'var(--app-border)',
                  backgroundColor: 'var(--app-surface)',
                  color: 'var(--app-text)',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-2">
          {slices.map((slice) => {
            const share = total > 0 ? (slice.value / total) * 100 : 0;
            return (
              <div key={slice.id} className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2">
                <div className="mb-1 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: slice.color }} />
                    <span className="font-semibold text-[var(--app-text)]">{slice.name}</span>
                  </div>
                  <span className="text-[var(--app-text-subtle)]">{share.toFixed(0)}%</span>
                </div>
                <p className="text-sm font-semibold text-[var(--app-text)]">{`$${slice.value.toFixed(1)}M`}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
