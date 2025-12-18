import { ApiError, apiErrorFromOpenapiFetchResult } from './errors';

export type OpenapiFetchResult<TData> = {
  data?: TData;
  error?: unknown;
  response: Response;
};

/**
 * Convention for `openapi-fetch` calls:
 * - return `data` on 2xx
 * - throw `ApiError` on non-2xx (so sagas can `normalizeError` consistently)
 */
export async function unwrapApiResult<TData>(
  resultPromise: Promise<OpenapiFetchResult<TData>>,
  opts?: { fallbackMessage?: string }
): Promise<TData> {
  const result = await resultPromise;

  if (!result.response.ok) {
    throw apiErrorFromOpenapiFetchResult({
      response: result.response,
      errorBody: result.error,
      fallbackMessage: opts?.fallbackMessage,
    });
  }

  if (result.data === undefined) {
    throw new ApiError({
      status: result.response.status,
      code: 'EMPTY_RESPONSE',
      message: opts?.fallbackMessage ?? 'Empty response from server',
      details: { error: result.error },
    });
  }

  return result.data;
}

