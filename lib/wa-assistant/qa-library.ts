import { marked } from 'marked';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { Pattern } from './schema';

const QA_LIBRARY_PATH = path.join(
  process.cwd(),
  'docs/whatsapp-notes/qa-library.md',
);

export function getQaLibraryPath(): string {
  return QA_LIBRARY_PATH;
}

export async function loadLibraryRaw(): Promise<string> {
  return readFile(QA_LIBRARY_PATH, 'utf8');
}

type PartialPattern = Partial<Pattern> & {
  name?: string;
  slug?: string;
  usedBy?: string[];
};

const KNOWN_LABELS = new Set([
  'id',
  'question shapes',
  'likely categories',
  'reply template',
  'follow-up question',
  'upsell hook',
  'upsell hook (internal)',
  'used by',
]);

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function stripQuotes(s: string): string {
  return s.replace(/^["']|["']$/g, '').trim();
}

function parseInlineCodeList(s: string): string[] {
  return Array.from(s.matchAll(/`([^`]+)`/g)).map((m) => m[1]);
}

function normaliseLabel(raw: string): string {
  return raw.trim().toLowerCase().replace(/\s+/g, ' ');
}

export async function loadPatterns(): Promise<Pattern[]> {
  const raw = await loadLibraryRaw();
  const tokens = marked.lexer(raw) as Array<{
    type: string;
    depth?: number;
    text?: string;
    items?: Array<{ text: string }>;
  }>;

  const patterns: Pattern[] = [];
  let current: PartialPattern | null = null;
  let pendingLabel: string | null = null;

  const tryPush = (p: PartialPattern | null) => {
    if (!p) return;
    if (!p.id) {
      console.warn(
        `[wa-assistant] skipping pattern "${p.name ?? 'unnamed'}": no **ID:** found`,
      );
      return;
    }
    if (!p.name || !p.replyTemplate) {
      console.warn(
        `[wa-assistant] skipping pattern ${p.id}: missing name or replyTemplate`,
      );
      return;
    }
    patterns.push({
      id: p.id,
      slug: p.slug ?? slugify(p.name),
      name: p.name,
      questionShapes: p.questionShapes ?? [],
      likelyCategories: p.likelyCategories ?? [],
      replyTemplate: p.replyTemplate,
      followUp: p.followUp ?? '',
      upsellHook: p.upsellHook ?? '',
      usedBy: p.usedBy ?? [],
    });
  };

  for (const token of tokens) {
    if (token.type === 'heading' && token.depth === 2) {
      tryPush(current);
      const name = token.text ?? '';
      current = { name, slug: slugify(name), usedBy: [] };
      pendingLabel = null;
      continue;
    }
    if (!current) continue;

    if (token.type === 'paragraph') {
      const text = token.text ?? '';
      const labelMatch = text.match(/^\*\*([^*:]+):\*\*\s*([\s\S]*)$/);
      if (labelMatch) {
        const label = normaliseLabel(labelMatch[1]);
        const inline = labelMatch[2].trim();
        if (label === 'id') {
          const idMatch = inline.match(/^(pat_[a-z0-9_]+)/);
          if (idMatch) current.id = idMatch[1];
          pendingLabel = null;
          continue;
        }
        if (KNOWN_LABELS.has(label)) {
          if (inline) {
            applyInline(current, label, inline);
            pendingLabel = null;
          } else {
            pendingLabel = label;
          }
          continue;
        }
        pendingLabel = null;
        continue;
      }
      const bareLabel = text.match(/^\*\*([^*:]+)\*\*\s*(?:\([\s\S]*\))?\s*$/);
      if (bareLabel) {
        const label = normaliseLabel(bareLabel[1]);
        if (KNOWN_LABELS.has(label)) {
          pendingLabel = label;
          continue;
        }
      }
      continue;
    }

    if (token.type === 'list' && pendingLabel && token.items) {
      const items = token.items.map((i) => stripQuotes(i.text.trim()));
      applyList(current, pendingLabel, items);
      pendingLabel = null;
      continue;
    }

    if (token.type === 'blockquote' && pendingLabel === 'reply template') {
      current.replyTemplate = (token.text ?? '').trim();
      pendingLabel = null;
      continue;
    }
  }

  tryPush(current);
  return patterns;
}

function applyInline(
  p: PartialPattern,
  label: string,
  value: string,
): void {
  switch (label) {
    case 'likely categories': {
      const items = parseInlineCodeList(value);
      p.likelyCategories = items.length ? items : [];
      break;
    }
    case 'follow-up question':
      p.followUp = stripQuotes(value);
      break;
    case 'upsell hook':
    case 'upsell hook (internal)':
      p.upsellHook = value;
      break;
    case 'used by': {
      const items = parseInlineCodeList(value);
      p.usedBy = items.length ? items : [value];
      break;
    }
    case 'question shapes':
      p.questionShapes = [stripQuotes(value)];
      break;
  }
}

function applyList(
  p: PartialPattern,
  label: string,
  items: string[],
): void {
  switch (label) {
    case 'question shapes':
      p.questionShapes = items;
      break;
    case 'likely categories':
      p.likelyCategories = items.map((s) => s.replace(/[`,]/g, '').trim());
      break;
    case 'used by':
      p.usedBy = items;
      break;
  }
}

export async function loadPatternIndex(): Promise<Map<string, Pattern>> {
  const patterns = await loadPatterns();
  return new Map(patterns.map((p) => [p.id, p]));
}
