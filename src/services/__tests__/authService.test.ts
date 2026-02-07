import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { User, UserRole } from '@/types/auth';

// Mock dependencies before importing the service
vi.mock('@/api/config', () => ({
  getApiBaseUrl: vi.fn(() => 'http://localhost:3001'),
}));

vi.mock('@/data/mocks/auth', () => ({
  createMockUser: vi.fn((email: string, role: UserRole): User => ({
    name: 'Mock User',
    email,
    role,
  })),
}));

vi.mock('@/config/data-mode', () => ({
  isMockMode: vi.fn(() => true),
}));

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Helper to create a mock JWT token with the given payload
function createMockJwt(payload: { sub: string; email: string; username: string; role: UserRole }): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload));
  const signature = 'mock-signature';
  return `${header}.${body}.${signature}`;
}

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  describe('authenticateUser', () => {
    it('should return demo user with mock data override when demo credentials are used', async () => {
      const { authenticateUser } = await import('@/services/authService');
      const result = await authenticateUser('demo@vestledger.com', 'Pa$$w0rd');

      expect(result.user.email).toBe('demo@vestledger.com');
      expect(result.user.role).toBe('gp');
      expect(result.accessToken).toBe('mock-token');
      expect(result.dataModeOverride).toBe('mock');
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should return demo user with mock data override when demo credentials are used', async () => {
      const { isMockMode } = await import('@/config/data-mode');
      vi.mocked(isMockMode).mockReturnValue(false);

      const { authenticateUser } = await import('@/services/authService');
      const result = await authenticateUser('demo@vestledger.com', 'Pa$$w0rd');

      expect(result.user.email).toBe('demo@vestledger.com');
      expect(result.user.role).toBe('gp');
      expect(result.accessToken).toBe('mock-token');
      expect(result.dataModeOverride).toBe('mock');
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should call login endpoint and return user with accessToken from JWT', async () => {
      const mockJwt = createMockJwt({
        sub: 'user-123',
        email: 'test@example.com',
        username: 'Test User',
        role: 'analyst',
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            access_token: mockJwt,
          }),
      });

      const { authenticateUser } = await import('@/services/authService');
      const result = await authenticateUser('test@example.com', 'password123');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/auth/login',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
        })
      );

      expect(result.user.email).toBe('test@example.com');
      expect(result.user.name).toBe('Test User');
      expect(result.user.role).toBe('analyst');
      expect(result.accessToken).toBe(mockJwt);
      expect(result.dataModeOverride).toBe('api');
    });

    it('should throw error when API does not return access_token', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            // No access_token in response
          }),
      });

      const { authenticateUser } = await import('@/services/authService');

      await expect(authenticateUser('test@example.com', 'password123')).rejects.toThrow(
        'No access token in response'
      );
    });

    it('should throw error with message on 401 Unauthorized', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: () => Promise.resolve({ message: 'Invalid credentials' }),
      });

      const { authenticateUser } = await import('@/services/authService');

      await expect(authenticateUser('test@example.com', 'wrongpassword')).rejects.toThrow(
        'Invalid credentials'
      );
    });

    it('should throw error on 404 when user does not exist', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: () => Promise.resolve({ message: 'User not found' }),
      });

      const { authenticateUser } = await import('@/services/authService');

      await expect(authenticateUser('unknown@example.com', 'password123')).rejects.toThrow(
        'User not found'
      );
    });

    it('should handle array error messages', async () => {
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

      await expect(authenticateUser('', 'short')).rejects.toThrow(
        'Email is required, Password must be at least 8 characters'
      );
    });

    it('should use statusText when no message in response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 503,
        statusText: 'Service Unavailable',
        json: () => Promise.resolve({}),
      });

      const { authenticateUser } = await import('@/services/authService');

      await expect(authenticateUser('test@example.com', 'password123')).rejects.toThrow(
        'Service Unavailable'
      );
    });

    it('should handle JSON parse errors gracefully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: () => Promise.reject(new Error('Invalid JSON')),
      });

      const { authenticateUser } = await import('@/services/authService');

      await expect(authenticateUser('test@example.com', 'password123')).rejects.toThrow(
        'Internal Server Error'
      );
    });

    it('should strip trailing slash from base URL', async () => {
      const { getApiBaseUrl } = await import('@/api/config');
      vi.mocked(getApiBaseUrl).mockReturnValue('http://localhost:3001/');

      const mockJwt = createMockJwt({
        sub: 'user-123',
        email: 'test@example.com',
        username: 'Test',
        role: 'gp',
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            access_token: mockJwt,
          }),
      });

      const { authenticateUser } = await import('@/services/authService');
      await authenticateUser('test@example.com', 'password123');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/auth/login',
        expect.any(Object)
      );
    });

    it('should extract role from JWT for all user roles', async () => {
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
        const mockJwt = createMockJwt({
          sub: 'user-123',
          email: 'test@example.com',
          username: 'Test',
          role,
        });

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () =>
            Promise.resolve({
              access_token: mockJwt,
            }),
        });

        const { authenticateUser } = await import('@/services/authService');
        const result = await authenticateUser('test@example.com', 'password123');

        expect(result.user.role).toBe(role);
      }
    });
  });
});
