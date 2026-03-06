import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('openapi-fetch', () => ({
  default: vi.fn(() => ({
    use: vi.fn(),
  })),
}));

vi.mock('@/api/config', () => ({
  getApiBaseUrl: vi.fn(() => 'https://api.vestledger.local/api'),
}));

vi.mock('@/lib/storage/safeLocalStorage', () => ({
  safeLocalStorage: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  },
}));

describe('api client token access', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.cookie = 'accessToken=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
  });

  it('falls back to the shared cookie token when localStorage is empty', async () => {
    const { safeLocalStorage } = await import('@/lib/storage/safeLocalStorage');
    vi.mocked(safeLocalStorage.getItem).mockReturnValueOnce(null);
    document.cookie = 'accessToken=shared.jwt.token; path=/';

    const { getAccessToken } = await import('@/api/client');

    expect(getAccessToken()).toBe('shared.jwt.token');
    expect(vi.mocked(safeLocalStorage.setItem)).toHaveBeenCalledWith(
      'accessToken',
      'shared.jwt.token'
    );
  });
});
