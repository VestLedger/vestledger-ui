'use client'

import { useUIKey } from '@/store/ui';
import { CheckCircle2, Clock, Eye, FileText, Users, DollarSign, BarChart, Upload, Download, Search, Filter, TrendingUp, AlertCircle, ArrowLeft, Brain } from 'lucide-react';
import { Card, Badge, Progress, Button, Tabs, Tab, PageContainer } from '@/ui';
import { CompanySearch } from './deal-intelligence/company-search';
import { dealIntelligenceRequested, dealIntelligenceSelectors } from '@/store/slices/dealIntelligenceSlice';
import { LoadingState, ErrorState, EmptyState } from '@/components/ui/async-states';
import { UI_STATE_KEYS, UI_STATE_DEFAULTS } from '@/store/constants/uiStateKeys';
import { useAsyncData } from '@/hooks/useAsyncData';
import { PageScaffold, SearchToolbar, StatusBadge } from '@/components/ui';
import {
  type ActiveDeal,
  type Document,
} from '@/services/dealIntelligence/dealIntelligenceService';

export function DealIntelligence() {
  const { data, isLoading, error, refetch } = useAsyncData(dealIntelligenceRequested, dealIntelligenceSelectors.selectState, { params: {} });

  // Use UI state constants
  const { value: ui, patch: patchUI } = useUIKey(
    UI_STATE_KEYS.DEAL_INTELLIGENCE,
    UI_STATE_DEFAULTS.dealIntelligence
  );
  const { viewMode, selectedDeal, searchQuery, selectedCategory } = ui;

  // Loading state
  if (isLoading) {
    return <LoadingState message="Loading deal intelligence..." />;
  }

  // Error state
  if (error) {
    return (
      <ErrorState
        error={error}
        title="Failed to Load Deal Intelligence"
        onRetry={refetch}
      />
    );
  }

  // Empty state
  if (!data) {
    return <EmptyState icon={Brain} title="No deal intelligence data available" />;
  }

  // Destructure with proper types
  const activeDeals = data?.activeDeals || [];
  const dealAnalyticsData = data?.dealAnalyticsData || [];
  const documentCategories = data?.documentCategories || [];
  const fundAnalytics = data?.fundAnalytics || {
    dealFlowMetrics: { activeDeals: 0, avgTimeInDD: 0, ddToICConversionRate: 0, readyForIC: 0 },
    dealDistribution: { byStage: [], bySector: [] },
    ddProgress: { avgCompletion: 0, onTrack: 0, atRisk: 0, blocked: 0 }
  };
  const documents: Document[] = data?.documents || [];

  const handleDealClick = (deal: ActiveDeal) => {
    patchUI({ selectedDeal: deal, viewMode: 'per-deal' });
  };

  const handleBackToFundView = () => {
    patchUI({ viewMode: 'fund-level', selectedDeal: null });
  };

  const filteredDocuments = documents.filter((doc) => {
    const matchesDeal = !selectedDeal || doc.dealId === selectedDeal.id;
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    const matchesSearch = searchQuery === '' ||
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.dealName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDeal && matchesCategory && matchesSearch;
  });

  const dealsReadyForIC = activeDeals.filter((d) => d.icStatus === 'ready-for-ic').length;
  const dealsInProgress = activeDeals.filter((d) => d.icStatus === 'dd-in-progress').length;
  const overdueDocuments = documents.filter((d) => d.status === 'overdue').length;
  const pendingReviews = documents.filter((d) => d.status === 'pending').length;

  // Fund-Level View
  if (viewMode === 'fund-level') {
    return (
      <PageScaffold
        routePath="/deal-intelligence"
        header={{
          title: 'Deal Intelligence',
          description: 'Track due diligence progress and documentation across your deal pipeline',
          icon: Brain,
          aiSummary: {
            text: `${dealsReadyForIC} deals ready for IC. ${overdueDocuments} overdue documents need immediate attention. ${dealsInProgress} deals in active DD. Average DD completion: ${fundAnalytics.ddProgress.avgCompletion}%.`,
            confidence: 0.93,
          },
          tabs: [
            {
              id: 'fund-level',
              label: 'Fund Overview',
              count: fundAnalytics.ddProgress.atRisk,
              priority: fundAnalytics.ddProgress.atRisk > 0 ? 'high' : undefined,
            },
          ],
          activeTab: 'fund-level',
        }}
      >

        {/* Fund Analytics Summary */}
        <div className="mb-8">
          <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
            <BarChart className="w-5 h-5 text-[var(--app-primary)]" />
            Fund Analytics
          </h3>

          {/* Deal Flow Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card padding="md">
              <div className="text-sm text-[var(--app-text-muted)] mb-1">Active Deals</div>
              <div className="text-3xl font-medium text-[var(--app-primary)]">{fundAnalytics.dealFlowMetrics.activeDeals}</div>
              <div className="text-xs text-[var(--app-text-subtle)] mt-1">in due diligence</div>
            </Card>
            <Card padding="md">
              <div className="text-sm text-[var(--app-text-muted)] mb-1">Avg Time in DD</div>
              <div className="text-3xl font-medium text-[var(--app-primary)]">{fundAnalytics.dealFlowMetrics.avgTimeInDD}</div>
              <div className="text-xs text-[var(--app-text-subtle)] mt-1">days</div>
            </Card>
            <Card padding="md">
              <div className="text-sm text-[var(--app-text-muted)] mb-1">DD-to-IC Rate</div>
              <div className="text-3xl font-medium text-[var(--app-primary)]">{fundAnalytics.dealFlowMetrics.ddToICConversionRate}%</div>
              <div className="text-xs text-[var(--app-text-subtle)] mt-1">conversion</div>
            </Card>
            <Card padding="md">
              <div className="text-sm text-[var(--app-text-muted)] mb-1">Ready for IC</div>
              <div className="text-3xl font-medium text-[var(--app-success)]">{fundAnalytics.dealFlowMetrics.readyForIC}</div>
              <div className="text-xs text-[var(--app-text-subtle)] mt-1">deals</div>
            </Card>
          </div>

          {/* Deal Distribution and DD Progress */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Deals by Stage */}
            <Card padding="md">
              <h4 className="text-sm font-medium mb-4">Deals by Stage</h4>
              <div className="space-y-3">
                {fundAnalytics.dealDistribution.byStage.map((item) => (
                  <div key={item.stage}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-[var(--app-text-muted)]">{item.stage}</span>
                      <span className="font-medium">{item.count}</span>
                    </div>
                    <div className="w-full bg-[var(--app-surface-hover)] rounded-full h-2">
                      <div
                        className="bg-[var(--app-primary)] h-2 rounded-full transition-all"
                        style={{ width: `${(item.count / fundAnalytics.dealFlowMetrics.activeDeals) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Deals by Sector */}
            <Card padding="md">
              <h4 className="text-sm font-medium mb-4">Deals by Sector</h4>
              <div className="space-y-3">
                {fundAnalytics.dealDistribution.bySector.map((item) => (
                  <div key={item.sector}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-[var(--app-text-muted)]">{item.sector}</span>
                      <span className="font-medium">{item.count}</span>
                    </div>
                    <div className="w-full bg-[var(--app-surface-hover)] rounded-full h-2">
                      <div
                        className="bg-[var(--app-accent)] h-2 rounded-full transition-all"
                        style={{ width: `${(item.count / fundAnalytics.dealFlowMetrics.activeDeals) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* DD Progress Overview */}
            <Card padding="md">
              <h4 className="text-sm font-medium mb-4">DD Progress Overview</h4>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-[var(--app-text-muted)]">Avg Completion</span>
                    <span className="font-medium text-[var(--app-primary)]">{fundAnalytics.ddProgress.avgCompletion}%</span>
                  </div>
                  <Progress
                    value={fundAnalytics.ddProgress.avgCompletion}
                    size="sm"
                    aria-label={`Average DD completion ${fundAnalytics.ddProgress.avgCompletion}%`}
                    classNames={{
                      base: "h-2",
                      track: "bg-[var(--app-surface-hover)]",
                      indicator: "bg-[var(--app-primary)]"
                    }}
                  />
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--app-success)]">● On Track</span>
                    <span className="font-medium">{fundAnalytics.ddProgress.onTrack} deals</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--app-warning)]">● At Risk</span>
                    <span className="font-medium">{fundAnalytics.ddProgress.atRisk} deals</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--app-danger)]">● Blocked</span>
                    <span className="font-medium">{fundAnalytics.ddProgress.blocked} deal</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* DD Status Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card padding="md" className="border-[var(--app-border)]">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-[var(--app-success)]" />
              <div>
                <div className="text-2xl font-medium">{dealsReadyForIC}</div>
                <div className="text-sm text-[var(--app-text-muted)]">Ready for IC</div>
              </div>
            </div>
          </Card>
          <Card padding="md" className="border-[var(--app-border)]">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-[var(--app-info)]" />
              <div>
                <div className="text-2xl font-medium">{dealsInProgress}</div>
                <div className="text-sm text-[var(--app-text-muted)]">DD In Progress</div>
              </div>
            </div>
          </Card>
          <Card padding="md" className="border-[var(--app-border)]">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-[var(--app-danger)]" />
              <div>
                <div className="text-2xl font-medium">{overdueDocuments}</div>
                <div className="text-sm text-[var(--app-text-muted)]">Overdue Documents</div>
              </div>
            </div>
          </Card>
          <Card padding="md" className="border-[var(--app-border)]">
            <div className="flex items-center gap-3">
              <Eye className="w-5 h-5 text-[var(--app-warning)]" />
              <div>
                <div className="text-2xl font-medium">{pendingReviews}</div>
                <div className="text-sm text-[var(--app-text-muted)]">Pending Reviews</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Active Deals Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Search className="w-5 h-5 text-[var(--app-primary)]" />
              AI Deal Sourcing
            </h3>
            <Badge size="sm" variant="flat" className="bg-[var(--app-success-bg)] text-[var(--app-success)]">
              New Leads
            </Badge>
          </div>
          <CompanySearch />
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[var(--app-primary)]" />
              Active Deals - Due Diligence
            </h3>
            <Button
              variant="flat"
              size="sm"
              startContent={<Upload className="w-4 h-4" />}
              className="bg-[var(--app-primary-bg)] text-[var(--app-primary)]"
            >
              Upload Document
            </Button>
          </div>

          {/* Active Deals Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {activeDeals.map((deal) => (
              <Card
                key={deal.id}
                isPressable
                onPress={() => handleDealClick(deal)}
                padding="md"
                className="cursor-pointer hover:border-[var(--app-primary)] transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-medium mb-1">{deal.name}</h4>
                    <div className="flex gap-2 mb-2">
                      <Badge size="sm" variant="flat" className="bg-[var(--app-surface-hover)]">
                        {deal.stage}
                      </Badge>
                      <StatusBadge status={deal.icStatus} domain="deal-intel" size="sm" showIcon />
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--app-text-muted)]">DD Progress</span>
                    <span className="font-medium">{deal.progress}%</span>
                  </div>
                  <Progress
                    value={deal.progress}
                    size="sm"
                    aria-label={`${deal.name} DD progress ${deal.progress}%`}
                    classNames={{
                      base: "h-2",
                      track: "bg-[var(--app-surface-hover)]",
                      indicator: "bg-[var(--app-primary)]"
                    }}
                  />
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="text-[var(--app-text-muted)] font-medium mb-1">Document Completion:</div>
                  {deal.categoryProgress.map((cat) => (
                    <div key={cat.category} className="flex items-center justify-between gap-2">
                      <span className="text-[var(--app-text-muted)] capitalize">{cat.category}:</span>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={cat.status} domain="deal-intel" size="sm" />
                        <span className="font-medium">{cat.completed}/{cat.total}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </PageScaffold>
    );
  }

  // Per-Deal View
  if (viewMode === 'per-deal' && selectedDeal) {
    return (
      <PageContainer>
        {/* Back Button */}
        <Button
          variant="flat"
          size="sm"
          startContent={<ArrowLeft className="w-4 h-4" />}
          onPress={handleBackToFundView}
          className="mb-6"
        >
          Back to Fund View
        </Button>

        {/* Deal Header */}
        <div className="mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl sm:text-3xl mb-2">{selectedDeal.name}</h2>
              <div className="flex gap-2 mb-2">
                <Badge size="sm" variant="flat" className="bg-[var(--app-surface-hover)]">
                  {selectedDeal.stage}
                </Badge>
                <Badge size="sm" variant="flat" className="bg-[var(--app-surface-hover)]">
                  {selectedDeal.sector}
                </Badge>
                <StatusBadge status={selectedDeal.icStatus} domain="deal-intel" size="sm" showIcon />
              </div>
              <div className="flex gap-4 text-sm text-[var(--app-text-muted)]">
                <span>Amount: {selectedDeal.amount}</span>
                <span>•</span>
                <span>Founder: {selectedDeal.founder}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-[var(--app-text-muted)]">DD Progress</div>
              <div className="text-3xl font-medium text-[var(--app-primary)]">{selectedDeal.progress}%</div>
            </div>
          </div>

          <Progress
            value={selectedDeal.progress}
            size="md"
            aria-label={`${selectedDeal.name} overall DD progress ${selectedDeal.progress}%`}
            classNames={{
              base: "h-3",
              track: "bg-[var(--app-surface-hover)]",
              indicator: "bg-[var(--app-primary)]"
            }}
          />
        </div>

        {/* Tabs */}
        <Tabs aria-label="Deal Intelligence Tabs" variant="underlined" classNames={{ tabList: "mb-6" }}>
          <Tab key="overview" title="Overview & Status">

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* DD Progress by Category */}
              <Card padding="md">
                <h3 className="text-lg font-medium mb-4">Due Diligence Progress</h3>
                <div className="space-y-4">
                  {selectedDeal.categoryProgress.map((cat) => {
                    const categoryInfo = documentCategories.find((c) => c.id === cat.category);
                    const CategoryIcon = categoryInfo?.icon || FileText;
                    const percentage = (cat.completed / cat.total) * 100;

                    return (
                      <div key={cat.category}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <CategoryIcon className="w-4 h-4 text-[var(--app-primary)]" />
                            <span className="text-sm font-medium capitalize">{cat.category}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <StatusBadge status={cat.status} domain="deal-intel" size="sm" />
                            <span className="text-sm font-medium">{cat.completed}/{cat.total}</span>
                          </div>
                        </div>
                        <Progress
                          value={percentage}
                          size="sm"
                          aria-label={`${cat.category} category ${percentage.toFixed(0)}% complete`}
                          classNames={{
                            base: "h-2",
                            track: "bg-[var(--app-surface-hover)]",
                            indicator: cat.status === 'completed' ? 'bg-[var(--app-success)]' :
                                       cat.status === 'overdue' ? 'bg-[var(--app-danger)]' :
                                       'bg-[var(--app-warning)]'
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* Key Metrics */}
              <Card padding="md">
                <h3 className="text-lg font-medium mb-4">Key Metrics</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-2 border-b border-[var(--app-border)]">
                    <span className="text-sm text-[var(--app-text-muted)]">Investment Amount</span>
                    <span className="font-medium">{selectedDeal.amount}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-[var(--app-border)]">
                    <span className="text-sm text-[var(--app-text-muted)]">Stage</span>
                    <span className="font-medium">{selectedDeal.stage}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-[var(--app-border)]">
                    <span className="text-sm text-[var(--app-text-muted)]">Sector</span>
                    <span className="font-medium">{selectedDeal.sector}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-[var(--app-border)]">
                    <span className="text-sm text-[var(--app-text-muted)]">Total Documents</span>
                    <span className="font-medium">{selectedDeal.docsCount}</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-[var(--app-text-muted)]">IC Status</span>
                    <StatusBadge status={selectedDeal.icStatus} domain="deal-intel" size="sm" showIcon />
                  </div>
                </div>
              </Card>
            </div>
          </Tab>

          <Tab key="analytics" title="Deal Analytics">
            {(() => {
              const analytics = dealAnalyticsData.find((d) => d.dealId === selectedDeal.id);
              if (!analytics) {
                return (
                  <Card padding="md">
                    <div className="text-center py-12 text-[var(--app-text-muted)]">
                      <BarChart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Analytics data not available for this deal</p>
                    </div>
                  </Card>
                );
              }

              return (
                <div className="space-y-6">
                  {/* Financial Metrics */}
                  <div>
                    <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-[var(--app-primary)]" />
                      Financial Metrics
                    </h3>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      {/* Revenue Metrics */}
                      <Card padding="md">
                        <h4 className="text-sm font-medium text-[var(--app-text-muted)] mb-3">Revenue</h4>
                        <div className="space-y-3">
                          <div>
                            <div className="text-xs text-[var(--app-text-subtle)]">ARR</div>
                            <div className="text-2xl font-medium text-[var(--app-primary)]">
                              ${(analytics.financial.revenue.arr / 1000000).toFixed(1)}M
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-[var(--app-text-subtle)]">MRR</div>
                            <div className="text-xl font-medium">
                              ${(analytics.financial.revenue.mrr / 1000).toFixed(0)}K
                            </div>
                          </div>
                          <div className="flex justify-between text-sm pt-2 border-t border-[var(--app-border)]">
                            <span className="text-[var(--app-text-muted)]">MoM Growth</span>
                            <span className="font-medium text-[var(--app-success)]">+{analytics.financial.revenue.growthRateMoM}%</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-[var(--app-text-muted)]">YoY Growth</span>
                            <span className="font-medium text-[var(--app-success)]">+{analytics.financial.revenue.growthRateYoY}%</span>
                          </div>
                        </div>
                      </Card>

                      {/* Efficiency Metrics */}
                      <Card padding="md">
                        <h4 className="text-sm font-medium text-[var(--app-text-muted)] mb-3">Efficiency</h4>
                        <div className="space-y-3">
                          <div>
                            <div className="text-xs text-[var(--app-text-subtle)]">Burn Rate</div>
                            <div className="text-2xl font-medium text-[var(--app-warning)]">
                              ${(analytics.financial.efficiency.burnRate / 1000).toFixed(0)}K
                            </div>
                            <div className="text-xs text-[var(--app-text-subtle)]">per month</div>
                          </div>
                          <div>
                            <div className="text-xs text-[var(--app-text-subtle)]">Runway</div>
                            <div className="text-xl font-medium">
                              {analytics.financial.efficiency.runway} months
                            </div>
                          </div>
                          <div className="flex justify-between text-sm pt-2 border-t border-[var(--app-border)]">
                            <span className="text-[var(--app-text-muted)]">CAC</span>
                            <span className="font-medium">${analytics.financial.efficiency.cac}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-[var(--app-text-muted)]">LTV</span>
                            <span className="font-medium">${(analytics.financial.efficiency.ltv / 1000).toFixed(1)}K</span>
                          </div>
                          <div className="flex justify-between text-sm font-medium">
                            <span className="text-[var(--app-text-muted)]">LTV:CAC</span>
                            <span className="text-[var(--app-success)]">{analytics.financial.efficiency.ltvCacRatio.toFixed(1)}x</span>
                          </div>
                        </div>
                      </Card>

                      {/* Unit Economics */}
                      <Card padding="md">
                        <h4 className="text-sm font-medium text-[var(--app-text-muted)] mb-3">Unit Economics</h4>
                        <div className="space-y-3">
                          <div>
                            <div className="text-xs text-[var(--app-text-subtle)]">Gross Margin</div>
                            <div className="text-2xl font-medium text-[var(--app-primary)]">
                              {analytics.financial.unitEconomics.grossMargin}%
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-[var(--app-text-subtle)]">Contribution Margin</div>
                            <div className="text-xl font-medium">
                              {analytics.financial.unitEconomics.contributionMargin}%
                            </div>
                          </div>
                          <div className="flex justify-between text-sm pt-2 border-t border-[var(--app-border)]">
                            <span className="text-[var(--app-text-muted)]">Payback Period</span>
                            <span className="font-medium">{analytics.financial.unitEconomics.paybackPeriod} mo</span>
                          </div>
                        </div>
                      </Card>
                    </div>
                  </div>

                  {/* Market Analytics */}
                  <div>
                    <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                      <BarChart className="w-5 h-5 text-[var(--app-primary)]" />
                      Market Analytics
                    </h3>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {/* Market Size */}
                      <Card padding="md">
                        <h4 className="text-sm font-medium text-[var(--app-text-muted)] mb-4">Market Size</h4>
                        <div className="space-y-4">
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-[var(--app-text-muted)]">TAM</span>
                              <span className="text-xl font-medium text-[var(--app-primary)]">${analytics.market.marketSize.tam}B</span>
                            </div>
                            <div className="w-full bg-[var(--app-surface-hover)] rounded-full h-3">
                              <div className="bg-[var(--app-primary)] h-3 rounded-full" style={{ width: '100%' }} />
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-[var(--app-text-muted)]">SAM</span>
                              <span className="text-lg font-medium">${analytics.market.marketSize.sam}B</span>
                            </div>
                            <div className="w-full bg-[var(--app-surface-hover)] rounded-full h-3">
                              <div className="bg-[var(--app-accent)] h-3 rounded-full"
                                style={{ width: `${(analytics.market.marketSize.sam / analytics.market.marketSize.tam) * 100}%` }}
                              />
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-[var(--app-text-muted)]">SOM (3-year)</span>
                              <span className="text-lg font-medium">${analytics.market.marketSize.som}M</span>
                            </div>
                            <div className="w-full bg-[var(--app-surface-hover)] rounded-full h-3">
                              <div className="bg-[var(--app-success)] h-3 rounded-full"
                                style={{ width: `${(analytics.market.marketSize.som / (analytics.market.marketSize.sam * 1000)) * 100}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </Card>

                      {/* Customer Metrics */}
                      <Card padding="md">
                        <h4 className="text-sm font-medium text-[var(--app-text-muted)] mb-4">Customer Metrics</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-[var(--app-text-muted)]">Total Customers</span>
                            <span className="text-xl font-medium text-[var(--app-primary)]">
                              {analytics.market.customers.totalCustomers.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-[var(--app-text-muted)]">NPS Score</span>
                            <span className="text-xl font-medium text-[var(--app-success)]">
                              {analytics.market.customers.nps}
                            </span>
                          </div>
                          <div className="flex justify-between items-center pt-2 border-t border-[var(--app-border)]">
                            <span className="text-sm text-[var(--app-text-muted)]">Monthly Churn</span>
                            <span className="font-medium">{analytics.market.customers.churnRate}%</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-[var(--app-text-muted)]">Net Revenue Retention</span>
                            <span className="text-lg font-medium text-[var(--app-success)]">
                              {analytics.market.customers.nrr}%
                            </span>
                          </div>
                        </div>
                      </Card>
                    </div>
                  </div>

                  {/* Team Metrics */}
                  <div>
                    <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                      <Users className="w-5 h-5 text-[var(--app-primary)]" />
                      Team & Execution
                    </h3>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <Card padding="md">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-[var(--app-text-muted)]">Team Size</span>
                          <span className="text-3xl font-medium text-[var(--app-primary)]">
                            {analytics.team.size}
                          </span>
                        </div>
                        <div className="text-xs text-[var(--app-text-subtle)]">employees</div>
                      </Card>

                      <Card padding="md">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-[var(--app-text-muted)]">Founder Experience</span>
                          <span className="text-3xl font-medium text-[var(--app-primary)]">
                            {analytics.team.founderExperienceScore}/10
                          </span>
                        </div>
                        <div className="w-full bg-[var(--app-surface-hover)] rounded-full h-2 mt-2">
                          <div
                            className="bg-[var(--app-primary)] h-2 rounded-full"
                            style={{ width: `${analytics.team.founderExperienceScore * 10}%` }}
                          />
                        </div>
                      </Card>
                    </div>
                  </div>
                </div>
              );
            })()}
          </Tab>

          <Tab key="documents" title="DD Documents">
            <div>
              {/* Search and Filter */}
              <div className="mb-6">
                <SearchToolbar
                  searchValue={searchQuery}
                  onSearchChange={(value) => patchUI({ searchQuery: value })}
                  searchPlaceholder="Search documents..."
                  rightActions={(
                    <Button
                      variant="flat"
                      startContent={<Filter className="w-4 h-4" />}
                    >
                      Filter by Category
                    </Button>
                  )}
                />
              </div>

              {/* Document Categories Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                {documentCategories.map((category) => {
                  const CategoryIcon = category.icon;
                  const count = documents.filter((d) => d.dealId === selectedDeal.id && d.category === category.id).length;
                  return (
                    <Card
                      key={category.id}
                      padding="sm"
                      className="hover:border-[var(--app-border-subtle)] transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <CategoryIcon className="w-4 h-4 text-[var(--app-primary)]" />
                        <span className="text-sm font-medium">{category.name}</span>
                      </div>
                      <div className="text-2xl font-medium">{count}</div>
                      <div className="text-xs text-[var(--app-text-muted)]">documents</div>
                    </Card>
                  );
                })}
              </div>

              {/* Document Library */}
              <Card padding="md">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium">Document Library</h3>
                  <div className="flex gap-2">
                    <Button
                      variant="flat"
                      size="sm"
                      startContent={<Download className="w-4 h-4" />}
                    >
                      Export
                    </Button>
                    <Button
                      variant="flat"
                      size="sm"
                      startContent={<Upload className="w-4 h-4" />}
                      className="bg-[var(--app-primary-bg)] text-[var(--app-primary)]"
                    >
                      Upload
                    </Button>
                  </div>
                </div>

                {filteredDocuments.length === 0 ? (
                  <div className="text-center py-12 text-[var(--app-text-muted)]">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No documents found matching your criteria</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredDocuments.map((doc) => (
                      <Card
                        key={doc.id}
                        padding="sm"
                        className="hover:bg-[var(--app-surface-hover)] transition-colors cursor-pointer"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <FileText className="w-4 h-4 text-[var(--app-text-subtle)]" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-sm truncate">{doc.name}</span>
                                <StatusBadge status={doc.status} domain="deal-intel" size="sm" />
                              </div>
                              <div className="flex items-center gap-2 text-xs text-[var(--app-text-muted)]">
                                <span className="capitalize">{doc.category}</span>
                                {doc.uploadedBy && (
                                  <>
                                    <span>•</span>
                                    <span>{doc.uploadedBy}</span>
                                  </>
                                )}
                                {doc.uploadedDate && (
                                  <>
                                    <span>•</span>
                                    <span>{doc.uploadedDate}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            {doc.size && (
                              <span className="text-xs text-[var(--app-text-muted)] hidden sm:inline">{doc.size}</span>
                            )}
                            <div className="flex gap-1">
                              <Button variant="light" size="sm" isIconOnly>
                                <Eye className="w-4 h-4" />
                              </Button>
                              {doc.size && (
                                <Button variant="light" size="sm" isIconOnly>
                                  <Download className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </Tab>

          <Tab key="analysis" title="Analysis & Insights">
            <Card padding="md">
              <div className="text-center py-12 text-[var(--app-text-muted)]">
                <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Investment thesis and analysis coming soon</p>
              </div>
            </Card>
          </Tab>

          <Tab key="ic-materials" title="IC Materials">
            <Card padding="md">
              <div className="text-center py-12 text-[var(--app-text-muted)]">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Investment Committee materials coming soon</p>
              </div>
            </Card>
          </Tab>
        </Tabs>
      </PageContainer>
    );
  }

  return null;
}
