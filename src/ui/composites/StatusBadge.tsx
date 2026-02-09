import React from 'react';
import { getStatusColor, type StatusDomain } from '@/utils/styling/statusColors';
import { getStatusIcon } from '@/utils/styling/statusIcons';

/**
 * Size types for StatusBadge component
 */
export type StatusBadgeSize = 'sm' | 'md' | 'lg';

/**
 * Props for the StatusBadge component
 */
export interface StatusBadgeProps {
  /** The status value to display */
  status: string;
  /** The domain context for status color mapping */
  domain?: StatusDomain;
  /** Whether to show an icon alongside the status text */
  showIcon?: boolean;
  /** The size of the badge */
  size?: StatusBadgeSize;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Size configuration mapping
 */
const SIZE_CONFIG: Record<StatusBadgeSize, { padding: string; text: string; icon: number }> = {
  sm: {
    padding: 'px-2 py-0.5',
    text: 'text-xs',
    icon: 12,
  },
  md: {
    padding: 'px-2.5 py-1',
    text: 'text-sm',
    icon: 14,
  },
  lg: {
    padding: 'px-3 py-1.5',
    text: 'text-base',
    icon: 16,
  },
};

/**
 * StatusBadge Component
 *
 * A reusable badge component for displaying status with appropriate colors and optional icons.
 * Integrates with the centralized status color and icon utilities.
 *
 * @example
 * ```tsx
 * import { StatusBadge } from '@/ui/composites';
 *
 * <StatusBadge status="completed" domain="compliance" showIcon />
 * ```
 *
 * @example
 * ```tsx
 * // Different sizes
 * <StatusBadge status="pending" size="sm" />
 * <StatusBadge status="in-progress" size="md" showIcon />
 * <StatusBadge status="overdue" size="lg" showIcon domain="tax" />
 * ```
 *
 * @example
 * ```tsx
 * // Domain-specific status
 * <StatusBadge status="sent" domain="tax" showIcon />
 * <StatusBadge status="published" domain="fund-admin" />
 * <StatusBadge status="current" domain="compliance" showIcon />
 * ```
 */
export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  domain = 'general',
  showIcon = false,
  size = 'md',
  className = '',
}) => {
  const sizeConfig = SIZE_CONFIG[size];
  const colorClasses = getStatusColor(status, domain);
  const Icon = showIcon ? getStatusIcon(status, domain) : null;

  // Capitalize the status for display
  const displayStatus = status
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return (
    <span
      className={`
        inline-flex
        items-center
        gap-1
        ${sizeConfig.padding}
        ${sizeConfig.text}
        ${colorClasses}
        rounded-full
        font-medium
        ${className}
      `.trim().replace(/\s+/g, ' ')}
    >
      {Icon && <Icon size={sizeConfig.icon} />}
      {displayStatus}
    </span>
  );
};

/**
 * StatusBadgeWithCustomColors Component
 *
 * A variant of StatusBadge that accepts custom CSS variables for colors.
 * Useful when you need fine-grained control over styling.
 *
 * @example
 * ```tsx
 * import { StatusBadgeWithCustomColors } from '@/ui/composites';
 * import { getStatusColorVars } from '@/utils/styling/statusColors';
 *
 * const colors = getStatusColorVars('completed', 'compliance');
 * <StatusBadgeWithCustomColors
 *   status="completed"
 *   bgColor={colors.bg}
 *   textColor={colors.text}
 *   showIcon
 * />
 * ```
 */
export const StatusBadgeWithCustomColors: React.FC<{
  status: string;
  bgColor: string;
  textColor: string;
  showIcon?: boolean;
  size?: StatusBadgeSize;
  domain?: StatusDomain;
  className?: string;
}> = ({
  status,
  bgColor,
  textColor,
  showIcon = false,
  size = 'md',
  domain = 'general',
  className = '',
}) => {
  const sizeConfig = SIZE_CONFIG[size];
  const Icon = showIcon ? getStatusIcon(status, domain) : null;

  // Capitalize the status for display
  const displayStatus = status
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return (
    <span
      className={`
        inline-flex
        items-center
        gap-1
        ${sizeConfig.padding}
        ${sizeConfig.text}
        bg-[${bgColor}]
        text-[${textColor}]
        rounded-full
        font-medium
        ${className}
      `.trim().replace(/\s+/g, ' ')}
    >
      {Icon && <Icon size={sizeConfig.icon} />}
      {displayStatus}
    </span>
  );
};

export default StatusBadge;
