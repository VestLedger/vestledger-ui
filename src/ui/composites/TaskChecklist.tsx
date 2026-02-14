'use client';

import { Checkbox, Badge } from '@/ui';

export interface TaskChecklistItem {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  metaLabel?: string;
  priority?: 'low' | 'medium' | 'high';
}

export interface TaskChecklistProps {
  items: TaskChecklistItem[];
  onToggle?: (itemId: string, completed: boolean) => void;
  emptyMessage?: string;
  className?: string;
}

function priorityClass(priority?: 'low' | 'medium' | 'high') {
  switch (priority) {
    case 'high':
      return 'bg-[var(--app-danger-bg)] text-[var(--app-danger)]';
    case 'medium':
      return 'bg-[var(--app-warning-bg)] text-[var(--app-warning)]';
    case 'low':
      return 'bg-[var(--app-info-bg)] text-[var(--app-info)]';
    default:
      return 'bg-[var(--app-surface-hover)] text-[var(--app-text-muted)]';
  }
}

export function TaskChecklist({
  items,
  onToggle,
  emptyMessage = 'No checklist items yet.',
  className,
}: TaskChecklistProps) {
  if (items.length === 0) {
    return (
      <div className={className}>
        <p className="text-sm text-[var(--app-text-muted)]">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2"
          >
            <div className="flex items-start gap-3">
              <Checkbox
                isSelected={item.completed}
                onValueChange={(nextValue) => onToggle?.(item.id, nextValue)}
                aria-label={`Toggle ${item.title}`}
                className="mt-0.5"
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p
                    className={`text-sm font-medium ${
                      item.completed ? 'line-through text-[var(--app-text-muted)]' : ''
                    }`}
                  >
                    {item.title}
                  </p>
                  {item.priority && (
                    <Badge size="sm" variant="flat" className={priorityClass(item.priority)}>
                      {item.priority}
                    </Badge>
                  )}
                  {item.metaLabel && (
                    <Badge size="sm" variant="flat" className="bg-[var(--app-surface-hover)]">
                      {item.metaLabel}
                    </Badge>
                  )}
                </div>
                {item.description && (
                  <p className="mt-1 text-xs text-[var(--app-text-muted)]">{item.description}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
