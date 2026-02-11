import { call, delay, put, race, take, takeLatest } from 'redux-saga/effects';
import { authenticateUser, isDemoCredentials, type AuthResult } from '@/services/authService';
import type { User } from '@/types/auth';
import {
  authHydrated,
  loggedOut,
  loginFailed,
  loginRequested,
  loginSucceeded,
  logoutRequested,
} from '@/store/slices/authSlice';
import { clientMounted } from '@/store/slices/uiEffectsSlice';
import { safeLocalStorage } from '@/lib/storage/safeLocalStorage';
import { normalizeError } from '@/store/utils/normalizeError';
import { logger } from '@/lib/logger';
import { DATA_MODE_OVERRIDE_KEY, type DataMode } from '@/config/data-mode';
import {
  AUTH_COOKIE_MAX_AGE_SECONDS,
  AUTH_HYDRATION_TIMEOUT_MS,
} from '@/config/auth';

const STORAGE_AUTH_KEY = 'isAuthenticated';
const STORAGE_USER_KEY = 'user';
const STORAGE_TOKEN_KEY = 'accessToken';

function getCookieValue(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const prefix = `${name}=`;
  const entries = document.cookie.split(';');
  for (const entry of entries) {
    const trimmed = entry.trim();
    if (trimmed.startsWith(prefix)) {
      return trimmed.slice(prefix.length);
    }
  }
  return null;
}

function parseCookieUser(): Partial<User> | null {
  const raw = getCookieValue('user');
  if (!raw) return null;
  try {
    return JSON.parse(decodeURIComponent(raw)) as Partial<User>;
  } catch {
    return null;
  }
}

function isValidPersistedUser(user: Partial<User> | null | undefined): user is Partial<User> & Pick<User, 'email' | 'name' | 'role'> {
  return Boolean(user?.email && user?.name && user?.role);
}

function normalizeUser(user: Partial<User> & Pick<User, 'email' | 'name' | 'role'>): User {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    tenantId: user.tenantId,
    organizationRole: user.organizationRole,
    isPlatformAdmin: user.isPlatformAdmin,
  };
}

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

function setDataModeCookie(mode: DataMode) {
  if (typeof document === 'undefined') return;
  const domain = getAuthCookieDomain(window.location.hostname);
  const domainAttribute = domain ? `; domain=${domain}` : '';
  document.cookie = `${DATA_MODE_OVERRIDE_KEY}=${mode}; path=/${domainAttribute}; max-age=${AUTH_COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`;
}

function clearAuthCookies() {
  if (typeof document === 'undefined') return;
  const domain = getAuthCookieDomain(window.location.hostname);
  const domainAttribute = domain ? `; domain=${domain}` : '';
  document.cookie = `isAuthenticated=; path=/${domainAttribute}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  document.cookie = `user=; path=/${domainAttribute}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

function clearDataModeCookie() {
  if (typeof document === 'undefined') return;
  const domain = getAuthCookieDomain(window.location.hostname);
  const domainAttribute = domain ? `; domain=${domain}` : '';
  document.cookie = `${DATA_MODE_OVERRIDE_KEY}=; path=/${domainAttribute}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

function* hydrateAuthWorker() {
  const savedToken = safeLocalStorage.getItem(STORAGE_TOKEN_KEY);
  const savedDataMode = safeLocalStorage.getItem(DATA_MODE_OVERRIDE_KEY);
  const cookieAuth = getCookieValue('isAuthenticated');
  const cookieUser = parseCookieUser();

  const hasValidCookieSession = cookieAuth === 'true' && isValidPersistedUser(cookieUser);
  if (hasValidCookieSession) {
    const normalizedUser = normalizeUser(cookieUser);

    // Keep local storage aligned with the shared cross-subdomain cookie session.
    safeLocalStorage.setItem(STORAGE_AUTH_KEY, 'true');
    safeLocalStorage.setJSON(STORAGE_USER_KEY, normalizedUser);
    if (savedDataMode === 'mock' || savedDataMode === 'api') {
      setDataModeCookie(savedDataMode);
    } else {
      clearDataModeCookie();
    }

    yield put(authHydrated({ isAuthenticated: true, user: normalizedUser, accessToken: savedToken }));
    return;
  }

  // Shared auth cookie is absent/invalid: treat as logged out and clear stale local state.
  safeLocalStorage.removeItem(STORAGE_AUTH_KEY);
  safeLocalStorage.removeItem(STORAGE_USER_KEY);
  safeLocalStorage.removeItem(STORAGE_TOKEN_KEY);
  clearAuthCookies();

  if (savedDataMode === 'mock' || savedDataMode === 'api') {
    setDataModeCookie(savedDataMode);
  } else {
    safeLocalStorage.removeItem(DATA_MODE_OVERRIDE_KEY);
    clearDataModeCookie();
  }

  yield put(authHydrated({ isAuthenticated: false, user: null, accessToken: null }));
}

export function* loginWorker(action: ReturnType<typeof loginRequested>) {
  try {
    const { email, password } = action.payload;
    safeLocalStorage.removeItem(STORAGE_AUTH_KEY);
    safeLocalStorage.removeItem(STORAGE_USER_KEY);
    safeLocalStorage.removeItem(STORAGE_TOKEN_KEY);
    clearAuthCookies();
    const modeOverride: DataMode = isDemoCredentials(email, password) ? 'mock' : 'api';
    safeLocalStorage.setItem(DATA_MODE_OVERRIDE_KEY, modeOverride);
    setDataModeCookie(modeOverride);
    const result: AuthResult = yield call(authenticateUser, email, password);

    // Persist to localStorage
    safeLocalStorage.setItem(STORAGE_AUTH_KEY, 'true');
    safeLocalStorage.setJSON(STORAGE_USER_KEY, result.user);
    safeLocalStorage.setItem(STORAGE_TOKEN_KEY, result.accessToken);
    if (result.dataModeOverride) {
      safeLocalStorage.setItem(DATA_MODE_OVERRIDE_KEY, result.dataModeOverride);
      setDataModeCookie(result.dataModeOverride);
    } else {
      safeLocalStorage.removeItem(DATA_MODE_OVERRIDE_KEY);
      clearDataModeCookie();
    }

    // Sync to cookies for middleware access
    setAuthCookies(result.user);

    // Mark auth state as successful only after storage and cookies are synced
    // so middleware sees the authenticated session on immediate redirects.
    yield put(loginSucceeded({ user: result.user, accessToken: result.accessToken }));
  } catch (error: unknown) {
    logger.error('Login failed', error);
    yield put(loginFailed(normalizeError(error)));
  }
}

export function* logoutWorker() {
  safeLocalStorage.removeItem(STORAGE_AUTH_KEY);
  safeLocalStorage.removeItem(STORAGE_USER_KEY);
  safeLocalStorage.removeItem(STORAGE_TOKEN_KEY);
  safeLocalStorage.removeItem(DATA_MODE_OVERRIDE_KEY);

  // Clear cookies
  clearAuthCookies();
  clearDataModeCookie();

  yield put(loggedOut());
}

export function* authSaga() {
  if (typeof window !== 'undefined') {
    // Wait for clientMounted with a configurable timeout fallback
    yield race({
      mounted: take(clientMounted.type),
      timeout: delay(AUTH_HYDRATION_TIMEOUT_MS),
    });
  }
  yield call(hydrateAuthWorker);
  yield takeLatest(loginRequested.type, loginWorker);
  yield takeLatest(logoutRequested.type, logoutWorker);
}
