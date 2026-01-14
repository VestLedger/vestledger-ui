/**
 * Distribution Saga
 *
 * Side effects for distribution workflow management
 */

import { call, put, takeLatest } from 'redux-saga/effects';
import type { SagaIterator } from 'redux-saga';
import type { PayloadAction } from '@reduxjs/toolkit';
import type {
  Distribution,
  DistributionFilters,
  DistributionSummary,
  DistributionCalendarEvent,
  FeeTemplate,
  StatementTemplateConfig,
  LPProfile,
  ApprovalRule,
} from '@/types/distribution';
import {
  distributionsRequested,
  distributionsLoaded,
  distributionsFailed,
  distributionRequested,
  distributionUpdated,
  createDistributionRequested,
  createDistributionSucceeded,
  createDistributionFailed,
  updateDistributionRequested,
  updateDistributionSucceeded,
  updateDistributionFailed,
  deleteDistributionRequested,
  deleteDistributionSucceeded,
  deleteDistributionFailed,
  submitForApprovalRequested,
  submitForApprovalSucceeded,
  submitForApprovalFailed,
  approveDistributionRequested,
  approveDistributionSucceeded,
  approveDistributionFailed,
  rejectDistributionRequested,
  rejectDistributionSucceeded,
  rejectDistributionFailed,
  returnForRevisionRequested,
  returnForRevisionSucceeded,
  returnForRevisionFailed,
  summaryRequested,
  summaryLoaded,
  summaryFailed,
  calendarEventsRequested,
  calendarEventsLoaded,
  calendarEventsFailed,
  feeTemplatesRequested,
  feeTemplatesLoaded,
  feeTemplatesFailed,
  statementTemplatesRequested,
  statementTemplatesLoaded,
  statementTemplatesFailed,
  lpProfilesRequested,
  lpProfilesLoaded,
  lpProfilesFailed,
  approvalRulesRequested,
  approvalRulesLoaded,
  approvalRulesFailed,
} from '@/store/slices/distributionSlice';
import {
  fetchDistributions,
  fetchDistribution,
  createDistribution,
  updateDistribution,
  deleteDistribution,
  submitForApproval,
  approveDistribution,
  rejectDistribution,
  returnForRevision,
  fetchDistributionSummary,
  fetchDistributionCalendarEvents,
  fetchFeeTemplates,
  fetchStatementTemplates,
  fetchLPProfiles,
  fetchApprovalRules,
} from '@/services/backOffice/distributionService';
import { normalizeError } from '@/store/utils/normalizeError';

// ============================================================================
// Distribution Workers
// ============================================================================

function* loadDistributionsWorker(
  action: PayloadAction<DistributionFilters | undefined>
): SagaIterator {
  try {
    const filters = action.payload;
    const distributions: Distribution[] = yield call(fetchDistributions, filters);
    yield put(distributionsLoaded({ distributions }));
  } catch (error: unknown) {
    console.error('Failed to load distributions', error);
    yield put(distributionsFailed(normalizeError(error)));
  }
}

function* loadDistributionWorker(action: PayloadAction<string>): SagaIterator {
  try {
    const distribution: Distribution = yield call(fetchDistribution, action.payload);
    yield put(distributionUpdated(distribution));
  } catch (error: unknown) {
    console.error('Failed to load distribution', error);
    yield put(distributionsFailed(normalizeError(error)));
  }
}

function* createDistributionWorker(action: PayloadAction<Partial<Distribution>>): SagaIterator {
  try {
    const distribution: Distribution = yield call(createDistribution, action.payload);
    yield put(createDistributionSucceeded(distribution));
  } catch (error: unknown) {
    console.error('Failed to create distribution', error);
    yield put(createDistributionFailed(normalizeError(error)));
  }
}

function* updateDistributionWorker(
  action: PayloadAction<{ id: string; data: Partial<Distribution> }>
): SagaIterator {
  try {
    const { id, data } = action.payload;
    const distribution: Distribution = yield call(updateDistribution, id, data);
    yield put(updateDistributionSucceeded(distribution));
  } catch (error: unknown) {
    console.error('Failed to update distribution', error);
    yield put(updateDistributionFailed(normalizeError(error)));
  }
}

function* deleteDistributionWorker(action: PayloadAction<string>): SagaIterator {
  try {
    const id = action.payload;
    yield call(deleteDistribution, id);
    yield put(deleteDistributionSucceeded(id));
  } catch (error: unknown) {
    console.error('Failed to delete distribution', error);
    yield put(deleteDistributionFailed(normalizeError(error)));
  }
}

// ============================================================================
// Approval Workflow Workers
// ============================================================================

function* submitForApprovalWorker(
  action: PayloadAction<{ distributionId: string; comment?: string }>
): SagaIterator {
  try {
    const distribution: Distribution = yield call(submitForApproval, action.payload);
    yield put(submitForApprovalSucceeded(distribution));
  } catch (error: unknown) {
    console.error('Failed to submit for approval', error);
    yield put(submitForApprovalFailed(normalizeError(error)));
  }
}

