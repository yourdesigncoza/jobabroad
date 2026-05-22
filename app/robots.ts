import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Private surfaces: admin tooling, API routes, and token-gated member
      // pages. Public pathway previews stay crawlable for organic discovery.
      disallow: ['/admin', '/api/', '/members/'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
