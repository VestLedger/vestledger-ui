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
  const savedUser = safeLocalStorage.getJSON<User>(STORAGE_USER_KEY);

  if (savedAuth === 'true' && savedUser) {
    // Ensure role exists for backwards compatibility
    if (!('role' in savedUser) || !savedUser.role) {
      (savedUser as any).role = 'gp';
    }
    yield put(authHydrated({ isAuthenticated: true, user: savedUser }));
    return;
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
  } catch (error: unknown) {
    console.error('Login failed', error);
    yield put(loginFailed(normalizeError(error)));
  }
}

function* logoutWorker() {
  safeLocalStorage.removeItem(STORAGE_AUTH_KEY);
  safeLocalStorage.removeItem(STORAGE_USER_KEY);
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
