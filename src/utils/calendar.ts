import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from "date-fns";

export type CalendarDay = {
  date: Date;
  isCurrentMonth: boolean;
};

type WeekStart = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export function buildMonthDays(monthDate: Date, weekStartsOn: WeekStart = 0): CalendarDay[] {
  const monthStart = startOfMonth(monthDate);
  const monthEnd = endOfMonth(monthDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn });

  return eachDayOfInterval({ start: calendarStart, end: calendarEnd }).map((date) => ({
    date,
    isCurrentMonth: isSameMonth(date, monthDate),
  }));
}
