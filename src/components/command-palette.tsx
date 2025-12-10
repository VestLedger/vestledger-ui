'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Command } from 'cmdk';
import {
  Search,
  FileText,
  Users,
  Building2,
  GitBranch,
  BarChart3,
  DollarSign,
  Settings,
  Calendar,
  Sparkles,
} from 'lucide-react';
import './command-palette.css';

interface CommandItem {
  id: string;
  title: string;
  subtitle?: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  keywords?: string[];
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const router = useRouter();

  // Toggle command palette with Cmd+K / Ctrl+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  // Close on escape
  useEffect(() => {
    if (!open) {
      setSearch('');
    }
  }, [open]);

  const navigate = useCallback(
    (path: string) => {
      setOpen(false);
      router.push(path);
    },
    [router]
  );

  const pages: CommandItem[] = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      subtitle: 'View fund overview and metrics',
      category: 'Pages',
      icon: BarChart3,
      action: () => navigate('/dashboard'),
      keywords: ['home', 'overview', 'metrics'],
    },
    {
      id: 'pipeline',
      title: 'Pipeline',
      subtitle: 'Manage deal flow',
      category: 'Pages',
      icon: GitBranch,
      action: () => navigate('/pipeline'),
      keywords: ['deals', 'kanban', 'opportunities'],
    },
    {
      id: 'portfolio',
      title: 'Portfolio',
      subtitle: 'Track portfolio companies',
      category: 'Pages',
      icon: Building2,
      action: () => navigate('/portfolio'),
      keywords: ['companies', 'investments'],
    },
    {
      id: 'contacts',
      title: 'Contacts',
      subtitle: 'CRM and relationships',
      category: 'Pages',
      icon: Users,
      action: () => navigate('/contacts'),
      keywords: ['crm', 'people', 'founders'],
    },
    {
      id: 'analytics',
      title: 'Analytics',
      subtitle: 'Fund performance analysis',
      category: 'Pages',
      icon: BarChart3,
      action: () => navigate('/analytics'),
      keywords: ['charts', 'performance', 'metrics'],
    },
    {
      id: 'fund-admin',
      title: 'Fund Admin',
      subtitle: 'Capital calls and distributions',
      category: 'Pages',
      icon: DollarSign,
      action: () => navigate('/fund-admin'),
      keywords: ['capital', 'calls', 'distributions', 'lp'],
    },
    {
      id: 'compliance',
      title: 'Compliance',
      subtitle: 'Regulatory tracking',
      category: 'Pages',
      icon: FileText,
      action: () => navigate('/compliance'),
      keywords: ['regulatory', 'filing', 'audit'],
    },
    {
      id: 'cap-table',
      title: 'Cap Table',
      subtitle: 'Shareholder management',
      category: 'Pages',
      icon: Users,
      action: () => navigate('/cap-table'),
      keywords: ['shareholders', 'equity', 'ownership'],
    },
    {
      id: 'waterfall',
      title: 'Waterfall',
      subtitle: 'Exit scenario modeling',
      category: 'Pages',
      icon: BarChart3,
      action: () => navigate('/waterfall'),
      keywords: ['exit', 'modeling', 'returns'],
    },
  ];

  const actions: CommandItem[] = [
    {
      id: 'add-deal',
      title: 'Add New Deal',
      category: 'Actions',
      icon: GitBranch,
      action: () => {
        setOpen(false);
        alert('Add deal dialog - to be implemented');
      },
      keywords: ['create', 'new', 'opportunity'],
    },
    {
      id: 'add-contact',
      title: 'Add New Contact',
      category: 'Actions',
      icon: Users,
      action: () => {
        setOpen(false);
        alert('Add contact dialog - to be implemented');
      },
      keywords: ['create', 'new', 'person'],
    },
    {
      id: 'capital-call',
      title: 'Create Capital Call',
      category: 'Actions',
      icon: DollarSign,
      action: () => navigate('/fund-admin'),
      keywords: ['create', 'lp', 'funding'],
    },
  ];

  const allItems = [...pages, ...actions];

  return (
    <>
      <Command.Dialog
        open={open}
        onOpenChange={setOpen}
        label="Global Command Menu"
        className="command-palette"
      >
        <div className="command-palette-header">
          <Search className="command-palette-icon" />
          <Command.Input
            value={search}
            onValueChange={setSearch}
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
            {pages.map((item) => (
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

          <Command.Group heading="Actions" className="command-palette-group">
            {actions.map((item) => (
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
