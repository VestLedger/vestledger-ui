import {
  Briefcase,
  DollarSign,
  Receipt,
  Users,
  BarChart3,
  TrendingUp,
  Scale,
  GitBranch,
} from "lucide-react";
import type { ContextualTabConfig } from "./contextual-tabs";
import { ROUTE_PATHS } from "./routes";

/**
 * P2-008: legacy `FundAdminTabConfig` alias is folded into the unified
 * `ContextualTabConfig` shape. The alias is retained for backwards
 * compatibility with existing imports.
 */
export type FundAdminTabConfig = ContextualTabConfig;

const FUND_ADMIN_DEFAULTS = {
  route: ROUTE_PATHS.fundAdmin,
  state: "live" as const,
  permission: null,
  owner: "fund-admin" as const,
};

export const FUND_ADMIN_TABS: FundAdminTabConfig[] = [
  {
    id: "fund-setup",
    label: "Fund Setup",
    icon: Briefcase,
    ...FUND_ADMIN_DEFAULTS,
    permission: "funds.create",
  },
  {
    id: "capital-calls",
    label: "Capital Calls",
    icon: DollarSign,
    ...FUND_ADMIN_DEFAULTS,
    permission: "capital_calls.read",
  },
  {
    id: "distributions",
    label: "Distributions",
    icon: Receipt,
    ...FUND_ADMIN_DEFAULTS,
    permission: "distributions.read",
  },
  {
    id: "lp-responses",
    label: "LP Responses",
    icon: Users,
    ...FUND_ADMIN_DEFAULTS,
    permission: "lp.read",
  },
  {
    id: "nav-calculator",
    label: "NAV Calculator",
    icon: BarChart3,
    ...FUND_ADMIN_DEFAULTS,
    permission: "nav.read",
  },
  {
    id: "carried-interest",
    label: "Carried Interest",
    icon: TrendingUp,
    ...FUND_ADMIN_DEFAULTS,
    permission: "carry.read",
  },
  {
    id: "expenses",
    label: "Expenses",
    icon: Scale,
    ...FUND_ADMIN_DEFAULTS,
    permission: "expenses.read",
  },
  {
    id: "secondary-transfers",
    label: "Secondary Transfers",
    icon: GitBranch,
    ...FUND_ADMIN_DEFAULTS,
    permission: "transfers.read",
  },
];

export const DEFAULT_FUND_ADMIN_TAB_ID = FUND_ADMIN_TABS[0]?.id ?? "fund-setup";

export const FUND_ADMIN_TAB_IDS = new Set(FUND_ADMIN_TABS.map((tab) => tab.id));
