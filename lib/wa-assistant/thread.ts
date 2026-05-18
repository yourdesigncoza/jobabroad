import { marked } from 'marked';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import type { Thread, ThreadTurn } from './schema';

export type { Thread, ThreadTurn } from './schema';

const CONVERSATIONS_DIR = path.join(
  process.cwd(),
  'docs/whatsapp-notes/conversations',
);

function threadFilePath(phone: string): string {
  return path.join(CONVERSATIONS_DIR, `${phone}.md`);
}

export function getThreadFilePath(phone: string): string {
  return threadFilePath(phone);
}

function parseHeaderField(text: string): { label: string; value: string } | null {
  // Matches "**Label:** value" — header bullet items use a leading hyphen +
  // the markdown bullet is stripped by marked.lexer when emitted as list items.
  const m = text.match(/^\*\*([^*:]+):\*\*\s*([\s\S]*)$/);
  if (!m) return null;
  return { label: m[1].trim().toLowerCase(), value: m[2].trim() };
}

function stripBackticks(s: string): string {
  return s.replace(/`/g, '').trim();
}

function turnNumberFromHeading(headingText: string): number {
  // "2026-05-18 — inbound" -> 1
  // "2026-05-18 — inbound (reply 2)" -> 2
  const replyMatch = headingText.match(/\(reply\s+(\d+)\)/i);
  if (replyMatch) return parseInt(replyMatch[1], 10);
  return 1;
}

function dateFromHeading(headingText: string): string {
  const m = headingText.match(/^(\d{4}-\d{2}-\d{2})/);
  return m ? m[1] : '';
}

function parseMatchedPatternParagraph(text: string): {
  name: string | null;
  id: string | null;
} {
  // Examples:
  // `qa-library.md` → **"matric-only, broad overseas enquiry"**
  // `qa-library.md` → **"matric-only, broad overseas enquiry"** (`pat_matric_first_touch`)
  const nameMatch = text.match(/\*\*"?([^"*]+?)"?\*\*/);
  const idMatch = text.match(/`(pat_[a-z0-9_]+|new-pattern-needed)`/);
  return {
    name: nameMatch ? nameMatch[1].trim() : null,
    id: idMatch ? idMatch[1] : null,
  };
}

export async function loadThread(phone: string): Promise<Thread> {
  const filePath = threadFilePath(phone);
  if (!existsSync(filePath)) {
    return {
      phone,
      exists: false,
      status: null,
      categoryInterest: null,
      notes: null,
      turns: [],
    };
  }
  const raw = await readFile(filePath, 'utf8');
  return parseThread(phone, raw);
}

export function parseThread(phone: string, raw: string): Thread {
  const tokens = marked.lexer(raw) as Array<{
    type: string;
    depth?: number;
    text?: string;
    items?: Array<{ text: string }>;
  }>;

  let status: string | null = null;
  let categoryInterest: string | null = null;
  let notes: string | null = null;

  const turns: ThreadTurn[] = [];
  let currentTurn: Partial<ThreadTurn> | null = null;
  let pendingSection: 'inbound' | 'matched' | 'draft' | 'followup' | null = null;

  const pushTurn = () => {
    if (!currentTurn) return;
    turns.push({
      turnNumber: currentTurn.turnNumber ?? turns.length + 1,
      date: currentTurn.date ?? '',
      inbound: currentTurn.inbound ?? '',
      matchedPatternName: currentTurn.matchedPatternName ?? null,
      matchedPatternId: currentTurn.matchedPatternId ?? null,
      draftReply: currentTurn.draftReply ?? null,
      followUpLog: currentTurn.followUpLog ?? null,
    });
  };

  for (const token of tokens) {
    // Header metadata bullets sit inside a list token at the top.
    if (token.type === 'list' && !currentTurn && token.items) {
      for (const item of token.items) {
        const f = parseHeaderField(item.text);
        if (!f) continue;
        if (f.label === 'status') status = f.value;
        else if (f.label === 'category interest') {
          categoryInterest = stripBackticks(f.value);
        } else if (f.label === 'notes') notes = f.value;
      }
      continue;
    }

    if (token.type === 'heading' && token.depth === 2) {
      // New turn boundary.
      if (currentTurn) pushTurn();
      const headingText = token.text ?? '';
      if (!/^\d{4}-\d{2}-\d{2}/.test(headingText)) {
        currentTurn = null;
        continue;
      }
      currentTurn = {
        turnNumber: turnNumberFromHeading(headingText),
        date: dateFromHeading(headingText),
      };
      pendingSection = 'inbound';
      continue;
    }

    if (!currentTurn) continue;

    if (token.type === 'heading' && token.depth === 3) {
      const t = (token.text ?? '').toLowerCase();
      if (t.includes('matched pattern')) pendingSection = 'matched';
      else if (t.includes('drafted reply')) pendingSection = 'draft';
      else if (t.includes('follow-up question')) pendingSection = 'followup';
      else pendingSection = null;
      continue;
    }

    if (token.type === 'blockquote') {
      const text = (token.text ?? '').trim();
      if (pendingSection === 'inbound') {
        currentTurn.inbound = text;
        pendingSection = null;
      } else if (pendingSection === 'draft') {
        currentTurn.draftReply = text;
        pendingSection = null;
      }
      continue;
    }

    if (token.type === 'paragraph') {
      const text = (token.text ?? '').trim();
      if (pendingSection === 'matched') {
        const parsed = parseMatchedPatternParagraph(text);
        currentTurn.matchedPatternName = parsed.name;
        currentTurn.matchedPatternId = parsed.id;
        pendingSection = null;
      } else if (pendingSection === 'followup') {
        currentTurn.followUpLog = text;
        pendingSection = null;
      }
      continue;
    }
  }

  if (currentTurn) pushTurn();

  return {
    phone,
    exists: true,
    status,
    categoryInterest,
    notes,
    turns,
  };
}

/**
 * Serialise a Thread into the priorContext string format the draft endpoint
 * expects. Compact representation — one block per turn, alternating "Inbound:"
 * and "Our reply:" lines.
 */
export function serialiseThreadForPrompt(thread: Thread): string {
  if (!thread.exists || thread.turns.length === 0) return '';
  return thread.turns
    .map((t) => {
      const lines = [`Inbound (${t.date}): ${t.inbound}`];
      if (t.draftReply) {
        lines.push(`Our reply: ${t.draftReply.replace(/\n+/g, ' ')}`);
      }
      return lines.join('\n');
    })
    .join('\n\n');
}
