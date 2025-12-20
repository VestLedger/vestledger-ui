export interface CapitalCall {
  id: string;
  fundName: string;
  amount: number;
  dueDate: Date;
  status: 'pending' | 'overdue' | 'collected';
  lpId: string;
}

export interface ComplianceTask {
  id: string;
  title: string;
  deadline: Date;
  complexity: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed';
}

export interface PortfolioCompany {
  id: string;
  name: string;
  runway: number; // months
  burnRate: number;
  health: number; // 0-100
  lastUpdate: Date;
}

const MOCK_NOW = new Date('2025-01-01T12:00:00.000Z');

export const getMockCapitalCalls = (): CapitalCall[] => {
  const today = new Date(MOCK_NOW.getTime());
  return [
    {
      id: '1',
      fundName: 'Fund II',
      amount: 500000,
      dueDate: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      status: 'overdue',
      lpId: 'lp1',
    },
    {
      id: '2',
      fundName: 'Fund II',
      amount: 250000,
      dueDate: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      status: 'overdue',
      lpId: 'lp2',
    },
    {
      id: '3',
      fundName: 'Fund III',
      amount: 750000,
      dueDate: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      status: 'overdue',
      lpId: 'lp3',
    },
    {
      id: '4',
      fundName: 'Fund III',
      amount: 300000,
      dueDate: new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
      status: 'pending',
      lpId: 'lp4',
    },
  ];
};

