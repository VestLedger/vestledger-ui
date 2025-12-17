'use client';

import type { ReactNode } from 'react';
import { useCallback, useMemo } from 'react';
import type { Fund, FundContextType, FundSummary, FundViewMode } from '@/types/fund';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setSelectedFundId, setViewMode } from '@/store/slices/fundSlice';

export function FundProvider({ children }: { children: ReactNode }) {
  return children;
}

export function useFund() {
  const dispatch = useAppDispatch();
  const funds = useAppSelector((state) => state.fund.data?.funds || []);
  const selectedFundId = useAppSelector((state) => state.fund.selectedFundId);
  const viewMode = useAppSelector((state) => state.fund.viewMode);

  const selectedFund = useMemo(
    () => (selectedFundId ? funds.find((f) => f.id === selectedFundId) ?? null : null),
    [funds, selectedFundId]
  );

  const getActiveFunds = useCallback<FundContextType['getActiveFunds']>(() => {
    return funds.filter((fund) => fund.status === 'active');
  }, [funds]);

  const getFundById = useCallback<FundContextType['getFundById']>(
    (id) => {
      return funds.find((fund) => fund.id === id);
    },
    [funds]
  );

  const getFundSummary = useCallback<FundContextType['getFundSummary']>(() => {
    const activeFundsCount = funds.filter((f) => f.status === 'active').length;
    const closedFundsCount = funds.filter((f) => f.status === 'closed').length;

    return {
      totalFunds: funds.length,
      totalCommitment: funds.reduce((sum, f) => sum + f.totalCommitment, 0),
      totalDeployed: funds.reduce((sum, f) => sum + f.deployedCapital, 0),
      totalPortfolioValue: funds.reduce((sum, f) => sum + f.portfolioValue, 0),
      totalPortfolioCompanies: funds.reduce((sum, f) => sum + f.portfolioCount, 0),
      averageIRR: funds.reduce((sum, f) => sum + f.irr, 0) / Math.max(funds.length, 1),
      activeFunds: activeFundsCount,
      closedFunds: closedFundsCount,
    } satisfies FundSummary;
  }, [funds]);

  const setSelectedFund = useCallback<FundContextType['setSelectedFund']>(
    (fund) => {
      dispatch(setSelectedFundId(fund ? fund.id : null));
    },
    [dispatch]
  );

  const setFundViewMode = useCallback<FundContextType['setViewMode']>(
    (mode) => {
      dispatch(setViewMode(mode as FundViewMode));
    },
    [dispatch]
  );

  return {
    funds,
    selectedFund,
    viewMode,
    setSelectedFund,
    setViewMode: setFundViewMode,
    getActiveFunds,
    getFundById,
    getFundSummary,
  };
}
