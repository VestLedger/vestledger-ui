import type { Fund, FundViewMode } from '@/types/fund';
import type { CapitalCall } from '@/components/dashboard/active-capital-calls';
import type { PortfolioCompany } from '@/components/dashboard/portfolio-health';
import type { Alert } from '@/components/dashboard/alert-bar';
import type { QuickAction } from '@/components/dashboard/quick-actions';
import type { Task } from '@/components/dashboard/ai-task-prioritizer';
import { ROUTE_PATHS } from '@/config/routes';
import { Send, DollarSign, FileText, Users, BarChart } from 'lucide-react';

const BRIEF_HORIZON_DAYS = 7;
const URGENT_DUE_WINDOW_DAYS = 2;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const addDays = (date: Date, days: number) => new Date(date.getTime() + (days * MS_PER_DAY));

const getDaysUntil = (target: Date, anchor: Date) => Math.floor((target.getTime() - anchor.getTime()) / MS_PER_DAY);

const isWithinBriefWindow = (target: Date, anchor: Date) => {
  const daysUntil = getDaysUntil(target, anchor);
  return daysUntil >= 0 && daysUntil <= BRIEF_HORIZON_DAYS;
};

const MOCK_QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'qa-1',
    label: 'Send LP Reminders',
    description: 'Email overdue LPs about Fund II call',
    icon: Send,
    aiSuggested: true,
    confidence: 0.94,
    onClick: () => console.log('Send reminders'),
  },
  {
    id: 'qa-2',
    label: 'Draft Capital Call',
    description: 'Generate Fund III notice',
    icon: DollarSign,
    aiSuggested: true,
    confidence: 0.88,
    onClick: () => console.log('Draft capital call'),
  },
  {
    id: 'qa-3',
    label: 'Generate Report',
    description: 'Q4 portfolio health summary',
    icon: FileText,
    aiSuggested: false,
    onClick: () => console.log('Generate report'),
  },
  {
    id: 'qa-4',
    label: 'Contact LP',
    description: 'View LP directory',
    icon: Users,
    aiSuggested: false,
    onClick: () => console.log('View LPs'),
  },
  {
    id: 'qa-5',
    label: 'View Analytics',
    description: 'Deep dive into metrics',
    icon: BarChart,
    aiSuggested: false,
    onClick: () => console.log('View analytics'),
  },
];

export type PriorityQuadrant =
  | 'urgent-important'
  | 'urgent-non-important'
  | 'non-urgent-important'
  | 'non-urgent-non-important';

export type DailyBriefItemType = 'task' | 'warning';

export type BusinessLane = 'Portfolio' | 'LP Relations' | 'Operations';

export interface DailyBriefItem {
  id: string;
  type: DailyBriefItemType;
  title: string;
  description: string;
  owner: string;
  lane: BusinessLane;
  dueDate: Date;
  urgencyScore: number;
  importanceScore: number;
  route: string;
  tabTarget?: string;
  fundId?: string;
  searchHint?: string;
  quadrant: PriorityQuadrant;
}

export interface MorningBrief {
  summary: string;
  confidence: number;
  asOf: Date;
  horizonDays: number;
  itemCount: number;
  urgentCount: number;
  importantCount: number;
}

export interface FundHealthRow {
  id: string;
  displayName: string;
  status: Fund['status'];
  healthScore: number;
  healthDelta: number;
  deploymentPct: number;
  availableCapital: number;
  irr: number;
  tvpi: number;
  riskFlag: 'stable' | 'watch' | 'critical';
}

export interface FundTrustRow {
  id: string;
  displayName: string;
  status: Fund['status'];
  trustScore: number;
  trustDelta: number;
  lpCommitmentRate: number;
  reportingQuality: number;
  lpSatisfaction: number;
  capitalEfficiency: number;
  deploymentPct: number;
  availableCapital: number;
  irr: number;
  tvpi: number;
  riskFlag: 'stable' | 'watch' | 'critical';
}

