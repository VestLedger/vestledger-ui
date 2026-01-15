import { describe, it, expect } from 'vitest';
import {
  authReducer,
  authHydrated,
  loginRequested,
  loginSucceeded,
  loginFailed,
  logoutRequested,
  loggedOut,
  switchRoleRequested,
  userUpdated,
  clearAuthError,
  authSelectors,
  type AuthStatus,
  type LoginParams,
} from '../authSlice';
import type { NormalizedError } from '@/store/types/AsyncState';
import type { User, UserRole } from '@/types/auth';
import type { RootState } from '@/store/rootReducer';

describe('authSlice', () => {
  const mockUser: User = {
    id: 'user-1',
    email: 'test@example.com',
    name: 'Test User',
    role: 'fund-manager',
    createdAt: '2024-01-01',
  };

  const initialState = {
    hydrated: false,
    isAuthenticated: false,
    user: null as User | null,
    status: 'idle' as AuthStatus,
    error: undefined as NormalizedError | undefined,
  };

  describe('initial state', () => {
    it('should return the initial state', () => {
      const state = authReducer(undefined, { type: '@@INIT' });
      expect(state.hydrated).toBe(false);
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
      expect(state.status).toBe('idle');
      expect(state.error).toBeUndefined();
    });
  });

  describe('authHydrated', () => {
    it('should set hydrated state with authenticated user', () => {
      const state = authReducer(
        initialState,
        authHydrated({ isAuthenticated: true, user: mockUser })
      );
      expect(state.hydrated).toBe(true);
      expect(state.isAuthenticated).toBe(true);
      expect(state.user).toEqual(mockUser);
      expect(state.status).toBe('succeeded');
    });

    it('should set hydrated state without authenticated user', () => {
      const state = authReducer(
        initialState,
        authHydrated({ isAuthenticated: false, user: null })
      );
      expect(state.hydrated).toBe(true);
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
      expect(state.status).toBe('succeeded');
    });
  });

  describe('loginRequested', () => {
    it('should set status to loading', () => {
      const params: LoginParams = {
        email: 'test@example.com',
        password: 'password123',
        role: 'fund-manager',
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
        role: 'fund-manager',
      };
      const state = authReducer(stateWithError, loginRequested(params));
      expect(state.error).toBeUndefined();
    });
  });

  describe('loginSucceeded', () => {
    it('should set authenticated state with user', () => {
      const loadingState = {
        ...initialState,
        status: 'loading' as AuthStatus,
      };
      const state = authReducer(loadingState, loginSucceeded(mockUser));
      expect(state.isAuthenticated).toBe(true);
      expect(state.user).toEqual(mockUser);
      expect(state.status).toBe('succeeded');
      expect(state.error).toBeUndefined();
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
    it('should clear authenticated state', () => {
      const authenticatedState = {
        ...initialState,
        isAuthenticated: true,
        user: mockUser,
        status: 'loading' as AuthStatus,
      };
      const state = authReducer(authenticatedState, loggedOut());
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
      expect(state.status).toBe('idle');
      expect(state.error).toBeUndefined();
    });
  });

  describe('switchRoleRequested', () => {
    it('should set status to loading', () => {
      const authenticatedState = {
        ...initialState,
        isAuthenticated: true,
        user: mockUser,
        status: 'succeeded' as AuthStatus,
      };
      const newRole: UserRole = 'investor';
      const state = authReducer(authenticatedState, switchRoleRequested(newRole));
      expect(state.status).toBe('loading');
      expect(state.error).toBeUndefined();
    });
  });

  describe('userUpdated', () => {
    it('should update user data', () => {
      const authenticatedState = {
        ...initialState,
        isAuthenticated: true,
        user: mockUser,
        status: 'loading' as AuthStatus,
      };
      const updatedUser: User = {
        ...mockUser,
        name: 'Updated Name',
        role: 'investor',
      };
      const state = authReducer(authenticatedState, userUpdated(updatedUser));
      expect(state.user).toEqual(updatedUser);
      expect(state.status).toBe('succeeded');
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
