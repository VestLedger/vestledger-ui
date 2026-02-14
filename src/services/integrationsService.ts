import type {
  CalendarAccount,
  CalendarEvent,
  CalendarProvider,
  CaptureRule,
  CaptureStatus,
  EventAttendee,
  EventType,
} from '@/components/integrations/calendar-integration';
import { isMockMode } from '@/config/data-mode';
import {
  mockCalendarAccounts,
  mockCalendarEvents,
  mockIntegrations,
} from '@/data/mocks/integrations';
import { requestJson } from '@/services/shared/httpClient';
import type { IntegrationCategory, IntegrationIcon, IntegrationStatus, IntegrationSummary } from '@/types/integrations';

export type { IntegrationSummary };

export type IntegrationsSnapshot = {
  accounts: CalendarAccount[];
  events: CalendarEvent[];
  integrations: IntegrationSummary[];
};

type ApiIntegrationSummary = {
  id: string;
  name?: string;
  description?: string;
  icon?: string;
  status?: string;
  category?: string;
};

type ApiCalendarAccount = {
  id: string;
  email?: string;
  provider?: string;
  status?: string;
  lastSync?: string | Date;
  autoCapture?: boolean;
  captureRules?: unknown;
  syncedCalendars?: string[];
  errorMessage?: string;
};

type ApiCalendarEvent = {
  id: string;
  calendarAccountId?: string;
  provider?: string;
  title?: string;
  description?: string;
  startTime?: string | Date;
  endTime?: string | Date;
  duration?: number;
  location?: string;
  isVirtual?: boolean;
  meetingUrl?: string;
  organizer?: string;
  attendees?: unknown;
  captureStatus?: string;
  capturedDate?: string | Date;
  captureRuleId?: string;
  captureRuleName?: string;
  linkedContactIds?: string[];
  linkedContactNames?: string[];
  linkedDealIds?: string[];
  linkedDealNames?: string[];
  linkedFundIds?: string[];
  linkedFundNames?: string[];
  eventType?: string;
  category?: string;
  tags?: string[];
  interactionId?: string;
  outcome?: string;
  notes?: string;
  isRecurring?: boolean;
  recurrencePattern?: string;
  isCancelled?: boolean;
  responseStatus?: string;
};

type ApiIntegrationsSnapshot = {
  accounts?: ApiCalendarAccount[];
  events?: ApiCalendarEvent[];
  integrations?: ApiIntegrationSummary[];
};

let integrationsSnapshotCache: IntegrationsSnapshot | null = null;

const clone = <T>(value: T): T => structuredClone(value);

