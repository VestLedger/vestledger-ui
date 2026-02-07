import { describe, it, expect } from 'vitest';
import {
  authReducer,
  authHydrated,
  loginRequested,
  loginSucceeded,
  loginFailed,
  logoutRequested,
  loggedOut,
  clearAuthError,
  authSelectors,
  type AuthStatus,
  type LoginParams,
} from '../authSlice';
import type { NormalizedError } from '@/store/types/AsyncState';
import type { User } from '@/types/auth';
import type { RootState } from '@/store/rootReducer';

describe('authSlice', () => {
  const mockUser: User = {
    email: 'test@example.com',
    name: 'Test User',
    role: 'gp',
  };

  const mockAccessToken = 'mock-jwt-token';

  const initialState = {
    hydrated: false,
    isAuthenticated: false,
    user: null as User | null,
    accessToken: null as string | null,
    status: 'idle' as AuthStatus,
    error: undefined as NormalizedError | undefined,
  };

  describe('initial state', () => {
    it('should return the initial state', () => {
      const state = authReducer(undefined, { type: '@@INIT' });
      expect(state.hydrated).toBe(false);
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
      expect(state.accessToken).toBeNull();
      expect(state.status).toBe('idle');
      expect(state.error).toBeUndefined();
    });
  });

  describe('authHydrated', () => {
    it('should set hydrated state with authenticated user and token', () => {
      const state = authReducer(
        initialState,
        authHydrated({ isAuthenticated: true, user: mockUser, accessToken: mockAccessToken })
      );
      expect(state.hydrated).toBe(true);
      expect(state.isAuthenticated).toBe(true);
      expect(state.user).toEqual(mockUser);
      expect(state.accessToken).toBe(mockAccessToken);
      expect(state.status).toBe('succeeded');
    });

    it('should set hydrated state without authenticated user', () => {
      const state = authReducer(
        initialState,
        authHydrated({ isAuthenticated: false, user: null, accessToken: null })
      );
      expect(state.hydrated).toBe(true);
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
      expect(state.accessToken).toBeNull();
      expect(state.status).toBe('succeeded');
    });
  });

  describe('loginRequested', () => {
    it('should set status to loading', () => {
      const params: LoginParams = {
        email: 'test@example.com',
        password: 'password123',
      };
      const state = authReducer(initialState, loginRequested(params));
      expect(state.status).toBe('loading');
      expect(state.error).toBeUndefined();
    });

    it('should clear previous error', () => {
      const stateWithError = {
        ...initialState,
        status: 'failed' as AuthStatus,
        error: { message: 'Previous error' },
      };
      const params: LoginParams = {
        email: 'test@example.com',
        password: 'password123',
      };
      const state = authReducer(stateWithError, loginRequested(params));
      expect(state.error).toBeUndefined();
    });

    it('should clear existing auth state', () => {
      const authenticatedState = {
        ...initialState,
        isAuthenticated: true,
        user: mockUser,
        accessToken: mockAccessToken,
      };
      const params: LoginParams = {
        email: 'test@example.com',
        password: 'password123',
      };
      const state = authReducer(authenticatedState, loginRequested(params));
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
      expect(state.accessToken).toBeNull();
    });
  });

  describe('loginSucceeded', () => {
    it('should set authenticated state with user and token', () => {
      const loadingState = {
        ...initialState,
        status: 'loading' as AuthStatus,
      };
      const state = authReducer(
        loadingState,
        loginSucceeded({ user: mockUser, accessToken: mockAccessToken })
      );
      expect(state.isAuthenticated).toBe(true);
      expect(state.user).toEqual(mockUser);
      expect(state.accessToken).toBe(mockAccessToken);
      expect(state.status).toBe('succeeded');
      expect(state.error).toBeUndefined();
    });

    it('should handle null accessToken', () => {
      const loadingState = {
        ...initialState,
        status: 'loading' as AuthStatus,
      };
      const state = authReducer(
        loadingState,
        loginSucceeded({ user: mockUser, accessToken: null })
      );
      expect(state.isAuthenticated).toBe(true);
      expect(state.user).toEqual(mockUser);
      expect(state.accessToken).toBeNull();
    });
  });

  describe('loginFailed', () => {
    it('should set error and status to failed', () => {
      const error: NormalizedError = {
        message: 'Invalid credentials',
        code: 'AUTH_ERROR',
      };
      const loadingState = {
        ...initialState,
        status: 'loading' as AuthStatus,
      };
      const state = authReducer(loadingState, loginFailed(error));
      expect(state.status).toBe('failed');
      expect(state.error).toEqual(error);
      expect(state.isAuthenticated).toBe(false);
    });

    it('should clear auth state on failure', () => {
      const error: NormalizedError = {
        message: 'Invalid credentials',
        code: 'AUTH_ERROR',
      };
      const authenticatedState = {
        ...initialState,
        isAuthenticated: true,
        user: mockUser,
        accessToken: mockAccessToken,
        status: 'loading' as AuthStatus,
      };
      const state = authReducer(authenticatedState, loginFailed(error));
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
      expect(state.accessToken).toBeNull();
    });
  });

  describe('logoutRequested', () => {
    it('should set status to loading', () => {
      const authenticatedState = {
        ...initialState,
        isAuthenticated: true,
        user: mockUser,
        status: 'succeeded' as AuthStatus,
      };
      const state = authReducer(authenticatedState, logoutRequested());
      expect(state.status).toBe('loading');
      expect(state.error).toBeUndefined();
    });
  });

  describe('loggedOut', () => {
    it('should clear authenticated state and token', () => {
      const authenticatedState = {
        ...initialState,
        isAuthenticated: true,
        user: mockUser,
        accessToken: mockAccessToken,
        status: 'loading' as AuthStatus,
      };
      const state = authReducer(authenticatedState, loggedOut());
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
      expect(state.accessToken).toBeNull();
      expect(state.status).toBe('idle');
      expect(state.error).toBeUndefined();
    });
  });

  describe('clearAuthError', () => {
    it('should clear error and reset status to idle if failed', () => {
      const errorState = {
        ...initialState,
        status: 'failed' as AuthStatus,
        error: { message: 'Some error' },
      };
      const state = authReducer(errorState, clearAuthError());
      expect(state.error).toBeUndefined();
      expect(state.status).toBe('idle');
    });

    it('should clear error but preserve status if not failed', () => {
      const loadingState = {
        ...initialState,
        status: 'loading' as AuthStatus,
        error: { message: 'Some error' },
      };
      const state = authReducer(loadingState, clearAuthError());
      expect(state.error).toBeUndefined();
      expect(state.status).toBe('loading');
    });
  });

  describe('selectors', () => {
    const mockRootState = {
      auth: {
        hydrated: true,
        isAuthenticated: true,
        user: mockUser,
        accessToken: mockAccessToken,
        status: 'succeeded' as AuthStatus,
        error: undefined,
      },
    } as RootState;

    it('selectHydrated should return hydrated state', () => {
      expect(authSelectors.selectHydrated(mockRootState)).toBe(true);
    });

    it('selectIsAuthenticated should return authentication state', () => {
      expect(authSelectors.selectIsAuthenticated(mockRootState)).toBe(true);
    });

    it('selectUser should return user', () => {
      expect(authSelectors.selectUser(mockRootState)).toEqual(mockUser);
    });

    it('selectAccessToken should return access token', () => {
      expect(authSelectors.selectAccessToken(mockRootState)).toBe(mockAccessToken);
    });

    it('selectStatus should return status', () => {
      expect(authSelectors.selectStatus(mockRootState)).toBe('succeeded');
    });

    it('selectError should return error', () => {
      expect(authSelectors.selectError(mockRootState)).toBeUndefined();
    });

    it('selectIsLoading should return loading state', () => {
      const loadingState = {
        auth: { ...mockRootState.auth, status: 'loading' as AuthStatus },
      } as RootState;
      expect(authSelectors.selectIsLoading(loadingState)).toBe(true);
      expect(authSelectors.selectIsLoading(mockRootState)).toBe(false);
    });

    it('selectIsSucceeded should return succeeded state', () => {
      expect(authSelectors.selectIsSucceeded(mockRootState)).toBe(true);
    });

    it('selectIsFailed should return failed state', () => {
      const failedState = {
        auth: { ...mockRootState.auth, status: 'failed' as AuthStatus },
      } as RootState;
      expect(authSelectors.selectIsFailed(failedState)).toBe(true);
      expect(authSelectors.selectIsFailed(mockRootState)).toBe(false);
    });
  });
});
