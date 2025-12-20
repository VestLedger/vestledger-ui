'use client'

import { Card, Progress } from '@/ui';
import { getCurrentFundMetrics, getDeploymentPacing } from '@/services/analytics/fundAnalyticsService';
import { Activity, TrendingUp } from 'lucide-react';

export function DeploymentPacing() {
  const deploymentPacing = getDeploymentPacing();
  const currentFund = getCurrentFundMetrics();
  // Calculate dimensions for the chart
  const maxDeployed = Math.max(...deploymentPacing.map(d => d.deployed));
  const maxCumulative = Math.max(...deploymentPacing.map(d => d.cumulativeDeployed));

  const chartWidth = 900;
  const chartHeight = 400;
  const padding = { top: 20, right: 80, bottom: 80, left: 80 };
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  const barWidth = innerWidth / deploymentPacing.length;

  // Scale functions
  const xScale = (index: number) => {
    return padding.left + index * barWidth + barWidth / 2;
  };

  const yScaleDeployed = (value: number) => {
    return padding.top + innerHeight - (value / maxDeployed) * innerHeight;
  };

  const yScaleCumulative = (value: number) => {
    return padding.top + innerHeight - (value / maxCumulative) * innerHeight;
  };

  // Generate path for cumulative deployment line
  const cumulativePath = deploymentPacing.map((d, i) => {
    const x = xScale(i);
    const y = yScaleCumulative(d.cumulativeDeployed);
    return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
  }).join(' ');

  // Y-axis ticks for deployed (left axis)
  const deployedTicks = [];
  const deployedStep = 1000000; // 1M
  for (let i = 0; i <= maxDeployed; i += deployedStep) {
    deployedTicks.push(i);
  }

  // Y-axis ticks for cumulative (right axis)
  const cumulativeTicks = [];
  const cumulativeStep = 5000000; // 5M
  for (let i = 0; i <= maxCumulative; i += cumulativeStep) {
    cumulativeTicks.push(i);
  }

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(0)}M`;
    }
    return `$${(value / 1000).toFixed(0)}k`;
  };

  // Calculate deployment stats
  const totalDeals = deploymentPacing.reduce((sum, d) => sum + d.numberOfDeals, 0);
  const avgQuarterlyDeployment = deploymentPacing.reduce((sum, d) => sum + d.deployed, 0) / deploymentPacing.length;
  const peakQuarter = deploymentPacing.reduce((max, d) => d.deployed > max.deployed ? d : max, deploymentPacing[0]);

  const deploymentVelocity = currentFund.deploymentRate / deploymentPacing.length * 4; // Annualized deployment rate

  return (
    <Card padding="lg">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-[var(--app-primary)]" />
            <h3 className="text-lg font-semibold">Investment Pacing & Deployment</h3>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-3 bg-[var(--app-primary)] rounded"></div>
              <span className="text-sm text-[var(--app-text-muted)]">Quarterly Deployment</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-1 bg-[var(--app-secondary)] rounded"></div>
              <span className="text-sm text-[var(--app-text-muted)]">Cumulative</span>
            </div>
          </div>
        </div>
      </div>

      {/* Deployment Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-lg bg-[var(--app-surface-hover)]">
          <p className="text-xs text-[var(--app-text-muted)] mb-1">Total Deployed</p>
          <p className="text-xl font-bold">{formatCurrency(currentFund.deployed)}</p>
          <p className="text-xs text-[var(--app-text-subtle)] mt-1">{currentFund.deploymentRate.toFixed(1)}% of fund</p>
        </div>
        <div className="p-4 rounded-lg bg-[var(--app-surface-hover)]">
          <p className="text-xs text-[var(--app-text-muted)] mb-1">Total Investments</p>
          <p className="text-xl font-bold">{totalDeals}</p>
          <p className="text-xs text-[var(--app-text-subtle)] mt-1">{formatCurrency(currentFund.averageInvestmentSize)} avg</p>
        </div>
        <div className="p-4 rounded-lg bg-[var(--app-surface-hover)]">
          <p className="text-xs text-[var(--app-text-muted)] mb-1">Avg Quarterly Pace</p>
          <p className="text-xl font-bold">{formatCurrency(avgQuarterlyDeployment)}</p>
          <p className="text-xs text-[var(--app-text-subtle)] mt-1">{deploymentVelocity.toFixed(1)}% annually</p>
        </div>
        <div className="p-4 rounded-lg bg-[var(--app-surface-hover)]">
          <p className="text-xs text-[var(--app-text-muted)] mb-1">Peak Quarter</p>
          <p className="text-xl font-bold">{formatCurrency(peakQuarter.deployed)}</p>
          <p className="text-xs text-[var(--app-text-subtle)] mt-1">{peakQuarter.quarter}</p>
        </div>
      </div>

      {/* SVG Chart */}
      <div className="overflow-x-auto">
        <svg width={chartWidth} height={chartHeight} className="mx-auto">
          {/* Grid lines */}
          {deployedTicks.map(tick => {
            const y = yScaleDeployed(tick);
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

          {/* Left Y-axis (Deployed) */}
          <line
            x1={padding.left}
            y1={padding.top}
            x2={padding.left}
            y2={chartHeight - padding.bottom}
            stroke="var(--app-border)"
            strokeWidth={2}
          />

          {/* Right Y-axis (Cumulative) */}
          <line
            x1={chartWidth - padding.right}
            y1={padding.top}
            x2={chartWidth - padding.right}
            y2={chartHeight - padding.bottom}
            stroke="var(--app-border)"
            strokeWidth={2}
          />

          {/* Y-axis labels (Deployed - left) */}
          {deployedTicks.map(tick => {
            const y = yScaleDeployed(tick);
            return (
              <g key={`tick-deployed-${tick}`}>
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

          {/* Y-axis labels (Cumulative - right) */}
          {cumulativeTicks.map(tick => {
            const y = yScaleCumulative(tick);
            return (
              <g key={`tick-cumulative-${tick}`}>
                <text
                  x={chartWidth - padding.right + 10}
                  y={y + 4}
                  textAnchor="start"
                  fill="var(--app-text-muted)"
                  fontSize="11"
                >
                  {formatCurrency(tick)}
                </text>
              </g>
            );
          })}

          {/* X-axis labels */}
          {deploymentPacing.map((d, i) => {
            const x = xScale(i);
            // Show every other quarter label to avoid crowding
            if (i % 2 === 0 || i === deploymentPacing.length - 1) {
              return (
                <g key={`tick-x-${i}`}>
                  <text
                    x={x}
                    y={chartHeight - padding.bottom + 20}
                    textAnchor="end"
                    fill="var(--app-text-muted)"
                    fontSize="10"
                    transform={`rotate(-45, ${x}, ${chartHeight - padding.bottom + 20})`}
                  >
                    {d.quarter}
                  </text>
                </g>
              );
            }
            return null;
          })}

          {/* Axis labels */}
          <text
            x={padding.left - 60}
            y={chartHeight / 2}
            textAnchor="middle"
            fill="var(--app-primary)"
            fontSize="12"
            fontWeight="600"
            transform={`rotate(-90, ${padding.left - 60}, ${chartHeight / 2})`}
          >
            Quarterly Deployment
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
            Cumulative Deployed
          </text>

          {/* Bars for quarterly deployment */}
          {deploymentPacing.map((d, i) => {
            const x = xScale(i);
            const y = yScaleDeployed(d.deployed);
            const height = chartHeight - padding.bottom - y;
            const barPadding = barWidth * 0.2;

            return (
              <g key={`bar-${i}`}>
                <rect
                  x={x - barWidth / 2 + barPadding / 2}
                  y={y}
                  width={barWidth - barPadding}
                  height={height}
                  fill={d.numberOfDeals > 0 ? 'var(--app-primary)' : 'var(--app-border)'}
                  opacity={d.numberOfDeals > 0 ? 0.8 : 0.3}
                  rx={2}
                />
                {/* Deal count label on bars with investments */}
                {d.numberOfDeals > 0 && (
                  <text
                    x={x}
                    y={y - 5}
                    textAnchor="middle"
                    fill="var(--app-text)"
                    fontSize="10"
                    fontWeight="600"
                  >
                    {d.numberOfDeals}
                  </text>
                )}
              </g>
            );
          })}

          {/* Cumulative line */}
          <path
            d={cumulativePath}
            fill="none"
            stroke="var(--app-secondary)"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points on cumulative line */}
          {deploymentPacing.map((d, i) => {
            const x = xScale(i);
            const y = yScaleCumulative(d.cumulativeDeployed);
            return (
              <g key={`point-${i}`}>
                <circle
                  cx={x}
                  cy={y}
                  r={3}
                  fill="var(--app-secondary)"
                  stroke="var(--app-surface)"
                  strokeWidth={1}
                />
              </g>
            );
          })}

          {/* Target deployment line (if fund size is available) */}
          <line
            x1={padding.left}
            y1={yScaleCumulative(currentFund.fundSize)}
            x2={chartWidth - padding.right}
            y2={yScaleCumulative(currentFund.fundSize)}
            stroke="var(--app-warning)"
            strokeWidth={2}
            strokeDasharray="6,4"
            opacity={0.5}
          />
          <text
            x={chartWidth - padding.right - 10}
            y={yScaleCumulative(currentFund.fundSize) - 8}
            textAnchor="end"
            fill="var(--app-warning)"
            fontSize="11"
            fontWeight="600"
          >
            Fund Size Target
          </text>
        </svg>
      </div>

      {/* Deployment Progress */}
      <div className="mt-6 space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Fund Deployment Progress</span>
            <span className="text-sm font-semibold">{currentFund.deploymentRate.toFixed(1)}%</span>
          </div>
          <Progress
            value={currentFund.deploymentRate}
            maxValue={100}
            className="mb-2"
            aria-label={`Fund deployment progress ${currentFund.deploymentRate.toFixed(1)}%`}
          />
          <div className="grid grid-cols-3 gap-4 text-xs">
            <div>
              <p className="text-[var(--app-text-muted)]">Deployed</p>
              <p className="font-medium">{formatCurrency(currentFund.deployed)}</p>
            </div>
            <div>
              <p className="text-[var(--app-text-muted)]">Reserved</p>
              <p className="font-medium">{formatCurrency(currentFund.reserved)}</p>
            </div>
            <div>
              <p className="text-[var(--app-text-muted)]">Dry Powder</p>
              <p className="font-medium">{formatCurrency(currentFund.fundSize - currentFund.deployed - currentFund.reserved)}</p>
            </div>
          </div>
        </div>

        {/* Deployment Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="p-3 rounded-lg border border-[var(--app-border)]">
            <div className="flex items-start gap-2">
              <TrendingUp className="w-4 h-4 text-[var(--app-primary)] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">Deployment Pace</p>
                <p className="text-xs text-[var(--app-text-muted)] mt-1">
                  At current pace, fund will be fully deployed in ~{((100 - currentFund.deploymentRate) / deploymentVelocity).toFixed(1)} years
                </p>
              </div>
            </div>
          </div>
          <div className="p-3 rounded-lg border border-[var(--app-border)]">
            <div className="flex items-start gap-2">
              <Activity className="w-4 h-4 text-[var(--app-secondary)] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">Investment Activity</p>
                <p className="text-xs text-[var(--app-text-muted)] mt-1">
                  {totalDeals} investments made • Avg {(deploymentPacing.length / totalDeals).toFixed(1)} quarters between deals
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
