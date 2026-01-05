import { ComponentPropsWithoutRef } from 'react';

interface StaticCardProps extends ComponentPropsWithoutRef<'div'> {
  padding?: 'none' | 'sm' | 'md' | 'lg';
  variant?: 'default' | 'bordered' | 'elevated';
}

export function StaticCard({
  padding = 'md',
  variant = 'default',
  className = '',
  children,
  ...props
}: StaticCardProps) {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  const variantClasses = {
    default: 'bg-[var(--app-surface)] rounded-xl',
    bordered: 'bg-[var(--app-surface)] rounded-xl border border-[var(--app-border)]',
    elevated: 'bg-[var(--app-surface)] rounded-xl shadow-lg'
  };

  return (
    <div
      className={`${variantClasses[variant]} ${paddingClasses[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
