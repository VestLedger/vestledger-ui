"use client";

import { useEffect, useRef, type MouseEvent } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  GitBranch,
  Briefcase,
  Users,
  UserCheck,
  Settings,
  FileText,
  ChevronLeft,
  Building2,
  ShieldCheck,
  Activity,
  ListChecks,
  FileDown,
} from "lucide-react";
import { NavigationGroup } from "./navigation-group";
import { NavigationItem } from "./navigation-item";
import { useNavigation } from "@/contexts/navigation-context";
import { useAIBadges } from "@/hooks/use-ai-badges";
import { useAuth, UserRole } from "@/contexts/auth-context";
import { useUIKey } from "@/store/ui";
import { BrandLogo } from "./brand-logo";
import { useDashboardDensity } from "@/contexts/dashboard-density-context";
import { ROUTE_PATHS } from "@/config/routes";
import {
  getTaxCenterLabel,
  getValuationsLabel,
} from "@/lib/regulatory-regions";
import {
  DEFAULT_FUND_ADMIN_TAB_ID,
  FUND_ADMIN_TAB_IDS,
} from "@/config/fund-admin-tabs";
import {
  UI_STATE_DEFAULTS,
  UI_STATE_KEYS,
} from "@/store/constants/uiStateKeys";
import {
  ANALYTICS_TAB_IDS,
  DEFAULT_ANALYTICS_TAB_ID,
} from "@/config/analytics-tabs";
import {
  AI_TOOLS_TAB_IDS,
  DEFAULT_AI_TOOLS_TAB_ID,
} from "@/config/ai-tools-tabs";
import {
  COLLABORATION_TAB_IDS,
  DEFAULT_COLLABORATION_TAB_ID,
} from "@/config/collaboration-tabs";
import {
  COMPLIANCE_TAB_IDS,
  DEFAULT_COMPLIANCE_TAB_ID,
} from "@/config/compliance-tabs";
import {
  DEAL_INTELLIGENCE_TAB_IDS,
  DEFAULT_DEAL_INTELLIGENCE_TAB_ID,
} from "@/config/deal-intelligence-tabs";
import {
  DEFAULT_LP_MANAGEMENT_TAB_ID,
  LP_MANAGEMENT_TAB_IDS,
} from "@/config/lp-management-tabs";
import {
  DEFAULT_LP_PORTAL_TAB_ID,
  LP_PORTAL_TAB_IDS,
} from "@/config/lp-portal-tabs";
import {
  DEFAULT_PORTFOLIO_TAB_ID,
  PORTFOLIO_TAB_IDS,
} from "@/config/portfolio-tabs";
import {
  DEFAULT_TAX_CENTER_TAB_ID,
  TAX_CENTER_TAB_IDS,
} from "@/config/tax-center-tabs";
import {
  DEFAULT_VALUATION_409A_TAB_ID,
  VALUATION_409A_TAB_IDS,
} from "@/config/valuation-409a-tabs";
import {
  SIDEBAR_CONTEXTUAL_MENUS,
  type ContextualMenuId,
} from "@/config/sidebar-contextual-menus";
import { buildAdminSuperadminUrl } from "@/config/env";
import { isSuperadminUser } from "@/utils/auth/internal-access";

type FundAdminSidebarUIState = {
  selectedTab: string;
  lpStatusFilter: "all" | "paid" | "partial" | "pending" | "overdue";
};

type SidebarGroupedUIState = {
  isHovered: boolean;
  menuMode: "main" | "contextual";
  contextualMenuId: ContextualMenuId | null;
};

type CollaborationSidebarUIState = {
  searchQuery: string;
  selectedThreadId: string | null;
  taskStatusFilter: "all" | "todo" | "in-progress" | "blocked" | "done";
  messageDraft: string;
  taskTitleDraft: string;
  taskDescriptionDraft: string;
  activeTab: "threads" | "tasks";
};

const CONTEXTUAL_MENU_BY_NAV_ID: Record<string, ContextualMenuId> = {
  portfolio: "portfolio",
  // Other contextual menus (analytics, fund-admin, lp-management, compliance,
  // 409a-valuations, tax-center, deal-intelligence, ai-tools, collaboration)
  // remain wired through the legacy routes; they will be reattached when
  // Phase 2-4 redesigns bring proper nested sub-routes under the new
  // /deals, /funds, /lps, and /workflows landings.
};

