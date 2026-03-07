'use client'

import { useCallback, useEffect, useRef, useState } from 'react';
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
import { AsyncStateRenderer } from '@/ui/async-states';
import { fetchFundAnalyticsSnapshot } from '@/services/analytics/fundAnalyticsService';
import type { NormalizedError } from '@/store/types/AsyncState';
import { isMockMode } from '@/config/data-mode';
import { normalizeError } from '@/store/utils/normalizeError';

type AnalyticsLoadState = {
  data: {
    fundId: string | null;
    loadedAt: string;
    source: 'mock' | 'api';
  } | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: NormalizedError | undefined;
};

export function Analytics() {
  const { value: ui, patch: patchUI } = useUIKey('analytics', { selected: DEFAULT_ANALYTICS_TAB_ID });
  const { selected } = ui;
  const { selectedFund } = useFund();
  const fundId = selectedFund?.id ?? null;
  const [loadState, setLoadState] = useState<AnalyticsLoadState>({
    data: null,
    status: 'idle',
    error: undefined,
  });
  const latestRequestIdRef = useRef(0);
  const loadAnalytics = useCallback(() => {
    const requestId = latestRequestIdRef.current + 1;
    latestRequestIdRef.current = requestId;

    setLoadState((current) => ({
      data: current.data,
      status: 'loading',
      error: undefined,
    }));

    void (async () => {
      try {
        await fetchFundAnalyticsSnapshot(fundId);
        if (latestRequestIdRef.current !== requestId) return;

        setLoadState({
          data: {
            fundId,
            loadedAt: new Date().toISOString(),
            source: isMockMode('analytics') ? 'mock' : 'api',
          },
          status: 'succeeded',
          error: undefined,
        });
      } catch (error: unknown) {
        if (latestRequestIdRef.current !== requestId) return;

        setLoadState({
          data: null,
          status: 'failed',
          error: normalizeError(error),
        });
      }
    })();
  }, [fundId]);

  // Use fund ID as key to force re-render when fund changes
  const fundKey = fundId || 'all';

  useEffect(() => {
    loadAnalytics();

    return () => {
      latestRequestIdRef.current += 1;
    };
  }, [loadAnalytics]);

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
	        },
	        actionContent: (
	          <div className="w-full sm:w-64">
	            <FundSelector />
	          </div>
	        ),
      }}
    >
      <AsyncStateRenderer
        data={loadState.data}
        isLoading={loadState.status === 'loading'}
        error={loadState.error}
        onRetry={loadAnalytics}
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
