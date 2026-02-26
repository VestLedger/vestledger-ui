import { CANONICAL_PUBLIC_WEB_URL, PUBLIC_WEB_URL } from '@/config/env';

export const PUBLIC_SITEMAP_PATHS = [
  '/',
  '/about',
  '/features',
  '/how-it-works',
  '/security',
  '/eoi',
] as const;

const DEFAULT_PUBLIC_BASE_URL = 'https://vestledger.ai';

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');

export const resolvePublicSeoBaseUrl = () =>
  trimTrailingSlash(
    CANONICAL_PUBLIC_WEB_URL || PUBLIC_WEB_URL || DEFAULT_PUBLIC_BASE_URL
  );
