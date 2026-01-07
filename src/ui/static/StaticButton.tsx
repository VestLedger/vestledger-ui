import { ReactNode, CSSProperties } from 'react';
import Link from 'next/link';

export interface StaticButtonProps {
  children: ReactNode;
  href?: string;
  variant?: 'solid' | 'bordered' | 'light' | 'flat';
  color?: 'primary' | 'secondary' | 'default' | 'success' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  className?: string;
  style?: CSSProperties;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}

/**
 * Pure server-side button component
 * Supports both link and button variants
 * Zero client-side JavaScript (unless onClick provided)
 * Uses CSS variables for theming (same as NextUI components)
 */
export function StaticButton({
  children,
  href,
  variant = 'solid',
  color = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  style,
  onClick,
  type = 'button',
  disabled = false,
}: StaticButtonProps) {
  const baseClasses =
    'inline-flex items-center justify-center rounded-lg font-medium transition-colors';

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const variantColorClasses = {
    solid: {
      primary: 'bg-[var(--app-primary)] text-white hover:opacity-90',
      secondary: 'bg-[var(--app-secondary)] text-white hover:opacity-90',
      default: 'bg-[var(--app-surface-hover)] text-[var(--app-text)] hover:opacity-90',
      success: 'bg-[var(--app-success)] text-white hover:opacity-90',
      danger: 'bg-[var(--app-danger)] text-white hover:opacity-90',
    },
    bordered: {
      primary:
        'border-2 border-[var(--app-primary)] text-[var(--app-primary)] hover:bg-[var(--app-primary-bg)]',
      secondary:
        'border-2 border-[var(--app-secondary)] text-[var(--app-secondary)] hover:bg-[var(--app-surface-hover)]',
      default:
        'border-2 border-[var(--app-border)] text-[var(--app-text)] hover:bg-[var(--app-surface-hover)]',
      success:
        'border-2 border-[var(--app-success)] text-[var(--app-success)] hover:bg-[var(--app-success-bg)]',
      danger:
        'border-2 border-[var(--app-danger)] text-[var(--app-danger)] hover:bg-[var(--app-danger-bg)]',
    },
    light: {
      primary: 'text-[var(--app-primary)] hover:bg-[var(--app-primary-bg)]',
      secondary: 'text-[var(--app-secondary)] hover:bg-[var(--app-surface-hover)]',
      default: 'text-[var(--app-text)] hover:bg-[var(--app-surface-hover)]',
      success: 'text-[var(--app-success)] hover:bg-[var(--app-success-bg)]',
      danger: 'text-[var(--app-danger)] hover:bg-[var(--app-danger-bg)]',
    },
    flat: {
      primary: 'bg-[var(--app-primary-bg)] text-[var(--app-primary)] hover:opacity-80',
      secondary: 'bg-[var(--app-surface-hover)] text-[var(--app-secondary)] hover:opacity-80',
      default: 'bg-[var(--app-surface-hover)] text-[var(--app-text)] hover:opacity-80',
      success: 'bg-[var(--app-success-bg)] text-[var(--app-success)] hover:opacity-80',
      danger: 'bg-[var(--app-danger-bg)] text-[var(--app-danger)] hover:opacity-80',
    },
  };

  const widthClass = fullWidth ? 'w-full' : '';
  const disabledClass = disabled ? 'opacity-50 cursor-not-allowed' : '';
  const classes = `${baseClasses} ${sizeClasses[size]} ${variantColorClasses[variant][color]} ${widthClass} ${disabledClass} ${className}`;

  if (href && !disabled) {
    return (
      <Link href={href} className={classes} style={style}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} style={style} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}
