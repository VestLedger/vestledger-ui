'use client';

import { useCallback, useMemo } from 'react';
import { Badge, Button, Checkbox, Input } from '@/ui';
import { useUIKey } from '@/store/ui';
import type { LPAllocation } from '@/types/distribution';
import { formatCurrencyCompact } from '@/utils/formatting';
import { getAllocationIssues } from '@/lib/validation/distribution';
import {
  type ColumnDef,
  type FilterFn,
  type PaginationState,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  Download,
  RefreshCcw,
} from 'lucide-react';

export interface LPAllocationTableProps {
  allocations: LPAllocation[];
  onChange: (allocations: LPAllocation[]) => void;
  onRecalculate?: () => void;
  comparisonMap?: Record<string, number>;
  showComparison?: boolean;
}

type LPAllocationTableUIState = {
  searchQuery: string;
  sorting: SortingState;
  pageIndex: number;
  pageSize: number;
};

type ColumnAlign = 'left' | 'center' | 'right';

const DEFAULT_PAGE_SIZE = 8;

const globalFilterFn: FilterFn<LPAllocation> = (row, _columnId, filterValue) => {
  const query = String(filterValue ?? '').toLowerCase().trim();
  if (!query) return true;
  const { lpName, investorClassName, taxJurisdiction } = row.original;
  return [lpName, investorClassName, taxJurisdiction]
    .filter(Boolean)
    .some((value) => value!.toLowerCase().includes(query));
};

