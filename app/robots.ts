import type { MetadataRoute } from 'next';
import { resolvePublicSeoBaseUrl } from './seo-routes';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = resolvePublicSeoBaseUrl();

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/app/', '/admin/', '/super-admin/', '/dashboard/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
