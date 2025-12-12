'use client'

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { type LucideIcon } from 'lucide-react';
import { useNavigation } from '@/contexts/navigation-context';
import { Badge } from '@/ui';

interface NavigationItemProps {
  id: string;
  href: string;
  label: string;
  icon: LucideIcon;
  isCollapsed?: boolean;
}

export function NavigationItem({ id, href, label, icon: Icon, isCollapsed = false }: NavigationItemProps) {
  const pathname = usePathname();
  const { badges } = useNavigation();
  const badge = badges[id];

  const isActive = pathname === href || pathname.startsWith(`${href}/`);

  const getBadgeColor = (variant: 'danger' | 'warning' | 'info') => {
    switch (variant) {
      case 'danger':
        return 'bg-[var(--app-danger-bg)] text-[var(--app-danger)]';
      case 'warning':
        return 'bg-[var(--app-warning-bg)] text-[var(--app-warning)]';
      case 'info':
        return 'bg-[var(--app-info-bg)] text-[var(--app-info)]';
      default:
        return 'bg-[var(--app-surface-hover)]';
    }
  };

  return (
    <Link href={href}>
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`
          group relative flex items-center ${isCollapsed ? 'justify-center' : 'justify-between gap-3'} px-3 py-2.5 rounded-lg
          transition-all duration-150
          ${isActive
            ? 'bg-[var(--app-surface-hover)] border-l-2 border-[var(--app-primary)] shadow-[0_0_12px_var(--royal-glow-purple)]'
            : 'hover:bg-[var(--app-surface-hover)]'
          }
        `}
        title={isCollapsed ? label : undefined}
      >
        {isCollapsed ? (
          /* Collapsed: Icon only with tooltip */
          <div className="relative">
            <Icon
              className={`
                w-5 h-5 transition-colors duration-150
                ${isActive
                  ? 'text-[var(--app-primary)]'
                  : 'text-[var(--app-text-muted)] group-hover:text-[var(--app-text)]'
                }
              `}
            />
            {badge && (
              <div className={`
                absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold
                ${getBadgeColor(badge.variant)}
              `}>
                {badge.count > 9 ? '9+' : badge.count}
              </div>
            )}
            {/* Tooltip on hover */}
            <div className="absolute left-full ml-2 px-2 py-1 bg-[var(--app-surface)]
                            rounded shadow-lg text-sm opacity-0 group-hover:opacity-100
                            pointer-events-none transition-opacity z-50 whitespace-nowrap
                            border border-[var(--app-border)]">
              {label}
            </div>
          </div>
        ) : (
          <>
            {/* Expanded: Icon + Label */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Icon
                className={`
                  w-5 h-5 flex-shrink-0 transition-colors duration-150
                  ${isActive
                    ? 'text-[var(--app-primary)]'
                    : 'text-[var(--app-text-muted)] group-hover:text-[var(--app-text)]'
                  }
                `}
              />
              <span className={`
                text-sm font-medium truncate transition-colors duration-150
                ${isActive
                  ? 'text-[var(--app-text)]'
                  : 'text-[var(--app-text-muted)] group-hover:text-[var(--app-text)]'
                }
              `}>
                {label}
              </span>
            </div>

            {/* Right: AI Badge (if present) */}
            {badge && (
              <Badge
                size="sm"
                className={`
                  flex-shrink-0 px-1.5 py-0.5 text-xs font-semibold
                  ${getBadgeColor(badge.variant)}
                `}
                title={badge.tooltip}
              >
                {badge.count}
              </Badge>
            )}
          </>
        )}

        {/* Active Indicator Glow */}
        {isActive && (
          <div className="absolute inset-0 rounded-lg pointer-events-none opacity-10 bg-gradient-to-r from-[var(--app-primary)] to-transparent" />
        )}
      </motion.div>
    </Link>
  );
}
