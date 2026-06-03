import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { renderMarkdown, type RenderedMarkdown, type TocItem } from './markdown';
import type { Faq } from './schema';

export type { TocItem };

/** Optional YAML frontmatter on a pathway markdown file. */
export interface PathwayFrontmatter {
  /** Structured FAQ — rendered on-page and as FAQPage JSON-LD. */
  faqs?: Faq[];
}

export interface PathwayContent extends RenderedMarkdown {
  frontmatter: PathwayFrontmatter;
}

/** Slugs (without `.md`) of every pathway guide currently shipped in /content/pathways. */
export function listPathwaySlugs(): string[] {
  const dir = path.join(process.cwd(), 'content', 'pathways');
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter(f => f.endsWith('.md'))
    .map(f => f.replace(/\.md$/, ''))
    .sort();
}

export function getPathwayContent(category: string): PathwayContent | null {
  const filePath = path.join(process.cwd(), 'content', 'pathways', `${category}.md`);
  if (!fs.existsSync(filePath)) return null;
  const { data, content } = matter(fs.readFileSync(filePath, 'utf-8'));
  return { frontmatter: data as PathwayFrontmatter, ...renderMarkdown(content) };
}
