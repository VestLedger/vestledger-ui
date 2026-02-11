import { getApiBaseUrl } from '@/api/config';
import { ApiError } from '@/api/errors';
import type { DataMode } from '@/config/data-mode';
import { createMockUser } from '@/data/mocks/auth';
import type { User, UserRole } from '@/types/auth';
import {
  INTERNAL_TENANT_ID,
  MOCK_DEMO_PROFILE,
  MOCK_SUPERADMIN_PROFILE,
} from '@/config/auth';

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
  tenantId?: string;
  organizationRole?: 'org_admin' | 'member';
  isPlatformAdmin?: boolean;
};

const DEMO_EMAIL = process.env.NEXT_PUBLIC_DEMO_EMAIL?.trim().toLowerCase();
const DEMO_PASSWORD = process.env.NEXT_PUBLIC_DEMO_PASSWORD;
const SUPERADMIN_EMAIL = process.env.NEXT_PUBLIC_SUPERADMIN_EMAIL?.trim().toLowerCase();
const SUPERADMIN_PASSWORD = process.env.NEXT_PUBLIC_SUPERADMIN_PASSWORD;

export function isDemoCredentials(email: string, password: string): boolean {
  if (!DEMO_EMAIL || !DEMO_PASSWORD) {
    return false;
  }
  return email.trim().toLowerCase() === DEMO_EMAIL && password === DEMO_PASSWORD;
}

export function isSuperadminCredentials(email: string, password: string): boolean {
  if (!SUPERADMIN_EMAIL || !SUPERADMIN_PASSWORD) {
    return false;
  }
  return email.trim().toLowerCase() === SUPERADMIN_EMAIL && password === SUPERADMIN_PASSWORD;
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
    id: payload.sub,
    name: payload.username,
    email: payload.email,
    role: payload.role,
    tenantId: payload.tenantId,
    organizationRole: payload.organizationRole,
    isPlatformAdmin: payload.isPlatformAdmin,
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
  if (isSuperadminCredentials(email, password)) {
    return {
      user: createMockUser(SUPERADMIN_EMAIL!, 'superadmin', {
        id: MOCK_SUPERADMIN_PROFILE.id,
        name: MOCK_SUPERADMIN_PROFILE.displayName,
        tenantId: INTERNAL_TENANT_ID,
        organizationRole: 'org_admin',
        isPlatformAdmin: true,
      }),
      accessToken: MOCK_SUPERADMIN_PROFILE.accessToken,
      dataModeOverride: 'mock',
    };
  }

  if (isDemoCredentials(email, password)) {
    return {
      user: createMockUser(DEMO_EMAIL!, 'gp', {
        id: MOCK_DEMO_PROFILE.id,
        tenantId: MOCK_DEMO_PROFILE.tenantId,
        organizationRole: 'org_admin',
        isPlatformAdmin: false,
      }),
      accessToken: MOCK_DEMO_PROFILE.accessToken,
      dataModeOverride: 'mock',
    };
  }

  // Login-only flow: users must be pre-created by a superuser
  // Role comes from JWT, not from client
  const response = await postAuth('/auth/login', { email, password });
  return {
    user: userFromJwt(response.access_token),
    accessToken: response.access_token,
    dataModeOverride: 'api',
  };
}
