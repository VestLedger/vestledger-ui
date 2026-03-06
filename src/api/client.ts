import createClient, { type Middleware } from 'openapi-fetch';
import type { paths } from './generated/openapi';
import { getApiBaseUrl } from './config';
import { safeLocalStorage } from '@/lib/storage/safeLocalStorage';
import { DATA_MODE_OVERRIDE_KEY } from '@/config/data-mode';

const STORAGE_TOKEN_KEY = 'accessToken';
const STORAGE_AUTH_KEY = 'isAuthenticated';
const STORAGE_USER_KEY = 'user';

function getAuthCookieDomain(hostname?: string | null): string | null {
  if (!hostname) return null;
  if (hostname === 'localhost' || hostname.endsWith('.localhost')) return null;
  if (/^\d{1,3}(?:\.\d{1,3}){3}$/.test(hostname)) return null;
  const baseHost = hostname.replace(/^www\./, '').replace(/^(app|admin)\./, '');
  if (baseHost === 'localhost') return null;
  return `.${baseHost}`;
}

function clearCookie(name: string, domain?: string | null) {
  if (typeof document === 'undefined') return;
  const domainAttribute = domain ? `; domain=${domain}` : '';
  document.cookie = `${name}=; path=/${domainAttribute}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

function clearAuthCookies() {
  if (typeof window === 'undefined') return;
  const domain = getAuthCookieDomain(window.location.hostname);
  clearCookie(STORAGE_AUTH_KEY);
  clearCookie(STORAGE_USER_KEY);
  clearCookie(DATA_MODE_OVERRIDE_KEY);
  if (domain) {
    clearCookie(STORAGE_AUTH_KEY, domain);
    clearCookie(STORAGE_USER_KEY, domain);
    clearCookie(DATA_MODE_OVERRIDE_KEY, domain);
  }
}

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
      safeLocalStorage.removeItem(STORAGE_AUTH_KEY);
      safeLocalStorage.removeItem(STORAGE_USER_KEY);
      safeLocalStorage.removeItem(DATA_MODE_OVERRIDE_KEY);
      clearAuthCookies();

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
