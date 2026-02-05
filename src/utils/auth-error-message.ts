import type { NormalizedError } from '@/store/types/AsyncState';

type ErrorDetails = {
  status?: number;
  requestId?: string;
  details?: unknown;
};

function readStatus(error?: NormalizedError): number | undefined {
  if (!error) return undefined;
  const code = error.code ?? '';
  const match = code.match(/^HTTP_(\d{3})$/);
  if (match) return Number(match[1]);

  if (error.details && typeof error.details === 'object') {
    const details = error.details as ErrorDetails;
    if (typeof details.status === 'number') return details.status;
  }

  return undefined;
}

export function getAuthErrorMessage(error?: NormalizedError): string {
  if (!error) return 'Unable to sign in. Please try again.';

  const status = readStatus(error);
  const message = (error.message ?? '').toLowerCase();

  if (status === 401 || message.includes('invalid credentials') || message.includes('unauthorized')) {
    return 'Incorrect email or password. Please try again.';
  }

  if (status === 404 || message.includes('user not found') || message.includes('not found')) {
    return 'We could not find an account for that email. Check it or request access.';
  }

  if (status === 429 || message.includes('too many')) {
    return 'Too many attempts. Please wait a moment and try again.';
  }

  if (status && status >= 500) {
    return 'We are having trouble signing you in right now. Please try again.';
  }

  return error.message || 'Login failed. Please check your credentials.';
}
