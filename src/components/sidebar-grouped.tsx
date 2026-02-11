'use client'

import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { LayoutDashboard, GitBranch, Briefcase, Search, Vote, TrendingUp, Users, UserCheck, DollarSign, Shield, Scale, Receipt, FileDown, Sparkles, Activity, BarChart3, Settings, FileText, Plug, ChevronLeft, FileCheck, Building2, Target, Layers, Mail } from 'lucide-react';
import { NavigationGroup } from './navigation-group';
import { NavigationItem } from './navigation-item';
import { SidebarToggleButton } from './sidebar-toggle-button';
import { useNavigation } from '@/contexts/navigation-context';
import { useAIBadges } from '@/hooks/use-ai-badges';
import { useAuth, UserRole } from '@/contexts/auth-context';
import { useUIKey } from '@/store/ui';
import { BrandLogo } from './brand-logo';
import { useDashboardDensity } from '@/contexts/dashboard-density-context';
import { ROUTE_PATHS } from '@/config/routes';
import {
  DEFAULT_FUND_ADMIN_TAB_ID,
  FUND_ADMIN_TAB_IDS,
  FUND_ADMIN_TABS,
} from '@/config/fund-admin-tabs';

type FundAdminSidebarUIState = {
  selectedTab: string;
  lpStatusFilter: 'all' | 'paid' | 'partial' | 'pending' | 'overdue';
};

type SidebarGroupedUIState = {
  isHovered: boolean;
  fundAdminMenuMode: 'main' | 'contextual';
};

// Define navigation structure
const navigationStructure = {
  coreOperations: {
    id: 'core-operations',
    label: 'Core Operations',
    icon: Activity,
    alwaysExpanded: true,
    // All roles can access core operations
    items: [
      { id: 'dashboard', href: ROUTE_PATHS.dashboard, label: 'Dashboard', icon: LayoutDashboard },
      { id: 'pipeline', href: ROUTE_PATHS.pipeline, label: 'Pipeline', icon: GitBranch },
      { id: 'portfolio', href: ROUTE_PATHS.portfolio, label: 'Portfolio', icon: Briefcase },
    ],
  },
  dealManagement: {
    id: 'deal-management',
    label: 'Deal Management',
    icon: Target,
    allowedRoles: ['gp', 'analyst', 'strategic_partner'] as UserRole[],
    items: [
      { id: 'deal-intelligence', href: ROUTE_PATHS.dealIntelligence, label: 'Deal Intelligence', icon: Search },
      { id: 'dealflow-review', href: ROUTE_PATHS.dealflowReview, label: 'Dealflow Review', icon: Vote },
    ],
  },
  portfolioManagement: {
    id: 'portfolio-management',
    label: 'Portfolio Mgmt',
    icon: Layers,
    allowedRoles: ['gp', 'analyst', 'researcher', 'lp'] as UserRole[],
    items: [
      { id: 'waterfall', href: ROUTE_PATHS.waterfall, label: 'Waterfall', icon: TrendingUp },
      { id: 'analytics', href: ROUTE_PATHS.analytics, label: 'Analytics', icon: BarChart3 },
    ],
  },
  backOffice: {
    id: 'back-office',
    label: 'Back Office',
    icon: Building2,
    allowedRoles: ['gp', 'ops', 'auditor', 'service_provider'] as UserRole[],
    items: [
      { id: 'fund-admin', href: ROUTE_PATHS.fundAdmin, label: 'Fund Admin', icon: DollarSign },
      { id: 'lp-management', href: ROUTE_PATHS.lpManagement, label: 'LP Management', icon: UserCheck },
      { id: 'audit-trail', href: ROUTE_PATHS.auditTrail, label: 'Audit Trail', icon: Shield },
      { id: 'compliance', href: ROUTE_PATHS.compliance, label: 'Compliance', icon: FileCheck },
      { id: '409a-valuations', href: ROUTE_PATHS.valuations409a, label: '409A Valuations', icon: Receipt },
      { id: 'tax-center', href: ROUTE_PATHS.taxCenter, label: 'Tax Center', icon: Scale },
    ],
  },
  lpPortal: {
    id: 'lp-portal',
    label: 'LP Portal',
    icon: Users,
    allowedRoles: ['lp'] as UserRole[],
    items: [
      { id: 'lp-portal', href: ROUTE_PATHS.lpPortal, label: 'LP Portal', icon: Users },
      { id: 'portfolio', href: ROUTE_PATHS.portfolio, label: 'My Investments', icon: Briefcase },
      { id: 'reports', href: ROUTE_PATHS.reports, label: 'Documents', icon: FileDown },
    ],
  },
  utilities: {
    id: 'utilities',
    label: 'Utilities',
    icon: Mail,
    allowedRoles: ['gp', 'analyst', 'ops', 'ir', 'researcher', 'auditor', 'service_provider'] as UserRole[],
    items: [
      { id: 'contacts', href: ROUTE_PATHS.contacts, label: 'Contacts', icon: Users },
      { id: 'documents', href: ROUTE_PATHS.documents, label: 'Documents', icon: FileText },
      { id: 'reports', href: ROUTE_PATHS.reports, label: 'Reports', icon: FileDown },
      { id: 'integrations', href: ROUTE_PATHS.integrations, label: 'Integrations', icon: Plug },
      { id: 'ai-tools', href: ROUTE_PATHS.aiTools, label: 'AI Tools', icon: Sparkles },
    ],
  },
};

