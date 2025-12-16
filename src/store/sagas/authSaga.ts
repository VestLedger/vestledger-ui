import { call, put, select, take, takeLatest } from 'redux-saga/effects';
import { createUser } from '@/services/authService';
import type { RootState } from '@/store/rootReducer';
import type { User, UserRole } from '@/types/auth';
import {
  authHydrated,
  loggedOut,
  loginRequested,
  loginSucceeded,
  logoutRequested,
  switchRoleRequested,
  userUpdated,
} from '@/store/slices/authSlice';
import { clientMounted } from '@/store/slices/uiEffectsSlice';

const STORAGE_AUTH_KEY = 'isAuthenticated';
const STORAGE_USER_KEY = 'user';

function* hydrateAuthWorker() {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    yield put(authHydrated({ isAuthenticated: false, user: null }));
    return;
  }

  try {
    const savedAuth = localStorage.getItem(STORAGE_AUTH_KEY);
    const savedUser = localStorage.getItem(STORAGE_USER_KEY);

    if (savedAuth === 'true' && savedUser) {
      const parsedUser = JSON.parse(savedUser) as User;
      if (!('role' in parsedUser) || !parsedUser.role) {
        (parsedUser as any).role = 'gp';
      }
      yield put(authHydrated({ isAuthenticated: true, user: parsedUser }));
      return;
    }

    yield put(authHydrated({ isAuthenticated: false, user: null }));
  } catch (error) {
    console.error('Failed to hydrate auth from localStorage', error);
    yield put(authHydrated({ isAuthenticated: false, user: null }));
  }
}

function* loginWorker(action: ReturnType<typeof loginRequested>) {
  const { email, role } = action.payload;
  const user: User = createUser(email, role);

  yield put(loginSucceeded(user));

  try {
    localStorage.setItem(STORAGE_AUTH_KEY, 'true');
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user));
  } catch (error) {
    console.error('Failed to persist auth to localStorage', error);
  }
}

function* logoutWorker() {
  try {
    localStorage.removeItem(STORAGE_AUTH_KEY);
    localStorage.removeItem(STORAGE_USER_KEY);
  } catch (error) {
    console.error('Failed to clear auth from localStorage', error);
  }

  yield put(loggedOut());
}

function* switchRoleWorker(action: ReturnType<typeof switchRoleRequested>) {
  const nextRole: UserRole = action.payload;
  const user: User | null = yield select((state: RootState) => state.auth.user);
  if (!user) return;

  const updatedUser: User = { ...user, role: nextRole };
  yield put(userUpdated(updatedUser));

  try {
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(updatedUser));
  } catch (error) {
    console.error('Failed to persist updated user to localStorage', error);
  }
}

export function* authSaga() {
  if (typeof window !== 'undefined') {
    yield take(clientMounted.type);
  }
  yield call(hydrateAuthWorker);
  yield takeLatest(loginRequested.type, loginWorker);
  yield takeLatest(logoutRequested.type, logoutWorker);
  yield takeLatest(switchRoleRequested.type, switchRoleWorker);
}
