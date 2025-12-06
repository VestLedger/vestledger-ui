'use client'

import { useState } from 'react';
import { Tabs, Tab } from '@/ui';
import { TrendingUp, BarChart3, PieChart, Activity, Layers, DollarSign } from 'lucide-react';
import { FundPerformanceOverview } from './analytics/fund-performance-overview';
import { JCurveChart } from './analytics/j-curve-chart';
import { CohortAnalysis } from './analytics/cohort-analysis';
import { ValuationTrends } from './analytics/valuation-trends';
import { DeploymentPacing } from './analytics/deployment-pacing';
import { ConcentrationRisk } from './analytics/concentration-risk';

export function AnalyticsDashboard() {
  const [selected, setSelected] = useState<string>('performance');

  return (
    <div>
      <Tabs
        selectedKey={selected}
        onSelectionChange={(key) => setSelected(key as string)}
      >
        <Tab
          key="performance"
          title={
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span>Performance</span>
            </div>
          }
        >
          <div className="p-4 sm:p-6 lg:p-8 space-y-8">
            {/* Fund Performance Overview */}
            <FundPerformanceOverview />

            {/* J-Curve */}
            <JCurveChart />
          </div>
        </Tab>

        <Tab
          key="cohorts"
          title={
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4" />
              <span>Cohorts</span>
            </div>
          }
        >
          <div className="p-4 sm:p-6 lg:p-8">
            <CohortAnalysis />
          </div>
        </Tab>

        <Tab
          key="valuation"
          title={
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              <span>Valuation</span>
            </div>
          }
        >
          <div className="p-4 sm:p-6 lg:p-8">
            <ValuationTrends />
          </div>
        </Tab>

        <Tab
          key="deployment"
          title={
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              <span>Deployment</span>
            </div>
          }
        >
          <div className="p-4 sm:p-6 lg:p-8">
            <DeploymentPacing />
          </div>
        </Tab>

        <Tab
          key="concentration"
          title={
            <div className="flex items-center gap-2">
              <PieChart className="w-4 h-4" />
              <span>Concentration</span>
            </div>
          }
        >
          <div className="p-4 sm:p-6 lg:p-8">
            <ConcentrationRisk />
          </div>
        </Tab>
      </Tabs>
    </div>
  );
}
