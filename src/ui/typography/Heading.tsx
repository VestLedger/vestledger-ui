import { ReactNode } from 'react';

export interface HeadingProps {
  children: ReactNode;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  className?: string;
  color?: 'default' | 'primary' | 'secondary' | 'muted';
}

const levelClasses = {
  1: 'text-4xl sm:text-5xl lg:text-6xl font-bold',
  2: 'text-3xl sm:text-4xl lg:text-5xl font-bold',
  3: 'text-2xl sm:text-3xl lg:text-4xl font-semibold',
  4: 'text-xl sm:text-2xl lg:text-3xl font-semibold',
  5: 'text-lg sm:text-xl lg:text-2xl font-medium',
  6: 'text-base sm:text-lg lg:text-xl font-medium',
};

const colorClasses = {
  default: 'text-app-text dark:text-app-dark-text',
  primary: 'text-app-primary dark:text-app-dark-primary',
  secondary: 'text-app-secondary dark:text-app-dark-secondary',
  muted: 'text-app-text-muted dark:text-app-dark-text-muted',
};

export function Heading({ children, level = 2, color = 'default', className = '' }: HeadingProps) {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;

  return (
    <Tag className={`${levelClasses[level]} ${colorClasses[color]} ${className}`}>
      {children}
    </Tag>
  );
}
