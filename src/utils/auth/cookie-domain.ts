export function getAuthCookieDomain(hostname?: string | null): string | null {
  if (!hostname) return null;
  if (hostname === 'localhost' || hostname.endsWith('.localhost')) return null;
  if (/^\d{1,3}(?:\.\d{1,3}){3}$/.test(hostname)) return null;
  const baseHost = hostname.replace(/^www\./, '').replace(/^(app|admin)\./, '');
  if (baseHost === 'localhost') return null;
  return `.${baseHost}`;
}
