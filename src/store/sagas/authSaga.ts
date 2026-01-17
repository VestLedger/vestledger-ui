import { call, delay, put, race, select, take, takeLatest } from 'redux-saga/effects';
import { createUser } from '@/services/authService';
import type { RootState } from '@/store/rootReducer';
import type { User, UserRole } from '@/types/auth';
import {
  authHydrated,
  loggedOut,
  loginFailed,
  loginRequested,
  loginSucceeded,
  logoutRequested,
  switchRoleRequested,
  userUpdated,
} from '@/store/slices/authSlice';
import { clientMounted } from '@/store/slices/uiEffectsSlice';
import { safeLocalStorage } from '@/lib/storage/safeLocalStorage';
import { normalizeError } from '@/store/utils/normalizeError';

const STORAGE_AUTH_KEY = 'isAuthenticated';
const STORAGE_USER_KEY = 'user';

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

function clearAuthCookies() {
  if (typeof document === 'undefined') return;
  const domain = getAuthCookieDomain(window.location.hostname);
  const domainAttribute = domain ? `; domain=${domain}` : '';
  document.cookie = `isAuthenticated=; path=/${domainAttribute}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  document.cookie = `user=; path=/${domainAttribute}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

function* hydrateAuthWorker() {
  const savedAuth = safeLocalStorage.getItem(STORAGE_AUTH_KEY);
  const savedUser = safeLocalStorage.getJSON<Partial<User>>(STORAGE_USER_KEY);

  if (savedAuth === 'true' && savedUser?.email && savedUser?.name) {
    const normalizedUser: User = {
      name: savedUser.name,
      email: savedUser.email,
      role: savedUser.role ?? 'gp',
      avatar: savedUser.avatar,
    };

    // Sync to cookies for middleware access
    setAuthCookies(normalizedUser);

    yield put(authHydrated({ isAuthenticated: true, user: normalizedUser }));
    return;
  }

  yield put(authHydrated({ isAuthenticated: false, user: null }));
}

export function* loginWorker(action: ReturnType<typeof loginRequested>) {
  try {
    const { email, password, role } = action.payload;
    const user: User = yield call(createUser, email, password, role);

    yield put(loginSucceeded(user));

    // Persist to localStorage
    safeLocalStorage.setItem(STORAGE_AUTH_KEY, 'true');
    safeLocalStorage.setJSON(STORAGE_USER_KEY, user);

    // Sync to cookies for middleware access
    setAuthCookies(user);
  } catch (error: unknown) {
    console.error('Login failed', error);
    yield put(loginFailed(normalizeError(error)));
  }
}

export function* logoutWorker() {
  safeLocalStorage.removeItem(STORAGE_AUTH_KEY);
  safeLocalStorage.removeItem(STORAGE_USER_KEY);

  // Clear cookies
  clearAuthCookies();

  yield put(loggedOut());
}

function* switchRoleWorker(action: ReturnType<typeof switchRoleRequested>) {
  const nextRole: UserRole = action.payload;
  const user: User | null = yield select((state: RootState) => state.auth.user);
  if (!user) return;

  const updatedUser: User = { ...user, role: nextRole };
  yield put(userUpdated(updatedUser));

  safeLocalStorage.setJSON(STORAGE_USER_KEY, updatedUser);
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
  yield takeLatest(switchRoleRequested.type, switchRoleWorker);
}
