import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { DATA_MODE_OVERRIDE_KEY } from '@/config/data-mode';
import { resolveUserDomainTarget } from '@/utils/auth/internal-access';
import type { User } from '@/types/auth';

const PUBLIC_ROUTES = ['/', '/features', '/how-it-works', '/security', '/about', '/eoi'];
const AUTH_ROUTES = ['/login'];
const ADMIN_DEFAULT_PATH = '/superadmin';
const APP_DEFAULT_PATH = '/home';

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

function resolveBaseHostname(hostname: string): string {
  return hostname.replace(/^www\./, '').replace(/^app\./, '').replace(/^admin\./, '');
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
  const redirectUrl = new URL(requestUrl.toString());
  redirectUrl.host = targetHost;
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
    PUBLIC_ROUTES.includes(pathname) ||
    PUBLIC_ROUTES.filter((route) => route !== '/').some((route) => pathname.startsWith(route))
  );
}

function isDashboardRoute(pathname: string): boolean {
  return (
    pathname.startsWith('/home') ||
    pathname.startsWith('/portfolio') ||
    pathname.startsWith('/analytics') ||
    pathname.startsWith('/pipeline') ||
    pathname.startsWith('/lp-management') ||
    pathname.startsWith('/fund-admin') ||
    pathname.startsWith('/documents') ||
    pathname.startsWith('/reports') ||
    pathname.startsWith('/compliance') ||
    pathname.startsWith('/audit-trail') ||
    pathname.startsWith('/409a-valuations') ||
    pathname.startsWith('/integrations') ||
    pathname.startsWith('/settings') ||
    pathname.startsWith('/tax-center') ||
    pathname.startsWith('/waterfall') ||
    pathname.startsWith('/ai-tools') ||
    pathname.startsWith('/notifications') ||
    pathname.startsWith('/deal-intelligence') ||
    pathname.startsWith('/dealflow-review') ||
    pathname.startsWith('/contacts') ||
    pathname.startsWith('/lp-portal')
  );
}

function isAdminRoute(pathname: string): boolean {
  return pathname.startsWith(ADMIN_DEFAULT_PATH);
}

function isStaticOrBypassed(pathname: string): boolean {
  return (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('/icons/') ||
    pathname.includes('/logo/') ||
    pathname.includes('/manifest') ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|webp|gif|css|js)$/) !== null
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

  return redirectToHost(requestUrl, targetHost, '/login', search);
}

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const pathname = url.pathname;

  if (isStaticOrBypassed(pathname)) {
    return nextWithDataMode(request);
  }

  const rawHost = request.headers.get('host') || '';
  const { hostname, port, hostType } = parseHost(rawHost);

  const appHost = hostType === 'localhost' ? rawHost : buildHostForType(hostname, port, 'app');
  const adminHost = hostType === 'localhost' ? rawHost : buildHostForType(hostname, port, 'admin');
  const publicHost = hostType === 'localhost' ? rawHost : buildHostForType(hostname, port, 'public');

  const isAuthenticated = request.cookies.get('isAuthenticated')?.value === 'true';
  const isLoginRoute = AUTH_ROUTES.includes(pathname);
  const matchesPublicRoute = isPublicRoute(pathname);
  const matchesDashboardRoute = isDashboardRoute(pathname);
  const matchesAdminRoute = isAdminRoute(pathname);
  const matchesProtectedRoute = matchesDashboardRoute || matchesAdminRoute;

  if (hostType === 'localhost') {
    if (!isAuthenticated && matchesProtectedRoute) {
      return redirectToLoginForHost(url, rawHost, pathname);
    }

    if (!isAuthenticated && pathname === '/') {
      return redirectToHost(url, rawHost, '/login');
    }

    const currentUser = parseUserCookie(request);
    const target = resolveUserDomainTarget(currentUser);

    if (isAuthenticated && isLoginRoute) {
      const nextPath = target === 'admin' ? ADMIN_DEFAULT_PATH : APP_DEFAULT_PATH;
      return redirectToHost(url, rawHost, nextPath);
    }

    if (isAuthenticated && pathname === '/') {
      const nextPath = target === 'admin' ? ADMIN_DEFAULT_PATH : APP_DEFAULT_PATH;
      return redirectToHost(url, rawHost, nextPath);
    }

    if (isAuthenticated && target === 'admin' && !matchesAdminRoute) {
      return redirectToHost(url, rawHost, ADMIN_DEFAULT_PATH);
    }

    if (isAuthenticated && target === 'app' && matchesAdminRoute) {
      return redirectToHost(url, rawHost, APP_DEFAULT_PATH);
    }

    return nextWithDataMode(request);
  }

  if (!isAuthenticated) {
    if (hostType === 'public') {
      if (isLoginRoute || matchesDashboardRoute) {
        return redirectToHost(url, appHost, pathname, url.searchParams);
      }

      if (matchesAdminRoute) {
        return redirectToLoginForHost(url, adminHost, pathname);
      }

      return nextWithDataMode(request);
    }

    if (hostType === 'app') {
      if (matchesPublicRoute && pathname !== '/') {
        return redirectToHost(url, publicHost, pathname, url.searchParams);
      }

      if (pathname === '/') {
        return redirectToHost(url, appHost, '/login');
      }

      if (matchesDashboardRoute) {
        return redirectToLoginForHost(url, appHost, pathname);
      }

      if (matchesAdminRoute) {
        return redirectToLoginForHost(url, adminHost, pathname);
      }

      return nextWithDataMode(request);
    }

    if (hostType === 'admin') {
      if (matchesPublicRoute && pathname !== '/') {
        return redirectToHost(url, publicHost, pathname, url.searchParams);
      }

      if (pathname === '/') {
        return redirectToHost(url, adminHost, '/login');
      }

      if (matchesAdminRoute) {
        return redirectToLoginForHost(url, adminHost, pathname);
      }

      if (matchesDashboardRoute) {
        return redirectToLoginForHost(url, appHost, pathname);
      }

      return nextWithDataMode(request);
    }

    return nextWithDataMode(request);
  }

  const currentUser = parseUserCookie(request);
  const domainTarget = resolveUserDomainTarget(currentUser);
  const targetHost = domainTarget === 'admin' ? adminHost : appHost;

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

  if (pathname === '/') {
    return redirectToHost(url, targetHost, domainTarget === 'admin' ? ADMIN_DEFAULT_PATH : APP_DEFAULT_PATH);
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
    '/((?!_next/static|_next/image|favicon.ico|icons|logo|manifest).*)',
  ],
};
