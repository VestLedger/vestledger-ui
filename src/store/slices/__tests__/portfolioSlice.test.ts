import { describe, it, expect } from 'vitest';
import {
  portfolioReducer,
  portfolioUpdatesRequested,
  portfolioUpdatesLoaded,
  portfolioUpdatesFailed,
  type PortfolioUpdatesData,
} from '../portfolioSlice';
import { getSliceTestExpectations } from '../../__tests__/sliceTestHarness';
import type { NormalizedError } from '@/store/types/AsyncState';

describe('portfolioSlice', () => {
  const mockUpdates: PortfolioUpdatesData = {
    updates: [
      {
        id: 'update-1',
        companyId: 'company-1',
        companyName: 'TechStartup Inc',
        title: 'Q4 2024 Update',
        date: '2024-12-15',
        type: 'quarterly',
        status: 'unread',
        summary: 'Strong revenue growth of 45% YoY',
        priority: 'high',
      },
      {
        id: 'update-2',
        companyId: 'company-2',
        companyName: 'HealthApp Co',
        title: 'Product Launch Announcement',
        date: '2024-12-10',
        type: 'milestone',
        status: 'read',
        summary: 'Launched new enterprise product line',
        priority: 'medium',
      },
    ],
  };

  const expectations = getSliceTestExpectations<PortfolioUpdatesData>({
    mockData: mockUpdates,
  });

  describe('initial state', () => {
    it('should return the initial state', () => {
      const state = portfolioReducer(undefined, { type: '@@INIT' });
      expect(state).toEqual(expectations.initialState);
    });

    it('should have idle status initially', () => {
      const state = portfolioReducer(undefined, { type: '@@INIT' });
      expect(state.status).toBe('idle');
      expect(state.data).toBeNull();
      expect(state.error).toBeUndefined();
    });
  });

  describe('portfolioUpdatesRequested', () => {
    it('should set status to loading', () => {
      const state = portfolioReducer(
        expectations.initialState,
        portfolioUpdatesRequested()
      );
      expect(state.status).toBe('loading');
      expect(state.error).toBeUndefined();
    });

    it('should clear previous error when requesting', () => {
      const stateWithError = {
        ...expectations.initialState,
        error: { message: 'Previous error', code: 'PREV_ERROR' },
      };
      const state = portfolioReducer(stateWithError, portfolioUpdatesRequested());
      expect(state.error).toBeUndefined();
    });
  });

  describe('portfolioUpdatesLoaded', () => {
    it('should set data and status to succeeded', () => {
      const state = portfolioReducer(
        expectations.loadingState,
        portfolioUpdatesLoaded(mockUpdates)
      );
      expect(state.status).toBe('succeeded');
      expect(state.data).toEqual(mockUpdates);
      expect(state.error).toBeUndefined();
    });

    it('should contain updates array', () => {
      const state = portfolioReducer(
        expectations.loadingState,
        portfolioUpdatesLoaded(mockUpdates)
      );
      expect(state.data?.updates).toHaveLength(2);
      expect(state.data?.updates[0].companyName).toBe('TechStartup Inc');
    });

    it('should replace existing data', () => {
      const stateWithData = {
        ...expectations.succeededState,
        data: { updates: [{ id: 'old', companyId: 'old', companyName: 'Old Co', title: 'Old', date: '2020-01-01', type: 'quarterly' as const, status: 'read' as const, summary: 'Old', priority: 'low' as const }] },
      };
      const state = portfolioReducer(
        stateWithData,
        portfolioUpdatesLoaded(mockUpdates)
      );
      expect(state.data?.updates).toHaveLength(2);
      expect(state.data?.updates[0].id).toBe('update-1');
    });
  });

  describe('portfolioUpdatesFailed', () => {
    it('should set error and status to failed', () => {
      const error: NormalizedError = {
        message: 'Failed to fetch portfolio updates',
        code: 'FETCH_ERROR',
      };
      const state = portfolioReducer(
        expectations.loadingState,
        portfolioUpdatesFailed(error)
      );
      expect(state.status).toBe('failed');
      expect(state.error).toEqual(error);
    });

    it('should preserve error code and message', () => {
      const error: NormalizedError = {
        message: 'Network timeout',
        code: 'TIMEOUT_ERROR',
        details: { timeout: 30000 },
      };
      const state = portfolioReducer(
        expectations.loadingState,
        portfolioUpdatesFailed(error)
      );
      expect(state.error?.code).toBe('TIMEOUT_ERROR');
      expect(state.error?.message).toBe('Network timeout');
    });
  });

  describe('AsyncState contract compliance', () => {
    it('should follow request → load → success pattern', () => {
      let state = portfolioReducer(undefined, { type: '@@INIT' });
      expect(state.status).toBe('idle');

      state = portfolioReducer(state, portfolioUpdatesRequested());
      expect(state.status).toBe('loading');

      state = portfolioReducer(state, portfolioUpdatesLoaded(mockUpdates));
      expect(state.status).toBe('succeeded');
      expect(state.data).toEqual(mockUpdates);
    });

    it('should follow request → fail pattern', () => {
      let state = portfolioReducer(undefined, { type: '@@INIT' });
      expect(state.status).toBe('idle');

      state = portfolioReducer(state, portfolioUpdatesRequested());
      expect(state.status).toBe('loading');

      const error: NormalizedError = { message: 'Error', code: 'ERROR' };
      state = portfolioReducer(state, portfolioUpdatesFailed(error));
      expect(state.status).toBe('failed');
      expect(state.error).toEqual(error);
    });
  });
});