/**
 * Phase 1 target navigation: a flat 10-item primary nav.
 *
 * Each item links to its canonical Phase 1 path. `additionalActivePaths`
 * keeps the corresponding nav row highlighted when a user lands on legacy
 * routes that will fold into that section in Phase 2-4 (e.g. /pipeline →
 * Deals, /lp-management → LPs, /fund-admin → Workflows).
 *
 * AI Tools is intentionally absent from the primary nav per Phase 1 rules;
 * the /ai-tools route still resolves and is rehomed under Settings.
 */
type PrimaryNavItem = {
  id: string;
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  /** Legacy/compat paths that should activate this nav item. */
  aliasPaths?: readonly string[];
  /** Roles allowed to see this nav item. Omit to allow all. */
  allowedRoles?: readonly UserRole[];
};

const PRIMARY_NAV: readonly PrimaryNavItem[] = [
  {
    id: "dashboard",
    href: ROUTE_PATHS.dashboard,
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    id: "portfolio",
    href: ROUTE_PATHS.portfolio,
    label: "Portfolio",
    icon: Briefcase,
    aliasPaths: [ROUTE_PATHS.valuations409a],
  },
  {
    id: "deals",
    href: ROUTE_PATHS.deals,
    label: "Deals",
    icon: GitBranch,
    aliasPaths: [
      ROUTE_PATHS.pipeline,
      ROUTE_PATHS.dealIntelligence,
      ROUTE_PATHS.dealflowReview,
    ],
    allowedRoles: [
      "gp",
      "analyst",
      "strategic_partner",
      "ops",
      "ir",
      "researcher",
    ],
  },
  {
    id: "funds",
    href: ROUTE_PATHS.funds,
    label: "Funds",
    icon: Building2,
    aliasPaths: [ROUTE_PATHS.analytics, ROUTE_PATHS.waterfall],
  },
  {
    id: "lps",
    href: ROUTE_PATHS.lps,
    label: "LPs",
    icon: UserCheck,
    aliasPaths: [ROUTE_PATHS.lpManagement, ROUTE_PATHS.contacts],
    allowedRoles: ["gp", "ops", "ir", "analyst", "auditor", "service_provider"],
  },
  {
    id: "signals",
    href: ROUTE_PATHS.signals,
    label: "Signals",
    icon: Activity,
    aliasPaths: [ROUTE_PATHS.notifications],
  },
  {
    id: "reports",
    href: ROUTE_PATHS.reports,
    label: "Reports",
    icon: FileDown,
  },
  {
    id: "documents",
    href: ROUTE_PATHS.documents,
    label: "Documents",
    icon: FileText,
  },
  {
    id: "workflows",
    href: ROUTE_PATHS.workflows,
    label: "Workflows",
    icon: ListChecks,
    aliasPaths: [
      ROUTE_PATHS.fundAdmin,
      ROUTE_PATHS.compliance,
      ROUTE_PATHS.auditTrail,
      ROUTE_PATHS.taxCenter,
      ROUTE_PATHS.collaboration,
    ],
  },
];

// LP role keeps its tailored portal entry alongside the primary nav.
const LP_PORTAL_NAV: readonly PrimaryNavItem[] = [
  {
    id: "lp-portal",
    href: ROUTE_PATHS.lpPortal,
    label: "LP Portal",
    icon: Users,
  },
];

