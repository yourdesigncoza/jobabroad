import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';
import { listPathwaySlugs } from '@/lib/pathway-content';

// Public, indexable routes only. Deliberately excludes /admin, /api,
// /members/[token] (private). Demo pathway previews are included — they
// carry full guide content and are intended for organic discovery.
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/recruiters`, lastModified, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE_URL}/scam-warnings`, lastModified, changeFrequency: 'monthly', priority: 0.7 },
  ];

  const demoRoutes: MetadataRoute.Sitemap = listPathwaySlugs().map(slug => ({
    url: `${SITE_URL}/demo/${slug}`,
    lastModified,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [...staticRoutes, ...demoRoutes];
}
