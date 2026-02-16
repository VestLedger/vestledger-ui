'use client'

import { useEffect } from 'react';
import { BarChart3 } from 'lucide-react';
import { FundPerformanceOverview } from './analytics/fund-performance-overview';
import { JCurveChart } from './analytics/j-curve-chart';
import { CohortAnalysis } from './analytics/cohort-analysis';
import { ValuationTrends } from './analytics/valuation-trends';
import { DeploymentPacing } from './analytics/deployment-pacing';
import { ConcentrationRisk } from './analytics/concentration-risk';
import { FundSelector } from './fund-selector';
import { ANALYTICS_TAB_IDS, DEFAULT_ANALYTICS_TAB_ID } from '@/config/analytics-tabs';
import { useUIKey } from '@/store/ui';
import { PageScaffold } from '@/ui/composites';
import { useFund } from '@/contexts/fund-context';
import { ROUTE_PATHS } from '@/config/routes';
import { useAsyncData } from '@/hooks/useAsyncData';
import { AsyncStateRenderer } from '@/ui/async-states';
import {
  analyticsRequested,
  analyticsSelectors,
} from '@/store/slices/analyticsSlice';

export function Analytics() {
  const { value: ui, patch: patchUI } = useUIKey('analytics', { selected: DEFAULT_ANALYTICS_TAB_ID });
  const { selected } = ui;
  const { selectedFund } = useFund();
  const fundId = selectedFund?.id ?? null;
  const { data, isLoading, error, refetch } = useAsyncData(
    analyticsRequested,
    analyticsSelectors.selectState,
    {
      params: { fundId },
      dependencies: [fundId],
    }
  );

  // Use fund ID as key to force re-render when fund changes
  const fundKey = fundId || 'all';

  useEffect(() => {
    if (!ANALYTICS_TAB_IDS.has(selected)) {
      patchUI({ selected: DEFAULT_ANALYTICS_TAB_ID });
    }
  }, [patchUI, selected]);

  return (
    <PageScaffold
      routePath={ROUTE_PATHS.analytics}
      header={{
        title: 'Analytics',
        description: 'Fund performance and insights',
        icon: BarChart3,
	        aiSummary: {
	          text: 'Portfolio performing 12% above target. J-curve trending positively. 3 high-potential outliers detected in cohort analysis.',
	          confidence: 0.88,
	        },
	        actionContent: (
	          <div className="w-full sm:w-64">
	            <FundSelector />
	          </div>
	        ),
      }}
    >
      <AsyncStateRenderer
        data={data}
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        loadingMessage="Loading analytics..."
        errorTitle="Failed to Load Analytics"
        isEmpty={() => false}
      >
        {() => (
          <div className="mt-4" key={fundKey}>
            {selected === 'performance' && (
              <div className="space-y-4">
                <FundPerformanceOverview key={`perf-${fundKey}`} />
                <JCurveChart key={`jcurve-${fundKey}`} />
              </div>
            )}

            {selected === 'j-curve' && (
              <div>
                <JCurveChart key={`jcurve-${fundKey}`} />
              </div>
            )}

            {selected === 'cohort' && (
              <div>
                <CohortAnalysis key={`cohort-${fundKey}`} />
              </div>
            )}

            {selected === 'valuation' && (
              <div>
                <ValuationTrends key={`valuation-${fundKey}`} />
              </div>
            )}

            {selected === 'deployment' && (
              <div>
                <DeploymentPacing key={`deployment-${fundKey}`} />
              </div>
            )}

            {selected === 'risk' && (
              <div>
                <ConcentrationRisk key={`risk-${fundKey}`} />
              </div>
            )}
          </div>
        )}
      </AsyncStateRenderer>
    </PageScaffold>
  );
}
