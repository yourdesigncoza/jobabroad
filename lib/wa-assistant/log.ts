import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import type { LogInput } from './schema';

const NOTES_DIR = path.join(process.cwd(), 'docs/whatsapp-notes');
const CONVERSATIONS_DIR = path.join(NOTES_DIR, 'conversations');
const CONTACTS_PATH = path.join(NOTES_DIR, 'contacts.md');

export type LogResult = {
  threadPath: string;
  threadRelative: string;
  created: boolean;
  turnNumber: number;
};

function isoDate(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function blockquote(text: string): string {
  return text
    .split('\n')
    .map((line) => (line.trim() === '' ? '>' : `> ${line}`))
    .join('\n');
}

function threadFilePath(phone: string): string {
  return path.join(CONVERSATIONS_DIR, `${phone}.md`);
}

function buildHeaderBlock(input: LogInput, date: string): string {
  const status = input.status ?? 'replied';
  const category = input.categoryInterest ?? 'unclear';
  return [
    `# ${input.phone}`,
    '',
    `- **First contact:** ${date}`,
    `- **Status:** ${status}`,
    `- **Category interest:** \`${category}\``,
    `- **Notes:** _to fill in_`,
    '',
    '---',
    '',
  ].join('\n');
}

function buildTurnBlock(
  input: LogInput,
  date: string,
  turnNumber: number,
): string {
  const heading =
    turnNumber === 1
      ? `## ${date} — inbound`
      : `## ${date} — inbound (reply ${turnNumber})`;
  return [
    heading,
    '',
    blockquote(input.inbound),
    '',
    '### Matched pattern',
    '',
    `\`qa-library.md\` → **"${input.matchedPatternName}"** (\`${input.matchedPatternId}\`)`,
    '',
    '### Drafted reply',
    '',
    blockquote(input.draftReply),
    '',
    '### Follow-up question logged',
    '',
    `"${input.followUpQuestion}" → captures intent.`,
    '',
  ].join('\n');
}

async function countExistingTurns(filePath: string): Promise<number> {
  try {
    const raw = await readFile(filePath, 'utf8');
    const matches = raw.match(/^## \d{4}-\d{2}-\d{2} — inbound/gm);
    return matches?.length ?? 0;
  } catch {
    return 0;
  }
}

async function ensureContactsHeader(): Promise<void> {
  if (existsSync(CONTACTS_PATH)) return;
  const seed = [
    '# Contact Registry',
    '',
    'One row per contact. Status values: `new`, `replied`, `qualified`, `registered`, `paid`, `cold`, `closed`.',
    '',
    '| Phone | First contact | Category interest | Status | Thread |',
    '|---|---|---|---|---|',
    '',
  ].join('\n');
  await writeFile(CONTACTS_PATH, seed, 'utf8');
}

async function upsertContactRow(input: LogInput, date: string): Promise<void> {
  await ensureContactsHeader();
  const raw = await readFile(CONTACTS_PATH, 'utf8');
  const lines = raw.split('\n');

  const phoneCellRegex = new RegExp(`^\\|\\s*${input.phone}\\b`);
  const existingIdx = lines.findIndex((l) => phoneCellRegex.test(l));

  if (existingIdx !== -1) {
    // Preserve existing row values when the caller didn't explicitly pass new
    // ones. Stops a Log call (without category/status in the payload) from
    // wiping qualified contacts back to "unclear / replied".
    const cells = lines[existingIdx].split('|').map((c) => c.trim());
    // cells layout: ['', phone, firstContact, category, status, thread, '']
    const preservedFirstContact = cells[2] ?? date;
    const existingCategory = cells[3] ?? 'unclear';
    const existingStatus = cells[4] ?? 'replied';

    const category = input.categoryInterest ?? existingCategory;
    const status = input.status ?? existingStatus;

    lines[existingIdx] = `| ${input.phone} | ${preservedFirstContact} | ${category} | ${status} | [thread](conversations/${input.phone}.md) |`;
  } else {
    const status = input.status ?? 'replied';
    const category = input.categoryInterest ?? 'unclear';
    const row = `| ${input.phone} | ${date} | ${category} | ${status} | [thread](conversations/${input.phone}.md) |`;
    // Insert after the table separator (---|---|---) row.
    const sepIdx = lines.findIndex((l) => /^\|[-\s|]+\|$/.test(l.trim()));
    if (sepIdx !== -1) {
      lines.splice(sepIdx + 1, 0, row);
    } else {
      lines.push(row);
    }
  }
  await writeFile(CONTACTS_PATH, lines.join('\n'), 'utf8');
}

export async function logTurn(input: LogInput): Promise<LogResult> {
  await mkdir(CONVERSATIONS_DIR, { recursive: true });
  const filePath = threadFilePath(input.phone);
  const relative = path.relative(process.cwd(), filePath);
  const date = isoDate();
  const fileExists = existsSync(filePath);

  const existingTurnCount = await countExistingTurns(filePath);
  const turnNumber = existingTurnCount + 1;

  const turn = buildTurnBlock(input, date, turnNumber);
  const sep = turnNumber === 1 ? '' : '\n---\n\n';

  if (!fileExists) {
    const content = buildHeaderBlock(input, date) + turn;
    await writeFile(filePath, content, 'utf8');
  } else {
    const existing = await readFile(filePath, 'utf8');
    const append =
      (existing.endsWith('\n') ? '' : '\n') + sep + turn;
    await writeFile(filePath, existing + append, 'utf8');
  }

  await upsertContactRow(input, date);

  return {
    threadPath: filePath,
    threadRelative: relative,
    created: !fileExists,
    turnNumber,
  };
}
