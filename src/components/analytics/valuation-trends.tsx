'use client'

import { Card } from '@/ui';
import { getValuationTrends } from '@/services/analytics/fundAnalyticsService';
import { DollarSign } from 'lucide-react';
import { useFund } from '@/contexts/fund-context';
import { SectionHeader } from '@/ui/composites';

export function ValuationTrends() {
  const { selectedFund } = useFund();
  const valuationTrends = getValuationTrends(selectedFund?.id);
  // Calculate dimensions for the chart
  const maxValue = Math.max(...valuationTrends.map(d => d.portfolioValue));
  const maxTVPI = Math.max(...valuationTrends.map(d => d.tvpi));

  const chartWidth = 900;
  const chartHeight = 400;
  const padding = { top: 20, right: 80, bottom: 60, left: 80 };
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  // Scale functions
  const xScale = (index: number) => {
    return padding.left + (index / (valuationTrends.length - 1)) * innerWidth;
  };

  const yScaleValue = (value: number) => {
    return padding.top + innerHeight - (value / maxValue) * innerHeight;
  };

  const yScaleTVPI = (value: number) => {
    return padding.top + innerHeight - (value / maxTVPI) * innerHeight;
  };

  // Generate path for unrealized value area
  const unrealizedValuePath = valuationTrends.map((d, i) => {
    const x = xScale(i);
    const y = yScaleValue(d.unrealizedValue);
    return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
  }).join(' ');

  // Generate path for realized value area
  const realizedValuePath = valuationTrends.map((d, i) => {
    const x = xScale(i);
    const y = yScaleValue(d.realizedValue);
    return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
  }).join(' ');

  // Generate path for deployed capital line
  const deployedCapitalPath = valuationTrends.map((d, i) => {
    const x = xScale(i);
    const y = yScaleValue(d.deployedCapital);
    return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
  }).join(' ');

  // Generate path for TVPI line (right axis)
  const tvpiPath = valuationTrends.map((d, i) => {
    const x = xScale(i);
    const y = yScaleTVPI(d.tvpi);
    return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
  }).join(' ');

  // Generate stacked area paths for realized and unrealized
  const realizedAreaPath = valuationTrends.map((d, i) => {
    const x = xScale(i);
    const y = yScaleValue(d.realizedValue);
    if (i === 0) return `M ${x} ${chartHeight - padding.bottom}`;
    return `L ${x} ${y}`;
  }).join(' ') + ` L ${xScale(valuationTrends.length - 1)} ${chartHeight - padding.bottom} L ${padding.left} ${chartHeight - padding.bottom} Z`;

  const unrealizedAreaPath = valuationTrends.map((d, i) => {
    const x = xScale(i);
    const yBottom = yScaleValue(d.realizedValue);
    const yTop = yScaleValue(d.realizedValue + d.unrealizedValue);
    if (i === 0) return `M ${x} ${yBottom}`;
    return `L ${x} ${yTop}`;
  }).join(' ') + ` L ${xScale(valuationTrends.length - 1)} ${yScaleValue(valuationTrends[valuationTrends.length - 1].realizedValue)} ` +
    valuationTrends.slice().reverse().map((d, i) => {
      const actualIndex = valuationTrends.length - 1 - i;
      const x = xScale(actualIndex);
      const y = yScaleValue(d.realizedValue);
      return `L ${x} ${y}`;
    }).join(' ') + ' Z';

  // Y-axis ticks for value (left axis)
  const valueTicks = [];
  const valueStep = 10000000; // 10M
  for (let i = 0; i <= maxValue; i += valueStep) {
    valueTicks.push(i);
  }

  // Y-axis ticks for TVPI (right axis)
  const tvpiTicks = [0, 0.5, 1.0, 1.5, 2.0, 2.5];

  // X-axis ticks (show every 4th quarter)
  const xTicks = valuationTrends.filter((_, i) => i % 4 === 0 || i === valuationTrends.length - 1);

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(0)}M`;
    }
    return `$${(value / 1000).toFixed(0)}k`;
  };

  const latestData = valuationTrends[valuationTrends.length - 1];

  return (
    <Card padding="lg">
      <div className="mb-6">
        <SectionHeader
          className="mb-4"
          title={
            <span className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-[var(--app-primary)]" />
              <span>Portfolio Valuation Trends</span>
            </span>
          }
          action={
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="w-4 h-1 bg-[var(--app-success)] rounded"></div>
                <span className="text-sm text-[var(--app-text-muted)]">Realized Value</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-1 bg-[var(--app-primary)] rounded"></div>
                <span className="text-sm text-[var(--app-text-muted)]">Unrealized Value</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-1 bg-[var(--app-text-muted)] rounded" style={{ borderTop: '2px dashed var(--app-text-muted)' }}></div>
                <span className="text-sm text-[var(--app-text-muted)]">Deployed Capital</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-1 bg-[var(--app-secondary)] rounded"></div>
                <span className="text-sm text-[var(--app-text-muted)]">TVPI</span>
              </div>
            </div>
          }
        />
      </div>

      {/* Current Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-lg bg-[var(--app-surface-hover)]">
          <p className="text-xs text-[var(--app-text-muted)] mb-1">Total Portfolio Value</p>
          <p className="text-xl font-bold">{formatCurrency(latestData.portfolioValue)}</p>
        </div>
        <div className="p-4 rounded-lg bg-[var(--app-success-bg)]">
          <p className="text-xs text-[var(--app-text-muted)] mb-1">Realized Value</p>
          <p className="text-xl font-bold text-[var(--app-success)]">{formatCurrency(latestData.realizedValue)}</p>
        </div>
        <div className="p-4 rounded-lg bg-[var(--app-primary)]/10">
          <p className="text-xs text-[var(--app-text-muted)] mb-1">Unrealized Value</p>
          <p className="text-xl font-bold text-[var(--app-primary)]">{formatCurrency(latestData.unrealizedValue)}</p>
        </div>
        <div className="p-4 rounded-lg bg-[var(--app-secondary)]/10">
          <p className="text-xs text-[var(--app-text-muted)] mb-1">Current TVPI</p>
          <p className="text-xl font-bold text-[var(--app-secondary)]">{latestData.tvpi.toFixed(2)}x</p>
        </div>
      </div>

      {/* SVG Chart */}
      <div className="overflow-x-auto">
        <svg width={chartWidth} height={chartHeight} className="mx-auto">
          {/* Grid lines */}
          {valueTicks.map(tick => {
            const y = yScaleValue(tick);
            return (
              <g key={`grid-${tick}`}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={chartWidth - padding.right}
                  y2={y}
                  stroke="var(--app-border)"
                  strokeDasharray="2,2"
                  opacity={0.3}
                />
              </g>
            );
          })}

          {/* X-axis */}
          <line
            x1={padding.left}
            y1={chartHeight - padding.bottom}
            x2={chartWidth - padding.right}
            y2={chartHeight - padding.bottom}
            stroke="var(--app-border)"
            strokeWidth={2}
          />

          {/* Left Y-axis (Value) */}
          <line
            x1={padding.left}
            y1={padding.top}
            x2={padding.left}
            y2={chartHeight - padding.bottom}
            stroke="var(--app-border)"
            strokeWidth={2}
          />

          {/* Right Y-axis (TVPI) */}
          <line
            x1={chartWidth - padding.right}
            y1={padding.top}
            x2={chartWidth - padding.right}
            y2={chartHeight - padding.bottom}
            stroke="var(--app-border)"
            strokeWidth={2}
          />

          {/* Y-axis labels (Value - left) */}
          {valueTicks.map(tick => {
            const y = yScaleValue(tick);
            return (
              <g key={`tick-value-${tick}`}>
                <text
                  x={padding.left - 10}
                  y={y + 4}
                  textAnchor="end"
                  fill="var(--app-text-muted)"
                  fontSize="11"
                >
                  {formatCurrency(tick)}
                </text>
              </g>
            );
          })}

          {/* Y-axis labels (TVPI - right) */}
          {tvpiTicks.map(tick => {
            const y = yScaleTVPI(tick);
            return (
              <g key={`tick-tvpi-${tick}`}>
                <text
                  x={chartWidth - padding.right + 10}
                  y={y + 4}
                  textAnchor="start"
                  fill="var(--app-text-muted)"
                  fontSize="11"
                >
                  {tick.toFixed(1)}x
                </text>
              </g>
            );
          })}

          {/* X-axis labels */}
          {xTicks.map((d, i) => {
            const actualIndex = valuationTrends.indexOf(d);
            const x = xScale(actualIndex);
            return (
              <g key={`tick-x-${i}`}>
                <text
                  x={x}
                  y={chartHeight - padding.bottom + 20}
                  textAnchor="middle"
                  fill="var(--app-text-muted)"
                  fontSize="11"
                >
                  {d.date}
                </text>
              </g>
            );
          })}

          {/* Axis labels */}
          <text
            x={padding.left - 60}
            y={chartHeight / 2}
            textAnchor="middle"
            fill="var(--app-text)"
            fontSize="12"
            fontWeight="600"
            transform={`rotate(-90, ${padding.left - 60}, ${chartHeight / 2})`}
          >
            Portfolio Value
          </text>

          <text
            x={chartWidth - padding.right + 60}
            y={chartHeight / 2}
            textAnchor="middle"
            fill="var(--app-secondary)"
            fontSize="12"
            fontWeight="600"
            transform={`rotate(90, ${chartWidth - padding.right + 60}, ${chartHeight / 2})`}
          >
            TVPI (x)
          </text>

          {/* Stacked areas */}
          {/* Realized value area (bottom) */}
          <path
            d={realizedAreaPath}
            fill="var(--app-success)"
            opacity={0.3}
          />

          {/* Unrealized value area (top) */}
          <path
            d={unrealizedAreaPath}
            fill="var(--app-primary)"
            opacity={0.3}
          />

          {/* Deployed capital line (dashed) */}
          <path
            d={deployedCapitalPath}
            fill="none"
            stroke="var(--app-text-muted)"
            strokeWidth={2}
            strokeDasharray="4,4"
          />

          {/* Unrealized value line */}
          <path
            d={unrealizedValuePath}
            fill="none"
            stroke="var(--app-primary)"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Realized value line */}
          <path
            d={realizedValuePath}
            fill="none"
            stroke="var(--app-success)"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* TVPI line (right axis) */}
          <path
            d={tvpiPath}
            fill="none"
            stroke="var(--app-secondary)"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points on TVPI line */}
          {valuationTrends.map((d, i) => {
            const x = xScale(i);
            const y = yScaleTVPI(d.tvpi);
            const isLatest = i === valuationTrends.length - 1;
            return (
              <g key={`point-tvpi-${i}`}>
                <circle
                  cx={x}
                  cy={y}
                  r={isLatest ? 5 : 2}
                  fill="var(--app-secondary)"
                  stroke="var(--app-surface)"
                  strokeWidth={isLatest ? 2 : 0}
                />
              </g>
            );
          })}
        </svg>
      </div>

      {/* Growth Metrics */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-lg border border-[var(--app-border)]">
          <p className="text-xs text-[var(--app-text-muted)] mb-1">Total Value Growth</p>
          <p className="font-semibold text-[var(--app-success)]">
            +{(((latestData.portfolioValue - valuationTrends[0].portfolioValue) / valuationTrends[0].portfolioValue) * 100).toFixed(1)}%
          </p>
          <p className="text-xs text-[var(--app-text-subtle)] mt-1">Since inception</p>
        </div>
        <div className="p-4 rounded-lg border border-[var(--app-border)]">
          <p className="text-xs text-[var(--app-text-muted)] mb-1">Unrealized Appreciation</p>
          <p className="font-semibold text-[var(--app-primary)]">
            {formatCurrency(latestData.unrealizedValue - latestData.deployedCapital)}
          </p>
          <p className="text-xs text-[var(--app-text-subtle)] mt-1">
            {(((latestData.unrealizedValue - latestData.deployedCapital) / latestData.deployedCapital) * 100).toFixed(1)}% markup
          </p>
        </div>
        <div className="p-4 rounded-lg border border-[var(--app-border)]">
          <p className="text-xs text-[var(--app-text-muted)] mb-1">Realized Returns</p>
          <p className="font-semibold text-[var(--app-success)]">{formatCurrency(latestData.realizedValue)}</p>
          <p className="text-xs text-[var(--app-text-subtle)] mt-1">Cumulative distributions</p>
        </div>
      </div>
    </Card>
  );
}