export interface PortfolioSignalRow {
  id: string;
  name: string;
  healthScore: number;
  healthDelta: number;
  runwayMonths: number;
  anomalyCount: number;
  riskFlag: 'stable' | 'watch' | 'critical';
  route: string;
}

export type ValuationPotential = 'high' | 'medium' | 'watch';

export interface PortfolioRevenueRow {
  id: string;
  name: string;
  arr: number;
  arrGrowthQoq: number;
  valuation: number;
  valuationPotential: ValuationPotential;
  upsideLabel: string;
  runwayMonths: number;
  anomalyCount: number;
  riskFlag: 'stable' | 'watch' | 'critical';
  healthScore: number;
  healthDelta: number;
  route: string;
}

export interface HomeBlocker {
  id: string;
  sourceId: string;
  title: string;
  description: string;
  blockedDays: number;
  severity: 'critical' | 'warning' | 'info';
  lane: BusinessLane;
  route: string;
  tabTarget?: string;
  fundId?: string;
  searchHint?: string;
}

export interface HomeOpportunity {
  id: string;
  sourceId: string;
  title: string;
  thesis: string;
  impactLabel: string;
  confidence: number;
  lane: BusinessLane;
  route: string;
  tabTarget?: string;
  fundId?: string;
  searchHint?: string;
  companyName?: string;
}

export interface RevenueDistributionSlice {
  id: string;
  name: string;
  value: number;
  color: string;
}

export interface PortfolioRevenueTrendPoint {
  month: string;
  arr: number;
}

export interface DashboardData {
  capitalCalls: CapitalCall[];
  portfolioCompanies: PortfolioCompany[];
  alerts: Alert[];
  quickActions: QuickAction[];
  tasks: Task[];
  morningBrief: MorningBrief;
  dailyBriefItems: DailyBriefItem[];
  fundHealthRows: FundHealthRow[];
  portfolioSignals: PortfolioSignalRow[];
  fundTrustRows: FundTrustRow[];
  portfolioRevenueRows: PortfolioRevenueRow[];
  blockers: HomeBlocker[];
  opportunities: HomeOpportunity[];
  revenueDistribution: RevenueDistributionSlice[];
  portfolioRevenueTrend: PortfolioRevenueTrendPoint[];
  metrics: {
    overdueCapitalCalls: number;
    upcomingDeadlines: number;
    atRiskCompanies: number;
    healthyCompanies: number;
    totalTasks: number;
    urgentTasks: number;
  };
  selectedFundName: string;
}

const getPriorityQuadrant = (
  urgencyScore: number,
  importanceScore: number,
  dueDate: Date,
  anchor: Date
): PriorityQuadrant => {
  const daysUntilDue = getDaysUntil(dueDate, anchor);
  const urgent = urgencyScore >= 8 || daysUntilDue <= URGENT_DUE_WINDOW_DAYS;
  const important = importanceScore >= 8;

  if (urgent && important) return 'urgent-important';
  if (urgent) return 'urgent-non-important';
  if (important) return 'non-urgent-important';
  return 'non-urgent-non-important';
};

const getQuadrantRank = (quadrant: PriorityQuadrant) => {
  switch (quadrant) {
    case 'urgent-important':
      return 0;
    case 'urgent-non-important':
      return 1;
    case 'non-urgent-important':
      return 2;
    default:
      return 3;
  }
};

const getTaskRouteConfig = (domain: Task['domain']) => {
  if (domain === 'capital-calls') {
    return { route: ROUTE_PATHS.fundAdmin, tabTarget: 'capital-calls' };
  }
  if (domain === 'portfolio') {
    return { route: ROUTE_PATHS.portfolio };
  }
  if (domain === 'compliance') {
    return { route: ROUTE_PATHS.compliance };
  }
  if (domain === 'reporting') {
    return { route: ROUTE_PATHS.reports };
  }
  return { route: ROUTE_PATHS.dashboard };
};

