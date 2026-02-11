const DEFAULT_PUBLIC_DOMAIN = 'vestledger.local:3000';
const DEFAULT_APP_DOMAIN = 'app.vestledger.local:3000';
const DEFAULT_ADMIN_DOMAIN = 'admin.vestledger.local:3000';
const DEFAULT_API_BASE_URL = 'http://localhost:3000';
const DEFAULT_CANONICAL_PUBLIC_URL = 'https://vestledger.com';

const normalizeDomain = (value?: string) => {
  if (!value) return null;
  return value.replace(/^https?:\/\//, '').replace(/\/+$/, '');
};

const splitHostAndPort = (hostname?: string) => {
  if (!hostname) {
    return { host: '', port: '' };
  }

  const normalized = hostname.replace(/^https?:\/\//, '').replace(/\/+$/, '');
  const [host, port = ''] = normalized.split(':');
  return { host: host.toLowerCase(), port };
};

const isLocalHost = (host: string) =>
  host === 'localhost' || host === '127.0.0.1' || host.endsWith('.localhost');

const resolveBaseDomainFromHost = (hostname?: string) => {
  const { host, port } = splitHostAndPort(hostname);
  if (!host || isLocalHost(host) || !host.includes('.')) {
    return null;
  }

  const base = host.replace(/^www\./, '').replace(/^app\./, '').replace(/^admin\./, '');
  return port ? `${base}:${port}` : base;
};

const isProductionRuntime = () => process.env.NODE_ENV === 'production';

const configuredPublicDomain =
  normalizeDomain(process.env.NEXT_PUBLIC_PUBLIC_DOMAIN) ?? DEFAULT_PUBLIC_DOMAIN;
const configuredAppDomain =
  normalizeDomain(process.env.NEXT_PUBLIC_APP_DOMAIN) ?? DEFAULT_APP_DOMAIN;
const configuredAdminDomain =
  normalizeDomain(process.env.NEXT_PUBLIC_ADMIN_DOMAIN) ?? DEFAULT_ADMIN_DOMAIN;

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL;

export const CANONICAL_PUBLIC_WEB_URL =
  normalizeDomain(process.env.NEXT_PUBLIC_PUBLIC_DOMAIN)
    ? `https://${normalizeDomain(process.env.NEXT_PUBLIC_PUBLIC_DOMAIN)}`
    : DEFAULT_CANONICAL_PUBLIC_URL;

const resolveProtocol = () => (isProductionRuntime() ? 'https' : 'http');

export const resolvePublicDomain = (currentHostname?: string) => {
  const resolvedBase = resolveBaseDomainFromHost(currentHostname);
  if (resolvedBase) {
    return resolvedBase;
  }
  return configuredPublicDomain;
};

export const resolveAppDomain = (currentHostname?: string) => {
  const resolvedBase = resolveBaseDomainFromHost(currentHostname);
  if (resolvedBase) {
    return `app.${resolvedBase}`;
  }
  return configuredAppDomain;
};

export const resolveAdminDomain = (currentHostname?: string) => {
  const resolvedBase = resolveBaseDomainFromHost(currentHostname);
  if (resolvedBase) {
    return `admin.${resolvedBase}`;
  }
  return configuredAdminDomain;
};

export const buildPublicWebUrl = (currentHostname?: string) =>
  `${resolveProtocol()}://${resolvePublicDomain(currentHostname)}`;

export const buildAppWebUrl = (currentHostname?: string) =>
  `${resolveProtocol()}://${resolveAppDomain(currentHostname)}`;

export const buildAdminWebUrl = (currentHostname?: string) =>
  `${resolveProtocol()}://${resolveAdminDomain(currentHostname)}`;

export const buildAppLoginUrl = (currentHostname?: string) =>
  `${buildAppWebUrl(currentHostname)}/login`;

export const buildAdminLoginUrl = (currentHostname?: string) =>
  `${buildAdminWebUrl(currentHostname)}/login`;

export const buildAdminSuperadminUrl = (currentHostname?: string) =>
  `${buildAdminWebUrl(currentHostname)}/superadmin`;

export const PUBLIC_WEB_URL = buildPublicWebUrl();
export const APP_WEB_URL = buildAppWebUrl();
export const ADMIN_WEB_URL = buildAdminWebUrl();
