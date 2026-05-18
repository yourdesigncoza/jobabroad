import { readFile, writeFile } from 'node:fs/promises';
import type { AddPatternInput } from './schema';
import { getQaLibraryPath, loadPatternIndex } from './qa-library';

export type AddPatternResult = { id: string; slug: string };

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function uniqueId(base: string, existing: Set<string>): string {
  if (!existing.has(base)) return base;
  let n = 2;
  while (existing.has(`${base}_${n}`)) n += 1;
  return `${base}_${n}`;
}

function buildPatternBlock(
  input: AddPatternInput,
  id: string,
): string {
  const categories = input.likelyCategories
    .map((c) => `\`${c.replace(/`/g, '')}\``)
    .join(', ');
  const shapes = input.questionShapes
    .map((s) => `- "${s.replace(/"/g, '\\"')}"`)
    .join('\n');
  const replyLines = input.replyTemplate
    .split('\n')
    .map((line) => (line.trim() === '' ? '>' : `> ${line}`))
    .join('\n');
  const upsell =
    input.upsellHook?.trim() ||
    '_to fill in once the pattern has been used a few times._';

  return [
    `## ${input.name}`,
    '',
    `**ID:** ${id}`,
    '',
    '**Question shapes**',
    shapes,
    '',
    `**Likely categories:** ${categories}`,
    '',
    '**Reply template**',
    '',
    replyLines,
    '',
    `**Follow-up question:** "${input.followUp.replace(/"/g, '\\"')}"`,
    '',
    `**Upsell hook (internal):** ${upsell}`,
    '',
    '**Used by:** _none yet_',
    '',
  ].join('\n');
}

export async function addPattern(
  input: AddPatternInput,
): Promise<AddPatternResult> {
  const index = await loadPatternIndex();
  const existingIds = new Set(index.keys());
  const baseId = `pat_${slugify(input.name)}`;
  const id = uniqueId(baseId, existingIds);
  const slug = slugify(input.name);

  const block = buildPatternBlock(input, id);
  const libraryPath = getQaLibraryPath();
  const existing = await readFile(libraryPath, 'utf8');
  const trimmed = existing.replace(/\s+$/, '');
  const append = `\n\n---\n\n${block}`;
  await writeFile(libraryPath, trimmed + append + '\n', 'utf8');

  return { id, slug };
}
