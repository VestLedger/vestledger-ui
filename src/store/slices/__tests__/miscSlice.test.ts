import { describe, expect, it } from 'vitest';
import {
  miscReducer,
  integrationsRequested,
  integrationsLoaded,
  integrationsFailed,
  lpPortalRequested,
  lpPortalLoaded,
  lpPortalFailed,
  lpManagementRequested,
  lpManagementLoaded,
  lpManagementFailed,
  auditTrailRequested,
  auditTrailLoaded,
  auditTrailFailed,
  companySearchRequested,
  companySearchLoaded,
  companySearchFailed,
  collaborationRequested,
  collaborationLoaded,
  collaborationFailed,
  integrationsSelectors,
  lpPortalSelectors,
  lpManagementSelectors,
  auditTrailSelectors,
  companySearchSelectors,
  collaborationSelectors,
} from '../miscSlice';
import type { RootState } from '@/store/rootReducer';
import type { NormalizedError } from '@/store/types/AsyncState';
import { mockCalendarAccounts, mockCalendarEvents, mockIntegrations } from '@/data/mocks/integrations';
import {
  mockInvestorData,
  mockReports,
  mockTransactions,
  mockDistributionStatements,
  mockUpcomingDistributions,
  mockDistributionConfirmations,
  mockDistributionElections,
  mockBankDetails,
  mockNotificationPreferences,
  mockEmailPreview,
  mockFAQItems,
} from '@/data/mocks/lp-portal/lp-investor-portal';
import {
  mockCapitalCalls as mockLPManagementCapitalCalls,
  mockDistributions as mockLPManagementDistributions,
  mockLPs as mockManagementLPs,
  mockReports as mockLPManagementReports,
} from '@/data/mocks/lp-portal/lp-management';
import { mockAuditEvents } from '@/data/mocks/blockchain/audit-trail';
import { industries, mockCompanies, stages } from '@/data/mocks/deal-intelligence/company-search';
import { mockCollaborationSnapshot } from '@/data/mocks/collaboration';

const integrationsPayload = {
  accounts: mockCalendarAccounts,
  events: mockCalendarEvents,
  integrations: mockIntegrations,
};

const lpPortalPayload = {
  investor: mockInvestorData,
  reports: mockReports.slice(0, 2),
  transactions: mockTransactions.slice(0, 2),
  distributionStatements: mockDistributionStatements.slice(0, 2),
  upcomingDistributions: mockUpcomingDistributions.slice(0, 2),
  distributionConfirmations: mockDistributionConfirmations.slice(0, 2),
  distributionElections: mockDistributionElections.slice(0, 2),
  bankDetails: mockBankDetails,
  notificationPreferences: mockNotificationPreferences,
  emailPreview: mockEmailPreview,
  faqItems: mockFAQItems.slice(0, 2),
};

const lpManagementPayload = {
  lps: mockManagementLPs.slice(0, 2),
  reports: mockLPManagementReports.slice(0, 2),
  capitalCalls: mockLPManagementCapitalCalls.slice(0, 2),
  distributions: mockLPManagementDistributions.slice(0, 2),
};

const auditTrailPayload = {
  events: mockAuditEvents.slice(0, 3),
};

const companySearchPayload = {
  companies: mockCompanies.slice(0, 3),
  industries,
  stages,
};

const collaborationPayload = {
  threads: mockCollaborationSnapshot.threads.slice(0, 2),
  messages: mockCollaborationSnapshot.messages.slice(0, 2),
  tasks: mockCollaborationSnapshot.tasks.slice(0, 2),
};

const testError: NormalizedError = {
  message: 'Request failed',
  code: 'MISC_FAILED',
};

function asRootState(state: ReturnType<typeof miscReducer>): RootState {
  return { misc: state } as unknown as RootState;
}

