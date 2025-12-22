'use client'

import { BarChart3 } from 'lucide-react';
import { FundPerformanceOverview } from './analytics/fund-performance-overview';
import { JCurveChart } from './analytics/j-curve-chart';
import { CohortAnalysis } from './analytics/cohort-analysis';
import { ValuationTrends } from './analytics/valuation-trends';
import { DeploymentPacing } from './analytics/deployment-pacing';
import { ConcentrationRisk } from './analytics/concentration-risk';
import { FundSelector } from './fund-selector';
import { useUIKey } from '@/store/ui';
import { PageScaffold } from '@/components/ui';

export function Analytics() {
  const { value: ui, patch: patchUI } = useUIKey('analytics', { selected: 'performance' });
  const { selected } = ui;

  return (
    <PageScaffold
      routePath="/analytics"
      header={{
        title: 'Analytics',
        description: 'Fund performance and insights',
        icon: BarChart3,
        aiSummary: {
          text: 'Portfolio performing 12% above target. J-curve trending positively. 3 high-potential outliers detected in cohort analysis.',
          confidence: 0.88,
        },
        tabs: [
          { id: 'performance', label: 'Performance' },
          { id: 'j-curve', label: 'J-Curve' },
          { id: 'cohort', label: 'Cohort Analysis' },
          { id: 'valuation', label: 'Valuation Trends' },
          { id: 'deployment', label: 'Deployment' },
          { id: 'risk', label: 'Risk Analysis' },
        ],
        activeTab: selected,
        onTabChange: (tabId) => patchUI({ selected: tabId }),
        actionContent: (
          <div className="w-full sm:w-64">
            <FundSelector />
          </div>
        ),
      }}
    >
      <div className="mt-6">
        {selected === 'performance' && (
          <div className="space-y-8">
            <FundPerformanceOverview />
            <JCurveChart />
          </div>
        )}

        {selected === 'j-curve' && (
          <div>
            <JCurveChart />
          </div>
        )}

        {selected === 'cohort' && (
          <div>
            <CohortAnalysis />
          </div>
        )}

        {selected === 'valuation' && (
          <div>
            <ValuationTrends />
          </div>
        )}

        {selected === 'deployment' && (
          <div>
            <DeploymentPacing />
          </div>
        )}

        {selected === 'risk' && (
          <div>
            <ConcentrationRisk />
          </div>
        )}
      </div>
    </PageScaffold>
  );
}
