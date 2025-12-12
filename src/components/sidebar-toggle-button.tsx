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
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className="absolute top-1/2 -translate-y-1/2 w-6 h-12
                 bg-[var(--app-border)] hover:bg-[var(--app-primary)]
                 rounded-full flex items-center justify-center
                 transition-colors duration-200 z-50 group
                 shadow-lg border border-[var(--app-border)]"
      style={{
        [side === 'left' ? 'right' : 'left']: '-12px',
      }}
      aria-label={ariaLabel}
      aria-expanded={!isCollapsed}
    >
      <Icon className="w-4 h-4 text-[var(--app-text-muted)]
                       group-hover:text-white transition-colors" />
    </motion.button>
  );
}
