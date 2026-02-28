import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { DATA_MODE_OVERRIDE_KEY } from '@/config/data-mode';
import { resolveUserDomainTarget } from '@/utils/auth/internal-access';
import type { User } from '@/types/auth';
import {
  ACCESS_ROUTE_PATHS,
  DASHBOARD_ROUTE_PREFIXES,
  PUBLIC_MARKETING_ROUTES,
  STATIC_BYPASS_EXTENSIONS,
  STATIC_BYPASS_PATHS,
  STATIC_BYPASS_PREFIXES,
  STATIC_BYPASS_SEGMENTS,
} from '@/config/access-routes';
import {
  canRoleAccessPath,
  getDefaultPathForRole,
  isUserRole,
} from '@/config/route-access-control';

const ADMIN_DEFAULT_PATH = ACCESS_ROUTE_PATHS.adminHome;
const APP_DEFAULT_PATH = ACCESS_ROUTE_PATHS.appHome;

type HostType = 'public' | 'app' | 'admin' | 'localhost';

type ParsedHost = {
  hostname: string;
  port: string;
  hostType: HostType;
};

function nextWithDataMode(request: NextRequest) {
  const override = request.cookies.get(DATA_MODE_OVERRIDE_KEY)?.value;
  if (override === 'mock' || override === 'api') {
    const headers = new Headers(request.headers);
    headers.set('x-vestledger-data-mode', override);
    return NextResponse.next({ request: { headers } });
  }
  return NextResponse.next();
}

function normalizePathname(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith('/')) {
    return pathname.slice(0, -1);
  }

  return pathname;
}

function parseHost(hostHeader: string): ParsedHost {
  const [hostnameRaw, port = ''] = hostHeader.split(':');
  const hostname = hostnameRaw.toLowerCase();
  const isLocalhost =
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === 'localhost.localdomain' ||
    hostname === '::1';

  if (isLocalhost) {
    return {
      hostname,
      port,
      hostType: 'localhost',
    };
  }

  if (hostname.startsWith('admin.')) {
    return {
      hostname,
      port,
      hostType: 'admin',
    };
  }

  if (hostname.startsWith('app.')) {
    return {
      hostname,
      port,
      hostType: 'app',
    };
  }

  return {
    hostname,
    port,
    hostType: 'public',
  };
}

function splitHostPort(host: string): { hostname: string; port: string } {
  const [hostnameRaw, port = ''] = host.split(':');
  return { hostname: hostnameRaw.toLowerCase(), port };
}

function preserveIncomingHostPort(
  incomingHost: string,
  targetHost: string
): string {
  if (!incomingHost) return targetHost;
  if (!targetHost) return incomingHost;

  const incoming = splitHostPort(incomingHost);
  const target = splitHostPort(targetHost);

  // Same hostname: avoid bouncing to an alternate/internal port (e.g. :3001)
  // when the incoming request is already on the desired public host.
  if (incoming.hostname === target.hostname) {
    if (!incoming.port) return incoming.hostname;
    if (target.port && target.port !== incoming.port) return incomingHost;
  }

  return targetHost;
}

function resolveBaseHostname(hostname: string): string {
  return hostname.replace(/^www\./, '').replace(/^app\./, '').replace(/^admin\./, '');
}

