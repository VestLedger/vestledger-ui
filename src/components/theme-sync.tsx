'use client';

import { useEffect } from 'react';
import { useTheme } from 'next-themes';

const THEME_COOKIE = 'vl-theme';

function readCookie(name: string) {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function getCookieDomain(hostname: string) {
  if (!hostname || hostname === 'localhost') return null;
  if (/^\\d{1,3}(?:\\.\\d{1,3}){3}$/.test(hostname)) return null;
  const baseHost = hostname.startsWith('app.') ? hostname.slice(4) : hostname;
  if (baseHost === 'localhost') return null;
  return baseHost;
}

function writeThemeCookie(value: string) {
  if (typeof document === 'undefined') return;
  const domain = getCookieDomain(window.location.hostname);
  let cookie = `${THEME_COOKIE}=${encodeURIComponent(value)}; path=/; max-age=31536000; SameSite=Lax`;
  if (domain) {
    cookie += `; domain=.${domain}`;
  }
  document.cookie = cookie;
}

export function ThemeSync() {
  const { theme, resolvedTheme, setTheme } = useTheme();

  useEffect(() => {
    const cookieTheme = readCookie(THEME_COOKIE);
    if (cookieTheme === 'light' || cookieTheme === 'dark') {
      setTheme(cookieTheme);
    }
  }, [setTheme]);

  useEffect(() => {
    const effectiveTheme = theme === 'system' ? resolvedTheme : theme;
    if (effectiveTheme === 'light' || effectiveTheme === 'dark') {
      writeThemeCookie(effectiveTheme);
    }
  }, [theme, resolvedTheme]);

  return null;
}
