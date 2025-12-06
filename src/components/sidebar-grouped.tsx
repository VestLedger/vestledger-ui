'use client'

import { useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Switch } from '@/ui';
import { LayoutDashboard, GitBranch, Briefcase, Search, Vote, PieChart, TrendingUp, Users, UserCheck, DollarSign, Shield, Scale, Receipt, FileDown, Sparkles, Activity, BarChart3, Sun, Moon } from 'lucide-react';
import { NavigationGroup } from './navigation-group';
import { NavigationItem } from './navigation-item';
import { useNavigation } from '@/contexts/navigation-context';
import { useAIBadges } from '@/hooks/use-ai-badges';
import { useAuth, UserRole } from '@/contexts/auth-context';

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
    label: 'Portfolio Management',
    icon: TrendingUp,
    allowedRoles: ['gp', 'analyst', 'researcher', 'lp'] as UserRole[],
    items: [
      { id: 'cap-table', href: '/cap-table', label: 'Cap Table', icon: PieChart },
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
      { id: 'reports', href: '/reports', label: 'Reports', icon: FileDown },
      { id: 'ai-tools', href: '/ai-tools', label: 'AI Tools', icon: Sparkles },
    ],
  },
};

export function SidebarGrouped() {
  const { updateBadge } = useNavigation();
  const aiBadges = useAIBadges();
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  
  // Helper to check if a group is accessible
  const isAccessible = (allowedRoles?: UserRole[]) => {
    if (!allowedRoles) return true; // Accessible by all if not defined
    if (!user) return true; // Default to showing if no user (should rely on auth guard, but safe fallback)
    return allowedRoles.includes(user.role);
  };

  // Update navigation badges from AI calculations
  useEffect(() => {
    Object.entries(aiBadges).forEach(([itemId, badge]) => {
      updateBadge(itemId, badge);
    });
  }, [aiBadges, updateBadge]);

  return (
    <aside className="
      flex flex-col h-full w-64 bg-[var(--app-sidebar-bg)] border-r border-[var(--app-sidebar-border)]
      overflow-y-auto
    ">
      {/* Header / Branding */}
      <div className="p-4 border-b border-[var(--app-sidebar-border)]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--app-primary)] to-[var(--app-secondary)] flex items-center justify-center">
            <span className="text-white font-bold text-sm">VL</span>
          </div>
          <div>
            <h1 className="text-sm font-bold text-[var(--app-text)]">VestLedger</h1>
            <p className="text-xs text-[var(--app-text-muted)]">AI-Powered VC</p>
          </div>
        </div>
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 p-4 space-y-4">
        {/* Core Operations - Always Expanded */}
        <NavigationGroup
          id={navigationStructure.coreOperations.id}
          label={navigationStructure.coreOperations.label}
          icon={navigationStructure.coreOperations.icon}
          alwaysExpanded={navigationStructure.coreOperations.alwaysExpanded}
        >
          {navigationStructure.coreOperations.items.map(item => (
            <NavigationItem
              key={item.id}
              id={item.id}
              href={item.href}
              label={item.label}
              icon={item.icon}
            />
          ))}
        </NavigationGroup>

        {/* Deal Management */}
        {isAccessible(navigationStructure.dealManagement.allowedRoles) && (
          <NavigationGroup
            id={navigationStructure.dealManagement.id}
            label={navigationStructure.dealManagement.label}
            icon={navigationStructure.dealManagement.icon}
          >
            {navigationStructure.dealManagement.items.map(item => (
              <NavigationItem
                key={item.id}
                id={item.id}
                href={item.href}
                label={item.label}
                icon={item.icon}
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
          >
            {navigationStructure.portfolioManagement.items.map(item => (
              <NavigationItem
                key={item.id}
                id={item.id}
                href={item.href}
                label={item.label}
                icon={item.icon}
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
          >
            {navigationStructure.backOffice.items.map(item => (
              <NavigationItem
                key={item.id}
                id={item.id}
                href={item.href}
                label={item.label}
                icon={item.icon}
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
          >
            {navigationStructure.lpPortal.items.map(item => (
              <NavigationItem
                key={item.id}
                id={item.id}
                href={item.href}
                label={item.label}
                icon={item.icon}
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
          >
            {navigationStructure.utilities.items.map(item => (
              <NavigationItem
                key={item.id}
                id={item.id}
                href={item.href}
                label={item.label}
                icon={item.icon}
              />
            ))}
          </NavigationGroup>
        )}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-[var(--app-sidebar-border)] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-[var(--app-text-muted)]">
            {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            <span>{theme === 'dark' ? 'Dark' : 'Light'}</span>
          </div>
          <Switch
            size="sm"
            isSelected={theme === 'dark'}
            onValueChange={(isSelected) => setTheme(isSelected ? 'dark' : 'light')}
          />
        </div>
        <p className="text-xs text-center text-[var(--app-text-subtle)]">
          AI-Powered Fund Management
        </p>
      </div>
    </aside>
  );
}
