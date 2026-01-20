import { ReactNode } from 'react';

export interface TextProps {
  children: ReactNode;
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  color?: 'default' | 'primary' | 'secondary' | 'muted' | 'subtle' | 'success' | 'warning' | 'danger';
  className?: string;
  as?: 'p' | 'span' | 'div';
}

const sizeClasses = {
  xs: 'text-xs',
  sm: 'text-sm',
  base: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
};

const weightClasses = {
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
};

const colorClasses = {
  default: 'text-app-text dark:text-app-dark-text',
  primary: 'text-app-primary dark:text-app-dark-primary',
  secondary: 'text-app-secondary dark:text-app-dark-secondary',
  muted: 'text-app-text-muted dark:text-app-dark-text-muted',
  subtle: 'text-app-text-subtle dark:text-app-dark-text-subtle',
  success: 'text-app-success dark:text-app-dark-success',
  warning: 'text-app-warning dark:text-app-dark-warning',
  danger: 'text-app-danger dark:text-app-dark-danger',
};

export function Text({
  children,
  size = 'base',
  weight = 'normal',
  color = 'default',
  as: Tag = 'p',
  className = '',
}: TextProps) {
  return (
    <Tag className={`${sizeClasses[size]} ${weightClasses[weight]} ${colorClasses[color]} ${className}`}>
      {children}
    </Tag>
  );
}
