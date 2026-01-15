'use client';

import type { WaterfallScenario } from '@/types/waterfall';
import { formatCurrencyCompact } from '@/utils/formatting';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipProps,
} from 'recharts';

const TIER_COLORS = [
  'var(--app-primary)',
  'var(--app-secondary)',
  'var(--app-accent)',
  'var(--app-info)',
  'var(--app-success)',
  'var(--app-warning)',
];

export interface WaterfallBarChartProps {
  scenario: WaterfallScenario | null;
  printMode?: boolean;
}

type WaterfallChartDatum = {
  name: string;
  type: string;
  amount: number;
  start: number;
  end: number;
  lpAmount: number;
  gpAmount: number;
};

const formatTierType = (type: string) =>
  type
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

function WaterfallTooltip({
  active,
  payload,
}: TooltipProps<number | string, string>) {
  if (!active || !payload || payload.length === 0) return null;

  const data = payload[0]?.payload as WaterfallChartDatum | undefined;
  if (!data) return null;

  return (
    <div className="rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2 text-xs shadow-lg">
      <div className="font-semibold text-[var(--app-text)]">{data.name}</div>
      <div className="text-[var(--app-text-muted)]">{formatTierType(data.type)}</div>
      <div className="mt-2 space-y-1 text-[var(--app-text)]">
        <div className="flex items-center justify-between gap-4">
          <span>Tier Amount</span>
          <span className="font-medium">{formatCurrencyCompact(data.amount)}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span>LP Share</span>
          <span className="font-medium">{formatCurrencyCompact(data.lpAmount)}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span>GP Share</span>
          <span className="font-medium">{formatCurrencyCompact(data.gpAmount)}</span>
        </div>
        <div className="flex items-center justify-between gap-4 text-[var(--app-text-muted)]">
          <span>Cumulative</span>
          <span className="font-medium">{formatCurrencyCompact(data.end)}</span>
        </div>
      </div>
    </div>
  );
}

export function WaterfallBarChart({ scenario, printMode }: WaterfallBarChartProps) {
  const results = scenario?.results;
  const tiers = results?.tierBreakdown ?? [];

  if (!scenario || tiers.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-[var(--app-border)] p-6 text-center text-sm text-[var(--app-text-muted)]">
        Run a scenario to see waterfall tier flow.
      </div>
    );
  }

  let runningTotal = 0;
  const chartData: WaterfallChartDatum[] = tiers.map((tier) => {
    const amount = tier.totalAmount ?? 0;
    const end = Number.isFinite(tier.cumulativeAmount)
      ? tier.cumulativeAmount
      : runningTotal + amount;
    const start = Number.isFinite(tier.cumulativeAmount)
      ? end - amount
      : runningTotal;

    runningTotal = end;

    return {
      name: tier.tierName,
      type: tier.tierType,
      amount,
      start: Math.max(0, start),
      end,
      lpAmount: tier.lpAmount ?? 0,
      gpAmount: tier.gpAmount ?? 0,
    };
  });

  return (
    <div
      className={[
        'rounded-lg border border-[var(--app-border)] p-4',
        printMode ? 'bg-white' : 'bg-[var(--app-surface)]',
      ].join(' ')}
    >
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} barSize={32} margin={{ left: 8, right: 16 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={printMode ? 'rgba(0,0,0,0.08)' : 'var(--app-border-subtle)'}
            />
            <XAxis
              dataKey="name"
              tick={{ fill: 'var(--app-text-muted)', fontSize: 11 }}
              interval={0}
              tickLine={false}
              axisLine={{ stroke: 'var(--app-border)' }}
            />
            <YAxis
              tickFormatter={(value) => formatCurrencyCompact(Number(value))}
              tick={{ fill: 'var(--app-text-muted)', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={80}
            />
            <Tooltip
              content={<WaterfallTooltip />}
              cursor={{ fill: printMode ? 'rgba(0,0,0,0.05)' : 'var(--app-surface-hover)' }}
            />
            <Bar
              dataKey="start"
              stackId="waterfall"
              fill="transparent"
              isAnimationActive={false}
            />
            <Bar
              dataKey="amount"
              stackId="waterfall"
              radius={[6, 6, 6, 6]}
              activeBar={{ stroke: 'var(--app-primary)', strokeWidth: 2 }}
              isAnimationActive={!printMode}
            >
              {chartData.map((entry, index) => (
                <Cell key={`${entry.name}-${index}`} fill={TIER_COLORS[index % TIER_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <table className="sr-only" aria-label="Waterfall tier breakdown">
        <caption>Waterfall tier breakdown</caption>
        <thead>
          <tr>
            <th scope="col">Tier</th>
            <th scope="col">Type</th>
            <th scope="col">Tier Amount</th>
            <th scope="col">LP Share</th>
            <th scope="col">GP Share</th>
            <th scope="col">Cumulative</th>
          </tr>
        </thead>
        <tbody>
          {chartData.map((entry) => (
            <tr key={entry.name}>
              <td>{entry.name}</td>
              <td>{formatTierType(entry.type)}</td>
              <td>{formatCurrencyCompact(entry.amount)}</td>
              <td>{formatCurrencyCompact(entry.lpAmount)}</td>
              <td>{formatCurrencyCompact(entry.gpAmount)}</td>
              <td>{formatCurrencyCompact(entry.end)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
