import type { EmailAccount } from '@/components/crm/email-integration';
import type { TimelineInteraction } from '@/components/crm/interaction-timeline';
import { isMockMode } from '@/config/data-mode';
import {
  mockContacts,
  mockEmailAccounts,
  mockInteractions,
  mockTimelineInteractions,
  type Contact,
  type Interaction,
} from '@/data/mocks/crm/contacts';
import { requestJson } from '@/services/shared/httpClient';
import type { GetCRMDataParams } from '@/store/slices/crmSlice';

type ApiListResponse<T> = {
  data?: T[];
  meta?: unknown;
};

type ApiContact = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role?: string;
  company?: string;
  location?: string;
  tags?: string[];
  lastContact?: string | Date;
  nextFollowUp?: string | Date;
  linkedCompanies?: string[];
  notes?: string;
  linkedin?: string;
  twitter?: string;
  starred?: boolean;
  deals?: string[];
  interactions?: number;
  interactionCount?: number;
  responseRate?: number;
  interactionFrequency?: number;
};

type ApiInteraction = {
  id: string;
  contactId?: string;
  type?: string;
  subject?: string;
  date?: string | Date;
  notes?: string;
  direction?: string;
  description?: string;
  duration?: number;
  participants?: string[];
  attachments?: number;
  outcome?: string;
  tags?: string[];
  linkedDeal?: string;
  isAutoCaptured?: boolean;
};

type ApiIntegrationSummary = {
  id: string;
  name?: string;
  icon?: string;
  status?: string;
};

type ApiCalendarAccount = {
  id: string;
  email?: string;
  provider?: string;
  status?: string;
  lastSync?: string | Date;
  autoCapture?: boolean;
};

type ApiCalendarEvent = {
  id: string;
  calendarAccountId?: string;
};

type ApiIntegrationsSnapshot = {
  accounts?: ApiCalendarAccount[];
  events?: ApiCalendarEvent[];
  integrations?: ApiIntegrationSummary[];
};

type CreateCRMInteractionParams = {
  type: Interaction['type'];
  subject?: string;
  notes?: string;
  description?: string;
  direction?: 'inbound' | 'outbound';
  linkedDeal?: string;
};

type CRMSnapshot = {
  contacts: Contact[];
  emailAccounts: EmailAccount[];
  interactions: Interaction[];
  timelineInteractions: TimelineInteraction[];
};

const DEFAULT_PROVIDER_EMAIL = 'investor@vestledger.com';

let crmSnapshotCache: CRMSnapshot | null = null;

const clone = <T>(value: T): T => structuredClone(value);