const getAlertRouteConfig = (alert: Alert) => {
  const lowerTitle = alert.title.toLowerCase();
  if (lowerTitle.includes('capital call') || lowerTitle.includes('lp') || lowerTitle.includes('trust')) {
    return { route: ROUTE_PATHS.fundAdmin, tabTarget: 'capital-calls' };
  }
  if (lowerTitle.includes('compliance')) {
    return { route: ROUTE_PATHS.compliance };
  }
  return { route: ROUTE_PATHS.portfolio };
};

const getLaneFromDomain = (domain?: Task['domain']): BusinessLane => {
  if (domain === 'portfolio') return 'Portfolio';
  if (domain === 'capital-calls' || domain === 'reporting') return 'LP Relations';
  return 'Operations';
};

const getLaneFromText = (text: string): BusinessLane => {
  const value = text.toLowerCase();
  if (value.includes('lp') || value.includes('capital call') || value.includes('trust') || value.includes('investor')) {
    return 'LP Relations';
  }
  if (value.includes('portfolio') || value.includes('company') || value.includes('revenue') || value.includes('runway')) {
    return 'Portfolio';
  }
  return 'Operations';
};

const blockerSeverityRank: Record<HomeBlocker['severity'], number> = {
  critical: 0,
  warning: 1,
  info: 2,
};

