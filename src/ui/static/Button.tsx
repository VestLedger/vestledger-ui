import { ComponentPropsWithoutRef, ElementType } from 'react';
import Link from 'next/link';

interface StaticButtonBaseProps {
  href?: string;
  color?: 'default' | 'primary' | 'success' | 'danger';
  variant?: 'solid' | 'bordered' | 'light' | 'flat';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  as?: ElementType;
  isIconOnly?: boolean;
}

type StaticButtonProps = StaticButtonBaseProps &
  (ComponentPropsWithoutRef<'a'> | ComponentPropsWithoutRef<'button'>);

export function StaticButton({
  href,
  color = 'default',
  variant = 'solid',
  size = 'md',
  fullWidth = false,
  isIconOnly = false,
  as,
  className = '',
  children,
  ...props
}: StaticButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors';

  const sizeClasses = isIconOnly
    ? {
        sm: 'w-8 h-8',
        md: 'w-10 h-10',
        lg: 'w-12 h-12'
      }
    : {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg'
      };

  const colorVariantClasses = {
    default: {
      solid: 'bg-[var(--app-surface-hover)] text-[var(--app-text)] hover:bg-[var(--app-border)]',
      bordered: 'border-2 border-[var(--app-border)] text-[var(--app-text)] hover:bg-[var(--app-surface-hover)]',
      light: 'text-[var(--app-text-muted)] hover:bg-[var(--app-surface-hover)]',
      flat: 'bg-[var(--app-surface-hover)] text-[var(--app-text-muted)] hover:text-[var(--app-text)]'
    },
    primary: {
      solid: 'bg-[var(--app-primary)] text-white hover:opacity-90',
      bordered: 'border-2 border-[var(--app-primary)] text-[var(--app-primary)] hover:bg-[var(--app-primary-bg)]',
      light: 'text-[var(--app-primary)] hover:bg-[var(--app-primary-bg)]',
      flat: 'bg-[var(--app-primary-bg)] text-[var(--app-primary)] hover:bg-[var(--app-primary)]/20'
    },
    success: {
      solid: 'bg-[var(--app-success)] text-white hover:opacity-90',
      bordered: 'border-2 border-[var(--app-success)] text-[var(--app-success)] hover:bg-[var(--app-success-bg)]',
      light: 'text-[var(--app-success)] hover:bg-[var(--app-success-bg)]',
      flat: 'bg-[var(--app-success-bg)] text-[var(--app-success)] hover:bg-[var(--app-success)]/20'
    },
    danger: {
      solid: 'bg-[var(--app-danger)] text-white hover:opacity-90',
      bordered: 'border-2 border-[var(--app-danger)] text-[var(--app-danger)] hover:bg-[var(--app-danger-bg)]',
      light: 'text-[var(--app-danger)] hover:bg-[var(--app-danger-bg)]',
      flat: 'bg-[var(--app-danger-bg)] text-[var(--app-danger)] hover:bg-[var(--app-danger)]/20'
    }
  };

  const widthClass = fullWidth ? 'w-full' : '';
  const classes = `${baseClasses} ${sizeClasses[size]} ${colorVariantClasses[color][variant]} ${widthClass} ${className}`;

  if (href) {
    const Component = as || Link;
    return (
      <Component href={href} className={classes} {...(props as any)}>
        {children}
      </Component>
    );
  }

  return (
    <button className={classes} {...(props as any)}>
      {children}
    </button>
  );
}
