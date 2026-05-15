/* eslint-disable @typescript-eslint/no-explicit-any */
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { createClient } from '@supabase/supabase-js';
import { pipeline, env } from '@xenova/transformers';

env.allowLocalModels = false;

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SERVICE_ROLE) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const REPO_ROOT = path.resolve(__dirname, '..');
const PATHWAYS_DIR = path.join(REPO_ROOT, 'content', 'pathways');
const WIKI_ROOT =
  process.env.WIKI_BUILDS_PATH ??
  '/home/laudes/zoot/projects/wiki-builds/work-abroad-web';

const VAULT_TO_CATEGORY: Record<string, string> = {
  nursing: 'healthcare',
  teaching: 'teaching',
  seasonal: 'seasonal',
  trades: 'trades',
  farming: 'farming',
  hospitality: 'hospitality',
  accounting: 'accounting',
  tefl: 'tefl',
  'au-pair': 'au-pair',
  engineering: 'engineering',
  'it-tech': 'it-tech',
  shared: 'shared',
};

const MAX_CHARS = 1800;

interface Chunk {
  category: string;
  source_type: 'guide' | 'wiki';
  source_path: string;
  heading: string;
  anchor: string | null;
  slug: string | null;
  content: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

function splitLong(text: string): string[] {
  if (text.length <= MAX_CHARS) return [text];
  const paragraphs = text.split(/\n{2,}/);
  const out: string[] = [];
  let buf = '';
  for (const p of paragraphs) {
    if ((buf + '\n\n' + p).length > MAX_CHARS && buf) {
      out.push(buf.trim());
      buf = p;
    } else {
      buf = buf ? buf + '\n\n' + p : p;
    }
  }
  if (buf.trim()) out.push(buf.trim());
  return out.flatMap((c) => (c.length > MAX_CHARS ? hardSplit(c) : [c]));
}

function hardSplit(text: string): string[] {
  const out: string[] = [];
  for (let i = 0; i < text.length; i += MAX_CHARS) out.push(text.slice(i, i + MAX_CHARS));
  return out;
}

function chunkGuide(filePath: string, category: string): Chunk[] {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const { content } = matter(raw);
  const stripped = content.replace(/<!--[\s\S]*?-->/g, '');
  const lines = stripped.split('\n');

  const chunks: Chunk[] = [];
  let currentHeading: string | null = null;
  let currentAnchor: string | null = null;
  let buffer: string[] = [];

  const flush = () => {
    if (!currentHeading) return;
    const body = buffer.join('\n').trim();
    if (!body) return;
    for (const piece of splitLong(`# ${currentHeading}\n\n${body}`)) {
      chunks.push({
        category,
        source_type: 'guide',
        source_path: path.relative(REPO_ROOT, filePath),
        heading: currentHeading,
        anchor: currentAnchor,
        slug: null,
        content: piece,
      });
    }
  };

  for (const line of lines) {
    const m = /^##\s+(.+?)\s*$/.exec(line);
    if (m) {
      flush();
      currentHeading = m[1].replace(/<[^>]+>/g, '').trim();
      currentAnchor = slugify(currentHeading);
      buffer = [];
    } else if (currentHeading) {
      buffer.push(line);
    }
  }
  flush();
  return chunks;
}

function chunkWikiNote(filePath: string, category: string): Chunk[] {
  const raw = fs.readFileSync(filePath, 'utf-8');
  let content: string;
  let data: Record<string, unknown> = {};
  try {
    const parsed = matter(raw);
    content = parsed.content;
    data = parsed.data as Record<string, unknown>;
  } catch (err) {
    console.warn(`  ! frontmatter parse failed for ${path.relative(REPO_ROOT, filePath)}: ${(err as Error).message.split('\n')[0]} — treating whole file as body`);
    content = raw.replace(/^---[\s\S]*?---\n?/, '');
  }
  const stripped = content.replace(/<!--[\s\S]*?-->/g, '').trim();
  if (!stripped) return [];

  const filename = path.basename(filePath, '.md');
  const heading = filename;
  const slug = slugify(filename);
  const summary = typeof data?.summary === 'string' ? data.summary : '';
  const aliases = Array.isArray(data?.aliases) ? data.aliases.join(', ') : '';
  const preamble = [
    `# ${heading}`,
    summary ? `Summary: ${summary}` : '',
    aliases ? `Also known as: ${aliases}` : '',
  ].filter(Boolean).join('\n');

  const body = `${preamble}\n\n${stripped}`;
  return splitLong(body).map((piece) => ({
    category,
    source_type: 'wiki' as const,
    source_path: path.relative(REPO_ROOT, filePath),
    heading,
    anchor: null,
    slug,
    content: piece,
  }));
}

function collectChunks(): Chunk[] {
  const all: Chunk[] = [];

  if (fs.existsSync(PATHWAYS_DIR)) {
    for (const f of fs.readdirSync(PATHWAYS_DIR)) {
      if (!f.endsWith('.md')) continue;
      const cat = path.basename(f, '.md');
      const chunks = chunkGuide(path.join(PATHWAYS_DIR, f), cat);
      console.log(`  guide ${cat}: ${chunks.length} chunks`);
      all.push(...chunks);
    }
  } else {
    console.warn(`  no pathways dir at ${PATHWAYS_DIR}`);
  }

  if (fs.existsSync(WIKI_ROOT)) {
    for (const vault of fs.readdirSync(WIKI_ROOT)) {
      const m = /^wa-(nursing|teaching|seasonal|trades|farming|hospitality|accounting|tefl|au-pair|engineering|it-tech|shared)-/.exec(vault);
      if (!m) continue;
      const category = VAULT_TO_CATEGORY[m[1]];
      const wikiDir = path.join(WIKI_ROOT, vault, 'wiki');
      if (!fs.existsSync(wikiDir)) continue;
      let count = 0;
      const walk = (dir: string) => {
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
          const full = path.join(dir, entry.name);
          if (entry.isDirectory()) walk(full);
          else if (entry.isFile() && entry.name.endsWith('.md') && entry.name !== 'index.md') {
            const chunks = chunkWikiNote(full, category);
            count += chunks.length;
            all.push(...chunks);
          }
        }
      };
      walk(wikiDir);
      console.log(`  wiki ${vault} -> ${category}: ${count} chunks`);
    }
  } else {
    console.warn(`  no wiki root at ${WIKI_ROOT} (set WIKI_BUILDS_PATH to override)`);
  }

