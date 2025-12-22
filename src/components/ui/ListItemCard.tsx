'use client'

import type { ReactNode } from 'react';
import { Card } from '@/ui';

export interface ListItemCardProps {
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  meta?: ReactNode;
  badges?: ReactNode;
  actions?: ReactNode;
  onClick?: () => void;
  className?: string;
}

export function ListItemCard({
  icon,
  title,
  description,
  meta,
  badges,
  actions,
  onClick,
  className,
}: ListItemCardProps) {
  const clickableClasses = onClick
    ? 'cursor-pointer hover:bg-[var(--app-surface-hover)] transition-colors'
    : '';
  const classes = [
    'flex items-start justify-between gap-3',
    clickableClasses,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Card
      padding="md"
      className={classes}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        {icon && <div className="mt-1">{icon}</div>}
        <div>
          <div className="flex items-center gap-2">
            <div className="text-sm font-semibold">{title}</div>
            {badges}
          </div>
          {description && (
            <div className="text-sm text-[var(--app-text-muted)] mt-1">
              {description}
            </div>
          )}
          {meta && (
            <div className="text-xs text-[var(--app-text-subtle)] mt-1">
              {meta}
            </div>
          )}
        </div>
      </div>
      {actions && <div className="flex items-center">{actions}</div>}
    </Card>
  );
}
