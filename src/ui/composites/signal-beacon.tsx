'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, CircleAlert } from 'lucide-react';

export type SignalBeaconTone = 'critical' | 'warning' | 'info' | 'success';

export interface SignalBeaconItem {
  id: string;
  title: string;
  description?: string;
  meta?: string;
  tone?: SignalBeaconTone;
  onSelect?: () => void;
}

export interface SignalBeaconProps {
  label: string;
  count: number;
  items: SignalBeaconItem[];
  tone?: SignalBeaconTone;
  emptyLabel?: string;
  className?: string;
  dropdownClassName?: string;
  buttonClassName?: string;
  testId?: string;
}

const toneClasses: Record<SignalBeaconTone, { dot: string; badge: string; text: string }> = {
  critical: {
    dot: 'bg-[var(--app-danger)]',
    badge: 'bg-[var(--app-danger-bg)] text-[var(--app-danger)] border-[color:color-mix(in_oklab,var(--app-danger)_38%,var(--app-border))]',
    text: 'text-[var(--app-danger)]',
  },
  warning: {
    dot: 'bg-[var(--app-warning)]',
    badge: 'bg-[var(--app-warning-bg)] text-[var(--app-warning)] border-[color:color-mix(in_oklab,var(--app-warning)_38%,var(--app-border))]',
    text: 'text-[var(--app-warning)]',
  },
  info: {
    dot: 'bg-[var(--app-info)]',
    badge: 'bg-[var(--app-info-bg)] text-[var(--app-info)] border-[color:color-mix(in_oklab,var(--app-info)_38%,var(--app-border))]',
    text: 'text-[var(--app-info)]',
  },
  success: {
    dot: 'bg-[var(--app-success)]',
    badge: 'bg-[var(--app-success-bg)] text-[var(--app-success)] border-[color:color-mix(in_oklab,var(--app-success)_38%,var(--app-border))]',
    text: 'text-[var(--app-success)]',
  },
};

const tonePriority: Record<SignalBeaconTone, number> = {
  critical: 0,
  warning: 1,
  info: 2,
  success: 3,
};

export function SignalBeacon({
  label,
  count,
  items,
  tone = 'warning',
  emptyLabel = 'No active signals',
  className,
  dropdownClassName,
  buttonClassName,
  testId = 'signal-beacon',
}: SignalBeaconProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const aTone = a.tone ?? tone;
      const bTone = b.tone ?? tone;
      return tonePriority[aTone] - tonePriority[bTone];
    });
  }, [items, tone]);
  const rootTone = toneClasses[tone];

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (containerRef.current?.contains(event.target as Node)) {
        return;
      }
      setOpen(false);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className={['relative', className ?? ''].filter(Boolean).join(' ')} data-testid={testId}>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        data-testid={`${testId}-trigger`}
        className={[
          'inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-left transition-colors',
          rootTone.badge,
          buttonClassName ?? '',
        ].filter(Boolean).join(' ')}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="relative inline-flex h-2.5 w-2.5">
          <span className={['absolute inline-flex h-full w-full rounded-full opacity-65 animate-ping', rootTone.dot].join(' ')} />
          <span className={['relative inline-flex h-2.5 w-2.5 rounded-full', rootTone.dot].join(' ')} />
        </span>
        <span className="text-xs font-semibold tracking-[0.06em] uppercase">{label}</span>
        <sup className="-ml-1 text-[10px] font-bold leading-none">{count}</sup>
        <ChevronDown className={['h-3.5 w-3.5 transition-transform', open ? 'rotate-180' : 'rotate-0'].join(' ')} />
      </button>

      {open && (
        <div
          role="menu"
          data-testid={`${testId}-dropdown`}
          className={[
            'absolute right-0 z-40 mt-2 w-[340px] overflow-hidden rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] shadow-[var(--shadow-xl)]',
            dropdownClassName ?? '',
          ].filter(Boolean).join(' ')}
        >
          <div className="border-b border-[var(--app-border)] px-3 py-2">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--app-text-subtle)]">{label}</p>
          </div>

          {sortedItems.length === 0 ? (
            <div className="px-3 py-4 text-sm text-[var(--app-text-muted)]">{emptyLabel}</div>
          ) : (
            <div className="max-h-80 overflow-auto">
              {sortedItems.map((item) => {
                const itemTone = toneClasses[item.tone ?? tone];
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="menuitem"
                    data-testid={`${testId}-item`}
                    onClick={() => {
                      item.onSelect?.();
                      setOpen(false);
                    }}
                    className="w-full border-b border-[var(--app-border-subtle)] px-3 py-3 text-left transition-colors last:border-b-0 hover:bg-[var(--app-surface-hover)]"
                  >
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <p className="line-clamp-1 text-sm font-semibold text-[var(--app-text)]">{item.title}</p>
                      <CircleAlert className={['h-4 w-4 flex-shrink-0', itemTone.text].join(' ')} />
                    </div>
                    {item.description && (
                      <p className="line-clamp-2 text-xs text-[var(--app-text-muted)]">{item.description}</p>
                    )}
                    {item.meta && (
                      <p className="mt-1 text-[11px] text-[var(--app-text-subtle)]">{item.meta}</p>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
