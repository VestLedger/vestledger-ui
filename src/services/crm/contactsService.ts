import { isMockMode } from '@/config/data-mode';
import {
  mockContacts,
  mockEmailAccounts,
  mockInteractions,
  mockTimelineInteractions,
} from '@/data/mocks/crm/contacts';

export type { Contact, Interaction } from '@/data/mocks/crm/contacts';

export function getCRMContacts() {
  if (isMockMode()) return mockContacts;
  throw new Error('CRM contacts API not implemented yet');
}

export function getCRMEmailAccounts() {
  if (isMockMode()) return mockEmailAccounts;
  throw new Error('CRM email accounts API not implemented yet');
}

export function getCRMInteractions() {
  if (isMockMode()) return mockInteractions;
  throw new Error('CRM interactions API not implemented yet');
}

export function getCRMTimelineInteractions() {
  if (isMockMode()) return mockTimelineInteractions;
  throw new Error('CRM timeline API not implemented yet');
}
