'use client';

import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface SidebarToggleButtonProps {
  isCollapsed: boolean;
  onToggle: () => void;
  side: 'left' | 'right';
  ariaLabel: string;
}

export function SidebarToggleButton({
  isCollapsed,
  onToggle,
  side,
  ariaLabel
}: SidebarToggleButtonProps) {
  const Icon = side === 'left'
    ? (isCollapsed ? ChevronRight : ChevronLeft)
    : (isCollapsed ? ChevronLeft : ChevronRight);

  return (
    <motion.button
      onClick={onToggle}
      className="absolute top-1/2 -translate-y-1/2 w-6 h-12
                 bg-app-border dark:bg-app-dark-border hover:bg-app-primary dark:hover:bg-app-dark-primary
                 rounded-full flex items-center justify-center
                 transition-colors duration-200 z-50 group
                 shadow-lg border border-app-border dark:border-app-dark-border"
      style={{
        [side === 'left' ? 'right' : 'left']: '-12px',
      }}
      aria-label={ariaLabel}
      aria-expanded={!isCollapsed}
    >
      <span className="transition-transform duration-200 group-hover:scale-110 group-active:scale-95">
        <Icon className="w-4 h-4 text-app-text-muted dark:text-app-dark-text-muted group-hover:text-white transition-colors" />
      </span>
    </motion.button>
  );
}
