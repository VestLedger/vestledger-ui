'use client';

import { useEffect, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  type TooltipProps,
} from 'recharts';
import { Badge, Card, Input, Select, Slider, Switch } from '@/ui';
import { useUIKey } from '@/store/ui';
import { useAsyncData } from '@/hooks/useAsyncData';
import { AsyncStateRenderer } from '@/ui/async-states';
import {
  sensitivityAnalysisRequested,
  sensitivitySelectors,
} from '@/store/slices/waterfallSlice';
import { calculateSensitivityAnalysis } from '@/lib/calculations/waterfall';
import { formatCurrencyCompact } from '@/utils/formatting';
import type { WaterfallScenario } from '@/types/waterfall';
import { TrendingUp } from 'lucide-react';
import { SectionHeader } from '@/ui/composites';

type SensitivityUIState = {
  minExitValue: number;
  maxExitValue: number;
  steps: number;
  compareModels: boolean;
  showBreakEven: boolean;
};

type SensitivityChartDatum = {
  exitValue: number;
  gpCarryPercentage: number;
  gpCarry: number;
  lpMultiple: number;
  compareGpCarryPercentage?: number;
  compareGpCarry?: number;
  compareLpMultiple?: number;
};

type SensitivityTooltipProps = TooltipProps<number, string> & {
  baseLabel: string;
  compareLabel?: string;
  showComparison: boolean;
};

const DEFAULT_STEPS = 20;
const STEPS_OPTIONS = [10, 20, 30, 40];

const getModelLabel = (model: WaterfallScenario['model']) =>
  model === 'european' ? 'European' : model === 'american' ? 'American' : 'Blended';

const buildDefaultState = (exitValue: number): SensitivityUIState => {
  const minExitValue = Math.max(0, Math.round(exitValue * 0.5));
  const maxExitValue = Math.max(minExitValue + 10_000_000, Math.round(exitValue * 1.5));
  return {
    minExitValue,
    maxExitValue,
    steps: DEFAULT_STEPS,
    compareModels: false,
    showBreakEven: true,
  };
};

function SensitivityTooltip({
  active,
  payload,
  label,
  baseLabel,
  compareLabel,
  showComparison,
}: SensitivityTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  const datum = payload[0]?.payload as SensitivityChartDatum | undefined;
  if (!datum) return null;

  return (
    <div className="rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2 text-xs shadow-lg">
      <div className="font-semibold text-[var(--app-text)]">
        Exit Value: {formatCurrencyCompact(Number(label))}
      </div>
      <div className="mt-2 space-y-1 text-[var(--app-text-muted)]">
        <div className="flex items-center justify-between gap-4">
          <span>{baseLabel} Carry %</span>
          <span className="font-medium text-[var(--app-text)]">
            {datum.gpCarryPercentage.toFixed(1)}%
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span>{baseLabel} Carry</span>
          <span className="font-medium text-[var(--app-text)]">
            {formatCurrencyCompact(datum.gpCarry)}
          </span>
        </div>
        {showComparison && compareLabel && typeof datum.compareGpCarryPercentage === 'number' && (
          <>
            <div className="flex items-center justify-between gap-4">
              <span>{compareLabel} Carry %</span>
              <span className="font-medium text-[var(--app-text)]">
                {datum.compareGpCarryPercentage.toFixed(1)}%
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span>{compareLabel} Carry</span>
              <span className="font-medium text-[var(--app-text)]">
                {formatCurrencyCompact(datum.compareGpCarry ?? 0)}
              </span>
            </div>
          </>
        )}
      </div>
      <div className="mt-2 flex items-center justify-between gap-4 border-t border-[var(--app-border-subtle)] pt-2 text-[var(--app-text-muted)]">
        <span>LP Multiple</span>
        <span className="font-medium">{datum.lpMultiple.toFixed(2)}x</span>
      </div>
    </div>
  );
}

export interface SensitivityPanelProps {
  scenario: WaterfallScenario;
  comparisonScenario?: WaterfallScenario | null;
  printMode?: boolean;
}

