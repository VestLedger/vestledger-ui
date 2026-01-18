import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { NormalizedError } from '@/store/types/AsyncState';
import type { User, UserRole } from '@/types/auth';
import type { RootState } from '../rootReducer';

/**
 * Auth slice - Standardized async state pattern
 *
 * Uses a consistent status pattern ('idle' | 'loading' | 'succeeded' | 'failed')
 * while maintaining auth-specific state (hydrated, isAuthenticated, user).
 *
 * This aligns with the AsyncState<T> contract used throughout the codebase.
 */

export type AuthStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

export interface LoginParams {
  email: string;
  password: string;
  role: UserRole;
}

export interface LoginSuccessPayload {
  user: User;
  accessToken: string | null;
}

interface AuthState {
  // Hydration state (SSR → client)
  hydrated: boolean;

  // Auth state
  isAuthenticated: boolean;
  user: User | null;
  accessToken: string | null;

  // Async operation state (standardized)
  status: AuthStatus;
  error: NormalizedError | undefined;
}

const initialState: AuthState = {
  hydrated: false,
  isAuthenticated: false,
  user: null,
  accessToken: null,
  status: 'idle',
  error: undefined,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    authHydrated: (
      state,
      action: PayloadAction<{ isAuthenticated: boolean; user: User | null; accessToken: string | null }>
    ) => {
      state.hydrated = true;
      state.isAuthenticated = action.payload.isAuthenticated;
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.status = 'succeeded';
    },

    loginRequested: (state, _action: PayloadAction<LoginParams>) => {
      state.status = 'loading';
      state.error = undefined;
    },

    loginSucceeded: (state, action: PayloadAction<LoginSuccessPayload>) => {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.status = 'succeeded';
      state.error = undefined;
    },

    loginFailed: (state, action: PayloadAction<NormalizedError>) => {
      state.status = 'failed';
      state.error = action.payload;
    },

    logoutRequested: (state) => {
      state.status = 'loading';
      state.error = undefined;
    },

    loggedOut: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.accessToken = null;
      state.status = 'idle';
      state.error = undefined;
    },

    switchRoleRequested: (state, _action: PayloadAction<UserRole>) => {
      state.status = 'loading';
      state.error = undefined;
    },

    userUpdated: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.status = 'succeeded';
      state.error = undefined;
    },

    // Reset error state (for dismissing error messages)
    clearAuthError: (state) => {
      state.error = undefined;
      if (state.status === 'failed') {
        state.status = 'idle';
      }
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
  clearAuthError,
} = authSlice.actions;

// Selectors - standardized naming
export const authSelectors = {
  // State selectors
  selectHydrated: (state: RootState) => state.auth.hydrated,
  selectIsAuthenticated: (state: RootState) => state.auth.isAuthenticated,
  selectUser: (state: RootState) => state.auth.user,
  selectAccessToken: (state: RootState) => state.auth.accessToken,

  // Async state selectors (standardized)
  selectStatus: (state: RootState) => state.auth.status,
  selectError: (state: RootState) => state.auth.error,

  // Derived selectors
  selectIsLoading: (state: RootState) => state.auth.status === 'loading',
  selectIsSucceeded: (state: RootState) => state.auth.status === 'succeeded',
  selectIsFailed: (state: RootState) => state.auth.status === 'failed',

  // Full state selector for useAsyncData compatibility
  selectState: (state: RootState) => state.auth,

  // Legacy selector (deprecated, use selectIsLoading)
  /** @deprecated Use selectIsLoading instead */
  selectLoading: (state: RootState) => state.auth.status === 'loading',
};

export const authReducer = authSlice.reducer;
