import { getApiBaseUrl } from '@/api/config';
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

type ApiError = Error & { status?: number };

function normalizeUsername(email: string): string {
  const local = email.split('@')[0] ?? '';
  const sanitized = local.replace(/[^a-zA-Z0-9._-]/g, '');
  return sanitized || `user_${Date.now()}`;
}

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
    const error = new Error(message) as ApiError;
    error.status = response.status;
    throw error;
  }

  return payload as AuthResponse;
}

export async function createUser(
  email: string,
  password: string,
  role: UserRole
): Promise<User> {
  if (isMockMode('auth')) return createMockUser(email, role);

  const username = normalizeUsername(email);
  const name = normalizeName(email);

  try {
    const response = await postAuth('/auth/signup', {
      email,
      username,
      name,
      password,
    });
    return mapUser(response.user, role);
  } catch (error: unknown) {
    const apiError = error as ApiError;
    if (apiError.status === 409) {
      const response = await postAuth('/auth/login', { email, password });
      return mapUser(response.user, role);
    }
    throw error;
  }
}
