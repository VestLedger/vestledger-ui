'use client'

import { Card, Badge, RadioGroup } from '@/ui';
import { Layers, TrendingUp, ArrowUpRight } from 'lucide-react';
import {
  getCohortsBySector,
  getCohortsByStage,
  getCohortsByVintage,
  type CohortPerformance,
} from '@/services/analytics/fundAnalyticsService';
import { useUIKey } from '@/store/ui';
import { useFund } from '@/contexts/fund-context';
import { SectionHeader } from '@/ui/composites';

type CohortType = 'vintage' | 'sector' | 'stage';

interface CohortRowProps {
  cohort: CohortPerformance;
  bestMOIC: number;
  bestIRR: number;
}

function CohortRow({ cohort, bestMOIC, bestIRR }: CohortRowProps) {
  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    return `$${(value / 1000).toFixed(0)}k`;
  };

  const isTopMOIC = cohort.moic === bestMOIC;
  const isTopIRR = cohort.irr === bestIRR;

  return (
    <div className="grid grid-cols-12 gap-4 items-center p-4 rounded-lg border border-[var(--app-border)] hover:bg-[var(--app-surface-hover)] transition-all">
      {/* Cohort Name */}
      <div className="col-span-12 sm:col-span-3">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--app-primary)] to-transparent flex items-center justify-center flex-shrink-0">
            <span className="text-white font-semibold text-sm">{cohort.count}</span>
          </div>
          <div>
            <p className="font-semibold">{cohort.cohort}</p>
            <p className="text-xs text-[var(--app-text-muted)]">{cohort.count} companies</p>
          </div>
        </div>
      </div>

      {/* Investment */}
      <div className="col-span-6 sm:col-span-2 text-center sm:text-left">
        <p className="text-xs text-[var(--app-text-muted)] mb-1">Invested</p>
        <p className="font-semibold">{formatCurrency(cohort.totalInvested)}</p>
      </div>

      {/* Current Value */}
      <div className="col-span-6 sm:col-span-2 text-center sm:text-left">
        <p className="text-xs text-[var(--app-text-muted)] mb-1">Current Value</p>
        <p className="font-semibold">{formatCurrency(cohort.currentValue)}</p>
      </div>

      {/* MOIC */}
      <div className="col-span-4 sm:col-span-1 text-center sm:text-left">
        <p className="text-xs text-[var(--app-text-muted)] mb-1">MOIC</p>
        <div className="flex items-center gap-1">
          <p className="font-semibold">{cohort.moic.toFixed(2)}x</p>
          {isTopMOIC && (
            <Badge size="sm" className="bg-[var(--app-success-bg)] text-[var(--app-success)]">
              Top
            </Badge>
          )}
        </div>
      </div>

      {/* IRR */}
      <div className="col-span-4 sm:col-span-1 text-center sm:text-left">
        <p className="text-xs text-[var(--app-text-muted)] mb-1">IRR</p>
        <div className="flex items-center gap-1">
          <p className="font-semibold text-[var(--app-success)]">{cohort.irr.toFixed(1)}%</p>
          {isTopIRR && (
            <Badge size="sm" className="bg-[var(--app-success-bg)] text-[var(--app-success)]">
              Top
            </Badge>
          )}
        </div>
      </div>

      {/* TVPI */}
      <div className="col-span-4 sm:col-span-1 text-center sm:text-left">
        <p className="text-xs text-[var(--app-text-muted)] mb-1">TVPI</p>
        <p className="font-semibold">{cohort.tvpi.toFixed(2)}x</p>
      </div>

      {/* DPI */}
      <div className="col-span-6 sm:col-span-1 text-center sm:text-left">
        <p className="text-xs text-[var(--app-text-muted)] mb-1">DPI</p>
        <p className="font-semibold">{cohort.dpi.toFixed(2)}x</p>
      </div>

      {/* Exit % */}
      <div className="col-span-6 sm:col-span-1 text-center sm:text-left">
        <p className="text-xs text-[var(--app-text-muted)] mb-1">Exited</p>
        <p className="font-semibold">{cohort.percentageExited.toFixed(0)}%</p>
      </div>
    </div>
  );
}