  return all;
}

function parseCategoryFlag(): string | null {
  for (const arg of process.argv.slice(2)) {
    if (arg.startsWith('--category=')) return arg.slice('--category='.length);
    if (arg === '--category') {
      const next = process.argv[process.argv.indexOf(arg) + 1];
      if (next && !next.startsWith('--')) return next;
    }
  }
  return null;
}

async function main() {
  const onlyCategory = parseCategoryFlag();
  if (onlyCategory) {
    const valid = new Set(Object.values(VAULT_TO_CATEGORY));
    if (!valid.has(onlyCategory)) {
      console.error(`Unknown category '${onlyCategory}'. Valid: ${[...valid].sort().join(', ')}`);
      process.exit(1);
    }
    console.log(`Partial reindex — category='${onlyCategory}' only`);
  } else {
    console.log('Full reindex — all categories');
  }

  console.log('Loading gte-small model...');
  const embedder = await pipeline('feature-extraction', 'Xenova/gte-small');

  console.log('Collecting chunks...');
  const allChunks = collectChunks();
  const chunks = onlyCategory ? allChunks.filter((c) => c.category === onlyCategory) : allChunks;
  console.log(
    onlyCategory
      ? `Total chunks for '${onlyCategory}': ${chunks.length} (of ${allChunks.length} all categories)`
      : `Total chunks: ${chunks.length}`,
  );
  if (chunks.length === 0) {
    console.error('No chunks to index — aborting.');
    process.exit(1);
  }

  console.log('Embedding...');
  const rows: any[] = [];
  for (let i = 0; i < chunks.length; i++) {
    const c = chunks[i];
    const out = await embedder(c.content, { pooling: 'mean', normalize: true });
    const vec = Array.from(out.data as Float32Array);
    rows.push({ ...c, embedding: vec });
    if ((i + 1) % 25 === 0) console.log(`  ${i + 1} / ${chunks.length}`);
  }

  const supabase = createClient(SUPABASE_URL!, SERVICE_ROLE!, {
    auth: { persistSession: false },
  });

  console.log(
    onlyCategory
      ? `Wiping pathway_chunks where category='${onlyCategory}'...`
      : 'Wiping pathway_chunks...',
  );
  const deleteQuery = supabase.from('pathway_chunks').delete();
  const { error: delErr } = onlyCategory
    ? await deleteQuery.eq('category', onlyCategory)
    : await deleteQuery.not('id', 'is', null);
  if (delErr) {
    console.error('Delete failed:', delErr.message);
    process.exit(1);
  }

  console.log('Inserting...');
  const BATCH = 50;
  for (let i = 0; i < rows.length; i += BATCH) {
    const slice = rows.slice(i, i + BATCH);
    const { error } = await supabase.from('pathway_chunks').insert(slice);
    if (error) {
      console.error(`Insert batch ${i} failed:`, error.message);
      process.exit(1);
    }
    console.log(`  inserted ${Math.min(i + BATCH, rows.length)} / ${rows.length}`);
  }

  console.log('Done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
