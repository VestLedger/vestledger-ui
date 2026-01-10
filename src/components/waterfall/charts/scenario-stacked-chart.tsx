'use client';

import type { InvestorClass, WaterfallScenario } from '@/types/waterfall';
import { formatCurrencyCompact } from '@/utils/formatting';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipProps,
} from 'recharts';

const CLASS_COLORS = [
  'var(--app-primary)',
  'var(--app-secondary)',
  'var(--app-accent)',
  'var(--app-info)',
  'var(--app-success)',
  'var(--app-warning)',
];

export interface ScenarioStackedChartProps {
  scenarios: WaterfallScenario[];
  legendClasses?: InvestorClass[];
  printMode?: boolean;
}

type ScenarioStackedDatum = {
  name: string;
  exitValue: number;
  totalReturned: number;
  [key: string]: number | string;
};

type ScenarioTooltipProps = TooltipProps<number | string, string> & {
  classById: Record<string, InvestorClass>;
  colorById: Record<string, string>;
};

function ScenarioTooltip({
  active,
  payload,
  label,
  classById,
  colorById,
}: ScenarioTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  const row = payload[0]?.payload as ScenarioStackedDatum | undefined;
  if (!row) return null;

  const entries = payload.filter((entry) => Number(entry.value || 0) !== 0);

  return (
    <div className="rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2 text-xs shadow-lg">
      <div className="font-semibold text-[var(--app-text)]">{label}</div>
      <div className="text-[var(--app-text-muted)]">
        Exit Value: {formatCurrencyCompact(Number(row.exitValue))}
      </div>
      <div className="mt-2 space-y-1">
        {entries.map((entry) => {
          const classId = entry.dataKey as string;
          const investorClass = classById[classId];
          if (!investorClass) return null;
          return (
            <div key={classId} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-2">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: colorById[classId] }}
                  aria-hidden="true"
                />
                {investorClass.name}
              </span>
              <span className="font-medium">{formatCurrencyCompact(Number(entry.value))}</span>
            </div>
          );
        })}
        <div className="mt-2 flex items-center justify-between gap-4 border-t border-[var(--app-border-subtle)] pt-2 text-[var(--app-text-muted)]">
          <span>Total Returned</span>
          <span className="font-medium">{formatCurrencyCompact(Number(row.totalReturned))}</span>
        </div>
      </div>
    </div>
  );
}

export function ScenarioStackedChart({
  scenarios,
  legendClasses,
  printMode,
}: ScenarioStackedChartProps) {
  if (!scenarios || scenarios.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-[var(--app-border)] p-6 text-center text-sm text-[var(--app-text-muted)]">
        Add scenarios to compare distributions.
      </div>
    );
  }

  const baseClasses = legendClasses ?? scenarios[0]?.investorClasses ?? [];
  const classMap = new Map<string, InvestorClass>();
  baseClasses.forEach((investorClass) => classMap.set(investorClass.id, investorClass));
  scenarios.forEach((scenario) => {
    scenario.investorClasses.forEach((investorClass) => {
      if (!classMap.has(investorClass.id)) {
        classMap.set(investorClass.id, investorClass);
      }
    });
  });

  const orderedClasses: InvestorClass[] = [
    ...baseClasses,
    ...Array.from(classMap.values()).filter(
      (investorClass) => !baseClasses.find((item) => item.id === investorClass.id)
    ),
  ];

  const colorById: Record<string, string> = {};
  orderedClasses.forEach((investorClass, index) => {
    colorById[investorClass.id] = CLASS_COLORS[index % CLASS_COLORS.length];
  });

  const classById = orderedClasses.reduce<Record<string, InvestorClass>>((acc, investorClass) => {
    acc[investorClass.id] = investorClass;
    return acc;
  }, {});

  const chartData: ScenarioStackedDatum[] = scenarios.map((scenario) => {
    const results = scenario.results;
    const row: ScenarioStackedDatum = {
      name: scenario.name,
      exitValue: scenario.exitValue,
      totalReturned: 0,
    };

    orderedClasses.forEach((investorClass) => {
      const value = results?.investorClassResults.find(
        (result) => result.investorClassId === investorClass.id
      )?.returned ?? 0;
      row[investorClass.id] = value;
      row.totalReturned += value;
    });

    return row;
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
          <BarChart data={chartData} margin={{ left: 8, right: 16 }}>
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
              content={(
                <ScenarioTooltip
                  classById={classById}
                  colorById={colorById}
                />
              )}
              cursor={{ fill: printMode ? 'rgba(0,0,0,0.05)' : 'var(--app-surface-hover)' }}
            />
            {orderedClasses.map((investorClass) => (
              <Bar
                key={investorClass.id}
                dataKey={investorClass.id}
                stackId="scenario"
                fill={colorById[investorClass.id]}
                radius={[4, 4, 0, 0]}
                activeBar={{ stroke: 'var(--app-border-strong)', strokeWidth: 1 }}
                isAnimationActive={!printMode}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {orderedClasses.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-3 text-xs text-[var(--app-text-muted)]">
          {orderedClasses.map((investorClass) => (
            <div key={investorClass.id} className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: colorById[investorClass.id] }}
                aria-hidden="true"
              />
              <span>{investorClass.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
