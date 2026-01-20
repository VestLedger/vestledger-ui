'use client';

import { forwardRef } from 'react';
import { LucideIcon, LucideProps } from 'lucide-react';

/**
 * Icon Component
 *
 * A wrapper for Lucide icons with consistent sizing and color variants.
 * Provides semantic color options that match the app's theme system.
 *
 * @example
 * ```tsx
 * import { Icon } from '@/ui';
 * import { TrendingUp } from 'lucide-react';
 *
 * <Icon icon={TrendingUp} size="md" color="success" />
 * ```
 */

export interface IconProps extends Omit<LucideProps, 'size' | 'color'> {
  /** The Lucide icon component to render */
  icon: LucideIcon;
  /** Size variant */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Color variant using semantic theme colors */
  color?: 'default' | 'muted' | 'subtle' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'accent' | 'info';
}

const sizeMap = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-8 h-8',
};

const colorMap = {
  default: 'text-app-text dark:text-app-dark-text',
  muted: 'text-app-text-muted dark:text-app-dark-text-muted',
  subtle: 'text-app-text-subtle dark:text-app-dark-text-subtle',
  primary: 'text-app-primary dark:text-app-dark-primary',
  secondary: 'text-app-secondary dark:text-app-dark-secondary',
  success: 'text-app-success dark:text-app-dark-success',
  warning: 'text-app-warning dark:text-app-dark-warning',
  danger: 'text-app-danger dark:text-app-dark-danger',
  accent: 'text-app-accent dark:text-app-dark-accent',
  info: 'text-app-info dark:text-app-dark-info',
};

export const Icon = forwardRef<SVGSVGElement, IconProps>(
  ({ icon: LucideIconComponent, size = 'md', color = 'default', className = '', ...props }, ref) => {
    const sizeClass = sizeMap[size];
    const colorClass = colorMap[color];
    const combinedClassName = `${sizeClass} ${colorClass} ${className}`.trim();

    return <LucideIconComponent ref={ref} className={combinedClassName} {...props} />;
  }
);

Icon.displayName = 'Icon';
