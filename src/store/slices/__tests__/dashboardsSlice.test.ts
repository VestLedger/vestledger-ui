import { describe, expect, it } from 'vitest';
import { Activity } from 'lucide-react';
import {
  dashboardsReducer,
  lpDashboardRequested,
  lpDashboardLoaded,
  lpDashboardFailed,
  analystDashboardRequested,
  analystDashboardLoaded,
  analystDashboardFailed,
  opsDashboardRequested,
  opsDashboardLoaded,
  opsDashboardFailed,
  auditorDashboardRequested,
  auditorDashboardLoaded,
  auditorDashboardFailed,
  irDashboardRequested,
  irDashboardLoaded,
  irDashboardFailed,
  researcherDashboardRequested,
  researcherDashboardLoaded,
  researcherDashboardFailed,
  lpDashboardSelectors,
  analystDashboardSelectors,
  opsDashboardSelectors,
  auditorDashboardSelectors,
  irDashboardSelectors,
  researcherDashboardSelectors,
  type LPDashboardData,
  type AnalystDashboardData,
  type OpsDashboardData,
  type AuditorDashboardData,
  type IRDashboardData,
  type ResearcherDashboardData,
} from '../dashboardsSlice';
import type { RootState } from '@/store/rootReducer';
import type { NormalizedError } from '@/store/types/AsyncState';

const sharedMetric = [
  {
    label: 'Coverage',
    value: '97%',
    change: '+2.4%',
    trend: 'up' as const,
    icon: Activity,
  },
];

const lpPayload: LPDashboardData = {
  metrics: sharedMetric,
  documents: [{ name: 'Q4 Letter', type: 'PDF', date: '2026-01-12' }],
  capitalActivity: [{ type: 'Capital Call', amount: '$2.4M', date: '2026-01-02', status: 'Open' }],
  pendingCalls: [],
  pendingSignatures: [],
  commitment: {
    totalCommitment: 10_000_000,
    calledAmount: 3_000_000,
  },
};

const analystPayload: AnalystDashboardData = {
  metrics: sharedMetric,
  recentDeals: [{ name: 'Acme AI', stage: 'Due Diligence', score: 88, sector: 'AI' }],
  urgentTasks: [{ task: 'Reference calls', due: 'Today', priority: 'High' }],
};

const opsPayload: OpsDashboardData = {
  metrics: sharedMetric,
  complianceAlerts: [
    {
      title: 'SEC filing',
      fund: 'Fund II',
      description: 'Quarterly filing due',
      severity: 'High',
    },
  ],
  upcomingDistributions: [{ event: 'Q1 Distribution', date: '2026-03-20', amount: '$8.2M', status: 'Scheduled' }],
};

const auditorPayload: AuditorDashboardData = {
  metrics: sharedMetric,
  auditTrail: [{ action: 'Report Generated', fund: 'Fund I', date: '2026-01-10', hash: '0xabc' }],
  complianceItems: [{ item: 'AML Review', status: 'Completed', lastCheck: '2026-01-04' }],
};

const irPayload: IRDashboardData = {
  metrics: sharedMetric,
  recentInteractions: [{ lp: 'Northbridge', type: 'Email', date: '2026-01-08', notes: 'Follow-up scheduled' }],
  upcomingTasks: [{ task: 'Send monthly update', due: 'Tomorrow', priority: 'Medium' }],
};

const researcherPayload: ResearcherDashboardData = {
  metrics: sharedMetric,
  recentReports: [{ name: 'AI Infra 2026', type: 'Market', date: '2026-01-11', status: 'Published' }],
  trendingTopics: [{ topic: 'Agentic tooling', sentiment: 'Bullish', change: '+18%' }],
};

const testError: NormalizedError = {
  message: 'Failed to fetch dashboard',
  code: 'DASHBOARD_LOAD_FAILED',
};

function asRootState(state: ReturnType<typeof dashboardsReducer>): RootState {
  return { dashboards: state } as unknown as RootState;
}

describe('dashboardsSlice', () => {
  it('returns expected initial state', () => {
    const state = dashboardsReducer(undefined, { type: '@@INIT' });
    expect(state.lp.status).toBe('idle');
    expect(state.analyst.status).toBe('idle');
    expect(state.ops.status).toBe('idle');
    expect(state.auditor.status).toBe('idle');
    expect(state.ir.status).toBe('idle');
    expect(state.researcher.status).toBe('idle');
  });

  const cases = [
    {
      key: 'lp',
      request: lpDashboardRequested,
      loaded: lpDashboardLoaded,
      failed: lpDashboardFailed,
      payload: lpPayload,
      selectors: lpDashboardSelectors,
    },
    {
      key: 'analyst',
      request: analystDashboardRequested,
      loaded: analystDashboardLoaded,
      failed: analystDashboardFailed,
      payload: analystPayload,
      selectors: analystDashboardSelectors,
    },
    {
      key: 'ops',
      request: opsDashboardRequested,
      loaded: opsDashboardLoaded,
      failed: opsDashboardFailed,
      payload: opsPayload,
      selectors: opsDashboardSelectors,
    },
    {
      key: 'auditor',
      request: auditorDashboardRequested,
      loaded: auditorDashboardLoaded,
      failed: auditorDashboardFailed,
      payload: auditorPayload,
      selectors: auditorDashboardSelectors,
    },
    {
      key: 'ir',
      request: irDashboardRequested,
      loaded: irDashboardLoaded,
      failed: irDashboardFailed,
      payload: irPayload,
      selectors: irDashboardSelectors,
    },
    {
      key: 'researcher',
      request: researcherDashboardRequested,
      loaded: researcherDashboardLoaded,
      failed: researcherDashboardFailed,
      payload: researcherPayload,
      selectors: researcherDashboardSelectors,
    },
  ] as const;

  for (const suite of cases) {
    it(`${suite.key} handles request/success/failure and selectors`, () => {
      let state = dashboardsReducer(undefined, suite.request());
      expect((state as Record<string, { status: string }>)[suite.key].status).toBe('loading');

      state = dashboardsReducer(state, suite.loaded(suite.payload));
      const root = asRootState(state);
      expect(suite.selectors.selectData(root)).toEqual(suite.payload);
      expect(suite.selectors.selectStatus(root)).toBe('succeeded');
      expect(suite.selectors.selectError(root)).toBeUndefined();
      expect(suite.selectors.selectIsLoading(root)).toBe(false);
      expect(suite.selectors.selectIsSucceeded(root)).toBe(true);
      expect(suite.selectors.selectIsFailed(root)).toBe(false);
      expect(suite.selectors.selectState(root).status).toBe('succeeded');

      state = dashboardsReducer(state, suite.failed(testError));
      const failedRoot = asRootState(state);
      expect(suite.selectors.selectStatus(failedRoot)).toBe('failed');
      expect(suite.selectors.selectError(failedRoot)).toEqual(testError);
      expect(suite.selectors.selectIsFailed(failedRoot)).toBe(true);
    });
  }
});
