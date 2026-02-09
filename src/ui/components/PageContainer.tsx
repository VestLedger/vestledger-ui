'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import { useDashboardDensity } from '@/contexts/dashboard-density-context';

// Simple className merger
function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}

export interface PageContainerProps extends Omit<HTMLMotionProps<'div'>, 'initial' | 'animate' | 'transition'> {
  children: React.ReactNode;
  className?: string;
  /** Disable the fade-in animation */
  noAnimation?: boolean;
  /** Maximum width variant */
  maxWidth?: 'default' | 'narrow' | 'wide' | 'full';
  /** Padding variant */
  padding?: 'none' | 'sm' | 'default' | 'lg' | 'dashboard';
}

const maxWidthClasses = {
  default: 'max-w-[1600px]',
  narrow: 'max-w-[1200px]',
  wide: 'max-w-[1920px]',
  full: 'max-w-full',
};

const paddingClasses = {
  none: '',
  sm: 'p-2 sm:p-4',
  default: 'p-4 sm:p-6 lg:p-8',
  lg: 'p-6 sm:p-8 lg:p-12',
};

export function PageContainer({
  children,
  className,
  noAnimation = false,
  maxWidth = 'default',
  padding = 'dashboard',
  ...props
}: PageContainerProps) {
  const density = useDashboardDensity();
  const resolvedPaddingClass = padding === 'dashboard'
    ? density.page.containerPaddingClass
    : paddingClasses[padding];

  const baseClasses = cn(
    resolvedPaddingClass,
    maxWidthClasses[maxWidth],
    'mx-auto',
    className
  );

  if (noAnimation) {
    return (
      <div className={baseClasses} {...(props as React.HTMLAttributes<HTMLDivElement>)}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={baseClasses}
      {...props}
    >
      {children}
    </motion.div>
  );
}