function parseDate(value?: string | Date | null, fallback?: Date): Date {
  if (value instanceof Date) return value;
  if (typeof value === 'string') {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return fallback ?? new Date();
}

function toDateString(value?: string | Date | null): string | undefined {
  if (!value) return undefined;
  const parsed = parseDate(value);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed.toISOString().slice(0, 10);
}

function normalizeRole(value?: string): Contact['role'] {
  if (
    value === 'founder'
    || value === 'co-founder'
    || value === 'ceo'
    || value === 'cto'
    || value === 'investor'
    || value === 'advisor'
    || value === 'other'
  ) {
    return value;
  }
  return 'other';
}

function normalizeInteractionType(value?: string): Interaction['type'] {
  if (value === 'email' || value === 'call' || value === 'meeting' || value === 'note') {
    return value;
  }
  return 'note';
}

function normalizeDirection(value?: string): 'inbound' | 'outbound' | undefined {
  if (value === 'inbound' || value === 'outbound') return value;
  return undefined;
}

function normalizeOutcome(value?: string): TimelineInteraction['outcome'] {
  if (value === 'positive' || value === 'neutral' || value === 'negative') {
    return value;
  }
  return undefined;
}

function normalizeEmailProvider(
  value?: string
): EmailAccount['provider'] {
  if (value === 'gmail') return 'gmail';
  if (value === 'outlook') return 'outlook';
  return 'other';
}

function normalizeEmailStatus(
  value?: string
): EmailAccount['status'] {
  if (value === 'connected' || value === 'disconnected' || value === 'syncing' || value === 'error') {
    return value;
  }
  return 'disconnected';
}

function mapApiContact(contact: ApiContact): Contact {
  return {
    id: contact.id,
    name: contact.name,
    email: contact.email,
    phone: contact.phone,
    role: normalizeRole(contact.role),
    company: contact.company,
    location: contact.location,
    tags: Array.isArray(contact.tags) ? contact.tags : [],
    lastContact: toDateString(contact.lastContact),
    nextFollowUp: toDateString(contact.nextFollowUp),
    linkedCompanies: Array.isArray(contact.linkedCompanies) ? contact.linkedCompanies : [],
    notes: contact.notes,
    linkedin: contact.linkedin,
    twitter: contact.twitter,
    starred: Boolean(contact.starred),
    deals: Array.isArray(contact.deals) ? contact.deals : [],
    interactions:
      typeof contact.interactions === 'number'
        ? contact.interactions
        : typeof contact.interactionCount === 'number'
          ? contact.interactionCount
          : 0,
    responseRate: typeof contact.responseRate === 'number' ? contact.responseRate : undefined,
    interactionFrequency:
      typeof contact.interactionFrequency === 'number'
        ? contact.interactionFrequency
        : undefined,
  };
}

function mapApiInteraction(
  interaction: ApiInteraction,
  contactId: string
): Interaction {
  return {
    id: interaction.id,
    contactId: interaction.contactId ?? contactId,
    type: normalizeInteractionType(interaction.type),
    subject: interaction.subject ?? 'Interaction',
    date: toDateString(interaction.date) ?? new Date().toISOString().slice(0, 10),
    notes: interaction.notes,
  };
}

function mapApiTimelineInteraction(
  interaction: ApiInteraction
): TimelineInteraction {
  return {
    id: interaction.id,
    type: normalizeInteractionType(interaction.type),
    direction: normalizeDirection(interaction.direction),
    subject: interaction.subject ?? 'Interaction',
    description: interaction.description ?? interaction.notes,
    date: parseDate(interaction.date),
    duration: interaction.duration,
    participants: Array.isArray(interaction.participants) ? interaction.participants : undefined,
    attachments: interaction.attachments,
    outcome: normalizeOutcome(interaction.outcome),
    tags: Array.isArray(interaction.tags) ? interaction.tags : undefined,
    linkedDeal: interaction.linkedDeal,
    isAutoCaptured: Boolean(interaction.isAutoCaptured),
  };
}

function getBaseMockSnapshot(): CRMSnapshot {
  return {
    contacts: clone(mockContacts),
    emailAccounts: clone(mockEmailAccounts),
    interactions: clone(mockInteractions),
    timelineInteractions: clone(mockTimelineInteractions),
  };
}

function applyContactFilters(contacts: Contact[], params: GetCRMDataParams): Contact[] {
  const roleFilter = params.contactType?.toLowerCase();
  const searchFilter = params.search?.trim().toLowerCase();

  return contacts.filter((contact) => {
    const matchesRole = !roleFilter || roleFilter === 'all' || contact.role === roleFilter;
    const matchesSearch =
      !searchFilter
      || contact.name.toLowerCase().includes(searchFilter)
      || contact.email.toLowerCase().includes(searchFilter)
      || contact.company?.toLowerCase().includes(searchFilter);
    return matchesRole && matchesSearch;
  });
}

function getMockSnapshot(params: GetCRMDataParams): CRMSnapshot {
  const snapshot = getBaseMockSnapshot();
  snapshot.contacts = applyContactFilters(snapshot.contacts, params);

  return snapshot;
}

function getCachedOrMockSnapshot(params: GetCRMDataParams): CRMSnapshot {
  const snapshot = crmSnapshotCache
    ? clone(crmSnapshotCache)
    : getMockSnapshot(params);

  snapshot.contacts = applyContactFilters(snapshot.contacts, params);
  return snapshot;
}

function updateCachedSnapshot(updater: (snapshot: CRMSnapshot) => CRMSnapshot): void {
  const snapshot = getCachedOrMockSnapshot({});
  crmSnapshotCache = updater(snapshot);
}

async function fetchApiContacts(params: GetCRMDataParams): Promise<Contact[]> {
  const response = await requestJson<ApiListResponse<ApiContact>>('/contacts', {
    method: 'GET',
    query: {
      fundId: params.fundId,
      role: params.contactType && params.contactType !== 'all' ? params.contactType : undefined,
      search: params.search,
      limit: params.limit ?? 100,
      offset: params.offset ?? 0,
      sortBy: params.sortBy ?? 'lastContact',
      sortOrder: params.sortOrder ?? 'desc',
    },
    fallbackMessage: 'Failed to fetch CRM contacts',
  });

  return (response.data ?? []).map(mapApiContact);
}

async function fetchApiInteractionsForContacts(
  contacts: Contact[],
  timelineMode: boolean
): Promise<Array<Interaction | TimelineInteraction>> {
  const contactIds = contacts.map((contact) => contact.id).slice(0, 20);
  if (contactIds.length === 0) return [];

  const interactionBatches = await Promise.all(
    contactIds.map(async (contactId) => {
      try {
        const endpoint = timelineMode
          ? `/contacts/${contactId}/timeline`
          : `/contacts/${contactId}/interactions`;
        const response = await requestJson<ApiInteraction[]>(endpoint, {
          method: 'GET',
          fallbackMessage: 'Failed to fetch contact interactions',
        });

        if (!Array.isArray(response)) return [];
        return timelineMode
          ? response.map((item) => mapApiTimelineInteraction(item))
          : response.map((item) => mapApiInteraction(item, contactId));
      } catch {
        return [];
      }
    })
  );

  return interactionBatches.flat();
}

async function fetchApiEmailAccounts(): Promise<EmailAccount[]> {
  const snapshot = await requestJson<ApiIntegrationsSnapshot>('/integrations', {
    method: 'GET',
    fallbackMessage: 'Failed to fetch integrations snapshot',
  });

  const accounts = snapshot.accounts ?? [];
  const events = snapshot.events ?? [];
  const syncedCountByAccount = new Map<string, number>();

  for (const event of events) {
    const accountId = event.calendarAccountId;
    if (!accountId) continue;
    syncedCountByAccount.set(accountId, (syncedCountByAccount.get(accountId) ?? 0) + 1);
  }

  return accounts.map((account) => ({
    id: account.id,
    email: account.email ?? DEFAULT_PROVIDER_EMAIL,
    provider: normalizeEmailProvider(account.provider),
    status: normalizeEmailStatus(account.status),
    lastSync:
      typeof account.lastSync === 'string' || account.lastSync instanceof Date
        ? parseDate(account.lastSync)
        : undefined,
    syncedEmails: syncedCountByAccount.get(account.id) ?? 0,
    autoCapture: Boolean(account.autoCapture),
  }));
}

async function updateEmailIntegrationStatus(status: string): Promise<void> {
  try {
    const snapshot = await requestJson<ApiIntegrationsSnapshot>('/integrations', {
      method: 'GET',
      fallbackMessage: 'Failed to fetch integrations snapshot',
    });

    const emailIntegration = (snapshot.integrations ?? []).find((integration) =>
      integration.icon === 'email'
      || integration.name?.toLowerCase().includes('email')
    );
    if (!emailIntegration) return;

    await requestJson(`/integrations/${emailIntegration.id}/status`, {
      method: 'PATCH',
      body: { status },
      fallbackMessage: 'Failed to update integration status',
    });
  } catch {
    // Ignore status-update failures to preserve UI-first flow in API mode.
  }
}

export async function getCRMContacts(params: GetCRMDataParams): Promise<Contact[]> {
  if (isMockMode('crm')) {
    if (!crmSnapshotCache) {
      crmSnapshotCache = getBaseMockSnapshot();
    }
    return clone(getCachedOrMockSnapshot(params).contacts);
  }

  try {
    const contacts = await fetchApiContacts(params);
    const snapshot = getCachedOrMockSnapshot(params);
    snapshot.contacts = contacts;
    crmSnapshotCache = snapshot;
    return clone(contacts);
  } catch {
    return clone(getCachedOrMockSnapshot(params).contacts);
  }
}

export async function getCRMEmailAccounts(
  params: GetCRMDataParams
): Promise<EmailAccount[]> {
  if (isMockMode('crm')) {
    if (!crmSnapshotCache) {
      crmSnapshotCache = getBaseMockSnapshot();
    }
    return clone(getCachedOrMockSnapshot(params).emailAccounts);
  }

  try {
    const emailAccounts = await fetchApiEmailAccounts();
    const snapshot = getCachedOrMockSnapshot(params);
    snapshot.emailAccounts = emailAccounts.length > 0
      ? emailAccounts
      : clone(mockEmailAccounts);
    crmSnapshotCache = snapshot;
    return clone(snapshot.emailAccounts);
  } catch {
    return clone(getCachedOrMockSnapshot(params).emailAccounts);
  }
}

export async function getCRMInteractions(
  params: GetCRMDataParams
): Promise<Interaction[]> {
  if (isMockMode('crm')) {
    if (!crmSnapshotCache) {
      crmSnapshotCache = getBaseMockSnapshot();
    }
    return clone(getCachedOrMockSnapshot(params).interactions);
  }

  try {
    const contacts = await fetchApiContacts(params);
    const interactions = await fetchApiInteractionsForContacts(contacts, false) as Interaction[];
    const snapshot = getCachedOrMockSnapshot(params);
    snapshot.contacts = contacts;
    snapshot.interactions = interactions;
    crmSnapshotCache = snapshot;
    return clone(interactions);
  } catch {
    return clone(getCachedOrMockSnapshot(params).interactions);
  }
}

export async function getCRMTimelineInteractions(
  params: GetCRMDataParams
): Promise<TimelineInteraction[]> {
  if (isMockMode('crm')) {
    if (!crmSnapshotCache) {
      crmSnapshotCache = getBaseMockSnapshot();
    }
    return clone(getCachedOrMockSnapshot(params).timelineInteractions);
  }

  try {
    const contacts = await fetchApiContacts(params);
    const timelineInteractions = await fetchApiInteractionsForContacts(contacts, true) as TimelineInteraction[];
    const snapshot = getCachedOrMockSnapshot(params);
    snapshot.contacts = contacts;
    snapshot.timelineInteractions = timelineInteractions;
    crmSnapshotCache = snapshot;
    return clone(timelineInteractions);
  } catch {
    return clone(getCachedOrMockSnapshot(params).timelineInteractions);
  }
}

export async function toggleCRMContactStar(contactId: string): Promise<void> {
  if (isMockMode('crm')) {
    updateCachedSnapshot((snapshot) => ({
      ...snapshot,
      contacts: snapshot.contacts.map((contact) =>
        contact.id === contactId ? { ...contact, starred: !contact.starred } : contact
      ),
    }));
    return;
  }

  await requestJson(`/contacts/${contactId}/star`, {
    method: 'POST',
    fallbackMessage: 'Failed to toggle contact star',
  });

  updateCachedSnapshot((snapshot) => ({
    ...snapshot,
    contacts: snapshot.contacts.map((contact) =>
      contact.id === contactId ? { ...contact, starred: !contact.starred } : contact
    ),
  }));
}

export async function createCRMContact(): Promise<void> {
  const now = new Date();
  const generatedName = `New Contact ${now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })}`;
  const generatedEmail = `contact-${now.getTime()}@example.com`;

  if (isMockMode('crm')) {
    updateCachedSnapshot((snapshot) => ({
      ...snapshot,
      contacts: [
        {
          id: `mock-contact-${Date.now()}`,
          name: generatedName,
          email: generatedEmail,
          role: 'other',
          tags: ['new'],
          linkedCompanies: [],
          starred: false,
          deals: [],
          interactions: 0,
          lastContact: undefined,
        },
        ...snapshot.contacts,
      ],
    }));
    return;
  }

  await requestJson('/contacts', {
    method: 'POST',
    body: {
      name: generatedName,
      email: generatedEmail,
      role: 'other',
      tags: ['new'],
      linkedCompanies: [],
      deals: [],
    },
    fallbackMessage: 'Failed to create contact',
  });
}

export async function createCRMInteraction(
  contactId: string,
  params: CreateCRMInteractionParams
): Promise<void> {
  const now = new Date();
  const defaultSubject = `${params.type.charAt(0).toUpperCase()}${params.type.slice(1)} logged`;

  if (isMockMode('crm')) {
    const interactionId = `mock-interaction-${Date.now()}`;
    updateCachedSnapshot((snapshot) => ({
      ...snapshot,
      interactions: [
        {
          id: interactionId,
          contactId,
          type: params.type,
          subject: params.subject ?? defaultSubject,
          date: now.toISOString().slice(0, 10),
          notes: params.notes ?? params.description,
        },
        ...snapshot.interactions,
      ],
      timelineInteractions: [
        {
          id: interactionId,
          type: params.type,
          direction: params.direction,
          subject: params.subject ?? defaultSubject,
          description: params.description ?? params.notes,
          date: now,
          linkedDeal: params.linkedDeal,
        },
        ...snapshot.timelineInteractions,
      ],
      contacts: snapshot.contacts.map((contact) =>
        contact.id === contactId
          ? {
              ...contact,
              interactions: contact.interactions + 1,
              lastContact: now.toISOString().slice(0, 10),
            }
          : contact
      ),
    }));
    return;
  }

  await requestJson(`/contacts/${contactId}/interactions`, {
    method: 'POST',
    body: {
      type: params.type,
      subject: params.subject ?? defaultSubject,
      date: now.toISOString(),
      notes: params.notes,
      description: params.description,
      direction: params.direction,
      linkedDeal: params.linkedDeal,
    },
    fallbackMessage: 'Failed to create interaction',
  });
}

export async function updateCRMInteraction(interactionId: string): Promise<void> {
  updateCachedSnapshot((snapshot) => ({
    ...snapshot,
    timelineInteractions: snapshot.timelineInteractions.map((interaction) =>
      interaction.id === interactionId
        ? { ...interaction, description: `${interaction.description ?? ''} (updated)` }
        : interaction
    ),
  }));
}

export async function deleteCRMInteraction(interactionId: string): Promise<void> {
  updateCachedSnapshot((snapshot) => ({
    ...snapshot,
    interactions: snapshot.interactions.filter((interaction) => interaction.id !== interactionId),
    timelineInteractions: snapshot.timelineInteractions.filter(
      (interaction) => interaction.id !== interactionId
    ),
  }));
}

export async function linkCRMInteractionToDeal(
  interactionId: string,
  linkedDeal: string
): Promise<void> {
  updateCachedSnapshot((snapshot) => ({
    ...snapshot,
    timelineInteractions: snapshot.timelineInteractions.map((interaction) =>
      interaction.id === interactionId ? { ...interaction, linkedDeal } : interaction
    ),
  }));
}

export async function connectCRMEmailAccount(
  provider: 'gmail' | 'outlook'
): Promise<void> {
  if (isMockMode('crm')) {
    updateCachedSnapshot((snapshot) => ({
      ...snapshot,
      emailAccounts: [
        ...snapshot.emailAccounts,
        {
          id: `mock-email-${Date.now()}`,
          email: provider === 'gmail' ? DEFAULT_PROVIDER_EMAIL : `outlook-${Date.now()}@example.com`,
          provider,
          status: 'connected',
          lastSync: new Date(),
          syncedEmails: 0,
          autoCapture: true,
        },
      ],
    }));
    return;
  }

  await updateEmailIntegrationStatus('connected');

  updateCachedSnapshot((snapshot) => ({
    ...snapshot,
    emailAccounts: snapshot.emailAccounts.length > 0
      ? snapshot.emailAccounts
      : [
          {
            id: `email-${Date.now()}`,
            email: DEFAULT_PROVIDER_EMAIL,
            provider,
            status: 'connected',
            lastSync: new Date(),
            syncedEmails: 0,
            autoCapture: true,
          },
        ],
  }));
}

export async function disconnectCRMEmailAccount(accountId: string): Promise<void> {
  if (!isMockMode('crm')) {
    await updateEmailIntegrationStatus('available');
  }

  updateCachedSnapshot((snapshot) => ({
    ...snapshot,
    emailAccounts: snapshot.emailAccounts.map((account) =>
      account.id === accountId ? { ...account, status: 'disconnected' } : account
    ),
  }));
}

export async function syncCRMEmailAccount(accountId: string): Promise<void> {
  if (!isMockMode('crm')) {
    try {
      await requestJson('/integrations/calendar/events', {
        method: 'GET',
        fallbackMessage: 'Failed to sync email account',
      });
    } catch {
      // No-op: sync UX remains available even if API endpoint is unavailable.
    }
  }

  updateCachedSnapshot((snapshot) => ({
    ...snapshot,
    emailAccounts: snapshot.emailAccounts.map((account) =>
      account.id === accountId
        ? { ...account, status: 'connected', lastSync: new Date() }
        : account
    ),
  }));
}

export async function toggleCRMEmailAutoCapture(
  accountId: string,
  enabled: boolean
): Promise<void> {
  updateCachedSnapshot((snapshot) => ({
    ...snapshot,
    emailAccounts: snapshot.emailAccounts.map((account) =>
      account.id === accountId ? { ...account, autoCapture: enabled } : account
    ),
  }));
}

export type { Contact, Interaction };
