import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { NormalizedError } from '@/store/types/AsyncState';
import type { User, UserRole } from '@/types/auth';
import type { RootState } from '../rootReducer';

/**
 * Auth slice uses a hybrid approach:
 * - UI state: hydrated, isAuthenticated, user
 * - Async operations: login, logout, switchRole
 *
 * Note: This doesn't use full AsyncState<T> because auth state is primarily
 * UI-driven (isAuthenticated, user) rather than data-fetching.
 */

export interface LoginParams {
  email: string;
  password: string;
  role: UserRole;
}

interface AuthState {
  // UI state
  hydrated: boolean;
  isAuthenticated: boolean;
  user: User | null;

  // Async operation state
  loading: boolean;
  error: NormalizedError | null;
}

const initialState: AuthState = {
  hydrated: false,
  isAuthenticated: false,
  user: null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    authHydrated: (state, action: PayloadAction<{ isAuthenticated: boolean; user: User | null }>) => {
      state.hydrated = true;
      state.isAuthenticated = action.payload.isAuthenticated;
      state.user = action.payload.user;
    },
    loginRequested: (state, _action: PayloadAction<LoginParams>) => {
      state.loading = true;
      state.error = null;
    },
    loginSucceeded: (state, action: PayloadAction<User>) => {
      state.isAuthenticated = true;
      state.user = action.payload;
      state.loading = false;
      state.error = null;
    },
    loginFailed: (state, action: PayloadAction<NormalizedError>) => {
      state.loading = false;
      state.error = action.payload;
    },
    logoutRequested: (state) => {
      state.loading = true;
      state.error = null;
    },
    loggedOut: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.loading = false;
      state.error = null;
    },
    switchRoleRequested: (state, _action: PayloadAction<UserRole>) => {
      state.loading = true;
      state.error = null;
    },
    userUpdated: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.loading = false;
      state.error = null;
    },
  },
});

export const {
  authHydrated,
  loginRequested,
  loginSucceeded,
  loginFailed,
  logoutRequested,
  loggedOut,
  switchRoleRequested,
  userUpdated,
} = authSlice.actions;

// Selectors
export const authSelectors = {
  selectHydrated: (state: RootState) => state.auth.hydrated,
  selectIsAuthenticated: (state: RootState) => state.auth.isAuthenticated,
  selectUser: (state: RootState) => state.auth.user,
  selectLoading: (state: RootState) => state.auth.loading,
  selectError: (state: RootState) => state.auth.error,
};

export const authReducer = authSlice.reducer;
