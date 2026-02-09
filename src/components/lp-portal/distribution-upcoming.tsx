"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge, Button, Card } from "@/ui";
import { ListItemCard, StatusBadge } from '@/ui/composites';
import { EmptyState } from '@/ui/async-states';
import type { LPUpcomingDistribution } from "@/data/mocks/lp-portal/lp-investor-portal";
import { buildMonthDays } from "@/utils/calendar";
import { formatCurrency, formatDate } from "@/utils/formatting";
import { CalendarDays, CalendarX, ChevronLeft, ChevronRight } from "lucide-react";
import {
  addMonths,
  format,
  parseISO,
  subMonths,
  startOfMonth,
} from "date-fns";

export interface DistributionUpcomingProps {
  distributions: LPUpcomingDistribution[];
}

export function DistributionUpcoming({ distributions }: DistributionUpcomingProps) {
  const router = useRouter();
  const sorted = useMemo(
    () =>
      [...distributions].sort(
        (a, b) => new Date(a.expectedDate).getTime() - new Date(b.expectedDate).getTime()
      ),
    [distributions]
  );
  const [monthDate, setMonthDate] = useState(() => {
    if (sorted.length === 0) {
      return startOfMonth(new Date());
    }
    return startOfMonth(parseISO(sorted[0].expectedDate));
  });
  const monthLabel = format(monthDate, "MMMM yyyy");

  const calendarDays = useMemo(() => buildMonthDays(monthDate), [monthDate]);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, LPUpcomingDistribution[]>();
    sorted.forEach((item) => {
      const key = format(parseISO(item.expectedDate), "yyyy-MM-dd");
      const list = map.get(key) ?? [];
      list.push(item);
      map.set(key, list);
    });
    return map;
  }, [sorted]);

  return (
    <Card padding="lg">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">Upcoming Distributions</h3>
          <p className="text-sm text-[var(--app-text-muted)]">
            Track scheduled and in-progress payouts.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-[var(--app-text-muted)]">
          <CalendarDays className="h-4 w-4" />
          {sorted.length} scheduled
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[280px_1fr]">
        <div className="rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] p-3">
          <div className="flex items-center justify-between gap-2">
            <Button
              size="sm"
              variant="bordered"
              isIconOnly
              aria-label="Previous month"
              onPress={() => setMonthDate((current) => subMonths(current, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-sm font-semibold">{monthLabel}</div>
            <Button
              size="sm"
              variant="bordered"
              isIconOnly
              aria-label="Next month"
              onPress={() => setMonthDate((current) => addMonths(current, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="mt-2 grid grid-cols-7 text-[10px] text-[var(--app-text-muted)]">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="py-1 text-center">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1 text-xs">
            {calendarDays.map((cell) => {
              const key = format(cell.date, "yyyy-MM-dd");
              const dayEvents = eventsByDate.get(key) ?? [];
              return (
                <div
                  key={key}
                  className={`rounded-md border px-1 py-1 text-center ${
                    cell.isCurrentMonth
                      ? "border-[var(--app-border)]"
                      : "border-[var(--app-border-subtle)] text-[var(--app-text-muted)]"
                  }`}
                >
                  <div className="text-[10px]">{cell.date.getDate()}</div>
                  {dayEvents.length > 0 && (
                    <div className="mt-1 rounded-full bg-[var(--app-primary-bg)] text-[10px] text-[var(--app-primary)]">
                      {dayEvents.length}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          {sorted.length === 0 ? (
            <EmptyState
              icon={CalendarX}
              title="No scheduled distributions"
              action={(
                <Button
                  size="sm"
                  color="primary"
                  onPress={() => router.push("/fund-admin/distributions/calendar")}
                >
                  Schedule Distribution
                </Button>
              )}
            />
          ) : (
            sorted.map((item) => (
              <ListItemCard
                key={item.id}
                title={item.title}
                description={`${item.fundName} - ${formatDate(item.expectedDate)}`}
                meta={item.notes}
                badges={<StatusBadge status={item.status} size="sm" />}
                padding="sm"
                actions={(
                  <div className="flex items-center gap-2 text-xs text-[var(--app-text-muted)]">
                    <Badge size="sm" variant="flat">
                      {formatCurrency(item.estimatedAmount)}
                    </Badge>
                    <Button size="sm" variant="bordered">
                      Details
                    </Button>
                  </div>
                )}
              />
            ))
          )}
        </div>
      </div>
    </Card>
  );
}
