import { describe, it, expect, vi, beforeEach } from 'vitest';
import { runSaga } from 'redux-saga';
import { loginWorker, logoutWorker } from '../authSaga';
import { loginRequested, loginSucceeded, loginFailed, loggedOut } from '@/store/slices/authSlice';
import * as authService from '@/services/authService';
import type { User } from '@/types/auth';

// Mock the authService
vi.mock('@/services/authService', () => ({
  createUser: vi.fn(),
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

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('loginWorker', () => {
    it('should dispatch loginSucceeded on successful login', async () => {
      vi.mocked(authService.createUser).mockResolvedValue(mockUser);

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

      expect(dispatched).toContainEqual(loginSucceeded(mockUser));
    });

    it('should dispatch loginFailed on error', async () => {
      vi.mocked(authService.createUser).mockRejectedValue(new Error('Login error'));

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
    });
  });
});
