'use client'

import { Breadcrumb, PageHeader, PageContainer } from '@/ui';
import { Briefcase, LayoutGrid, FileText, MessageSquare } from 'lucide-react';
import { PortfolioDashboard } from './portfolio-dashboard';
import { PortfolioDocuments } from './portfolio-documents';
import { PortfolioUpdates } from './portfolio-updates';
import { FundSelector } from './fund-selector';
import { getRouteConfig } from '@/config/routes';
import { useUIKey } from '@/store/ui';
import { getPortfolioHealthyCompanies, getPortfolioPageMetrics } from '@/services/portfolio/portfolioPageMetricsService';

export function Portfolio() {
  const { value: ui, patch: patchUI } = useUIKey('portfolio', { selected: 'overview' });
  const { selected } = ui;

  // Get route config for breadcrumbs and AI suggestions
  const routeConfig = getRouteConfig('/portfolio');

  const portfolioPageMetrics = getPortfolioPageMetrics();
  const portfolioPageHealthyCompanies = getPortfolioHealthyCompanies();

  const totalCompanies = portfolioPageMetrics.totalCompanies;
  const healthyCompanies = portfolioPageHealthyCompanies;
  const atRiskCompanies = portfolioPageMetrics.atRiskCompanies;
  const pendingUpdates = portfolioPageMetrics.pendingUpdates;

  return (
    <PageContainer>
      {/* Breadcrumb Navigation */}
      {routeConfig && (
        <div className="mb-4">
          <Breadcrumb
            items={routeConfig.breadcrumbs}
            aiSuggestion={routeConfig.aiSuggestion}
          />
        </div>
      )}

      {/* Page Header with AI Summary */}
      <PageHeader
        title="Portfolio"
        description="Track performance across your investments"
        icon={Briefcase}
        aiSummary={{
          text: `${healthyCompanies}/${totalCompanies} companies performing well. ${atRiskCompanies} companies flagged for attention. ${pendingUpdates} unread portfolio updates require review.`,
          confidence: 0.89
        }}
        tabs={[
          {
            id: 'overview',
            label: 'Overview',
            priority: atRiskCompanies > 0 ? 'high' : undefined
          },
          {
            id: 'updates',
            label: 'Updates',
            count: pendingUpdates,
            priority: pendingUpdates > 3 ? 'medium' : undefined
          },
          {
            id: 'documents',
            label: 'Documents'
          }
        ]}
        activeTab={selected}
        onTabChange={(tabId) => patchUI({ selected: tabId })}
        actionContent={<FundSelector />}
      />

      {/* Tab Content */}
      <div className="mt-6">
        {selected === 'overview' && <PortfolioDashboard />}
        {selected === 'updates' && <PortfolioUpdates />}
        {selected === 'documents' && <PortfolioDocuments />}
      </div>
    </PageContainer>
  );
}
