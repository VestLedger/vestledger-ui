'use client';

import { useMemo } from 'react';
import { Badge, Button } from '@/ui';
import { ChevronRight, Users } from 'lucide-react';
import type { WaterfallScenario } from '@/types/waterfall';
import type { Distribution, LPAllocation } from '@/types/distribution';
import type { NormalizedError } from '@/store/types/AsyncState';
import { AsyncStateRenderer, EmptyState } from '@/ui/async-states';
import { formatCurrencyCompact, formatDate } from '@/utils/formatting';

export interface LPWaterfallDetailProps {
  scenario: WaterfallScenario | null;
  lpAllocations?: LPAllocation[];
  isLoading?: boolean;
  error?: NormalizedError;
  onRetry?: () => void;
  selectedLpId?: string | null;
  sourceDistribution?: Distribution | null;
  onSelectLp?: (id: string | null) => void;
  printMode?: boolean;
}

type LPDrilldownRow = {
  id: string;
  name: string;
  investorClassId: string;
  investorClassName: string;
  ownershipPercentage: number;
  invested: number;
  returned: number;
  netReturn: number;
  multiple: number;
  irr: number;
};

const formatStatusLabel = (status: string) =>
  status
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

export function LPWaterfallDetail({
  scenario,
  lpAllocations = [],
  isLoading = false,
  error,
  onRetry,
  selectedLpId,
  sourceDistribution,
  onSelectLp,
  printMode,
}: LPWaterfallDetailProps) {
  const results = scenario?.results;
  const classes = scenario?.investorClasses;

  const lpRows = useMemo<LPDrilldownRow[]>(() => {
    if (!results || lpAllocations.length === 0) return [];

    const classList = classes ?? [];
    const resultMap = new Map(
      results.investorClassResults.map((result) => [result.investorClassId, result])
    );
    const classMap = new Map(classList.map((ic) => [ic.id, ic]));
    const ownershipTotals = lpAllocations.reduce<Record<string, number>>((acc, allocation) => {
      acc[allocation.investorClassId] =
        (acc[allocation.investorClassId] ?? 0) + allocation.ownershipPercentage;
      return acc;
    }, {});

    return lpAllocations.map((allocation) => {
      const classResult = resultMap.get(allocation.investorClassId);
      const classOwnershipTotal = ownershipTotals[allocation.investorClassId] ?? 0;
      const share =
        classOwnershipTotal > 0 ? allocation.ownershipPercentage / classOwnershipTotal : 0;
      const invested = classResult
        ? classResult.invested * share
        : allocation.commitment;
      const returned = classResult
        ? classResult.returned * share
        : allocation.netAmount ?? allocation.grossAmount ?? 0;
      const netReturn = classResult
        ? classResult.netReturn * share
        : returned - invested;
      const multiple = invested > 0 ? returned / invested : 0;

      return {
        id: allocation.lpId,
        name: allocation.lpName,
        investorClassId: allocation.investorClassId,
        investorClassName:
          classMap.get(allocation.investorClassId)?.name ?? allocation.investorClassName,
        ownershipPercentage: allocation.ownershipPercentage,
        invested,
        returned,
        netReturn,
        multiple,
        irr: classResult?.irr ?? 0,
      };
    });
  }, [classes, lpAllocations, results]);

  const selectedLP = selectedLpId
    ? lpRows.find((row) => row.id === selectedLpId) ?? null
    : null;
  const distributionDateLabel = sourceDistribution?.eventDate
    ? formatDate(sourceDistribution.eventDate)
    : null;
  const accessibleRows = selectedLP ? [selectedLP] : lpRows;

  return (
    <AsyncStateRenderer
      data={scenario}
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      loadingMessage="Loading LP allocations…"
      loadingFullHeight={false}
      errorTitle="Failed to load LP allocations"
      emptyIcon={Users}
      emptyTitle="No LP allocations yet"
      emptyMessage="Run a scenario to see LP drill-down results."
      isEmpty={() => !scenario || !results}
    >
      {() => {
        if (lpRows.length === 0) {
          return (
            <EmptyState
              icon={Users}
              title="No LP allocations"
              message="Allocate LPs to this distribution to populate drill-down results."
            />
          );
        }

        return (
          <div
            className={[
              'rounded-lg border border-[var(--app-border)] p-4',
              printMode ? 'bg-white' : 'bg-[var(--app-surface)]',
            ].join(' ')}
          >
      <div className="flex items-center gap-2 text-sm text-[var(--app-text-muted)]">
        <Button
          size="sm"
          variant="light"
          className="print:hidden"
          onPress={() => onSelectLp?.(null)}
        >
          All LPs
        </Button>
        {selectedLP && (
          <>
            <ChevronRight className="h-4 w-4" />
            <span className="text-[var(--app-text)]">{selectedLP.name}</span>
          </>
        )}
      </div>
      {sourceDistribution && (
        <div className="mt-2 text-xs text-[var(--app-text-muted)]">
          Using LP allocations from{' '}
          <span className="font-medium text-[var(--app-text)]">{sourceDistribution.name}</span>
          {distributionDateLabel ? ` (${distributionDateLabel})` : ''}
          {sourceDistribution.status ? ` • ${formatStatusLabel(sourceDistribution.status)}` : ''}
        </div>
      )}

      {selectedLP ? (
        <div className="mt-4 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="text-lg font-semibold">{selectedLP.name}</div>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[var(--app-text-muted)]">
                <Badge size="sm" variant="flat">
                  {selectedLP.investorClassName}
                </Badge>
                <span>{selectedLP.ownershipPercentage.toFixed(1)}% ownership</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-[var(--app-text-muted)]">Net Return</div>
              <div className="text-lg font-semibold">{formatCurrencyCompact(selectedLP.netReturn)}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            <div>
              <div className="text-[var(--app-text-muted)]">Invested</div>
              <div className="font-medium">{formatCurrencyCompact(selectedLP.invested)}</div>
            </div>
            <div>
              <div className="text-[var(--app-text-muted)]">Returned</div>
              <div className="font-medium">{formatCurrencyCompact(selectedLP.returned)}</div>
            </div>
            <div>
              <div className="text-[var(--app-text-muted)]">Multiple</div>
              <div className="font-medium">{selectedLP.multiple.toFixed(2)}x</div>
            </div>
            <div>
              <div className="text-[var(--app-text-muted)]">IRR</div>
              <div className="font-medium">{selectedLP.irr.toFixed(1)}%</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-4 space-y-2">
          <div className="grid grid-cols-5 gap-3 text-xs text-[var(--app-text-muted)]">
            <span>LP</span>
            <span className="text-right">Invested</span>
            <span className="text-right">Returned</span>
            <span className="text-right">Multiple</span>
            <span className="text-right">IRR</span>
          </div>
          <div className="divide-y divide-[var(--app-border)] rounded-lg border border-[var(--app-border)]">
            {lpRows.map((row) => (
              <button
                key={row.id}
                type="button"
                onClick={() => onSelectLp?.(row.id)}
                className="grid w-full grid-cols-5 items-center gap-3 px-3 py-2 text-sm text-left hover:bg-[var(--app-surface-hover)]"
              >
                <div>
                  <div className="font-medium">{row.name}</div>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[var(--app-text-muted)]">
                    <Badge size="sm" variant="flat">
                      {row.investorClassName}
                    </Badge>
                    <span>{row.ownershipPercentage.toFixed(1)}%</span>
                  </div>
                </div>
                <span className="text-right">{formatCurrencyCompact(row.invested)}</span>
                <span className="text-right">{formatCurrencyCompact(row.returned)}</span>
                <span className="text-right">{row.multiple.toFixed(2)}x</span>
                <span className="text-right">{row.irr.toFixed(1)}%</span>
              </button>
            ))}
          </div>
        </div>
      )}
      <table className="sr-only" aria-label="LP distribution breakdown">
        <caption>LP distribution breakdown</caption>
        <thead>
          <tr>
            <th scope="col">LP</th>
            <th scope="col">Investor Class</th>
            <th scope="col">Ownership</th>
            <th scope="col">Invested</th>
            <th scope="col">Returned</th>
            <th scope="col">Net Return</th>
            <th scope="col">Multiple</th>
            <th scope="col">IRR</th>
          </tr>
        </thead>
        <tbody>
          {accessibleRows.map((row) => (
            <tr key={`sr-${row.id}`}>
              <td>{row.name}</td>
              <td>{row.investorClassName}</td>
              <td>{row.ownershipPercentage.toFixed(1)}%</td>
              <td>{formatCurrencyCompact(row.invested)}</td>
              <td>{formatCurrencyCompact(row.returned)}</td>
              <td>{formatCurrencyCompact(row.netReturn)}</td>
              <td>{row.multiple.toFixed(2)}x</td>
              <td>{row.irr.toFixed(1)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
          </div>
        );
      }}
    </AsyncStateRenderer>
  );
}