export function SensitivityPanel({
  scenario,
  comparisonScenario,
  printMode = false,
}: SensitivityPanelProps) {
  const baseExitValue = scenario.exitValue || 100_000_000;
  const rangeBounds = useMemo(() => {
    const min = Math.max(0, Math.round(baseExitValue * 0.25));
    const max = Math.max(min + 10_000_000, Math.round(baseExitValue * 2));
    const step = Math.max(1_000_000, Math.round(baseExitValue * 0.05));
    return { min, max, step };
  }, [baseExitValue]);

  const uiKey = `waterfall-sensitivity-${scenario.id}`;
  const { value: ui, patch: patchUI } = useUIKey<SensitivityUIState>(
    uiKey,
    buildDefaultState(baseExitValue)
  );

  const { minExitValue, maxExitValue, steps, compareModels, showBreakEven } = ui;

  useEffect(() => {
    const minValue = Math.min(Math.max(minExitValue, rangeBounds.min), rangeBounds.max - rangeBounds.step);
    const maxValue = Math.min(Math.max(maxExitValue, minValue + rangeBounds.step), rangeBounds.max);
    if (minValue !== minExitValue || maxValue !== maxExitValue) {
      patchUI({ minExitValue: minValue, maxExitValue: maxValue });
    }
  }, [
    maxExitValue,
    minExitValue,
    patchUI,
    rangeBounds.max,
    rangeBounds.min,
    rangeBounds.step,
  ]);

  const normalizedRange = useMemo(() => {
    const minValue = Math.min(minExitValue, maxExitValue - rangeBounds.step);
    const maxValue = Math.max(maxExitValue, minValue + rangeBounds.step);
    return {
      minValue,
      maxValue,
    };
  }, [maxExitValue, minExitValue, rangeBounds.step]);

  const { data, isLoading, error, refetch } = useAsyncData(
    sensitivityAnalysisRequested,
    sensitivitySelectors.selectState,
    {
      params: {
        scenarioId: scenario.id,
        minExitValue: normalizedRange.minValue,
        maxExitValue: normalizedRange.maxValue,
        steps: Math.max(5, steps),
      },
      dependencies: [
        scenario.id,
        scenario.updatedAt,
        normalizedRange.minValue,
        normalizedRange.maxValue,
        steps,
      ],
    }
  );

  const analysis = data?.analysis;

  const comparisonAnalysis = useMemo(() => {
    if (!compareModels || !comparisonScenario) return null;
    return calculateSensitivityAnalysis(
      comparisonScenario,
      normalizedRange.minValue,
      normalizedRange.maxValue,
      Math.max(5, steps)
    );
  }, [
    compareModels,
    comparisonScenario,
    normalizedRange.maxValue,
    normalizedRange.minValue,
    steps,
  ]);

  const chartData: SensitivityChartDatum[] = useMemo(() => {
    if (!analysis?.dataPoints) return [];
    return analysis.dataPoints.map((point, index) => {
      const comparisonPoint = comparisonAnalysis?.dataPoints[index];
      return {
        exitValue: point.exitValue,
        gpCarryPercentage: point.gpCarryPercentage,
        gpCarry: point.gpCarry,
        lpMultiple: point.lpMultiple,
        compareGpCarryPercentage: comparisonPoint?.gpCarryPercentage,
        compareGpCarry: comparisonPoint?.gpCarry,
        compareLpMultiple: comparisonPoint?.lpMultiple,
      };
    });
  }, [analysis?.dataPoints, comparisonAnalysis?.dataPoints]);

  const baseLabel = getModelLabel(scenario.model);
  const compareLabel = comparisonScenario ? getModelLabel(comparisonScenario.model) : undefined;
  const rangeHelpId = `sensitivity-range-help-${scenario.id}`;

  const handleMinChange = (nextValue: number) => {
    const minValue = Math.min(nextValue, maxExitValue - rangeBounds.step);
    patchUI({ minExitValue: minValue });
  };

  const handleMaxChange = (nextValue: number) => {
    const maxValue = Math.max(nextValue, minExitValue + rangeBounds.step);
    patchUI({ maxExitValue: maxValue });
  };

  const formatSliderTooltipValue = (value: number | number[]) =>
    formatCurrencyCompact(Array.isArray(value) ? value[0] ?? 0 : value);

  return (
    <Card padding="lg">
      <SectionHeader
        className="mb-4"
        title={(
          <span className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-[var(--app-primary)]" />
            <span>Sensitivity Analysis</span>
          </span>
        )}
        description="Model GP carry percentage sensitivity across exit values."
        action={(
          <>
            <Badge size="sm" variant="flat">
              {baseLabel} Base
            </Badge>
            <Switch
              size="sm"
              isSelected={compareModels}
              onValueChange={(value) => patchUI({ compareModels: value })}
            >
              Compare Models
            </Switch>
          </>
        )}
        actionClassName="flex-wrap items-center print:hidden"
      />

      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr] print:hidden">
        <div className="space-y-3">
          <div className="text-sm font-medium">Exit Value Range</div>
          <div className="flex items-center gap-3">
            <Input
              type="number"
              label="Min"
              value={normalizedRange.minValue.toString()}
              onChange={(event) => handleMinChange(Number(event.target.value) || 0)}
            />
            <Input
              type="number"
              label="Max"
              value={normalizedRange.maxValue.toString()}
              onChange={(event) => handleMaxChange(Number(event.target.value) || 0)}
            />
          </div>
          <div className="space-y-2">
            <div id={rangeHelpId} className="sr-only">
              Use arrow keys to adjust the range. Values update the sensitivity chart.
            </div>
            <Slider
              minValue={rangeBounds.min}
              maxValue={rangeBounds.max}
              step={rangeBounds.step}
              value={normalizedRange.minValue}
              onChange={(value) =>
                handleMinChange(Array.isArray(value) ? value[0] ?? rangeBounds.min : value)
              }
              aria-label="Minimum exit value"
              aria-describedby={rangeHelpId}
              className="w-full"
              color="primary"
              showTooltip
              getValue={formatSliderTooltipValue}
            />
            <Slider
              minValue={rangeBounds.min}
              maxValue={rangeBounds.max}
              step={rangeBounds.step}
              value={normalizedRange.maxValue}
              onChange={(value) =>
                handleMaxChange(Array.isArray(value) ? value[0] ?? rangeBounds.max : value)
              }
              aria-label="Maximum exit value"
              aria-describedby={rangeHelpId}
              className="w-full"
              color="secondary"
              showTooltip
              getValue={formatSliderTooltipValue}
            />
          </div>
          <div className="flex items-center gap-3">
            <Select
              label="Steps"
              selectedKeys={[steps.toString()]}
              onChange={(event) => patchUI({ steps: Number(event.target.value) || DEFAULT_STEPS })}
              options={STEPS_OPTIONS.map((option) => ({
                label: `${option} steps`,
                value: option.toString(),
              }))}
            />
            <Switch
              size="sm"
              isSelected={showBreakEven}
              onValueChange={(value) => patchUI({ showBreakEven: value })}
            >
              Break-even markers
            </Switch>
          </div>
        </div>
        <div className="rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] p-3 text-sm text-[var(--app-text-muted)]">
          <div className="text-xs uppercase tracking-wide text-[var(--app-text-subtle)] mb-2">
            Current Range
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span>Min Exit</span>
              <span className="font-medium text-[var(--app-text)]">
                {formatCurrencyCompact(normalizedRange.minValue)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span>Max Exit</span>
              <span className="font-medium text-[var(--app-text)]">
                {formatCurrencyCompact(normalizedRange.maxValue)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span>Step Count</span>
              <span className="font-medium text-[var(--app-text)]">{Math.max(5, steps)}</span>
            </div>
            {analysis && (
              <div className="flex items-center justify-between gap-2">
                <span>Break-even Points</span>
                <span className="font-medium text-[var(--app-text)]">
                  {analysis.breakEvenPoints.length}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <AsyncStateRenderer
          data={data}
          isLoading={isLoading}
          error={error}
          onRetry={refetch}
          emptyTitle="No sensitivity data"
          emptyMessage="Adjust the range to generate sensitivity analysis."
          isEmpty={(value) => !value?.analysis?.dataPoints?.length}
        >
          {() => (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--app-text-muted)]">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[var(--app-primary)]" />
                  {baseLabel} Carry %
                </span>
                {compareModels && compareLabel && (
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[var(--app-secondary)]" />
                    {compareLabel} Carry %
                  </span>
                )}
              </div>
              <div
                className={[
                  'h-72 w-full rounded-lg border border-[var(--app-border)] p-3',
                  printMode ? 'bg-white' : 'bg-[var(--app-surface)]',
                ].join(' ')}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ left: 8, right: 16 }}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={printMode ? 'rgba(0,0,0,0.08)' : 'var(--app-border-subtle)'}
                    />
                    <XAxis
                      dataKey="exitValue"
                      tickFormatter={(value) => formatCurrencyCompact(Number(value))}
                      tick={{ fill: 'var(--app-text-muted)', fontSize: 11 }}
                      tickLine={false}
                      axisLine={{ stroke: 'var(--app-border)' }}
                    />
                    <YAxis
                      tickFormatter={(value) => `${value}%`}
                      tick={{ fill: 'var(--app-text-muted)', fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                      width={60}
                      domain={[0, 100]}
                    />
                    <Tooltip
                      content={(
                        <SensitivityTooltip
                          baseLabel={baseLabel}
                          compareLabel={compareLabel}
                          showComparison={compareModels}
                        />
                      )}
                      cursor={{ stroke: 'var(--app-border-strong)', strokeWidth: 1 }}
                    />
                    {showBreakEven && analysis?.breakEvenPoints.map((point, index) => (
                      <ReferenceLine
                        key={`${point.tierName}-${index}`}
                        x={point.exitValue}
                        stroke="var(--app-warning)"
                        strokeDasharray="4 4"
                        label={{
                          value: point.tierName,
                          position: 'top',
                          fill: 'var(--app-text-muted)',
                          fontSize: 10,
                        }}
                      />
                    ))}
                    <Line
                      type="monotone"
                      dataKey="gpCarryPercentage"
                      stroke="var(--app-primary)"
                      strokeWidth={2}
                      dot={false}
                      isAnimationActive={!printMode}
                    />
                    {compareModels && compareLabel && (
                      <Line
                        type="monotone"
                        dataKey="compareGpCarryPercentage"
                        stroke="var(--app-secondary)"
                        strokeWidth={2}
                        dot={false}
                        isAnimationActive={!printMode}
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>
              {analysis?.breakEvenPoints.length ? (
                <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--app-text-muted)]">
                  {analysis.breakEvenPoints.map((point) => (
                    <Badge key={`${point.tierName}-${point.exitValue}`} size="sm" variant="flat">
                      {point.tierName}: {formatCurrencyCompact(point.exitValue)}
                    </Badge>
                  ))}
                </div>
              ) : null}
            </div>
          )}
        </AsyncStateRenderer>
      </div>
    </Card>
  );
}
