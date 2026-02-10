import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { DATA_MODE_OVERRIDE_KEY } from '@/config/data-mode';

function nextWithDataMode(request: NextRequest) {
  const override = request.cookies.get(DATA_MODE_OVERRIDE_KEY)?.value;
  if (override === 'mock' || override === 'api') {
    const headers = new Headers(request.headers);
    headers.set('x-vestledger-data-mode', override);
    return NextResponse.next({ request: { headers } });
  }
  return NextResponse.next();
}

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host') || '';

  // Extract subdomain
  // localhost and 127.0.0.1 are treated as special case for Lighthouse testing
  const isLocalhost = hostname === 'localhost:3000' || hostname === '127.0.0.1:3000' || hostname === 'localhost' || hostname === '127.0.0.1';

  // Check if this is the app subdomain
  // Works for: app.vestledger.local:3000, app.vestledger.com, app.domain.com, etc.
  const isApp = !isLocalhost && hostname.startsWith('app.');

  // Public domain is everything that's not app subdomain or localhost
  const isPublic = !isApp && !isLocalhost;

  // Get auth status from cookies (middleware runs on Edge, no localStorage)
  const isAuthenticated = request.cookies.get('isAuthenticated')?.value === 'true';

  // Define route categories
  const publicRoutes = ['/', '/features', '/how-it-works', '/security', '/about', '/eoi'];
  const authRoutes = ['/login'];
  const isDashboardRoute = (path: string) =>
    path.startsWith('/home') ||
    path.startsWith('/portfolio') ||
    path.startsWith('/analytics') ||
    path.startsWith('/pipeline') ||
    path.startsWith('/lp-management') ||
    path.startsWith('/fund-admin') ||
    path.startsWith('/documents') ||
    path.startsWith('/reports') ||
    path.startsWith('/compliance') ||
    path.startsWith('/audit-trail') ||
    path.startsWith('/409a-valuations') ||
    path.startsWith('/integrations') ||
    path.startsWith('/settings') ||
    path.startsWith('/tax-center') ||
    path.startsWith('/waterfall') ||
    path.startsWith('/ai-tools') ||
    path.startsWith('/notifications') ||
    path.startsWith('/deal-intelligence') ||
    path.startsWith('/dealflow-review') ||
    path.startsWith('/contacts') ||
    path.startsWith('/lp-portal');

  const pathname = url.pathname;

  // Skip middleware for static files and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('/icons/') ||
    pathname.includes('/logo/') ||
    pathname.includes('/manifest') ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|webp|gif|css|js)$/)
  ) {
    return nextWithDataMode(request);
  }

  // For localhost Lighthouse testing: check if this is dashboard route (app domain) or public route
  if (isLocalhost) {
    const isAppRoute = isDashboardRoute(pathname) || pathname === '/login' || pathname === '/';
    // If it's a dashboard route on localhost, treat as app domain
    // If it's a public route on localhost, treat as public domain
    // This allows Lighthouse to test both domains via localhost
    if (isAppRoute && !isAuthenticated && pathname !== '/login' && pathname !== '/') {
      // Redirect to login for unauthenticated dashboard access
      url.pathname = '/login';
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }

    if (pathname === '/' && !isAuthenticated) {
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }

    if (pathname === '/' && isAuthenticated) {
      url.pathname = '/home';
      return NextResponse.redirect(url);
    }

    // Allow all other localhost requests through
    return nextWithDataMode(request);
  }

  // Rule 1: Public domain should ONLY serve public pages
  // Check if pathname is exactly a public route or starts with a public route (excluding '/' root)
  const isPublicRoute = publicRoutes.includes(pathname) ||
                        publicRoutes.filter(route => route !== '/').some(route => pathname.startsWith(route));

  if (isPublic && !isPublicRoute) {
    // If accessing /login or dashboard routes on public domain, redirect to app subdomain
    if (pathname === '/login' || isDashboardRoute(pathname)) {
      // Extract just the domain part without port
      const [domain, port] = hostname.split(':');

      // Remove www. prefix if present, then add app. prefix
      // www.vestledger.com → app.vestledger.com
      // vestledger.com → app.vestledger.com
      // vestledger.local → app.vestledger.local
      const baseDomain = domain.replace(/^www\./, '');
      const appHostname = `app.${baseDomain}`;

      // Build the redirect URL
      const redirectUrl = new URL(url.toString());
      redirectUrl.hostname = appHostname;
      if (port) {
        redirectUrl.port = port;
      }
      return NextResponse.redirect(redirectUrl);
    }

    // For any other non-public route, show 404 (let Next.js handle it)
  }

  // Rule 2: App subdomain should NOT serve public pages (except homepage which redirects)
  if (isApp && publicRoutes.includes(pathname) && pathname !== '/') {
    // Redirect to public domain
    const [domain, port] = hostname.split(':');

    // Remove app. prefix: app.vestledger.com → vestledger.com
    // For production, you can add www. prefix if desired
    // Use environment variable to determine if www should be added
    const baseDomain = domain.replace(/^app\./, '');
    const publicHostname = process.env.NEXT_PUBLIC_USE_WWW === 'true' ? `www.${baseDomain}` : baseDomain;

    const redirectUrl = new URL(url.toString());
    redirectUrl.hostname = publicHostname;
    if (port) {
      redirectUrl.port = port;
    }
    return NextResponse.redirect(redirectUrl);
  }

  // Rule 3: Unauthenticated access to dashboard routes → redirect to login
  if (isApp && isDashboardRoute(pathname) && !isAuthenticated) {
    url.pathname = '/login';
    url.searchParams.set('redirect', pathname); // Store intended destination
    return NextResponse.redirect(url);
  }

  // Rule 4: Authenticated access to login page → let client-side handle redirect
  // (LoginForm component will handle this to avoid redirect loops)
  // if (isApp && pathname === '/login' && isAuthenticated) {
  //   const redirectTo = url.searchParams.get('redirect') || '/home';
  //   url.pathname = redirectTo;
  //   url.searchParams.delete('redirect');
  //   return NextResponse.redirect(url);
  // }

  // Rule 5: Root of app subdomain without auth → redirect to login
  if (isApp && pathname === '/' && !isAuthenticated) {
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Rule 6: Root of app subdomain with auth → redirect to home
  if (isApp && pathname === '/' && isAuthenticated) {
    url.pathname = '/home';
    return NextResponse.redirect(url);
  }

  return nextWithDataMode(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder assets
     */
    '/((?!_next/static|_next/image|favicon.ico|icons|logo|manifest).*)',
  ],
};
