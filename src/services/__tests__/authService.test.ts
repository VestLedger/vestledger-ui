import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { User, UserRole } from '@/types/auth';

// Mock dependencies before importing the service
vi.mock('@/api/config', () => ({
  getApiBaseUrl: vi.fn(() => 'http://localhost:3001'),
}));

vi.mock('@/config/data-mode', () => ({
  isMockMode: vi.fn(() => false),
}));

vi.mock('@/data/mocks/auth', () => ({
  createMockUser: vi.fn((email: string, role: UserRole): User => ({
    name: 'Mock User',
    email,
    role,
  })),
}));

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  describe('authenticateUser', () => {
    it('should return user and null accessToken in mock mode', async () => {
      const { isMockMode } = await import('@/config/data-mode');
      vi.mocked(isMockMode).mockReturnValue(true);

      const { authenticateUser } = await import('@/services/authService');
      const result = await authenticateUser('test@example.com', 'password123', 'gp');

      expect(result.user.email).toBe('test@example.com');
      expect(result.user.role).toBe('gp');
      expect(result.accessToken).toBeNull();
    });

    it('should call login endpoint and return user with accessToken', async () => {
      const { isMockMode } = await import('@/config/data-mode');
      vi.mocked(isMockMode).mockReturnValue(false);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            user: { email: 'test@example.com', name: 'Test User' },
            access_token: 'jwt-token-123',
          }),
      });

      const { authenticateUser } = await import('@/services/authService');
      const result = await authenticateUser('test@example.com', 'password123', 'analyst');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/auth/login',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
        })
      );

      expect(result.user.email).toBe('test@example.com');
      expect(result.user.role).toBe('analyst');
      expect(result.accessToken).toBe('jwt-token-123');
    });

    it('should return null accessToken when API does not return one', async () => {
      const { isMockMode } = await import('@/config/data-mode');
      vi.mocked(isMockMode).mockReturnValue(false);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            user: { email: 'test@example.com', name: 'Test' },
            // No access_token in response
          }),
      });

      const { authenticateUser } = await import('@/services/authService');
      const result = await authenticateUser('test@example.com', 'password123', 'gp');

      expect(result.user.email).toBe('test@example.com');
      expect(result.accessToken).toBeNull();
    });

    it('should throw error with message on 401 Unauthorized', async () => {
      const { isMockMode } = await import('@/config/data-mode');
      vi.mocked(isMockMode).mockReturnValue(false);

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: () => Promise.resolve({ message: 'Invalid credentials' }),
      });

      const { authenticateUser } = await import('@/services/authService');

      await expect(authenticateUser('test@example.com', 'wrongpassword', 'gp')).rejects.toThrow(
        'Invalid credentials'
      );
    });

    it('should throw error on 404 when user does not exist', async () => {
      const { isMockMode } = await import('@/config/data-mode');
      vi.mocked(isMockMode).mockReturnValue(false);

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: () => Promise.resolve({ message: 'User not found' }),
      });

      const { authenticateUser } = await import('@/services/authService');

      await expect(authenticateUser('unknown@example.com', 'password123', 'gp')).rejects.toThrow(
        'User not found'
      );
    });

    it('should handle array error messages', async () => {
      const { isMockMode } = await import('@/config/data-mode');
      vi.mocked(isMockMode).mockReturnValue(false);

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: () =>
          Promise.resolve({
            message: ['Email is required', 'Password must be at least 8 characters'],
          }),
      });

      const { authenticateUser } = await import('@/services/authService');

      await expect(authenticateUser('', 'short', 'gp')).rejects.toThrow(
        'Email is required, Password must be at least 8 characters'
      );
    });

    it('should use statusText when no message in response', async () => {
      const { isMockMode } = await import('@/config/data-mode');
      vi.mocked(isMockMode).mockReturnValue(false);

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 503,
        statusText: 'Service Unavailable',
        json: () => Promise.resolve({}),
      });

      const { authenticateUser } = await import('@/services/authService');

      await expect(authenticateUser('test@example.com', 'password123', 'gp')).rejects.toThrow(
        'Service Unavailable'
      );
    });

    it('should normalize name from email when API does not return name', async () => {
      const { isMockMode } = await import('@/config/data-mode');
      vi.mocked(isMockMode).mockReturnValue(false);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            user: {
              email: 'jane_smith@example.com',
              name: '', // Empty name from API
            },
          }),
      });

      const { authenticateUser } = await import('@/services/authService');
      const result = await authenticateUser('jane_smith@example.com', 'password123', 'lp');

      // Should normalize "jane_smith" to "Jane Smith"
      expect(result.user.name).toBe('Jane Smith');
    });

    it('should handle JSON parse errors gracefully', async () => {
      const { isMockMode } = await import('@/config/data-mode');
      vi.mocked(isMockMode).mockReturnValue(false);

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: () => Promise.reject(new Error('Invalid JSON')),
      });

      const { authenticateUser } = await import('@/services/authService');

      await expect(authenticateUser('test@example.com', 'password123', 'gp')).rejects.toThrow(
        'Internal Server Error'
      );
    });

    it('should strip trailing slash from base URL', async () => {
      const { getApiBaseUrl } = await import('@/api/config');
      vi.mocked(getApiBaseUrl).mockReturnValue('http://localhost:3001/');

      const { isMockMode } = await import('@/config/data-mode');
      vi.mocked(isMockMode).mockReturnValue(false);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            user: { email: 'test@example.com', name: 'Test' },
          }),
      });

      const { authenticateUser } = await import('@/services/authService');
      await authenticateUser('test@example.com', 'password123', 'gp');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/auth/login',
        expect.any(Object)
      );
    });

    it('should work with all user roles', async () => {
      const { isMockMode } = await import('@/config/data-mode');
      vi.mocked(isMockMode).mockReturnValue(false);

      const roles: UserRole[] = [
        'gp',
        'analyst',
        'ops',
        'ir',
        'researcher',
        'lp',
        'auditor',
        'service_provider',
        'strategic_partner',
      ];

      for (const role of roles) {
        vi.clearAllMocks();
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () =>
            Promise.resolve({
              user: { email: 'test@example.com', name: 'Test' },
            }),
        });

        const { authenticateUser } = await import('@/services/authService');
        const result = await authenticateUser('test@example.com', 'password123', role);

        expect(result.user.role).toBe(role);
      }
    });
  });

  describe('createUser (deprecated)', () => {
    it('should return mock user when in mock mode', async () => {
      const { isMockMode } = await import('@/config/data-mode');
      vi.mocked(isMockMode).mockReturnValue(true);

      const { createUser } = await import('@/services/authService');
      const user = await createUser('test@example.com', 'password123', 'gp');

      expect(user.email).toBe('test@example.com');
      expect(user.role).toBe('gp');
      expect(isMockMode).toHaveBeenCalledWith('auth');
    });

    it('should call login endpoint and return user on success', async () => {
      const { isMockMode } = await import('@/config/data-mode');
      vi.mocked(isMockMode).mockReturnValue(false);

      const mockApiUser = {
        user: {
          email: 'test@example.com',
          name: 'Test User',
        },
        access_token: 'mock-token',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockApiUser),
      });

      const { createUser } = await import('@/services/authService');
      const user = await createUser('test@example.com', 'password123', 'analyst');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/auth/login',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
        })
      );

      expect(user).toEqual({
        name: 'Test User',
        email: 'test@example.com',
        role: 'analyst',
      });
    });

    it('should throw error on 401 Unauthorized', async () => {
      const { isMockMode } = await import('@/config/data-mode');
      vi.mocked(isMockMode).mockReturnValue(false);

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: () => Promise.resolve({ message: 'Invalid credentials' }),
      });

      const { createUser } = await import('@/services/authService');

      await expect(createUser('test@example.com', 'wrongpassword', 'gp')).rejects.toThrow(
        'Invalid credentials'
      );
    });
  });
});
