'use client'

import { useState } from 'react';
import { CheckCircle2, Circle, Clock, Eye, FileText, Users, DollarSign, BarChart, Upload, Download, Search, Filter, TrendingUp, AlertCircle, ArrowLeft, Lightbulb } from 'lucide-react';
import { Card, Badge, Progress, Button, Input } from '@/ui';
import { Tabs, Tab } from '@/ui';
import { useFund } from '@/contexts/fund-context';

type DocumentCategory =
  | 'financial'
  | 'legal'
  | 'market'
  | 'team'
  | 'technical';

type DocumentStatus = 'completed' | 'in-progress' | 'pending' | 'overdue';
type ICStatus = 'ready-for-ic' | 'dd-in-progress' | 'docs-overdue' | 'blocked';

interface CategoryProgress {
  category: DocumentCategory;
  completed: number;
  total: number;
  status: 'completed' | 'in-progress' | 'overdue';
}

interface ActiveDeal {
  id: number;
  name: string;
  stage: string;
  sector: string;
  amount: string;
  founder: string;
  progress: number;
  docsCount: number;
  icStatus: ICStatus;
  categoryProgress: CategoryProgress[];
}

interface Document {
  id: number;
  name: string;
  category: DocumentCategory;
  status: DocumentStatus;
  dealId: number;
  dealName: string;
  uploadedBy?: string;
  uploadedDate?: string;
  size?: string;
}

// Fund-level analytics data structure
interface FundAnalytics {
  dealFlowMetrics: {
    activeDeals: number;
    avgTimeInDD: number; // days
    ddToICConversionRate: number; // percentage
    readyForIC: number;
  };
  dealDistribution: {
    byStage: { stage: string; count: number }[];
    bySector: { sector: string; count: number }[];
    bySize: { range: string; count: number }[];
  };
  ddProgress: {
    avgCompletion: number; // percentage
    onTrack: number;
    atRisk: number;
    blocked: number;
  };
}

// Per-deal analytics data structure
interface DealAnalytics {
  dealId: number;
  financial: {
    revenue: {
      arr: number;
      mrr: number;
      growthRateMoM: number;
      growthRateYoY: number;
    };
    efficiency: {
      burnRate: number;
      runway: number; // months
      cac: number;
      ltv: number;
      ltvCacRatio: number;
    };
    unitEconomics: {
      grossMargin: number;
      contributionMargin: number;
      paybackPeriod: number; // months
    };
  };
  market: {
    marketSize: {
      tam: number; // in billions
      sam: number; // in billions
      som: number; // in millions
    };
    customers: {
      totalCustomers: number;
      nps: number;
      churnRate: number; // monthly %
      nrr: number; // net revenue retention %
    };
  };
  team: {
    size: number;
    founderExperienceScore: number; // 1-10
  };
}

// Pre-investment deals with DD in progress
const activeDeals: ActiveDeal[] = [
  {
    id: 1,
    name: 'Quantum AI',
    stage: 'Series A',
    sector: 'AI/ML',
    amount: '$2.5M',
    founder: 'Sarah Chen',
    progress: 75,
    docsCount: 24,
    icStatus: 'dd-in-progress',
    categoryProgress: [
      { category: 'financial', completed: 5, total: 5, status: 'completed' },
      { category: 'market', completed: 3, total: 4, status: 'in-progress' },
      { category: 'legal', completed: 2, total: 3, status: 'in-progress' },
      { category: 'team', completed: 3, total: 3, status: 'completed' },
      { category: 'technical', completed: 1, total: 4, status: 'overdue' },
    ]
  },
  {
    id: 2,
    name: 'NeuroLink',
    stage: 'Seed',
    sector: 'MedTech',
    amount: '$1.2M',
    founder: 'Alex Martinez',
    progress: 45,
    docsCount: 18,
    icStatus: 'docs-overdue',
    categoryProgress: [
      { category: 'financial', completed: 3, total: 4, status: 'in-progress' },
      { category: 'market', completed: 2, total: 3, status: 'in-progress' },
      { category: 'legal', completed: 1, total: 3, status: 'overdue' },
      { category: 'team', completed: 2, total: 2, status: 'completed' },
      { category: 'technical', completed: 0, total: 3, status: 'overdue' },
    ]
  },
  {
    id: 3,
    name: 'CloudScale',
    stage: 'Series B',
    sector: 'SaaS',
    amount: '$5.0M',
    founder: 'Maria Rodriguez',
    progress: 90,
    docsCount: 31,
    icStatus: 'ready-for-ic',
    categoryProgress: [
      { category: 'financial', completed: 6, total: 6, status: 'completed' },
      { category: 'market', completed: 4, total: 4, status: 'completed' },
      { category: 'legal', completed: 4, total: 4, status: 'completed' },
      { category: 'team', completed: 3, total: 3, status: 'completed' },
      { category: 'technical', completed: 5, total: 5, status: 'completed' },
    ]
  },
];

