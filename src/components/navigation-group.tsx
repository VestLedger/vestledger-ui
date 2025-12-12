'use client'

import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, type LucideIcon } from 'lucide-react';
import { useNavigation } from '@/contexts/navigation-context';

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
  const isExpanded = alwaysExpanded || expandedGroups.has(id);

  return (
    <div className="mb-2">
      {/* Group Header */}
      {isCollapsed ? (
        // In collapsed mode, always reserve space for group icon
        Icon && (
          !isExpanded ? (
            <button
              onClick={() => toggleGroup(id)}
              className="flex items-center justify-center p-2 w-full rounded-lg hover:bg-[var(--app-surface-hover)] transition-colors"
              title={label}
              aria-label={label}
              aria-expanded={isExpanded}
            >
              <Icon className={`w-5 h-5 ${alwaysExpanded ? 'text-[var(--app-primary)]' : 'text-[var(--app-text-muted)]'}`} />
            </button>
          ) : (
            // Keep the space but make it invisible when expanded
            <div className="p-2 w-full" aria-hidden="true">
              <div className="w-5 h-5" />
            </div>
          )
        )
      ) : (
        // In expanded mode, show full group header
        <button
          onClick={() => toggleGroup(id)}
          className={`
            w-full flex items-center justify-between px-3 py-2 rounded-lg
            transition-colors duration-150
            ${alwaysExpanded
              ? 'cursor-default'
              : 'cursor-pointer hover:bg-[var(--app-surface-hover)]'
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
                  ? 'text-[var(--app-primary)]'
                  : 'text-[var(--app-text-muted)]'
                }
              `} />
            )}
            <span className={`
              text-xs font-semibold uppercase tracking-wider
              ${alwaysExpanded
                ? 'text-[var(--app-text)]'
                : 'text-[var(--app-text-muted)]'
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
              <ChevronDown className="w-4 h-4 text-[var(--app-text-muted)]" />
            </motion.div>
          )}
        </button>
      )}

      {/* Group Items */}
      {isCollapsed ? (
        // When sidebar collapsed, show items only if group is expanded
        isExpanded && (
          <div className="space-y-1">
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
