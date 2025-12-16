import { isMockMode } from '@/config/data-mode';
import {
  mockCalendarAccounts,
  mockCalendarEvents,
} from '@/data/mocks/integrations';
import type {
  CalendarAccount,
  CalendarEvent,
} from '@/components/integrations/calendar-integration';

export type CalendarSnapshot = {
  accounts: CalendarAccount[];
  events: CalendarEvent[];
};

export function getCalendarSnapshot(): CalendarSnapshot {
  if (isMockMode()) {
    return { accounts: mockCalendarAccounts, events: mockCalendarEvents };
  }

  throw new Error('Integrations API not implemented yet');
}
