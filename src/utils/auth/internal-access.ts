import type { User } from '@/types/auth';
import { INTERNAL_TENANT_ID } from '@/config/auth';

export type DomainTarget = 'admin' | 'app';
export { INTERNAL_TENANT_ID };

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
