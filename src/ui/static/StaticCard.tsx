import { ReactNode, CSSProperties } from 'react';

export interface StaticCardProps {
  children?: ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  style?: CSSProperties;
  onClick?: () => void;
}

/**
 * Pure server-side card component
 * Zero client-side JavaScript, no hydration
 * Uses Tailwind classes for theming (same as NextUI components)
 */
export function StaticCard({
  children,
  className = '',
  padding = 'md',
  style,
  onClick,
}: StaticCardProps) {
  const paddingClasses = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={`bg-app-surface dark:bg-app-dark-surface border border-app-border dark:border-app-dark-border rounded-lg ${paddingClasses[padding]} ${className}`}
      style={style}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
