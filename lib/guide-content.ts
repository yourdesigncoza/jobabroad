import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { renderMarkdown, type TocItem } from './markdown';

const GUIDES_DIR = path.join(process.cwd(), 'content', 'guides');

export interface GuideFaq {
  q: string;
  a: string;
}

export interface GuideFrontmatter {
  title: string;
  description: string;
  /** Short kicker shown above the title. */
  kicker?: string;
  /** ISO date (YYYY-MM-DD) the facts were last verified against source. */
  lastVerified?: string;
  faqs?: GuideFaq[];
}

export interface GuidePage {
  slug: string;
  frontmatter: GuideFrontmatter;
  html: string;
  toc: TocItem[];
  readTime: number;
}

/** Slugs (without `.md`) of every support guide in /content/guides. */
export function listGuideSlugs(): string[] {
  if (!fs.existsSync(GUIDES_DIR)) return [];
  return fs
    .readdirSync(GUIDES_DIR)
    .filter(f => f.endsWith('.md'))
    .map(f => f.replace(/\.md$/, ''))
    .sort();
}

export function getGuidePage(slug: string): GuidePage | null {
  const filePath = path.join(GUIDES_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;
  const { data, content } = matter(fs.readFileSync(filePath, 'utf-8'));
  const fm = data as GuideFrontmatter;
  if (!fm.title || !fm.description) return null;
  return { slug, frontmatter: fm, ...renderMarkdown(content) };
}

/** Last-modified time of a guide's markdown (falls back to provided default). */
export function guideLastModified(slug: string, fallback: Date): Date {
  const filePath = path.join(GUIDES_DIR, `${slug}.md`);
  try {
    return fs.statSync(filePath).mtime;
  } catch {
    return fallback;
  }
}
