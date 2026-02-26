import { describe, expect, it } from 'vitest';
import {
  backOfficeReducer,
  complianceRequested,
  complianceLoaded,
  complianceFailed,
  fundAdminRequested,
  fundAdminLoaded,
  fundAdminFailed,
  capitalCallCreateRequested,
  capitalCallCreateSucceeded,
  capitalCallCreateFailed,
  capitalCallUpdateRequested,
  capitalCallUpdateSucceeded,
  capitalCallUpdateFailed,
  capitalCallSendRequested,
  capitalCallReminderRequested,
  lpReminderRequested,
  lpResponseUpdateRequested,
  lpResponseUpdateSucceeded,
  lpResponseUpdateFailed,
  fundAdminExportRequested,
  fundAdminExportSucceeded,
  taxCenterRequested,
  taxCenterLoaded,
  taxCenterFailed,
  valuation409aRequested,
  valuation409aLoaded,
  valuation409aFailed,
  complianceSelectors,
  fundAdminSelectors,
  taxCenterSelectors,
  valuation409aSelectors,
  type ComplianceData,
  type FundAdminData,
  type TaxCenterData,
  type Valuation409aData,
} from '../backOfficeSlice';
import type { RootState } from '@/store/rootReducer';
import type { NormalizedError } from '@/store/types/AsyncState';
import { mockComplianceItems, mockRegulatoryFilings, mockAuditSchedule } from '@/data/mocks/back-office/compliance';
import { mockCapitalCalls, mockDistributions, mockLPResponses } from '@/data/mocks/back-office/fund-admin';
import { mockFilingDeadline, mockPortfolioTax, mockTaxDocuments, mockTaxSummaries } from '@/data/mocks/back-office/tax-center';
import { mockHistory, mockStrikePrices, mockValuations } from '@/data/mocks/back-office/valuation-409a';

const compliancePayload: ComplianceData = {
  complianceItems: mockComplianceItems.slice(0, 2),
  regulatoryFilings: mockRegulatoryFilings.slice(0, 2),
  auditSchedule: mockAuditSchedule.slice(0, 2),
};

const fundAdminPayload: FundAdminData = {
  capitalCalls: mockCapitalCalls.slice(0, 2),
  distributions: mockDistributions.slice(0, 2),
  lpResponses: mockLPResponses.slice(0, 2),
};

const taxCenterPayload: TaxCenterData = {
  filingDeadline: mockFilingDeadline,
  taxDocuments: mockTaxDocuments.slice(0, 2),
  taxSummaries: mockTaxSummaries.slice(0, 2),
  portfolioTax: mockPortfolioTax.slice(0, 2),
};

const valuationPayload: Valuation409aData = {
  valuations: mockValuations.slice(0, 2),
  strikePrices: mockStrikePrices.slice(0, 2),
  history: mockHistory.slice(0, 2),
};

const testError: NormalizedError = {
  message: 'Failed operation',
  code: 'BACK_OFFICE_FAILURE',
};

function asRootState(state: ReturnType<typeof backOfficeReducer>): RootState {
  return { backOffice: state } as unknown as RootState;
}

