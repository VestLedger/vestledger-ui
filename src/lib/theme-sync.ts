'use client';

const THEME_COOKIE_NAME = 'vestledger-theme';

/**
 * Get theme preference from cookie
 * Returns 'light', 'dark', or null if not set
 */
export function getThemeFromCookie(): 'light' | 'dark' | null {
  if (typeof document === 'undefined') return null;

  const cookies = document.cookie.split('; ');
  const themeCookie = cookies.find(c => c.startsWith(`${THEME_COOKIE_NAME}=`));

  if (!themeCookie) return null;

  const value = themeCookie.split('=')[1];
  return value === 'light' || value === 'dark' ? value : null;
}

/**
 * Set theme preference in cookie
 * For production: Sets domain=.vestledger.com (shared across subdomains)
 * For localhost: No domain attribute (localhost-only cookie)
 */
export function setThemeCookie(theme: 'light' | 'dark') {
  if (typeof document === 'undefined') return;

  // Get the base domain (vestledger.com from app.vestledger.com or www.vestledger.com)
  const hostname = window.location.hostname;
  const parts = hostname.split('.');

  // For localhost, don't set domain attribute
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';

  // For production, use base domain with leading dot (.vestledger.com)
  // This makes the cookie accessible to both root domain and all subdomains
  const baseDomain = isLocalhost ? '' : `.${parts.slice(-2).join('.')}`;

  const cookieString = isLocalhost
    ? `${THEME_COOKIE_NAME}=${theme}; path=/; max-age=31536000; SameSite=Lax`
    : `${THEME_COOKIE_NAME}=${theme}; path=/; domain=${baseDomain}; max-age=31536000; SameSite=Lax`;

  document.cookie = cookieString;
}
