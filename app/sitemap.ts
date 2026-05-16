import fs from 'fs';
import path from 'path';
import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';
import { listPathwaySlugs } from '@/lib/pathway-content';

/** Last modified time of a pathway markdown file (falls back to build time). */
function pathwayLastModified(slug: string, fallback: Date): Date {
  const filePath = path.join(process.cwd(), 'content', 'pathways', `${slug}.md`);
  try {
    return fs.statSync(filePath).mtime;
  } catch {
    return fallback;
  }
}

// Public, indexable routes only. Deliberately excludes /admin, /api, and the
// gated /members/[category] (and auth routes). Demo pathway previews are
// included — they carry full guide content for organic discovery.
export default function sitemap(): MetadataRoute.Sitemap {
  const buildTime = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: buildTime, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/recruiters`, lastModified: buildTime, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE_URL}/scam-warnings`, lastModified: buildTime, changeFrequency: 'monthly', priority: 0.7 },
  ];

  const demoRoutes: MetadataRoute.Sitemap = listPathwaySlugs().map(slug => ({
    url: `${SITE_URL}/demo/${slug}`,
    lastModified: pathwayLastModified(slug, buildTime),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [...staticRoutes, ...demoRoutes];
}