describe('backOfficeSlice', () => {
  it('returns expected initial state', () => {
    const state = backOfficeReducer(undefined, { type: '@@INIT' });
    expect(state.compliance.status).toBe('idle');
    expect(state.fundAdmin.status).toBe('idle');
    expect(state.taxCenter.status).toBe('idle');
    expect(state.valuation409a.status).toBe('idle');
  });

  it('handles compliance lifecycle and selectors', () => {
    let state = backOfficeReducer(undefined, complianceRequested());
    expect(state.compliance.status).toBe('loading');

    state = backOfficeReducer(state, complianceLoaded(compliancePayload));
    const root = asRootState(state);
    expect(complianceSelectors.selectData(root)).toEqual(compliancePayload);
    expect(complianceSelectors.selectStatus(root)).toBe('succeeded');
    expect(complianceSelectors.selectError(root)).toBeUndefined();
    expect(complianceSelectors.selectIsLoading(root)).toBe(false);
    expect(complianceSelectors.selectIsSucceeded(root)).toBe(true);
    expect(complianceSelectors.selectIsFailed(root)).toBe(false);
    expect(complianceSelectors.selectState(root)).toEqual(state.compliance);

    state = backOfficeReducer(state, complianceFailed(testError));
    expect(complianceSelectors.selectError(asRootState(state))).toEqual(testError);
  });

  it('handles fund admin lifecycle, upserts, and selectors', () => {
    let state = backOfficeReducer(undefined, fundAdminRequested({ fundId: 'fund-1' }));
    expect(state.fundAdmin.status).toBe('loading');

    state = backOfficeReducer(state, fundAdminLoaded(fundAdminPayload));
    expect(fundAdminSelectors.selectData(asRootState(state))?.capitalCalls).toHaveLength(2);

    state = backOfficeReducer(state, capitalCallCreateRequested({
      fundId: 'fund-2',
      fundName: 'Fund II',
      totalAmount: 1_500_000,
      dueDate: '2026-03-10',
      purpose: 'Follow-on',
    }));
    expect(state.fundAdmin.status).toBe('loading');

    state = backOfficeReducer(state, capitalCallCreateSucceeded(mockCapitalCalls[0]));
    state = backOfficeReducer(
      state,
      capitalCallCreateSucceeded({ ...mockCapitalCalls[0], purpose: 'Updated purpose' })
    );
    expect(state.fundAdmin.data?.capitalCalls).toHaveLength(2);
    expect(state.fundAdmin.data?.capitalCalls[0].purpose).toBe('Updated purpose');

    state = backOfficeReducer(state, capitalCallUpdateRequested({
      capitalCallId: mockCapitalCalls[0].id,
      patch: { status: 'completed' },
    }));
    expect(state.fundAdmin.status).toBe('loading');
    state = backOfficeReducer(
      state,
      capitalCallUpdateSucceeded({ ...mockCapitalCalls[0], status: 'completed' })
    );
    expect(state.fundAdmin.data?.capitalCalls[0].status).toBe('completed');

    state = backOfficeReducer(state, capitalCallSendRequested({ capitalCallId: mockCapitalCalls[0].id }));
    state = backOfficeReducer(state, capitalCallReminderRequested({ capitalCallId: mockCapitalCalls[0].id }));
    state = backOfficeReducer(state, lpReminderRequested({ lpResponseId: mockLPResponses[0].id }));
    state = backOfficeReducer(state, lpResponseUpdateRequested({
      lpResponseId: mockLPResponses[0].id,
      amountPaid: 2_000_000,
    }));
    expect(state.fundAdmin.status).toBe('loading');

    state = backOfficeReducer(
      state,
      lpResponseUpdateSucceeded({ ...mockLPResponses[0], amountPaid: 2_000_000 })
    );
    expect(state.fundAdmin.data?.lpResponses[0].amountPaid).toBe(2_000_000);

    state = backOfficeReducer(state, fundAdminExportRequested());
    state = backOfficeReducer(state, fundAdminExportSucceeded({ exportedAt: '2026-02-14T00:00:00.000Z' }));
    expect(state.fundAdminLastExportAt).toBe('2026-02-14T00:00:00.000Z');

    const root = asRootState(state);
    expect(fundAdminSelectors.selectStatus(root)).toBe('succeeded');
    expect(fundAdminSelectors.selectError(root)).toBeUndefined();
    expect(fundAdminSelectors.selectIsLoading(root)).toBe(false);
    expect(fundAdminSelectors.selectIsSucceeded(root)).toBe(true);
    expect(fundAdminSelectors.selectIsFailed(root)).toBe(false);
    expect(fundAdminSelectors.selectState(root)).toEqual(state.fundAdmin);
  });

  it('handles tax center lifecycle and selectors', () => {
    let state = backOfficeReducer(undefined, taxCenterRequested());
    expect(state.taxCenter.status).toBe('loading');

    state = backOfficeReducer(state, taxCenterLoaded(taxCenterPayload));
    const root = asRootState(state);
    expect(taxCenterSelectors.selectData(root)).toEqual(taxCenterPayload);
    expect(taxCenterSelectors.selectStatus(root)).toBe('succeeded');
    expect(taxCenterSelectors.selectError(root)).toBeUndefined();
    expect(taxCenterSelectors.selectIsLoading(root)).toBe(false);
    expect(taxCenterSelectors.selectIsSucceeded(root)).toBe(true);
    expect(taxCenterSelectors.selectIsFailed(root)).toBe(false);
    expect(taxCenterSelectors.selectState(root)).toEqual(state.taxCenter);

    state = backOfficeReducer(state, taxCenterFailed(testError));
    expect(taxCenterSelectors.selectError(asRootState(state))).toEqual(testError);
  });

  it('handles valuation lifecycle and selectors', () => {
    let state = backOfficeReducer(undefined, valuation409aRequested());
    expect(state.valuation409a.status).toBe('loading');

    state = backOfficeReducer(state, valuation409aLoaded(valuationPayload));
    const root = asRootState(state);
    expect(valuation409aSelectors.selectData(root)).toEqual(valuationPayload);
    expect(valuation409aSelectors.selectStatus(root)).toBe('succeeded');
    expect(valuation409aSelectors.selectError(root)).toBeUndefined();
    expect(valuation409aSelectors.selectIsLoading(root)).toBe(false);
    expect(valuation409aSelectors.selectIsSucceeded(root)).toBe(true);
    expect(valuation409aSelectors.selectIsFailed(root)).toBe(false);
    expect(valuation409aSelectors.selectState(root)).toEqual(state.valuation409a);

    state = backOfficeReducer(state, valuation409aFailed(testError));
    expect(valuation409aSelectors.selectError(asRootState(state))).toEqual(testError);
  });

  it('exposes failure actions for fund admin workflows', () => {
    let state = backOfficeReducer(undefined, capitalCallCreateFailed(testError));
    expect(state.fundAdmin.status).toBe('failed');
    state = backOfficeReducer(state, capitalCallUpdateFailed(testError));
    expect(state.fundAdmin.error).toEqual(testError);
    state = backOfficeReducer(state, lpResponseUpdateFailed(testError));
    expect(state.fundAdmin.error).toEqual(testError);
    state = backOfficeReducer(state, fundAdminFailed(testError));
    expect(state.fundAdmin.status).toBe('failed');
  });
});
