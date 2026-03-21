"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useCallback, useMemo } from "react";
import type {
  Fund,
  FundContextType,
  FundSummary,
  FundViewMode,
} from "@/types/fund";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fundUISelectors,
  setSelectedFundId,
  setViewMode,
} from "@/store/slices/fundSlice";
import { useUIKey } from "@/store/ui";

// ---------------------------------------------------------------------------
// Tab-scoped fund selection
// ---------------------------------------------------------------------------
// Wrap a nav tab with <TabFundScope tabKey="..."> so every useFund() call
// inside that subtree reads/writes tab-local state (via useUIKey) instead
// of the shared global fundSlice.
// ---------------------------------------------------------------------------

interface TabFundOverride {
  selectedFundId: string | null;
  viewMode: FundViewMode;
  setSelectedFundId: (id: string | null) => void;
  setViewMode: (mode: FundViewMode) => void;
}

const TabFundContext = createContext<TabFundOverride | null>(null);

export function TabFundScope({
  tabKey,
  children,
}: {
  tabKey: string;
  children: ReactNode;
}) {
  const { value: ui, patch: patchUI } = useUIKey<{
    selectedFundId: string | null;
    viewMode: FundViewMode;
  }>(`fund-scope-${tabKey}`, {
    selectedFundId: null,
    viewMode: "consolidated",
  });

  const override = useMemo<TabFundOverride>(
    () => ({
      selectedFundId: ui.selectedFundId,
      viewMode: ui.viewMode,
      setSelectedFundId: (id) => patchUI({ selectedFundId: id }),
      setViewMode: (mode) => patchUI({ viewMode: mode }),
    }),
    [ui.selectedFundId, ui.viewMode, patchUI],
  );

  return (
    <TabFundContext.Provider value={override}>
      {children}
    </TabFundContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Shared fund hook — reads from tab scope when available, else global store
// ---------------------------------------------------------------------------

export function FundProvider({ children }: { children: ReactNode }) {
  return children;
}

export function useFund() {
  const tabOverride = useContext(TabFundContext);
  const dispatch = useAppDispatch();
  const funds = useAppSelector(fundUISelectors.selectVisibleFunds);

  // Always read global so hooks are called unconditionally
  const globalSelectedFundId = useAppSelector(
    fundUISelectors.selectSelectedFundId,
  );
  const globalViewMode = useAppSelector(fundUISelectors.selectViewMode);

  // Tab scope wins when present
  const selectedFundId = tabOverride
    ? tabOverride.selectedFundId
    : globalSelectedFundId;
  const viewMode = tabOverride ? tabOverride.viewMode : globalViewMode;

  const selectedFund = useMemo(
    () =>
      selectedFundId
        ? (funds.find((f) => f.id === selectedFundId) ?? null)
        : null,
    [funds, selectedFundId],
  );

  const getActiveFunds = useCallback<FundContextType["getActiveFunds"]>(() => {
    return funds.filter((fund) => fund.status === "active");
  }, [funds]);

  const getFundById = useCallback<FundContextType["getFundById"]>(
    (id) => {
      return funds.find((fund) => fund.id === id);
    },
    [funds],
  );

  const getFundSummary = useCallback<FundContextType["getFundSummary"]>(() => {
    const activeFundsCount = funds.filter((f) => f.status === "active").length;
    const closedFundsCount = funds.filter((f) => f.status === "closed").length;

    return {
      totalFunds: funds.length,
      totalCommitment: funds.reduce((sum, f) => sum + f.totalCommitment, 0),
      totalDeployed: funds.reduce((sum, f) => sum + f.deployedCapital, 0),
      totalPortfolioValue: funds.reduce((sum, f) => sum + f.portfolioValue, 0),
      totalPortfolioCompanies: funds.reduce(
        (sum, f) => sum + f.portfolioCount,
        0,
      ),
      averageIRR:
        funds.reduce((sum, f) => sum + f.irr, 0) / Math.max(funds.length, 1),
      activeFunds: activeFundsCount,
      closedFunds: closedFundsCount,
    } satisfies FundSummary;
  }, [funds]);

  const setSelectedFund = useCallback(
    (fund: Fund | null) => {
      if (tabOverride) {
        tabOverride.setSelectedFundId(fund ? fund.id : null);
      } else {
        dispatch(setSelectedFundId(fund ? fund.id : null));
      }
    },
    [dispatch, tabOverride],
  );

  const setFundViewMode = useCallback(
    (mode: FundViewMode) => {
      if (tabOverride) {
        tabOverride.setViewMode(mode);
      } else {
        dispatch(setViewMode(mode));
      }
    },
    [dispatch, tabOverride],
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
