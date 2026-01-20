'use client'

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, GitBranch, Briefcase, Search, Vote, TrendingUp, Users, UserCheck, DollarSign, Shield, Scale, Receipt, FileDown, Sparkles, Activity, BarChart3, Settings, FileText, Plug } from 'lucide-react';
import { NavigationGroup } from './navigation-group';
import { NavigationItem } from './navigation-item';
import { SidebarToggleButton } from './sidebar-toggle-button';
import { useNavigation } from '@/contexts/navigation-context';
import { useAIBadges } from '@/hooks/use-ai-badges';
import { useAuth, UserRole } from '@/contexts/auth-context';
import { useUIKey } from '@/store/ui';
import Image from 'next/image';

// Define navigation structure
const navigationStructure = {
  coreOperations: {
    id: 'core-operations',
    label: 'Core Operations',
    icon: Activity,
    alwaysExpanded: true,
    // All roles can access core operations
    items: [
      { id: 'dashboard', href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'pipeline', href: '/pipeline', label: 'Pipeline', icon: GitBranch },
      { id: 'portfolio', href: '/portfolio', label: 'Portfolio', icon: Briefcase },
    ],
  },
  dealManagement: {
    id: 'deal-management',
    label: 'Deal Management',
    icon: BarChart3,
    allowedRoles: ['gp', 'analyst', 'strategic_partner'] as UserRole[],
    items: [
      { id: 'deal-intelligence', href: '/deal-intelligence', label: 'Deal Intelligence', icon: Search },
      { id: 'dealflow-review', href: '/dealflow-review', label: 'Dealflow Review', icon: Vote },
    ],
  },
  portfolioManagement: {
    id: 'portfolio-management',
    label: 'Portfolio Mgmt',
    icon: TrendingUp,
    allowedRoles: ['gp', 'analyst', 'researcher', 'lp'] as UserRole[],
    items: [
      { id: 'waterfall', href: '/waterfall', label: 'Waterfall', icon: TrendingUp },
      { id: 'analytics', href: '/analytics', label: 'Analytics', icon: TrendingUp },
    ],
  },
  backOffice: {
    id: 'back-office',
    label: 'Back Office',
    icon: DollarSign,
    allowedRoles: ['gp', 'ops', 'auditor', 'service_provider'] as UserRole[],
    items: [
      { id: 'fund-admin', href: '/fund-admin', label: 'Fund Admin', icon: DollarSign },
      { id: 'lp-management', href: '/lp-management', label: 'LP Management', icon: UserCheck },
      { id: 'audit-trail', href: '/audit-trail', label: 'Audit Trail', icon: Shield },
      { id: 'compliance', href: '/compliance', label: 'Compliance', icon: Shield },
      { id: '409a-valuations', href: '/409a-valuations', label: '409A Valuations', icon: Receipt },
      { id: 'tax-center', href: '/tax-center', label: 'Tax Center', icon: Scale },
    ],
  },
  lpPortal: {
    id: 'lp-portal',
    label: 'LP Portal',
    icon: Users,
    allowedRoles: ['lp'] as UserRole[],
    items: [
      { id: 'lp-portal', href: '/lp-portal', label: 'LP Portal', icon: Users },
      { id: 'portfolio', href: '/portfolio', label: 'My Investments', icon: Briefcase },
      { id: 'reports', href: '/reports', label: 'Documents', icon: FileDown },
    ],
  },
  utilities: {
    id: 'utilities',
    label: 'Utilities',
    icon: Sparkles,
    allowedRoles: ['gp', 'analyst', 'ops', 'ir', 'researcher', 'auditor', 'service_provider'] as UserRole[],
    items: [
      { id: 'contacts', href: '/contacts', label: 'Contacts', icon: Users },
      { id: 'documents', href: '/documents', label: 'Documents', icon: FileText },
      { id: 'reports', href: '/reports', label: 'Reports', icon: FileDown },
      { id: 'integrations', href: '/integrations', label: 'Integrations', icon: Plug },
      { id: 'ai-tools', href: '/ai-tools', label: 'AI Tools', icon: Sparkles },
    ],
  },
};

export function SidebarGrouped() {
  const { updateBadge, sidebarState, toggleLeftSidebar } = useNavigation();
  const aiBadges = useAIBadges();
  const { user } = useAuth();
  const isCollapsed = sidebarState.leftCollapsed;
  const { value: sidebarUI, patch: patchSidebarUI } = useUIKey('sidebar-grouped', {
    isHovered: false,
  });
  const isHovered = sidebarUI.isHovered;

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

  return (
    <motion.aside
      animate={{
        width: effectivelyCollapsed ? '64px' : '256px',
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
        className="px-4 h-[69px] border-b border-app-border dark:border-app-dark-border flex-shrink-0 flex items-center"
        onMouseEnter={() => isCollapsed && patchSidebarUI({ isHovered: true })}
        onMouseLeave={() => patchSidebarUI({ isHovered: false })}
      >
        {effectivelyCollapsed ? (
          <div className="flex items-center justify-center w-full">
            <div className="w-9 h-9 rounded-lg bg-app-surface/80 dark:bg-app-dark-surface/80 border border-app-border dark:border-app-dark-border flex items-center justify-center">
              <Image
                src="/logo/Print_Transparent.svg"
                alt="VestLedger logo"
                width={24}
                height={24}
                className="h-6 w-6"
              />
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-app-surface/80 dark:bg-app-dark-surface/80 border border-app-border dark:border-app-dark-border flex items-center justify-center">
              <Image
                src="/logo/Print_Transparent.svg"
                alt="VestLedger logo"
                width={24}
                height={24}
                className="h-6 w-6"
              />
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
        className="flex-1 p-4 space-y-4 overflow-y-auto"
        onMouseEnter={() => isCollapsed && patchSidebarUI({ isHovered: true })}
        onMouseLeave={() => patchSidebarUI({ isHovered: false })}
      >
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
            {navigationStructure.backOffice.items.map(item => (
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
      </nav>

      {/* Footer */}
      <div
        className="p-4 border-t border-app-border dark:border-app-dark-border space-y-3 flex-shrink-0"
        onMouseEnter={() => isCollapsed && patchSidebarUI({ isHovered: true })}
        onMouseLeave={() => patchSidebarUI({ isHovered: false })}
      >
        <NavigationItem
          id="settings"
          href="/settings"
          label="Settings"
          icon={Settings}
          isCollapsed={effectivelyCollapsed}
        />
      </div>
    </motion.aside>
  );
}
