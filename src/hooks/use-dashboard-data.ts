'use client'

import { useState, useEffect } from 'react';
import { useFund } from '@/contexts/fund-context';
import {
  createEmptyDashboardData,
  getDashboardData,
  type DashboardData,
} from '@/services/dashboard/dashboardDataService';

/**
 * Hook to provide dashboard data for all widgets.
 *
 * Initializes synchronously with mock data for instant render, then
 * fetches live data from the API and updates state on resolution.
 * Data reacts to the selected fund from FundContext.
 */
export function useDashboardData(): DashboardData {
  const { selectedFund, viewMode, funds } = useFund();

  const [data, setData] = useState<DashboardData>(() => createEmptyDashboardData());

  useEffect(() => {
    let active = true;
    getDashboardData(selectedFund, viewMode, funds)
      .then((resolved) => {
        if (active && resolved) setData(resolved);
      })
      .catch((error) => {
        console.error('Failed to load dashboard data', error);
        if (active) setData(createEmptyDashboardData());
      });
    return () => {
      active = false;
    };
  }, [selectedFund, viewMode, funds]);

  return data;
}