export function SidebarGrouped() {
  const pathname = usePathname();
  const router = useRouter();
  const { updateBadge, sidebarState, toggleLeftSidebar } = useNavigation();
  const aiBadges = useAIBadges();
  const { user } = useAuth();
  const density = useDashboardDensity();
  const isFundAdminRoute = pathname === ROUTE_PATHS.fundAdmin;
  const isCollapsed = sidebarState.leftCollapsed;
  const { value: sidebarUI, patch: patchSidebarUI } = useUIKey<SidebarGroupedUIState>('sidebar-grouped', {
    isHovered: false,
    fundAdminMenuMode: 'main',
  });
  const { value: fundAdminUI, patch: patchFundAdminUI } = useUIKey<FundAdminSidebarUIState>(
    'back-office-fund-admin',
    {
      selectedTab: DEFAULT_FUND_ADMIN_TAB_ID,
      lpStatusFilter: 'all',
    }
  );
  const isHovered = sidebarUI.isHovered;
  const fundAdminMenuMode = sidebarUI.fundAdminMenuMode === 'contextual' ? 'contextual' : 'main';
  const isFundAdminContext = isFundAdminRoute && fundAdminMenuMode === 'contextual';
  const selectedFundAdminTab = FUND_ADMIN_TAB_IDS.has(fundAdminUI.selectedTab)
    ? fundAdminUI.selectedTab
    : DEFAULT_FUND_ADMIN_TAB_ID;
  const wasFundAdminRouteRef = useRef(isFundAdminRoute);

  // Helper to check if a group is accessible
  const isAccessible = (allowedRoles?: UserRole[]) => {
    if (!allowedRoles) return true; // Accessible by all if not defined
    if (!user) return true; // Default to showing if no user (should rely on auth guard, but safe fallback)
    return allowedRoles.includes(user.role);
  };

  // Determine effective collapsed state (collapsed but temporarily expanded on hover)
  const effectivelyCollapsed = isCollapsed && !isHovered;

  // Update navigation badges from AI calculations
  useEffect(() => {
    Object.entries(aiBadges).forEach(([itemId, badge]) => {
      updateBadge(itemId, badge);
    });
  }, [aiBadges, updateBadge]);

  useEffect(() => {
    if (wasFundAdminRouteRef.current && !isFundAdminRoute && fundAdminMenuMode !== 'main') {
      patchSidebarUI({ fundAdminMenuMode: 'main' });
    }
    wasFundAdminRouteRef.current = isFundAdminRoute;
  }, [fundAdminMenuMode, isFundAdminRoute, patchSidebarUI]);

  const openFundAdminMainMenu = () => {
    patchSidebarUI({ fundAdminMenuMode: 'main' });
    patchFundAdminUI({ selectedTab: DEFAULT_FUND_ADMIN_TAB_ID });
  };

  const openFundAdminContextualMenu = () => {
    patchSidebarUI({ fundAdminMenuMode: 'contextual' });
    patchFundAdminUI({ selectedTab: DEFAULT_FUND_ADMIN_TAB_ID });

    if (!isFundAdminRoute) {
      router.push(ROUTE_PATHS.fundAdmin);
    }
  };

  return (
    <motion.aside
      animate={{
        width: effectivelyCollapsed
          ? `${density.shell.leftSidebarCollapsedWidthPx}px`
          : `${density.shell.leftSidebarExpandedWidthPx}px`,
      }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="relative flex flex-col h-full border-r border-app-border dark:border-app-dark-border bg-gradient-to-t from-app-primary/10 dark:from-app-dark-primary/15 to-app-surface dark:to-app-dark-surface"
      style={{
        willChange: 'width',
      }}
    >
      {/* Toggle Button */}
      <div
        onMouseEnter={(e) => {
          e.stopPropagation();
        }}
      >
        <SidebarToggleButton
          isCollapsed={isCollapsed}
          onToggle={toggleLeftSidebar}
          side="left"
          ariaLabel={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        />
      </div>

      {/* Header / Branding */}
      <div
        className={`${density.shell.sidebarHeaderPaddingClass} border-b border-app-border dark:border-app-dark-border flex-shrink-0 flex items-center`}
        onMouseEnter={() => isCollapsed && patchSidebarUI({ isHovered: true })}
        onMouseLeave={() => patchSidebarUI({ isHovered: false })}
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
              <h1 className="text-sm font-bold text-app-text dark:text-app-dark-text">VestLedger</h1>
              <p className="text-xs text-app-text-muted dark:text-app-dark-text-muted">AI-Powered VC</p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Groups */}
      <nav
        className={`flex-1 overflow-y-auto ${density.shell.sidebarNavPaddingClass} ${density.shell.sidebarNavGapClass}`}
        onMouseEnter={() => isCollapsed && patchSidebarUI({ isHovered: true })}
        onMouseLeave={() => patchSidebarUI({ isHovered: false })}
      >
        {isFundAdminContext ? (
          <div className="mb-2">
            {effectivelyCollapsed ? (
              <button
                type="button"
                onClick={openFundAdminMainMenu}
                aria-label="Back to Main Menu"
                title="Back to Main Menu"
                className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-app-surface-hover dark:hover:bg-app-dark-surface-hover transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-app-text-muted dark:text-app-dark-text-muted" />
              </button>
            ) : (
              <div
                className={`w-full flex items-center gap-2 ${
                  density.mode === 'compact' ? 'px-2.5 py-1.5' : 'px-3 py-2'
                }`}
              >
                <button
                  type="button"
                  onClick={openFundAdminMainMenu}
                  aria-label="Back to Main Menu"
                  title="Back to Main Menu"
                  className="p-1 rounded-md hover:bg-app-surface-hover dark:hover:bg-app-dark-surface-hover transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 text-app-text-muted dark:text-app-dark-text-muted" />
                </button>
                <DollarSign className="w-4 h-4 text-app-primary dark:text-app-dark-primary" />
                <span
                  className={`${
                    density.mode === 'compact'
                      ? 'text-[11px] font-semibold uppercase tracking-wider'
                      : 'text-xs font-semibold uppercase tracking-wider'
                  } text-app-text dark:text-app-dark-text`}
                >
                  Fund Admin
                </span>
              </div>
            )}

            <div className={effectivelyCollapsed ? 'space-y-1' : 'mt-1 space-y-1'}>
              {FUND_ADMIN_TABS.map((tab) => (
                <NavigationItem
                  key={tab.id}
                  id={`fund-admin-tab-${tab.id}`}
                  href={ROUTE_PATHS.fundAdmin}
                  label={tab.label}
                  icon={tab.icon}
                  isCollapsed={effectivelyCollapsed}
                  isActiveOverride={selectedFundAdminTab === tab.id}
                  onClick={() => patchFundAdminUI({ selectedTab: tab.id })}
                />
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Core Operations - Always Expanded */}
            <NavigationGroup
              id={navigationStructure.coreOperations.id}
              label={navigationStructure.coreOperations.label}
              icon={navigationStructure.coreOperations.icon}
              alwaysExpanded={navigationStructure.coreOperations.alwaysExpanded}
              isCollapsed={effectivelyCollapsed}
            >
              {navigationStructure.coreOperations.items.map(item => (
                <NavigationItem
                  key={item.id}
                  id={item.id}
                  href={item.href}
                  label={item.label}
                  icon={item.icon}
                  isCollapsed={effectivelyCollapsed}
                />
              ))}
            </NavigationGroup>

            {/* Deal Management */}
            {isAccessible(navigationStructure.dealManagement.allowedRoles) && (
              <NavigationGroup
                id={navigationStructure.dealManagement.id}
                label={navigationStructure.dealManagement.label}
                icon={navigationStructure.dealManagement.icon}
                isCollapsed={effectivelyCollapsed}
              >
                {navigationStructure.dealManagement.items.map(item => (
                  <NavigationItem
                    key={item.id}
                    id={item.id}
                    href={item.href}
                    label={item.label}
                    icon={item.icon}
                    isCollapsed={effectivelyCollapsed}
                  />
                ))}
              </NavigationGroup>
            )}

            {/* Portfolio Management */}
            {isAccessible(navigationStructure.portfolioManagement.allowedRoles) && (
              <NavigationGroup
                id={navigationStructure.portfolioManagement.id}
                label={navigationStructure.portfolioManagement.label}
                icon={navigationStructure.portfolioManagement.icon}
                isCollapsed={effectivelyCollapsed}
              >
                {navigationStructure.portfolioManagement.items.map(item => (
                  <NavigationItem
                    key={item.id}
                    id={item.id}
                    href={item.href}
                    label={item.label}
                    icon={item.icon}
                    isCollapsed={effectivelyCollapsed}
                  />
                ))}
              </NavigationGroup>
            )}

            {/* Back Office */}
            {isAccessible(navigationStructure.backOffice.allowedRoles) && (
              <NavigationGroup
                id={navigationStructure.backOffice.id}
                label={navigationStructure.backOffice.label}
                icon={navigationStructure.backOffice.icon}
                isCollapsed={effectivelyCollapsed}
              >
                {navigationStructure.backOffice.items.map((item) => {
                  if (item.id !== 'fund-admin') {
                    return (
                      <NavigationItem
                        key={item.id}
                        id={item.id}
                        href={item.href}
                        label={item.label}
                        icon={item.icon}
                        isCollapsed={effectivelyCollapsed}
                      />
                    );
                  }

                  if (effectivelyCollapsed) {
                    return (
                      <NavigationItem
                        key={item.id}
                        id={item.id}
                        href={item.href}
                        label={item.label}
                        icon={item.icon}
                        isCollapsed={effectivelyCollapsed}
                        onClick={openFundAdminContextualMenu}
                      />
                    );
                  }

                  return (
                    <NavigationItem
                      key={item.id}
                      id={item.id}
                      href={item.href}
                      label={item.label}
                      icon={item.icon}
                      isCollapsed={effectivelyCollapsed}
                      onClick={openFundAdminContextualMenu}
                    />
                  );
                })}
              </NavigationGroup>
            )}

            {/* LP Portal - Only for LP users */}
            {isAccessible(navigationStructure.lpPortal.allowedRoles) && (
              <NavigationGroup
                id={navigationStructure.lpPortal.id}
                label={navigationStructure.lpPortal.label}
                icon={navigationStructure.lpPortal.icon}
                isCollapsed={effectivelyCollapsed}
              >
                {navigationStructure.lpPortal.items.map(item => (
                  <NavigationItem
                    key={item.id}
                    id={item.id}
                    href={item.href}
                    label={item.label}
                    icon={item.icon}
                    isCollapsed={effectivelyCollapsed}
                  />
                ))}
              </NavigationGroup>
            )}

            {/* Utilities */}
            {isAccessible(navigationStructure.utilities.allowedRoles) && (
              <NavigationGroup
                id={navigationStructure.utilities.id}
                label={navigationStructure.utilities.label}
                icon={navigationStructure.utilities.icon}
                isCollapsed={effectivelyCollapsed}
              >
                {navigationStructure.utilities.items.map(item => (
                  <NavigationItem
                    key={item.id}
                    id={item.id}
                    href={item.href}
                    label={item.label}
                    icon={item.icon}
                    isCollapsed={effectivelyCollapsed}
                  />
                ))}
              </NavigationGroup>
            )}
          </>
        )}
      </nav>

      {/* Footer */}
      <div
        className={`${density.shell.sidebarNavPaddingClass} border-t border-app-border dark:border-app-dark-border space-y-3 flex-shrink-0`}
        onMouseEnter={() => isCollapsed && patchSidebarUI({ isHovered: true })}
        onMouseLeave={() => patchSidebarUI({ isHovered: false })}
      >
        <NavigationItem
          id="settings"
          href={ROUTE_PATHS.settings}
          label="Settings"
          icon={Settings}
          isCollapsed={effectivelyCollapsed}
        />
      </div>
    </motion.aside>
  );
}