export function LPAllocationTable({
  allocations,
  onChange,
  onRecalculate,
  comparisonMap,
  showComparison = false,
}: LPAllocationTableProps) {
  const { value: ui, patch: patchUI } = useUIKey<LPAllocationTableUIState>(
    'lp-allocation-table',
    {
      searchQuery: '',
      sorting: [],
      pageIndex: 0,
      pageSize: DEFAULT_PAGE_SIZE,
    }
  );

  const handleUpdate = useCallback(
    (id: string, patch: Partial<LPAllocation>) => {
      onChange(
        allocations.map((allocation) =>
          allocation.id === id
            ? { ...allocation, ...patch, updatedAt: new Date().toISOString() }
            : allocation
        )
      );
    },
    [allocations, onChange]
  );

  const columns = useMemo<ColumnDef<LPAllocation, unknown>[]>(() => {
    const base: ColumnDef<LPAllocation, unknown>[] = [
      {
        accessorKey: 'lpName',
        header: 'LP',
        enableSorting: true,
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div>
              <div className="font-medium">{item.lpName}</div>
              <div className="text-xs text-[var(--app-text-muted)]">{item.investorClassName}</div>
            </div>
          );
        },
      },
      {
        accessorKey: 'proRataPercentage',
        header: 'Pro-Rata',
        enableSorting: true,
        cell: ({ row }) => `${row.original.proRataPercentage.toFixed(2)}%`,
      },
      {
        accessorKey: 'grossAmount',
        header: 'Gross',
        enableSorting: true,
        meta: { align: 'right' },
        cell: ({ row }) => (
          <Input
            type="number"
            value={row.original.grossAmount.toString()}
            onChange={(event) =>
              handleUpdate(row.original.id, { grossAmount: Number(event.target.value) || 0 })
            }
          />
        ),
      },
      {
        accessorKey: 'netAmount',
        header: 'Net',
        enableSorting: true,
        meta: { align: 'right' },
        cell: ({ row }) => (
          <Input
            type="number"
            value={row.original.netAmount.toString()}
            onChange={(event) =>
              handleUpdate(row.original.id, { netAmount: Number(event.target.value) || 0 })
            }
          />
        ),
      },
      {
        accessorKey: 'hasSpecialTerms',
        header: 'Special Terms',
        enableSorting: false,
        cell: ({ row }) => (
          <Checkbox
            isSelected={row.original.hasSpecialTerms}
            onValueChange={(value) => handleUpdate(row.original.id, { hasSpecialTerms: value })}
          >
            {row.original.hasSpecialTerms ? 'Yes' : 'No'}
          </Checkbox>
        ),
      },
      {
        id: 'status',
        header: 'Status',
        enableSorting: false,
        cell: ({ row }) => {
          const issues = getAllocationIssues(row.original);
          const hasIssues = issues.length > 0;
          return (
            <Badge
              size="sm"
              variant="flat"
              color={hasIssues ? 'warning' : 'success'}
              title={hasIssues ? issues.join(' ') : 'Allocation is balanced.'}
            >
              {hasIssues ? 'Needs Review' : 'Ready'}
            </Badge>
          );
        },
      },
    ];

    if (showComparison) {
      base.splice(3, 0, {
        id: 'previous',
        header: 'Previous',
        enableSorting: false,
        meta: { align: 'right' },
        cell: ({ row }) => formatCurrencyCompact(comparisonMap?.[row.original.lpId] ?? 0),
      });
    }

    return base;
  }, [comparisonMap, handleUpdate, showComparison]);

  const pagination: PaginationState = useMemo(
    () => ({
      pageIndex: ui.pageIndex,
      pageSize: ui.pageSize,
    }),
    [ui.pageIndex, ui.pageSize]
  );

  const handleSortingChange = useCallback(
    (updater: SortingState | ((old: SortingState) => SortingState)) => {
      const next = typeof updater === 'function' ? updater(ui.sorting) : updater;
      patchUI({ sorting: next });
    },
    [patchUI, ui.sorting]
  );

  const handlePaginationChange = useCallback(
    (updater: PaginationState | ((old: PaginationState) => PaginationState)) => {
      const next = typeof updater === 'function' ? updater(pagination) : updater;
      patchUI({ pageIndex: next.pageIndex, pageSize: next.pageSize });
    },
    [pagination, patchUI]
  );

  const table = useReactTable({
    data: allocations,
    columns,
    state: {
      sorting: ui.sorting,
      globalFilter: ui.searchQuery,
      pagination,
    },
    globalFilterFn,
    onSortingChange: handleSortingChange,
    onGlobalFilterChange: (value) =>
      patchUI({ searchQuery: String(value ?? ''), pageIndex: 0 }),
    onPaginationChange: handlePaginationChange,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const filteredCount = table.getFilteredRowModel().rows.length;
  const totalCount = allocations.length;
  const resolveAlign = (meta?: unknown): ColumnAlign | undefined =>
    (meta as { align?: ColumnAlign } | undefined)?.align;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-[var(--app-text-muted)]">
          {filteredCount} of {totalCount} LP allocations
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Input
            value={ui.searchQuery}
            onChange={(event) => patchUI({ searchQuery: event.target.value, pageIndex: 0 })}
            placeholder="Search LPs..."
          />
          {onRecalculate && (
            <Button
              size="sm"
              variant="bordered"
              startContent={<RefreshCcw className="h-4 w-4" />}
              onPress={onRecalculate}
            >
              Recalculate
            </Button>
          )}
          <Button
            size="sm"
            variant="bordered"
            startContent={<Download className="h-4 w-4" />}
            isDisabled
          >
            Export
          </Button>
        </div>
      </div>

      <div className="rounded-lg border border-[var(--app-border)] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[var(--app-surface-hover)] text-[var(--app-text-muted)]">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const align = resolveAlign(header.column.columnDef.meta);
                  const alignClass =
                    align === 'right'
                      ? 'text-right'
                      : align === 'center'
                      ? 'text-center'
                      : 'text-left';
                  const content = header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext());
                  const canSort = header.column.getCanSort();
                  const sortDirection = header.column.getIsSorted();

                  return (
                    <th
                      key={header.id}
                      className={`px-4 py-3 font-medium ${alignClass}`}
                    >
                      {canSort ? (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className="inline-flex items-center gap-1"
                        >
                          <span>{content}</span>
                          {sortDirection === 'asc' && (
                            <ChevronUp className="h-3 w-3 text-[var(--app-primary)]" />
                          )}
                          {sortDirection === 'desc' && (
                            <ChevronDown className="h-3 w-3 text-[var(--app-primary)]" />
                          )}
                          {!sortDirection && (
                            <ChevronsUpDown className="h-3 w-3 text-[var(--app-text-subtle)]" />
                          )}
                        </button>
                      ) : (
                        content
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-[var(--app-border-subtle)]">
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={table.getVisibleFlatColumns().length}
                  className="px-4 py-6 text-center text-sm text-[var(--app-text-muted)]"
                >
                  No allocations match the current filters.
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-[var(--app-surface-hover)]">
                  {row.getVisibleCells().map((cell) => {
                    const align = resolveAlign(cell.column.columnDef.meta);
                    const alignClass =
                      align === 'right'
                        ? 'text-right'
                        : align === 'center'
                        ? 'text-center'
                        : 'text-left';
                    return (
                      <td key={cell.id} className={`px-4 py-3 ${alignClass}`}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {table.getPageCount() > 1 && (
        <div className="flex items-center justify-between text-sm text-[var(--app-text-muted)]">
          <div>
            Page {ui.pageIndex + 1} of {table.getPageCount()}
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="light"
              isIconOnly
              aria-label="Previous page"
              onPress={() => table.previousPage()}
              isDisabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="light"
              isIconOnly
              aria-label="Next page"
              onPress={() => table.nextPage()}
              isDisabled={!table.getCanNextPage()}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
