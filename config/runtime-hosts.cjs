const DEFAULT_APP_BASE_URL = 'http://localhost:3000';
const DEFAULT_PLAYWRIGHT_DEV_SERVER_URL = 'http://127.0.0.1:3000';

const AUTH_LIGHTHOUSE_PATHS = [
  '/home',
  '/pipeline',
  '/portfolio',
  '/contacts',
  '/analytics',
  '/audit-trail',
  '/compliance',
  '/deal-intelligence',
  '/dealflow-review',
  '/documents',
  '/fund-admin',
  '/integrations',
  '/lp-management',
  '/notifications',
  '/reports',
  '/settings',
  '/tax-center',
  '/waterfall',
  '/ai-tools',
  '/409a-valuations',
  '/collaboration',
];

const PUBLIC_LIGHTHOUSE_PATHS = [
  '/',
  '/about',
  '/features',
  '/how-it-works',
  '/security',
  '/eoi',
];

function normalizeUrl(value, fallback) {
  const candidate = (value || fallback || '').trim();
  if (!candidate) {
    return '';
  }

  return candidate.replace(/\/+$/, '');
}

function joinUrl(baseUrl, pathname) {
  const normalizedBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  return new URL(pathname.replace(/^\//, ''), normalizedBase).toString();
}

const appBaseUrl = normalizeUrl(
  process.env.APP_BASE_URL || process.env.BASE_URL,
  DEFAULT_APP_BASE_URL,
);

const publicBaseUrl = normalizeUrl(
  process.env.PUBLIC_BASE_URL,
  appBaseUrl,
);

const lhciAuthBaseUrl = normalizeUrl(
  process.env.LHCI_AUTH_BASE_URL,
  appBaseUrl,
);

const playwrightDevServerUrl = normalizeUrl(
  process.env.PLAYWRIGHT_DEV_SERVER_URL,
  DEFAULT_PLAYWRIGHT_DEV_SERVER_URL,
);

module.exports = {
  appBaseUrl,
  publicBaseUrl,
  lhciAuthBaseUrl,
  playwrightDevServerUrl,
  lighthouseAuthUrls: AUTH_LIGHTHOUSE_PATHS.map((pathname) =>
    joinUrl(appBaseUrl, pathname),
  ),
  lighthousePublicUrls: PUBLIC_LIGHTHOUSE_PATHS.map((pathname) =>
    joinUrl(publicBaseUrl, pathname),
  ),
};
