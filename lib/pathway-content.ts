import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';

export interface TocItem {
  id: string;
  text: string;
}

export interface PathwayContent {
  html: string;
  toc: TocItem[];
  readTime: number; // minutes
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

const toc: TocItem[] = [];

const renderer = new marked.Renderer();

renderer.heading = ({ depth, text }: { depth: number; text: string }) => {
  const plain = text.replace(/<[^>]+>/g, '');
  if (depth === 2) {
    const id = slugify(plain);
    toc.push({ id, text: plain });
    return `<h2 id="${id}">${text}</h2>`;
  }
  return `<h${depth}>${text}</h${depth}>`;
};

renderer.link = ({ href, title, text }: { href: string; title?: string | null; text: string }) =>
  `<a href="${href}" target="_blank" rel="noopener noreferrer"${title ? ` title="${title}"` : ''}>${text}</a>`;

marked.use({ gfm: true, renderer });

const ALLOWED_TAGS = [
  ...sanitizeHtml.defaults.allowedTags,
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
  'img', 'del', 'ins', 'sup', 'sub',
];

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

  toc.length = 0; // reset before each render

  // Strip HTML comments before tokenization — pipes inside <!-- src: a | b | c --> markers
  // would otherwise be parsed as table column separators, breaking surrounding cells.
  const stripped = content.replace(/<!--[\s\S]*?-->/g, '');

  const raw = marked(stripped) as string;

  const clean = sanitizeHtml(raw, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      '*': ['class', 'id'],
      a: ['href', 'target', 'rel'],
      img: ['src', 'alt', 'width', 'height'],
    },
  });

  const html = clean
    .replace(/<table>/g, '<div class="table-scroll"><table>')
    .replace(/<\/table>/g, '</table></div>');

  const wordCount = content.replace(/[#*_`\[\]()>-]/g, ' ').split(/\s+/).filter(Boolean).length;
  const readTime = Math.ceil(wordCount / 220);

  return { html, toc: [...toc], readTime };
}
