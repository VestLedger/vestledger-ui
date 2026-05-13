import { ACCESS_ROUTE_PATHS } from "@/config/access-routes";

const normalizeDomain = (value?: string) => {
  if (!value) return null;
  return value.replace(/^https?:\/\//, "").replace(/\/+$/, "");
};

const normalizeValue = (value?: string) => {
  const normalized = value?.trim();
  return normalized && normalized.length > 0 ? normalized : null;
};

const getBrowserPortForHost = (host: string) => {
  if (typeof window === "undefined") {
    return "";
  }

  return window.location.hostname.toLowerCase() === host
    ? window.location.port
    : "";
};

const splitHostAndPort = (hostname?: string) => {
  if (!hostname) {
    return { host: "", port: "" };
  }

  const normalized = hostname.replace(/^https?:\/\//, "").replace(/\/+$/, "");
  const [rawHost, rawPort = ""] = normalized.split(":");
  const host = rawHost.toLowerCase();
  const port = rawPort || getBrowserPortForHost(host);
  return { host, port };
};

const isLocalHost = (host: string) =>
  host === "localhost" || host === "127.0.0.1" || host.endsWith(".localhost");

const toHostWithPort = ({ host, port }: { host: string; port: string }) =>
  port ? `${host}:${port}` : host;

const resolveBaseDomainFromHost = (hostname?: string) => {
  const { host, port } = splitHostAndPort(hostname);
  if (!host || isLocalHost(host) || !host.includes(".")) {
    return null;
  }

  const base = host
    .replace(/^www\./, "")
    .replace(/^app\./, "")
    .replace(/^admin\./, "");
  return port ? `${base}:${port}` : base;
};

const toBaseDomain = (hostname?: string | null) => {
  if (!hostname) return null;
  const { host, port } = splitHostAndPort(hostname);
  if (!host) return null;
  const base = host
    .replace(/^www\./, "")
    .replace(/^app\./, "")
    .replace(/^admin\./, "");
  if (!base) return null;
  return port ? `${base}:${port}` : base;
};

const toSubdomainDomain = (
  hostname: string | null,
  subdomain: "app" | "admin",
) => {
  if (!hostname) return null;
  const { host, port } = splitHostAndPort(hostname);
  if (!host) return null;
  const base = host
    .replace(/^www\./, "")
    .replace(/^app\./, "")
    .replace(/^admin\./, "");
  if (!base) return null;
  return port ? `${subdomain}.${base}:${port}` : `${subdomain}.${base}`;
};

const resolveDomainFromCurrentHost = (
  currentHostname: string | undefined,
  target: "public" | "app" | "admin",
) => {
  const currentHost = splitHostAndPort(currentHostname);
  const normalizedCurrent = toHostWithPort(currentHost);
  if (!normalizedCurrent) return null;

  const resolvedBase = resolveBaseDomainFromHost(currentHostname);
  if (resolvedBase) {
    if (target === "public") return resolvedBase;
    return `${target}.${resolvedBase}`;
  }

  return normalizedCurrent;
};

const isProductionRuntime = () => process.env.NODE_ENV === "production";
const resolveProtocol = () => (isProductionRuntime() ? "https" : "http");

const explicitPublicDomain = normalizeDomain(
  process.env.NEXT_PUBLIC_PUBLIC_DOMAIN,
);
const explicitAppDomain = normalizeDomain(process.env.NEXT_PUBLIC_APP_DOMAIN);
const explicitAdminDomain = normalizeDomain(
  process.env.NEXT_PUBLIC_ADMIN_DOMAIN,
);

const fallbackPublicDomain = normalizeDomain(
  process.env.NEXT_PUBLIC_DEFAULT_PUBLIC_DOMAIN,
);
const fallbackAppDomain = normalizeDomain(
  process.env.NEXT_PUBLIC_DEFAULT_APP_DOMAIN,
);
const fallbackAdminDomain = normalizeDomain(
  process.env.NEXT_PUBLIC_DEFAULT_ADMIN_DOMAIN,
);

const configuredPublicDomain =
  explicitPublicDomain ??
  fallbackPublicDomain ??
  toBaseDomain(explicitAppDomain) ??
  toBaseDomain(explicitAdminDomain);

const configuredAppDomain =
  explicitAppDomain ??
  fallbackAppDomain ??
  toSubdomainDomain(configuredPublicDomain, "app");

const configuredAdminDomain =
  explicitAdminDomain ??
  fallbackAdminDomain ??
  toSubdomainDomain(configuredPublicDomain, "admin");

const configuredApiBaseUrl =
  normalizeValue(process.env.NEXT_PUBLIC_API_BASE_URL) ??
  normalizeValue(process.env.NEXT_PUBLIC_DEFAULT_API_BASE_URL) ??
  "";

const LOCAL_DOCKER_API_BASE_URL =
  normalizeValue(process.env.NEXT_PUBLIC_LOCAL_API_BASE_URL) ??
  "http://localhost:3000";

const getUrlHostname = (value: string) => {
  try {
    return new URL(value, "http://local.invalid").hostname.toLowerCase();
  } catch {
    return "";
  }
};

export const resolveApiBaseUrl = (currentHostname?: string) => {
  const { host } = splitHostAndPort(currentHostname);
  if (
    host &&
    isLocalHost(host) &&
    getUrlHostname(configuredApiBaseUrl) === "api.vestledger.local"
  ) {
    return LOCAL_DOCKER_API_BASE_URL;
  }

  return configuredApiBaseUrl;
};

export const API_BASE_URL = resolveApiBaseUrl(
  typeof window === "undefined" ? undefined : window.location.hostname,
);

const explicitCanonicalPublicUrl = normalizeValue(
  process.env.NEXT_PUBLIC_CANONICAL_PUBLIC_URL,
);

const buildUrlForDomain = (
  domain: string | null,
  protocol = resolveProtocol(),
) => {
  if (!domain) return "";

  const { host } = splitHostAndPort(domain);
  const resolvedProtocol = host && isLocalHost(host) ? "http" : protocol;
  return `${resolvedProtocol}://${domain}`;
};

const resolveDomain = (
  currentHostname: string | undefined,
  target: "public" | "app" | "admin",
  configuredDomain: string | null,
) => {
  const { host } = splitHostAndPort(currentHostname);
  if (host && isLocalHost(host)) {
    return (
      resolveDomainFromCurrentHost(currentHostname, target) ??
      configuredDomain ??
      ""
    );
  }

  return (
    configuredDomain ??
    resolveDomainFromCurrentHost(currentHostname, target) ??
    ""
  );
};

export const resolvePublicDomain = (currentHostname?: string) =>
  resolveDomain(currentHostname, "public", configuredPublicDomain);

export const resolveAppDomain = (currentHostname?: string) =>
  resolveDomain(currentHostname, "app", configuredAppDomain) ??
  resolvePublicDomain(currentHostname);

export const resolveAdminDomain = (currentHostname?: string) =>
  resolveDomain(currentHostname, "admin", configuredAdminDomain) ??
  resolvePublicDomain(currentHostname);

export const buildPublicWebUrl = (currentHostname?: string) =>
  buildUrlForDomain(resolvePublicDomain(currentHostname));

export const buildAppWebUrl = (currentHostname?: string) =>
  buildUrlForDomain(resolveAppDomain(currentHostname));

export const buildAdminWebUrl = (currentHostname?: string) =>
  buildUrlForDomain(resolveAdminDomain(currentHostname));

export const buildAppLoginUrl = (currentHostname?: string) =>
  `${buildAppWebUrl(currentHostname)}${ACCESS_ROUTE_PATHS.login}`;

export const buildAdminLoginUrl = (currentHostname?: string) =>
  `${buildAdminWebUrl(currentHostname)}${ACCESS_ROUTE_PATHS.login}`;

export const buildAdminSuperadminUrl = (currentHostname?: string) =>
  `${buildAdminWebUrl(currentHostname)}${ACCESS_ROUTE_PATHS.adminHome}`;

export const CANONICAL_PUBLIC_WEB_URL =
  explicitCanonicalPublicUrl ??
  buildUrlForDomain(resolvePublicDomain(), "https") ??
  "";

export const PUBLIC_WEB_URL = buildPublicWebUrl();
export const APP_WEB_URL = buildAppWebUrl();
export const ADMIN_WEB_URL = buildAdminWebUrl();
