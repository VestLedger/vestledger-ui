import { describe, it, expect } from 'vitest';
import { call, put } from 'redux-saga/effects';
import { loadPortfolioUpdatesWorker } from '../portfolioSaga';
import {
  portfolioUpdatesRequested,
  portfolioUpdatesLoaded,
  portfolioUpdatesFailed,
  type PortfolioUpdatesData,
} from '@/store/slices/portfolioSlice';
import { getPortfolioUpdates } from '@/services/portfolio/portfolioDataService';
import { normalizeError } from '@/store/utils/normalizeError';

describe('portfolioSaga', () => {
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

  describe('loadPortfolioUpdatesWorker', () => {
    it('should call getPortfolioUpdates service', () => {
      const action = portfolioUpdatesRequested();
      const generator = loadPortfolioUpdatesWorker(action);

      const callEffect = generator.next().value;
      expect(callEffect).toEqual(call(getPortfolioUpdates));
    });

    it('should dispatch portfolioUpdatesLoaded on success', () => {
      const action = portfolioUpdatesRequested();
      const generator = loadPortfolioUpdatesWorker(action);

      // First yield: call to service
      generator.next();

      // Service returns raw updates array, saga wraps it in { updates }
      const rawUpdates = mockUpdates.updates;
      const putEffect = generator.next(rawUpdates).value;
      expect(putEffect).toEqual(put(portfolioUpdatesLoaded({ updates: rawUpdates })));
    });

    it('should dispatch portfolioUpdatesFailed on error', () => {
      const action = portfolioUpdatesRequested();
      const generator = loadPortfolioUpdatesWorker(action);

      // First yield: call to service
      generator.next();

      // Simulate error thrown
      const error = new Error('Failed to fetch updates');
      const putEffect = generator.throw(error).value;

      expect(putEffect).toEqual(
        put(portfolioUpdatesFailed(normalizeError(error)))
      );
    });

    it('should handle API not implemented error', () => {
      const action = portfolioUpdatesRequested();
      const generator = loadPortfolioUpdatesWorker(action);

      generator.next();

      const error = new Error('Portfolio API not implemented yet');
      const putEffect = generator.throw(error).value;

      expect(putEffect).toEqual(
        put(portfolioUpdatesFailed(normalizeError(error)))
      );
    });

    it('should complete after dispatching success', () => {
      const action = portfolioUpdatesRequested();
      const generator = loadPortfolioUpdatesWorker(action);

      generator.next(); // call
      generator.next(mockUpdates.updates); // put success

      const done = generator.next();
      expect(done.done).toBe(true);
    });

    it('should complete after dispatching failure', () => {
      const action = portfolioUpdatesRequested();
      const generator = loadPortfolioUpdatesWorker(action);

      generator.next(); // call
      generator.throw(new Error('Error')); // put failure

      const done = generator.next();
      expect(done.done).toBe(true);
    });
  });
});
