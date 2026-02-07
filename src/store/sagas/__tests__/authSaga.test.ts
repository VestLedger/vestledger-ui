import { describe, it, expect, vi, beforeEach } from 'vitest';
import { runSaga } from 'redux-saga';
import { loginWorker, logoutWorker } from '../authSaga';
import { loginRequested, loginSucceeded, loginFailed, loggedOut } from '@/store/slices/authSlice';
import * as authService from '@/services/authService';
import type { User } from '@/types/auth';
import type { AuthResult } from '@/services/authService';
import { safeLocalStorage } from '@/lib/storage/safeLocalStorage';
import { DATA_MODE_OVERRIDE_KEY } from '@/config/data-mode';

// Mock the authService
vi.mock('@/services/authService', () => ({
  authenticateUser: vi.fn(),
  isDemoCredentials: (email: string, password: string) =>
    email.trim().toLowerCase() === 'demo@vestledger.com' && password === 'Pa$$w0rd',
}));

// Mock safeLocalStorage
vi.mock('@/lib/storage/safeLocalStorage', () => ({
  safeLocalStorage: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    setJSON: vi.fn(),
    removeItem: vi.fn(),
    getJSON: vi.fn(),
  },
}));

describe('authSaga', () => {
  const mockUser: User = {
    name: 'Test User',
    email: 'test@example.com',
    role: 'gp',
  };

  const mockAuthResult: AuthResult = {
    user: mockUser,
    accessToken: 'mock-jwt-token',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('loginWorker', () => {
    it('should dispatch loginSucceeded with user and token on successful login', async () => {
      vi.mocked(authService.authenticateUser).mockResolvedValue(mockAuthResult);

      const dispatched: unknown[] = [];
      const action = loginRequested({
        email: 'test@example.com',
        password: 'password123',
        role: 'gp',
      });

      await runSaga(
        {
          dispatch: (action: unknown) => dispatched.push(action),
          getState: () => ({}),
        },
        loginWorker,
        action
      ).toPromise();

      expect(dispatched).toContainEqual(
        loginSucceeded({ user: mockUser, accessToken: 'mock-jwt-token' })
      );
    });

    it('should persist data mode override when provided', async () => {
      const resultWithOverride: AuthResult = {
        user: mockUser,
        accessToken: 'mock-jwt-token',
        dataModeOverride: 'mock',
      };
      vi.mocked(authService.authenticateUser).mockResolvedValue(resultWithOverride);

      const dispatched: unknown[] = [];
      const action = loginRequested({
        email: 'demo@vestledger.com',
        password: 'Pa$$w0rd',
        role: 'gp',
      });

      await runSaga(
        {
          dispatch: (action: unknown) => dispatched.push(action),
          getState: () => ({}),
        },
        loginWorker,
        action
      ).toPromise();

      expect(vi.mocked(safeLocalStorage.setItem)).toHaveBeenCalledWith(
        DATA_MODE_OVERRIDE_KEY,
        'mock'
      );
    });

    it('should dispatch loginFailed on error', async () => {
      vi.mocked(authService.authenticateUser).mockRejectedValue(new Error('Login error'));

      const dispatched: unknown[] = [];
      const action = loginRequested({
        email: 'test@example.com',
        password: 'password123',
        role: 'gp',
      });

      await runSaga(
        {
          dispatch: (action: unknown) => dispatched.push(action),
          getState: () => ({}),
        },
        loginWorker,
        action
      ).toPromise();

      expect(dispatched).toHaveLength(1);
      expect(dispatched[0]).toHaveProperty('type', loginFailed.type);
      expect(vi.mocked(safeLocalStorage.setItem)).toHaveBeenCalledWith(
        DATA_MODE_OVERRIDE_KEY,
        'api'
      );
    });

    it('should handle null accessToken', async () => {
      const resultWithoutToken: AuthResult = {
        user: mockUser,
        accessToken: null,
      };
      vi.mocked(authService.authenticateUser).mockResolvedValue(resultWithoutToken);

      const dispatched: unknown[] = [];
      const action = loginRequested({
        email: 'test@example.com',
        password: 'password123',
        role: 'gp',
      });

      await runSaga(
        {
          dispatch: (action: unknown) => dispatched.push(action),
          getState: () => ({}),
        },
        loginWorker,
        action
      ).toPromise();

      expect(dispatched).toContainEqual(
        loginSucceeded({ user: mockUser, accessToken: null })
      );
    });
  });

  describe('logoutWorker', () => {
    it('should dispatch loggedOut', async () => {
      const dispatched: unknown[] = [];

      await runSaga(
        {
          dispatch: (action: unknown) => dispatched.push(action),
          getState: () => ({}),
        },
        logoutWorker
      ).toPromise();

      expect(dispatched).toContainEqual(loggedOut());
      expect(vi.mocked(safeLocalStorage.removeItem)).toHaveBeenCalledWith(DATA_MODE_OVERRIDE_KEY);
    });
  });
});
