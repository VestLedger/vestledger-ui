import createClient, { type Middleware } from "openapi-fetch";
import type { paths } from "./generated/openapi";
import { getApiBaseUrl } from "./config";
import { safeLocalStorage } from "@/lib/storage/safeLocalStorage";
import { DATA_MODE_OVERRIDE_KEY } from "@/config/data-mode";
import { getAuthCookieDomain } from "@/utils/auth/cookie-domain";

const STORAGE_TOKEN_KEY = "accessToken";
const STORAGE_AUTH_KEY = "isAuthenticated";
const STORAGE_USER_KEY = "user";

function getCookieValue(name: string): string | null {
  if (typeof document === "undefined") return null;
  const prefix = `${name}=`;
  const entries = document.cookie.split(";");
  for (const entry of entries) {
    const trimmed = entry.trim();
    if (trimmed.startsWith(prefix)) {
      return trimmed.slice(prefix.length);
    }
  }
  return null;
}

function clearCookie(name: string, domain?: string | null) {
  if (typeof document === "undefined") return;
  const domainAttribute = domain ? `; domain=${domain}` : "";
  document.cookie = `${name}=; path=/${domainAttribute}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

function clearAuthCookies() {
  if (typeof window === "undefined") return;
  const domain = getAuthCookieDomain(window.location.hostname);
  clearCookie(STORAGE_AUTH_KEY);
  clearCookie(STORAGE_USER_KEY);
  clearCookie(STORAGE_TOKEN_KEY);
  clearCookie(DATA_MODE_OVERRIDE_KEY);
  if (domain) {
    clearCookie(STORAGE_AUTH_KEY, domain);
    clearCookie(STORAGE_USER_KEY, domain);
    clearCookie(STORAGE_TOKEN_KEY, domain);
    clearCookie(DATA_MODE_OVERRIDE_KEY, domain);
  }
}

/**
 * Middleware that automatically attaches the JWT token to requests
 */
const authMiddleware: Middleware = {
  async onRequest({ request }) {
    const token = getAccessToken();
    if (token) {
      request.headers.set("Authorization", `Bearer ${token}`);
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
      if (typeof window !== "undefined") {
        const currentPath = window.location.pathname;
        if (currentPath !== "/login") {
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
  const storedToken = safeLocalStorage.getItem(STORAGE_TOKEN_KEY);
  if (storedToken) {
    return storedToken;
  }

  const cookieToken = getCookieValue(STORAGE_TOKEN_KEY);
  if (!cookieToken) {
    return null;
  }

  const decodedToken = decodeURIComponent(cookieToken);
  safeLocalStorage.setItem(STORAGE_TOKEN_KEY, decodedToken);
  return decodedToken;
}

/**
 * Build auth headers for manual fetch calls
 * @deprecated Prefer using apiClient which handles auth automatically
 */
export function authHeaders(
  token: string | null | undefined,
): HeadersInit | undefined {
  if (!token) return undefined;
  return { Authorization: `Bearer ${token}` };
}
