import { describe, it, expect } from 'vitest';
import { call, put } from 'redux-saga/effects';
import { loadPortfolioUpdatesWorker } from '../portfolioSaga';
import {
  portfolioUpdatesRequested,
  portfolioUpdatesLoaded,
  portfolioUpdatesFailed,
} from '@/store/slices/portfolioSlice';
import {
  fetchPortfolioSnapshot,
  type PortfolioSnapshot,
} from '@/services/portfolio/portfolioDataService';
import { fetchPortfolioDocumentsSnapshot } from '@/services/portfolio/portfolioDocumentsService';
import { normalizeError } from '@/store/utils/normalizeError';
import { portfolioDocuments } from '@/data/mocks/portfolio/documents';

describe('portfolioSaga', () => {
  const mockSnapshot: PortfolioSnapshot = {
    companies: [],
    updates: [
      {
        id: 'update-1',
        companyId: 'company-1',
        companyName: 'TechStartup Inc',
        title: 'Q4 2024 Update',
        date: '2024-12-15',
        type: 'financial',
        description: 'Strong revenue growth of 45% YoY',
        author: 'Ops',
      },
      {
        id: 'update-2',
        companyId: 'company-2',
        companyName: 'HealthApp Co',
        title: 'Product Launch Announcement',
        date: '2024-12-10',
        type: 'milestone',
        description: 'Launched new enterprise product line',
        author: 'Ops',
      },
    ],
    summary: {
      totalCompanies: 0,
      totalInvested: 0,
      totalCurrentValue: 0,
      averageMOIC: 0,
      averageIRR: 0,
      activeCompanies: 0,
      averageHealthScore: 0,
    },
    performance: [],
    allocation: [],
    pageMetrics: {
      totalCompanies: 0,
      atRiskCompanies: 0,
      pendingUpdates: 2,
    },
    healthyCompanies: 0,
  };

  describe('loadPortfolioUpdatesWorker', () => {
    it('should prefetch portfolio and document snapshots', () => {
      const action = portfolioUpdatesRequested({});
      const generator = loadPortfolioUpdatesWorker(action);

      expect(generator.next().value).toEqual(call(fetchPortfolioSnapshot, null));
      expect(generator.next(mockSnapshot).value).toEqual(
        call(fetchPortfolioDocumentsSnapshot, null)
      );
    });

    it('should dispatch portfolioUpdatesLoaded on success', () => {
      const action = portfolioUpdatesRequested({});
      const generator = loadPortfolioUpdatesWorker(action);

      generator.next(); // fetchPortfolioSnapshot
      generator.next(mockSnapshot); // fetchPortfolioDocumentsSnapshot

      const putEffect = generator.next(portfolioDocuments).value;
      expect(putEffect).toEqual(
        put(portfolioUpdatesLoaded({ updates: mockSnapshot.updates }))
      );
    });

    it('should dispatch portfolioUpdatesFailed on error', () => {
      const action = portfolioUpdatesRequested({});
      const generator = loadPortfolioUpdatesWorker(action);

      generator.next(); // fetchPortfolioSnapshot

      const error = new Error('Failed to fetch updates');
      const putEffect = generator.throw(error).value;

      expect(putEffect).toEqual(
        put(portfolioUpdatesFailed(normalizeError(error)))
      );
    });

    it('should handle document prefetch errors', () => {
      const action = portfolioUpdatesRequested({});
      const generator = loadPortfolioUpdatesWorker(action);

      generator.next(); // fetchPortfolioSnapshot
      generator.next(mockSnapshot); // fetchPortfolioDocumentsSnapshot

      const error = new Error('Failed to prefetch documents');
      const putEffect = generator.throw(error).value;

      expect(putEffect).toEqual(
        put(portfolioUpdatesFailed(normalizeError(error)))
      );
    });

    it('should complete after dispatching success', () => {
      const action = portfolioUpdatesRequested({});
      const generator = loadPortfolioUpdatesWorker(action);

      generator.next(); // fetchPortfolioSnapshot
      generator.next(mockSnapshot); // fetchPortfolioDocumentsSnapshot
      generator.next(portfolioDocuments); // put success

      const done = generator.next();
      expect(done.done).toBe(true);
    });

    it('should complete after dispatching failure', () => {
      const action = portfolioUpdatesRequested({});
      const generator = loadPortfolioUpdatesWorker(action);

      generator.next(); // fetchPortfolioSnapshot
      generator.throw(new Error('Error')); // put failure

      const done = generator.next();
      expect(done.done).toBe(true);
    });
  });
});
