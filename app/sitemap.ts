import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

// Public, indexable routes only. Deliberately excludes /admin, /api,
// /members/[token] (private) and /demo/[category] (noindex previews).
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    {
      url: SITE_URL,
      lastModified,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${SITE_URL}/recruiters`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/scam-warnings`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];
}
