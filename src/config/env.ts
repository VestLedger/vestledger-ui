const DEFAULT_PUBLIC_DOMAIN = 'vestledger.local:3000';
const DEFAULT_APP_DOMAIN = 'app.vestledger.local:3000';
const DEFAULT_API_BASE_URL = 'http://localhost:3000';
const DEFAULT_CANONICAL_PUBLIC_URL = 'https://vestledger.com';

const normalizeDomain = (value?: string) => {
  if (!value) return null;
  return value.replace(/^https?:\/\//, '').replace(/\/+$/, '');
};

const isProductionRuntime = () => process.env.NODE_ENV === 'production';

const configuredPublicDomain =
  normalizeDomain(process.env.NEXT_PUBLIC_PUBLIC_DOMAIN) ?? DEFAULT_PUBLIC_DOMAIN;
const configuredAppDomain =
  normalizeDomain(process.env.NEXT_PUBLIC_APP_DOMAIN) ?? DEFAULT_APP_DOMAIN;

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL;

export const CANONICAL_PUBLIC_WEB_URL =
  normalizeDomain(process.env.NEXT_PUBLIC_PUBLIC_DOMAIN)
    ? `https://${normalizeDomain(process.env.NEXT_PUBLIC_PUBLIC_DOMAIN)}`
    : DEFAULT_CANONICAL_PUBLIC_URL;

const resolveProtocol = () => (isProductionRuntime() ? 'https' : 'http');

export const resolvePublicDomain = (currentHostname?: string) => {
  if (isProductionRuntime() && currentHostname && currentHostname.includes('.')) {
    return currentHostname.replace(/^app\./, '');
  }
  return configuredPublicDomain;
};

export const resolveAppDomain = (currentHostname?: string) => {
  if (isProductionRuntime() && currentHostname && currentHostname.includes('.')) {
    const baseDomain = currentHostname
      .replace(/^www\./, '')
      .replace(/^app\./, '');
    return `app.${baseDomain}`;
  }
  return configuredAppDomain;
};

export const buildPublicWebUrl = (currentHostname?: string) =>
  `${resolveProtocol()}://${resolvePublicDomain(currentHostname)}`;

export const buildAppWebUrl = (currentHostname?: string) =>
  `${resolveProtocol()}://${resolveAppDomain(currentHostname)}`;

export const buildAppLoginUrl = (currentHostname?: string) =>
  `${buildAppWebUrl(currentHostname)}/login`;

export const PUBLIC_WEB_URL = buildPublicWebUrl();
export const APP_WEB_URL = buildAppWebUrl();
