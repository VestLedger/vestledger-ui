'use client'

import { useEffect } from 'react';
import { PageScaffold } from '@/ui/composites';
import { Briefcase } from 'lucide-react';
import { PortfolioDashboard } from './portfolio-dashboard';
import { PortfolioDocuments } from './portfolio-documents';
import { PortfolioUpdates } from './portfolio-updates';
import { FundSelector } from './fund-selector';
import { getRouteConfig, ROUTE_PATHS } from '@/config/routes';
import { DEFAULT_PORTFOLIO_TAB_ID, PORTFOLIO_TAB_IDS } from '@/config/portfolio-tabs';
import { useUIKey } from '@/store/ui';
import { useFund } from '@/contexts/fund-context';
import { useAsyncData } from '@/hooks/useAsyncData';
import {
  portfolioSelectors,
  portfolioUpdatesRequested,
} from '@/store/slices/portfolioSlice';
import {
  getPortfolioHealthyCompanies,
  getPortfolioPageMetrics,
} from '@/services/portfolio/portfolioPageMetricsService';

export function Portfolio() {
  const { value: ui, patch: patchUI } = useUIKey('portfolio', { selected: DEFAULT_PORTFOLIO_TAB_ID });
  const { selected } = ui;
  const { selectedFund } = useFund();
  const fundId = selectedFund?.id ?? null;

  useEffect(() => {
    if (!PORTFOLIO_TAB_IDS.has(selected)) {
      patchUI({ selected: DEFAULT_PORTFOLIO_TAB_ID });
    }
  }, [patchUI, selected]);

  // Get route config for breadcrumbs and AI suggestions
  const routeConfig = getRouteConfig(ROUTE_PATHS.portfolio);

  const { isLoading } = useAsyncData(
    portfolioUpdatesRequested,
    portfolioSelectors.selectState,
    {
      params: { fundId },
      dependencies: [fundId],
    }
  );

  const pageMetrics = getPortfolioPageMetrics();
  const totalCompanies = pageMetrics.totalCompanies;
  const healthyCompanies = getPortfolioHealthyCompanies();
  const atRiskCompanies = pageMetrics.atRiskCompanies;
  const pendingUpdates = pageMetrics.pendingUpdates;
  const aiSummaryText = isLoading
    ? 'Refreshing portfolio metrics and updates...'
    : `${healthyCompanies}/${totalCompanies} companies performing well. ${atRiskCompanies} companies flagged for attention. ${pendingUpdates} unread portfolio updates require review.`;

  return (
    <PageScaffold
      breadcrumbs={routeConfig?.breadcrumbs}
      aiSuggestion={routeConfig?.aiSuggestion}
      header={{
        title: 'Portfolio',
        description: 'Track performance across your investments',
        icon: Briefcase,
        aiSummary: {
          text: aiSummaryText,
        },
        actionContent: <FundSelector />,
      }}
    >

      {/* Tab Content */}
      <div className="mt-4">
        {selected === 'overview' && <PortfolioDashboard />}
        {selected === 'updates' && <PortfolioUpdates />}
        {selected === 'documents' && <PortfolioDocuments />}
      </div>
    </PageScaffold>
  );
}
