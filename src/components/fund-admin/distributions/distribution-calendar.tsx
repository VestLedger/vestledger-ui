"use client";

import { useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Badge, Button, Card, Checkbox, Input, Select, Switch, Tabs, Tab } from "@/ui";
import { ListItemCard, PageScaffold, SectionHeader, StatusBadge } from "@/components/ui";
import { AsyncStateRenderer } from "@/components/ui/async-states";
import { useAsyncData } from "@/hooks/useAsyncData";
import { useUIKey } from "@/store/ui";
import {
  calendarEventsRequested,
  calendarEventsSelectors,
  distributionsRequested,
  distributionsSelectors,
} from "@/store/slices/distributionSlice";
import { useFund } from "@/contexts/fund-context";
import type { Distribution, DistributionCalendarEvent } from "@/types/distribution";
import { formatCurrencyCompact, formatDate } from "@/utils/formatting";
import { distributionEventTypeLabels, getLabelForType } from "@/utils/styling/typeMappers";
import { getStatusColorVars } from "@/utils/styling/statusColors";
import {
  addDays,
  compareAsc,
  differenceInCalendarDays,
  format,
  isAfter,
  isBefore,
  isSameDay,
  parseISO,
  startOfDay,
  subDays,
} from "date-fns";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { EventClickArg, EventContentArg, EventInput } from "@fullcalendar/core";
import {
  Bell,
  CalendarDays,
  Clock,
  List,
  Plus,
  Repeat,
} from "lucide-react";

type CalendarView = "calendar" | "list" | "timeline";
type ListFilter = "upcoming" | "past" | "recurring";

type ScheduleFormState = {
  title: string;
  fundId: string;
  date: string;
  amount: string;
  isRecurring: boolean;
  frequency: "monthly" | "quarterly" | "semi-annual" | "annual";
  remind7: boolean;
  remind1: boolean;
};

type DistributionCalendarUIState = {
  view: CalendarView;
  listFilter: ListFilter;
  searchQuery: string;
  showScheduleForm: boolean;
  scheduleForm: ScheduleFormState;
  scheduledDrafts: DistributionCalendarEvent[];
};

type CalendarDateClickArg = {
  dateStr: string;
  date: Date;
};

const toDateKey = (value: Date) => format(value, "yyyy-MM-dd");

const parseDate = (value: string) => parseISO(value);

type TimelineSegment = {
  id: "draft" | "approval" | "executed";
  label: string;
  start: Date;
  end: Date;
  className: string;
};

const resolveDate = (value?: string, fallback?: Date) => (value ? parseISO(value) : fallback);

const buildTimelineSegments = (distribution: Distribution, today: Date): TimelineSegment[] => {
  const created = resolveDate(distribution.createdAt, resolveDate(distribution.eventDate, today)) ?? today;
  const submitted = resolveDate(distribution.submittedForApprovalAt);
  const approved = resolveDate(distribution.approvedAt);
  const completed = resolveDate(distribution.completedAt);

  const segments: TimelineSegment[] = [];
  const status = distribution.status;

  const draftEnd = submitted ?? approved ?? completed ?? today;
  segments.push({
    id: "draft",
    label: "Draft",
    start: created,
    end: draftEnd,
    className: "bg-[var(--app-warning-bg)] text-[var(--app-warning)]",
  });

  if (status !== "draft") {
    const approvalStart = submitted ?? created;
    const approvalEnd = approved ?? today;
    segments.push({
      id: "approval",
      label: "Approval",
      start: approvalStart,
      end: approvalEnd,
      className: "bg-[var(--app-info-bg)] text-[var(--app-info)]",
    });
  }

  if (["approved", "processing", "completed"].includes(status)) {
    const executionStart = approved ?? submitted ?? created;
    const executionEnd = completed ?? today;
    segments.push({
      id: "executed",
      label: "Executed",
      start: executionStart,
      end: executionEnd,
      className: "bg-[var(--app-success-bg)] text-[var(--app-success)]",
    });
  }

  return segments;
};

