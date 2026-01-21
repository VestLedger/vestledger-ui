'use client';

import { memo } from 'react';
import type { ColumnDef } from './advanced-table';

interface TableRowProps<T extends object> {
  item: T;
  columns: ColumnDef<T>[];
  onRowClick?: (item: T) => void;
}

type TableValue = string | number | boolean | null | undefined | object;

const getValue = <T extends object>(item: T, key: string): TableValue | undefined =>
  (item as Record<string, TableValue>)[key];

function TableRowComponent<T extends object>({
  item,
  columns,
  onRowClick,
}: TableRowProps<T>) {
  return (
    <tr
      className={`border-b border-app-border dark:border-app-dark-border ${
        onRowClick ? 'cursor-pointer hover:bg-app-surface-hover dark:hover:bg-app-dark-surface-hover' : ''
      }`}
      onClick={() => onRowClick?.(item)}
    >
      {columns.map((column) => (
        <td
          key={column.key}
          className={`py-3 px-4 ${
            column.align === 'right' ? 'text-right' :
            column.align === 'center' ? 'text-center' :
            'text-left'
          }`}
        >
          {column.render ? column.render(item) : String(getValue(item, column.key) ?? '')}
        </td>
      ))}
    </tr>
  );
}

export const TableRow = memo(TableRowComponent) as typeof TableRowComponent;
