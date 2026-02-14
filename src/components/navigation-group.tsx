'use client'

import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, type LucideIcon } from 'lucide-react';
import { useNavigation } from '@/contexts/navigation-context';
import { useDashboardDensity } from '@/contexts/dashboard-density-context';

interface NavigationGroupProps {
  id: string;
  label: string;
  icon?: LucideIcon;
  children: ReactNode;
  defaultExpanded?: boolean;
  alwaysExpanded?: boolean; // For Core Operations
  isCollapsed?: boolean; // Sidebar collapsed state
}

export function NavigationGroup({
  id,
  label,
  icon: Icon,
  children,
  alwaysExpanded = false,
  isCollapsed = false,
}: NavigationGroupProps) {
  const { expandedGroups, toggleGroup } = useNavigation();
  const density = useDashboardDensity();
  const isExpanded = alwaysExpanded || expandedGroups.has(id);
  const headerHorizontalPaddingClass = density.mode === 'compact' ? 'px-2.5' : 'px-3';
  const headerHeightClass = density.mode === 'compact' ? 'h-8' : 'h-9';
  const headerBaseClass = `${headerHorizontalPaddingClass} ${headerHeightClass}`;
  const labelClass = density.mode === 'compact'
    ? 'text-[11px] font-semibold uppercase tracking-wider'
    : 'text-xs font-semibold uppercase tracking-wider';

  return (
    <div className="mb-2">
      {/* Group Header */}
      {isCollapsed ? (
        // In collapsed mode, keep group icons visible at all times.
        Icon && (
          <button
            type="button"
            onClick={() => {
              if (!alwaysExpanded) {
                toggleGroup(id);
              }
            }}
            className={[
              `flex items-center justify-center ${headerBaseClass} w-full rounded-lg transition-colors`,
              alwaysExpanded
                ? 'cursor-default'
                : 'hover:bg-app-surface-hover dark:hover:bg-app-dark-surface-hover',
              !alwaysExpanded && isExpanded
                ? 'bg-app-surface-hover dark:bg-app-dark-surface-hover'
                : '',
            ].filter(Boolean).join(' ')}
            title={label}
            aria-label={label}
            aria-expanded={isExpanded}
            aria-disabled={alwaysExpanded}
          >
            <Icon
              className={`w-4 h-4 ${
                alwaysExpanded
                  ? 'text-app-primary dark:text-app-dark-primary'
                  : 'text-app-text-muted dark:text-app-dark-text-muted'
              }`}
            />
          </button>
        )
      ) : (
        // In expanded mode, show full group header
        <button
          onClick={() => toggleGroup(id)}
          className={`
            w-full flex items-center justify-between ${headerBaseClass} rounded-lg
            transition-colors duration-150
            ${alwaysExpanded
              ? 'cursor-default'
              : 'cursor-pointer hover:bg-app-surface-hover dark:hover:bg-app-dark-surface-hover'
            }
          `}
          aria-expanded={isExpanded}
          disabled={alwaysExpanded}
        >
          <div className="flex items-center gap-2">
            {Icon && (
              <Icon className={`
                w-4 h-4
                ${alwaysExpanded
                  ? 'text-app-primary dark:text-app-dark-primary'
                  : 'text-app-text-muted dark:text-app-dark-text-muted'
                }
              `} />
            )}
            <span className={`
              ${labelClass}
              ${alwaysExpanded
                ? 'text-app-text dark:text-app-dark-text'
                : 'text-app-text-muted dark:text-app-dark-text-muted'
              }
            `}>
              {label}
            </span>
          </div>

          {!alwaysExpanded && (
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
            >
              <ChevronDown className="w-4 h-4 text-app-text-muted dark:text-app-dark-text-muted" />
            </motion.div>
          )}
        </button>
      )}

      {/* Group Items */}
      {isCollapsed ? (
        // When sidebar collapsed, show items only if group is expanded
        isExpanded && (
          <div className="mt-1 space-y-1">
            {children}
          </div>
        )
      ) : (
        // When sidebar expanded, show with animation based on group expansion state
        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              style={{
                overflow: 'hidden',
                willChange: 'height, opacity'
              }}
            >
              <div className="mt-1 space-y-1">
                {children}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}
