import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { renderMarkdown, type TocItem } from './markdown';

const COMPARE_DIR = path.join(process.cwd(), 'content', 'compare');

export interface CompareFaq {
  q: string;
  a: string;
}

export interface CompareOption {
  /** Anchor text, e.g. "Registered Nurse → Ireland". */
  label: string;
  /** Internal href to the route or blog being compared. */
  href: string;
}

export interface CompareFrontmatter {
  title: string;
  description: string;
  /** Primary target keyword — shown as the page kicker. */
  primaryKeyword: string;
  /** Pathway category slug — drives the pillar up-link + register CTA. */
  category: string;
  /** The routes/pages this comparison weighs up (rendered as links). */
  options: CompareOption[];
  /** ISO date (YYYY-MM-DD). */
  published?: string;
  updated?: string;
  lastVerified?: string;
  faqs?: CompareFaq[];
}

export interface ComparePage {
  slug: string;
  frontmatter: CompareFrontmatter;
  html: string;
  toc: TocItem[];
  readTime: number;
}

/** Slugs (without `.md`) of every comparison page in /content/compare. */
export function listCompareSlugs(): string[] {
  if (!fs.existsSync(COMPARE_DIR)) return [];
  return fs
    .readdirSync(COMPARE_DIR)
    .filter(f => f.endsWith('.md'))
    .map(f => f.replace(/\.md$/, ''))
    .sort();
}

export function getComparePage(slug: string): ComparePage | null {
  const filePath = path.join(COMPARE_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;
  const { data, content } = matter(fs.readFileSync(filePath, 'utf-8'));
  const fm = data as CompareFrontmatter;
  if (!fm.title || !fm.description || !fm.category) return null;
  return { slug, frontmatter: fm, ...renderMarkdown(content) };
}

/** Last-modified time of a comparison's markdown (falls back to provided default). */
export function compareLastModified(slug: string, fallback: Date): Date {
  const filePath = path.join(COMPARE_DIR, `${slug}.md`);
  try {
    return fs.statSync(filePath).mtime;
  } catch {
    return fallback;
  }
}
