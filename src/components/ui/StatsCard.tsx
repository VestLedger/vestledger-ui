import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { IconCard, type IconCardVariant } from './IconCard';

/**
 * Props for the StatsCard component
 */
export interface StatsCardProps {
  /** The title/label of the stat */
  title: string;
  /** The main value to display */
  value: string | number;
  /** The Lucide icon component to display */
  icon: LucideIcon;
  /** The visual variant for the icon */
  variant?: IconCardVariant;
  /** Optional subtitle or additional information */
  subtitle?: string;
  /** Optional trend indicator (positive, negative, or neutral) */
  trend?: {
    value: string;
    direction: 'up' | 'down' | 'neutral';
  };
  /** Custom background color for icon (CSS variable or color value) */
  customIconBg?: string;
  /** Custom text/icon color (CSS variable or color value) */
  customIconColor?: string;
  /** Additional CSS classes for the container */
  className?: string;
  /** Click handler for interactive cards */
  onClick?: () => void;
}

/**
 * StatsCard Component
 *
 * A reusable card component for displaying statistics with an icon, title, and value.
 * Optionally supports trends and subtitles.
 *
 * @example
 * ```tsx
 * import { DollarSign } from 'lucide-react';
 * import { StatsCard } from '@/components/ui/StatsCard';
 * import { formatCurrency } from '@/utils/formatting';
 *
 * <StatsCard
 *   title="Total Assets"
 *   value={formatCurrency(1250000)}
 *   icon={DollarSign}
 *   variant="success"
 *   trend={{ value: '+12.5%', direction: 'up' }}
 * />
 * ```
 *
 * @example
 * ```tsx
 * // With subtitle
 * <StatsCard
 *   title="Portfolio Companies"
 *   value={42}
 *   icon={Briefcase}
 *   variant="primary"
 *   subtitle="Across 3 funds"
 * />
 * ```
 */
export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  variant = 'primary',
  subtitle,
  trend,
  customIconBg,
  customIconColor,
  className = '',
  onClick,
}) => {
  const isClickable = !!onClick;

  const getTrendColor = (direction: 'up' | 'down' | 'neutral'): string => {
    switch (direction) {
      case 'up':
        return 'text-[var(--app-success)]';
      case 'down':
        return 'text-[var(--app-danger)]';
      case 'neutral':
      default:
        return 'text-[var(--app-text-muted)]';
    }
  };

  return (
    <div
      className={`
        bg-[var(--app-surface)]
        border
        border-[var(--app-border)]
        rounded-lg
        p-4
        ${isClickable ? 'cursor-pointer hover:bg-[var(--app-surface-hover)] transition-colors' : ''}
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-[var(--app-text-muted)] mb-1">{title}</p>
          <p className="text-2xl font-semibold text-[var(--app-text)]">{value}</p>
          {subtitle && (
            <p className="text-xs text-[var(--app-text-muted)] mt-1">{subtitle}</p>
          )}
          {trend && (
            <div className={`text-sm font-medium mt-2 ${getTrendColor(trend.direction)}`}>
              {trend.value}
            </div>
          )}
        </div>
        <IconCard
          icon={icon}
          variant={variant}
          customBg={customIconBg}
          customColor={customIconColor}
        />
      </div>
    </div>
  );
};

export default StatsCard;
