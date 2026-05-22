import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { renderMarkdown, type TocItem } from './markdown';

const BLOG_DIR = path.join(process.cwd(), 'content', 'blog');

export interface BlogFaq {
  q: string;
  a: string;
}

export interface BlogFrontmatter {
  title: string;
  description: string;
  /** Primary target keyword — shown as the article kicker. */
  primaryKeyword: string;
  /** ISO date (YYYY-MM-DD). */
  published: string;
  /** ISO date (YYYY-MM-DD); falls back to `published`. */
  updated?: string;
  /** Pathway category slug — drives the `/register?category=` CTA. */
  category?: string;
  /** Pillar page this article links up to. */
  pillarHref?: string;
  /** Anchor text for the pillar up-link. */
  pillarLabel?: string;
  /** Structured FAQ — rendered on-page and as FAQPage JSON-LD. */
  faqs?: BlogFaq[];
}

export interface BlogPost {
  slug: string;
  frontmatter: BlogFrontmatter;
  html: string;
  toc: TocItem[];
  readTime: number;
}

export interface BlogSummary {
  slug: string;
  frontmatter: BlogFrontmatter;
  readTime: number;
}

/** Slugs (without `.md`) of every article in /content/blog. */
export function listBlogSlugs(): string[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  return fs
    .readdirSync(BLOG_DIR)
    .filter(f => f.endsWith('.md'))
    .map(f => f.replace(/\.md$/, ''));
}

export function getBlogPost(slug: string): BlogPost | null {
  const filePath = path.join(BLOG_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;
  const { data, content } = matter(fs.readFileSync(filePath, 'utf-8'));
  const fm = data as BlogFrontmatter;
  if (!fm.title || !fm.description) return null;
  return { slug, frontmatter: fm, ...renderMarkdown(content) };
}

/** All articles, newest first — for the /blog index. */
export function getAllBlogPosts(): BlogSummary[] {
  return listBlogSlugs()
    .map(getBlogPost)
    .filter((p): p is BlogPost => p !== null)
    .sort((a, b) =>
      a.frontmatter.published < b.frontmatter.published ? 1 : -1,
    )
    .map(({ slug, frontmatter, readTime }) => ({ slug, frontmatter, readTime }));
}
