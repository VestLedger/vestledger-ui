'use client'

import type { KeyboardEvent, ReactNode } from 'react';
import { Card, type CardProps } from '@/ui';

export interface ListItemCardProps {
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  meta?: ReactNode;
  badges?: ReactNode;
  actions?: ReactNode;
  onClick?: () => void;
  className?: string;
  padding?: CardProps['padding'];
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
  padding = 'md',
}: ListItemCardProps) {
  const isInteractive = Boolean(onClick);
  const usePressableCard = isInteractive && !actions;

  const clickableClasses = isInteractive
    ? 'cursor-pointer hover:bg-[var(--app-surface-hover)] transition-colors'
    : '';
  const classes = [
    'flex items-start justify-between gap-3',
    clickableClasses,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!onClick) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick();
    }
  };

  const cardContent = (
    <Card
      padding={padding}
      className={classes}
      isPressable={usePressableCard}
      onPress={usePressableCard ? onClick : undefined}
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

  if (!usePressableCard && isInteractive) {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={onClick}
        onKeyDown={handleKeyDown}
      >
        {cardContent}
      </div>
    );
  }

  return cardContent;
}
