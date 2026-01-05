import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const { pathname } = request.nextUrl;

  // Don't process middleware for Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Check authentication status from cookie
  const authCookie = request.cookies.get('isAuthenticated');
  const isAuthenticated = authCookie?.value === 'true';

  // Debug logging
  if (pathname === '/dashboard' || pathname === '/login') {
    console.log(`[Middleware] Auth check for ${hostname}${pathname}: cookie=${authCookie?.value}, isAuthenticated=${isAuthenticated}`);
  }

  // Parse hostname to detect subdomain
  // Examples:
  // - 'app.localhost:3000' -> subdomain: 'app', baseDomain: 'localhost:3000'
  // - 'localhost:3000' -> subdomain: '', baseDomain: 'localhost:3000'
  // - 'app.vestledger.com' -> subdomain: 'app', baseDomain: 'vestledger.com'
  const hostWithoutPort = hostname.split(':')[0];
  const parts = hostWithoutPort.split('.');

  let subdomain = '';
  let baseDomain = hostname;

  // If we have more than one part (e.g., 'app.localhost' or 'app.vestledger.com')
  if (parts.length >= 2) {
    // Check if first part is 'app'
    if (parts[0] === 'app') {
      subdomain = 'app';
      // Reconstruct baseDomain by removing 'app.' and adding back port if exists
      const port = hostname.includes(':') ? ':' + hostname.split(':')[1] : '';
      baseDomain = parts.slice(1).join('.') + port;
    }
  }

  const isOnAppSubdomain = subdomain === 'app';

  // Define route types
  const publicRoutes = [
    '/',
    '/features',
    '/about',
    '/how-it-works',
    '/security',
    '/eoi',
  ];

  const isPublicRoute = publicRoutes.some(route =>
    pathname === route || pathname.startsWith(route + '/')
  );

  const isDashboardRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/pipeline') ||
    pathname.startsWith('/portfolio') ||
    pathname.startsWith('/analytics') ||
    pathname.startsWith('/fund-admin') ||
    pathname.startsWith('/tax-center') ||
    pathname.startsWith('/compliance') ||
    pathname.startsWith('/documents') ||
    pathname.startsWith('/contacts') ||
    pathname.startsWith('/dealflow-review') ||
    pathname.startsWith('/deal-intelligence') ||
    pathname.startsWith('/lp-management') ||
    pathname.startsWith('/integrations') ||
    pathname.startsWith('/settings') ||
    pathname.startsWith('/notifications') ||
    pathname.startsWith('/reports') ||
    pathname.startsWith('/waterfall') ||
    pathname.startsWith('/ai-tools') ||
    pathname.startsWith('/409a-valuations') ||
    pathname.startsWith('/audit-trail');

  // Routing logic:
  // Main domain (vestledger.com or localhost:3000):
  //   - All routes are PUBLIC and accessible without authentication
  //   - Dashboard routes redirect to app subdomain
  //
  // App subdomain (app.vestledger.com or app.localhost:3000):
  //   - All routes REQUIRE authentication except /login
  //   - Public marketing routes redirect to main domain
  //   - Unauthenticated users accessing protected routes -> redirect to /login
  //   - Authenticated users at / -> redirect to /dashboard
  //
  // Rule 1: Redirect dashboard routes from main domain to app subdomain
  // Rule 2: Redirect public routes from app subdomain to main domain (except / and /login)
  // Rule 3: Require authentication for all app subdomain routes (except /login and /)
  // Rule 4: Redirect authenticated users from app.domain.com/ to /dashboard

  // Rule 1: Redirect dashboard routes from main domain to app subdomain
  if (!isOnAppSubdomain && isDashboardRoute) {
    const url = request.nextUrl.clone();
    const appHostname = `app.${hostname}`;
    url.host = appHostname;
    console.log(`[Middleware] Redirecting from ${hostname}${pathname} to ${appHostname}${pathname}`);
    return NextResponse.redirect(url);
  }

  // Rule 2: On app subdomain, redirect public marketing pages to main domain
  // BUT allow root path (/) and /login on app subdomain for authentication
  if (isOnAppSubdomain && isPublicRoute && pathname !== '/' && pathname !== '/login') {
    const url = request.nextUrl.clone();
    url.host = baseDomain;
    console.log(`[Middleware] Redirecting public route from ${hostname}${pathname} to ${baseDomain}${pathname}`);
    return NextResponse.redirect(url);
  }

  // Rule 3: On app subdomain at /, redirect based on authentication status
  if (isOnAppSubdomain && pathname === '/') {
    const url = request.nextUrl.clone();
    if (isAuthenticated) {
      // Authenticated users go to dashboard
      url.pathname = '/dashboard';
      console.log(`[Middleware] Authenticated user at ${hostname}/, redirecting to /dashboard`);
    } else {
      // Unauthenticated users go to login
      url.pathname = '/login';
      console.log(`[Middleware] Unauthenticated user at ${hostname}/, redirecting to /login`);
    }
    return NextResponse.redirect(url);
  }

  // Rule 4: On app subdomain, redirect to /login if not authenticated
  // Allow only /login for unauthenticated users
  if (isOnAppSubdomain && !isAuthenticated && pathname !== '/login') {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    console.log(`[Middleware] Unauthenticated access to ${hostname}${pathname}, redirecting to /login`);
    return NextResponse.redirect(url);
  }

  // Allow request to proceed
  console.log(`[Middleware] Allowing ${hostname}${pathname}`);
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Files with extensions (e.g., .css, .js, .svg, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
