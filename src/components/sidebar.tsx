'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, GitBranch, Briefcase, Search, TrendingUp, Settings, Sun, Moon, LogOut } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useAuth } from '@/contexts/auth-context';
import { Button, Switch } from '@/ui';
import { FundSelector } from '@/components/fund-selector';

const menuItems = [
  { id: 'dashboard', href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'pipeline', href: '/pipeline', label: 'Pipeline', icon: GitBranch },
  { id: 'deal-intelligence', href: '/deal-intelligence', label: 'Deal Intelligence', icon: Search },
  { id: 'portfolio', href: '/portfolio', label: 'Portfolio', icon: Briefcase },
  { id: 'analytics', href: '/analytics', label: 'Analytics', icon: TrendingUp },
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
    <aside className="w-64 h-full bg-[var(--app-sidebar-bg)] border-r border-[var(--app-sidebar-border)] flex flex-col">
      <div className="p-6 border-b border-[var(--app-sidebar-border)]">
        <h1 className="text-xl tracking-tight text-[var(--app-primary)]">vestledger</h1>
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
              className={`w-full justify-start gap-3 mb-1 ${
                isActive
                ? 'bg-[var(--app-secondary)]/10 text-[var(--app-secondary)]'
                  : 'text-[var(--app-text-muted)] hover:bg-[var(--app-surface-hover)] hover:text-[var(--app-text)]'
              }`}
              startContent={<Icon className="w-5 h-5" />}
            >
              <span className="text-sm">{item.label}</span>
            </Button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[var(--app-sidebar-border)] space-y-2">
        <div className="flex items-center justify-between w-full px-4 py-2 text-[var(--app-text-muted)] hover:bg-[var(--app-surface-hover)] hover:text-[var(--app-text)] rounded-medium transition-colors cursor-pointer" onClick={toggleTheme}>
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
          className="w-full justify-start gap-3 text-[var(--app-text-muted)] hover:bg-[var(--app-surface-hover)] hover:text-[var(--app-text)]"
          startContent={<Settings className="w-5 h-5" />}
        >
          <span className="text-sm">Settings</span>
        </Button>
        <Button
          variant="light"
          onPress={handleLogout}
          className="w-full justify-start gap-3 text-[var(--app-danger)] hover:bg-[var(--app-danger-bg)]"
          startContent={<LogOut className="w-5 h-5" />}
        >
          <span className="text-sm">Logout</span>
        </Button>
      </div>
    </aside>
  );
}
