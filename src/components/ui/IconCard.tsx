import React from 'react';
import type { LucideIcon } from 'lucide-react';

/**
 * Variant types for IconCard component
 */
export type IconCardVariant = 'primary' | 'success' | 'warning' | 'danger' | 'neutral' | 'custom';

/**
 * Size types for IconCard component
 */
export type IconCardSize = 'sm' | 'md' | 'lg';

/**
 * Props for the IconCard component
 */
export interface IconCardProps {
  /** The Lucide icon component to display */
  icon: LucideIcon;
  /** The visual variant of the card */
  variant?: IconCardVariant;
  /** The size of the card */
  size?: IconCardSize;
  /** Custom background color (CSS variable or color value) */
  customBg?: string;
  /** Custom text/icon color (CSS variable or color value) */
  customColor?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Size configuration mapping
 */
const SIZE_CONFIG: Record<IconCardSize, { container: string; icon: number }> = {
  sm: { container: 'h-8 w-8', icon: 16 },
  md: { container: 'h-10 w-10', icon: 20 },
  lg: { container: 'h-12 w-12', icon: 24 },
};

/**
 * Variant configuration mapping
 */
const VARIANT_CONFIG: Record<IconCardVariant, { bg: string; color: string }> = {
  primary: {
    bg: 'bg-[var(--app-primary-bg)]',
    color: 'text-[var(--app-primary)]',
  },
  success: {
    bg: 'bg-[var(--app-success-bg)]',
    color: 'text-[var(--app-success)]',
  },
  warning: {
    bg: 'bg-[var(--app-warning-bg)]',
    color: 'text-[var(--app-warning)]',
  },
  danger: {
    bg: 'bg-[var(--app-danger-bg)]',
    color: 'text-[var(--app-danger)]',
  },
  neutral: {
    bg: 'bg-[var(--app-surface-hover)]',
    color: 'text-[var(--app-text-muted)]',
  },
  custom: {
    bg: '',
    color: '',
  },
};

/**
 * IconCard Component
 *
 * A reusable component for displaying an icon within a styled container.
 * Supports multiple variants, sizes, and custom styling.
 *
 * @example
 * ```tsx
 * import { DollarSign } from 'lucide-react';
 * import { IconCard } from '@/components/ui/IconCard';
 *
 * <IconCard icon={DollarSign} variant="success" size="md" />
 * ```
 *
 * @example
 * ```tsx
 * // With custom colors
 * <IconCard
 *   icon={AlertTriangle}
 *   variant="custom"
 *   customBg="var(--app-warning-bg)"
 *   customColor="var(--app-warning)"
 * />
 * ```
 */
export const IconCard: React.FC<IconCardProps> = ({
  icon: Icon,
  variant = 'primary',
  size = 'md',
  customBg,
  customColor,
  className = '',
}) => {
  const sizeConfig = SIZE_CONFIG[size];
  const variantConfig = VARIANT_CONFIG[variant];

  // Use custom colors if provided and variant is 'custom'
  const bgClass = variant === 'custom' && customBg
    ? `bg-[${customBg}]`
    : variantConfig.bg;

  const colorClass = variant === 'custom' && customColor
    ? `text-[${customColor}]`
    : variantConfig.color;

  return (
    <div
      className={`
        ${sizeConfig.container}
        ${bgClass}
        ${colorClass}
        rounded-lg
        flex
        items-center
        justify-center
        ${className}
      `.trim().replace(/\s+/g, ' ')}
    >
      <Icon size={sizeConfig.icon} />
    </div>
  );
};

export default IconCard;
