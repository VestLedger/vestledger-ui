'use client'

import type { MouseEventHandler } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { type LucideIcon } from 'lucide-react';
import { useNavigation } from '@/contexts/navigation-context';
import { Badge } from '@/ui';
import { useDashboardDensity } from '@/contexts/dashboard-density-context';

interface NavigationItemProps {
  id: string;
  href: string;
  label: string;
  icon: LucideIcon;
  isCollapsed?: boolean;
  isActiveOverride?: boolean;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
}

export function NavigationItem({
  id,
  href,
  label,
  icon: Icon,
  isCollapsed = false,
  isActiveOverride,
  onClick,
}: NavigationItemProps) {
  const pathname = usePathname();
  const { badges } = useNavigation();
  const density = useDashboardDensity();
  const badge = badges[id];

  const isActive = isActiveOverride ?? (pathname === href || pathname.startsWith(`${href}/`));
  const rowDimensionClass = density.mode === 'compact' ? 'px-2.5 h-9' : 'px-3 h-10';
  const labelTextClass = density.mode === 'compact' ? 'text-[13px]' : 'text-sm';

  const getBadgeColor = (variant: 'danger' | 'warning' | 'info') => {
    switch (variant) {
      case 'danger':
        return 'bg-app-danger/10 text-app-danger dark:bg-app-dark-danger/15 dark:text-app-dark-danger';
      case 'warning':
        return 'bg-app-warning/10 text-app-warning dark:bg-app-dark-warning/15 dark:text-app-dark-warning';
      case 'info':
        return 'bg-app-info/10 text-app-info dark:bg-app-dark-info/15 dark:text-app-dark-info';
      default:
        return 'bg-app-surface-hover dark:bg-app-dark-surface-hover';
    }
  };

  return (
    <Link href={href} onClick={onClick}>
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`
          group relative flex items-center ${isCollapsed ? 'justify-center' : 'justify-between gap-3'} ${rowDimensionClass} rounded-lg
          transition-all duration-150
          ${isActive
            ? 'bg-app-surface-hover dark:bg-app-dark-surface-hover border-l-2 border-app-primary dark:border-app-dark-primary shadow-[0_0_12px_rgba(4,120,87,0.3)] dark:shadow-[0_0_12px_rgba(16,185,129,0.3)]'
            : 'hover:bg-app-surface-hover dark:hover:bg-app-dark-surface-hover'
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
                  ? 'text-app-primary dark:text-app-dark-primary'
                  : 'text-app-text-muted dark:text-app-dark-text-muted group-hover:text-app-text dark:group-hover:text-app-dark-text'
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
          </div>
        ) : (
          <>
            {/* Expanded: Icon + Label */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Icon
                className={`
                  w-5 h-5 flex-shrink-0 transition-colors duration-150
                  ${isActive
                    ? 'text-app-primary dark:text-app-dark-primary'
                    : 'text-app-text-muted dark:text-app-dark-text-muted group-hover:text-app-text dark:group-hover:text-app-dark-text'
                  }
                `}
              />
              <span className={`
                ${labelTextClass} font-medium truncate transition-colors duration-150
                ${isActive
                  ? 'text-app-text dark:text-app-dark-text'
                  : 'text-app-text-muted dark:text-app-dark-text-muted group-hover:text-app-text dark:group-hover:text-app-dark-text'
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
          <div className="absolute inset-0 rounded-lg pointer-events-none opacity-10 bg-gradient-to-r from-app-primary dark:from-app-dark-primary to-transparent" />
        )}
      </motion.div>
    </Link>
  );
}
