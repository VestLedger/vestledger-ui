'use client'

import { PageScaffold } from '@/ui/composites';
import { Briefcase } from 'lucide-react';
import { PortfolioDashboard } from './portfolio-dashboard';
import { PortfolioDocuments } from './portfolio-documents';
import { PortfolioUpdates } from './portfolio-updates';
import { FundSelector } from './fund-selector';
import { getRouteConfig, ROUTE_PATHS } from '@/config/routes';
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
  const { value: ui, patch: patchUI } = useUIKey('portfolio', { selected: 'overview' });
  const { selected } = ui;
  const { selectedFund } = useFund();
  const fundId = selectedFund?.id ?? null;

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
          confidence: 0.89,
        },
        tabs: [
          {
            id: 'overview',
            label: 'Overview',
            priority: atRiskCompanies > 0 ? 'high' : undefined,
          },
          {
            id: 'updates',
            label: 'Updates',
            count: pendingUpdates,
            priority: pendingUpdates > 3 ? 'medium' : undefined,
          },
          {
            id: 'documents',
            label: 'Documents',
          },
        ],
        activeTab: selected,
        onTabChange: (tabId) => patchUI({ selected: tabId }),
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
