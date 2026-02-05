import { call, delay, put, race, take, takeLatest } from 'redux-saga/effects';
import { authenticateUser, type AuthResult } from '@/services/authService';
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

const STORAGE_AUTH_KEY = 'isAuthenticated';
const STORAGE_USER_KEY = 'user';
const STORAGE_TOKEN_KEY = 'accessToken';

function getAuthCookieDomain(hostname?: string | null) {
  if (!hostname) return null;
  if (hostname === 'localhost' || hostname.endsWith('.localhost')) return null;
  if (/^\d{1,3}(?:\.\d{1,3}){3}$/.test(hostname)) return null;
  const baseHost = hostname.startsWith('app.') ? hostname.slice(4) : hostname;
  if (baseHost === 'localhost') return null;
  return `.${baseHost}`;
}

function setAuthCookies(user: User) {
  if (typeof document === 'undefined') return;
  const domain = getAuthCookieDomain(window.location.hostname);
  const domainAttribute = domain ? `; domain=${domain}` : '';
  document.cookie = `isAuthenticated=true; path=/${domainAttribute}; max-age=86400; SameSite=Lax`;
  document.cookie = `user=${encodeURIComponent(JSON.stringify(user))}; path=/${domainAttribute}; max-age=86400; SameSite=Lax`;
}

function setDataModeCookie(mode: DataMode) {
  if (typeof document === 'undefined') return;
  const domain = getAuthCookieDomain(window.location.hostname);
  const domainAttribute = domain ? `; domain=${domain}` : '';
  document.cookie = `${DATA_MODE_OVERRIDE_KEY}=${mode}; path=/${domainAttribute}; max-age=86400; SameSite=Lax`;
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
  const savedAuth = safeLocalStorage.getItem(STORAGE_AUTH_KEY);
  const savedUser = safeLocalStorage.getJSON<Partial<User>>(STORAGE_USER_KEY);
  const savedToken = safeLocalStorage.getItem(STORAGE_TOKEN_KEY);
  const savedDataMode = safeLocalStorage.getItem(DATA_MODE_OVERRIDE_KEY);

  // Require all fields including role - no defaults
  if (savedAuth === 'true' && savedUser?.email && savedUser?.name && savedUser?.role) {
    const normalizedUser: User = {
      name: savedUser.name,
      email: savedUser.email,
      role: savedUser.role,
      avatar: savedUser.avatar,
    };

    // Sync to cookies for middleware access
    setAuthCookies(normalizedUser);
    if (savedDataMode === 'mock' || savedDataMode === 'api') {
      setDataModeCookie(savedDataMode);
    } else {
      clearDataModeCookie();
    }

    yield put(authHydrated({ isAuthenticated: true, user: normalizedUser, accessToken: savedToken }));
    return;
  }

  // Invalid or missing session - clear any stale data and redirect to login
  safeLocalStorage.removeItem(STORAGE_AUTH_KEY);
  safeLocalStorage.removeItem(STORAGE_USER_KEY);
  safeLocalStorage.removeItem(STORAGE_TOKEN_KEY);
  safeLocalStorage.removeItem(DATA_MODE_OVERRIDE_KEY);
  clearAuthCookies();
  clearDataModeCookie();

  yield put(authHydrated({ isAuthenticated: false, user: null, accessToken: null }));
}

export function* loginWorker(action: ReturnType<typeof loginRequested>) {
  try {
    const { email, password } = action.payload;
    const result: AuthResult = yield call(authenticateUser, email, password);

    yield put(loginSucceeded({ user: result.user, accessToken: result.accessToken }));

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
    // Wait for clientMounted with a 5 second timeout fallback
    yield race({
      mounted: take(clientMounted.type),
      timeout: delay(5000),
    });
  }
  yield call(hydrateAuthWorker);
  yield takeLatest(loginRequested.type, loginWorker);
  yield takeLatest(logoutRequested.type, logoutWorker);
}