// Pre-investment documents only
const mockDocuments: Document[] = [
  { id: 1, name: 'Financial Statements (2021-2024)', category: 'financial', status: 'completed', dealId: 1, dealName: 'Quantum AI', uploadedBy: 'Sarah Chen', uploadedDate: 'Nov 18, 2024', size: '2.4 MB' },
  { id: 2, name: 'Cap Table Analysis', category: 'financial', status: 'completed', dealId: 1, dealName: 'Quantum AI', uploadedBy: 'Mike Johnson', uploadedDate: 'Nov 19, 2024', size: '856 KB' },
  { id: 3, name: 'Market Size Report', category: 'market', status: 'completed', dealId: 1, dealName: 'Quantum AI', uploadedBy: 'Emma Davis', uploadedDate: 'Nov 17, 2024', size: '3.1 MB' },
  { id: 4, name: 'IP Portfolio Review', category: 'legal', status: 'in-progress', dealId: 1, dealName: 'Quantum AI', uploadedBy: 'Legal Team', uploadedDate: 'Nov 20, 2024', size: '1.2 MB' },
  { id: 5, name: 'Reference Call Notes', category: 'team', status: 'in-progress', dealId: 2, dealName: 'NeuroLink', uploadedBy: 'Alex Martinez', uploadedDate: 'Nov 21, 2024', size: '245 KB' },
  { id: 6, name: 'Technical Due Diligence Report', category: 'technical', status: 'overdue', dealId: 2, dealName: 'NeuroLink' },
  { id: 7, name: 'Competitive Analysis', category: 'market', status: 'completed', dealId: 3, dealName: 'CloudScale', uploadedBy: 'Strategy Team', uploadedDate: 'Nov 10, 2024', size: '1.9 MB' },
  { id: 8, name: 'Founder Background Check', category: 'team', status: 'completed', dealId: 3, dealName: 'CloudScale', uploadedBy: 'HR', uploadedDate: 'Nov 12, 2024', size: '456 KB' },
];

const documentCategories = [
  { id: 'financial', name: 'Financial Analysis', icon: DollarSign, color: 'primary' },
  { id: 'market', name: 'Market Analysis', icon: BarChart, color: 'secondary' },
  { id: 'team', name: 'Team Assessment', icon: Users, color: 'accent' },
  { id: 'legal', name: 'Legal Review', icon: FileText, color: 'warning' },
  { id: 'technical', name: 'Technical DD', icon: TrendingUp, color: 'info' },
];

// Mock fund-level analytics
const fundAnalytics: FundAnalytics = {
  dealFlowMetrics: {
    activeDeals: 8,
    avgTimeInDD: 23,
    ddToICConversionRate: 65,
    readyForIC: 2,
  },
  dealDistribution: {
    byStage: [
      { stage: 'Sourced', count: 2 },
      { stage: 'First Meeting', count: 2 },
      { stage: 'Due Diligence', count: 3 },
      { stage: 'Term Sheet', count: 1 },
    ],
    bySector: [
      { sector: 'AI/ML', count: 3 },
      { sector: 'Healthcare', count: 2 },
      { sector: 'FinTech', count: 2 },
      { sector: 'CleanTech', count: 1 },
    ],
    bySize: [
      { range: '<$2M', count: 3 },
      { range: '$2-4M', count: 4 },
      { range: '>$4M', count: 1 },
    ],
  },
  ddProgress: {
    avgCompletion: 68,
    onTrack: 5,
    atRisk: 2,
    blocked: 1,
  },
};

