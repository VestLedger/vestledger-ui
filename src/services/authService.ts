import { getApiBaseUrl } from '@/api/config';
import { ApiError } from '@/api/errors';
import { isMockMode } from '@/config/data-mode';
import { createMockUser } from '@/data/mocks/auth';
import type { User, UserRole } from '@/types/auth';

type ApiUser = {
  email: string;
  name: string;
  username?: string;
};

type AuthResponse = {
  user: ApiUser;
  access_token?: string;
};

export type AuthResult = {
  user: User;
  accessToken: string | null;
};

function normalizeName(email: string): string {
  const local = email.split('@')[0] ?? '';
  if (!local) return 'VestLedger User';
  const words = local.replace(/[._-]+/g, ' ').trim();
  if (!words) return 'VestLedger User';
  return words
    .split(' ')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function mapUser(apiUser: ApiUser, role: UserRole): User {
  return {
    name: apiUser.name || normalizeName(apiUser.email),
    email: apiUser.email,
    role,
  };
}

async function postAuth(path: string, body: Record<string, unknown>): Promise<AuthResponse> {
  const baseUrl = getApiBaseUrl().replace(/\/$/, '');
  const response = await fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const payload = (await response.json().catch(() => ({}))) as Partial<AuthResponse> & {
    message?: string | string[];
  };

  if (!response.ok) {
    const message = Array.isArray(payload.message)
      ? payload.message.join(', ')
      : payload.message || response.statusText;
    throw new ApiError({
      message,
      status: response.status,
      details: payload,
    });
  }

  return payload as AuthResponse;
}

export async function authenticateUser(
  email: string,
  password: string,
  role: UserRole
): Promise<AuthResult> {
  if (isMockMode('auth')) {
    return {
      user: createMockUser(email, role),
      accessToken: null,
    };
  }

  // Login-only flow: users must be pre-created by a superuser
  const response = await postAuth('/auth/login', { email, password });
  return {
    user: mapUser(response.user, role),
    accessToken: response.access_token ?? null,
  };
}

/** @deprecated Use authenticateUser instead */
export async function createUser(
  email: string,
  password: string,
  role: UserRole
): Promise<User> {
  const result = await authenticateUser(email, password, role);
  return result.user;
}
