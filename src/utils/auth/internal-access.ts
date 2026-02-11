import type { User } from '@/types/auth';

export type DomainTarget = 'admin' | 'app';

export const INTERNAL_TENANT_ID = 'org_vestledger_internal';

type UserLike = Partial<User> | null | undefined;

export function isInternalTenantUser(user: UserLike): boolean {
  return user?.tenantId === INTERNAL_TENANT_ID;
}

export function isSuperadminUser(user: UserLike): boolean {
  if (!user) return false;
  if (user.isPlatformAdmin === true) return true;
  return user.role === 'superadmin' && isInternalTenantUser(user);
}

export function resolveUserDomainTarget(user: UserLike): DomainTarget {
  return isSuperadminUser(user) ? 'admin' : 'app';
}
