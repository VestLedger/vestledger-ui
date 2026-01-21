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
 * Uses Tailwind classes for theming (same as NextUI components)
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
      primary: 'bg-app-primary dark:bg-app-dark-primary text-white hover:opacity-90',
      secondary: 'bg-app-secondary dark:bg-app-dark-secondary text-white hover:opacity-90',
      default: 'bg-app-surface-hover dark:bg-app-dark-surface-hover text-app-text dark:text-app-dark-text hover:opacity-90',
      success: 'bg-app-success dark:bg-app-dark-success text-white hover:opacity-90',
      danger: 'bg-app-danger dark:bg-app-dark-danger text-white hover:opacity-90',
    },
    bordered: {
      primary:
        'border-2 border-app-primary dark:border-app-dark-primary text-app-primary dark:text-app-dark-primary hover:bg-app-primary-bg dark:hover:bg-app-dark-primary-bg',
      secondary:
        'border-2 border-app-secondary dark:border-app-dark-secondary text-app-secondary dark:text-app-dark-secondary hover:bg-app-surface-hover dark:hover:bg-app-dark-surface-hover',
      default:
        'border-2 border-app-border dark:border-app-dark-border text-app-text dark:text-app-dark-text hover:bg-app-surface-hover dark:hover:bg-app-dark-surface-hover',
      success:
        'border-2 border-app-success dark:border-app-dark-success text-app-success dark:text-app-dark-success hover:bg-app-success-bg dark:hover:bg-app-dark-success-bg',
      danger:
        'border-2 border-app-danger dark:border-app-dark-danger text-app-danger dark:text-app-dark-danger hover:bg-app-danger-bg dark:hover:bg-app-dark-danger-bg',
    },
    light: {
      primary: 'text-app-primary dark:text-app-dark-primary hover:bg-app-primary-bg dark:hover:bg-app-dark-primary-bg',
      secondary: 'text-app-secondary dark:text-app-dark-secondary hover:bg-app-surface-hover dark:hover:bg-app-dark-surface-hover',
      default: 'text-app-text dark:text-app-dark-text hover:bg-app-surface-hover dark:hover:bg-app-dark-surface-hover',
      success: 'text-app-success dark:text-app-dark-success hover:bg-app-success-bg dark:hover:bg-app-dark-success-bg',
      danger: 'text-app-danger dark:text-app-dark-danger hover:bg-app-danger-bg dark:hover:bg-app-dark-danger-bg',
    },
    flat: {
      primary: 'bg-app-primary-bg dark:bg-app-dark-primary-bg text-app-primary dark:text-app-dark-primary hover:opacity-80',
      secondary: 'bg-app-surface-hover dark:bg-app-dark-surface-hover text-app-secondary dark:text-app-dark-secondary hover:opacity-80',
      default: 'bg-app-surface-hover dark:bg-app-dark-surface-hover text-app-text dark:text-app-dark-text hover:opacity-80',
      success: 'bg-app-success-bg dark:bg-app-dark-success-bg text-app-success dark:text-app-dark-success hover:opacity-80',
      danger: 'bg-app-danger-bg dark:bg-app-dark-danger-bg text-app-danger dark:text-app-dark-danger hover:opacity-80',
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
