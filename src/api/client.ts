import createClient, { type Middleware } from 'openapi-fetch';
import type { paths } from './generated/openapi';
import { getApiBaseUrl } from './config';
import { safeLocalStorage } from '@/lib/storage/safeLocalStorage';

const STORAGE_TOKEN_KEY = 'accessToken';

/**
 * Middleware that automatically attaches the JWT token to requests
 */
const authMiddleware: Middleware = {
  async onRequest({ request }) {
    const token = safeLocalStorage.getItem(STORAGE_TOKEN_KEY);
    if (token) {
      request.headers.set('Authorization', `Bearer ${token}`);
    }
    return request;
  },
  async onResponse({ response }) {
    // Handle 401 Unauthorized - token expired or invalid
    if (response.status === 401) {
      // Clear the invalid token
      safeLocalStorage.removeItem(STORAGE_TOKEN_KEY);
      safeLocalStorage.removeItem('isAuthenticated');
      safeLocalStorage.removeItem('user');

      // Redirect to login if in browser
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname;
        if (currentPath !== '/login') {
          window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
        }
      }
    }
    return response;
  },
};

export const apiClient = createClient<paths>({
  baseUrl: getApiBaseUrl(),
});

// Apply auth middleware
apiClient.use(authMiddleware);

/**
 * Get the current access token from storage
 */
export function getAccessToken(): string | null {
  return safeLocalStorage.getItem(STORAGE_TOKEN_KEY);
}

/**
 * Build auth headers for manual fetch calls
 * @deprecated Prefer using apiClient which handles auth automatically
 */
export function authHeaders(token: string | null | undefined): HeadersInit | undefined {
  if (!token) return undefined;
  return { Authorization: `Bearer ${token}` };
}
