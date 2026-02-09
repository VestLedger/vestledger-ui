'use client';

import Link from 'next/link';

export interface PublicNavItem {
  href: string;
  label: string;
}

export const PUBLIC_NAV_ITEMS: PublicNavItem[] = [
  { href: '/features', label: 'Features' },
  { href: '/how-it-works', label: 'How It Works' },
  { href: '/security', label: 'Security' },
  { href: '/about', label: 'About' },
];

interface PublicNavLinksProps {
  orientation?: 'horizontal' | 'vertical';
  className?: string;
  onNavigate?: () => void;
}

function joinClasses(...classes: Array<string | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export function PublicNavLinks({
  orientation = 'horizontal',
  className,
  onNavigate,
}: PublicNavLinksProps) {
  const isHorizontal = orientation === 'horizontal';

  const containerClass = isHorizontal
    ? 'flex items-center gap-6'
    : 'flex flex-col';

  const linkClass = isHorizontal
    ? 'text-sm text-[var(--app-text-muted)] hover:text-[var(--app-primary)] transition-colors'
    : 'px-3 py-2 rounded-md text-sm text-[var(--app-text)] hover:bg-[var(--app-surface-hover)] transition-colors';

  return (
    <div className={joinClasses(containerClass, className)}>
      {PUBLIC_NAV_ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={onNavigate}
          className={linkClass}
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}
