import NextLink from 'next/link';
import { ReactNode } from 'react';

export interface LinkProps {
  children: ReactNode;
  href: string;
  color?: 'default' | 'primary' | 'secondary';
  external?: boolean;
  className?: string;
}

const colorClasses = {
  default: 'text-app-text dark:text-app-dark-text hover:text-app-primary dark:hover:text-app-dark-primary',
  primary: 'text-app-primary dark:text-app-dark-primary hover:text-app-primary-hover dark:hover:text-app-dark-primary-hover',
  secondary: 'text-app-secondary dark:text-app-dark-secondary hover:text-app-secondary-hover dark:hover:text-app-dark-secondary-hover',
};

export function Link({ children, href, color = 'primary', external = false, className = '' }: LinkProps) {
  const linkClass = `${colorClasses[color]} transition-colors underline-offset-4 hover:underline ${className}`;

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={linkClass}
      >
        {children}
      </a>
    );
  }

  return (
    <NextLink href={href} className={linkClass}>
      {children}
    </NextLink>
  );
}
