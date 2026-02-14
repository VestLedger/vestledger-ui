'use client';

import { AlertTriangle, ArrowRight, CheckSquare } from 'lucide-react';
import type { DailyBriefItem, PriorityQuadrant } from '@/data/mocks/hooks/dashboard-data';
import { DEFAULT_LOCALE } from '@/config/i18n';
import { CompactLaneHeader } from '@/ui/composites';

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

const getQuadrantTone = (quadrant: PriorityQuadrant) => {
  if (quadrant === 'urgent-important') {
    return {
      lane: 'border-[color:color-mix(in_oklab,var(--app-danger)_38%,var(--app-border))] bg-[color:color-mix(in_oklab,var(--app-danger)_10%,var(--app-surface))]',
      label: 'text-[var(--app-danger)]',
    };
  }
  if (quadrant === 'urgent-non-important') {
    return {
      lane: 'border-[color:color-mix(in_oklab,var(--app-warning)_38%,var(--app-border))] bg-[color:color-mix(in_oklab,var(--app-warning)_9%,var(--app-surface))]',
      label: 'text-[var(--app-warning)]',
    };
  }
  if (quadrant === 'non-urgent-important') {
    return {
      lane: 'border-[color:color-mix(in_oklab,var(--app-primary)_36%,var(--app-border))] bg-[color:color-mix(in_oklab,var(--app-primary)_8%,var(--app-surface))]',
      label: 'text-[var(--app-primary)]',
    };
  }
  return {
    lane: 'border-[var(--app-border)] bg-[var(--app-surface)]',
    label: 'text-[var(--app-text-muted)]',
  };
};

const getLaneBadgeClass = (lane: DailyBriefItem['lane']) => {
  if (lane === 'Portfolio') return 'bg-[var(--app-info-bg)] text-[var(--app-info)]';
  if (lane === 'LP Relations') return 'bg-[var(--app-primary-bg)] text-[var(--app-primary)]';
  return 'bg-[var(--app-surface-2)] text-[var(--app-text-muted)]';
};

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
    <section data-testid="gp-priority-matrix" className="overflow-hidden rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)]">
      <CompactLaneHeader
        title="Decision Matrix (Today + 7 Days)"
        subtitle="Tasks and warnings arranged by urgency and importance."
        badge={`${items.length} signals`}
        tone="warning"
      />

      <div className="px-4 pb-3 pt-2">
        <div className="mb-2 flex items-center justify-between">
          <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--app-text-subtle)]">
            Importance <ArrowRight className="inline h-3 w-3 rotate-[-90deg]" />
          </div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--app-text-subtle)]">
            Urgency <ArrowRight className="inline h-3 w-3" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
          {QUADRANT_CONFIG.map((quadrant) => {
            const quadrantItems = grouped[quadrant.key];
            const visibleItems = quadrantItems.slice(0, MAX_ITEMS_PER_QUADRANT);
            const hiddenCount = Math.max(quadrantItems.length - MAX_ITEMS_PER_QUADRANT, 0);
            const tone = getQuadrantTone(quadrant.key);

            return (
              <div
                key={quadrant.key}
                data-testid={`priority-quadrant-${quadrant.key}`}
                className={`rounded-xl border px-3 py-3 ${tone.lane}`}
              >
                <div className="mb-2 flex items-center justify-between gap-3">
                  <div>
                    <h3 className={`text-xs font-semibold ${tone.label}`}>{quadrant.title}</h3>
                    <p className="text-[11px] text-[var(--app-text-subtle)]">{quadrant.subtitle}</p>
                  </div>
                  <div className="text-[10px] uppercase tracking-[0.14em] text-[var(--app-text-subtle)]">
                    {quadrantItems.length} items
                  </div>
                </div>

                <div className="space-y-2">
                  {visibleItems.length === 0 ? (
                    <p className="text-xs text-[var(--app-text-subtle)]">No signals in this zone.</p>
                  ) : (
                    visibleItems.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        className="group w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-2 py-2 text-left transition-colors hover:border-[var(--app-primary)]"
                        onClick={() => onItemClick(item)}
                      >
                        <div className="mb-1 flex items-center justify-between gap-2">
                          <span className="line-clamp-1 text-xs font-semibold text-[var(--app-text)]">{item.title}</span>
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
                          <span className="truncate">{item.owner}</span>
                          <span>Due {item.dueDate.toLocaleDateString(DEFAULT_LOCALE, { month: 'short', day: 'numeric' })}</span>
                        </div>

                        <div className="mt-1 flex items-center justify-between">
                          <span className={[
                            'inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-[0.05em]',
                            getLaneBadgeClass(item.lane),
                          ].join(' ')}>
                            {item.lane}
                          </span>
                          <span className="text-[10px] text-[var(--app-text-subtle)]">
                            Score {item.urgencyScore + item.importanceScore}
                          </span>
                        </div>
                      </button>
                    ))
                  )}

                  {hiddenCount > 0 && (
                    <p className="text-[10px] text-[var(--app-text-subtle)]">+{hiddenCount} additional signals</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
