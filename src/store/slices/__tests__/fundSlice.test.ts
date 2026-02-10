import { describe, it, expect } from 'vitest';
import {
  fundReducer,
  fundsRequested,
  fundsLoaded,
  fundsFailed,
  fundHydrated,
  setSelectedFundId,
  setViewMode,
  type GetFundsParams,
} from '../fundSlice';
import type { Fund, FundViewMode } from '@/types/fund';
import type { NormalizedError } from '@/store/types/AsyncState';

describe('fundSlice', () => {
  const mockFunds: Fund[] = [
    {
      id: 'fund-1',
      name: 'Quantum Ventures I',
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
    {
      id: 'fund-2',
      name: 'Quantum Ventures II',
      displayName: 'Fund II',
      fundNumber: 2,
      status: 'fundraising',
      strategy: 'growth',
      totalCommitment: 200000000,
      deployedCapital: 0,
      availableCapital: 200000000,
      vintage: 2024,
      startDate: '2024-01-01',
      fundTerm: 10,
      portfolioCount: 0,
      activeDeals: 0,
      totalInvestments: 0,
      portfolioValue: 0,
      irr: 0,
      tvpi: 1.0,
      dpi: 0,
      minInvestment: 1000000,
      maxInvestment: 20000000,
      targetSectors: ['AI', 'Healthcare'],
      targetStages: ['Series B', 'Series C'],
      managers: ['John Smith'],
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    },
  ];

  // FundState extends AsyncState<FundsData> with additional UI state
  const initialState = {
    data: null as { funds: Fund[] } | null,
    status: 'idle' as const,
    error: undefined as import('@/store/types/AsyncState').NormalizedError | undefined,
    selectedFundId: null as string | null,
    viewMode: 'consolidated' as FundViewMode,
    hydrated: false,
    archivedFundIds: [] as string[],
    mutationStatus: 'idle' as const,
    mutationError: undefined as import('@/store/types/AsyncState').NormalizedError | undefined,
  };

  describe('initial state', () => {
    it('should return the initial state', () => {
      const state = fundReducer(undefined, { type: '@@INIT' });
      expect(state.status).toBe('idle');
      expect(state.data).toBeNull();
      expect(state.selectedFundId).toBeNull();
      expect(state.viewMode).toBe('consolidated');
      expect(state.hydrated).toBe(false);
      expect(state.archivedFundIds).toEqual([]);
      expect(state.mutationStatus).toBe('idle');
    });
  });

  describe('fundsRequested', () => {
    it('should set status to loading', () => {
      const params: GetFundsParams = {};
      const state = fundReducer(initialState, fundsRequested(params));
      expect(state.status).toBe('loading');
      expect(state.error).toBeUndefined();
    });

    it('should accept filter parameters', () => {
      const params: GetFundsParams = { status: 'active' };
      const state = fundReducer(initialState, fundsRequested(params));
      expect(state.status).toBe('loading');
    });
  });

  describe('fundsLoaded', () => {
    it('should set funds data and status to succeeded', () => {
      const loadingState = {
        ...initialState,
        status: 'loading' as const,
      };
      const state = fundReducer(
        loadingState,
        fundsLoaded({ funds: mockFunds })
      );
      expect(state.status).toBe('succeeded');
      expect(state.data?.funds).toEqual(mockFunds);
      expect(state.error).toBeUndefined();
    });

    it('should preserve selected fund and view mode', () => {
      const stateWithSelection = {
        ...initialState,
        selectedFundId: 'fund-1',
        viewMode: 'individual' as FundViewMode,
        status: 'loading' as const,
      };
      const state = fundReducer(
        stateWithSelection,
        fundsLoaded({ funds: mockFunds })
      );
      expect(state.selectedFundId).toBe('fund-1');
      expect(state.viewMode).toBe('individual');
    });
  });

  describe('fundsFailed', () => {
    it('should set error and status to failed', () => {
      const error: NormalizedError = {
        message: 'Failed to fetch funds',
        code: 'FETCH_ERROR',
      };
      const loadingState = {
        ...initialState,
        status: 'loading' as const,
      };
      const state = fundReducer(loadingState, fundsFailed(error));
      expect(state.status).toBe('failed');
      expect(state.error).toEqual(error);
    });
  });

  describe('fundHydrated', () => {
    it('should set hydrated state with selected fund and view mode', () => {
      const state = fundReducer(
        initialState,
        fundHydrated({ selectedFundId: 'fund-1', viewMode: 'individual' })
      );
      expect(state.hydrated).toBe(true);
      expect(state.selectedFundId).toBe('fund-1');
      expect(state.viewMode).toBe('individual');
    });

    it('should handle null selectedFundId', () => {
      const state = fundReducer(
        initialState,
        fundHydrated({ selectedFundId: null, viewMode: 'consolidated' })
      );
      expect(state.hydrated).toBe(true);
      expect(state.selectedFundId).toBeNull();
    });
  });

  describe('setSelectedFundId', () => {
    it('should update selected fund id', () => {
      const state = fundReducer(initialState, setSelectedFundId('fund-2'));
      expect(state.selectedFundId).toBe('fund-2');
    });

    it('should allow setting to null', () => {
      const stateWithSelection = {
        ...initialState,
        selectedFundId: 'fund-1',
      };
      const state = fundReducer(stateWithSelection, setSelectedFundId(null));
      expect(state.selectedFundId).toBeNull();
    });
  });

  describe('setViewMode', () => {
    it('should update view mode to individual', () => {
      const state = fundReducer(initialState, setViewMode('individual'));
      expect(state.viewMode).toBe('individual');
    });

    it('should update view mode to comparison', () => {
      const state = fundReducer(initialState, setViewMode('comparison'));
      expect(state.viewMode).toBe('comparison');
    });

    it('should update view mode to consolidated', () => {
      const stateWithIndividual = {
        ...initialState,
        viewMode: 'individual' as FundViewMode,
      };
      const state = fundReducer(stateWithIndividual, setViewMode('consolidated'));
      expect(state.viewMode).toBe('consolidated');
    });
  });
});
