import { describe, it, expect } from 'vitest';
import {
  pipelineReducer,
  pipelineDataRequested,
  pipelineDataLoaded,
  pipelineDataFailed,
  dealStageUpdated,
  type PipelineData,
  type GetPipelineParams,
} from '../pipelineSlice';
import { getSliceTestExpectations } from '../../__tests__/sliceTestHarness';
import type { NormalizedError } from '@/store/types/AsyncState';

describe('pipelineSlice', () => {
  const mockPipelineData: PipelineData = {
    stages: ['Sourcing', 'Due Diligence', 'Negotiation', 'Closed'],
    deals: [
      {
        id: 1,
        name: 'TechStartup Inc',
        stage: 'Sourcing',
        amount: '$2M',
        probability: 75,
        founder: 'Jane Doe',
        lastContact: '2 days ago',
        sector: 'SaaS',
        outcome: 'active',
      },
      {
        id: 2,
        name: 'HealthApp Co',
        stage: 'Due Diligence',
        amount: '$5M',
        probability: 60,
        founder: 'John Smith',
        lastContact: '1 week ago',
        sector: 'Healthcare',
        outcome: 'active',
      },
    ],
    copilotSuggestions: [],
  };

  const expectations = getSliceTestExpectations<PipelineData>({
    mockData: mockPipelineData,
  });

  describe('initial state', () => {
    it('should return the initial state', () => {
      const state = pipelineReducer(undefined, { type: '@@INIT' });
      expect(state).toEqual(expectations.initialState);
    });

    it('should have idle status initially', () => {
      const state = pipelineReducer(undefined, { type: '@@INIT' });
      expect(state.status).toBe('idle');
      expect(state.data).toBeNull();
      expect(state.error).toBeUndefined();
    });
  });

  describe('pipelineDataRequested', () => {
    it('should set status to loading', () => {
      const params: GetPipelineParams = {};
      const state = pipelineReducer(
        expectations.initialState,
        pipelineDataRequested(params)
      );
      expect(state.status).toBe('loading');
      expect(state.error).toBeUndefined();
    });

    it('should clear previous error when requesting', () => {
      const stateWithError = {
        ...expectations.initialState,
        error: { message: 'Previous error', code: 'PREV_ERROR' },
      };
      const state = pipelineReducer(stateWithError, pipelineDataRequested({}));
      expect(state.error).toBeUndefined();
    });
  });

  describe('pipelineDataLoaded', () => {
    it('should set data and status to succeeded', () => {
      const state = pipelineReducer(
        expectations.loadingState,
        pipelineDataLoaded(mockPipelineData)
      );
      expect(state.status).toBe('succeeded');
      expect(state.data).toEqual(mockPipelineData);
      expect(state.error).toBeUndefined();
    });

    it('should replace existing data', () => {
      const stateWithData = {
        ...expectations.succeededState,
        data: { stages: ['Old'], deals: [], copilotSuggestions: [] },
      };
      const state = pipelineReducer(
        stateWithData,
        pipelineDataLoaded(mockPipelineData)
      );
      expect(state.data).toEqual(mockPipelineData);
    });
  });

  describe('pipelineDataFailed', () => {
    it('should set error and status to failed', () => {
      const error: NormalizedError = {
        message: 'Failed to fetch pipeline data',
        code: 'FETCH_ERROR',
      };
      const state = pipelineReducer(
        expectations.loadingState,
        pipelineDataFailed(error)
      );
      expect(state.status).toBe('failed');
      expect(state.error).toEqual(error);
    });

    it('should preserve the error code', () => {
      const error: NormalizedError = {
        message: 'Network error',
        code: 'NETWORK_ERROR',
      };
      const state = pipelineReducer(
        expectations.loadingState,
        pipelineDataFailed(error)
      );
      expect(state.error?.code).toBe('NETWORK_ERROR');
    });
  });

  describe('dealStageUpdated', () => {
    it('should update deal stage when data exists', () => {
      const stateWithData = {
        ...expectations.succeededState,
        data: mockPipelineData,
      };
      const state = pipelineReducer(
        stateWithData,
        dealStageUpdated({ dealId: 1, newStage: 'Due Diligence' })
      );
      const updatedDeal = state.data?.deals.find((d) => d.id === 1);
      expect(updatedDeal?.stage).toBe('Due Diligence');
    });

    it('should not modify other deals', () => {
      const stateWithData = {
        ...expectations.succeededState,
        data: mockPipelineData,
      };
      const state = pipelineReducer(
        stateWithData,
        dealStageUpdated({ dealId: 1, newStage: 'Negotiation' })
      );
      const otherDeal = state.data?.deals.find((d) => d.id === 2);
      expect(otherDeal?.stage).toBe('Due Diligence');
    });

    it('should handle non-existent deal id gracefully', () => {
      const stateWithData = {
        ...expectations.succeededState,
        data: mockPipelineData,
      };
      const state = pipelineReducer(
        stateWithData,
        dealStageUpdated({ dealId: 999, newStage: 'Closed' })
      );
      // Should not throw and state should remain unchanged
      expect(state.data?.deals).toHaveLength(2);
    });

    it('should handle null data gracefully', () => {
      const state = pipelineReducer(
        expectations.initialState,
        dealStageUpdated({ dealId: 1, newStage: 'Closed' })
      );
      // Should not throw
      expect(state.data).toBeNull();
    });
  });
});
