import type {
  ContextualTabConfig,
  TabOwner,
  TabState,
} from "./contextual-tabs";
import { AI_TOOLS_TABS } from "./ai-tools-tabs";
import { ANALYTICS_TABS } from "./analytics-tabs";
import { COLLABORATION_TABS } from "./collaboration-tabs";
import { COMPLIANCE_TABS } from "./compliance-tabs";
import { DEAL_INTELLIGENCE_TABS } from "./deal-intelligence-tabs";
import { FUND_ADMIN_TABS } from "./fund-admin-tabs";
import { LP_MANAGEMENT_TABS } from "./lp-management-tabs";
import { LP_PORTAL_TABS } from "./lp-portal-tabs";
import { PORTFOLIO_TABS } from "./portfolio-tabs";
import { TAX_CENTER_TABS } from "./tax-center-tabs";
import { VALUATION_409A_TABS } from "./valuation-409a-tabs";

/**
 * P2-008 — central contextual tab registry.
 *
 * Aggregates every kept contextual tab across the application into a
 * single flat list. Each entry carries the unified
 * {@link ContextualTabConfig} shape (id, label, icon, route, state,
 * permission, owner), satisfying the P2-008 acceptance criterion:
 *
 *   "All kept tabs are registered with label, route, state, permission,
 *    owner."
 *
 * Downstream consumers (sidebar, command palette in P2-009, route guards,
 * future inline-tab migration) should source tab metadata from this
 * registry rather than re-importing per-workspace tab modules.
 */
export const CONTEXTUAL_TAB_REGISTRY: readonly ContextualTabConfig[] = [
  ...PORTFOLIO_TABS,
  ...ANALYTICS_TABS,
  ...FUND_ADMIN_TABS,
  ...LP_MANAGEMENT_TABS,
  ...LP_PORTAL_TABS,
  ...COMPLIANCE_TABS,
  ...TAX_CENTER_TABS,
  ...VALUATION_409A_TABS,
  ...DEAL_INTELLIGENCE_TABS,
  ...COLLABORATION_TABS,
  ...AI_TOOLS_TABS,
];

/**
 * The eleven workspace owners currently registered. Used by tests and by
 * the sidebar reachability guard to confirm no workspace's tabs are
 * silently dropped from the registry.
 */
export const REGISTERED_OWNERS: readonly TabOwner[] = [
  "portfolio",
  "analytics",
  "fund-admin",
  "lp-management",
  "lp-portal",
  "compliance",
  "tax-center",
  "valuation-409a",
  "deal-intelligence",
  "collaboration",
  "ai-tools",
];

/**
 * Lookup helper — returns every registered tab for a given workspace.
 */
export function tabsForOwner(owner: TabOwner): ContextualTabConfig[] {
  return CONTEXTUAL_TAB_REGISTRY.filter((tab) => tab.owner === owner);
}

/**
 * Lookup helper — returns every registered tab in a given readiness state.
 * Useful for the data-state badge / UnavailableState renderers.
 */
export function tabsInState(state: TabState): ContextualTabConfig[] {
  return CONTEXTUAL_TAB_REGISTRY.filter((tab) => tab.state === state);
}
