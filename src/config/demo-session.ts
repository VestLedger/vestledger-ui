import { MOCK_DEMO_PROFILE } from '@/config/auth';
import type { User } from '@/types/auth';

export const DEFAULT_DEMO_EMAIL = 'demo@vestledger.com';

type UserLike = Partial<User> | null | undefined;

export function getDemoEmail(): string {
  return process.env.NEXT_PUBLIC_DEMO_EMAIL?.trim().toLowerCase() || DEFAULT_DEMO_EMAIL;
}

export function getDemoPassword(): string | null {
  const value = process.env.NEXT_PUBLIC_DEMO_PASSWORD?.trim();
  return value && value.length > 0 ? value : null;
}

export function isDemoEmail(email?: string | null): boolean {
  if (!email) return false;
  return email.trim().toLowerCase() === getDemoEmail();
}

export function isDemoUser(user: UserLike): boolean {
  if (!user) return false;
  if (user.id && user.id === MOCK_DEMO_PROFILE.id) return true;
  return isDemoEmail(user.email);
}
