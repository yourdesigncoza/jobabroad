import { Marked, Renderer } from 'marked';
import sanitizeHtml from 'sanitize-html';

const renderer = new Renderer();

renderer.link = ({ href, title, text }: { href: string; title?: string | null; text: string }) =>
  `<a href="${href}" target="_blank" rel="noopener noreferrer"${title ? ` title="${title}"` : ''}>${text}</a>`;

const wikiMarked = new Marked({ gfm: true, renderer });

const ALLOWED_TAGS = [
  ...sanitizeHtml.defaults.allowedTags,
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
  'del', 'ins', 'sup', 'sub',
];

export function renderWikiMarkdown(raw: string): string {
  const stripped = raw
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_, target, label) => `*${label ?? target}*`);
  const html = wikiMarked.parse(stripped, { async: false }) as string;
  return sanitizeHtml(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      '*': ['class', 'id'],
      a: ['href', 'target', 'rel'],
    },
  });
}
