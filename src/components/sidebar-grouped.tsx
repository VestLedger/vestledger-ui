"use client";

import { useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  LayoutDashboard,
  Search,
  FileText,
  Vote,
  Activity,
  FileDown,
  Building2,
  Shield,
  Settings,
  ChevronLeft,
  ShieldCheck,
  GitBranch,
  Briefcase,
  TrendingUp,
  Users,
  UserCheck,
  DollarSign,
  Scale,
  Receipt,
  Sparkles,
  BarChart3,
  Plug,
  FileCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
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
  /**
   * `main` — render the eight primary destinations + the inline sub-leaves
   *   area for whichever primary the path or the user has expanded (the
   *   default state on any fresh page load).
   * `contextual` — render the existing per-workspace contextual menu
   *   identified by `contextualMenuId` (in-page tabs). Reached by clicking
   *   a primary with `contextualMenuId` or a sub-leaf with
   *   `contextualMenuId`. Replaces the main view per existing behaviour.
   *
   * Sub-leaf expansion is intentionally NOT persisted on this struct —
   * it is derived from the current route (auto-expand on a child route)
   * plus a transient component-local manual toggle. This guarantees a
   * page reload always lands the user back on the eight primaries with
   * sub-leaves visible only when the route actually warrants it.
   */
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

// P2-007: legacy leaf → contextual menu map removed. The simplified flat
// `PRIMARY_DESTINATIONS` array declares its own `contextualMenuId` per
// destination, so the lookup is unnecessary.

/**
 * P2-007 — Simplified primary navigation per
 * `sidebar-ia-design-p2-007a.md`.
 *
 * The sidebar exposes EXACTLY eight functional destinations (acceptance
 * criterion: "primary sidebar has no more than 8 top-level destinations").
 *
 * Reachability contract — every legacy sidebar leaf AND every existing
 * `SIDEBAR_CONTEXTUAL_MENUS` config remains reachable from one of the
 * eight primaries, preserving the existing per-leaf-opens-contextual-menu
 * behaviour. Primaries that consolidate multiple workspaces use a level-1
 * sub-leaf menu; each sub-leaf carries the same `contextualMenuId` opener
 * the old sidebar leaves used. The legacy `CONTEXTUAL_MENU_BY_NAV_ID`
 * lookup is no longer needed because the mapping is declared inline on
 * each sub-leaf.
 */
export type PrimaryDestinationId =
  | "dashboard"
  | "screening"
  | "diligence-evidence"
  | "decisions-memos"
  | "monitoring"
  | "reporting-lp-proof"
  | "fund-compliance-operations"
  | "governance-admin";

export interface PrimarySubLeaf {
  /** Stable id; reused for `useNavigation()` badges. */
  id: string;
  label: string;
  icon: LucideIcon;
  /** Target route the sub-leaf navigates to. */
  href: string;
  /**
   * When set, clicking the sub-leaf fires the existing
   * `openContextualMenu(contextualMenuId)` opener after navigation — the
   * SAME behaviour the old sidebar leaves had.
   */
  contextualMenuId?: ContextualMenuId;
  /** Optional per-leaf role restriction in addition to the parent primary. */
  allowedRoles?: UserRole[];
}

export interface PrimaryDestination {
  id: PrimaryDestinationId;
  label: string;
  href: string;
  icon: LucideIcon;
  /**
   * Roles permitted to see this destination in the sidebar. Backend policy
   * (P1-007) remains the source of truth for access; this is presentation
   * gating per UX-09.
   */
  allowedRoles: UserRole[];
  /**
   * When set, clicking the primary directly fires the existing
   * `openContextualMenu(contextualMenuId)` opener. Used for primaries that
   * map 1:1 to a single existing workspace contextual.
   *
   * Mutually exclusive with `subLeaves`.
   */
  contextualMenuId?: ContextualMenuId;
  /**
   * When set, clicking the primary opens a level-1 sub-leaf menu showing
   * the contained workspaces. Each sub-leaf can in turn open its own
   * existing contextual menu — preserving the legacy behaviour where
   * clicking, e.g., "Compliance" opened the compliance contextual.
   */
  subLeaves?: PrimarySubLeaf[];
}

export const PRIMARY_DESTINATIONS: readonly PrimaryDestination[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    href: ROUTE_PATHS.dashboard,
    icon: LayoutDashboard,
    allowedRoles: [
      "gp",
      "analyst",
      "ops",
      "ir",
      "researcher",
      "lp",
      "auditor",
      "service_provider",
      "strategic_partner",
    ],
  },
  {
    id: "screening",
    label: "Screening",
    href: ROUTE_PATHS.pipeline,
    icon: Search,
    allowedRoles: ["gp", "analyst", "researcher", "strategic_partner"],
    subLeaves: [
      {
        id: "pipeline",
        label: "Pipeline",
        icon: GitBranch,
        href: ROUTE_PATHS.pipeline,
      },
      {
        id: "dealflow-review",
        label: "Dealflow Review",
        icon: Vote,
        href: ROUTE_PATHS.dealflowReview,
      },
      {
        id: "deal-intelligence",
        label: "Deal Intelligence",
        icon: Search,
        href: ROUTE_PATHS.dealIntelligence,
        contextualMenuId: "deal-intelligence",
      },
      {
        id: "contacts",
        label: "Contacts",
        icon: Users,
        href: ROUTE_PATHS.contacts,
      },
    ],
  },
  {
    id: "diligence-evidence",
    label: "Diligence & Evidence",
    href: ROUTE_PATHS.documents,
    icon: FileText,
    allowedRoles: [
      "gp",
      "analyst",
      "researcher",
      "strategic_partner",
      "ops",
      "auditor",
    ],
  },
  {
    id: "decisions-memos",
    label: "Decisions & Memos",
    href: ROUTE_PATHS.collaboration,
    icon: Vote,
    allowedRoles: ["gp", "analyst"],
    contextualMenuId: "collaboration",
  },
  {
    id: "monitoring",
    label: "Monitoring",
    href: ROUTE_PATHS.portfolio,
    icon: Activity,
    allowedRoles: ["gp", "analyst", "researcher", "lp"],
    subLeaves: [
      {
        id: "portfolio",
        label: "Portfolio",
        icon: Briefcase,
        href: ROUTE_PATHS.portfolio,
        contextualMenuId: "portfolio",
      },
      {
        id: "analytics",
        label: "Analytics",
        icon: BarChart3,
        href: ROUTE_PATHS.analytics,
        contextualMenuId: "analytics",
      },
      {
        id: "waterfall",
        label: "Waterfall",
        icon: TrendingUp,
        href: ROUTE_PATHS.waterfall,
      },
    ],
  },
  {
    id: "reporting-lp-proof",
    label: "Reporting & LP Proof",
    href: ROUTE_PATHS.reports,
    icon: FileDown,
    allowedRoles: ["gp", "ops", "ir", "lp", "auditor"],
    subLeaves: [
      {
        id: "reports",
        label: "Reports",
        icon: FileDown,
        href: ROUTE_PATHS.reports,
      },
      {
        id: "lp-management",
        label: "LP Management",
        icon: UserCheck,
        href: ROUTE_PATHS.lpManagement,
        contextualMenuId: "lp-management",
      },
      {
        id: "lp-portal",
        label: "LP Portal",
        icon: Users,
        href: ROUTE_PATHS.lpPortal,
        contextualMenuId: "lp-portal",
        allowedRoles: ["gp", "lp", "ir"],
      },
    ],
  },
  {
    id: "fund-compliance-operations",
    label: "Fund & Compliance Operations",
    href: ROUTE_PATHS.fundAdmin,
    icon: Building2,
    allowedRoles: ["gp", "ops", "auditor", "service_provider"],
    subLeaves: [
      {
        id: "fund-admin",
        label: "Fund Admin",
        icon: DollarSign,
        href: ROUTE_PATHS.fundAdmin,
        contextualMenuId: "fund-admin",
      },
      {
        id: "compliance",
        label: "Compliance",
        icon: FileCheck,
        href: ROUTE_PATHS.compliance,
        contextualMenuId: "compliance",
      },
      {
        id: "tax-center",
        label: "Tax Center",
        icon: Scale,
        href: ROUTE_PATHS.taxCenter,
        contextualMenuId: "tax-center",
      },
      {
        id: "409a-valuations",
        label: "409A Valuations",
        icon: Receipt,
        href: ROUTE_PATHS.valuations409a,
        contextualMenuId: "valuation-409a",
      },
      {
        id: "audit-trail",
        label: "Audit Trail",
        icon: Shield,
        href: ROUTE_PATHS.auditTrail,
      },
    ],
  },
  {
    id: "governance-admin",
    label: "Governance & Admin",
    href: ROUTE_PATHS.settings,
    icon: Shield,
    allowedRoles: ["gp", "auditor"],
    subLeaves: [
      {
        id: "settings",
        label: "Settings",
        icon: Settings,
        href: ROUTE_PATHS.settings,
      },
      {
        id: "integrations",
        label: "Integrations",
        icon: Plug,
        href: ROUTE_PATHS.integrations,
      },
      {
        id: "ai-tools",
        label: "AI Tools",
        icon: Sparkles,
        href: ROUTE_PATHS.aiTools,
        contextualMenuId: "ai-tools",
      },
    ],
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

  // Migrate previous sidebar UI state to the P2-007 shape.
  //   * Old `fundAdminMenuMode` (pre-contextual-system) → coerce to a
  //     'contextual' open on `fund-admin`.
  //   * Old `'primary-expand'` `menuMode` (an interim P2-007 state that
  //     replaced the main view; superseded by the inline sub-leaves area)
  //     → coerce back to `'main'`.
  //   * Persisted `expandedPrimaryId` (no longer in this shape) → ignored;
  //     expansion is now derived from `pathname` + a transient state.
  useEffect(() => {
    const raw = sidebarUI as unknown as {
      menuMode?: unknown;
      contextualMenuId?: unknown;
      fundAdminMenuMode?: unknown;
      expandedPrimaryId?: unknown;
    };

    const menuModeValid =
      raw.menuMode === "main" || raw.menuMode === "contextual";
    const contextualIdValid =
      raw.contextualMenuId === null || typeof raw.contextualMenuId === "string";

    if (
      menuModeValid &&
      contextualIdValid &&
      raw.expandedPrimaryId === undefined
    ) {
      return;
    }

    const wasFundAdminContextual = raw.fundAdminMenuMode === "contextual";
    patchSidebarUI({
      menuMode: wasFundAdminContextual ? "contextual" : "main",
      contextualMenuId: wasFundAdminContextual ? "fund-admin" : null,
    });
  }, [patchSidebarUI, sidebarUI]);

  // Transient user-toggled expansion. NOT persisted — reset on every path
  // change so navigating somewhere new always falls back to the
  // pathname-driven auto-expand.
  const [manualExpandedPrimary, setManualExpandedPrimary] =
    useState<PrimaryDestinationId | null>(null);
  useEffect(() => {
    setManualExpandedPrimary(null);
  }, [pathname]);

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
  const menuMode: SidebarGroupedUIState["menuMode"] =
    sidebarUI.menuMode === "contextual" ? "contextual" : "main";
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

  // Auto-expand the primary whose sub-leaves cover the current pathname.
  // Pure derivation — survives page reload because it's pathname-driven.
  const autoExpandedFromPath = useMemo<PrimaryDestinationId | null>(() => {
    for (const primary of PRIMARY_DESTINATIONS) {
      for (const leaf of primary.subLeaves ?? []) {
        if (pathname === leaf.href || pathname.startsWith(`${leaf.href}/`)) {
          return primary.id;
        }
      }
    }
    return null;
  }, [pathname]);

  // Resolved expanded primary. Manual override wins when set; otherwise
  // pathname-driven auto-expand applies. Either may be null → sub-leaves
  // area is hidden.
  const expandedPrimaryId: PrimaryDestinationId | null =
    manualExpandedPrimary ?? autoExpandedFromPath;
  const expandedPrimary: PrimaryDestination | null = expandedPrimaryId
    ? (PRIMARY_DESTINATIONS.find((d) => d.id === expandedPrimaryId) ?? null)
    : null;

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
  const isAccessible = (allowedRoles?: UserRole[]) => {
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

    patchSidebarUI({
      menuMode: "main",
      contextualMenuId: null,
    });
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
    patchSidebarUI({
      menuMode: "main",
      contextualMenuId: null,
    });
  };

  /**
   * Toggle the inline sub-leaves area for a primary that consolidates
   * multiple workspaces. Behaviour:
   *
   *   • Click an unexpanded primary → expand it (manual override).
   *   • Click the currently expanded primary → collapse the manual
   *     override. If the pathname still matches one of this primary's
   *     sub-leaves, `autoExpandedFromPath` keeps it visible (the parent
   *     of your current page is always inferable). Off-route primaries
   *     fully collapse.
   */
  const handlePrimaryToggle =
    (primaryId: PrimaryDestinationId) =>
    (event: MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();
      setManualExpandedPrimary((prev) =>
        prev === primaryId ? null : primaryId,
      );
    };

  /**
   * Direct-route primary click — clears any manual sub-leaf override and
   * lets the `<NavigationItem>` anchor navigate to the primary's href.
   */
  const handleDirectPrimaryClick = (_primaryId: PrimaryDestinationId) => () => {
    setManualExpandedPrimary(null);
  };

  /**
   * Sub-leaf click. Mirrors the legacy per-leaf behaviour: if the leaf
   * carries a `contextualMenuId`, open that contextual menu (which both
   * navigates and surfaces its in-page tabs); otherwise let the
   * `<NavigationItem>` anchor navigate to the leaf's href.
   */
  const handleSubLeafClick =
    (leaf: PrimarySubLeaf) => (event: MouseEvent<HTMLAnchorElement>) => {
      if (leaf.contextualMenuId) {
        openContextualMenu(leaf.contextualMenuId)(event);
      }
      // No-op when no contextual menu — anchor href handles navigation
      // and the `pathname` effect resets `manualExpandedPrimary` after.
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
                    window.location.host,
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
          // P2-007: dual-zone main view.
          //   • Top: the eight primaries are always visible (acceptance
          //     criterion "primary sidebar has no more than 8 top-level
          //     destinations").
          //   • Bottom: an inline sub-leaves area that auto-populates
          //     when the current pathname matches one of the active
          //     primary's sub-leaves, or when the user manually toggles
          //     a primary that consolidates multiple workspaces.
          //     Switching primaries triggers a horizontal slide: old
          //     set slides left, new set slides in from the right.
          <>
            <div
              className="space-y-1"
              data-testid="sidebar-primary-destinations"
            >
              {PRIMARY_DESTINATIONS.filter((destination) =>
                isAccessible(destination.allowedRoles),
              ).map((destination) => {
                const isExpanded = expandedPrimaryId === destination.id;
                const hasSubLeaves = (destination.subLeaves?.length ?? 0) > 0;
                return (
                  <NavigationItem
                    key={destination.id}
                    id={destination.id}
                    href={destination.href}
                    label={getNavLabel(destination.id, destination.label)}
                    icon={destination.icon}
                    isCollapsed={effectivelyCollapsed}
                    isActiveOverride={
                      hasSubLeaves && isExpanded ? true : undefined
                    }
                    onClick={
                      destination.contextualMenuId
                        ? openContextualMenu(destination.contextualMenuId)
                        : hasSubLeaves
                          ? handlePrimaryToggle(destination.id)
                          : handleDirectPrimaryClick(destination.id)
                    }
                  />
                );
              })}
            </div>

            <div
              className="mt-2 overflow-hidden"
              data-testid="sidebar-primary-sub-leaves-region"
            >
              <AnimatePresence initial={false}>
                {expandedPrimary &&
                  (expandedPrimary.subLeaves?.length ?? 0) > 0 && (
                    <motion.div
                      key={expandedPrimary.id}
                      initial={{ x: 24, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: -24, opacity: 0 }}
                      transition={{ duration: 0.18, ease: "easeOut" }}
                      className="border-t border-app-border dark:border-app-dark-border pt-2"
                      data-testid="sidebar-primary-sub-leaves"
                      data-expanded-primary={expandedPrimary.id}
                    >
                      {!effectivelyCollapsed && (
                        <div
                          className={`mb-1 px-3 ${
                            density.mode === "compact"
                              ? "text-[10px]"
                              : "text-[11px]"
                          } font-semibold uppercase tracking-wider text-app-text-muted dark:text-app-dark-text-muted`}
                        >
                          {expandedPrimary.label}
                        </div>
                      )}
                      <div className="space-y-1">
                        {(expandedPrimary.subLeaves ?? [])
                          .filter((leaf) => isAccessible(leaf.allowedRoles))
                          .map((leaf) => (
                            <NavigationItem
                              key={leaf.id}
                              id={leaf.id}
                              href={leaf.href}
                              label={getNavLabel(leaf.id, leaf.label)}
                              icon={leaf.icon}
                              isCollapsed={effectivelyCollapsed}
                              onClick={handleSubLeafClick(leaf)}
                            />
                          ))}
                      </div>
                    </motion.div>
                  )}
              </AnimatePresence>
            </div>
          </>
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