export const getMockComplianceTasks = (): ComplianceTask[] => {
  const today = new Date(MOCK_NOW.getTime());
  return [
    {
      id: '1',
      title: 'Annual Fund Audit',
      deadline: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      complexity: 'medium',
      status: 'in_progress',
    },
    {
      id: '2',
      title: 'SEC Form D Filing',
      deadline: new Date(today.getTime() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
      complexity: 'high',
      status: 'pending',
    },
    {
      id: '3',
      title: 'Quarterly Investor Report',
      deadline: new Date(today.getTime() + 20 * 24 * 60 * 60 * 1000), // 20 days from now
      complexity: 'low',
      status: 'pending',
    },
  ];
};

export const getMockPortfolioCompanies = (): PortfolioCompany[] => {
  return [
    {
      id: '1',
      name: 'CloudScale',
      runway: 8, // months
      burnRate: 150000,
      health: 78,
      lastUpdate: new Date(MOCK_NOW.getTime()),
    },
    {
      id: '2',
      name: 'BioTech Inc',
      runway: 6, // months
      burnRate: 200000,
      health: 65,
      lastUpdate: new Date(MOCK_NOW.getTime()),
    },
    {
      id: '3',
      name: 'FinServe',
      runway: 18, // months
      burnRate: 100000,
      health: 92,
      lastUpdate: new Date(MOCK_NOW.getTime()),
    },
    {
      id: '4',
      name: 'EduTech',
      runway: 24, // months
      burnRate: 75000,
      health: 88,
      lastUpdate: new Date(MOCK_NOW.getTime()),
    },
  ];
};

export interface NavigationBadge {
  count: number;
  variant: 'danger' | 'warning' | 'info';
  tooltip?: string;
}

export interface BadgeData {
  [itemId: string]: NavigationBadge | null;
}

const calculateFundAdminBadge = (capitalCalls: CapitalCall[]): NavigationBadge | null => {
  const overdueCalls = capitalCalls.filter((call) => call.status === 'overdue');
  if (overdueCalls.length === 0) return null;

  const totalOverdueAmount = overdueCalls.reduce((sum, call) => sum + call.amount, 0);
	  const avgDaysOverdue =
	    overdueCalls.reduce((sum, call) => {
	      const daysOverdue = Math.floor((MOCK_NOW.getTime() - call.dueDate.getTime()) / (24 * 60 * 60 * 1000));
	      return sum + daysOverdue;
	    }, 0) / overdueCalls.length;

  return {
    count: overdueCalls.length,
    variant: avgDaysOverdue > 7 ? 'danger' : 'warning',
    tooltip: `${overdueCalls.length} overdue capital call${overdueCalls.length > 1 ? 's' : ''} ($${(totalOverdueAmount / 1000000).toFixed(1)}M) - AI detected urgent action needed`,
  };
};

const calculateComplianceBadge = (tasks: ComplianceTask[]): NavigationBadge | null => {
  const today = new Date(MOCK_NOW.getTime());
  const upcomingTasks = tasks.filter((task) => {
    const daysUntilDeadline = (task.deadline.getTime() - today.getTime()) / (24 * 60 * 60 * 1000);
    return daysUntilDeadline <= 7 && daysUntilDeadline > 0 && task.status !== 'completed';
  });

  if (upcomingTasks.length === 0) return null;

  const highComplexityCount = upcomingTasks.filter((t) => t.complexity === 'high').length;
  const nearestDeadline = Math.min(...upcomingTasks.map((t) => t.deadline.getTime()));
  const daysUntil = Math.ceil((nearestDeadline - today.getTime()) / (24 * 60 * 60 * 1000));

  return {
    count: upcomingTasks.length,
    variant: daysUntil <= 3 || highComplexityCount > 0 ? 'danger' : 'warning',
    tooltip: `${upcomingTasks.length} compliance deadline${upcomingTasks.length > 1 ? 's' : ''} in ${daysUntil} day${daysUntil > 1 ? 's' : ''} - AI complexity: ${upcomingTasks[0].complexity.charAt(0).toUpperCase() + upcomingTasks[0].complexity.slice(1)}`,
  };
};

const calculatePortfolioBadge = (companies: PortfolioCompany[]): NavigationBadge | null => {
  const atRiskCompanies = companies.filter((company) => company.runway < 12);
  if (atRiskCompanies.length === 0) return null;

  const criticalCompanies = atRiskCompanies.filter((c) => c.runway < 6);

  return {
    count: atRiskCompanies.length,
    variant: criticalCompanies.length > 0 ? 'danger' : 'warning',
    tooltip: `${atRiskCompanies.length} compan${atRiskCompanies.length > 1 ? 'ies' : 'y'} with runway < 12 months - AI predicted risk`,
  };
};

const calculateLPManagementBadge = (capitalCalls: CapitalCall[]): NavigationBadge | null => {
  const overdueByLP = capitalCalls
    .filter((call) => call.status === 'overdue')
    .reduce((acc, call) => {
      acc[call.lpId] = (acc[call.lpId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const problemLPs = Object.keys(overdueByLP).length;
  if (problemLPs === 0) return null;

  return {
    count: problemLPs,
    variant: problemLPs > 2 ? 'danger' : 'warning',
    tooltip: `${problemLPs} LP${problemLPs > 1 ? 's' : ''} with overdue capital calls - AI suggests follow-up`,
  };
};

const calculate409ABadge = (): NavigationBadge | null => {
  const today = new Date(MOCK_NOW.getTime());
  const lastValuation = new Date(today.getTime() - 11 * 30 * 24 * 60 * 60 * 1000); // 11 months ago
  const monthsSinceValuation = (today.getTime() - lastValuation.getTime()) / (30 * 24 * 60 * 60 * 1000);

  if (monthsSinceValuation < 10) return null;

  return {
    count: 1,
    variant: monthsSinceValuation >= 12 ? 'danger' : 'warning',
    tooltip: '409A valuation due for renewal - AI detected based on 12-month cycle',
  };
};

const calculateAnalyticsBadge = (companies: PortfolioCompany[]): NavigationBadge | null => {
  const anomalies = companies.filter((company) => {
    const predictedHealth = company.health; // In real system, would compare to previous
    return predictedHealth < 70;
  });

  if (anomalies.length === 0) return null;

  return {
    count: anomalies.length,
    variant: 'info',
    tooltip: `${anomalies.length} anomal${anomalies.length > 1 ? 'ies' : 'y'} detected in portfolio metrics - AI analysis available`,
  };
};

export const calculateAIBadges = (): BadgeData => {
  const capitalCalls = getMockCapitalCalls();
  const complianceTasks = getMockComplianceTasks();
  const portfolioCompanies = getMockPortfolioCompanies();

  return {
    'fund-admin': calculateFundAdminBadge(capitalCalls),
    compliance: calculateComplianceBadge(complianceTasks),
    portfolio: calculatePortfolioBadge(portfolioCompanies),
    'lp-management': calculateLPManagementBadge(capitalCalls),
    '409a-valuations': calculate409ABadge(),
    analytics: calculateAnalyticsBadge(portfolioCompanies),
  };
};
