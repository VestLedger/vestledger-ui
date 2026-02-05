import { getApiBaseUrl } from '@/api/config';
import { ApiError } from '@/api/errors';
import { type DataMode, isMockMode } from '@/config/data-mode';
import { createMockUser } from '@/data/mocks/auth';
import type { User, UserRole } from '@/types/auth';

type AuthResponse = {
  access_token: string;
};

export type AuthResult = {
  user: User;
  accessToken: string;
  dataModeOverride?: DataMode;
};

type JwtPayload = {
  sub: string;
  email: string;
  username: string;
  role: UserRole;
};

const DEMO_EMAIL = 'demo@vestledger.com';
const DEMO_PASSWORD = 'Pa$$w0rd';

function isDemoCredentials(email: string, password: string): boolean {
  return email.trim().toLowerCase() === DEMO_EMAIL && password === DEMO_PASSWORD;
}

function decodeJwt(token: string): JwtPayload {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid JWT format');
  }
  const payload = parts[1];
  const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
  return JSON.parse(decoded) as JwtPayload;
}

function userFromJwt(token: string): User {
  const payload = decodeJwt(token);
  return {
    name: payload.username,
    email: payload.email,
    role: payload.role,
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

  if (!payload.access_token) {
    throw new ApiError({
      message: 'No access token in response',
      status: 500,
      details: payload,
    });
  }

  return payload as AuthResponse;
}

export async function authenticateUser(
  email: string,
  password: string
): Promise<AuthResult> {
  if (isDemoCredentials(email, password)) {
    return {
      user: createMockUser(DEMO_EMAIL, 'gp'),
      accessToken: 'mock-token',
      dataModeOverride: 'mock',
    };
  }

  if (isMockMode('auth')) {
    // Mock mode: create user with default 'gp' role
    return {
      user: createMockUser(email, 'gp'),
      accessToken: 'mock-token',
    };
  }

  // Login-only flow: users must be pre-created by a superuser
  // Role comes from JWT, not from client
  const response = await postAuth('/auth/login', { email, password });
  return {
    user: userFromJwt(response.access_token),
    accessToken: response.access_token,
  };
}
