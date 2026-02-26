import { describe, expect, it } from 'vitest';
import {
  canRoleAccessPath,
  getDefaultPathForRole,
  getAllowedRolesForPath,
  isUserRole,
  normalizeRoutePath,
} from '../route-access-control';

describe('route-access-control', () => {
  it('normalizes route paths with trailing slash', () => {
    expect(normalizeRoutePath('/fund-admin/')).toBe('/fund-admin');
    expect(normalizeRoutePath('/')).toBe('/');
  });

  it('validates user roles', () => {
    expect(isUserRole('gp')).toBe(true);
    expect(isUserRole('random')).toBe(false);
    expect(isUserRole(undefined)).toBe(false);
  });

  it('returns allowed roles for restricted routes', () => {
    expect(getAllowedRolesForPath('/fund-admin')).toContain('ops');
    expect(getAllowedRolesForPath('/home')).toBeNull();
  });

  it('enforces restricted route access', () => {
    expect(canRoleAccessPath('ops', '/fund-admin')).toBe(true);
    expect(canRoleAccessPath('lp', '/fund-admin')).toBe(false);
    expect(canRoleAccessPath('lp', '/lp-portal')).toBe(true);
    expect(canRoleAccessPath('gp', '/lp-portal')).toBe(false);
  });

  it('allows unrestricted routes for authenticated roles', () => {
    expect(canRoleAccessPath('gp', '/home')).toBe(true);
    expect(canRoleAccessPath('analyst', '/reports')).toBe(true);
  });

  it('returns default paths by role and sane fallback', () => {
    expect(getDefaultPathForRole('gp')).toBe('/home');
    expect(getDefaultPathForRole('ir')).toBe('/lp-management');
    expect(getDefaultPathForRole('not-a-role')).toBe('/home');
  });
});
