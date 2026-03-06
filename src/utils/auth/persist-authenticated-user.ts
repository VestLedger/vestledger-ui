import { safeLocalStorage } from '@/lib/storage/safeLocalStorage';
import type { User } from '@/types/auth';

const STORAGE_AUTH_KEY = 'isAuthenticated';
const STORAGE_USER_KEY = 'user';
const AUTH_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

function getAuthCookieDomain(hostname?: string | null) {
  if (!hostname) return null;
  if (hostname === 'localhost' || hostname.endsWith('.localhost')) return null;
  if (/^\d{1,3}(?:\.\d{1,3}){3}$/.test(hostname)) return null;
  const baseHost = hostname.replace(/^www\./, '').replace(/^(app|admin)\./, '');
  if (baseHost === 'localhost') return null;
  return `.${baseHost}`;
}

function setAuthCookies(user: User) {
  if (typeof document === 'undefined') return;
  const domain = getAuthCookieDomain(window.location.hostname);
  const domainAttribute = domain ? `; domain=${domain}` : '';
  document.cookie = `isAuthenticated=true; path=/${domainAttribute}; max-age=${AUTH_COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`;
  document.cookie = `user=${encodeURIComponent(JSON.stringify(user))}; path=/${domainAttribute}; max-age=${AUTH_COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`;
}

export function persistAuthenticatedUser(user: User) {
  safeLocalStorage.setItem(STORAGE_AUTH_KEY, 'true');
  safeLocalStorage.setJSON(STORAGE_USER_KEY, user);
  setAuthCookies(user);
}
