'use client'

import { useState } from 'react';
import { Breadcrumb, PageHeader, PageContainer } from '@/ui';
import { Briefcase, LayoutGrid, FileText, MessageSquare } from 'lucide-react';
import { PortfolioDashboard } from './portfolio-dashboard';
import { PortfolioDocuments } from './portfolio-documents';
import { PortfolioUpdates } from './portfolio-updates';
import { FundSelector } from './fund-selector';
import { getRouteConfig } from '@/config/routes';

export function Portfolio() {
  const [selected, setSelected] = useState<string>('overview');

  // Get route config for breadcrumbs and AI suggestions
  const routeConfig = getRouteConfig('/portfolio');

  // Mock portfolio metrics for AI summary
  const totalCompanies = 24;
  const healthyCompanies = 18;
  const atRiskCompanies = 3;
  const pendingUpdates = 5;

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
        onTabChange={(tabId) => setSelected(tabId)}
      >
        {/* Fund Selector as child content */}
        <div className="w-full sm:w-64">
          <FundSelector />
        </div>
      </PageHeader>

      {/* Tab Content */}
      <div className="mt-6">
        {selected === 'overview' && <PortfolioDashboard />}
        {selected === 'updates' && <PortfolioUpdates />}
        {selected === 'documents' && <PortfolioDocuments />}
      </div>
    </PageContainer>
  );
}