function* approveDistributionWorker(
  action: PayloadAction<{ distributionId: string; approverId: string; comment?: string }>
): SagaIterator {
  try {
    const distribution: Distribution = yield call(approveDistribution, action.payload);
    yield put(approveDistributionSucceeded(distribution));
  } catch (error: unknown) {
    console.error('Failed to approve distribution', error);
    yield put(approveDistributionFailed(normalizeError(error)));
  }
}

function* rejectDistributionWorker(
  action: PayloadAction<{ distributionId: string; approverId: string; reason: string }>
): SagaIterator {
  try {
    const distribution: Distribution = yield call(rejectDistribution, action.payload);
    yield put(rejectDistributionSucceeded(distribution));
  } catch (error: unknown) {
    console.error('Failed to reject distribution', error);
    yield put(rejectDistributionFailed(normalizeError(error)));
  }
}

function* returnForRevisionWorker(
  action: PayloadAction<{ distributionId: string; approverId: string; reason: string }>
): SagaIterator {
  try {
    const distribution: Distribution = yield call(returnForRevision, action.payload);
    yield put(returnForRevisionSucceeded(distribution));
  } catch (error: unknown) {
    console.error('Failed to return distribution for revision', error);
    yield put(returnForRevisionFailed(normalizeError(error)));
  }
}

// ============================================================================
// Supporting Data Workers
// ============================================================================

function* loadSummaryWorker(): SagaIterator {
  try {
    const summary: DistributionSummary = yield call(fetchDistributionSummary);
    yield put(summaryLoaded({ summary }));
  } catch (error: unknown) {
    console.error('Failed to load distribution summary', error);
    yield put(summaryFailed(normalizeError(error)));
  }
}

function* loadCalendarEventsWorker(
  action: PayloadAction<{ startDate?: string; endDate?: string } | undefined>
): SagaIterator {
  try {
    const params = action.payload;
    const events: DistributionCalendarEvent[] = yield call(
      fetchDistributionCalendarEvents,
      params?.startDate,
      params?.endDate
    );
    yield put(calendarEventsLoaded({ events }));
  } catch (error: unknown) {
    console.error('Failed to load calendar events', error);
    yield put(calendarEventsFailed(normalizeError(error)));
  }
}

function* loadFeeTemplatesWorker(action: PayloadAction<string | undefined>): SagaIterator {
  try {
    const fundId = action.payload;
    const templates: FeeTemplate[] = yield call(fetchFeeTemplates, fundId);
    yield put(feeTemplatesLoaded({ templates }));
  } catch (error: unknown) {
    console.error('Failed to load fee templates', error);
    yield put(feeTemplatesFailed(normalizeError(error)));
  }
}

function* loadStatementTemplatesWorker(): SagaIterator {
  try {
    const templates: StatementTemplateConfig[] = yield call(fetchStatementTemplates);
    yield put(statementTemplatesLoaded({ templates }));
  } catch (error: unknown) {
    console.error('Failed to load statement templates', error);
    yield put(statementTemplatesFailed(normalizeError(error)));
  }
}

function* loadLPProfilesWorker(): SagaIterator {
  try {
    const profiles: LPProfile[] = yield call(fetchLPProfiles);
    yield put(lpProfilesLoaded({ profiles }));
  } catch (error: unknown) {
    console.error('Failed to load LP profiles', error);
    yield put(lpProfilesFailed(normalizeError(error)));
  }
}

function* loadApprovalRulesWorker(): SagaIterator {
  try {
    const rules: ApprovalRule[] = yield call(fetchApprovalRules);
    yield put(approvalRulesLoaded({ rules }));
  } catch (error: unknown) {
    console.error('Failed to load approval rules', error);
    yield put(approvalRulesFailed(normalizeError(error)));
  }
}

// ============================================================================
// Root Saga
// ============================================================================

export function* distributionSaga(): SagaIterator {
  // Distributions
  yield takeLatest(distributionsRequested.type, loadDistributionsWorker);
  yield takeLatest(distributionRequested.type, loadDistributionWorker);
  yield takeLatest(createDistributionRequested.type, createDistributionWorker);
  yield takeLatest(updateDistributionRequested.type, updateDistributionWorker);
  yield takeLatest(deleteDistributionRequested.type, deleteDistributionWorker);

  // Approval workflow
  yield takeLatest(submitForApprovalRequested.type, submitForApprovalWorker);
  yield takeLatest(approveDistributionRequested.type, approveDistributionWorker);
  yield takeLatest(rejectDistributionRequested.type, rejectDistributionWorker);
  yield takeLatest(returnForRevisionRequested.type, returnForRevisionWorker);

  // Supporting data
  yield takeLatest(summaryRequested.type, loadSummaryWorker);
  yield takeLatest(calendarEventsRequested.type, loadCalendarEventsWorker);
  yield takeLatest(feeTemplatesRequested.type, loadFeeTemplatesWorker);
  yield takeLatest(statementTemplatesRequested.type, loadStatementTemplatesWorker);
  yield takeLatest(lpProfilesRequested.type, loadLPProfilesWorker);
  yield takeLatest(approvalRulesRequested.type, loadApprovalRulesWorker);

  // Initial data load (can be triggered from components instead)
  // yield put(distributionsRequested());
  // yield put(summaryRequested());
}
