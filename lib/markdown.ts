import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';

export interface TocItem {
  id: string;
  text: string;
}

export interface RenderedMarkdown {
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

// marked uses a shared renderer; `activeToc` collects h2 ids for the current
// render. Renders run synchronously and single-threaded during build, so
// resetting the buffer at the top of each render is safe.
let activeToc: TocItem[] = [];

const renderer = new marked.Renderer();

renderer.heading = ({ depth, text }: { depth: number; text: string }) => {
  const plain = text.replace(/<[^>]+>/g, '');
  if (depth === 2) {
    const id = slugify(plain);
    activeToc.push({ id, text: plain });
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

/**
 * Render trusted markdown to sanitised HTML, with an h2 table of contents and
 * an estimated read time. Shared by pathway guides and blog articles. The
 * custom renderer forces every link to open in a new tab — see the External
 * Links rule in CLAUDE.md.
 */
export function renderMarkdown(markdown: string): RenderedMarkdown {
  activeToc = []; // reset before each render

  // Strip HTML comments before tokenization — pipes inside <!-- a | b --> markers
  // would otherwise be parsed as table column separators, breaking surrounding cells.
  const stripped = markdown.replace(/<!--[\s\S]*?-->/g, '');

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

  const wordCount = markdown.replace(/[#*_`\[\]()>-]/g, ' ').split(/\s+/).filter(Boolean).length;
  const readTime = Math.ceil(wordCount / 220);

  return { html, toc: [...activeToc], readTime };
}