export function getMockDashboardData(
  selectedFund: Fund | null,
  viewMode: FundViewMode,
  funds: Fund[] = []
): DashboardData {
  const today = new Date('2026-02-12T08:15:00.000Z');
  const fundName = selectedFund?.displayName || 'All Funds';
  void viewMode;

  const portfolioRevenueTrend: PortfolioRevenueTrendPoint[] = [
    { month: 'Aug', arr: 142 },
    { month: 'Sep', arr: 156 },
    { month: 'Oct', arr: 168 },
    { month: 'Nov', arr: 182 },
    { month: 'Dec', arr: 195 },
    { month: 'Jan', arr: 208 },
    { month: 'Feb', arr: 224 },
  ];

  // Mock Capital Calls
  const capitalCalls: CapitalCall[] = [
    {
      id: 'cc-1',
      fundName: 'Fund II - Series A',
      amount: 5_200_000,
      collected: 4_524_000,
      dueDate: new Date(today.getTime() - 7 * MS_PER_DAY),
      totalLPs: 15,
      respondedLPs: 13,
      overdueLPs: 2,
      prediction: {
        expectedCompletion: new Date(today.getTime() + 3 * MS_PER_DAY),
        confidence: 0.89,
        atRiskLPs: [
          { name: 'Acme Ventures', typicalDelayDays: 5 },
          { name: 'Beta Capital', typicalDelayDays: 3 },
        ],
      },
    },
    {
      id: 'cc-2',
      fundName: 'Fund III - Seed',
      amount: 2_100_000,
      collected: 945_000,
      dueDate: new Date(today.getTime() + 14 * MS_PER_DAY),
      totalLPs: 12,
      respondedLPs: 5,
      overdueLPs: 0,
      prediction: {
        expectedCompletion: new Date(today.getTime() + 18 * MS_PER_DAY),
        confidence: 0.82,
        atRiskLPs: [{ name: 'Gamma Partners', typicalDelayDays: 7 }],
      },
    },
  ];

  // Mock Portfolio Companies
  const portfolioCompanies: PortfolioCompany[] = [
    {
      id: 'pc-1',
      name: 'CloudScale',
      health: 78,
      healthChange: -7,
      runway: 8,
      burnRate: 150_000,
      prediction: {
        nextQuarterHealth: 72,
        confidence: 0.85,
        reasoning:
          'Burn rate increased 15% last quarter while revenue growth slowed to 12%. Runway declining faster than projected. Recommend bridge funding discussion.',
      },
      anomalies: [
        { metric: 'Burn Rate', change: '+15% MoM', severity: 'medium' },
        { metric: 'Customer Churn', change: '+3.2% QoQ', severity: 'medium' },
      ],
    },
    {
      id: 'pc-2',
      name: 'BioTech Inc',
      health: 65,
      healthChange: -12,
      runway: 6,
      burnRate: 200_000,
      prediction: {
        nextQuarterHealth: 58,
        confidence: 0.79,
        reasoning:
          'Clinical trial delays pushed revenue timeline back 6 months. Current cash reserves may be insufficient. High priority for bridge round or expense reduction.',
      },
      anomalies: [
        { metric: 'Runway', change: '-4 months QoQ', severity: 'high' },
        { metric: 'Headcount', change: '+12 employees', severity: 'medium' },
      ],
    },
    {
      id: 'pc-3',
      name: 'FinServe',
      health: 92,
      healthChange: 5,
      runway: 18,
      burnRate: 100_000,
      prediction: {
        nextQuarterHealth: 94,
        confidence: 0.91,
        reasoning:
          'Strong revenue growth (ARR +45% QoQ) and improving unit economics. Burn rate declining as company approaches profitability. Excellent trajectory.',
      },
    },
    {
      id: 'pc-4',
      name: 'EduTech',
      health: 88,
      healthChange: 3,
      runway: 24,
      burnRate: 75_000,
      prediction: {
        nextQuarterHealth: 90,
        confidence: 0.88,
        reasoning:
          'Consistent execution, strong product-market fit. Cash-efficient growth model with healthy margins. On track for Series B in 12-18 months.',
      },
    },
  ];

  // Mock Alerts
  const alerts: Alert[] = [
    {
      id: 'alert-1',
      type: 'critical',
      title: 'Bridge funding decision: BioTech runway risk',
      description: 'BioTech Inc has 6 months of runway remaining. GP decision needed on bridge structure and partner signal.',
      priority: 95,
      reasoning:
        'Runway < 6 months is critical threshold. Company has high burn ($200K/mo) and recent clinical trial setbacks. Risk of down round or shutdown without intervention.',
      prediction: {
        label: 'Cash depletion date',
        value: new Date(today.getTime() + 180 * MS_PER_DAY).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        confidence: 0.87,
      },
      action: {
        label: 'Schedule Bridge Round Discussion',
        onClick: () => console.log('Navigate to BioTech'),
      },
    },
    {
      id: 'alert-2',
      type: 'warning',
      title: 'Portfolio revenue concentration rising in FinServe',
      description: 'FinServe now contributes outsized ARR share. Review concentration risk against return profile.',
      priority: 72,
      reasoning:
        'Top-company ARR concentration has increased while allocation pacing remains unchanged. Could amplify upside and downside variance.',
      prediction: {
        label: 'Projected concentration',
        value: '38% ARR share next quarter',
        confidence: 0.82,
      },
      action: {
        label: 'Review Concentration Exposure',
        onClick: () => console.log('Navigate to FinServe'),
      },
    },
    {
      id: 'alert-3',
      type: 'warning',
      title: '2 LPs overdue on Fund II capital call',
      description: 'Acme Ventures and Beta Capital are 7 days overdue, creating drag on trust and close confidence.',
      priority: 68,
      reasoning:
        'Historical delay patterns for these LPs suggest 3-5 additional days needed. Proactive communication reduces relationship erosion.',
      action: {
        label: 'Send Reminder Emails',
        onClick: () => console.log('Draft emails'),
      },
    },
  ];

  const quickActions = MOCK_QUICK_ACTIONS;

  // Mock Tasks
  const tasks: Task[] = [
    {
      id: 'task-1',
      title: 'LP overdue follow-up for Fund II',
      description: 'Call Acme Ventures and Beta Capital to close overdue commitments.',
      domain: 'capital-calls',
      urgency: 9,
      impact: 8,
      priorityScore: 72,
      estimatedTime: '30 min',
      status: 'pending',
      delegationSuggestion: {
        person: 'Sarah (Fund Admin)',
        reasoning: 'Has direct LP relationship context and call cadence history.',
      },
    },
    {
      id: 'task-2',
      title: 'Bridge extension decision for BioTech',
      description: 'Decide term structure and partner signal for 6-month runway bridge.',
      domain: 'portfolio',
      urgency: 10,
      impact: 10,
      priorityScore: 100,
      estimatedTime: '2 hours',
      status: 'in_progress',
    },
    {
      id: 'task-3',
      title: 'Co-invest review for FinServe expansion round',
      description: 'Assess allocation fit, markup potential, and ownership strategy.',
      domain: 'portfolio',
      urgency: 7,
      impact: 9,
      priorityScore: 63,
      estimatedTime: '1 hour',
      status: 'pending',
    },
    {
      id: 'task-4',
      title: 'Finalize Q4 LP trust narrative',
      description: 'Align reporting quality and transparency points before LP circulation.',
      domain: 'reporting',
      urgency: 8,
      impact: 7,
      priorityScore: 56,
      estimatedTime: '90 min',
      status: 'pending',
    },
    {
      id: 'task-5',
      title: 'Prepare compliance audit documentation',
      description: 'Close remaining checklist items for annual compliance review.',
      domain: 'compliance',
      urgency: 6,
      impact: 6,
      priorityScore: 36,
      estimatedTime: '3 hours',
      status: 'pending',
    },
  ];

  const sourceFunds = funds.length > 0 ? funds : selectedFund ? [selectedFund] : [];

  const fundTrustRows: FundTrustRow[] = sourceFunds
    .map((fund) => {
      const deploymentPct = Math.round((fund.deployedCapital / Math.max(fund.totalCommitment, 1)) * 100);
      const statusPenalty = fund.status === 'active' ? 0 : fund.status === 'fundraising' ? 5 : 9;

      const lpCommitmentRate = clamp(Math.round(84 + (fund.irr * 0.25) - (deploymentPct > 92 ? 8 : 0) - statusPenalty), 62, 99);
      const reportingQuality = clamp(Math.round(79 + (fund.tvpi * 5.5) + (fund.status === 'closed' ? 5 : 0)), 68, 98);
      const lpSatisfaction = clamp(
        Math.round((lpCommitmentRate * 0.45) + (reportingQuality * 0.35) + clamp(fund.irr * 1.2, 0, 100) * 0.2),
        60,
        98
      );
      const capitalEfficiency = clamp(
        Math.round((fund.tvpi * 24) - (deploymentPct > 90 ? 8 : 0) + (fund.status === 'fundraising' ? 4 : 0)),
        58,
        98
      );

      const trustScore = Math.round(
        (lpCommitmentRate + reportingQuality + lpSatisfaction + capitalEfficiency) / 4
      );

      const trustDelta = clamp(
        Math.round(((fund.irr - 18) / 4) + ((fund.tvpi - 1.6) * 3) - (statusPenalty / 3)),
        -9,
        9
      );

      const riskFlag: FundTrustRow['riskFlag'] =
        trustScore < 75
          ? 'critical'
          : trustScore < 85
            ? 'watch'
            : 'stable';

      return {
        id: fund.id,
        displayName: fund.displayName,
        status: fund.status,
        trustScore,
        trustDelta,
        lpCommitmentRate,
        reportingQuality,
        lpSatisfaction,
        capitalEfficiency,
        deploymentPct,
        availableCapital: fund.availableCapital,
        irr: fund.irr,
        tvpi: fund.tvpi,
        riskFlag,
      };
    })
    .sort((a, b) => a.trustScore - b.trustScore);

  const fundHealthRows: FundHealthRow[] = fundTrustRows.map((row) => ({
    id: row.id,
    displayName: row.displayName,
    status: row.status,
    healthScore: row.trustScore,
    healthDelta: row.trustDelta,
    deploymentPct: row.deploymentPct,
    availableCapital: row.availableCapital,
    irr: row.irr,
    tvpi: row.tvpi,
    riskFlag: row.riskFlag,
  }));

  const revenueByCompanyId: Record<string, { arr: number; arrGrowthQoq: number; valuation: number; potential: ValuationPotential; upsideLabel: string }> = {
    'pc-1': { arr: 58, arrGrowthQoq: 34, valuation: 420, potential: 'high', upsideLabel: '~$45M upside' },
    'pc-2': { arr: 22, arrGrowthQoq: -8, valuation: 140, potential: 'watch', upsideLabel: 'Bridge preserves option value' },
    'pc-3': { arr: 79, arrGrowthQoq: 42, valuation: 510, potential: 'high', upsideLabel: '~$62M upside' },
    'pc-4': { arr: 47, arrGrowthQoq: 26, valuation: 310, potential: 'medium', upsideLabel: 'High potential' },
  };

  const portfolioRevenueRows: PortfolioRevenueRow[] = portfolioCompanies
    .map((company) => {
      const anomalyCount = company.anomalies?.length ?? 0;
      const revenueData = revenueByCompanyId[company.id] ?? {
        arr: 18,
        arrGrowthQoq: 12,
        valuation: 120,
        potential: 'medium' as ValuationPotential,
        upsideLabel: 'Moderate upside',
      };

      const riskFlag: PortfolioRevenueRow['riskFlag'] =
        company.health < 70 || company.runway < 9
          ? 'critical'
          : company.health < 80 || company.runway < 12 || anomalyCount > 0
            ? 'watch'
            : 'stable';

      return {
        id: company.id,
        name: company.name,
        arr: revenueData.arr,
        arrGrowthQoq: revenueData.arrGrowthQoq,
        valuation: revenueData.valuation,
        valuationPotential: revenueData.potential,
        upsideLabel: revenueData.upsideLabel,
        runwayMonths: company.runway,
        anomalyCount,
        riskFlag,
        healthScore: company.health,
        healthDelta: company.healthChange,
        route: ROUTE_PATHS.portfolio,
      };
    })
    .sort((a, b) => b.arr - a.arr);

  const portfolioSignals: PortfolioSignalRow[] = portfolioRevenueRows
    .map((row) => ({
      id: row.id,
      name: row.name,
      healthScore: row.healthScore,
      healthDelta: row.healthDelta,
      runwayMonths: row.runwayMonths,
      anomalyCount: row.anomalyCount,
      riskFlag: row.riskFlag,
      route: ROUTE_PATHS.portfolio,
    }))
    .sort((a, b) => a.healthScore - b.healthScore);

  const taskDueDateOffsets: Record<string, number> = {
    'task-1': 0,
    'task-2': 1,
    'task-3': 3,
    'task-4': 5,
    'task-5': 6,
  };

  const alertDueDateOffsets: Record<string, number> = {
    'alert-1': 0,
    'alert-2': 2,
  };

  const taskItems: DailyBriefItem[] = tasks
    .filter((task) => task.status !== 'completed')
    .flatMap((task) => {
      const dueDate = addDays(today, taskDueDateOffsets[task.id] ?? BRIEF_HORIZON_DAYS);
      if (!isWithinBriefWindow(dueDate, today)) return [];

      const routeConfig = getTaskRouteConfig(task.domain);
      const lane = getLaneFromDomain(task.domain);

      return [{
        id: `brief-${task.id}`,
        type: 'task' as const,
        title: task.title,
        description: task.description,
        owner: task.delegationSuggestion?.person ?? 'GP',
        lane,
        dueDate,
        urgencyScore: task.urgency,
        importanceScore: task.impact,
        route: routeConfig.route,
        tabTarget: routeConfig.tabTarget,
        searchHint: task.domain === 'portfolio' ? task.title.replace('Co-invest review for ', '').replace('Bridge extension decision for ', '') : undefined,
        quadrant: getPriorityQuadrant(task.urgency, task.impact, dueDate, today),
      }];
    });

  const warningItems: DailyBriefItem[] = alerts
    .filter((alert) => !alert.title.toLowerCase().includes('capital call'))
    .flatMap((alert) => {
      const dueDate = addDays(today, alertDueDateOffsets[alert.id] ?? BRIEF_HORIZON_DAYS);
      if (!isWithinBriefWindow(dueDate, today)) return [];

      const routeConfig = getAlertRouteConfig(alert);
      const urgencyScore = clamp(Math.round(alert.priority / 10), 4, 10);
      const importanceScore = clamp(Math.round((alert.priority + 10) / 12), 4, 10);

      return [{
        id: `brief-${alert.id}`,
        type: 'warning' as const,
        title: alert.title,
        description: alert.description,
        owner: 'GP',
        lane: getLaneFromText(alert.title),
        dueDate,
        urgencyScore,
        importanceScore,
        route: routeConfig.route,
        tabTarget: routeConfig.tabTarget,
        quadrant: getPriorityQuadrant(urgencyScore, importanceScore, dueDate, today),
      }];
    });

  const overdueCapitalCallWarnings: DailyBriefItem[] = capitalCalls
    .filter((call) => call.overdueLPs > 0)
    .map((call) => {
      const dueDate = addDays(today, 1);
      const urgencyScore = 9;
      const importanceScore = 8;

      return {
        id: `brief-capital-call-${call.id}`,
        type: 'warning' as const,
        title: `Escalate overdue LP commitments for ${call.fundName}`,
        description: `${call.overdueLPs} LPs are overdue. ${call.respondedLPs}/${call.totalLPs} have responded so far.`,
        owner: 'Fund Admin',
        lane: 'LP Relations' as const,
        dueDate,
        urgencyScore,
        importanceScore,
        route: ROUTE_PATHS.fundAdmin,
        tabTarget: 'capital-calls',
        quadrant: getPriorityQuadrant(urgencyScore, importanceScore, dueDate, today),
      };
    });

  const dailyBriefItems = [...taskItems, ...warningItems, ...overdueCapitalCallWarnings].sort((a, b) => {
    const quadrantDiff = getQuadrantRank(a.quadrant) - getQuadrantRank(b.quadrant);
    if (quadrantDiff !== 0) return quadrantDiff;

    if (a.dueDate.getTime() !== b.dueDate.getTime()) {
      return a.dueDate.getTime() - b.dueDate.getTime();
    }

    return (b.urgencyScore + b.importanceScore) - (a.urgencyScore + a.importanceScore);
  });

  const blockerAgeByBriefId: Record<string, number> = {
    'brief-task-2': 3,
    'brief-task-1': 2,
    'brief-task-4': 2,
    'brief-alert-1': 2,
    'brief-capital-call-cc-1': 7,
  };

  const blockersDedup = new Set<string>();
  const blockers: HomeBlocker[] = dailyBriefItems
    .filter((item) => item.quadrant === 'urgent-important' || (item.type === 'warning' && item.urgencyScore >= 8))
    .map((item) => {
      const severity: HomeBlocker['severity'] =
        item.urgencyScore >= 9 && item.importanceScore >= 8
          ? 'critical'
          : item.urgencyScore >= 8
            ? 'warning'
            : 'info';

      return {
        id: `blocker-${item.id}`,
        sourceId: item.id,
        title: item.title,
        description: item.description,
        blockedDays: blockerAgeByBriefId[item.id] ?? Math.max(1, Math.abs(getDaysUntil(item.dueDate, today)) + 1),
        severity,
        lane: item.lane,
        route: item.route,
        tabTarget: item.tabTarget,
        fundId: item.fundId,
        searchHint: item.searchHint,
      };
    })
    .filter((blocker) => {
      const dedupKey = blocker.title.toLowerCase();
      if (blockersDedup.has(dedupKey)) {
        return false;
      }
      blockersDedup.add(dedupKey);
      return true;
    })
    .sort((a, b) => {
      const severityDiff = blockerSeverityRank[a.severity] - blockerSeverityRank[b.severity];
      if (severityDiff !== 0) return severityDiff;
      if (a.blockedDays !== b.blockedDays) return b.blockedDays - a.blockedDays;
      return b.title.localeCompare(a.title);
    })
    .slice(0, 6);

  const opportunityCandidates = [...portfolioRevenueRows]
    .filter((row) => row.arrGrowthQoq > 15)
    .sort((a, b) => b.arrGrowthQoq - a.arrGrowthQoq)
    .slice(0, 2);

  const opportunities: HomeOpportunity[] = opportunityCandidates.map((row) => ({
    id: `opp-${row.id}`,
    sourceId: row.id,
    title: `${row.name} expansion window`,
    thesis: `${row.name} reached $${row.arr.toFixed(0)}M ARR with ${row.arrGrowthQoq}% QoQ growth and ${row.valuationPotential} valuation potential.`,
    impactLabel: row.upsideLabel,
    confidence: clamp(0.62 + (row.arrGrowthQoq / 100), 0.62, 0.95),
    lane: 'Portfolio',
    route: ROUTE_PATHS.portfolio,
    companyName: row.name,
    searchHint: row.name,
  }));

  const topRevenueName = portfolioRevenueRows[0]?.name;
  if (topRevenueName) {
    opportunities.push({
      id: 'opp-trust-secondary-liquidity',
      sourceId: 'secondary-liquidity',
      title: 'Secondary liquidity signal for LP trust',
      thesis: `A partial secondary in ${topRevenueName} could bring early DPI and strengthen LP confidence before the next close cycle.`,
      impactLabel: 'Trust builder',
      confidence: 0.76,
      lane: 'LP Relations',
      route: ROUTE_PATHS.fundAdmin,
      tabTarget: 'fund-setup',
    });
  }

  const distributionPalette = ['#10b981', '#3b82f6', '#f59e0b'];
  const topRevenueContributors = portfolioRevenueRows.slice(0, 3);
  const topRevenueSum = topRevenueContributors.reduce((sum, row) => sum + row.arr, 0);
  const currentPortfolioArr = portfolioRevenueTrend[portfolioRevenueTrend.length - 1]?.arr ?? topRevenueSum;
  const otherRevenue = Math.max(4, currentPortfolioArr - topRevenueSum);

  const revenueDistribution: RevenueDistributionSlice[] = [
    ...topRevenueContributors.map((row, index) => ({
      id: `rev-${row.id}`,
      name: row.name,
      value: row.arr,
      color: distributionPalette[index] ?? '#64748b',
    })),
    {
      id: 'rev-others',
      name: 'Others',
      value: otherRevenue,
      color: '#94a3b8',
    },
  ];

  const urgentCount = dailyBriefItems.filter((item) => item.quadrant.startsWith('urgent')).length;
  const importantCount = dailyBriefItems.filter((item) => item.quadrant.endsWith('important')).length;
  const trustWatchCount = fundTrustRows.filter((row) => row.riskFlag !== 'stable').length;

  const morningBrief: MorningBrief = {
    summary: `Revenue makers rose from $142M to $${currentPortfolioArr}M ARR. ${urgentCount} urgent and ${importantCount} important decisions this week, with ${blockers.length} blockers waiting on GP and ${trustWatchCount} funds requiring trust attention.`,
    confidence: 0.94,
    asOf: new Date(today),
    horizonDays: BRIEF_HORIZON_DAYS,
    itemCount: dailyBriefItems.length,
    urgentCount,
    importantCount,
  };

  // Aggregate metrics for downstream AI/summary usage
  const metrics = {
    overdueCapitalCalls: capitalCalls.filter((c) => c.overdueLPs > 0).length,
    upcomingDeadlines: dailyBriefItems.length,
    atRiskCompanies: portfolioRevenueRows.filter((c) => c.riskFlag === 'critical').length,
    healthyCompanies: portfolioRevenueRows.filter((c) => c.riskFlag === 'stable').length,
    totalTasks: tasks.filter((t) => t.status !== 'completed').length,
    urgentTasks: tasks.filter((t) => t.priorityScore >= 70 && t.status !== 'completed').length,
  };

  return {
    capitalCalls,
    portfolioCompanies,
    alerts,
    quickActions,
    tasks,
    morningBrief,
    dailyBriefItems,
    fundHealthRows,
    portfolioSignals,
    fundTrustRows,
    portfolioRevenueRows,
    blockers,
    opportunities,
    revenueDistribution,
    portfolioRevenueTrend,
    metrics,
    selectedFundName: fundName,
  };
}