// Mock per-deal analytics
const dealAnalyticsData: DealAnalytics[] = [
  {
    dealId: 1, // Quantum AI
    financial: {
      revenue: {
        arr: 2400000,
        mrr: 200000,
        growthRateMoM: 15,
        growthRateYoY: 180,
      },
      efficiency: {
        burnRate: 150000,
        runway: 18,
        cac: 850,
        ltv: 4200,
        ltvCacRatio: 4.9,
      },
      unitEconomics: {
        grossMargin: 78,
        contributionMargin: 65,
        paybackPeriod: 8,
      },
    },
    market: {
      marketSize: {
        tam: 50,
        sam: 8,
        som: 500,
      },
      customers: {
        totalCustomers: 1200,
        nps: 67,
        churnRate: 3.2,
        nrr: 118,
      },
    },
    team: {
      size: 24,
      founderExperienceScore: 8,
    },
  },
  {
    dealId: 2, // NeuroLink
    financial: {
      revenue: {
        arr: 800000,
        mrr: 67000,
        growthRateMoM: 12,
        growthRateYoY: 210,
      },
      efficiency: {
        burnRate: 95000,
        runway: 14,
        cac: 1200,
        ltv: 3800,
        ltvCacRatio: 3.2,
      },
      unitEconomics: {
        grossMargin: 72,
        contributionMargin: 58,
        paybackPeriod: 11,
      },
    },
    market: {
      marketSize: {
        tam: 35,
        sam: 5,
        som: 280,
      },
      customers: {
        totalCustomers: 450,
        nps: 71,
        churnRate: 4.1,
        nrr: 112,
      },
    },
    team: {
      size: 15,
      founderExperienceScore: 7,
    },
  },
  {
    dealId: 3, // CloudScale
    financial: {
      revenue: {
        arr: 5200000,
        mrr: 433000,
        growthRateMoM: 18,
        growthRateYoY: 240,
      },
      efficiency: {
        burnRate: 280000,
        runway: 22,
        cac: 650,
        ltv: 5800,
        ltvCacRatio: 8.9,
      },
      unitEconomics: {
        grossMargin: 85,
        contributionMargin: 72,
        paybackPeriod: 6,
      },
    },
    market: {
      marketSize: {
        tam: 120,
        sam: 18,
        som: 850,
      },
      customers: {
        totalCustomers: 2100,
        nps: 75,
        churnRate: 2.1,
        nrr: 125,
      },
    },
    team: {
      size: 42,
      founderExperienceScore: 9,
    },
  },
];

