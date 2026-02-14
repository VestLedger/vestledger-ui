import { getApiBaseUrl } from '@/api/config';
import { getAccessToken } from '@/api/client';
import { ApiError } from '@/api/errors';

export type ApiQueryValue = string | number | boolean | null | undefined;
export type ApiQueryParams = Record<string, ApiQueryValue>;

type ApiMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

export type ApiRequestOptions = {
  method?: ApiMethod;
  query?: ApiQueryParams;
  body?: unknown;
  headers?: HeadersInit;
  fallbackMessage?: string;
};

function buildUrl(path: string, query?: ApiQueryParams): string {
  const baseUrl = getApiBaseUrl().replace(/\/$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = new URL(`${baseUrl}${normalizedPath}`);

  for (const [key, value] of Object.entries(query ?? {})) {
    if (value === null || value === undefined || value === '') continue;
    url.searchParams.set(key, String(value));
  }

  return url.toString();
}

function extractMessage(payload: unknown, fallback: string): string {
  if (!payload || typeof payload !== 'object') return fallback;

  const candidate = payload as Record<string, unknown>;
  if (typeof candidate.detail === 'string') return candidate.detail;
  if (typeof candidate.message === 'string') return candidate.message;
  if (typeof candidate.error === 'string') return candidate.error;

  if (Array.isArray(candidate.message)) {
    const messages = candidate.message.filter((item): item is string => typeof item === 'string');
    if (messages.length > 0) return messages.join(', ');
  }

  return fallback;
}

export async function requestJson<TResponse>(
  path: string,
  options: ApiRequestOptions = {}
): Promise<TResponse> {
  const token = getAccessToken();
  const headers = new Headers(options.headers);
  const method = options.method ?? 'GET';
  const hasBody = options.body !== undefined;

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (hasBody && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(buildUrl(path, options.query), {
    method,
    headers,
    body: hasBody ? JSON.stringify(options.body) : undefined,
  });

  const contentType = response.headers.get('content-type') ?? '';
  const payload = contentType.includes('application/json')
    ? await response.json().catch(() => undefined)
    : undefined;

  if (!response.ok) {
    throw new ApiError({
      message: extractMessage(
        payload,
        options.fallbackMessage ?? `Request failed (${response.status})`
      ),
      status: response.status,
      code: `HTTP_${response.status}`,
      details: payload,
    });
  }

  if (response.status === 204) {
    return undefined as TResponse;
  }

  return payload as TResponse;
}
