'use client';

import { AlertTriangle, CheckSquare } from 'lucide-react';
import type { DailyBriefItem, PriorityQuadrant } from '@/data/mocks/hooks/dashboard-data';

interface HomePriorityMatrixProps {
  items: DailyBriefItem[];
  onItemClick: (item: DailyBriefItem) => void;
}

const QUADRANT_CONFIG: Array<{ key: PriorityQuadrant; title: string; subtitle: string }> = [
  {
    key: 'urgent-important',
    title: 'Urgent + Important',
    subtitle: 'Act now (0-48h impact).',
  },
  {
    key: 'urgent-non-important',
    title: 'Urgent + Less Important',
    subtitle: 'Delegate fast and monitor.',
  },
  {
    key: 'non-urgent-important',
    title: 'Important + Not Urgent',
    subtitle: 'Schedule this week.',
  },
  {
    key: 'non-urgent-non-important',
    title: 'Not Urgent + Less Important',
    subtitle: 'Batch or defer.',
  },
];

const MAX_ITEMS_PER_QUADRANT = 3;

export function HomePriorityMatrix({ items, onItemClick }: HomePriorityMatrixProps) {
  const grouped = QUADRANT_CONFIG.reduce<Record<PriorityQuadrant, DailyBriefItem[]>>((acc, quadrant) => {
    acc[quadrant.key] = items
      .filter((item) => item.quadrant === quadrant.key)
      .sort((a, b) => {
        if (a.dueDate.getTime() !== b.dueDate.getTime()) {
          return a.dueDate.getTime() - b.dueDate.getTime();
        }
        return (b.urgencyScore + b.importanceScore) - (a.urgencyScore + a.importanceScore);
      });
    return acc;
  }, {
    'urgent-important': [],
    'urgent-non-important': [],
    'non-urgent-important': [],
    'non-urgent-non-important': [],
  });

  return (
    <section data-testid="gp-priority-matrix" className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-4">
      <div className="mb-3">
        <h2 className="text-sm font-semibold text-[var(--app-text)]">Tasks + Warnings Matrix (Today + 7 days)</h2>
        <p className="text-xs text-[var(--app-text-muted)]">Urgency on X-axis, importance on Y-axis. Click an item to jump to the owning workflow.</p>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {QUADRANT_CONFIG.map((quadrant) => {
          const quadrantItems = grouped[quadrant.key];
          const visibleItems = quadrantItems.slice(0, MAX_ITEMS_PER_QUADRANT);
          const hiddenCount = Math.max(quadrantItems.length - MAX_ITEMS_PER_QUADRANT, 0);

          return (
            <div
              key={quadrant.key}
              data-testid={`priority-quadrant-${quadrant.key}`}
              className="rounded-lg border border-[var(--app-border)] bg-[var(--app-surface-hover)] p-3"
            >
              <div className="mb-2">
                <h3 className="text-xs font-semibold text-[var(--app-text)]">{quadrant.title}</h3>
                <p className="text-xs text-[var(--app-text-subtle)]">{quadrant.subtitle}</p>
              </div>

              <div className="space-y-2">
                {visibleItems.length === 0 ? (
                  <p className="text-xs text-[var(--app-text-subtle)]">No items.</p>
                ) : (
                  visibleItems.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className="w-full rounded-md border border-[var(--app-border)] bg-[var(--app-surface)] px-2 py-2 text-left hover:border-[var(--app-primary)]"
                      onClick={() => onItemClick(item)}
                    >
                      <div className="mb-1 flex items-center justify-between gap-2">
                        <span className="line-clamp-1 text-xs font-medium text-[var(--app-text)]">{item.title}</span>
                        <span className="inline-flex items-center gap-1 text-[10px] text-[var(--app-text-subtle)]">
                          {item.type === 'warning' ? (
                            <AlertTriangle className="h-3 w-3 text-[var(--app-warning)]" />
                          ) : (
                            <CheckSquare className="h-3 w-3 text-[var(--app-info)]" />
                          )}
                          {item.type}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-[var(--app-text-muted)]">
                        <span>{item.owner}</span>
                        <span>
                          Due {item.dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </button>
                  ))
                )}

                {hiddenCount > 0 && (
                  <p className="text-[10px] text-[var(--app-text-subtle)]">+{hiddenCount} more</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
