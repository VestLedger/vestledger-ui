"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export interface PublicNavItem {
  href: string;
  label: string;
}

export const PUBLIC_NAV_ITEMS: PublicNavItem[] = [
  { href: "/features", label: "Features" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/security", label: "Security" },
  { href: "/about", label: "About" },
];

interface PublicNavLinksProps {
  orientation?: "horizontal" | "vertical";
  className?: string;
  onNavigate?: () => void;
  includeHome?: boolean;
}

function joinClasses(...classes: Array<string | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function PublicNavLinks({
  orientation = "horizontal",
  className,
  onNavigate,
  includeHome = false,
}: PublicNavLinksProps) {
  const pathname = usePathname();
  const isHorizontal = orientation === "horizontal";
  const items = includeHome
    ? [{ href: "/", label: "Home" }, ...PUBLIC_NAV_ITEMS]
    : PUBLIC_NAV_ITEMS;

  const containerClass = isHorizontal
    ? "flex items-center gap-7"
    : "flex flex-col gap-2";

  const linkClass = isHorizontal
    ? "public-marketing-shell-link text-sm font-medium tracking-[0.02em]"
    : "w-full rounded-2xl border border-[color:var(--marketing-shell-control-border)] bg-[color:var(--marketing-shell-control-bg)] px-4 py-3 text-left text-sm font-medium text-[var(--app-text)] transition-colors hover:border-[var(--app-border-strong)] hover:bg-[color:var(--marketing-shell-control-hover)]";

  return (
    <div className={joinClasses(containerClass, className)}>
      {items.map((item) => {
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={joinClasses(
              linkClass,
              isHorizontal
                ? undefined
                : isActive
                  ? "border-[color:var(--app-primary)] bg-[var(--app-primary-bg)]"
                  : undefined,
            )}
            data-active={isHorizontal ? isActive : undefined}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
