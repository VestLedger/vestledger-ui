import { describe, it, expect, vi, beforeEach } from 'vitest';
import { runSaga } from 'redux-saga';
import { loadFundsWorker } from '../fundSaga';
import { fundsRequested, fundsLoaded, fundsFailed } from '@/store/slices/fundSlice';
import * as fundsService from '@/services/fundsService';
import type { Fund } from '@/types/fund';

// Mock the fundsService
vi.mock('@/services/fundsService', () => ({
  fetchFunds: vi.fn(),
}));

// Mock safeLocalStorage
vi.mock('@/lib/storage/safeLocalStorage', () => ({
  safeLocalStorage: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    setJSON: vi.fn(),
    removeItem: vi.fn(),
    getJSON: vi.fn(),
  },
}));

describe('fundSaga', () => {
  const mockFunds: Fund[] = [
    {
      id: 'fund-1',
      name: 'Test Fund I',
      displayName: 'Fund I',
      fundNumber: 1,
      status: 'active',
      strategy: 'early-stage',
      totalCommitment: 100000000,
      deployedCapital: 75000000,
      availableCapital: 25000000,
      vintage: 2020,
      startDate: '2020-01-01',
      fundTerm: 10,
      portfolioCount: 15,
      activeDeals: 12,
      totalInvestments: 50000000,
      portfolioValue: 85000000,
      irr: 25.5,
      tvpi: 1.7,
      dpi: 0.3,
      minInvestment: 500000,
      maxInvestment: 10000000,
      targetSectors: ['SaaS', 'Fintech'],
      targetStages: ['Seed', 'Series A'],
      managers: ['Jane Doe'],
      createdAt: '2020-01-01',
      updatedAt: '2024-01-01',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('loadFundsWorker', () => {
    it('should dispatch fundsLoaded on successful fetch', async () => {
      vi.mocked(fundsService.fetchFunds).mockResolvedValue(mockFunds);

      const dispatched: unknown[] = [];
      const action = fundsRequested({});

      await runSaga(
        {
          dispatch: (action: unknown) => dispatched.push(action),
          getState: () => ({}),
        },
        loadFundsWorker,
        action
      ).toPromise();

      expect(dispatched).toContainEqual(fundsLoaded({ funds: mockFunds }));
    });

    it('should dispatch fundsFailed on error', async () => {
      vi.mocked(fundsService.fetchFunds).mockRejectedValue(new Error('Network error'));

      const dispatched: unknown[] = [];
      const action = fundsRequested({});

      await runSaga(
        {
          dispatch: (action: unknown) => dispatched.push(action),
          getState: () => ({}),
        },
        loadFundsWorker,
        action
      ).toPromise();

      expect(dispatched).toHaveLength(1);
      expect(dispatched[0]).toHaveProperty('type', fundsFailed.type);
    });

    it('should pass params to fetchFunds', async () => {
      vi.mocked(fundsService.fetchFunds).mockResolvedValue(mockFunds);

      const dispatched: unknown[] = [];
      const params = { status: 'active' };
      const action = fundsRequested(params);

      await runSaga(
        {
          dispatch: (action: unknown) => dispatched.push(action),
          getState: () => ({}),
        },
        loadFundsWorker,
        action
      ).toPromise();

      expect(fundsService.fetchFunds).toHaveBeenCalledWith(params);
    });

    it('should handle empty funds array', async () => {
      vi.mocked(fundsService.fetchFunds).mockResolvedValue([]);

      const dispatched: unknown[] = [];
      const action = fundsRequested({});

      await runSaga(
        {
          dispatch: (action: unknown) => dispatched.push(action),
          getState: () => ({}),
        },
        loadFundsWorker,
        action
      ).toPromise();

      expect(dispatched).toContainEqual(fundsLoaded({ funds: [] }));
    });
  });
});
