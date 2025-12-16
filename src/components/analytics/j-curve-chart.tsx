'use client'

import { Card } from '@/ui';
import { getJCurveData } from '@/services/analytics/fundAnalyticsService';
import { TrendingUp, Info } from 'lucide-react';

export function JCurveChart() {
  const jCurveData = getJCurveData();
  // Calculate dimensions for the chart
  const maxIRR = Math.max(...jCurveData.map(d => d.cumulativeIRR));
  const minIRR = Math.min(...jCurveData.map(d => d.cumulativeIRR));
  const maxMOIC = Math.max(...jCurveData.map(d => d.cumulativeMOIC));

  const chartWidth = 800;
  const chartHeight = 400;
  const padding = { top: 20, right: 80, bottom: 60, left: 60 };
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  // Scale functions
  const xScale = (index: number) => {
    return padding.left + (index / (jCurveData.length - 1)) * innerWidth;
  };

  const yScaleIRR = (value: number) => {
    const range = maxIRR - minIRR;
    return padding.top + innerHeight - ((value - minIRR) / range) * innerHeight;
  };

  const yScaleMOIC = (value: number) => {
    return padding.top + innerHeight - (value / maxMOIC) * innerHeight;
  };

  // Generate path for IRR line
  const irrPath = jCurveData.map((d, i) => {
    const x = xScale(i);
    const y = yScaleIRR(d.cumulativeIRR);
    return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
  }).join(' ');

  // Generate path for MOIC line
  const moicPath = jCurveData.map((d, i) => {
    const x = xScale(i);
    const y = yScaleMOIC(d.cumulativeMOIC);
    return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
  }).join(' ');

  // Generate Y-axis ticks for IRR
  const irrTicks = [];
  const irrStep = 20;
  for (let i = Math.ceil(minIRR / irrStep) * irrStep; i <= maxIRR; i += irrStep) {
    irrTicks.push(i);
  }

  // Generate Y-axis ticks for MOIC
  const moicTicks = [0, 0.5, 1.0, 1.5, 2.0];

  // Generate X-axis ticks (show every 4th quarter for readability)
  const xTicks = jCurveData.filter((_, i) => i % 4 === 0);

  const currentQuarter = jCurveData[jCurveData.length - 1];

  return (
    <Card padding="lg">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[var(--app-primary)]" />
            <h3 className="text-lg font-semibold">Fund J-Curve Analysis</h3>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-1 bg-[var(--app-primary)] rounded"></div>
              <span className="text-sm text-[var(--app-text-muted)]">IRR</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-1 bg-[var(--app-secondary)] rounded"></div>
              <span className="text-sm text-[var(--app-text-muted)]">MOIC</span>
            </div>
          </div>
        </div>
        <div className="flex items-start gap-2 p-3 rounded-lg bg-[var(--app-info-bg)] border border-[var(--app-info)]/20">
          <Info className="w-4 h-4 text-[var(--app-info)] mt-0.5 flex-shrink-0" />
          <p className="text-xs text-[var(--app-text-muted)]">
            The J-Curve shows the typical venture fund performance pattern: initial negative returns due to fees and deployment,
            followed by value creation as companies mature.
          </p>
        </div>
      </div>

      {/* Current Performance Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-4 rounded-lg bg-[var(--app-surface-hover)]">
          <p className="text-xs text-[var(--app-text-muted)] mb-1">Current IRR</p>
          <p className="text-2xl font-bold text-[var(--app-primary)]">{currentQuarter.cumulativeIRR.toFixed(1)}%</p>
        </div>
        <div className="text-center p-4 rounded-lg bg-[var(--app-surface-hover)]">
          <p className="text-xs text-[var(--app-text-muted)] mb-1">Current MOIC</p>
          <p className="text-2xl font-bold text-[var(--app-secondary)]">{currentQuarter.cumulativeMOIC.toFixed(2)}x</p>
        </div>
        <div className="text-center p-4 rounded-lg bg-[var(--app-surface-hover)]">
          <p className="text-xs text-[var(--app-text-muted)] mb-1">Quarters Since Inception</p>
          <p className="text-2xl font-bold">{currentQuarter.quartersSinceInception}</p>
        </div>
      </div>

      {/* SVG Chart */}
      <div className="overflow-x-auto">
        <svg width={chartWidth} height={chartHeight} className="mx-auto">
          {/* Grid lines */}
          {irrTicks.map(tick => {
            const y = yScaleIRR(tick);
            return (
              <g key={`grid-irr-${tick}`}>
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

          {/* Zero line */}
          <line
            x1={padding.left}
            y1={yScaleIRR(0)}
            x2={chartWidth - padding.right}
            y2={yScaleIRR(0)}
            stroke="var(--app-text-muted)"
            strokeWidth={1.5}
            strokeDasharray="4,4"
          />

          {/* X-axis */}
          <line
            x1={padding.left}
            y1={chartHeight - padding.bottom}
            x2={chartWidth - padding.right}
            y2={chartHeight - padding.bottom}
            stroke="var(--app-border)"
            strokeWidth={2}
          />

          {/* Left Y-axis (IRR) */}
          <line
            x1={padding.left}
            y1={padding.top}
            x2={padding.left}
            y2={chartHeight - padding.bottom}
            stroke="var(--app-border)"
            strokeWidth={2}
          />

          {/* Right Y-axis (MOIC) */}
          <line
            x1={chartWidth - padding.right}
            y1={padding.top}
            x2={chartWidth - padding.right}
            y2={chartHeight - padding.bottom}
            stroke="var(--app-border)"
            strokeWidth={2}
          />

          {/* Y-axis labels (IRR - left) */}
          {irrTicks.map(tick => {
            const y = yScaleIRR(tick);
            return (
              <g key={`tick-irr-${tick}`}>
                <text
                  x={padding.left - 10}
                  y={y + 4}
                  textAnchor="end"
                  fill="var(--app-text-muted)"
                  fontSize="12"
                >
                  {tick}%
                </text>
              </g>
            );
          })}

          {/* Y-axis labels (MOIC - right) */}
          {moicTicks.map(tick => {
            const y = yScaleMOIC(tick);
            return (
              <g key={`tick-moic-${tick}`}>
                <text
                  x={chartWidth - padding.right + 10}
                  y={y + 4}
                  textAnchor="start"
                  fill="var(--app-text-muted)"
                  fontSize="12"
                >
                  {tick.toFixed(1)}x
                </text>
              </g>
            );
          })}

          {/* X-axis labels */}
          {xTicks.map((d, i) => {
            const actualIndex = jCurveData.indexOf(d);
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
                  {d.quarter}
                </text>
              </g>
            );
          })}

          {/* Axis labels */}
          <text
            x={padding.left - 45}
            y={chartHeight / 2}
            textAnchor="middle"
            fill="var(--app-primary)"
            fontSize="13"
            fontWeight="600"
            transform={`rotate(-90, ${padding.left - 45}, ${chartHeight / 2})`}
          >
            IRR (%)
          </text>

          <text
            x={chartWidth - padding.right + 55}
            y={chartHeight / 2}
            textAnchor="middle"
            fill="var(--app-secondary)"
            fontSize="13"
            fontWeight="600"
            transform={`rotate(90, ${chartWidth - padding.right + 55}, ${chartHeight / 2})`}
          >
            MOIC (x)
          </text>

          {/* IRR line */}
          <path
            d={irrPath}
            fill="none"
            stroke="var(--app-primary)"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* MOIC line */}
          <path
            d={moicPath}
            fill="none"
            stroke="var(--app-secondary)"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points - IRR */}
          {jCurveData.map((d, i) => {
            const x = xScale(i);
            const y = yScaleIRR(d.cumulativeIRR);
            const isLatest = i === jCurveData.length - 1;
            return (
              <g key={`point-irr-${i}`}>
                <circle
                  cx={x}
                  cy={y}
                  r={isLatest ? 6 : 3}
                  fill="var(--app-primary)"
                  stroke="var(--app-surface)"
                  strokeWidth={isLatest ? 2 : 0}
                />
              </g>
            );
          })}

          {/* Data points - MOIC */}
          {jCurveData.map((d, i) => {
            const x = xScale(i);
            const y = yScaleMOIC(d.cumulativeMOIC);
            const isLatest = i === jCurveData.length - 1;
            return (
              <g key={`point-moic-${i}`}>
                <circle
                  cx={x}
                  cy={y}
                  r={isLatest ? 6 : 3}
                  fill="var(--app-secondary)"
                  stroke="var(--app-surface)"
                  strokeWidth={isLatest ? 2 : 0}
                />
              </g>
            );
          })}
        </svg>
      </div>

      {/* Timeline insights */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-lg border border-[var(--app-border)]">
          <p className="text-xs text-[var(--app-text-muted)] mb-1">Trough Period</p>
          <p className="font-semibold">Q4 2021</p>
          <p className="text-xs text-[var(--app-danger)]">Lowest IRR: -45%</p>
        </div>
        <div className="p-4 rounded-lg border border-[var(--app-border)]">
          <p className="text-xs text-[var(--app-text-muted)] mb-1">Break-even Point</p>
          <p className="font-semibold">Q1 2023</p>
          <p className="text-xs text-[var(--app-success)]">First positive IRR</p>
        </div>
        <div className="p-4 rounded-lg border border-[var(--app-border)]">
          <p className="text-xs text-[var(--app-text-muted)] mb-1">Time to 1.0x MOIC</p>
          <p className="font-semibold">8 quarters</p>
          <p className="text-xs text-[var(--app-text-subtle)]">Q1 2023</p>
        </div>
      </div>
    </Card>
  );
}
