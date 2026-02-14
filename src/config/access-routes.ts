export const ACCESS_ROUTE_PATHS = Object.freeze({
  publicHome: '/',
  login: '/login',
  appHome: '/home',
  adminHome: '/superadmin',
});

export const PUBLIC_MARKETING_ROUTES = Object.freeze([
  ACCESS_ROUTE_PATHS.publicHome,
  '/features',
  '/how-it-works',
  '/security',
  '/about',
  '/eoi',
]);

export const DASHBOARD_ROUTE_PREFIXES = Object.freeze([
  ACCESS_ROUTE_PATHS.appHome,
  '/portfolio',
  '/analytics',
  '/pipeline',
  '/lp-management',
  '/fund-admin',
  '/documents',
  '/reports',
  '/compliance',
  '/audit-trail',
  '/409a-valuations',
  '/integrations',
  '/collaboration',
  '/settings',
  '/tax-center',
  '/waterfall',
  '/ai-tools',
  '/notifications',
  '/deal-intelligence',
  '/dealflow-review',
  '/contacts',
  '/lp-portal',
]);

export const STATIC_BYPASS_PREFIXES = Object.freeze([
  '/_next',
  '/api',
]);

export const STATIC_BYPASS_SEGMENTS = Object.freeze([
  '/icons/',
  '/logo/',
  '/manifest',
]);

export const STATIC_BYPASS_PATHS = Object.freeze([
  '/robots.txt',
  '/sitemap.xml',
]);

export const STATIC_BYPASS_EXTENSIONS = Object.freeze([
  'ico',
  'png',
  'jpg',
  'jpeg',
  'svg',
  'webp',
  'gif',
  'css',
  'js',
]);
