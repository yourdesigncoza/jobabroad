import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Private surfaces: admin tooling, API routes, and token-gated member
      // pages. /demo is left crawlable so its per-page noindex tag is honoured.
      disallow: ['/admin', '/api/', '/members/'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
