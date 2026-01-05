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

    // Sync cookie with localStorage state
    if (typeof document !== 'undefined') {
      const isProduction = window.location.hostname.includes('vestledger.com');
      if (isProduction) {
        document.cookie = 'isAuthenticated=true; path=/; max-age=604800; domain=.vestledger.com; SameSite=Lax';
      } else {
        document.cookie = 'isAuthenticated=true; path=/; max-age=604800; SameSite=Lax';
      }
    }

    yield put(authHydrated({ isAuthenticated: true, user: normalizedUser }));
    return;
  }

  // Clear cookie if not authenticated
  if (typeof document !== 'undefined') {
    const isProduction = window.location.hostname.includes('vestledger.com');
    if (isProduction) {
      document.cookie = 'isAuthenticated=; path=/; max-age=0; domain=.vestledger.com; SameSite=Lax';
    } else {
      document.cookie = 'isAuthenticated=; path=/; max-age=0; SameSite=Lax';
    }
  }

  yield put(authHydrated({ isAuthenticated: false, user: null }));
}

function* loginWorker(action: ReturnType<typeof loginRequested>) {
  try {
    const { email, role } = action.payload;
    const user: User = createUser(email, role);

    yield put(loginSucceeded(user));

    // Persist to localStorage
    safeLocalStorage.setItem(STORAGE_AUTH_KEY, 'true');
    safeLocalStorage.setJSON(STORAGE_USER_KEY, user);

    // Also set cookie for middleware authentication check
    // For localhost subdomain support, we don't set domain attribute
    // This allows the cookie to work with both localhost and app.localhost
    if (typeof document !== 'undefined') {
      const isProduction = window.location.hostname.includes('vestledger.com');
      if (isProduction) {
        // In production, set domain to allow sharing between subdomains
        document.cookie = 'isAuthenticated=true; path=/; max-age=604800; domain=.vestledger.com; SameSite=Lax';
      } else {
        // In development, don't set domain for localhost subdomain support
        document.cookie = 'isAuthenticated=true; path=/; max-age=604800; SameSite=Lax';
      }
    }
  } catch (error: unknown) {
    console.error('Login failed', error);
    yield put(loginFailed(normalizeError(error)));
  }
}

function* logoutWorker() {
  safeLocalStorage.removeItem(STORAGE_AUTH_KEY);
  safeLocalStorage.removeItem(STORAGE_USER_KEY);

  // Also remove cookie
  if (typeof document !== 'undefined') {
    const isProduction = window.location.hostname.includes('vestledger.com');
    if (isProduction) {
      document.cookie = 'isAuthenticated=; path=/; max-age=0; domain=.vestledger.com; SameSite=Lax';
    } else {
      document.cookie = 'isAuthenticated=; path=/; max-age=0; SameSite=Lax';
    }
  }

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
