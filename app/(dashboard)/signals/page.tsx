"use client";

/**
 * Signals — first-class navigation item introduced in Phase 1.
 *
 * Phase 1 scope: provide the route and surface so the top-level nav anchor
 * resolves; reuse the existing notifications view as the initial signal feed.
 * Phase 2+ replaces the interior with the Signal → Context → Evidence → Action
 * pattern called for in `docs/ux-transformation/new_navigation_map.csv`.
 *
 * The legacy `/notifications` route is preserved and now treated as a child
 * of Signals via breadcrumbs in `src/config/routes.ts`.
 */
import { Notifications } from "@/components/notifications";

export default function SignalsPage() {
  return <Notifications />;
}
