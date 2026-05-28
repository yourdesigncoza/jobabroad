import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { renderMarkdown, type TocItem } from './markdown';

const ROUTES_DIR = path.join(process.cwd(), 'content', 'routes');

export interface RouteFaq {
  q: string;
  a: string;
}

export interface RouteFrontmatter {
  title: string;
  description: string;
  /** Primary target keyword — shown as the page kicker. */
  primaryKeyword: string;
  /** One of the 11 pathway category slugs — drives the pillar up-link + register CTA. */
  category: string;
  role: string;
  country: string;
  /** Human-readable visa / permit route name. */
  routeType?: string;
  /** Verified official government / visa source. */
  officialSource?: string;
  /** Profession regulator (nursing council, trades body, etc.) where relevant. */
  regulatorSource?: string;
  /** ISO date (YYYY-MM-DD) the facts were last verified against source. */
  lastVerified?: string;
  /** ISO date (YYYY-MM-DD). */
  published?: string;
  /** ISO date (YYYY-MM-DD); falls back to `published`. */
  updated?: string;
  scamRisk?: string;
  /** Structured FAQ — rendered on-page and as FAQPage JSON-LD. */
  faqs?: RouteFaq[];
}

export interface RouteParams {
  role: string;
  country: string;
}

export interface RoutePage {
  role: string;
  country: string;
  frontmatter: RouteFrontmatter;
  html: string;
  toc: TocItem[];
  readTime: number;
}

/** Every `{role}/{country}` pair shipped under /content/routes. */
export function listRouteParams(): RouteParams[] {
  if (!fs.existsSync(ROUTES_DIR)) return [];
  const params: RouteParams[] = [];
  for (const role of fs.readdirSync(ROUTES_DIR)) {
    const roleDir = path.join(ROUTES_DIR, role);
    if (!fs.statSync(roleDir).isDirectory()) continue;
    for (const file of fs.readdirSync(roleDir)) {
      if (!file.endsWith('.md')) continue;
      params.push({ role, country: file.replace(/\.md$/, '') });
    }
  }
  return params.sort((a, b) =>
    `${a.role}/${a.country}` < `${b.role}/${b.country}` ? -1 : 1,
  );
}

export function getRoutePage(role: string, country: string): RoutePage | null {
  const filePath = path.join(ROUTES_DIR, role, `${country}.md`);
  if (!fs.existsSync(filePath)) return null;
  const { data, content } = matter(fs.readFileSync(filePath, 'utf-8'));
  const fm = data as RouteFrontmatter;
  if (!fm.title || !fm.description || !fm.category) return null;
  return { role, country, frontmatter: fm, ...renderMarkdown(content) };
}

/** Last-modified time of the underlying markdown (falls back to provided default). */
export function routeLastModified(role: string, country: string, fallback: Date): Date {
  const filePath = path.join(ROUTES_DIR, role, `${country}.md`);
  try {
    return fs.statSync(filePath).mtime;
  } catch {
    return fallback;
  }
}
