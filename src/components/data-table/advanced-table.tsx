'use client';

import { useMemo } from 'react';
import type { ReactNode } from 'react';
import { Card, Button, Input, Badge } from '@/ui';
import { ChevronDown, ChevronUp, ChevronsUpDown, Search, Download, Settings2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useUIKey } from '@/store/ui';
import { TableRow } from './table-row';

export interface ColumnDef<T> {
  key: string;
  label: string;
  headerTitle?: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
  hidden?: boolean;
}

export interface AdvancedTableProps<T> {
  stateKey: string;
  data: T[];
  columns: ColumnDef<T>[];
  onRowClick?: (item: T) => void;
  searchable?: boolean;
  searchPlaceholder?: string;
  searchKeys?: (keyof T)[];
  exportable?: boolean;
  exportFilename?: string;
  pageSize?: number;
  showColumnToggle?: boolean;
  showResultsCount?: boolean;
  toolbarStart?: ReactNode;
  toolbarEnd?: ReactNode;
  emptyMessage?: string;
  className?: string;
}

type SortDirection = 'asc' | 'desc' | null;

interface AdvancedTableUIState {
  searchQuery: string;
  sortKey: string | null;
  sortDirection: SortDirection;
  currentPage: number;
  pageSize: number;
  visibleColumns: string[];
}

type TableValue = string | number | boolean | null | undefined | object;

const getValue = <T extends object>(item: T, key: string): TableValue | undefined =>
  (item as Record<string, TableValue>)[key];

