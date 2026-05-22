import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { renderMarkdown, type RenderedMarkdown, type TocItem } from './markdown';

export type { TocItem };
export type PathwayContent = RenderedMarkdown;

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
  const { content } = matter(fs.readFileSync(filePath, 'utf-8'));
  return renderMarkdown(content);
}
