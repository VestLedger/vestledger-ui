import { describe, it, expect } from 'vitest';
import {
  crmReducer,
  crmDataRequested,
  crmDataLoaded,
  crmDataFailed,
  type CRMData,
  type GetCRMDataParams,
} from '../crmSlice';
import { getSliceTestExpectations } from '../../__tests__/sliceTestHarness';
import type { NormalizedError } from '@/store/types/AsyncState';

describe('crmSlice', () => {
  const mockCRMData: CRMData = {
    contacts: [
      {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'Founder',
        company: 'TechStartup',
        phone: '+1234567890',
        tags: ['investor', 'tech'],
        deals: [],
        interactions: 5,
        starred: false,
      },
    ],
    emailAccounts: [
      {
        id: 'acc-1',
        email: 'user@example.com',
        provider: 'gmail',
        connected: true,
        lastSync: '2024-01-15',
        status: 'active',
      },
    ],
    interactions: [],
    timelineInteractions: [],
  };

  const expectations = getSliceTestExpectations<CRMData>({
    mockData: mockCRMData,
  });

  describe('initial state', () => {
    it('should return the initial state', () => {
      const state = crmReducer(undefined, { type: '@@INIT' });
      expect(state).toEqual(expectations.initialState);
    });

    it('should have idle status initially', () => {
      const state = crmReducer(undefined, { type: '@@INIT' });
      expect(state.status).toBe('idle');
      expect(state.data).toBeNull();
      expect(state.error).toBeUndefined();
    });
  });

  describe('crmDataRequested', () => {
    it('should set status to loading', () => {
      const params: GetCRMDataParams = {};
      const state = crmReducer(
        expectations.initialState,
        crmDataRequested(params)
      );
      expect(state.status).toBe('loading');
      expect(state.error).toBeUndefined();
    });

    it('should accept fundId parameter', () => {
      const params: GetCRMDataParams = { fundId: 'fund-1' };
      const state = crmReducer(
        expectations.initialState,
        crmDataRequested(params)
      );
      expect(state.status).toBe('loading');
    });

    it('should accept contactType parameter', () => {
      const params: GetCRMDataParams = { contactType: 'founder' };
      const state = crmReducer(
        expectations.initialState,
        crmDataRequested(params)
      );
      expect(state.status).toBe('loading');
    });

    it('should clear previous error when requesting', () => {
      const stateWithError = {
        ...expectations.initialState,
        error: { message: 'Previous error', code: 'PREV_ERROR' },
      };
      const state = crmReducer(stateWithError, crmDataRequested({}));
      expect(state.error).toBeUndefined();
    });
  });

  describe('crmDataLoaded', () => {
    it('should set data and status to succeeded', () => {
      const state = crmReducer(
        expectations.loadingState,
        crmDataLoaded(mockCRMData)
      );
      expect(state.status).toBe('succeeded');
      expect(state.data).toEqual(mockCRMData);
      expect(state.error).toBeUndefined();
    });

    it('should replace existing data', () => {
      const stateWithData = {
        ...expectations.succeededState,
        data: {
          contacts: [],
          emailAccounts: [],
          interactions: [],
          timelineInteractions: [],
        },
      };
      const state = crmReducer(stateWithData, crmDataLoaded(mockCRMData));
      expect(state.data).toEqual(mockCRMData);
    });

    it('should contain all CRM data fields', () => {
      const state = crmReducer(
        expectations.loadingState,
        crmDataLoaded(mockCRMData)
      );
      expect(state.data?.contacts).toBeDefined();
      expect(state.data?.emailAccounts).toBeDefined();
      expect(state.data?.interactions).toBeDefined();
      expect(state.data?.timelineInteractions).toBeDefined();
    });
  });

  describe('crmDataFailed', () => {
    it('should set error and status to failed', () => {
      const error: NormalizedError = {
        message: 'Failed to fetch CRM data',
        code: 'FETCH_ERROR',
      };
      const state = crmReducer(
        expectations.loadingState,
        crmDataFailed(error)
      );
      expect(state.status).toBe('failed');
      expect(state.error).toEqual(error);
    });

    it('should preserve error details', () => {
      const error: NormalizedError = {
        message: 'API rate limit exceeded',
        code: 'RATE_LIMIT',
        details: { retryAfter: 60 },
      };
      const state = crmReducer(
        expectations.loadingState,
        crmDataFailed(error)
      );
      expect(state.error?.details).toEqual({ retryAfter: 60 });
    });
  });
});
