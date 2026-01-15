import { describe, it, expect } from 'vitest';
import { all, call, put } from 'redux-saga/effects';
import { loadCRMDataWorker } from '../crmSaga';
import {
  crmDataRequested,
  crmDataLoaded,
  crmDataFailed,
  type CRMData,
  type GetCRMDataParams,
} from '@/store/slices/crmSlice';
import {
  getCRMContacts,
  getCRMEmailAccounts,
  getCRMInteractions,
  getCRMTimelineInteractions,
} from '@/services/crm/contactsService';
import { normalizeError } from '@/store/utils/normalizeError';

describe('crmSaga', () => {
  const mockParams: GetCRMDataParams = { fundId: 'fund-1' };

  const mockContacts = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'Founder',
      company: 'TechStartup',
      phone: '+1234567890',
      tags: ['investor'],
      deals: [],
      interactions: 5,
      starred: false,
    },
  ];

  const mockEmailAccounts = [
    {
      id: 'acc-1',
      email: 'user@example.com',
      provider: 'gmail' as const,
      connected: true,
      lastSync: '2024-01-15',
      status: 'active' as const,
    },
  ];

  const mockInteractions: never[] = [];
  const mockTimelineInteractions: never[] = [];

  const mockCRMData: CRMData = {
    contacts: mockContacts,
    emailAccounts: mockEmailAccounts,
    interactions: mockInteractions,
    timelineInteractions: mockTimelineInteractions,
  };

  describe('loadCRMDataWorker', () => {
    it('should call all CRM services in parallel', () => {
      const action = crmDataRequested(mockParams);
      const generator = loadCRMDataWorker(action);

      const allEffect = generator.next().value;
      expect(allEffect).toEqual(
        all([
          call(getCRMContacts, mockParams),
          call(getCRMEmailAccounts, mockParams),
          call(getCRMInteractions, mockParams),
          call(getCRMTimelineInteractions, mockParams),
        ])
      );
    });

    it('should dispatch crmDataLoaded on success', () => {
      const action = crmDataRequested(mockParams);
      const generator = loadCRMDataWorker(action);

      // First yield: all parallel calls
      generator.next();

      // Second yield: put success action with combined data
      const putEffect = generator.next([
        mockContacts,
        mockEmailAccounts,
        mockInteractions,
        mockTimelineInteractions,
      ]).value;

      expect(putEffect).toEqual(put(crmDataLoaded(mockCRMData)));
    });

    it('should dispatch crmDataFailed on error', () => {
      const action = crmDataRequested(mockParams);
      const generator = loadCRMDataWorker(action);

      // First yield: all parallel calls
      generator.next();

      // Simulate error thrown
      const error = new Error('Network error');
      const putEffect = generator.throw(error).value;

      expect(putEffect).toEqual(put(crmDataFailed(normalizeError(error))));
    });

    it('should handle empty params', () => {
      const action = crmDataRequested({});
      const generator = loadCRMDataWorker(action);

      const allEffect = generator.next().value;
      expect(allEffect).toEqual(
        all([
          call(getCRMContacts, {}),
          call(getCRMEmailAccounts, {}),
          call(getCRMInteractions, {}),
          call(getCRMTimelineInteractions, {}),
        ])
      );
    });

    it('should pass fundId to services', () => {
      const paramsWithFund: GetCRMDataParams = { fundId: 'fund-123' };
      const action = crmDataRequested(paramsWithFund);
      const generator = loadCRMDataWorker(action);

      const allEffect = generator.next().value;
      expect(allEffect).toEqual(
        all([
          call(getCRMContacts, paramsWithFund),
          call(getCRMEmailAccounts, paramsWithFund),
          call(getCRMInteractions, paramsWithFund),
          call(getCRMTimelineInteractions, paramsWithFund),
        ])
      );
    });

    it('should complete after dispatching success', () => {
      const action = crmDataRequested(mockParams);
      const generator = loadCRMDataWorker(action);

      generator.next(); // all calls
      generator.next([
        mockContacts,
        mockEmailAccounts,
        mockInteractions,
        mockTimelineInteractions,
      ]); // put success

      const done = generator.next();
      expect(done.done).toBe(true);
    });
  });
});
