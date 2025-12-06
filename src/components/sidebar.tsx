'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, GitBranch, Briefcase, Search, TrendingUp, Settings, Sun, Moon, LogOut, Users, Vote, PieChart, Sparkles, FileDown, UserCheck, Shield, DollarSign, Scale, Receipt } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useAuth } from '@/contexts/auth-context';
import { Button, Switch } from '@/ui';
import { FundSelector } from '@/components/fund-selector';

const menuItems = [
  { id: 'dashboard', href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'pipeline', href: '/pipeline', label: 'Pipeline', icon: GitBranch },
  { id: 'deal-intelligence', href: '/deal-intelligence', label: 'Deal Intelligence', icon: Search },
  { id: 'dealflow-review', href: '/dealflow-review', label: 'Dealflow Review', icon: Vote },
  { id: 'portfolio', href: '/portfolio', label: 'Portfolio', icon: Briefcase },
  { id: 'cap-table', href: '/cap-table', label: 'Cap Table', icon: PieChart },
  { id: 'analytics', href: '/analytics', label: 'Analytics', icon: TrendingUp },
  { id: 'contacts', href: '/contacts', label: 'Contacts', icon: Users },
  { id: 'lp-management', href: '/lp-management', label: 'LP Management', icon: UserCheck },
  { id: 'fund-admin', href: '/fund-admin', label: 'Fund Admin', icon: DollarSign },
  { id: '409a-valuations', href: '/409a-valuations', label: '409A Valuations', icon: Receipt },
  { id: 'compliance', href: '/compliance', label: 'Compliance', icon: Shield },
  { id: 'tax-center', href: '/tax-center', label: 'Tax Center', icon: Scale },
  { id: 'reports', href: '/reports', label: 'Reports', icon: FileDown },
  { id: 'ai-tools', href: '/ai-tools', label: 'AI Tools', icon: Sparkles },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (!mounted) return null;

  return (
    <aside className="w-64 h-full bg-[var(--app-sidebar-bg)] border-r-2 border-[var(--app-sidebar-border)] flex flex-col">
      <div className="p-6 border-b-2 border-[var(--app-sidebar-border)]">
        <h1 className="text-xl tracking-tight text-[var(--app-primary)] font-bold" style={{ textShadow: 'var(--neon-glow-violet)' }}>VestLedger</h1>
        <p className="text-xs text-[var(--app-text-muted)] mt-1">Venture Capital OS</p>
      </div>

      {/* Fund Selector */}
      <div className="border-b border-[var(--app-sidebar-border)] pb-2">
        <FundSelector />
      </div>

      <nav className="flex-1 px-3 py-2 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Button
              key={item.id}
              as={Link}
              href={item.href}
              variant="light"
              className={`w-full justify-start gap-3 mb-1 transition-all ${
                isActive
                ? 'bg-[var(--app-secondary)]/10 text-[var(--app-secondary)] border-l-2 border-[var(--app-secondary)]'
                  : 'text-[var(--app-text-muted)] hover:bg-[var(--app-surface-hover)] hover:text-[var(--app-primary)] hover:border-l-2 hover:border-[var(--app-primary)]'
              }`}
              style={isActive ? { boxShadow: 'var(--neon-glow-teal)' } : {}}
              startContent={<Icon className="w-5 h-5" />}
            >
              <span className="text-sm">{item.label}</span>
            </Button>
          );
        })}
      </nav>

      <div className="p-4 border-t-2 border-[var(--app-sidebar-border)] space-y-2">
        <div className="flex items-center justify-between w-full px-4 py-2 text-[var(--app-text-muted)] hover:bg-[var(--app-surface-hover)] hover:text-[var(--app-primary)] rounded-medium transition-all cursor-pointer hover:border hover:border-[var(--app-primary)]" onClick={toggleTheme}>
          <div className="flex items-center gap-3">
            {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            <span className="text-sm">{theme === 'dark' ? 'Dark' : 'Light'} Mode</span>
          </div>
          <Switch
            isSelected={theme === 'dark'}
            onValueChange={(v) => setTheme(v ? 'dark' : 'light')}
            size="sm"
          />
        </div>
        <Button
          variant="light"
          className="w-full justify-start gap-3 text-[var(--app-text-muted)] hover:bg-[var(--app-surface-hover)] hover:text-[var(--app-accent)] hover:border hover:border-[var(--app-accent)] transition-all"
          startContent={<Settings className="w-5 h-5" />}
        >
          <span className="text-sm">Settings</span>
        </Button>
        <Button
          variant="light"
          onPress={handleLogout}
          className="w-full justify-start gap-3 text-[var(--app-danger)] hover:bg-[var(--app-danger-bg)] hover:border hover:border-[var(--app-danger)] transition-all"
          startContent={<LogOut className="w-5 h-5" />}
        >
          <span className="text-sm">Logout</span>
        </Button>
      </div>
    </aside>
  );
}
