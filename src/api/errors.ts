import type { NormalizedError } from '@/store/types/AsyncState';

export class ApiError extends Error {
  status: number;
  code?: string;
  requestId?: string;
  details?: unknown;

  constructor(args: {
    message: string;
    status: number;
    code?: string;
    requestId?: string;
    details?: unknown;
  }) {
    super(args.message);
    this.name = 'ApiError';
    this.status = args.status;
    this.code = args.code;
    this.requestId = args.requestId;
    this.details = args.details;
  }
}

function readString(obj: unknown, key: string): string | undefined {
  if (!obj || typeof obj !== 'object') return undefined;
  const value = (obj as Record<string, unknown>)[key];
  return typeof value === 'string' ? value : undefined;
}

function readFirstString(arr: unknown): string | undefined {
  if (!Array.isArray(arr)) return undefined;
  for (const item of arr) {
    if (typeof item === 'string') return item;
    const msg = readString(item, 'message');
    if (msg) return msg;
  }
  return undefined;
}

function extractErrorMessage(payload: unknown): string | undefined {
  // RFC7807: { title, detail }
  const detail = readString(payload, 'detail');
  if (detail) return detail;
  const title = readString(payload, 'title');
  if (title) return title;

  // Common shapes: { message }, { error }
  const message = readString(payload, 'message') ?? readString(payload, 'error');
  if (message) return message;

  // { errors: [...] }
  if (payload && typeof payload === 'object') {
    const errors = (payload as Record<string, unknown>).errors;
    const first = readFirstString(errors);
    if (first) return first;
  }

  return undefined;
}

function extractErrorCode(payload: unknown): string | undefined {
  // Common fields
  return readString(payload, 'code') ?? readString(payload, 'errorCode');
}

function extractRequestId(response: Response): string | undefined {
  return (
    response.headers.get('x-request-id') ??
    response.headers.get('x-correlation-id') ??
    undefined
  );
}

export function apiErrorFromOpenapiFetchResult(args: {
  response: Response;
  errorBody: unknown;
  fallbackMessage?: string;
}): ApiError {
  const requestId = extractRequestId(args.response);
  const status = args.response.status;
  const message =
    extractErrorMessage(args.errorBody) ??
    args.fallbackMessage ??
    `Request failed (${status})`;

  const code = extractErrorCode(args.errorBody) ?? `HTTP_${status}`;

  return new ApiError({
    message,
    status,
    code,
    requestId,
    details: args.errorBody,
  });
}

export function normalizeApiError(error: ApiError): NormalizedError {
  return {
    message: error.message,
    code: error.code,
    details: {
      status: error.status,
      requestId: error.requestId,
      details: error.details,
    },
  };
}

