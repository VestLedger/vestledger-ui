/**
 * Dashboard routes and role-access data for E2E tests.
 *
 * Derived from:
 *   src/config/access-routes.ts  (DASHBOARD_ROUTE_PREFIXES)
 *   src/config/route-access-control.ts  (ROUTE_ACCESS_RULES)
 *
 * Keep in sync when routes change in the source config.
 */

export const DASHBOARD_ROUTES = [
  '/home',
  '/vesta',
  '/portfolio',
  '/analytics',
  '/pipeline',
  '/lp-management',
  '/fund-admin',
  '/documents',
  '/reports',
  '/compliance',
  '/audit-trail',
  '/409a-valuations',
  '/integrations',
  '/collaboration',
  '/settings',
  '/tax-center',
  '/waterfall',
  '/ai-tools',
  '/notifications',
  '/deal-intelligence',
  '/dealflow-review',
  '/contacts',
  '/lp-portal',
] as const;

/** Routes the default `gp` test user cannot access (role-restricted to other roles). */
export const GP_DENIED_ROUTES: readonly string[] = ['/lp-portal'];

/** Routes the default `gp` test user can access after authentication. */
export const GP_ACCESSIBLE_ROUTES = DASHBOARD_ROUTES.filter(
  (route) => !GP_DENIED_ROUTES.includes(route)
);
