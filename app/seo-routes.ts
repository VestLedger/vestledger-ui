import { CANONICAL_PUBLIC_WEB_URL, PUBLIC_WEB_URL } from '@/config/env';

export const PUBLIC_SITEMAP_PATHS = [
  '/',
  '/about',
  '/features',
  '/how-it-works',
  '/security',
  '/eoi',
] as const;

const DEFAULT_LOCAL_BASE_URL = 'http://localhost:3000';

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');

export const resolvePublicSeoBaseUrl = () =>
  trimTrailingSlash(
    CANONICAL_PUBLIC_WEB_URL || PUBLIC_WEB_URL || DEFAULT_LOCAL_BASE_URL
  );
