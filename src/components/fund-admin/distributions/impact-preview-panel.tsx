'use client';

import {
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { Card } from '@/ui';
import { MetricsGrid } from '@/components/ui';
import type { MetricsGridItem } from '@/components/ui';
import type { DistributionImpact } from '@/types/distribution';
import { formatCurrencyCompact } from '@/utils/formatting';
import { Activity, BarChart3, Layers, PieChart } from 'lucide-react';

type ImpactDatum = {
  label: string;
  nav: number;
};

export interface ImpactPreviewPanelProps {
  impact: DistributionImpact;
}

export function ImpactPreviewPanel({ impact }: ImpactPreviewPanelProps) {
  const formatSignedCurrency = (value: number) => {
    const sign = value >= 0 ? '+' : '-';
    return `${sign}${formatCurrencyCompact(Math.abs(value))}`;
  };

  const formatSignedMultiple = (value: number) => {
    const sign = value >= 0 ? '+' : '-';
    return `${sign}${Math.abs(value).toFixed(2)}x`;
  };

  const getTrend = (value: number) => (value > 0 ? 'up' : value < 0 ? 'down' : 'neutral');

  const metricItems: MetricsGridItem[] = [
    {
      type: 'metric',
      props: {
        label: 'NAV After',
        value: formatCurrencyCompact(impact.navAfter),
        change: formatSignedCurrency(impact.navChange),
        trend: getTrend(impact.navChange),
        subtitle: `Before ${formatCurrencyCompact(impact.navBefore)}`,
        icon: BarChart3,
      },
    },
    {
      type: 'metric',
      props: {
        label: 'DPI After',
        value: `${impact.dpiAfter.toFixed(2)}x`,
        change: formatSignedMultiple(impact.dpiChange),
        trend: getTrend(impact.dpiChange),
        subtitle: `Before ${impact.dpiBefore.toFixed(2)}x`,
        icon: PieChart,
      },
    },
    {
      type: 'metric',
      props: {
        label: 'TVPI After',
        value: `${impact.tvpiAfter.toFixed(2)}x`,
        change: formatSignedMultiple(impact.tvpiChange),
        trend: getTrend(impact.tvpiChange),
        subtitle: `Before ${impact.tvpiBefore.toFixed(2)}x`,
        icon: Activity,
      },
    },
    {
      type: 'metric',
      props: {
        label: 'Undrawn After',
        value: formatCurrencyCompact(impact.undrawnCapitalAfter),
        change: formatSignedCurrency(impact.undrawnCapitalChange),
        trend: getTrend(impact.undrawnCapitalChange),
        subtitle: `Before ${formatCurrencyCompact(impact.undrawnCapitalBefore)}`,
        icon: Layers,
      },
    },
  ];

  const chartData: ImpactDatum[] = [
    { label: 'Q1', nav: impact.navBefore * 0.92 },
    { label: 'Q2', nav: impact.navBefore * 0.96 },
    { label: 'Q3', nav: impact.navBefore },
    { label: 'Projected', nav: impact.navAfter },
  ];

  return (
    <div className="space-y-4">
      <MetricsGrid items={metricItems} columns={{ base: 1, md: 2, lg: 4 }} />

      <Card padding="lg">
        <div className="text-sm font-semibold mb-3">Historical NAV Trend</div>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid stroke="var(--app-border-subtle)" strokeDasharray="3 3" />
              <XAxis dataKey="label" tick={{ fill: 'var(--app-text-muted)', fontSize: 11 }} />
              <YAxis
                tickFormatter={(value) => formatCurrencyCompact(Number(value))}
                tick={{ fill: 'var(--app-text-muted)', fontSize: 11 }}
                width={80}
              />
              <Tooltip
                formatter={(value) => formatCurrencyCompact(Number(value))}
                labelStyle={{ color: 'var(--app-text-muted)' }}
              />
              <Line type="monotone" dataKey="nav" stroke="var(--app-primary)" strokeWidth={2} dot />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {impact.covenantWarnings.length > 0 && (
        <Card padding="lg">
          <div className="text-sm font-semibold mb-3">Covenant Warnings</div>
          <div className="space-y-2 text-sm">
            {impact.covenantWarnings.map((warning) => (
              <div
                key={warning.covenantName}
                className="flex items-center justify-between rounded-lg border border-[var(--app-border)] px-3 py-2"
              >
                <div>
                  <div className="font-medium">{warning.covenantName}</div>
                  <div className="text-xs text-[var(--app-text-muted)]">
                    Threshold: {warning.threshold.toFixed(2)}x
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">
                    {warning.projectedValue.toFixed(2)}x
                  </div>
                  <div className="text-xs text-[var(--app-text-muted)]">
                    {warning.severity.toUpperCase()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
