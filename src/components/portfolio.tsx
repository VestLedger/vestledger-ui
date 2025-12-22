'use client'

import { PageScaffold } from '@/components/ui';
import { Briefcase } from 'lucide-react';
import { PortfolioDashboard } from './portfolio-dashboard';
import { PortfolioDocuments } from './portfolio-documents';
import { PortfolioUpdates } from './portfolio-updates';
import { FundSelector } from './fund-selector';
import { getRouteConfig } from '@/config/routes';
import { useUIKey } from '@/store/ui';

export function Portfolio() {
  const { value: ui, patch: patchUI } = useUIKey('portfolio', { selected: 'overview' });
  const { selected } = ui;

  // Get route config for breadcrumbs and AI suggestions
  const routeConfig = getRouteConfig('/portfolio');

  // TODO: Restore metrics loading via separate metrics slice
  // For now using placeholder values since we migrated portfolio slice to handle updates only
  const totalCompanies = 12;
  const healthyCompanies = 10;
  const atRiskCompanies = 2;
  const pendingUpdates = 5;

  return (
    <PageScaffold
      breadcrumbs={routeConfig?.breadcrumbs}
      aiSuggestion={routeConfig?.aiSuggestion}
      header={{
        title: 'Portfolio',
        description: 'Track performance across your investments',
        icon: Briefcase,
        aiSummary: {
          text: `${healthyCompanies}/${totalCompanies} companies performing well. ${atRiskCompanies} companies flagged for attention. ${pendingUpdates} unread portfolio updates require review.`,
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
      <div className="mt-6">
        {selected === 'overview' && <PortfolioDashboard />}
        {selected === 'updates' && <PortfolioUpdates />}
        {selected === 'documents' && <PortfolioDocuments />}
      </div>
    </PageScaffold>
  );
}
