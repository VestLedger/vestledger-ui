import type { Fund, FundViewMode } from '@/types/fund';
import type { CapitalCall } from '@/components/dashboard/active-capital-calls';
import type { PortfolioCompany } from '@/components/dashboard/portfolio-health';
import type { Alert } from '@/components/dashboard/alert-bar';
import type { QuickAction } from '@/components/dashboard/quick-actions';
import type { Task } from '@/components/dashboard/ai-task-prioritizer';
import { Send, DollarSign, FileText, Users, BarChart } from 'lucide-react';

export interface DashboardData {
  capitalCalls: CapitalCall[];
  portfolioCompanies: PortfolioCompany[];
  alerts: Alert[];
  quickActions: QuickAction[];
  tasks: Task[];
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

export function getMockDashboardData(selectedFund: Fund | null, viewMode: FundViewMode): DashboardData {
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
      dueDate: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      totalLPs: 15,
      respondedLPs: 13,
      overdueLPs: 2,
      prediction: {
        expectedCompletion: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
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
      dueDate: new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      totalLPs: 12,
      respondedLPs: 5,
      overdueLPs: 0,
      prediction: {
        expectedCompletion: new Date(today.getTime() + 18 * 24 * 60 * 60 * 1000),
        confidence: 0.82,
        atRiskLPs: [
          { name: 'Gamma Partners', typicalDelayDays: 7 },
        ],
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
      healthChange: +5,
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
      healthChange: +3,
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
        value: new Date(today.getTime() + 180 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
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

  // Mock Quick Actions
  const quickActions: QuickAction[] = [
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

  // Mock Tasks
  const tasks: Task[] = [
    {
      id: 'task-1',
      title: 'Follow up with overdue LPs',
      description: 'Contact Acme Ventures and Beta Capital regarding Fund II capital call',
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
      urgency: 6,
      impact: 7,
      priorityScore: 42,
      estimatedTime: '4 hours',
      status: 'pending',
    },
  ];

  // Aggregate metrics for AI insights
  const metrics = {
    overdueCapitalCalls: capitalCalls.filter((c) => c.overdueLPs > 0).length,
    upcomingDeadlines: 1, // From tasks
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
    metrics,
    selectedFundName: fundName,
  };
}
