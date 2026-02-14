import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '@/api/errors';

const getApiBaseUrl = vi.fn(() => 'https://api.vestledger.local');
const getAccessToken = vi.fn(() => 'test-token');

vi.mock('@/api/config', () => ({
  getApiBaseUrl,
}));

vi.mock('@/api/client', () => ({
  getAccessToken,
}));

describe('httpClient.requestJson', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('builds URL query params, sets auth header, and returns JSON payload', async () => {
    const fetchMock = vi.fn(async () =>
      new Response(JSON.stringify({ ok: true, id: 'abc' }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      })
    );
    vi.stubGlobal('fetch', fetchMock);

    const { requestJson } = await import('@/services/shared/httpClient');

    const response = await requestJson<{ ok: boolean; id: string }>('/pipeline/deals', {
      method: 'POST',
      query: {
        stage: 'Sourced',
        search: '',
        limit: 25,
      },
      body: { name: 'Deal A' },
    });

    expect(response).toEqual({ ok: true, id: 'abc' });
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('https://api.vestledger.local/pipeline/deals');
    expect(url).toContain('stage=Sourced');
    expect(url).toContain('limit=25');
    expect(url).not.toContain('search=');
    expect(init.method).toBe('POST');

    const headers = init.headers as Headers;
    expect(headers.get('Authorization')).toBe('Bearer test-token');
    expect(headers.get('Content-Type')).toBe('application/json');
    expect(init.body).toBe(JSON.stringify({ name: 'Deal A' }));
  });

  it('returns undefined for 204 responses', async () => {
    const fetchMock = vi.fn(async () => new Response(null, { status: 204 }));
    vi.stubGlobal('fetch', fetchMock);

    const { requestJson } = await import('@/services/shared/httpClient');
    const response = await requestJson('/pipeline/deals/123', {
      method: 'DELETE',
    });

    expect(response).toBeUndefined();
  });

  it('throws ApiError with extracted backend message on non-2xx responses', async () => {
    const fetchMock = vi.fn(async () =>
      new Response(JSON.stringify({ message: ['Pipeline unavailable'] }), {
        status: 503,
        headers: { 'content-type': 'application/json' },
      })
    );
    vi.stubGlobal('fetch', fetchMock);

    const { requestJson } = await import('@/services/shared/httpClient');

    await expect(
      requestJson('/pipeline/deals', {
        fallbackMessage: 'Fallback message',
      })
    ).rejects.toMatchObject<ApiError>({
      name: 'ApiError',
      status: 503,
      code: 'HTTP_503',
      message: 'Pipeline unavailable',
    });
  });
});
