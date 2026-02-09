'use client';

import type { ReactNode } from 'react';

export interface KeyValueRowProps {
  label: ReactNode;
  value: ReactNode;
  withDivider?: boolean;
  className?: string;
  labelClassName?: string;
  valueClassName?: string;
  paddingYClassName?: string;
}

export function KeyValueRow({
  label,
  value,
  withDivider = false,
  className,
  labelClassName,
  valueClassName,
  paddingYClassName = 'py-2',
}: KeyValueRowProps) {
  return (
    <div
      className={[
        'flex items-center justify-between',
        paddingYClassName,
        withDivider ? 'border-b border-[var(--app-border)]' : '',
        className ?? '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <span
        className={[
          'text-sm text-[var(--app-text-muted)]',
          labelClassName ?? '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {label}
      </span>
      <span
        className={[
          'font-medium',
          valueClassName ?? '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {value}
      </span>
    </div>
  );
}
