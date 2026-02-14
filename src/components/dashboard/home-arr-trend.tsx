'use client';

import { AreaChart, Area, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { PortfolioRevenueTrendPoint } from '@/data/mocks/hooks/dashboard-data';
import { CompactLaneHeader } from '@/ui/composites';

interface HomeARRTrendProps {
  points: PortfolioRevenueTrendPoint[];
}

export function HomeARRTrend({ points }: HomeARRTrendProps) {
  const start = points[0]?.arr ?? 0;
  const end = points[points.length - 1]?.arr ?? 0;
  const growth = start > 0 ? ((end - start) / start) * 100 : 0;

  return (
    <section data-testid="gp-home-arr-trend" className="overflow-hidden rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)]">
      <CompactLaneHeader
        title="Aggregate Portfolio ARR Trend"
        subtitle="Revenue makers scaled from Aug to current month"
        badge={`${growth >= 0 ? '+' : ''}${growth.toFixed(1)}%`}
        tone="portfolio"
      />

      <div className="px-3 py-3">
        <div className="mb-2 flex items-end justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.14em] text-[var(--app-text-subtle)]">Current ARR</p>
            <p className="text-xl font-semibold text-[var(--app-text)]">${end.toFixed(0)}M</p>
          </div>
          <p className="text-xs text-[var(--app-text-muted)]">from ${start.toFixed(0)}M in {points[0]?.month}</p>
        </div>

        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={points}>
              <defs>
                <linearGradient id="gpHomeArrGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--app-success)" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="var(--app-success)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="month"
                tick={{ fill: 'var(--app-text-subtle)', fontSize: 11 }}
                axisLine={{ stroke: 'var(--app-border)' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: 'var(--app-text-subtle)', fontSize: 11 }}
                axisLine={{ stroke: 'var(--app-border)' }}
                tickLine={false}
                width={32}
              />
              <Tooltip
                formatter={(value: number) => [`$${value.toFixed(1)}M`, 'ARR']}
                contentStyle={{
                  borderRadius: '12px',
                  borderColor: 'var(--app-border)',
                  backgroundColor: 'var(--app-surface)',
                  color: 'var(--app-text)',
                }}
              />
              <Area type="monotone" dataKey="arr" fill="url(#gpHomeArrGradient)" stroke="transparent" />
              <Line
                type="monotone"
                dataKey="arr"
                stroke="var(--app-success)"
                strokeWidth={3}
                dot={{ r: 3, fill: 'var(--app-success)' }}
                activeDot={{ r: 4, fill: 'var(--app-success)' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
