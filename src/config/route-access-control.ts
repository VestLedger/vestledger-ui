import type { UserRole } from '@/types/auth';
import { ACCESS_ROUTE_PATHS } from '@/config/access-routes';

export type RouteAccessRule = {
  pathPrefix: string;
  allowedRoles: readonly UserRole[];
};

const ROLE_VALUES: readonly UserRole[] = [
  'superadmin',
  'gp',
  'analyst',
  'ops',
  'ir',
  'researcher',
  'lp',
  'auditor',
  'service_provider',
  'strategic_partner',
];

const ALL_APP_ROLES: readonly UserRole[] = ROLE_VALUES.filter((role) => role !== 'superadmin');

export const DEFAULT_APP_PATH_BY_ROLE: Record<UserRole, string> = Object.freeze({
  superadmin: '/superadmin',
  gp: '/home',
  analyst: '/pipeline',
  ops: '/fund-admin',
  ir: '/lp-management',
  researcher: '/reports',
  lp: '/lp-portal',
  auditor: '/compliance',
  service_provider: '/home',
  strategic_partner: '/dealflow-review',
});

export const ROUTE_ACCESS_RULES: readonly RouteAccessRule[] = Object.freeze([
  { pathPrefix: '/superadmin', allowedRoles: ['superadmin'] },
  { pathPrefix: '/lp-portal', allowedRoles: ['lp'] },
  { pathPrefix: '/deal-intelligence', allowedRoles: ['gp', 'analyst', 'strategic_partner'] },
  { pathPrefix: '/dealflow-review', allowedRoles: ['gp', 'analyst', 'strategic_partner'] },
  { pathPrefix: '/fund-admin', allowedRoles: ['gp', 'ops', 'service_provider'] },
  { pathPrefix: '/lp-management', allowedRoles: ['gp', 'ops', 'ir', 'auditor', 'service_provider'] },
  { pathPrefix: '/compliance', allowedRoles: ['gp', 'ops', 'auditor', 'service_provider'] },
  { pathPrefix: '/audit-trail', allowedRoles: ['gp', 'ops', 'auditor', 'service_provider'] },
  { pathPrefix: '/409a-valuations', allowedRoles: ['gp', 'ops', 'service_provider'] },
  { pathPrefix: '/tax-center', allowedRoles: ['gp', 'ops', 'service_provider'] },
  { pathPrefix: '/collaboration', allowedRoles: ALL_APP_ROLES },
]);

export function normalizeRoutePath(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith('/')) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

export function isUserRole(value: unknown): value is UserRole {
  if (typeof value !== 'string') return false;
  return (ROLE_VALUES as readonly string[]).includes(value);
}

function findRule(pathname: string): RouteAccessRule | null {
  const normalizedPath = normalizeRoutePath(pathname);
  for (const rule of ROUTE_ACCESS_RULES) {
    if (normalizedPath === rule.pathPrefix || normalizedPath.startsWith(`${rule.pathPrefix}/`)) {
      return rule;
    }
  }
  return null;
}

export function getAllowedRolesForPath(pathname: string): readonly UserRole[] | null {
  return findRule(pathname)?.allowedRoles ?? null;
}

export function canRoleAccessPath(
  role: UserRole | string | null | undefined,
  pathname: string
): boolean {
  const normalizedPath = normalizeRoutePath(pathname);

  if (
    normalizedPath === ACCESS_ROUTE_PATHS.publicHome ||
    normalizedPath === ACCESS_ROUTE_PATHS.login
  ) {
    return true;
  }

  const allowedRoles = getAllowedRolesForPath(normalizedPath);
  if (!allowedRoles) return true;
  if (!isUserRole(role)) return false;

  return allowedRoles.includes(role);
}

export function getDefaultPathForRole(role: UserRole | string | null | undefined): string {
  if (!isUserRole(role)) {
    return ACCESS_ROUTE_PATHS.appHome;
  }
  return DEFAULT_APP_PATH_BY_ROLE[role] ?? ACCESS_ROUTE_PATHS.appHome;
}
