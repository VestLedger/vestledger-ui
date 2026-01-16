import { describe, it, expect } from 'vitest';
import {
  distributionReducer,
  distributionsRequested,
  distributionsLoaded,
  distributionsFailed,
  distributionUpdated,
  createDistributionSucceeded,
  createDistributionFailed,
  updateDistributionSucceeded,
  updateDistributionFailed,
  deleteDistributionSucceeded,
  submitForApprovalSucceeded,
  approveDistributionSucceeded,
  rejectDistributionSucceeded,
  summaryRequested,
  summaryLoaded,
  summaryFailed,
  calendarEventsRequested,
  calendarEventsLoaded,
  calendarEventsFailed,
  feeTemplatesRequested,
  feeTemplatesLoaded,
  feeTemplatesFailed,
  setSelectedDistribution,
  setFilters,
  type DistributionsData,
  type DistributionSummaryData,
  type CalendarEventsData,
  type FeeTemplatesData,
  type DistributionSaveData,
} from '../distributionSlice';
import type { NormalizedError } from '@/store/types/AsyncState';
import type { Distribution, DistributionCalendarEvent, FeeTemplate } from '@/types/distribution';

describe('distributionSlice', () => {
  const mockDistribution: Distribution = {
    id: 'dist-1',
    fundId: 'fund-1',
    fundName: 'Test Fund',
    name: 'Q4 2024 Distribution',
    eventType: 'dividend',
    eventDate: '2024-12-31',
    paymentDate: '2024-12-31',
    description: 'Test distribution',
    status: 'draft',
    grossProceeds: 10000000,
    totalFees: 0,
    totalExpenses: 0,
    netProceeds: 10000000,
    totalTaxWithholding: 0,
    totalDistributed: 10000000,
    feeLineItems: [],
    lpAllocations: [],
    approvalChainId: '',
    approvalSteps: [],
    statementsGenerated: false,
    statements: [],
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    createdBy: 'user-1',
    isDraft: true,
    revisionNumber: 1,
    comments: [],
    isRecurring: false,
  };

  const mockCalendarEvent: DistributionCalendarEvent = {
    id: 'event-1',
    distributionId: 'dist-1',
    title: 'Q4 Distribution',
    date: '2024-12-31',
    eventType: 'scheduled',
    status: 'upcoming',
    fundId: 'fund-1',
    fundName: 'Test Fund',
    isRecurring: false,
  };

  const mockFeeTemplate: FeeTemplate = {
    id: 'template-1',
    name: 'Standard Fee Template',
    description: 'Standard fee structure',
    feeLineItems: [],
    isSystem: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  };

  const initialState = {
    distributions: {
      data: null as DistributionsData | null,
      status: 'idle' as const,
      error: undefined,
    },
    save: {
      data: null as DistributionSaveData | null,
      status: 'idle' as const,
      error: undefined,
    },
    summary: {
      data: null as DistributionSummaryData | null,
      status: 'idle' as const,
      error: undefined,
    },
    calendarEvents: {
      data: null as CalendarEventsData | null,
      status: 'idle' as const,
      error: undefined,
    },
    feeTemplates: {
      data: null as FeeTemplatesData | null,
      status: 'idle' as const,
      error: undefined,
    },
    statementTemplates: {
      data: null,
      status: 'idle' as const,
      error: undefined,
    },
    lpProfiles: {
      data: null,
      status: 'idle' as const,
      error: undefined,
    },
    approvalRules: {
      data: null,
      status: 'idle' as const,
      error: undefined,
    },
    selectedDistributionId: null as string | null,
    currentFilters: null,
  };

  describe('initial state', () => {
    it('should return the initial state', () => {
      const state = distributionReducer(undefined, { type: '@@INIT' });
      expect(state.distributions.status).toBe('idle');
      expect(state.distributions.data).toBeNull();
      expect(state.save.status).toBe('idle');
      expect(state.summary.status).toBe('idle');
      expect(state.calendarEvents.status).toBe('idle');
      expect(state.selectedDistributionId).toBeNull();
    });
  });

  describe('distributions', () => {
    it('distributionsRequested should set status to loading', () => {
      const state = distributionReducer(initialState, distributionsRequested(undefined));
      expect(state.distributions.status).toBe('loading');
      expect(state.distributions.error).toBeUndefined();
    });

    it('distributionsLoaded should set distributions data', () => {
      const loadingState = {
        ...initialState,
        distributions: { ...initialState.distributions, status: 'loading' as const },
      };
      const data: DistributionsData = { distributions: [mockDistribution] };
      const state = distributionReducer(loadingState, distributionsLoaded(data));
      expect(state.distributions.status).toBe('succeeded');
      expect(state.distributions.data?.distributions).toEqual([mockDistribution]);
    });

    it('distributionsFailed should set error', () => {
      const error: NormalizedError = { message: 'Failed to load distributions' };
      const state = distributionReducer(initialState, distributionsFailed(error));
      expect(state.distributions.status).toBe('failed');
      expect(state.distributions.error).toEqual(error);
    });

    it('distributionUpdated should update existing distribution', () => {
      const stateWithDistributions = {
        ...initialState,
        distributions: {
          ...initialState.distributions,
          data: { distributions: [mockDistribution] },
          status: 'succeeded' as const,
        },
      };
      const updatedDistribution = { ...mockDistribution, name: 'Updated Title' };
      const state = distributionReducer(stateWithDistributions, distributionUpdated(updatedDistribution));
      expect(state.distributions.data?.distributions[0]?.name).toBe('Updated Title');
    });

    it('distributionUpdated should add new distribution if not found', () => {
      const stateWithDistributions = {
        ...initialState,
        distributions: {
          ...initialState.distributions,
          data: { distributions: [mockDistribution] },
          status: 'succeeded' as const,
        },
      };
      const newDistribution = { ...mockDistribution, id: 'dist-2', name: 'New Distribution' };
      const state = distributionReducer(stateWithDistributions, distributionUpdated(newDistribution));
      expect(state.distributions.data?.distributions).toHaveLength(2);
    });

    it('createDistributionSucceeded should add new distribution', () => {
      const state = distributionReducer(
        initialState,
        createDistributionSucceeded({ distribution: mockDistribution, requestId: 'req-1' })
      );
      expect(state.distributions.data?.distributions).toEqual([mockDistribution]);
      expect(state.save.status).toBe('succeeded');
      expect(state.save.data?.distribution.id).toBe(mockDistribution.id);
    });

    it('createDistributionFailed should set error', () => {
      const error: NormalizedError = { message: 'Failed to create' };
      const state = distributionReducer(
        initialState,
        createDistributionFailed({ error, requestId: 'req-1' })
      );
      expect(state.distributions.status).toBe('failed');
      expect(state.distributions.error).toEqual(error);
      expect(state.save.status).toBe('failed');
    });

    it('updateDistributionSucceeded should update distribution', () => {
      const stateWithDistributions = {
        ...initialState,
        distributions: {
          ...initialState.distributions,
          data: { distributions: [mockDistribution] },
          status: 'loading' as const,
        },
      };
      const updatedDistribution = { ...mockDistribution, status: 'pending-approval' as const };
      const state = distributionReducer(
        stateWithDistributions,
        updateDistributionSucceeded({ distribution: updatedDistribution, requestId: 'req-2' })
      );
      expect(state.distributions.data?.distributions[0]?.status).toBe('pending-approval');
      expect(state.save.status).toBe('succeeded');
    });

    it('updateDistributionFailed should set error', () => {
      const error: NormalizedError = { message: 'Failed to update' };
      const state = distributionReducer(
        initialState,
        updateDistributionFailed({ error, requestId: 'req-2' })
      );
      expect(state.distributions.status).toBe('failed');
      expect(state.distributions.error).toEqual(error);
      expect(state.save.status).toBe('failed');
    });

    it('deleteDistributionSucceeded should remove distribution', () => {
      const stateWithDistributions = {
        ...initialState,
        distributions: {
          ...initialState.distributions,
          data: { distributions: [mockDistribution] },
          status: 'loading' as const,
        },
        selectedDistributionId: 'dist-1',
      };
      const state = distributionReducer(stateWithDistributions, deleteDistributionSucceeded('dist-1'));
      expect(state.distributions.data?.distributions).toHaveLength(0);
      expect(state.selectedDistributionId).toBeNull();
    });
  });

  describe('approval workflow', () => {
    it('submitForApprovalSucceeded should update distribution status', () => {
      const stateWithDistributions = {
        ...initialState,
        distributions: {
          ...initialState.distributions,
          data: { distributions: [mockDistribution] },
          status: 'loading' as const,
        },
      };
      const submittedDistribution = { ...mockDistribution, status: 'pending-approval' as const };
      const state = distributionReducer(stateWithDistributions, submitForApprovalSucceeded(submittedDistribution));
      expect(state.distributions.data?.distributions[0]?.status).toBe('pending-approval');
    });

    it('approveDistributionSucceeded should update to approved status', () => {
      const pendingDistribution = { ...mockDistribution, status: 'pending-approval' as const };
      const stateWithDistributions = {
        ...initialState,
        distributions: {
          ...initialState.distributions,
          data: { distributions: [pendingDistribution] },
          status: 'loading' as const,
        },
      };
      const approvedDistribution = { ...mockDistribution, status: 'approved' as const };
      const state = distributionReducer(stateWithDistributions, approveDistributionSucceeded(approvedDistribution));
      expect(state.distributions.data?.distributions[0]?.status).toBe('approved');
    });

    it('rejectDistributionSucceeded should update to rejected status', () => {
      const pendingDistribution = { ...mockDistribution, status: 'pending-approval' as const };
      const stateWithDistributions = {
        ...initialState,
        distributions: {
          ...initialState.distributions,
          data: { distributions: [pendingDistribution] },
          status: 'loading' as const,
        },
      };
      const rejectedDistribution = { ...mockDistribution, status: 'rejected' as const };
      const state = distributionReducer(stateWithDistributions, rejectDistributionSucceeded(rejectedDistribution));
      expect(state.distributions.data?.distributions[0]?.status).toBe('rejected');
    });
  });

  describe('summary', () => {
    it('summaryRequested should set status to loading', () => {
      const state = distributionReducer(initialState, summaryRequested());
      expect(state.summary.status).toBe('loading');
    });

    it('summaryLoaded should set summary data', () => {
      const summaryData: DistributionSummaryData = {
        summary: {
          totalDistributions: 10,
          totalDistributed: 50000000,
          pendingApproval: 2,
          upcomingDistributions: 3,
          byStatus: [
            { status: 'draft', count: 2, totalAmount: 5000000 },
            { status: 'completed', count: 4, totalAmount: 25000000 },
          ],
          byFund: [
            { fundId: 'fund-1', fundName: 'Test Fund', count: 6, totalAmount: 35000000 },
          ],
          recentDistributions: [mockDistribution],
          upcomingScheduled: [mockCalendarEvent],
        },
      };
      const state = distributionReducer(initialState, summaryLoaded(summaryData));
      expect(state.summary.status).toBe('succeeded');
      expect(state.summary.data).toEqual(summaryData);
    });

    it('summaryFailed should set error', () => {
      const error: NormalizedError = { message: 'Failed to load summary' };
      const state = distributionReducer(initialState, summaryFailed(error));
      expect(state.summary.status).toBe('failed');
      expect(state.summary.error).toEqual(error);
    });
  });

  describe('calendar events', () => {
    it('calendarEventsRequested should set status to loading', () => {
      const state = distributionReducer(initialState, calendarEventsRequested());
      expect(state.calendarEvents.status).toBe('loading');
    });

    it('calendarEventsLoaded should set events data', () => {
      const eventsData: CalendarEventsData = { events: [mockCalendarEvent] };
      const state = distributionReducer(initialState, calendarEventsLoaded(eventsData));
      expect(state.calendarEvents.status).toBe('succeeded');
      expect(state.calendarEvents.data?.events).toEqual([mockCalendarEvent]);
    });

    it('calendarEventsFailed should set error', () => {
      const error: NormalizedError = { message: 'Failed to load events' };
      const state = distributionReducer(initialState, calendarEventsFailed(error));
      expect(state.calendarEvents.status).toBe('failed');
      expect(state.calendarEvents.error).toEqual(error);
    });
  });

  describe('fee templates', () => {
    it('feeTemplatesRequested should set status to loading', () => {
      const state = distributionReducer(initialState, feeTemplatesRequested());
      expect(state.feeTemplates.status).toBe('loading');
    });

    it('feeTemplatesLoaded should set templates data', () => {
      const templatesData: FeeTemplatesData = { templates: [mockFeeTemplate] };
      const state = distributionReducer(initialState, feeTemplatesLoaded(templatesData));
      expect(state.feeTemplates.status).toBe('succeeded');
      expect(state.feeTemplates.data?.templates).toEqual([mockFeeTemplate]);
    });

    it('feeTemplatesFailed should set error', () => {
      const error: NormalizedError = { message: 'Failed to load templates' };
      const state = distributionReducer(initialState, feeTemplatesFailed(error));
      expect(state.feeTemplates.status).toBe('failed');
      expect(state.feeTemplates.error).toEqual(error);
    });
  });

  describe('UI state', () => {
    it('setSelectedDistribution should set selected distribution id', () => {
      const state = distributionReducer(initialState, setSelectedDistribution('dist-1'));
      expect(state.selectedDistributionId).toBe('dist-1');
    });

    it('setSelectedDistribution should allow null', () => {
      const stateWithSelection = {
        ...initialState,
        selectedDistributionId: 'dist-1',
      };
      const state = distributionReducer(stateWithSelection, setSelectedDistribution(null));
      expect(state.selectedDistributionId).toBeNull();
    });

    it('setFilters should set current filters', () => {
      const filters = { status: 'pending-approval' as const };
      const state = distributionReducer(initialState, setFilters(filters));
      expect(state.currentFilters).toEqual(filters);
    });

    it('setFilters with null should reset filters', () => {
      const stateWithFilters = {
        ...initialState,
        currentFilters: { status: 'approved' as const },
      };
      const state = distributionReducer(stateWithFilters, setFilters(null));
      expect(state.currentFilters).toBeNull();
    });
  });
});
