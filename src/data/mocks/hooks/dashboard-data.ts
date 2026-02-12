import type { Fund, FundViewMode } from '@/types/fund';
import type { CapitalCall } from '@/components/dashboard/active-capital-calls';
import type { PortfolioCompany } from '@/components/dashboard/portfolio-health';
import type { Alert } from '@/components/dashboard/alert-bar';
import type { QuickAction } from '@/components/dashboard/quick-actions';
import type { Task } from '@/components/dashboard/ai-task-prioritizer';
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

export interface DailyBriefItem {
  id: string;
  type: DailyBriefItemType;
  title: string;
  description: string;
  owner: string;
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

const getTaskRouteConfig = (domain: Task['domain']) => {
  if (domain === 'capital-calls') {
    return { route: '/fund-admin', tabTarget: 'capital-calls' };
  }
  if (domain === 'portfolio') {
    return { route: '/portfolio' };
  }
  if (domain === 'compliance') {
    return { route: '/compliance' };
  }
  if (domain === 'reporting') {
    return { route: '/reports' };
  }
  return { route: '/home' };
};

const getAlertRouteConfig = (alert: Alert) => {
  const lowerTitle = alert.title.toLowerCase();
  if (lowerTitle.includes('capital call') || lowerTitle.includes('lp')) {
    return { route: '/fund-admin', tabTarget: 'capital-calls' };
  }
  if (lowerTitle.includes('compliance')) {
    return { route: '/compliance' };
  }
  return { route: '/portfolio' };
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

export function getMockDashboardData(
  selectedFund: Fund | null,
  viewMode: FundViewMode,
  funds: Fund[] = []
): DashboardData {
  const today = new Date('2025-01-01T12:00:00.000Z');
  const fundName = selectedFund?.displayName || 'All Funds';
  void viewMode;

  // Mock Capital Calls
  const capitalCalls: CapitalCall[] = [
    {
      id: 'cc-1',
      fundName: 'Fund II - Series A',
      amount: 5200000,
      collected: 4524000,
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
      amount: 2100000,
      collected: 945000,
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
      burnRate: 150000,
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
      burnRate: 200000,
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
      burnRate: 100000,
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
      burnRate: 75000,
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
      title: 'Critical: BioTech Runway Approaching Depletion',
      description: 'BioTech Inc has only 6 months of runway remaining with current burn rate. Immediate action required.',
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
      title: 'CloudScale Showing Declining Health Metrics',
      description: 'Health score dropped 7 points to 78. Burn rate increasing while growth slowing.',
      priority: 72,
      reasoning:
        'Combination of increasing burn (+15%) and slowing revenue growth indicates operational challenges. Early warning sign requiring management attention.',
      prediction: {
        label: 'Predicted next quarter health',
        value: '72 (-6 points)',
        confidence: 0.85,
      },
      action: {
        label: 'Review Q4 Metrics',
        onClick: () => console.log('Navigate to CloudScale'),
      },
    },
    {
      id: 'alert-3',
      type: 'warning',
      title: '2 LPs Overdue on Fund II Capital Call',
      description: 'Acme Ventures and Beta Capital have not responded to Fund II capital call (7 days overdue).',
      priority: 68,
      reasoning:
        'Historical delay patterns for these LPs suggest 3-5 additional days needed. However, maintaining LP relationships requires proactive follow-up.',
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
      title: 'Follow up with overdue LPs',
      description: 'Contact Acme Ventures and Beta Capital regarding Fund II capital call',
      domain: 'capital-calls',
      urgency: 9,
      impact: 8,
      priorityScore: 72,
      estimatedTime: '30 min',
      status: 'pending',
      delegationSuggestion: {
        person: 'Sarah (Fund Admin)',
        reasoning: 'Has existing relationship with these LPs and handles all capital call communications',
      },
    },
    {
      id: 'task-2',
      title: 'Schedule BioTech bridge round discussion',
      description: 'Urgent meeting with BioTech management to discuss runway and funding options',
      domain: 'portfolio',
      urgency: 10,
      impact: 10,
      priorityScore: 100,
      estimatedTime: '2 hours',
      status: 'in_progress',
    },
    {
      id: 'task-3',
      title: 'Review CloudScale Q4 metrics',
      description: 'Analyze burn rate increase and revenue slowdown, prepare questions for next board meeting',
      domain: 'portfolio',
      urgency: 7,
      impact: 8,
      priorityScore: 56,
      estimatedTime: '1 hour',
      status: 'pending',
    },
    {
      id: 'task-4',
      title: 'Prepare compliance audit documentation',
      description: 'Gather required documents for annual fund audit (due in 5 days)',
      domain: 'compliance',
      urgency: 8,
      impact: 6,
      priorityScore: 48,
      estimatedTime: '3 hours',
      status: 'pending',
      delegationSuggestion: {
        person: 'Mark (Compliance Lead)',
        reasoning: 'Owns compliance process and has prepared similar documentation for previous audits',
      },
    },
    {
      id: 'task-5',
      title: 'Draft Q4 LP report',
      description: 'Compile portfolio performance, fund metrics, and market commentary for LPs',
      domain: 'reporting',
      urgency: 6,
      impact: 7,
      priorityScore: 42,
      estimatedTime: '4 hours',
      status: 'pending',
    },
  ];

  const sourceFunds = funds.length > 0 ? funds : selectedFund ? [selectedFund] : [];

  const fundHealthRows: FundHealthRow[] = sourceFunds
    .map((fund) => {
      const deploymentPct = Math.round((fund.deployedCapital / Math.max(fund.totalCommitment, 1)) * 100);
      const irrScore = clamp((fund.irr / 25) * 100, 0, 100);
      const tvpiScore = clamp((fund.tvpi / 2.5) * 100, 0, 100);
      const deploymentScore = deploymentPct < 30 ? 55 : deploymentPct > 92 ? 60 : 85;
      const statusModifier = fund.status === 'active' ? 0 : fund.status === 'fundraising' ? -8 : -15;

      const healthScore = clamp(
        Math.round((irrScore * 0.45) + (tvpiScore * 0.35) + (deploymentScore * 0.2) + statusModifier),
        25,
        97
      );

      const healthDelta = clamp(Math.round(((fund.irr - 15) / 2) + ((fund.tvpi - 1.5) * 2)), -9, 9);

      const riskFlag: FundHealthRow['riskFlag'] =
        healthScore < 60 || fund.status !== 'active' || deploymentPct > 92
          ? 'critical'
          : healthScore < 75 || deploymentPct < 30 || deploymentPct > 85
            ? 'watch'
            : 'stable';

      return {
        id: fund.id,
        displayName: fund.displayName,
        status: fund.status,
        healthScore,
        healthDelta,
        deploymentPct,
        availableCapital: fund.availableCapital,
        irr: fund.irr,
        tvpi: fund.tvpi,
        riskFlag,
      };
    })
    .sort((a, b) => a.healthScore - b.healthScore);

  const portfolioSignals: PortfolioSignalRow[] = [...portfolioCompanies]
    .map((company) => {
      const anomalyCount = company.anomalies?.length ?? 0;
      const riskFlag: PortfolioSignalRow['riskFlag'] =
        company.health < 70 || company.runway < 9
          ? 'critical'
          : company.health < 80 || company.runway < 12 || anomalyCount > 0
            ? 'watch'
            : 'stable';

      return {
        id: company.id,
        name: company.name,
        healthScore: company.health,
        healthDelta: company.healthChange,
        runwayMonths: company.runway,
        anomalyCount,
        riskFlag,
        route: '/portfolio',
      };
    })
    .sort((a, b) => a.healthScore - b.healthScore);

  const taskDueDateOffsets: Record<string, number> = {
    'task-1': 0,
    'task-2': 1,
    'task-3': 3,
    'task-4': 5,
    'task-5': 7,
  };

  const alertDueDateOffsets: Record<string, number> = {
    'alert-1': 6,
    'alert-2': 2,
  };

  const taskItems: DailyBriefItem[] = tasks
    .filter((task) => task.status !== 'completed')
    .flatMap((task) => {
      const dueDate = addDays(today, taskDueDateOffsets[task.id] ?? BRIEF_HORIZON_DAYS);
      if (!isWithinBriefWindow(dueDate, today)) return [];

      const routeConfig = getTaskRouteConfig(task.domain);
      return [{
        id: `brief-${task.id}`,
        type: 'task' as const,
        title: task.title,
        description: task.description,
        owner: task.delegationSuggestion?.person ?? 'GP',
        dueDate,
        urgencyScore: task.urgency,
        importanceScore: task.impact,
        route: routeConfig.route,
        tabTarget: routeConfig.tabTarget,
        searchHint: task.domain === 'portfolio' ? task.title.replace('Review ', '').replace(' metrics', '') : undefined,
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
    .map((call) => ({
      id: `brief-capital-call-${call.id}`,
      type: 'warning' as const,
      title: `Escalate overdue LP commitments for ${call.fundName}`,
      description: `${call.overdueLPs} LPs are overdue. ${call.respondedLPs}/${call.totalLPs} have responded so far.`,
      owner: 'Fund Admin',
      dueDate: addDays(today, 1),
      urgencyScore: 9,
      importanceScore: 8,
      route: '/fund-admin',
      tabTarget: 'capital-calls',
      quadrant: getPriorityQuadrant(9, 8, addDays(today, 1), today),
    }));

  const dailyBriefItems = [...taskItems, ...warningItems, ...overdueCapitalCallWarnings].sort((a, b) => {
    const quadrantDiff = getQuadrantRank(a.quadrant) - getQuadrantRank(b.quadrant);
    if (quadrantDiff !== 0) return quadrantDiff;

    if (a.dueDate.getTime() !== b.dueDate.getTime()) {
      return a.dueDate.getTime() - b.dueDate.getTime();
    }

    return (b.urgencyScore + b.importanceScore) - (a.urgencyScore + a.importanceScore);
  });

  const urgentCount = dailyBriefItems.filter((item) => item.quadrant.startsWith('urgent')).length;
  const importantCount = dailyBriefItems.filter((item) => item.quadrant.endsWith('important')).length;
  const watchFundsCount = fundHealthRows.filter((row) => row.riskFlag !== 'stable').length;
  const watchPortfolioCount = portfolioSignals.filter((row) => row.riskFlag !== 'stable').length;

  const morningBrief: MorningBrief = {
    summary: `${urgentCount} urgent and ${importantCount} important items over the next ${BRIEF_HORIZON_DAYS} days. ${watchFundsCount} funds and ${watchPortfolioCount} portfolio companies are on watch.`,
    confidence: 0.92,
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
    atRiskCompanies: portfolioCompanies.filter((c) => c.health < 70 || c.runway < 12).length,
    healthyCompanies: portfolioCompanies.filter((c) => c.health >= 80).length,
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
    metrics,
    selectedFundName: fundName,
  };
}
