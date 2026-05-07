"use client";

/**
 * Deals workbench shell (Phase 2 module 2A).
 *
 * Wraps the unified Deals routes — `/deals`, `/deals/pipeline`,
 * `/deals/intelligence`, `/deals/review`, `/deals/ai-tools` — with a single
 * sub-navigation strip. Each child page continues to own its own page chrome
 * (breadcrumb / `PageScaffold` from `@/ui`); this layout intentionally adds
 * only the sub-nav so the existing component interiors are not duplicated.
 */

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  GitBranch,
  Search,
  Vote,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

type DealsSubNavItem = {
  id: string;
  href: string;
  label: string;
  icon: LucideIcon;
  /** Paths that should mark this sub-tab active (covers `/deals` index). */
  activeFor: readonly string[];
  /** Legacy URLs kept reachable via redirect (informational only). */
  legacyAliases?: readonly string[];
};

const DEALS_SUBNAV: readonly DealsSubNavItem[] = [
  {
    id: "pipeline",
    href: "/deals/pipeline",
    label: "Pipeline",
    icon: GitBranch,
    activeFor: ["/deals", "/deals/pipeline"],
    legacyAliases: ["/pipeline"],
  },
  {
    id: "intelligence",
    href: "/deals/intelligence",
    label: "Deal Intelligence",
    icon: Search,
    activeFor: ["/deals/intelligence"],
    legacyAliases: ["/deal-intelligence"],
  },
  {
    id: "review",
    href: "/deals/review",
    label: "Dealflow Review",
    icon: Vote,
    activeFor: ["/deals/review"],
    legacyAliases: ["/dealflow-review"],
  },
  {
    id: "ai-tools",
    href: "/deals/ai-tools",
    label: "AI Tools",
    icon: Sparkles,
    activeFor: ["/deals/ai-tools"],
    legacyAliases: ["/ai-tools"],
  },
];

function isSubNavActive(pathname: string, item: DealsSubNavItem): boolean {
  return item.activeFor.some(
    (anchor) => pathname === anchor || pathname.startsWith(`${anchor}/`),
  );
}

export default function DealsWorkbenchLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname() ?? "/deals";

  return (
    <div className="flex flex-col gap-4">
      <nav
        aria-label="Deals workbench"
        className="sticky top-0 z-10 -mx-2 flex flex-wrap gap-1 border-b border-app-border bg-app-surface/90 px-2 py-2 backdrop-blur dark:border-app-dark-border dark:bg-app-dark-surface/90"
      >
        {DEALS_SUBNAV.map((item) => {
          const active = isSubNavActive(pathname, item);
          const Icon = item.icon;
          return (
            <Link
              key={item.id}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`
                inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors
                ${
                  active
                    ? "bg-app-primary/10 text-app-primary dark:bg-app-dark-primary/15 dark:text-app-dark-primary"
                    : "text-app-text-muted hover:bg-app-surface-hover hover:text-app-text dark:text-app-dark-text-muted dark:hover:bg-app-dark-surface-hover dark:hover:text-app-dark-text"
                }
              `}
            >
              <Icon className="h-4 w-4" aria-hidden />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div>{children}</div>
    </div>
  );
}