export function AdvancedTable<T extends object>({
  stateKey,
  data,
  columns: initialColumns,
  onRowClick,
  searchable = true,
  searchPlaceholder = 'Search...',
  searchKeys = [],
  exportable = true,
  exportFilename = 'export.csv',
  pageSize: initialPageSize = 10,
  showColumnToggle = true,
  showResultsCount = true,
  toolbarStart,
  toolbarEnd,
  emptyMessage = 'No data available',
  className = '',
}: AdvancedTableProps<T>) {
  const initialVisibleColumns = useMemo(
    () => initialColumns.filter((col) => !col.hidden).map((col) => col.key),
    [initialColumns]
  );

  const { value: tableUI, patch: patchTableUI } = useUIKey<AdvancedTableUIState>(
    `advanced-table:${stateKey}`,
    {
      searchQuery: '',
      sortKey: null,
      sortDirection: null,
      currentPage: 1,
      pageSize: initialPageSize,
      visibleColumns: initialVisibleColumns,
    }
  );

  const { searchQuery, sortKey, sortDirection, currentPage, pageSize, visibleColumns } = tableUI;

  // Filter columns based on visibility
  const columns = useMemo(
    () => initialColumns.filter(col => visibleColumns.includes(col.key)),
    [initialColumns, visibleColumns]
  );

  // Search filtering
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;

    return data.filter(item => {
      const keysToSearch = searchKeys.length > 0 ? searchKeys : (Object.keys(item) as Array<keyof T>);
      return keysToSearch.some(key => {
        const value = getValue(item, String(key));
        if (value == null) return false;
        return String(value).toLowerCase().includes(searchQuery.toLowerCase());
      });
    });
  }, [data, searchQuery, searchKeys]);

  // Sorting
  const sortedData = useMemo(() => {
    if (!sortKey || !sortDirection) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = getValue(a, sortKey);
      const bValue = getValue(b, sortKey);

      if (aValue == null) return 1;
      if (bValue == null) return -1;

      let comparison = 0;
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue - bValue;
      } else {
        comparison = String(aValue).localeCompare(String(bValue));
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [filteredData, sortKey, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(sortedData.length / pageSize);
  const safeCurrentPage = totalPages === 0 ? 1 : Math.min(currentPage, totalPages);

  const paginatedData = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, safeCurrentPage, pageSize]);

  const handleSort = (key: string) => {
    const column = columns.find(col => col.key === key);
    if (!column?.sortable) return;

    if (sortKey === key) {
      if (sortDirection === 'asc') {
        patchTableUI({ sortDirection: 'desc', currentPage: 1 });
      } else if (sortDirection === 'desc') {
        patchTableUI({ sortKey: null, sortDirection: null, currentPage: 1 });
      } else {
        patchTableUI({ sortDirection: 'asc', currentPage: 1 });
      }
    } else {
      patchTableUI({ sortKey: key, sortDirection: 'asc', currentPage: 1 });
    }
  };

  const getSortIcon = (key: string) => {
    if (sortKey !== key) return <ChevronsUpDown className="w-3 h-3 text-app-text-subtle dark:text-app-dark-text-subtle" />;
    if (sortDirection === 'asc') return <ChevronUp className="w-3 h-3 text-app-primary dark:text-app-dark-primary" />;
    return <ChevronDown className="w-3 h-3 text-app-primary dark:text-app-dark-primary" />;
  };

  const handleExport = () => {
    // Convert data to CSV
    const headers = columns.map(col => col.label).join(',');
    const rows = sortedData.map(item =>
      columns.map(col => {
        const value = getValue(item, col.key);
        const stringValue = value == null ? '' : String(value);
        // Escape quotes and wrap in quotes if contains comma
        return stringValue.includes(',') ? `"${stringValue.replace(/"/g, '""')}"` : stringValue;
      }).join(',')
    );
    const csv = [headers, ...rows].join('\n');

    // Download
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = exportFilename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const toggleColumn = (key: string) => {
    patchTableUI({
      visibleColumns: visibleColumns.includes(key)
        ? visibleColumns.filter((k) => k !== key)
        : [...visibleColumns, key],
    });
  };

  const hasToolbar = Boolean(
    searchable || exportable || showColumnToggle || showResultsCount || toolbarStart || toolbarEnd
  );

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Toolbar */}
      {hasToolbar && (
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {searchable && (
              <div className="flex-1 sm:flex-initial sm:w-80">
                  <Input
                    placeholder={searchPlaceholder}
                    value={searchQuery}
                    onChange={(e) => {
                      patchTableUI({ searchQuery: e.target.value, currentPage: 1 });
                    }}
                    startContent={<Search className="w-4 h-4 text-app-text-subtle dark:text-app-dark-text-subtle" />}
                  />
              </div>
            )}
            {toolbarStart}
          </div>

          <div className="flex items-center gap-2">
            {showResultsCount && (
              <Badge size="sm" variant="flat" className="bg-app-surface-hover dark:bg-app-dark-surface-hover text-app-text-muted dark:text-app-dark-text-muted">
                {sortedData.length} results
              </Badge>
            )}

            {exportable && (
              <Button
                size="sm"
                variant="flat"
                startContent={<Download className="w-3 h-3" />}
                onPress={handleExport}
              >
                Export
              </Button>
            )}

            {toolbarEnd}

            {showColumnToggle && (
              <div className="relative group">
                <Button
                  size="sm"
                  variant="flat"
                  isIconOnly
                  aria-label="Toggle column visibility"
                >
                  <Settings2 className="w-3 h-3" />
                </Button>
                <div className="absolute right-0 top-full mt-2 w-48 bg-app-surface dark:bg-app-dark-surface border border-app-border dark:border-app-dark-border rounded-lg shadow-lg p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                  <p className="text-xs font-medium text-app-text-muted dark:text-app-dark-text-muted mb-2 px-2">Show Columns</p>
                  {initialColumns.map(col => (
                    <label
                      key={col.key}
                      className="flex items-center gap-2 px-2 py-1.5 hover:bg-app-surface-hover dark:hover:bg-app-dark-surface-hover rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={visibleColumns.includes(col.key)}
                        onChange={() => toggleColumn(col.key)}
                        className="rounded border-app-border dark:border-app-dark-border"
                      />
                      <span className="text-sm">{col.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      <Card padding="none" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-app-border dark:border-app-dark-border bg-app-surface-hover dark:bg-app-dark-surface-hover">
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={`py-3 px-4 text-sm font-medium text-app-text-muted dark:text-app-dark-text-muted ${
                      column.align === 'right' ? 'text-right' :
                      column.align === 'center' ? 'text-center' :
                      'text-left'
                    } ${column.sortable ? 'cursor-pointer hover:bg-app-surface-hover dark:hover:bg-app-dark-surface-hover select-none' : ''}`}
                    style={{ width: column.width }}
                    title={column.headerTitle}
                    onClick={() => column.sortable && handleSort(column.key)}
                  >
                    <div className={`flex items-center gap-1 ${
                      column.align === 'right' ? 'justify-end' :
                      column.align === 'center' ? 'justify-center' :
                      'justify-start'
                    }`}>
                      {column.label}
                      {column.sortable && getSortIcon(column.key)}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="py-12 text-center text-app-text-muted dark:text-app-dark-text-muted">
                    {searchQuery ? 'No results found' : emptyMessage}
                  </td>
                </tr>
              ) : (
                paginatedData.map((item, index) => (
                  <TableRow
                    key={index}
                    item={item}
                    columns={columns}
                    onRowClick={onRowClick}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-app-text-muted dark:text-app-dark-text-muted">Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                patchTableUI({ pageSize: Number(e.target.value), currentPage: 1 });
              }}
              className="px-2 py-1 text-sm rounded border border-app-border dark:border-app-dark-border bg-app-surface dark:bg-app-dark-surface text-app-text dark:text-app-dark-text"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-app-text-muted dark:text-app-dark-text-muted">
              Page {safeCurrentPage} of {totalPages}
            </span>
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="flat"
                isIconOnly
                isDisabled={safeCurrentPage === 1}
                onPress={() => patchTableUI({ currentPage: Math.max(1, safeCurrentPage - 1) })}
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="flat"
                isIconOnly
                isDisabled={safeCurrentPage === totalPages}
                onPress={() => patchTableUI({ currentPage: Math.min(totalPages, safeCurrentPage + 1) })}
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
