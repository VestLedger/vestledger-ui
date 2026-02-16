import type { LucideIcon } from 'lucide-react';
import type { ContextualTabConfig } from './contextual-tabs';
import { ROUTE_PATHS, routes } from './routes';
import {
  DEFAULT_ANALYTICS_TAB_ID,
  ANALYTICS_TABS,
} from './analytics-tabs';
import {
  AI_TOOLS_TABS,
  DEFAULT_AI_TOOLS_TAB_ID,
} from './ai-tools-tabs';
import {
  COLLABORATION_TABS,
  DEFAULT_COLLABORATION_TAB_ID,
} from './collaboration-tabs';
import {
  COMPLIANCE_TABS,
  DEFAULT_COMPLIANCE_TAB_ID,
} from './compliance-tabs';
import {
  DEAL_INTELLIGENCE_TABS,
  DEFAULT_DEAL_INTELLIGENCE_TAB_ID,
} from './deal-intelligence-tabs';
import {
  DEFAULT_FUND_ADMIN_TAB_ID,
  FUND_ADMIN_TABS,
} from './fund-admin-tabs';
import {
  DEFAULT_LP_MANAGEMENT_TAB_ID,
  LP_MANAGEMENT_TABS,
} from './lp-management-tabs';
import { DEFAULT_LP_PORTAL_TAB_ID, LP_PORTAL_TABS } from './lp-portal-tabs';
import { DEFAULT_PORTFOLIO_TAB_ID, PORTFOLIO_TABS } from './portfolio-tabs';
import { DEFAULT_TAX_CENTER_TAB_ID, TAX_CENTER_TABS } from './tax-center-tabs';
import {
  DEFAULT_VALUATION_409A_TAB_ID,
  VALUATION_409A_TABS,
} from './valuation-409a-tabs';

export type ContextualMenuId =
  | 'portfolio'
  | 'analytics'
  | 'fund-admin'
  | 'lp-management'
  | 'compliance'
  | 'valuation-409a'
  | 'tax-center'
  | 'lp-portal'
  | 'deal-intelligence'
  | 'collaboration'
  | 'ai-tools';

export type ContextualMenuConfig = {
  id: ContextualMenuId;
  routePath: string;
  label: string;
  icon: LucideIcon;
  tabs: ContextualTabConfig[];
  defaultTabId: string;
};

export const SIDEBAR_CONTEXTUAL_MENUS: Record<ContextualMenuId, ContextualMenuConfig> = {
  portfolio: {
    id: 'portfolio',
    routePath: ROUTE_PATHS.portfolio,
    label: routes.portfolio.label,
    icon: routes.portfolio.icon,
    tabs: PORTFOLIO_TABS,
    defaultTabId: DEFAULT_PORTFOLIO_TAB_ID,
  },
  analytics: {
    id: 'analytics',
    routePath: ROUTE_PATHS.analytics,
    label: routes.analytics.label,
    icon: routes.analytics.icon,
    tabs: ANALYTICS_TABS,
    defaultTabId: DEFAULT_ANALYTICS_TAB_ID,
  },
  'fund-admin': {
    id: 'fund-admin',
    routePath: ROUTE_PATHS.fundAdmin,
    label: routes.fundAdmin.label,
    icon: routes.fundAdmin.icon,
    tabs: FUND_ADMIN_TABS,
    defaultTabId: DEFAULT_FUND_ADMIN_TAB_ID,
  },
  'lp-management': {
    id: 'lp-management',
    routePath: ROUTE_PATHS.lpManagement,
    label: routes.lpManagement.label,
    icon: routes.lpManagement.icon,
    tabs: LP_MANAGEMENT_TABS,
    defaultTabId: DEFAULT_LP_MANAGEMENT_TAB_ID,
  },
  compliance: {
    id: 'compliance',
    routePath: ROUTE_PATHS.compliance,
    label: routes.compliance.label,
    icon: routes.compliance.icon,
    tabs: COMPLIANCE_TABS,
    defaultTabId: DEFAULT_COMPLIANCE_TAB_ID,
  },
  'valuation-409a': {
    id: 'valuation-409a',
    routePath: ROUTE_PATHS.valuations409a,
    label: routes.valuations409a.label,
    icon: routes.valuations409a.icon,
    tabs: VALUATION_409A_TABS,
    defaultTabId: DEFAULT_VALUATION_409A_TAB_ID,
  },
  'tax-center': {
    id: 'tax-center',
    routePath: ROUTE_PATHS.taxCenter,
    label: routes.taxCenter.label,
    icon: routes.taxCenter.icon,
    tabs: TAX_CENTER_TABS,
    defaultTabId: DEFAULT_TAX_CENTER_TAB_ID,
  },
  'lp-portal': {
    id: 'lp-portal',
    routePath: ROUTE_PATHS.lpPortal,
    label: routes.lpPortal.label,
    icon: routes.lpPortal.icon,
    tabs: LP_PORTAL_TABS,
    defaultTabId: DEFAULT_LP_PORTAL_TAB_ID,
  },
  'deal-intelligence': {
    id: 'deal-intelligence',
    routePath: ROUTE_PATHS.dealIntelligence,
    label: routes.dealIntelligence.label,
    icon: routes.dealIntelligence.icon,
    tabs: DEAL_INTELLIGENCE_TABS,
    defaultTabId: DEFAULT_DEAL_INTELLIGENCE_TAB_ID,
  },
  collaboration: {
    id: 'collaboration',
    routePath: ROUTE_PATHS.collaboration,
    label: routes.collaboration.label,
    icon: routes.collaboration.icon,
    tabs: COLLABORATION_TABS,
    defaultTabId: DEFAULT_COLLABORATION_TAB_ID,
  },
  'ai-tools': {
    id: 'ai-tools',
    routePath: ROUTE_PATHS.aiTools,
    label: routes.aiTools.label,
    icon: routes.aiTools.icon,
    tabs: AI_TOOLS_TABS,
    defaultTabId: DEFAULT_AI_TOOLS_TAB_ID,
  },
};