describe('miscSlice', () => {
  it('returns expected initial state', () => {
    const state = miscReducer(undefined, { type: '@@INIT' });
    expect(state.integrations.status).toBe('idle');
    expect(state.lpPortal.status).toBe('idle');
    expect(state.lpManagement.status).toBe('idle');
    expect(state.auditTrail.status).toBe('idle');
    expect(state.companySearch.status).toBe('idle');
    expect(state.collaboration.status).toBe('idle');
  });

  it('handles integrations lifecycle and selectors', () => {
    let state = miscReducer(undefined, integrationsRequested());
    expect(state.integrations.status).toBe('loading');

    state = miscReducer(state, integrationsLoaded(integrationsPayload));
    const root = asRootState(state);
    expect(integrationsSelectors.selectData(root)).toEqual(integrationsPayload);
    expect(integrationsSelectors.selectStatus(root)).toBe('succeeded');
    expect(integrationsSelectors.selectError(root)).toBeUndefined();
    expect(integrationsSelectors.selectIsLoading(root)).toBe(false);
    expect(integrationsSelectors.selectIsSucceeded(root)).toBe(true);
    expect(integrationsSelectors.selectIsFailed(root)).toBe(false);
    expect(integrationsSelectors.selectState(root)).toEqual(state.integrations);

    state = miscReducer(state, integrationsFailed(testError));
    expect(integrationsSelectors.selectError(asRootState(state))).toEqual(testError);
  });

  it('handles LP portal lifecycle and selectors', () => {
    let state = miscReducer(undefined, lpPortalRequested());
    expect(state.lpPortal.status).toBe('loading');

    state = miscReducer(state, lpPortalLoaded(lpPortalPayload));
    const root = asRootState(state);
    expect(lpPortalSelectors.selectData(root)).toEqual(lpPortalPayload);
    expect(lpPortalSelectors.selectStatus(root)).toBe('succeeded');
    expect(lpPortalSelectors.selectError(root)).toBeUndefined();
    expect(lpPortalSelectors.selectIsLoading(root)).toBe(false);
    expect(lpPortalSelectors.selectIsSucceeded(root)).toBe(true);
    expect(lpPortalSelectors.selectIsFailed(root)).toBe(false);
    expect(lpPortalSelectors.selectState(root)).toEqual(state.lpPortal);

    state = miscReducer(state, lpPortalFailed(testError));
    expect(lpPortalSelectors.selectError(asRootState(state))).toEqual(testError);
  });

  it('handles LP management lifecycle and selectors', () => {
    let state = miscReducer(undefined, lpManagementRequested());
    expect(state.lpManagement.status).toBe('loading');

    state = miscReducer(state, lpManagementLoaded(lpManagementPayload));
    const root = asRootState(state);
    expect(lpManagementSelectors.selectData(root)).toEqual(lpManagementPayload);
    expect(lpManagementSelectors.selectStatus(root)).toBe('succeeded');
    expect(lpManagementSelectors.selectError(root)).toBeUndefined();
    expect(lpManagementSelectors.selectIsLoading(root)).toBe(false);
    expect(lpManagementSelectors.selectIsSucceeded(root)).toBe(true);
    expect(lpManagementSelectors.selectIsFailed(root)).toBe(false);
    expect(lpManagementSelectors.selectState(root)).toEqual(state.lpManagement);

    state = miscReducer(state, lpManagementFailed(testError));
    expect(lpManagementSelectors.selectError(asRootState(state))).toEqual(testError);
  });

  it('handles audit trail lifecycle and selectors', () => {
    let state = miscReducer(undefined, auditTrailRequested());
    expect(state.auditTrail.status).toBe('loading');

    state = miscReducer(state, auditTrailLoaded(auditTrailPayload));
    const root = asRootState(state);
    expect(auditTrailSelectors.selectData(root)).toEqual(auditTrailPayload);
    expect(auditTrailSelectors.selectStatus(root)).toBe('succeeded');
    expect(auditTrailSelectors.selectError(root)).toBeUndefined();
    expect(auditTrailSelectors.selectIsLoading(root)).toBe(false);
    expect(auditTrailSelectors.selectIsSucceeded(root)).toBe(true);
    expect(auditTrailSelectors.selectIsFailed(root)).toBe(false);
    expect(auditTrailSelectors.selectState(root)).toEqual(state.auditTrail);

    state = miscReducer(state, auditTrailFailed(testError));
    expect(auditTrailSelectors.selectError(asRootState(state))).toEqual(testError);
  });

  it('handles company search lifecycle and selectors', () => {
    let state = miscReducer(undefined, companySearchRequested());
    expect(state.companySearch.status).toBe('loading');

    state = miscReducer(state, companySearchLoaded(companySearchPayload));
    const root = asRootState(state);
    expect(companySearchSelectors.selectData(root)).toEqual(companySearchPayload);
    expect(companySearchSelectors.selectStatus(root)).toBe('succeeded');
    expect(companySearchSelectors.selectError(root)).toBeUndefined();
    expect(companySearchSelectors.selectIsLoading(root)).toBe(false);
    expect(companySearchSelectors.selectIsSucceeded(root)).toBe(true);
    expect(companySearchSelectors.selectIsFailed(root)).toBe(false);
    expect(companySearchSelectors.selectState(root)).toEqual(state.companySearch);

    state = miscReducer(state, companySearchFailed(testError));
    expect(companySearchSelectors.selectError(asRootState(state))).toEqual(testError);
  });

  it('handles collaboration lifecycle and selectors', () => {
    let state = miscReducer(undefined, collaborationRequested());
    expect(state.collaboration.status).toBe('loading');

    state = miscReducer(state, collaborationLoaded(collaborationPayload));
    const root = asRootState(state);
    expect(collaborationSelectors.selectData(root)).toEqual(collaborationPayload);
    expect(collaborationSelectors.selectStatus(root)).toBe('succeeded');
    expect(collaborationSelectors.selectError(root)).toBeUndefined();
    expect(collaborationSelectors.selectIsLoading(root)).toBe(false);
    expect(collaborationSelectors.selectIsSucceeded(root)).toBe(true);
    expect(collaborationSelectors.selectIsFailed(root)).toBe(false);
    expect(collaborationSelectors.selectState(root)).toEqual(state.collaboration);

    state = miscReducer(state, collaborationFailed(testError));
    expect(collaborationSelectors.selectError(asRootState(state))).toEqual(testError);
  });
});
