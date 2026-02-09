'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useMemo } from 'react';
import { DASHBOARD_DENSITY, type DashboardDensityMode, type DashboardDensityScale } from '@/config/dashboard-density';

const DashboardDensityContext = createContext<DashboardDensityScale>(DASHBOARD_DENSITY.comfortable);

interface DashboardDensityProviderProps {
  mode: DashboardDensityMode;
  children: ReactNode;
}

export function DashboardDensityProvider({ mode, children }: DashboardDensityProviderProps) {
  const value = useMemo(() => DASHBOARD_DENSITY[mode], [mode]);

  return (
    <DashboardDensityContext.Provider value={value}>
      {children}
    </DashboardDensityContext.Provider>
  );
}

export function useDashboardDensity() {
  return useContext(DashboardDensityContext);
}