export function CohortAnalysis() {
  const { selectedFund } = useFund();
  const cohortsByVintage = getCohortsByVintage(selectedFund?.id);
  const cohortsBySector = getCohortsBySector(selectedFund?.id);
  const cohortsByStage = getCohortsByStage(selectedFund?.id);
  const { value: ui, patch: patchUI } = useUIKey<{ selectedType: CohortType }>('cohort-analysis', {
    selectedType: 'vintage',
  });
  const { selectedType } = ui;

  const getCohortData = (): CohortPerformance[] => {
    switch (selectedType) {
      case 'vintage': return cohortsByVintage;
      case 'sector': return cohortsBySector;
      case 'stage': return cohortsByStage;
      default: return cohortsByVintage;
    }
  };

  const cohortData = getCohortData();
  const bestMOIC = Math.max(...cohortData.map(c => c.moic));
  const bestIRR = Math.max(...cohortData.map(c => c.irr));

  // Calculate aggregated stats
  const totalInvested = cohortData.reduce((sum, c) => sum + c.totalInvested, 0);
  const totalCurrentValue = cohortData.reduce((sum, c) => sum + c.currentValue, 0);
  const avgMOIC = cohortData.reduce((sum, c) => sum + c.moic, 0) / cohortData.length;
  const avgIRR = cohortData.reduce((sum, c) => sum + c.irr, 0) / cohortData.length;

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    return `$${(value / 1000).toFixed(0)}k`;
  };

  return (
    <Card padding="lg">
      <div className="mb-6">
        <SectionHeader
          className="mb-4"
          title={
            <span className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-[var(--app-primary)]" />
              <span>Cohort Performance Analysis</span>
            </span>
          }
          action={
            <RadioGroup
              aria-label="Cohort grouping"
              orientation="horizontal"
              classNames={{ wrapper: 'flex flex-wrap gap-3' }}
              options={[
                { value: 'vintage', label: 'By Vintage' },
                { value: 'sector', label: 'By Sector' },
                { value: 'stage', label: 'By Stage' },
              ]}
              value={selectedType}
              onValueChange={(value) => {
                if (value === 'vintage' || value === 'sector' || value === 'stage') {
                  patchUI({ selectedType: value });
                }
              }}
            />
          }
        />

        {/* Aggregated Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 rounded-lg bg-[var(--app-surface-hover)]">
            <p className="text-xs text-[var(--app-text-muted)] mb-1">Total Invested</p>
            <p className="text-xl font-bold">{formatCurrency(totalInvested)}</p>
          </div>
          <div className="p-4 rounded-lg bg-[var(--app-surface-hover)]">
            <p className="text-xs text-[var(--app-text-muted)] mb-1">Current Value</p>
            <p className="text-xl font-bold">{formatCurrency(totalCurrentValue)}</p>
          </div>
          <div className="p-4 rounded-lg bg-[var(--app-surface-hover)]">
            <p className="text-xs text-[var(--app-text-muted)] mb-1">Avg MOIC</p>
            <p className="text-xl font-bold">{avgMOIC.toFixed(2)}x</p>
          </div>
          <div className="p-4 rounded-lg bg-[var(--app-surface-hover)]">
            <p className="text-xs text-[var(--app-text-muted)] mb-1">Avg IRR</p>
            <p className="text-xl font-bold text-[var(--app-success)]">{avgIRR.toFixed(1)}%</p>
          </div>
        </div>
      </div>

      {/* Cohort List */}
      <div className="space-y-3">
        {/* Header */}
        <div className="grid grid-cols-12 gap-4 px-4 pb-2 border-b border-[var(--app-border)]">
          <div className="col-span-12 sm:col-span-3">
            <p className="text-xs font-medium text-[var(--app-text-muted)] uppercase">Cohort</p>
          </div>
          <div className="hidden sm:block sm:col-span-2">
            <p className="text-xs font-medium text-[var(--app-text-muted)] uppercase">Invested</p>
          </div>
          <div className="hidden sm:block sm:col-span-2">
            <p className="text-xs font-medium text-[var(--app-text-muted)] uppercase">Current Value</p>
          </div>
          <div className="hidden sm:block sm:col-span-1">
            <p className="text-xs font-medium text-[var(--app-text-muted)] uppercase">MOIC</p>
          </div>
          <div className="hidden sm:block sm:col-span-1">
            <p className="text-xs font-medium text-[var(--app-text-muted)] uppercase">IRR</p>
          </div>
          <div className="hidden sm:block sm:col-span-1">
            <p className="text-xs font-medium text-[var(--app-text-muted)] uppercase">TVPI</p>
          </div>
          <div className="hidden sm:block sm:col-span-1">
            <p className="text-xs font-medium text-[var(--app-text-muted)] uppercase">DPI</p>
          </div>
          <div className="hidden sm:block sm:col-span-1">
            <p className="text-xs font-medium text-[var(--app-text-muted)] uppercase">Exited</p>
          </div>
        </div>

        {/* Cohort Rows */}
        {cohortData.map((cohort, index) => (
          <CohortRow
            key={index}
            cohort={cohort}
            bestMOIC={bestMOIC}
            bestIRR={bestIRR}
          />
        ))}
      </div>

      {/* Insights */}
      <div className="mt-6 pt-6 border-t border-[var(--app-border)]">
        <h4 className="text-sm font-semibold mb-3">Key Insights</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="p-3 rounded-lg border border-[var(--app-success)]/20 bg-[var(--app-success-bg)]">
            <div className="flex items-start gap-2">
              <ArrowUpRight className="w-4 h-4 text-[var(--app-success)] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-[var(--app-success)]">Best Performing Cohort (MOIC)</p>
                <p className="text-xs text-[var(--app-text-muted)] mt-1">
                  {cohortData.find(c => c.moic === bestMOIC)?.cohort} - {bestMOIC.toFixed(2)}x MOIC
                </p>
              </div>
            </div>
          </div>
          <div className="p-3 rounded-lg border border-[var(--app-success)]/20 bg-[var(--app-success-bg)]">
            <div className="flex items-start gap-2">
              <TrendingUp className="w-4 h-4 text-[var(--app-success)] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-[var(--app-success)]">Best Performing Cohort (IRR)</p>
                <p className="text-xs text-[var(--app-text-muted)] mt-1">
                  {cohortData.find(c => c.irr === bestIRR)?.cohort} - {bestIRR.toFixed(1)}% IRR
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
