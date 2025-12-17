import { isMockMode } from '@/config/data-mode';
import {
  mockContacts,
  mockEmailAccounts,
  mockInteractions,
  mockTimelineInteractions,
} from '@/data/mocks/crm/contacts';
import type { GetCRMDataParams } from '@/store/slices/crmSlice';

export type { Contact, Interaction } from '@/data/mocks/crm/contacts';

/**
 * Get CRM contacts with optional filters
 * GraphQL-ready: Accepts params even in mock mode for seamless API migration
 */
export function getCRMContacts(params: GetCRMDataParams) {
  if (isMockMode()) {
    // Mock mode: Accept params but return static data
    // Future: Filter by contactType, apply pagination
    return mockContacts;
  }

  // API mode: Still throws (GraphQL not implemented)
  // Future: Replace with graphqlClient.query({ query: GET_CRM_CONTACTS, variables: params })
  throw new Error('CRM contacts API not implemented yet');
}

export function getCRMEmailAccounts(params: GetCRMDataParams) {
  if (isMockMode()) {
    return mockEmailAccounts;
  }
  throw new Error('CRM email accounts API not implemented yet');
}

export function getCRMInteractions(params: GetCRMDataParams) {
  if (isMockMode()) {
    return mockInteractions;
  }
  throw new Error('CRM interactions API not implemented yet');
}

export function getCRMTimelineInteractions(params: GetCRMDataParams) {
  if (isMockMode()) {
    return mockTimelineInteractions;
  }
  throw new Error('CRM timeline API not implemented yet');
}
