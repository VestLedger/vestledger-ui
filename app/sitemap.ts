import type { MetadataRoute } from 'next';
import { PUBLIC_SITEMAP_PATHS, resolvePublicSeoBaseUrl } from './seo-routes';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = resolvePublicSeoBaseUrl();
  const now = new Date();

  return PUBLIC_SITEMAP_PATHS.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: now,
    changeFrequency: path === '/' ? 'weekly' : 'monthly',
    priority: path === '/' ? 1 : 0.8,
  }));
}