export function DistributionCalendar() {
  const router = useRouter();
  const { funds, selectedFund } = useFund();
  const today = startOfDay(new Date());
  const todayKey = toDateKey(today);
  const defaultFundId = selectedFund?.id ?? funds[0]?.id ?? "all-funds";

  const initialUIState = useMemo<DistributionCalendarUIState>(
    () => ({
      view: "calendar",
      listFilter: "upcoming",
      searchQuery: "",
      showScheduleForm: false,
      scheduleForm: {
        title: "",
        fundId: defaultFundId,
        date: todayKey,
        amount: "",
        isRecurring: false,
        frequency: "quarterly",
        remind7: true,
        remind1: true,
      },
      scheduledDrafts: [],
    }),
    [defaultFundId, todayKey]
  );

  const { value: ui, patch: patchUI } = useUIKey<DistributionCalendarUIState>(
    "distribution-calendar",
    initialUIState
  );

  const { data, isLoading, error, refetch } = useAsyncData(
    calendarEventsRequested,
    calendarEventsSelectors.selectState
  );

  const {
    data: distributionsData,
    isLoading: distributionsLoading,
    error: distributionsError,
    refetch: refetchDistributions,
  } = useAsyncData(distributionsRequested, distributionsSelectors.selectState, {
    fetchOnMount: ui.view === "timeline",
    dependencies: [ui.view],
  });

  const allEvents = useMemo<DistributionCalendarEvent[]>(
    () => [...(data?.events ?? []), ...(ui.scheduledDrafts ?? [])],
    [data?.events, ui.scheduledDrafts]
  );

  const filteredEvents = useMemo(() => {
    const query = ui.searchQuery.trim().toLowerCase();
    const matchesSearch = (event: DistributionCalendarEvent) =>
      !query ||
      event.title.toLowerCase().includes(query) ||
      event.fundName.toLowerCase().includes(query) ||
      (event.description ?? "").toLowerCase().includes(query);

    return allEvents.filter((event) => {
      if (!matchesSearch(event)) return false;
      if (ui.listFilter === "recurring") return event.isRecurring;
      const eventDate = parseDate(event.date);
      if (ui.listFilter === "past") return isBefore(eventDate, today);
      return !isBefore(eventDate, today);
    });
  }, [allEvents, ui.listFilter, ui.searchQuery, today]);

  const upcomingAlerts = useMemo(() => {
    const alerts: Array<{
      id: string;
      event: DistributionCalendarEvent;
      reminderDate: Date;
      daysBefore: number;
      daysAway: number;
    }> = [];

    allEvents.forEach((event) => {
      const reminderDays = event.reminderDaysBefore ?? [];
      reminderDays.forEach((daysBefore) => {
        const reminderDate = subDays(parseDate(event.date), daysBefore);
        if (isAfter(reminderDate, today) || isSameDay(reminderDate, today)) {
          alerts.push({
            id: `${event.id}-reminder-${daysBefore}`,
            event,
            reminderDate,
            daysBefore,
            daysAway: differenceInCalendarDays(reminderDate, today),
          });
        }
      });
    });

    return alerts.sort((a, b) => compareAsc(a.reminderDate, b.reminderDate)).slice(0, 4);
  }, [allEvents, today]);

  const fundOptions = useMemo(
    () =>
      funds.length > 0
        ? funds.map((fund) => ({ value: fund.id, label: fund.displayName }))
        : [{ value: "all-funds", label: "All Funds" }],
    [funds]
  );

  const handleScheduleSubmit = () => {
    const fund = funds.find((item) => item.id === ui.scheduleForm.fundId);
    const reminderDaysBefore = [ui.scheduleForm.remind7 ? 7 : null, ui.scheduleForm.remind1 ? 1 : null]
      .filter((value): value is number => value !== null)
      .sort((a, b) => b - a);
    const newEvent: DistributionCalendarEvent = {
      id: `scheduled-${Date.now()}`,
      title: ui.scheduleForm.title || "Scheduled Distribution",
      date: ui.scheduleForm.date || todayKey,
      eventType: "scheduled",
      status: "upcoming",
      amount: ui.scheduleForm.amount ? Number(ui.scheduleForm.amount) : undefined,
      fundId: fund?.id ?? ui.scheduleForm.fundId,
      fundName: fund?.displayName ?? selectedFund?.displayName ?? "All Funds",
      description: ui.scheduleForm.isRecurring
        ? `Recurring ${ui.scheduleForm.frequency} distribution`
        : ui.scheduleForm.remind7 || ui.scheduleForm.remind1
        ? "Email reminders enabled"
        : undefined,
      isRecurring: ui.scheduleForm.isRecurring,
      reminderDaysBefore: reminderDaysBefore.length > 0 ? reminderDaysBefore : undefined,
      color: "#6b7280",
    };

    patchUI({
      scheduledDrafts: [newEvent, ...ui.scheduledDrafts],
      showScheduleForm: false,
      scheduleForm: {
        ...ui.scheduleForm,
        title: "",
        amount: "",
        isRecurring: false,
        remind7: true,
        remind1: true,
      },
    });
  };

  const calendarEvents = useMemo<EventInput[]>(() => {
    return allEvents.map((event) => {
      const statusColors = getStatusColorVars(event.status, "fund-admin");
      const backgroundColor = event.color ?? statusColors.bg;
      const borderColor = event.color ?? statusColors.text;
      const textColor = event.color ? "#ffffff" : statusColors.text;
      return {
        id: event.id,
        title: event.title,
        start: event.date,
        allDay: true,
        display: "block",
        backgroundColor,
        borderColor,
        textColor,
        extendedProps: {
          distributionId: event.distributionId,
          amount: event.amount,
          fundName: event.fundName,
          eventType: event.eventType,
          status: event.status,
          isRecurring: event.isRecurring,
        },
      };
    });
  }, [allEvents]);

  const handleDateClick = useCallback(
    (arg: CalendarDateClickArg) => {
      const nextDate = arg.dateStr.slice(0, 10);
      patchUI({
        showScheduleForm: true,
        scheduleForm: {
          ...ui.scheduleForm,
          date: nextDate,
        },
      });
    },
    [patchUI, ui.scheduleForm]
  );

  const handleEventClick = useCallback(
    (arg: EventClickArg) => {
      const distributionId = arg.event.extendedProps?.distributionId as string | undefined;
      if (distributionId) {
        router.push(`/fund-admin/distributions/${distributionId}`);
        return;
      }

      const nextDate = arg.event.startStr?.slice(0, 10) ?? todayKey;
      patchUI({
        showScheduleForm: true,
        scheduleForm: {
          ...ui.scheduleForm,
          title: arg.event.title,
          date: nextDate,
        },
      });
    },
    [patchUI, router, todayKey, ui.scheduleForm]
  );

  const renderEventContent = useCallback(
    (content: EventContentArg) => {
      const amount = content.event.extendedProps?.amount as number | undefined;
      const fundName = content.event.extendedProps?.fundName as string | undefined;
      return (
        <div className="space-y-0.5 leading-tight">
          <div className="truncate text-[10px] font-semibold">
            {content.event.title}
          </div>
          {fundName && (
            <div className="truncate text-[9px] text-[var(--app-text-subtle)]">
              {fundName}
            </div>
          )}
          {typeof amount === "number" && (
            <div className="text-[9px]">{formatCurrencyCompact(amount)}</div>
          )}
        </div>
      );
    },
    []
  );

  return (
    <PageScaffold
      routePath="/fund-admin/distributions/calendar"
      header={{
        title: "Distribution Calendar",
        description: "Schedule upcoming distributions and track approval timelines.",
        icon: CalendarDays,
        primaryAction: {
          label: ui.showScheduleForm ? "Close Scheduler" : "Schedule Distribution",
          onClick: () => patchUI({ showScheduleForm: !ui.showScheduleForm }),
        },
        secondaryActions: [
          {
            label: "Back to Fund Admin",
            onClick: () => router.push("/fund-admin"),
          },
        ],
      }}
      containerProps={{ className: "space-y-6" }}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs
          variant="underlined"
          selectedKey={ui.view}
          onSelectionChange={(key) => patchUI({ view: key as CalendarView })}
          classNames={{ base: "p-0" }}
        >
          <Tab key="calendar" title="Calendar" />
          <Tab key="list" title="List View" />
          <Tab key="timeline" title="Timeline" />
        </Tabs>
        <div className="flex items-center gap-2 text-xs text-[var(--app-text-muted)]">
          <Bell className="h-4 w-4 text-[var(--app-warning)]" />
          {upcomingAlerts.length} upcoming alerts
        </div>
      </div>

      {ui.showScheduleForm && (
        <Card padding="lg">
          <SectionHeader
            title="Schedule Distribution"
            description="Add future distribution dates with reminder preferences."
            action={(
              <Badge size="sm" variant="flat" className="bg-[var(--app-primary-bg)] text-[var(--app-primary)]">
                Planner
              </Badge>
            )}
          />

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Input
              label="Distribution title"
              value={ui.scheduleForm.title}
              onChange={(event) => patchUI({ scheduleForm: { ...ui.scheduleForm, title: event.target.value } })}
              placeholder="Q2 dividend distribution"
            />
            <Select
              label="Fund"
              selectedKeys={[ui.scheduleForm.fundId]}
              onChange={(event) =>
                patchUI({ scheduleForm: { ...ui.scheduleForm, fundId: event.target.value } })
              }
              options={fundOptions}
            />
            <Input
              type="date"
              label="Scheduled date"
              value={ui.scheduleForm.date}
              min={todayKey}
              onChange={(event) => patchUI({ scheduleForm: { ...ui.scheduleForm, date: event.target.value } })}
            />
            <Input
              type="number"
              label="Estimated amount"
              value={ui.scheduleForm.amount}
              onChange={(event) => patchUI({ scheduleForm: { ...ui.scheduleForm, amount: event.target.value } })}
              placeholder="2500000"
            />
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-4">
            <Switch
              isSelected={ui.scheduleForm.isRecurring}
              onValueChange={(value) =>
                patchUI({ scheduleForm: { ...ui.scheduleForm, isRecurring: value } })
              }
            >
              Recurring distribution
            </Switch>
            {ui.scheduleForm.isRecurring && (
              <Select
                label="Frequency"
                selectedKeys={[ui.scheduleForm.frequency]}
                onChange={(event) =>
                  patchUI({
                    scheduleForm: {
                      ...ui.scheduleForm,
                      frequency: event.target.value as ScheduleFormState["frequency"],
                    },
                  })
                }
                options={[
                  { value: "monthly", label: "Monthly" },
                  { value: "quarterly", label: "Quarterly" },
                  { value: "semi-annual", label: "Semi-Annual" },
                  { value: "annual", label: "Annual" },
                ]}
              />
            )}
          </div>

          <div className="mt-4 space-y-2">
            <div className="text-xs font-semibold text-[var(--app-text-muted)]">
              Email reminders
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <Checkbox
                isSelected={ui.scheduleForm.remind7}
                onValueChange={(value) =>
                  patchUI({ scheduleForm: { ...ui.scheduleForm, remind7: value } })
                }
              >
                7 days before
              </Checkbox>
              <Checkbox
                isSelected={ui.scheduleForm.remind1}
                onValueChange={(value) =>
                  patchUI({ scheduleForm: { ...ui.scheduleForm, remind1: value } })
                }
              >
                1 day before
              </Checkbox>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Button
              color="primary"
              startContent={<Plus className="h-4 w-4" />}
              onPress={handleScheduleSubmit}
            >
              Schedule
            </Button>
            <Button variant="bordered" onPress={() => patchUI({ showScheduleForm: false })}>
              Cancel
            </Button>
          </div>
        </Card>
      )}

      <AsyncStateRenderer
        data={allEvents}
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        emptyTitle="No distribution events"
        emptyMessage="Schedule a distribution to see it on the calendar."
        isEmpty={(value) => value.length === 0}
      >
        {(_events) => (
          <>
            {ui.view === "calendar" && (
              <Card padding="lg">
                <SectionHeader
                  title="Distribution Calendar"
                  description="Month, week, and day views for scheduled distributions."
                  action={(
                    <Badge size="sm" variant="flat">
                      {allEvents.length} events
                    </Badge>
                  )}
                  className="mb-4"
                />

                <FullCalendar
                  plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                  initialView="dayGridMonth"
                  headerToolbar={{
                    left: "prev,next today",
                    center: "title",
                    right: "dayGridMonth,timeGridWeek,timeGridDay",
                  }}
                  height="auto"
                  events={calendarEvents}
                  eventContent={renderEventContent}
                  eventClick={handleEventClick}
                  dateClick={handleDateClick}
                  dayMaxEventRows={2}
                  fixedWeekCount={false}
                  selectable
                />
              </Card>
            )}

            {ui.view === "list" && (
              <div className="space-y-4">
                <Card padding="lg">
                  <SectionHeader
                    title="Distribution Events"
                    description="Filter distributions by timing and recurrence."
                    action={(
                      <div className="flex items-center gap-2 text-xs text-[var(--app-text-muted)]">
                        <List className="h-4 w-4" />
                        {filteredEvents.length} events
                      </div>
                    )}
                  />

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    {(["upcoming", "past", "recurring"] as ListFilter[]).map((filter) => (
                      <Button
                        key={filter}
                        size="sm"
                        variant={ui.listFilter === filter ? "solid" : "flat"}
                        color={ui.listFilter === filter ? "primary" : "default"}
                        onPress={() => patchUI({ listFilter: filter })}
                      >
                        {filter === "upcoming" ? "Upcoming" : filter === "past" ? "Past" : "Recurring"}
                      </Button>
                    ))}
                    <Input
                      value={ui.searchQuery}
                      onChange={(event) => patchUI({ searchQuery: event.target.value })}
                      placeholder="Search events..."
                      className="max-w-xs"
                    />
                  </div>
                </Card>

                {filteredEvents.length === 0 ? (
                  <Card padding="lg">
                    <div className="text-sm text-[var(--app-text-muted)]">
                      No events match your filters yet.
                    </div>
                  </Card>
                ) : (
                  <div className="grid gap-3">
                    {filteredEvents.map((event) => (
                      <ListItemCard
                        key={event.id}
                        title={event.title}
                        description={`${event.fundName} - ${getLabelForType(distributionEventTypeLabels, event.eventType)}`}
                        meta={`${formatDate(event.date)}${event.amount ? ` - ${formatCurrencyCompact(event.amount)}` : ""}`}
                        badges={(
                          <div className="flex items-center gap-2">
                            <StatusBadge status={event.status} domain="fund-admin" size="sm" />
                            {event.isRecurring && (
                              <Badge
                                size="sm"
                                variant="flat"
                                className="bg-[var(--app-primary-bg)] text-[var(--app-primary)]"
                              >
                                <Repeat className="h-3 w-3 mr-1" />
                                Recurring
                              </Badge>
                            )}
                          </div>
                        )}
                        actions={(
                          <Button
                            size="sm"
                            variant="flat"
                            onPress={() => {
                              if (event.distributionId) {
                                router.push(`/fund-admin/distributions/${event.distributionId}`);
                              } else {
                                patchUI({ showScheduleForm: true });
                              }
                            }}
                          >
                            View
                          </Button>
                        )}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {ui.view === "timeline" && (
              <AsyncStateRenderer
                data={distributionsData?.distributions ?? []}
                isLoading={distributionsLoading}
                error={distributionsError}
                onRetry={refetchDistributions}
                emptyTitle="No distributions yet"
                emptyMessage="Create a distribution to see lifecycle progress."
                isEmpty={(value) => value.length === 0}
              >
                {(items) => {
                  const timelineRows = items.map((distribution) => ({
                    distribution,
                    segments: buildTimelineSegments(distribution, today),
                  }));

                  const timestamps = timelineRows.flatMap((row) =>
                    row.segments.flatMap((segment) => [
                      segment.start.getTime(),
                      segment.end.getTime(),
                    ])
                  );

                  const minTime = timestamps.length > 0 ? Math.min(...timestamps) : today.getTime();
                  const maxTime = timestamps.length > 0 ? Math.max(...timestamps) : today.getTime();
                  const rangeEnd = maxTime === minTime ? addDays(new Date(minTime), 1).getTime() : maxTime;
                  const rangeMs = rangeEnd - minTime || 1;
                  const rangeStartDate = new Date(minTime);
                  const rangeEndDate = new Date(rangeEnd);
                  const rangeMidDate = new Date(minTime + rangeMs / 2);

                  const getPosition = (date: Date) =>
                    ((date.getTime() - minTime) / rangeMs) * 100;

                  return (
                    <Card padding="lg">
                      <SectionHeader
                        title="Lifecycle Timeline"
                        description="Draft to approval to executed progression mapped across actual dates."
                        action={(
                          <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--app-text-muted)]">
                            <div className="flex items-center gap-1">
                              <span className="h-2 w-2 rounded-full bg-[var(--app-warning-bg)]" />
                              Draft
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="h-2 w-2 rounded-full bg-[var(--app-info-bg)]" />
                              Approval
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="h-2 w-2 rounded-full bg-[var(--app-success-bg)]" />
                              Executed
                            </div>
                          </div>
                        )}
                      />

                      <div className="mt-4 flex justify-between text-xs text-[var(--app-text-muted)]">
                        <span>{format(rangeStartDate, "MMM d")}</span>
                        <span>{format(rangeMidDate, "MMM d")}</span>
                        <span>{format(rangeEndDate, "MMM d")}</span>
                      </div>

                      <div className="mt-4 space-y-4">
                        {timelineRows.map(({ distribution, segments }) => (
                          <div
                            key={distribution.id}
                            className="grid gap-3 md:grid-cols-[240px_1fr]"
                          >
                            <div>
                              <div className="text-sm font-semibold">{distribution.name}</div>
                              <div className="text-xs text-[var(--app-text-muted)]">
                                {distribution.fundName} - {formatDate(distribution.eventDate)}
                              </div>
                              <div className="mt-1 text-[10px] text-[var(--app-text-subtle)]">
                                Draft {formatDate(distribution.createdAt)} - Approved{" "}
                                {distribution.approvedAt ? formatDate(distribution.approvedAt) : "Pending"} - Executed{" "}
                                {distribution.completedAt ? formatDate(distribution.completedAt) : "Pending"}
                              </div>
                            </div>
                            <div className="relative h-8 rounded-full bg-[var(--app-surface-hover)]">
                              {segments.map((segment) => {
                                const left = getPosition(segment.start);
                                const width = Math.max(2, getPosition(segment.end) - left);
                                const showLabel = width > 12;
                                return (
                                  <div
                                    key={`${distribution.id}-${segment.id}`}
                                    className={`absolute top-1 h-6 rounded-full ${segment.className}`}
                                    style={{ left: `${left}%`, width: `${width}%` }}
                                  >
                                    {showLabel && (
                                      <span className="px-2 text-[10px] font-semibold">
                                        {segment.label}
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  );
                }}
              </AsyncStateRenderer>
            )}
          </>
        )}
      </AsyncStateRenderer>

      <Card padding="lg">
        <SectionHeader
          title="Upcoming Alerts"
          description="Reminders are generated based on your scheduling preferences."
          action={(
            <Badge size="sm" variant="flat">
              {upcomingAlerts.length} alerts
            </Badge>
          )}
        />
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {upcomingAlerts.length === 0 ? (
            <div className="text-sm text-[var(--app-text-muted)]">
              No upcoming alerts configured yet.
            </div>
          ) : (
            upcomingAlerts.map(({ event, daysAway, daysBefore, reminderDate }) => (
              <ListItemCard
                key={`${event.id}-${daysBefore}`}
                title={event.title}
                description={`${event.fundName} - Reminder ${daysBefore}d before - ${formatDate(reminderDate)}`}
                meta={(
                  <span className="flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    Distribution date {formatDate(event.date)}
                  </span>
                )}
                badges={(
                  <Badge size="sm" variant="flat">
                    {daysAway <= 0 ? "Today" : `${daysAway}d`}
                  </Badge>
                )}
                padding="sm"
                className="h-full"
              />
            ))
          )}
        </div>
      </Card>
    </PageScaffold>
  );
}
