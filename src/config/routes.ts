import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  GitBranch,
  Briefcase,
  Search,
  Vote,
  PieChart,
  TrendingUp,
  Users,
  UserCheck,
  DollarSign,
  Shield,
  Scale,
  Receipt,
  FileDown,
  Sparkles,
  Database,
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
    path: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    breadcrumbs: [
      { label: 'Home', href: '/dashboard' },
      { label: 'Dashboard' },
    ],
    description: 'AI-powered fund operations overview',
  },

  pipeline: {
    path: '/pipeline',
    label: 'Pipeline',
    icon: GitBranch,
    breadcrumbs: [
      { label: 'Home', href: '/dashboard' },
      { label: 'Core Operations', href: '/dashboard' },
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
      { label: 'Home', href: '/dashboard' },
      { label: 'Core Operations', href: '/dashboard' },
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
      { label: 'Home', href: '/dashboard' },
      { label: 'Deal Management', href: '/dashboard' },
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
      { label: 'Home', href: '/dashboard' },
      { label: 'Deal Management', href: '/dashboard' },
      { label: 'Dealflow Review' },
    ],
    description: 'Team consensus and voting on deals',
  },

  capTable: {
    path: '/cap-table',
    label: 'Cap Table',
    icon: PieChart,
    breadcrumbs: [
      { label: 'Home', href: '/dashboard' },
      { label: 'Portfolio Management', href: '/dashboard' },
      { label: 'Cap Table' },
    ],
    description: 'Capitalization tables and ownership tracking',
  },

  analytics: {
    path: '/analytics',
    label: 'Analytics',
    icon: TrendingUp,
    breadcrumbs: [
      { label: 'Home', href: '/dashboard' },
      { label: 'Portfolio Management', href: '/dashboard' },
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
      { label: 'Home', href: '/dashboard' },
      { label: 'Back Office', href: '/dashboard' },
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

  lpManagement: {
    path: '/lp-management',
    label: 'LP Management',
    icon: UserCheck,
    breadcrumbs: [
      { label: 'Home', href: '/dashboard' },
      { label: 'Back Office', href: '/dashboard' },
      { label: 'LP Management' },
    ],
    description: 'Limited partner relationships and reporting',
  },

  compliance: {
    path: '/compliance',
    label: 'Compliance',
    icon: Shield,
    breadcrumbs: [
      { label: 'Home', href: '/dashboard' },
      { label: 'Back Office', href: '/dashboard' },
      { label: 'Compliance' },
    ],
    description: 'Regulatory compliance and deadlines',
  },

  valuations409a: {
    path: '/409a-valuations',
    label: '409A Valuations',
    icon: Receipt,
    breadcrumbs: [
      { label: 'Home', href: '/dashboard' },
      { label: 'Back Office', href: '/dashboard' },
      { label: '409A Valuations' },
    ],
    description: 'Fair market value assessments',
  },

  taxCenter: {
    path: '/tax-center',
    label: 'Tax Center',
    icon: Scale,
    breadcrumbs: [
      { label: 'Home', href: '/dashboard' },
      { label: 'Back Office', href: '/dashboard' },
      { label: 'Tax Center' },
    ],
    description: 'Tax planning and K-1 generation',
  },

  contacts: {
    path: '/contacts',
    label: 'Contacts',
    icon: Users,
    breadcrumbs: [
      { label: 'Home', href: '/dashboard' },
      { label: 'Utilities', href: '/dashboard' },
      { label: 'Contacts' },
    ],
    description: 'Founders, LPs, and network contacts',
  },

  reports: {
    path: '/reports',
    label: 'Reports',
    icon: FileDown,
    breadcrumbs: [
      { label: 'Home', href: '/dashboard' },
      { label: 'Utilities', href: '/dashboard' },
      { label: 'Reports' },
    ],
    description: 'Generate and export reports',
  },

  aiTools: {
    path: '/ai-tools',
    label: 'AI Tools',
    icon: Sparkles,
    breadcrumbs: [
      { label: 'Home', href: '/dashboard' },
      { label: 'Utilities', href: '/dashboard' },
      { label: 'AI Tools' },
    ],
    description: 'AI-powered workflows and automation',
  },

  auditTrail: {
    path: '/audit-trail',
    label: 'Audit Trail',
    icon: Database,
    breadcrumbs: [
      { label: 'Home', href: '/dashboard' },
      { label: 'Back Office', href: '/dashboard' },
      { label: 'Audit Trail' },
    ],
    description: 'Immutable, cryptographically verified transaction history',
  },
};

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
  return config?.breadcrumbs || [{ label: 'Home', href: '/dashboard' }];
}

/**
 * Get AI suggestion for current path
 */
export function getAISuggestion(path: string): AISuggestion | undefined {
  const config = getRouteConfig(path);
  return config?.aiSuggestion;
}