export function SidebarGrouped() {
  const pathname = usePathname();
  const router = useRouter();
  const { updateBadge } = useNavigation();
  const aiBadges = useAIBadges();
  const { user } = useAuth();
  const isSuperadmin = isSuperadminUser(user);
  const density = useDashboardDensity();
  const { value: sidebarUI, patch: patchSidebarUI } =
    useUIKey<SidebarGroupedUIState>("sidebar-grouped", {
      isHovered: false,
      menuMode: "main",
      contextualMenuId: null,
    });

  // Migrate the previous fund-admin-only menu state if present (keeps sidebar usable after updates).
  useEffect(() => {
    const raw = sidebarUI as unknown as {
      menuMode?: unknown;
      contextualMenuId?: unknown;
      fundAdminMenuMode?: unknown;
    };

    if (
      typeof raw.menuMode === "string" &&
      raw.contextualMenuId !== undefined
    ) {
      return;
    }

    const wasFundAdminContextual = raw.fundAdminMenuMode === "contextual";
    patchSidebarUI({
      menuMode: wasFundAdminContextual ? "contextual" : "main",
      contextualMenuId: wasFundAdminContextual ? "fund-admin" : null,
    });
  }, [patchSidebarUI, sidebarUI]);

  const { value: fundAdminUI, patch: patchFundAdminUI } =
    useUIKey<FundAdminSidebarUIState>("back-office-fund-admin", {
      selectedTab: DEFAULT_FUND_ADMIN_TAB_ID,
      lpStatusFilter: "all",
    });

  const { value: portfolioUI, patch: patchPortfolioUI } = useUIKey<{
    selected: string;
  }>("portfolio", {
    selected: DEFAULT_PORTFOLIO_TAB_ID,
  });
  const { value: analyticsUI, patch: patchAnalyticsUI } = useUIKey<{
    selected: string;
  }>("analytics", {
    selected: DEFAULT_ANALYTICS_TAB_ID,
  });
  const { value: aiToolsUI, patch: patchAIToolsUI } = useUIKey<{
    selected: string;
  }>("ai-tools", {
    selected: DEFAULT_AI_TOOLS_TAB_ID,
  });
  const { value: lpManagementUI, patch: patchLPManagementUI } = useUIKey<{
    selectedTab: string;
    selectedLP: unknown | null;
  }>("lp-management", {
    selectedTab: DEFAULT_LP_MANAGEMENT_TAB_ID,
    selectedLP: null,
  });
  const { value: complianceUI, patch: patchComplianceUI } = useUIKey<{
    selectedTab: string;
  }>("back-office-compliance", {
    selectedTab: DEFAULT_COMPLIANCE_TAB_ID,
  });
  const { value: taxCenterUI, patch: patchTaxCenterUI } = useUIKey<{
    selectedTab: string;
  }>("back-office-tax-center", {
    selectedTab: DEFAULT_TAX_CENTER_TAB_ID,
  });
  const { value: valuation409aUI, patch: patchValuation409aUI } = useUIKey<{
    selectedTab: string;
  }>("back-office-valuation-409a", {
    selectedTab: DEFAULT_VALUATION_409A_TAB_ID,
  });
  const { value: lpPortalUI, patch: patchLPPortalUI } = useUIKey<{
    selectedTab: string;
  }>("lp-investor-portal", {
    selectedTab: DEFAULT_LP_PORTAL_TAB_ID,
  });
  const { value: dealIntelligenceUI, patch: patchDealIntelligenceUI } =
    useUIKey<typeof UI_STATE_DEFAULTS.dealIntelligence>(
      UI_STATE_KEYS.DEAL_INTELLIGENCE,
      UI_STATE_DEFAULTS.dealIntelligence,
    );
  const { value: collaborationUI, patch: patchCollaborationUI } =
    useUIKey<CollaborationSidebarUIState>("collaboration-workspace", {
      searchQuery: "",
      selectedThreadId: null,
      taskStatusFilter: "all",
      messageDraft: "",
      taskTitleDraft: "",
      taskDescriptionDraft: "",
      activeTab:
        DEFAULT_COLLABORATION_TAB_ID as CollaborationSidebarUIState["activeTab"],
    });

  const isHovered = sidebarUI.isHovered;
  const menuMode = sidebarUI.menuMode === "contextual" ? "contextual" : "main";
  const contextualMenuId =
    sidebarUI.contextualMenuId &&
    sidebarUI.contextualMenuId in SIDEBAR_CONTEXTUAL_MENUS
      ? sidebarUI.contextualMenuId
      : null;
  const activeContextMenu =
    menuMode === "contextual" && contextualMenuId
      ? SIDEBAR_CONTEXTUAL_MENUS[contextualMenuId]
      : null;
  const isContextual =
    Boolean(activeContextMenu) && pathname === activeContextMenu?.routePath;

  const selectedFundAdminTab = FUND_ADMIN_TAB_IDS.has(fundAdminUI.selectedTab)
    ? fundAdminUI.selectedTab
    : DEFAULT_FUND_ADMIN_TAB_ID;
  const selectedPortfolioTab = PORTFOLIO_TAB_IDS.has(portfolioUI.selected)
    ? portfolioUI.selected
    : DEFAULT_PORTFOLIO_TAB_ID;
  const selectedAnalyticsTab = ANALYTICS_TAB_IDS.has(analyticsUI.selected)
    ? analyticsUI.selected
    : DEFAULT_ANALYTICS_TAB_ID;
  const selectedAIToolsTab = AI_TOOLS_TAB_IDS.has(aiToolsUI.selected)
    ? aiToolsUI.selected
    : DEFAULT_AI_TOOLS_TAB_ID;
  const selectedLPManagementTab = LP_MANAGEMENT_TAB_IDS.has(
    lpManagementUI.selectedTab,
  )
    ? lpManagementUI.selectedTab
    : DEFAULT_LP_MANAGEMENT_TAB_ID;
  const selectedComplianceTab = COMPLIANCE_TAB_IDS.has(complianceUI.selectedTab)
    ? complianceUI.selectedTab
    : DEFAULT_COMPLIANCE_TAB_ID;
  const selectedTaxCenterTab = TAX_CENTER_TAB_IDS.has(taxCenterUI.selectedTab)
    ? taxCenterUI.selectedTab
    : DEFAULT_TAX_CENTER_TAB_ID;
  const selectedValuation409aTab = VALUATION_409A_TAB_IDS.has(
    valuation409aUI.selectedTab,
  )
    ? valuation409aUI.selectedTab
    : DEFAULT_VALUATION_409A_TAB_ID;
  const selectedLPPortalTab = LP_PORTAL_TAB_IDS.has(lpPortalUI.selectedTab)
    ? lpPortalUI.selectedTab
    : DEFAULT_LP_PORTAL_TAB_ID;
  const selectedDealIntelligenceTab = DEAL_INTELLIGENCE_TAB_IDS.has(
    dealIntelligenceUI.selectedDetailTab,
  )
    ? dealIntelligenceUI.selectedDetailTab
    : DEFAULT_DEAL_INTELLIGENCE_TAB_ID;
  const selectedCollaborationTab = COLLABORATION_TAB_IDS.has(
    collaborationUI.activeTab,
  )
    ? collaborationUI.activeTab
    : DEFAULT_COLLABORATION_TAB_ID;
  const pendingOpenRef = useRef<ContextualMenuId | null>(null);

  // Helper to check if a group is accessible
  const isAccessible = (allowedRoles?: readonly UserRole[]) => {
    if (!allowedRoles) return true; // Accessible by all if not defined
    if (!user) return true; // Default to showing if no user (should rely on auth guard, but safe fallback)
    return allowedRoles.includes(user.role);
  };

  const getNavLabel = (itemId: string, fallback: string) => {
    switch (itemId) {
      case "409a-valuations":
        return getValuationsLabel(user?.operatingRegion);
      case "tax-center":
        return getTaxCenterLabel(user?.operatingRegion);
      default:
        return fallback;
    }
  };

  // Auto-collapse by default, expand only while hovered.
  const effectivelyCollapsed = !isHovered;

  // Update navigation badges from AI calculations
  useEffect(() => {
    Object.entries(aiBadges).forEach(([itemId, badge]) => {
      updateBadge(itemId, badge);
    });
  }, [aiBadges, updateBadge]);

  useEffect(() => {
    if (menuMode !== "contextual" || !contextualMenuId) {
      return;
    }

    const config = SIDEBAR_CONTEXTUAL_MENUS[contextualMenuId];
    if (pathname === config.routePath) {
      if (pendingOpenRef.current === contextualMenuId) {
        pendingOpenRef.current = null;
      }
      return;
    }

    if (pendingOpenRef.current === contextualMenuId) {
      return;
    }

    patchSidebarUI({ menuMode: "main", contextualMenuId: null });
  }, [contextualMenuId, menuMode, pathname, patchSidebarUI]);

  const resetContextualSelection = (targetMenuId: ContextualMenuId) => {
    switch (targetMenuId) {
      case "portfolio":
        patchPortfolioUI({ selected: DEFAULT_PORTFOLIO_TAB_ID });
        return;
      case "analytics":
        patchAnalyticsUI({ selected: DEFAULT_ANALYTICS_TAB_ID });
        return;
      case "ai-tools":
        patchAIToolsUI({ selected: DEFAULT_AI_TOOLS_TAB_ID });
        return;
      case "lp-management":
        patchLPManagementUI({ selectedTab: DEFAULT_LP_MANAGEMENT_TAB_ID });
        return;
      case "compliance":
        patchComplianceUI({ selectedTab: DEFAULT_COMPLIANCE_TAB_ID });
        return;
      case "tax-center":
        patchTaxCenterUI({ selectedTab: DEFAULT_TAX_CENTER_TAB_ID });
        return;
      case "valuation-409a":
        patchValuation409aUI({ selectedTab: DEFAULT_VALUATION_409A_TAB_ID });
        return;
      case "fund-admin":
        patchFundAdminUI({ selectedTab: DEFAULT_FUND_ADMIN_TAB_ID });
        return;
      case "lp-portal":
        patchLPPortalUI({ selectedTab: DEFAULT_LP_PORTAL_TAB_ID });
        return;
      case "deal-intelligence":
        patchDealIntelligenceUI({
          selectedDetailTab: DEFAULT_DEAL_INTELLIGENCE_TAB_ID,
        });
        return;
      case "collaboration":
        patchCollaborationUI({ activeTab: DEFAULT_COLLABORATION_TAB_ID });
        return;
      default: {
        const exhaustiveCheck: never = targetMenuId;
        void exhaustiveCheck;
        return;
      }
    }
  };

  const openContextualMenu =
    (targetMenuId: ContextualMenuId) =>
    (event: MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();
      pendingOpenRef.current = targetMenuId;
      resetContextualSelection(targetMenuId);
      patchSidebarUI({
        menuMode: "contextual",
        contextualMenuId: targetMenuId,
      });
      const config = SIDEBAR_CONTEXTUAL_MENUS[targetMenuId];
      if (pathname !== config.routePath) {
        router.push(config.routePath);
      }
    };

  const closeContextualMenu = () => {
    if (contextualMenuId) {
      resetContextualSelection(contextualMenuId);
    }
    pendingOpenRef.current = null;
    patchSidebarUI({ menuMode: "main", contextualMenuId: null });
  };

  const setContextualSelection = (
    targetMenuId: ContextualMenuId,
    tabId: string,
  ) => {
    switch (targetMenuId) {
      case "portfolio":
        patchPortfolioUI({ selected: tabId });
        return;
      case "analytics":
        patchAnalyticsUI({ selected: tabId });
        return;
      case "ai-tools":
        patchAIToolsUI({ selected: tabId });
        return;
      case "lp-management":
        patchLPManagementUI({ selectedTab: tabId });
        return;
      case "compliance":
        patchComplianceUI({ selectedTab: tabId });
        return;
      case "tax-center":
        patchTaxCenterUI({ selectedTab: tabId });
        return;
      case "valuation-409a":
        patchValuation409aUI({ selectedTab: tabId });
        return;
      case "fund-admin":
        patchFundAdminUI({ selectedTab: tabId });
        return;
      case "lp-portal":
        patchLPPortalUI({ selectedTab: tabId });
        return;
      case "collaboration":
        patchCollaborationUI({
          activeTab: tabId as CollaborationSidebarUIState["activeTab"],
        });
        return;
      case "deal-intelligence":
        patchDealIntelligenceUI({
          selectedDetailTab:
            tabId as typeof dealIntelligenceUI.selectedDetailTab,
          viewMode: "per-deal",
        });
        return;
      default: {
        const exhaustiveCheck: never = targetMenuId;
        void exhaustiveCheck;
        return;
      }
    }
  };

  const getSelectedTabForContextualMenu = (
    targetMenuId: ContextualMenuId,
  ): string => {
    switch (targetMenuId) {
      case "portfolio":
        return selectedPortfolioTab;
      case "analytics":
        return selectedAnalyticsTab;
      case "ai-tools":
        return selectedAIToolsTab;
      case "lp-management":
        return selectedLPManagementTab;
      case "compliance":
        return selectedComplianceTab;
      case "tax-center":
        return selectedTaxCenterTab;
      case "valuation-409a":
        return selectedValuation409aTab;
      case "fund-admin":
        return selectedFundAdminTab;
      case "lp-portal":
        return selectedLPPortalTab;
      case "deal-intelligence":
        return selectedDealIntelligenceTab;
      case "collaboration":
        return selectedCollaborationTab;
      default: {
        const exhaustiveCheck: never = targetMenuId;
        return exhaustiveCheck;
      }
    }
  };

  return (
    <motion.aside
      animate={{
        width: effectivelyCollapsed
          ? `${density.shell.leftSidebarCollapsedWidthPx}px`
          : `${density.shell.leftSidebarExpandedWidthPx}px`,
      }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="relative flex flex-col h-full overflow-hidden border-r border-app-border dark:border-app-dark-border bg-gradient-to-t from-app-primary/10 dark:from-app-dark-primary/15 to-app-surface dark:to-app-dark-surface"
      onMouseEnter={() => patchSidebarUI({ isHovered: true })}
      onMouseLeave={() => patchSidebarUI({ isHovered: false })}
      style={{
        willChange: "width",
      }}
    >
      {/* Header / Branding */}
      <div
        className={`${density.shell.sidebarHeaderPaddingClass} border-b border-app-border dark:border-app-dark-border flex-shrink-0 flex items-center`}
        style={{ height: `${density.shell.topBarHeightPx}px` }}
      >
        {effectivelyCollapsed ? (
          <div className="flex items-center justify-center w-full">
            <div className="w-9 h-9 rounded-lg bg-app-surface/80 dark:bg-app-dark-surface/80 border border-app-border dark:border-app-dark-border flex items-center justify-center text-2xl">
              <BrandLogo className="h-[1em] w-[1em] text-[var(--app-primary)]" />
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-app-surface/80 dark:bg-app-dark-surface/80 border border-app-border dark:border-app-dark-border flex items-center justify-center text-2xl">
              <BrandLogo className="h-[1em] w-[1em] text-[var(--app-primary)]" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-app-text dark:text-app-dark-text">
                VestLedger
              </h1>
              <p className="text-xs text-app-text-muted dark:text-app-dark-text-muted">
                AI-Powered VC
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Groups */}
      <nav
        className={`flex-1 overflow-y-auto overflow-x-hidden ${effectivelyCollapsed ? "no-scrollbar" : ""} ${density.shell.sidebarNavPaddingClass} ${density.shell.sidebarNavGapClass}`}
      >
        {isSuperadmin ? (
          <NavigationGroup
            id="internal-admin"
            label="Internal Admin"
            icon={ShieldCheck}
            alwaysExpanded={true}
            isCollapsed={effectivelyCollapsed}
          >
            <NavigationItem
              id="superadmin"
              href={ROUTE_PATHS.superadmin}
              label="Superadmin Cockpit"
              icon={ShieldCheck}
              isCollapsed={effectivelyCollapsed}
              onClick={(event) => {
                if (typeof window === "undefined") {
                  return;
                }

                if (!window.location.hostname.startsWith("admin.")) {
                  event.preventDefault();
                  window.location.href = buildAdminSuperadminUrl(
                    window.location.hostname,
                  );
                }
              }}
            />
          </NavigationGroup>
        ) : isContextual && activeContextMenu && contextualMenuId ? (
          <div className="mb-2">
            {effectivelyCollapsed ? (
              <button
                type="button"
                onClick={closeContextualMenu}
                aria-label="Back to Main Menu"
                title="Back to Main Menu"
                className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-app-surface-hover dark:hover:bg-app-dark-surface-hover transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-app-text-muted dark:text-app-dark-text-muted" />
              </button>
            ) : (
              (() => {
                const ContextIcon = activeContextMenu.icon;
                return (
                  <div
                    className={`w-full flex items-center gap-2 ${
                      density.mode === "compact" ? "px-2.5 py-1.5" : "px-3 py-2"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={closeContextualMenu}
                      aria-label="Back to Main Menu"
                      title="Back to Main Menu"
                      className="p-1 rounded-md hover:bg-app-surface-hover dark:hover:bg-app-dark-surface-hover transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4 text-app-text-muted dark:text-app-dark-text-muted" />
                    </button>
                    <ContextIcon className="w-4 h-4 text-app-primary dark:text-app-dark-primary" />
                    <span
                      className={`${
                        density.mode === "compact"
                          ? "text-[11px] font-semibold uppercase tracking-wider"
                          : "text-xs font-semibold uppercase tracking-wider"
                      } text-app-text dark:text-app-dark-text`}
                    >
                      {activeContextMenu.label}
                    </span>
                  </div>
                );
              })()
            )}

            <div
              className={effectivelyCollapsed ? "space-y-1" : "mt-1 space-y-1"}
            >
              {contextualMenuId === "deal-intelligence" ? (
                <>
                  <NavigationItem
                    id="deal-intelligence-fund-overview"
                    href={ROUTE_PATHS.dealIntelligence}
                    label="Fund Overview"
                    icon={LayoutDashboard}
                    isCollapsed={effectivelyCollapsed}
                    isActiveOverride={
                      dealIntelligenceUI.viewMode !== "per-deal"
                    }
                    onClick={(event) => {
                      event.preventDefault();
                      patchDealIntelligenceUI({
                        viewMode: "fund-level",
                        selectedDeal: null,
                        selectedDetailTab: DEFAULT_DEAL_INTELLIGENCE_TAB_ID,
                      });
                    }}
                  />
                  {dealIntelligenceUI.selectedDeal
                    ? activeContextMenu.tabs.map((tab) => (
                        <NavigationItem
                          key={tab.id}
                          id={`contextual-${contextualMenuId}-${tab.id}`}
                          href={activeContextMenu.routePath}
                          label={tab.label}
                          icon={tab.icon}
                          isCollapsed={effectivelyCollapsed}
                          isActiveOverride={
                            dealIntelligenceUI.viewMode === "per-deal" &&
                            selectedDealIntelligenceTab === tab.id
                          }
                          onClick={(event) => {
                            event.preventDefault();
                            setContextualSelection(contextualMenuId, tab.id);
                          }}
                        />
                      ))
                    : null}
                </>
              ) : (
                activeContextMenu.tabs.map((tab) => (
                  <NavigationItem
                    key={tab.id}
                    id={`contextual-${contextualMenuId}-${tab.id}`}
                    href={activeContextMenu.routePath}
                    label={tab.label}
                    icon={tab.icon}
                    isCollapsed={effectivelyCollapsed}
                    isActiveOverride={
                      getSelectedTabForContextualMenu(contextualMenuId) ===
                      tab.id
                    }
                    onClick={(event) => {
                      event.preventDefault();
                      setContextualSelection(contextualMenuId, tab.id);
                    }}
                  />
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            {/* Phase 1 target navigation: flat 10-item primary nav. */}
            {PRIMARY_NAV.filter((item) => isAccessible(item.allowedRoles)).map(
              (item) => {
                const contextualTarget = CONTEXTUAL_MENU_BY_NAV_ID[item.id];
                return (
                  <NavigationItem
                    key={item.id}
                    id={item.id}
                    href={item.href}
                    label={getNavLabel(item.id, item.label)}
                    icon={item.icon}
                    isCollapsed={effectivelyCollapsed}
                    additionalActivePaths={item.aliasPaths}
                    onClick={
                      contextualTarget
                        ? openContextualMenu(contextualTarget)
                        : undefined
                    }
                  />
                );
              },
            )}

            {/* LP Portal entry kept for LP users alongside the primary nav. */}
            {user?.role === "lp" && (
              <div className="pt-2 mt-2 border-t border-app-border dark:border-app-dark-border">
                {LP_PORTAL_NAV.map((item) => (
                  <NavigationItem
                    key={item.id}
                    id={item.id}
                    href={item.href}
                    label={getNavLabel(item.id, item.label)}
                    icon={item.icon}
                    isCollapsed={effectivelyCollapsed}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Footer */}
      <div
        className={`${density.shell.sidebarNavPaddingClass} border-t border-app-border dark:border-app-dark-border space-y-3 flex-shrink-0`}
      >
        {!isSuperadmin && (
          <NavigationItem
            id="settings"
            href={ROUTE_PATHS.settings}
            label="Settings"
            icon={Settings}
            isCollapsed={effectivelyCollapsed}
          />
        )}
      </div>
    </motion.aside>
  );
}
