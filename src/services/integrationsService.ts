import { isMockMode } from '@/config/data-mode';
import {
  mockCalendarAccounts,
  mockCalendarEvents,
  mockIntegrations,
} from '@/data/mocks/integrations';
import type {
  CalendarAccount,
  CalendarEvent,
} from '@/components/integrations/calendar-integration';
import type { IntegrationSummary } from '@/types/integrations';

export type { IntegrationSummary };

export type IntegrationsSnapshot = {
  accounts: CalendarAccount[];
  events: CalendarEvent[];
  integrations: IntegrationSummary[];
};

export function getIntegrationsSnapshot(): IntegrationsSnapshot {
  if (isMockMode()) {
    return {
      accounts: mockCalendarAccounts,
      events: mockCalendarEvents,
      integrations: mockIntegrations,
    };
  }

  throw new Error('Integrations API not implemented yet');
}

/** @deprecated Use `getIntegrationsSnapshot()` */
export const getCalendarSnapshot = getIntegrationsSnapshot;
