import { isMockMode } from '@/config/data-mode';
import { createMockUser } from '@/data/mocks/auth';
import type { User, UserRole } from '@/types/auth';

export function createUser(email: string, role: UserRole): User {
  if (isMockMode()) return createMockUser(email, role);
  throw new Error('Auth API not implemented yet');
}