export function DealIntelligence() {
  const { selectedFund } = useFund();
  const [viewMode, setViewMode] = useState<'fund-level' | 'per-deal'>('fund-level');
  const [selectedDeal, setSelectedDeal] = useState<ActiveDeal | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory | 'all'>('all');

  const getStatusIcon = (status: DocumentStatus) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-[var(--app-success)]" />;
      case 'in-progress':
        return <Clock className="w-4 h-4 text-[var(--app-warning)]" />;
      case 'overdue':
        return <AlertCircle className="w-4 h-4 text-[var(--app-danger)]" />;
      default:
        return <Circle className="w-4 h-4 text-[var(--app-text-subtle)]" />;
    }
  };

  const getStatusBadgeClass = (status: DocumentStatus) => {
    switch (status) {
      case 'completed':
        return 'bg-[var(--app-success-bg)] text-[var(--app-success)]';
      case 'in-progress':
        return 'bg-[var(--app-warning-bg)] text-[var(--app-warning)]';
      case 'overdue':
        return 'bg-[var(--app-danger-bg)] text-[var(--app-danger)]';
      default:
        return 'bg-[var(--app-surface-hover)] text-[var(--app-text-muted)]';
    }
  };

  const getICStatusBadge = (status: ICStatus) => {
    switch (status) {
      case 'ready-for-ic':
        return <Badge size="sm" variant="flat" className="bg-[var(--app-success-bg)] text-[var(--app-success)]">Ready for IC</Badge>;
      case 'dd-in-progress':
        return <Badge size="sm" variant="flat" className="bg-[var(--app-info-bg)] text-[var(--app-info)]">DD In Progress</Badge>;
      case 'docs-overdue':
        return <Badge size="sm" variant="flat" className="bg-[var(--app-danger-bg)] text-[var(--app-danger)]">Docs Overdue</Badge>;
      case 'blocked':
        return <Badge size="sm" variant="flat" className="bg-[var(--app-warning-bg)] text-[var(--app-warning)]">Blocked</Badge>;
    }
  };

  const getCategoryStatusIcon = (status: 'completed' | 'in-progress' | 'overdue') => {
    switch (status) {
      case 'completed':
        return '✓';
      case 'in-progress':
        return '⏳';
      case 'overdue':
        return '⚠';
    }
  };

  const handleDealClick = (deal: ActiveDeal) => {
    setSelectedDeal(deal);
    setViewMode('per-deal');
  };

  const handleBackToFundView = () => {
    setViewMode('fund-level');
    setSelectedDeal(null);
  };

  const filteredDocuments = mockDocuments.filter(doc => {
    const matchesDeal = !selectedDeal || doc.dealId === selectedDeal.id;
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    const matchesSearch = searchQuery === '' ||
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.dealName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDeal && matchesCategory && matchesSearch;
  });

  const dealsReadyForIC = activeDeals.filter(d => d.icStatus === 'ready-for-ic').length;
  const dealsInProgress = activeDeals.filter(d => d.icStatus === 'dd-in-progress').length;
  const overdueDocuments = mockDocuments.filter(d => d.status === 'overdue').length;
  const pendingReviews = mockDocuments.filter(d => d.status === 'pending').length;

  // Fund-Level View
  if (viewMode === 'fund-level') {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl mb-2">Deal Intelligence</h2>
          <p className="text-sm sm:text-base text-[var(--app-text-muted)]">
            Due diligence tracking and investment decisions
          </p>
        </div>

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
          <Card padding="md" className="border-[var(--app-success)]">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-[var(--app-success)]" />
              <div>
                <div className="text-2xl font-medium">{dealsReadyForIC}</div>
                <div className="text-sm text-[var(--app-text-muted)]">Ready for IC</div>
              </div>
            </div>
          </Card>
          <Card padding="md" className="border-[var(--app-info)]">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-[var(--app-info)]" />
              <div>
                <div className="text-2xl font-medium">{dealsInProgress}</div>
                <div className="text-sm text-[var(--app-text-muted)]">DD In Progress</div>
              </div>
            </div>
          </Card>
          <Card padding="md" className="border-[var(--app-danger)]">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-[var(--app-danger)]" />
              <div>
                <div className="text-2xl font-medium">{overdueDocuments}</div>
                <div className="text-sm text-[var(--app-text-muted)]">Overdue Documents</div>
              </div>
            </div>
          </Card>
          <Card padding="md" className="border-[var(--app-warning)]">
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
                      {getICStatusBadge(deal.icStatus)}
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
                    <div key={cat.category} className="flex items-center justify-between">
                      <span className="text-[var(--app-text-muted)] capitalize">{cat.category}:</span>
                      <span className="font-medium">
                        {getCategoryStatusIcon(cat.status)} {cat.completed}/{cat.total}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Per-Deal View
  if (viewMode === 'per-deal' && selectedDeal) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
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
                {getICStatusBadge(selectedDeal.icStatus)}
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
                    const categoryInfo = documentCategories.find(c => c.id === cat.category);
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
                            <span className="text-sm">{getCategoryStatusIcon(cat.status)}</span>
                            <span className="text-sm font-medium">{cat.completed}/{cat.total}</span>
                          </div>
                        </div>
                        <Progress
                          value={percentage}
                          size="sm"
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
                    {getICStatusBadge(selectedDeal.icStatus)}
                  </div>
                </div>
              </Card>
            </div>
          </Tab>

          <Tab key="analytics" title="Deal Analytics">
            {(() => {
              const analytics = dealAnalyticsData.find(d => d.dealId === selectedDeal.id);
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="md:col-span-2">
                  <Input
                    type="text"
                    placeholder="Search documents..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    startContent={<Search className="w-4 h-4 text-[var(--app-text-subtle)]" />}
                    size="md"
                  />
                </div>
                <div>
                  <Button
                    variant="flat"
                    className="w-full justify-start"
                    startContent={<Filter className="w-4 h-4" />}
                  >
                    Filter by Category
                  </Button>
                </div>
              </div>

              {/* Document Categories Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                {documentCategories.map((category) => {
                  const CategoryIcon = category.icon;
                  const count = mockDocuments.filter(d => d.dealId === selectedDeal.id && d.category === category.id).length;
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
                            {getStatusIcon(doc.status)}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-sm truncate">{doc.name}</span>
                                <Badge
                                  size="sm"
                                  variant="flat"
                                  className={getStatusBadgeClass(doc.status)}
                                >
                                  {doc.status}
                                </Badge>
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
                <Lightbulb className="w-12 h-12 mx-auto mb-4 opacity-50" />
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
      </div>
    );
  }

  return null;
}