function normalizeConfiguredHost(value?: string): string | null {
  if (!value) {
    return null;
  }

  return value.replace(/^https?:\/\//, '').replace(/\/+$/, '');
}

function buildHostForType(hostname: string, port: string, hostType: Exclude<HostType, 'localhost'>): string {
  const baseHostname = resolveBaseHostname(hostname);
  const publicHostname =
    process.env.NEXT_PUBLIC_USE_WWW === 'true' ? `www.${baseHostname}` : baseHostname;

  const targetHostname =
    hostType === 'public'
      ? publicHostname
      : hostType === 'app'
        ? `app.${baseHostname}`
        : `admin.${baseHostname}`;

  return port ? `${targetHostname}:${port}` : targetHostname;
}

function redirectToHost(
  requestUrl: URL,
  targetHost: string,
  pathname: string,
  search?: URLSearchParams
): NextResponse {
  const target = splitHostPort(targetHost);
  const redirectUrl = new URL(requestUrl.toString());
  redirectUrl.hostname = target.hostname;
  // Explicitly clear the existing port when targetHost does not include one.
  // Setting URL.host without a port preserves the old non-default port (e.g. :3001).
  redirectUrl.port = target.port || '';
  redirectUrl.pathname = pathname;

  if (search) {
    redirectUrl.search = search.toString();
  } else {
    redirectUrl.search = '';
  }

  return NextResponse.redirect(redirectUrl);
}

function isPublicRoute(pathname: string): boolean {
  return (
    PUBLIC_MARKETING_ROUTES.includes(pathname) ||
    PUBLIC_MARKETING_ROUTES
      .filter((route) => route !== ACCESS_ROUTE_PATHS.publicHome)
      .some((route) => pathname.startsWith(route))
  );
}

function isDashboardRoute(pathname: string): boolean {
  return DASHBOARD_ROUTE_PREFIXES.some((route) => pathname.startsWith(route));
}

function isAdminRoute(pathname: string): boolean {
  return pathname.startsWith(ADMIN_DEFAULT_PATH);
}

function isPhoneUserAgent(userAgent: string): boolean {
  const ua = userAgent.toLowerCase();
  const isTablet = /ipad|tablet|playbook|silk/.test(ua);
  if (isTablet) return false;
  return /iphone|ipod|android.*mobile|windows phone|blackberry|opera mini|mobile/.test(ua);
}

function isStaticOrBypassed(pathname: string): boolean {
  const staticExtensionRegex = new RegExp(
    `\\.(${STATIC_BYPASS_EXTENSIONS.join('|')})$`
  );
  const normalizedPathname = normalizePathname(pathname);
  return (
    STATIC_BYPASS_PATHS.includes(normalizedPathname) ||
    STATIC_BYPASS_PREFIXES.some((prefix) => pathname.startsWith(prefix)) ||
    STATIC_BYPASS_SEGMENTS.some((segment) => pathname.includes(segment)) ||
    staticExtensionRegex.test(pathname)
  );
}

function parseUserCookie(request: NextRequest): Partial<User> | null {
  const encodedUser = request.cookies.get('user')?.value;
  if (!encodedUser) {
    return null;
  }

  try {
    return JSON.parse(decodeURIComponent(encodedUser)) as Partial<User>;
  } catch {
    return null;
  }
}

function redirectToLoginForHost(
  requestUrl: URL,
  targetHost: string,
  redirectPath?: string
): NextResponse {
  const search = new URLSearchParams();
  if (redirectPath) {
    search.set('redirect', redirectPath);
  }

  return redirectToHost(requestUrl, targetHost, ACCESS_ROUTE_PATHS.login, search);
}

function resolveUnauthorizedFallbackPath(role: unknown): string {
  if (!isUserRole(role)) return ACCESS_ROUTE_PATHS.appHome;
  const fallback = getDefaultPathForRole(role);
  if (fallback === ACCESS_ROUTE_PATHS.login) {
    return ACCESS_ROUTE_PATHS.appHome;
  }
  return fallback;
}

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const pathname = url.pathname;
  const normalizedPathname = normalizePathname(pathname);

  if (isStaticOrBypassed(pathname)) {
    return nextWithDataMode(request);
  }

  const rawHost = request.headers.get('host') || '';
  const { hostname, hostType } = parseHost(rawHost);
  const configuredPublicHost = normalizeConfiguredHost(process.env.NEXT_PUBLIC_PUBLIC_DOMAIN);
  const configuredAppHost = normalizeConfiguredHost(process.env.NEXT_PUBLIC_APP_DOMAIN);
  const configuredAdminHost = normalizeConfiguredHost(process.env.NEXT_PUBLIC_ADMIN_DOMAIN);

  const derivedAppHost = buildHostForType(hostname, '', 'app');
  const derivedAdminHost = buildHostForType(hostname, '', 'admin');
  const derivedPublicHost = buildHostForType(hostname, '', 'public');

  const appHostCandidate = configuredAppHost || derivedAppHost || rawHost;
  const adminHostCandidate = configuredAdminHost || derivedAdminHost || rawHost;
  const publicHostCandidate = configuredPublicHost || derivedPublicHost || rawHost;

  const appHost = hostType === 'localhost'
    ? rawHost
    : preserveIncomingHostPort(rawHost, appHostCandidate);
  const adminHost = hostType === 'localhost'
    ? rawHost
    : preserveIncomingHostPort(rawHost, adminHostCandidate);
  const publicHost = hostType === 'localhost'
    ? rawHost
    : preserveIncomingHostPort(rawHost, publicHostCandidate);

  const currentUser = parseUserCookie(request);
  const hasValidUserIdentity = Boolean(currentUser?.email && currentUser?.role);
  const isAuthenticated = request.cookies.get('isAuthenticated')?.value === 'true' && hasValidUserIdentity;
  const isPhone = isPhoneUserAgent(request.headers.get('user-agent') || '');
  const isLoginRoute = normalizedPathname === ACCESS_ROUTE_PATHS.login;
  const isVestaRoute = normalizedPathname === ACCESS_ROUTE_PATHS.vesta;
  const matchesPublicRoute = isPublicRoute(normalizedPathname);
  const matchesDashboardRoute = isDashboardRoute(normalizedPathname);
  const matchesAdminRoute = isAdminRoute(normalizedPathname);
  const matchesProtectedRoute = matchesDashboardRoute || matchesAdminRoute || isVestaRoute;

  if (isPhone && matchesProtectedRoute) {
    if (!isAuthenticated) {
      return redirectToLoginForHost(url, appHost, ACCESS_ROUTE_PATHS.vesta);
    }

    const isOnAppHost = hostType === 'app' || (hostType === 'localhost' && rawHost === appHost);
    if (!isOnAppHost || !isVestaRoute) {
      return redirectToHost(url, appHost, ACCESS_ROUTE_PATHS.vesta);
    }

    return nextWithDataMode(request);
  }

  if (hostType === 'localhost') {
    if (!isAuthenticated && matchesProtectedRoute) {
      return redirectToLoginForHost(url, rawHost, pathname);
    }

    if (!isAuthenticated && normalizedPathname === ACCESS_ROUTE_PATHS.publicHome) {
      return redirectToHost(url, rawHost, ACCESS_ROUTE_PATHS.login);
    }
    const target = resolveUserDomainTarget(currentUser);

    if (isAuthenticated && normalizedPathname === ACCESS_ROUTE_PATHS.publicHome) {
      const nextPath = target === 'admin' ? ADMIN_DEFAULT_PATH : APP_DEFAULT_PATH;
      return redirectToHost(url, rawHost, nextPath);
    }

    if (isAuthenticated && target === 'admin' && !matchesAdminRoute) {
      return redirectToHost(url, rawHost, ADMIN_DEFAULT_PATH);
    }

    if (isAuthenticated && target === 'app' && matchesAdminRoute) {
      return redirectToHost(url, rawHost, APP_DEFAULT_PATH);
    }

    if (isAuthenticated && isUserRole(currentUser?.role) && !canRoleAccessPath(currentUser.role, normalizedPathname)) {
      const fallbackPath = resolveUnauthorizedFallbackPath(currentUser.role);
      if (normalizePathname(fallbackPath) !== normalizedPathname) {
        return redirectToHost(url, rawHost, fallbackPath);
      }
    }

    return nextWithDataMode(request);
  }

  if (!isAuthenticated) {
    if (hostType === 'public') {
      if (isLoginRoute || matchesDashboardRoute) {
        return redirectToHost(url, appHost, pathname, url.searchParams);
      }

      if (matchesAdminRoute) {
        return redirectToLoginForHost(url, appHost, pathname);
      }

      return nextWithDataMode(request);
    }

    if (hostType === 'app') {
      if (matchesPublicRoute && pathname !== ACCESS_ROUTE_PATHS.publicHome) {
        return redirectToHost(url, publicHost, pathname, url.searchParams);
      }

      if (normalizedPathname === ACCESS_ROUTE_PATHS.publicHome) {
        return redirectToHost(url, appHost, ACCESS_ROUTE_PATHS.login);
      }

      if (matchesDashboardRoute) {
        return redirectToLoginForHost(url, appHost, pathname);
      }

      if (matchesAdminRoute) {
        return redirectToLoginForHost(url, appHost, pathname);
      }

      return nextWithDataMode(request);
    }

    if (hostType === 'admin') {
      if (isLoginRoute) {
        return redirectToHost(url, appHost, ACCESS_ROUTE_PATHS.login, url.searchParams);
      }

      if (matchesPublicRoute && pathname !== ACCESS_ROUTE_PATHS.publicHome) {
        return redirectToHost(url, publicHost, pathname, url.searchParams);
      }

      if (normalizedPathname === ACCESS_ROUTE_PATHS.publicHome) {
        return redirectToHost(url, appHost, ACCESS_ROUTE_PATHS.login);
      }

      if (matchesAdminRoute) {
        return redirectToLoginForHost(url, appHost, pathname);
      }

      if (matchesDashboardRoute) {
        return redirectToLoginForHost(url, appHost, pathname);
      }

      return nextWithDataMode(request);
    }

    return nextWithDataMode(request);
  }

  const domainTarget = resolveUserDomainTarget(currentUser);
  const targetHost = domainTarget === 'admin' ? adminHost : appHost;

  // Public marketing pages should remain accessible even when authenticated
  // on app/admin domains. Do not force cross-domain redirects for public routes.
  if (hostType === 'public' && matchesPublicRoute) {
    return nextWithDataMode(request);
  }

  // Let app-domain login page render so client auth hydration can decide redirect.
  // This prevents stale cookies from forcing an edge redirect before auth state is known.
  if (hostType === 'app' && isLoginRoute) {
    return nextWithDataMode(request);
  }

  if ((domainTarget === 'admin' && hostType !== 'admin') || (domainTarget === 'app' && hostType !== 'app')) {
    const targetPath =
      domainTarget === 'admin'
        ? matchesAdminRoute
          ? pathname
          : ADMIN_DEFAULT_PATH
        : matchesDashboardRoute
          ? pathname
          : APP_DEFAULT_PATH;

    return redirectToHost(url, targetHost, targetPath, url.searchParams);
  }

  if (isLoginRoute) {
    return redirectToHost(url, targetHost, domainTarget === 'admin' ? ADMIN_DEFAULT_PATH : APP_DEFAULT_PATH);
  }

  if (normalizedPathname === ACCESS_ROUTE_PATHS.publicHome) {
    return redirectToHost(url, targetHost, domainTarget === 'admin' ? ADMIN_DEFAULT_PATH : APP_DEFAULT_PATH);
  }

  if (isUserRole(currentUser?.role) && !canRoleAccessPath(currentUser.role, normalizedPathname)) {
    const fallbackPath =
      domainTarget === 'admin'
        ? ADMIN_DEFAULT_PATH
        : resolveUnauthorizedFallbackPath(currentUser.role);
    if (normalizePathname(fallbackPath) !== normalizedPathname) {
      return redirectToHost(url, targetHost, fallbackPath);
    }
  }

  if (domainTarget === 'admin') {
    if (!matchesAdminRoute) {
      return redirectToHost(url, targetHost, ADMIN_DEFAULT_PATH);
    }

    return nextWithDataMode(request);
  }

  if (matchesAdminRoute || matchesPublicRoute) {
    return redirectToHost(url, targetHost, APP_DEFAULT_PATH);
  }

  return nextWithDataMode(request);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icons|logo|manifest|robots\\.txt|sitemap\\.xml).*)',
  ],
};
