import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  GitBranch,
  Briefcase,
  Search,
  Vote,
  TrendingUp,
  TrendingDown,
  Users,
  UserCheck,
  DollarSign,
  Shield,
  Scale,
  FileDown,
  Sparkles,
  Database,
  FileText,
  Plug,
  Settings,
  Receipt,
  Bell,
  CalendarDays,
} from 'lucide-react';
import type { BreadcrumbItem, AISuggestion } from '@/ui';

export interface RouteConfig {
  path: string;
  label: string;
  icon: LucideIcon;
  breadcrumbs: BreadcrumbItem[];
  aiSuggestion?: AISuggestion;
  description?: string;
}

export const routes: Record<string, RouteConfig> = {
  dashboard: {
    path: '/home',
    label: 'Dashboard',
    icon: LayoutDashboard,
    breadcrumbs: [
      { label: 'Home', href: '/home' },
      { label: 'Dashboard' },
    ],
    aiSuggestion: {
      label: 'Pipeline',
      href: '/pipeline',
      reasoning: 'Start your day by reviewing active deals in the pipeline. Most users navigate here first.',
      confidence: 0.88,
    },
    description: 'AI-powered fund operations overview',
  },

  pipeline: {
    path: '/pipeline',
    label: 'Pipeline',
    icon: GitBranch,
    breadcrumbs: [
      { label: 'Home', href: '/home' },
      { label: 'Core Operations', href: '/home' },
      { label: 'Pipeline' },
    ],
    aiSuggestion: {
      label: 'Deal Intelligence',
      href: '/deal-intelligence',
      reasoning: 'You typically review deal intelligence after viewing pipeline. AI detected this pattern from your navigation history.',
      confidence: 0.87,
    },
    description: 'Active deal pipeline and sourcing',
  },

  portfolio: {
    path: '/portfolio',
    label: 'Portfolio',
    icon: Briefcase,
    breadcrumbs: [
      { label: 'Home', href: '/home' },
      { label: 'Core Operations', href: '/home' },
      { label: 'Portfolio' },
    ],
    aiSuggestion: {
      label: 'Analytics',
      href: '/analytics',
      reasoning: 'After portfolio review, you frequently access analytics for deeper insights. 82% historical pattern match.',
      confidence: 0.82,
    },
    description: 'Portfolio company health and metrics',
  },

  dealIntelligence: {
    path: '/deal-intelligence',
    label: 'Deal Intelligence',
    icon: Search,
    breadcrumbs: [
      { label: 'Home', href: '/home' },
      { label: 'Deal Management', href: '/home' },
      { label: 'Deal Intelligence' },
    ],
    aiSuggestion: {
      label: 'Pipeline',
      href: '/pipeline',
      reasoning: 'AI suggests viewing pipeline to assess deal prioritization based on intelligence insights.',
      confidence: 0.79,
    },
    description: 'AI-powered deal sourcing and analysis',
  },

  dealflowReview: {
    path: '/dealflow-review',
    label: 'Dealflow Review',
    icon: Vote,
    breadcrumbs: [
      { label: 'Home', href: '/home' },
      { label: 'Deal Management', href: '/home' },
      { label: 'Dealflow Review' },
    ],
    aiSuggestion: {
      label: 'Deal Intelligence',
      href: '/deal-intelligence',
      reasoning: 'After team voting, check deal intelligence for additional insights before final decisions.',
      confidence: 0.81,
    },
    description: 'Team consensus and voting on deals',
  },
  analytics: {
    path: '/analytics',
    label: 'Analytics',
    icon: TrendingUp,
    breadcrumbs: [
      { label: 'Home', href: '/home' },
      { label: 'Portfolio Management', href: '/home' },
      { label: 'Analytics' },
    ],
    aiSuggestion: {
      label: 'Portfolio',
      href: '/portfolio',
      reasoning: 'Return to portfolio overview to track companies flagged in analytics.',
      confidence: 0.75,
    },
    description: 'Advanced portfolio analytics and forecasting',
  },

  fundAdmin: {
    path: '/fund-admin',
    label: 'Fund Admin',
    icon: DollarSign,
    breadcrumbs: [
      { label: 'Home', href: '/home' },
      { label: 'Back Office', href: '/home' },
      { label: 'Fund Admin' },
    ],
    aiSuggestion: {
      label: 'LP Management',
      href: '/lp-management',
      reasoning: 'Capital call operations often require LP communication. AI predicts 85% likelihood of needing LP data.',
      confidence: 0.85,
    },
    description: 'Capital calls and fund operations',
  },

  fundAdminDistributionsNew: {
    path: '/fund-admin/distributions/new',
    label: 'New Distribution',
    icon: Receipt,
    breadcrumbs: [
      { label: 'Home', href: '/home' },
      { label: 'Back Office', href: '/home' },
      { label: 'Fund Admin', href: '/fund-admin' },
      { label: 'New Distribution' },
    ],
    aiSuggestion: {
      label: 'Waterfall Modeling',
      href: '/waterfall',
      reasoning: 'Run waterfall scenarios before finalizing LP allocations.',
      confidence: 0.82,
    },
    description: 'Create a new distribution workflow',
  },

  fundAdminDistributionsCalendar: {
    path: '/fund-admin/distributions/calendar',
    label: 'Distribution Calendar',
    icon: CalendarDays,
    breadcrumbs: [
      { label: 'Home', href: '/home' },
      { label: 'Back Office', href: '/home' },
      { label: 'Fund Admin', href: '/fund-admin' },
      { label: 'Distribution Calendar' },
    ],
    aiSuggestion: {
      label: 'New Distribution',
      href: '/fund-admin/distributions/new',
      reasoning: 'Schedule a new distribution after reviewing the calendar.',
      confidence: 0.8,
    },
    description: 'Schedule and monitor upcoming distributions',
  },

  fundAdminDistributionDetail: {
    path: '/fund-admin/distributions/[id]',
    label: 'Distribution Detail',
    icon: Receipt,
    breadcrumbs: [
      { label: 'Home', href: '/home' },
      { label: 'Back Office', href: '/home' },
      { label: 'Fund Admin', href: '/fund-admin' },
      { label: 'Distribution Detail' },
    ],
    aiSuggestion: {
      label: 'Distribution Calendar',
      href: '/fund-admin/distributions/calendar',
      reasoning: 'Review upcoming distributions after approving this payout.',
      confidence: 0.78,
    },
    description: 'Review approvals, allocations, and statements',
  },

  lpManagement: {
    path: '/lp-management',
    label: 'LP Management',
    icon: UserCheck,
    breadcrumbs: [
      { label: 'Home', href: '/home' },
      { label: 'Back Office', href: '/home' },
      { label: 'LP Management' },
    ],
    aiSuggestion: {
      label: 'Reports',
      href: '/reports',
      reasoning: 'Generate investor reports after reviewing LP data. Common workflow for quarterly updates.',
      confidence: 0.83,
    },
    description: 'Limited partner relationships and reporting',
  },

  lpPortal: {
    path: '/lp-portal',
    label: 'LP Portal',
    icon: Users,
    breadcrumbs: [
      { label: 'Home', href: '/home' },
      { label: 'LP Portal' },
    ],
    aiSuggestion: {
      label: 'Distributions',
      href: '/fund-admin/distributions/calendar',
      reasoning: 'Review distribution schedules that are surfaced to LPs.',
      confidence: 0.74,
    },
    description: 'Investor-facing portal for distributions and documents',
  },

  compliance: {
    path: '/compliance',
    label: 'Compliance',
    icon: Shield,
    breadcrumbs: [
      { label: 'Home', href: '/home' },
      { label: 'Back Office', href: '/home' },
      { label: 'Compliance' },
    ],
    aiSuggestion: {
      label: 'Audit Trail',
      href: '/audit-trail',
      reasoning: 'Review audit trail for compliance verification. Recommended after checking compliance status.',
      confidence: 0.78,
    },
    description: 'Regulatory compliance and deadlines',
  },

  valuations409a: {
    path: '/409a-valuations',
    label: '409A Valuations',
    icon: Receipt,
    breadcrumbs: [
      { label: 'Home', href: '/home' },
      { label: 'Back Office', href: '/home' },
      { label: '409A Valuations' },
    ],
    aiSuggestion: {
      label: 'Tax Center',
      href: '/tax-center',
      reasoning: '409A valuations often impact tax calculations. Review tax implications after valuation updates.',
      confidence: 0.84,
    },
    description: 'Fair market value assessments',
  },

  taxCenter: {
    path: '/tax-center',
    label: 'Tax Center',
    icon: Scale,
    breadcrumbs: [
      { label: 'Home', href: '/home' },
      { label: 'Back Office', href: '/home' },
      { label: 'Tax Center' },
    ],
    aiSuggestion: {
      label: 'Reports',
      href: '/reports',
      reasoning: 'Export tax reports after K-1 generation for distribution to partners.',
      confidence: 0.86,
    },
    description: 'Tax planning and K-1 generation',
  },

  contacts: {
    path: '/contacts',
    label: 'Contacts',
    icon: Users,
    breadcrumbs: [
      { label: 'Home', href: '/home' },
      { label: 'Utilities', href: '/home' },
      { label: 'Contacts' },
    ],
    aiSuggestion: {
      label: 'Deal Intelligence',
      href: '/deal-intelligence',
      reasoning: 'Find new opportunities from your network. AI can match contacts to potential deals.',
      confidence: 0.76,
    },
    description: 'Founders, LPs, and network contacts',
  },

  notifications: {
    path: '/notifications',
    label: 'Notifications',
    icon: Bell,
    breadcrumbs: [
      { label: 'Home', href: '/home' },
      { label: 'Utilities', href: '/home' },
      { label: 'Notifications' },
    ],
    aiSuggestion: {
      label: 'Dashboard',
      href: '/home',
      reasoning: 'After reviewing notifications, return to the dashboard to prioritize today’s work.',
      confidence: 0.78,
    },
    description: 'Alerts, reminders, and system updates',
  },

  reports: {
    path: '/reports',
    label: 'Reports',
    icon: FileDown,
    breadcrumbs: [
      { label: 'Home', href: '/home' },
      { label: 'Utilities', href: '/home' },
      { label: 'Reports' },
    ],
    aiSuggestion: {
      label: 'Dashboard',
      href: '/home',
      reasoning: 'Return to dashboard overview after generating reports to see updated metrics.',
      confidence: 0.80,
    },
    description: 'Generate and export reports',
  },

  aiTools: {
    path: '/ai-tools',
    label: 'AI Tools',
    icon: Sparkles,
    breadcrumbs: [
      { label: 'Home', href: '/home' },
      { label: 'Utilities', href: '/home' },
      { label: 'AI Tools' },
    ],
    aiSuggestion: {
      label: 'Deal Intelligence',
      href: '/deal-intelligence',
      reasoning: 'Apply AI tools to analyze deals. Enhanced insights available in deal intelligence.',
      confidence: 0.82,
    },
    description: 'AI-powered workflows and automation',
  },

  waterfall: {
    path: '/waterfall',
    label: 'Waterfall Modeling',
    icon: TrendingDown,
    breadcrumbs: [
      { label: 'Home', href: '/home' },
      { label: 'Portfolio Management', href: '/home' },
      { label: 'Waterfall Modeling' },
    ],
    aiSuggestion: {
      label: 'Fund Admin',
      href: '/fund-admin',
      reasoning: 'Review capital call structures after modeling exit scenarios and distributions.',
      confidence: 0.84,
    },
    description: 'Model exit scenarios and distribution waterfalls',
  },

  auditTrail: {
    path: '/audit-trail',
    label: 'Audit Trail',
    icon: Database,
    breadcrumbs: [
      { label: 'Home', href: '/home' },
      { label: 'Back Office', href: '/home' },
      { label: 'Audit Trail' },
    ],
    aiSuggestion: {
      label: 'Compliance',
      href: '/compliance',
      reasoning: 'Cross-reference audit records with compliance requirements to ensure regulatory adherence.',
      confidence: 0.79,
    },
    description: 'Immutable, cryptographically verified transaction history',
  },

  documents: {
    path: '/documents',
    label: 'Documents',
    icon: FileText,
    breadcrumbs: [
      { label: 'Home', href: '/home' },
      { label: 'Utilities', href: '/home' },
      { label: 'Documents' },
    ],
    aiSuggestion: {
      label: 'Compliance',
      href: '/compliance',
      reasoning: 'Verify document compliance and track regulatory filing deadlines.',
      confidence: 0.77,
    },
    description: 'Document management and storage',
  },

  integrations: {
    path: '/integrations',
    label: 'Integrations',
    icon: Plug,
    breadcrumbs: [
      { label: 'Home', href: '/home' },
      { label: 'Utilities', href: '/home' },
      { label: 'Integrations' },
    ],
    aiSuggestion: {
      label: 'Settings',
      href: '/settings',
      reasoning: 'Configure integration settings and manage API credentials.',
      confidence: 0.81,
    },
    description: 'Connect external tools and services',
  },

  settings: {
    path: '/settings',
    label: 'Settings',
    icon: Settings,
    breadcrumbs: [
      { label: 'Home', href: '/home' },
      { label: 'Settings' },
    ],
    aiSuggestion: {
      label: 'Dashboard',
      href: '/home',
      reasoning: 'Return to dashboard to see how your settings changes affect the overview.',
      confidence: 0.75,
    },
    description: 'Manage your account settings and preferences',
  },
};

export const ROUTE_PATHS = Object.freeze(
  Object.fromEntries(
    Object.entries(routes).map(([key, route]) => [key, route.path])
  ) as { [K in keyof typeof routes]: (typeof routes)[K]['path'] }
);

export function withRouteParams(
  path: string,
  params: Record<string, string | number>
): string {
  return Object.entries(params).reduce(
    (nextPath, [key, value]) =>
      nextPath.replace(`[${key}]`, encodeURIComponent(String(value))),
    path
  );
}

/**
 * Get route configuration by path
 */
export function getRouteConfig(path: string): RouteConfig | undefined {
  return Object.values(routes).find(route => route.path === path);
}

/**
 * Get breadcrumbs for current path
 */
export function getBreadcrumbs(path: string): BreadcrumbItem[] {
  const config = getRouteConfig(path);
  return config?.breadcrumbs || [{ label: 'Home', href: '/home' }];
}

/**
 * Get AI suggestion for current path
 */
export function getAISuggestion(path: string): AISuggestion | undefined {
  const config = getRouteConfig(path);
  return config?.aiSuggestion;
}