function parseDate(value?: string | Date | null, fallback?: Date): Date {
  if (value instanceof Date) return value;
  if (typeof value === 'string') {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return fallback ?? new Date();
}

function normalizeProvider(value?: string): CalendarProvider {
  if (value === 'google' || value === 'outlook' || value === 'apple' || value === 'other') {
    return value;
  }
  return 'other';
}

function normalizeCaptureStatus(value?: string): CaptureStatus {
  if (value === 'pending' || value === 'captured' || value === 'ignored' || value === 'failed') {
    return value;
  }
  return 'pending';
}

function normalizeEventType(value?: string): EventType {
  if (value === 'meeting' || value === 'call' || value === 'conference' || value === 'site-visit' || value === 'other') {
    return value;
  }
  return 'meeting';
}

function normalizeIntegrationIcon(value?: string): IntegrationIcon {
  if (value === 'calendar' || value === 'email' || value === 'slack' || value === 'github') {
    return value;
  }
  return 'calendar';
}

function normalizeIntegrationStatus(value?: string): IntegrationStatus {
  if (value === 'connected' || value === 'available' || value === 'coming-soon') {
    return value;
  }
  if (value === 'disconnected') return 'available';
  return 'available';
}

function normalizeIntegrationCategory(value?: string): IntegrationCategory {
  if (value === 'productivity' || value === 'communication' || value === 'development' || value === 'finance') {
    return value;
  }
  return 'productivity';
}

function normalizeAttendees(value: unknown): EventAttendee[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter((entry): entry is Record<string, unknown> => Boolean(entry) && typeof entry === 'object')
    .map((entry) => ({
      email: typeof entry.email === 'string' ? entry.email : 'unknown@example.com',
      name: typeof entry.name === 'string' ? entry.name : undefined,
      responseStatus:
        entry.responseStatus === 'accepted'
        || entry.responseStatus === 'tentative'
        || entry.responseStatus === 'declined'
        || entry.responseStatus === 'needs-action'
          ? entry.responseStatus
          : 'needs-action',
      isOrganizer: Boolean(entry.isOrganizer),
      isOptional: Boolean(entry.isOptional),
    }));
}

function normalizeCaptureRules(value: unknown): CaptureRule[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter((entry): entry is Record<string, unknown> => Boolean(entry) && typeof entry === 'object')
    .map((entry, index) => ({
      id: typeof entry.id === 'string' ? entry.id : `rule-${index + 1}`,
      name: typeof entry.name === 'string' ? entry.name : `Rule ${index + 1}`,
      isActive: Boolean(entry.isActive),
      priority: typeof entry.priority === 'number' ? entry.priority : index + 1,
      attendeeDomains: Array.isArray(entry.attendeeDomains)
        ? entry.attendeeDomains.filter((item): item is string => typeof item === 'string')
        : undefined,
      attendeeEmails: Array.isArray(entry.attendeeEmails)
        ? entry.attendeeEmails.filter((item): item is string => typeof item === 'string')
        : undefined,
      keywordsInTitle: Array.isArray(entry.keywordsInTitle)
        ? entry.keywordsInTitle.filter((item): item is string => typeof item === 'string')
        : undefined,
      keywordsInDescription: Array.isArray(entry.keywordsInDescription)
        ? entry.keywordsInDescription.filter((item): item is string => typeof item === 'string')
        : undefined,
      eventTypes: Array.isArray(entry.eventTypes)
        ? entry.eventTypes.filter(
            (item): item is EventType =>
              item === 'meeting'
              || item === 'call'
              || item === 'conference'
              || item === 'site-visit'
              || item === 'other'
          )
        : undefined,
      minDuration: typeof entry.minDuration === 'number' ? entry.minDuration : undefined,
      maxDuration: typeof entry.maxDuration === 'number' ? entry.maxDuration : undefined,
      autoCreateInteraction: Boolean(entry.autoCreateInteraction),
      autoCategorize: Boolean(entry.autoCategorize),
      categoryMapping:
        entry.categoryMapping && typeof entry.categoryMapping === 'object'
          ? (entry.categoryMapping as CaptureRule['categoryMapping'])
          : undefined,
      autoLinkToContact: Boolean(entry.autoLinkToContact),
      autoLinkToDeal: Boolean(entry.autoLinkToDeal),
      notifyOnCapture: Boolean(entry.notifyOnCapture),
      notifyUsers: Array.isArray(entry.notifyUsers)
        ? entry.notifyUsers.filter((item): item is string => typeof item === 'string')
        : undefined,
    }));
}

function mapApiIntegration(item: ApiIntegrationSummary): IntegrationSummary {
  return {
    id: item.id,
    name: item.name ?? 'Integration',
    description: item.description ?? 'External integration',
    icon: normalizeIntegrationIcon(item.icon),
    status: normalizeIntegrationStatus(item.status),
    category: normalizeIntegrationCategory(item.category),
  };
}

function mapApiAccount(item: ApiCalendarAccount): CalendarAccount {
  return {
    id: item.id,
    email: item.email ?? 'unknown@example.com',
    provider: normalizeProvider(item.provider),
    status:
      item.status === 'connected'
      || item.status === 'disconnected'
      || item.status === 'syncing'
      || item.status === 'error'
        ? item.status
        : 'disconnected',
    lastSync:
      typeof item.lastSync === 'string' || item.lastSync instanceof Date
        ? parseDate(item.lastSync)
        : undefined,
    autoCapture: Boolean(item.autoCapture),
    captureRules: normalizeCaptureRules(item.captureRules),
    syncedCalendars: Array.isArray(item.syncedCalendars) ? item.syncedCalendars : [],
    errorMessage: item.errorMessage,
  };
}

function mapApiEvent(item: ApiCalendarEvent): CalendarEvent {
  const startTime = parseDate(item.startTime);
  const endTime = parseDate(item.endTime, new Date(startTime.getTime() + 30 * 60 * 1000));

  const outcome =
    item.outcome === 'positive' || item.outcome === 'neutral' || item.outcome === 'negative'
      ? item.outcome
      : undefined;

  const responseStatus =
    item.responseStatus === 'accepted'
    || item.responseStatus === 'tentative'
    || item.responseStatus === 'declined'
    || item.responseStatus === 'needs-action'
      ? item.responseStatus
      : undefined;

  return {
    id: item.id,
    calendarAccountId: item.calendarAccountId ?? '',
    provider: normalizeProvider(item.provider),
    title: item.title ?? 'Calendar event',
    description: item.description,
    startTime,
    endTime,
    duration: typeof item.duration === 'number' ? item.duration : Math.max(15, Math.round((endTime.getTime() - startTime.getTime()) / (60 * 1000))),
    location: item.location,
    isVirtual: Boolean(item.isVirtual),
    meetingUrl: item.meetingUrl,
    organizer: item.organizer ?? 'unknown@example.com',
    attendees: normalizeAttendees(item.attendees),
    captureStatus: normalizeCaptureStatus(item.captureStatus),
    capturedDate:
      typeof item.capturedDate === 'string' || item.capturedDate instanceof Date
        ? parseDate(item.capturedDate)
        : undefined,
    captureRuleId: item.captureRuleId,
    captureRuleName: item.captureRuleName,
    linkedContactIds: Array.isArray(item.linkedContactIds) ? item.linkedContactIds : [],
    linkedContactNames: Array.isArray(item.linkedContactNames) ? item.linkedContactNames : [],
    linkedDealIds: Array.isArray(item.linkedDealIds) ? item.linkedDealIds : [],
    linkedDealNames: Array.isArray(item.linkedDealNames) ? item.linkedDealNames : [],
    linkedFundIds: Array.isArray(item.linkedFundIds) ? item.linkedFundIds : [],
    linkedFundNames: Array.isArray(item.linkedFundNames) ? item.linkedFundNames : [],
    eventType: normalizeEventType(item.eventType),
    category: item.category,
    tags: Array.isArray(item.tags) ? item.tags : [],
    interactionId: item.interactionId,
    outcome,
    notes: item.notes,
    isRecurring: Boolean(item.isRecurring),
    recurrencePattern: item.recurrencePattern,
    isCancelled: Boolean(item.isCancelled),
    responseStatus,
  };
}

function getMockSnapshot(): IntegrationsSnapshot {
  return {
    accounts: clone(mockCalendarAccounts),
    events: clone(mockCalendarEvents),
    integrations: clone(mockIntegrations),
  };
}

function getCachedOrMockSnapshot(): IntegrationsSnapshot {
  return clone(integrationsSnapshotCache ?? getMockSnapshot());
}

function setSnapshot(snapshot: IntegrationsSnapshot): void {
  integrationsSnapshotCache = snapshot;
}

function updateSnapshot(
  updater: (snapshot: IntegrationsSnapshot) => IntegrationsSnapshot
): void {
  const snapshot = getCachedOrMockSnapshot();
  integrationsSnapshotCache = updater(snapshot);
}

async function updateIntegrationStatusApi(
  integrationId: string,
  status: string
): Promise<void> {
  await requestJson(`/integrations/${integrationId}/status`, {
    method: 'PATCH',
    body: { status },
    fallbackMessage: 'Failed to update integration status',
  });
}

export async function getIntegrationsSnapshot(): Promise<IntegrationsSnapshot> {
  if (isMockMode('integrations')) {
    if (!integrationsSnapshotCache) {
      setSnapshot(getMockSnapshot());
    }
    return getCachedOrMockSnapshot();
  }

  try {
    const response = await requestJson<ApiIntegrationsSnapshot>('/integrations', {
      method: 'GET',
      fallbackMessage: 'Failed to fetch integrations snapshot',
    });

    const accounts = (response.accounts ?? []).map(mapApiAccount);
    const events = (response.events ?? []).map(mapApiEvent);
    const integrations = (response.integrations ?? []).map(mapApiIntegration);

    const snapshot: IntegrationsSnapshot = {
      accounts: accounts.length > 0 ? accounts : clone(mockCalendarAccounts),
      events: events.length > 0 ? events : clone(mockCalendarEvents),
      integrations: integrations.length > 0 ? integrations : clone(mockIntegrations),
    };

    setSnapshot(snapshot);
    return clone(snapshot);
  } catch {
    return getCachedOrMockSnapshot();
  }
}

export async function connectIntegration(integrationId: string): Promise<void> {
  if (!isMockMode('integrations')) {
    await updateIntegrationStatusApi(integrationId, 'connected');
  }

  updateSnapshot((snapshot) => ({
    ...snapshot,
    integrations: snapshot.integrations.map((integration) =>
      integration.id === integrationId
        ? { ...integration, status: 'connected' }
        : integration
    ),
  }));
}

export async function disconnectIntegration(integrationId: string): Promise<void> {
  if (!isMockMode('integrations')) {
    await updateIntegrationStatusApi(integrationId, 'available');
  }

  updateSnapshot((snapshot) => ({
    ...snapshot,
    integrations: snapshot.integrations.map((integration) =>
      integration.id === integrationId
        ? { ...integration, status: 'available' }
        : integration
    ),
  }));
}

export async function connectCalendar(provider: CalendarProvider): Promise<void> {
  const snapshot = getCachedOrMockSnapshot();
  const existingAccount = snapshot.accounts.find((account) => account.provider === provider);

  if (existingAccount) {
    updateSnapshot((current) => ({
      ...current,
      accounts: current.accounts.map((account) =>
        account.id === existingAccount.id
          ? { ...account, status: 'connected', lastSync: new Date() }
          : account
      ),
    }));
  } else {
    updateSnapshot((current) => ({
      ...current,
      accounts: [
        ...current.accounts,
        {
          id: `calendar-${Date.now()}`,
          provider,
          email: `${provider}@example.com`,
          status: 'connected',
          lastSync: new Date(),
          autoCapture: true,
          captureRules: [],
          syncedCalendars: ['Primary'],
        },
      ],
    }));
  }
}

export async function disconnectCalendar(accountId: string): Promise<void> {
  updateSnapshot((snapshot) => ({
    ...snapshot,
    accounts: snapshot.accounts.map((account) =>
      account.id === accountId
        ? { ...account, status: 'disconnected' }
        : account
    ),
  }));
}

export async function syncCalendar(accountId: string): Promise<void> {
  if (!isMockMode('integrations')) {
    try {
      await requestJson<ApiCalendarEvent[]>('/integrations/calendar/events', {
        method: 'GET',
        fallbackMessage: 'Failed to sync calendar',
      });
    } catch {
      // Sync failures do not block UI-first flows.
    }
  }

  updateSnapshot((snapshot) => ({
    ...snapshot,
    accounts: snapshot.accounts.map((account) =>
      account.id === accountId
        ? { ...account, status: 'connected', lastSync: new Date() }
        : account
    ),
  }));
}

export async function configureCalendarRules(_accountId: string): Promise<void> {
  // Reserved for API-backed rules editor; no-op in UI-first mode.
}

export async function toggleCalendarAutoCapture(accountId: string): Promise<void> {
  updateSnapshot((snapshot) => ({
    ...snapshot,
    accounts: snapshot.accounts.map((account) =>
      account.id === accountId
        ? { ...account, autoCapture: !account.autoCapture }
        : account
    ),
  }));
}

export async function captureCalendarEvent(eventId: string): Promise<void> {
  updateSnapshot((snapshot) => ({
    ...snapshot,
    events: snapshot.events.map((event) =>
      event.id === eventId
        ? { ...event, captureStatus: 'captured', capturedDate: new Date() }
        : event
    ),
  }));
}

export async function ignoreCalendarEvent(eventId: string): Promise<void> {
  updateSnapshot((snapshot) => ({
    ...snapshot,
    events: snapshot.events.map((event) =>
      event.id === eventId
        ? { ...event, captureStatus: 'ignored' }
        : event
    ),
  }));
}

export async function editCalendarEvent(eventId: string): Promise<void> {
  updateSnapshot((snapshot) => ({
    ...snapshot,
    events: snapshot.events.map((event) =>
      event.id === eventId
        ? { ...event, notes: event.notes ? `${event.notes} (edited)` : 'Edited from UI' }
        : event
    ),
  }));
}

export async function createCalendarEvent(): Promise<void> {
  const now = new Date();
  const startTime = new Date(now.getTime() + 60 * 60 * 1000);
  const endTime = new Date(startTime.getTime() + 30 * 60 * 1000);
  const snapshot = getCachedOrMockSnapshot();
  const accountId = snapshot.accounts[0]?.id ?? 'calendar-default';
  const provider = snapshot.accounts[0]?.provider ?? 'google';

  updateSnapshot((current) => ({
    ...current,
    events: [
      {
        id: `event-${Date.now()}`,
        calendarAccountId: accountId,
        provider,
        title: 'New Calendar Event',
        startTime,
        endTime,
        duration: 30,
        isVirtual: true,
        organizer: snapshot.accounts[0]?.email ?? 'investor@vestledger.com',
        attendees: [],
        captureStatus: 'pending',
        linkedContactIds: [],
        linkedContactNames: [],
        linkedDealIds: [],
        linkedDealNames: [],
        linkedFundIds: [],
        linkedFundNames: [],
        eventType: 'meeting',
        tags: [],
        isRecurring: false,
        isCancelled: false,
      },
      ...current.events,
    ],
  }));
}

export async function exportCalendarEvents(format: 'csv' | 'ical'): Promise<string> {
  const snapshot = getCachedOrMockSnapshot();
  const events = snapshot.events;

  if (format === 'ical') {
    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      ...events.map((event) => [
        'BEGIN:VEVENT',
        `UID:${event.id}`,
        `SUMMARY:${event.title}`,
        `DTSTART:${event.startTime.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
        `DTEND:${event.endTime.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
        'END:VEVENT',
      ].join('\n')),
      'END:VCALENDAR',
    ];
    return lines.join('\n');
  }

  const header = 'title,start,end,status,provider';
  const rows = events.map((event) =>
    [
      JSON.stringify(event.title),
      event.startTime.toISOString(),
      event.endTime.toISOString(),
      event.captureStatus,
      event.provider,
    ].join(',')
  );
  return [header, ...rows].join('\n');
}

/** @deprecated Use `getIntegrationsSnapshot()` */
export const getCalendarSnapshot = getIntegrationsSnapshot;
