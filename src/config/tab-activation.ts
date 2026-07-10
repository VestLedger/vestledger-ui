import { ROUTE_PATHS } from "./routes";

/**
 * How to activate a tab on each page: dispatch
 * patchUIState({ key: uiKey, patch: { [field]: tabId } }).
 *
 * uiKey/field pairs MUST mirror the wiring in
 * src/components/sidebar-grouped.tsx (the legacy sidebar's per-page
 * useUIKey calls). If a page's UI key changes, update both places.
 */
export type TabActivation = { uiKey: string; field: string };

export const TAB_ACTIVATION_BY_ROUTE: Readonly<Record<string, TabActivation>> =
  Object.freeze({
    [ROUTE_PATHS.portfolio]: { uiKey: "portfolio", field: "selected" },
    [ROUTE_PATHS.analytics]: { uiKey: "analytics", field: "selected" },
    [ROUTE_PATHS.lpManagement]: {
      uiKey: "lp-management",
      field: "selectedTab",
    },
    [ROUTE_PATHS.compliance]: {
      uiKey: "back-office-compliance",
      field: "selectedTab",
    },
    [ROUTE_PATHS.taxCenter]: {
      uiKey: "back-office-tax-center",
      field: "selectedTab",
    },
    [ROUTE_PATHS.valuations409a]: {
      uiKey: "back-office-valuation-409a",
      field: "selectedTab",
    },
    [ROUTE_PATHS.fundAdmin]: {
      uiKey: "back-office-fund-admin",
      field: "selectedTab",
    },
    [ROUTE_PATHS.lpPortal]: {
      uiKey: "lp-investor-portal",
      field: "selectedTab",
    },
    [ROUTE_PATHS.dealIntelligence]: {
      uiKey: "deal-intelligence",
      field: "selectedDetailTab",
    },
    [ROUTE_PATHS.collaboration]: {
      uiKey: "collaboration-workspace",
      field: "activeTab",
    },
  });
