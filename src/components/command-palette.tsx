'use client';

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Command } from 'cmdk';
import { DialogDescription, DialogTitle } from '@radix-ui/react-dialog';
import {
  Search,
  FileText,
  Users,
  Building2,
  GitBranch,
  BarChart3,
  DollarSign,
  Sparkles,
  MessageSquare,
} from 'lucide-react';
import './command-palette.css';
import { useUIKey } from '@/store/ui';
import { ROUTE_PATHS } from '@/config/routes';
import { useAuth } from '@/contexts/auth-context';
import { buildAdminSuperadminUrl } from '@/config/env';
import { isSuperadminUser } from '@/utils/auth/internal-access';
import { canRoleAccessPath } from '@/config/route-access-control';
import { useToast } from '@/ui';

interface CommandItem {
  id: string;
  title: string;
  subtitle?: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  route?: string;
  keywords?: string[];
}

export function CommandPalette() {
  const { value: commandUI, patch: patchCommandUI } = useUIKey('command-palette', {
    open: false,
    search: '',
  });
  const router = useRouter();
  const { user } = useAuth();
  const toast = useToast();
  const isSuperadmin = isSuperadminUser(user);

  // Toggle command palette with Cmd+K / Ctrl+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        patchCommandUI({ open: !commandUI.open });
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [commandUI.open, patchCommandUI]);

  // Close on escape
  useEffect(() => {
    if (!commandUI.open && commandUI.search) {
      patchCommandUI({ search: '' });
    }
  }, [commandUI.open, commandUI.search, patchCommandUI]);

  const navigate = useCallback(
    (path: string) => {
      patchCommandUI({ open: false, search: '' });
      router.push(path);
    },
    [patchCommandUI, router]
  );

  const navigateToSuperadminDomain = useCallback(() => {
    patchCommandUI({ open: false, search: '' });

    if (typeof window !== 'undefined') {
      window.location.href = buildAdminSuperadminUrl(window.location.hostname);
    }
  }, [patchCommandUI]);

  const pages: CommandItem[] = isSuperadmin
    ? [
        {
          id: 'superadmin',
          title: 'Superadmin Cockpit',
          subtitle: 'Tenant onboarding and platform operations',
          category: 'Pages',
          icon: Building2,
          action: navigateToSuperadminDomain,
          route: ROUTE_PATHS.superadmin,
          keywords: ['internal', 'tenant', 'platform', 'admin'],
        },
      ]
    : [
    {
      id: 'dashboard',
      title: 'Dashboard',
      subtitle: 'View fund overview and metrics',
      category: 'Pages',
      icon: BarChart3,
      action: () => navigate(ROUTE_PATHS.dashboard),
      route: ROUTE_PATHS.dashboard,
      keywords: ['home', 'overview', 'metrics'],
    },
    {
      id: 'pipeline',
      title: 'Pipeline',
      subtitle: 'Manage deal flow',
      category: 'Pages',
      icon: GitBranch,
      action: () => navigate(ROUTE_PATHS.pipeline),
      route: ROUTE_PATHS.pipeline,
      keywords: ['deals', 'kanban', 'opportunities'],
    },
    {
      id: 'portfolio',
      title: 'Portfolio',
      subtitle: 'Track portfolio companies',
      category: 'Pages',
      icon: Building2,
      action: () => navigate(ROUTE_PATHS.portfolio),
      route: ROUTE_PATHS.portfolio,
      keywords: ['companies', 'investments'],
    },
    {
      id: 'contacts',
      title: 'Contacts',
      subtitle: 'CRM and relationships',
      category: 'Pages',
      icon: Users,
      action: () => navigate(ROUTE_PATHS.contacts),
      route: ROUTE_PATHS.contacts,
      keywords: ['crm', 'people', 'founders'],
    },
    {
      id: 'analytics',
      title: 'Analytics',
      subtitle: 'Fund performance analysis',
      category: 'Pages',
      icon: BarChart3,
      action: () => navigate(ROUTE_PATHS.analytics),
      route: ROUTE_PATHS.analytics,
      keywords: ['charts', 'performance', 'metrics'],
    },
    {
      id: 'fund-admin',
      title: 'Fund Admin',
      subtitle: 'Capital calls and distributions',
      category: 'Pages',
      icon: DollarSign,
      action: () => navigate(ROUTE_PATHS.fundAdmin),
      route: ROUTE_PATHS.fundAdmin,
      keywords: ['capital', 'calls', 'distributions', 'lp'],
    },
    {
      id: 'compliance',
      title: 'Compliance',
      subtitle: 'Regulatory tracking',
      category: 'Pages',
      icon: FileText,
      action: () => navigate(ROUTE_PATHS.compliance),
      route: ROUTE_PATHS.compliance,
      keywords: ['regulatory', 'filing', 'audit'],
    },
    {
      id: 'collaboration',
      title: 'Collaboration',
      subtitle: 'Threads, comments, and task handoffs',
      category: 'Pages',
      icon: MessageSquare,
      action: () => navigate(ROUTE_PATHS.collaboration),
      route: ROUTE_PATHS.collaboration,
      keywords: ['threads', 'tasks', 'comments', 'coordination'],
    },
    {
      id: 'waterfall',
      title: 'Waterfall',
      subtitle: 'Exit scenario modeling',
      category: 'Pages',
      icon: BarChart3,
      action: () => navigate(ROUTE_PATHS.waterfall),
      route: ROUTE_PATHS.waterfall,
      keywords: ['exit', 'modeling', 'returns'],
    },
  ];

  const actions: CommandItem[] = isSuperadmin
    ? []
    : [
    {
      id: 'add-deal',
      title: 'Add New Deal',
      category: 'Actions',
      icon: GitBranch,
      action: () => {
        patchCommandUI({ open: false, search: '' });
        toast.info('Opening pipeline with create-deal workflow.', 'Add Deal');
        router.push(ROUTE_PATHS.pipeline);
      },
      keywords: ['create', 'new', 'opportunity'],
    },
    {
      id: 'add-contact',
      title: 'Add New Contact',
      category: 'Actions',
      icon: Users,
      action: () => {
        patchCommandUI({ open: false, search: '' });
        toast.info('Opening contacts workspace to add a contact.', 'Add Contact');
        router.push(ROUTE_PATHS.contacts);
      },
      keywords: ['create', 'new', 'person'],
    },
    {
      id: 'capital-call',
      title: 'Create Capital Call',
      category: 'Actions',
      icon: DollarSign,
      action: () => navigate(ROUTE_PATHS.fundAdmin),
      route: ROUTE_PATHS.fundAdmin,
      keywords: ['create', 'lp', 'funding'],
    },
  ];

  const accessiblePages = pages.filter((item) => {
    if (!item.route) return true;
    return canRoleAccessPath(user?.role, item.route);
  });

  const accessibleActions = actions.filter((item) => {
    if (!item.route) return true;
    return canRoleAccessPath(user?.role, item.route);
  });

  return (
    <>
      <Command.Dialog
        open={commandUI.open}
        onOpenChange={(nextOpen) => patchCommandUI({ open: nextOpen, search: nextOpen ? commandUI.search : '' })}
        label="Global Command Menu"
        className="command-palette"
      >
        <DialogTitle className="sr-only">Global Command Menu</DialogTitle>
        <DialogDescription className="sr-only">
          Search for pages and actions, then press Enter to run the selected command.
        </DialogDescription>
        <div className="command-palette-header">
          <Search className="command-palette-icon" />
          <Command.Input
            value={commandUI.search}
            onValueChange={(nextValue) => patchCommandUI({ search: nextValue })}
            placeholder="Type a command or search..."
            className="command-palette-input"
          />
          <kbd className="command-palette-kbd">
            {typeof navigator !== 'undefined' &&
            navigator.platform.toLowerCase().includes('mac')
              ? '⌘'
              : 'Ctrl+'}
            K
          </kbd>
        </div>

        <Command.List className="command-palette-list">
          <Command.Empty className="command-palette-empty">
            <p>No results found.</p>
            <span>Try searching for pages, contacts, or actions</span>
          </Command.Empty>

          <Command.Group heading="Pages" className="command-palette-group">
            {accessiblePages.map((item) => (
              <Command.Item
                key={item.id}
                value={`${item.title} ${item.subtitle} ${item.keywords?.join(' ')}`}
                onSelect={item.action}
                className="command-palette-item"
              >
                <item.icon className="command-palette-item-icon" />
                <div className="command-palette-item-content">
                  <span className="command-palette-item-title">{item.title}</span>
                  {item.subtitle && (
                    <span className="command-palette-item-subtitle">{item.subtitle}</span>
                  )}
                </div>
              </Command.Item>
            ))}
          </Command.Group>

          {accessibleActions.length > 0 && (
            <Command.Group heading="Actions" className="command-palette-group">
              {accessibleActions.map((item) => (
                <Command.Item
                  key={item.id}
                  value={`${item.title} ${item.keywords?.join(' ')}`}
                  onSelect={item.action}
                  className="command-palette-item"
                >
                  <Sparkles className="command-palette-item-icon command-palette-item-icon-action" />
                  <div className="command-palette-item-content">
                    <span className="command-palette-item-title">{item.title}</span>
                  </div>
                </Command.Item>
              ))}
            </Command.Group>
          )}
        </Command.List>

        <div className="command-palette-footer">
          <div className="command-palette-footer-hint">
            <kbd>↑↓</kbd> Navigate
            <kbd>Enter</kbd> Select
            <kbd>Esc</kbd> Close
          </div>
        </div>
      </Command.Dialog>
    </>
  );
}
