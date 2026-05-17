// Measure cold vs warm latency of getOrGenerateNarratives for the test user.
// Run twice on the same assessment: cold (cache nulled), warm (cache hit).
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createRequire } from 'node:module';
import { createClient } from '@supabase/supabase-js';

const envFile = resolve(process.cwd(), '.env.local');
for (const line of readFileSync(envFile, 'utf8').split('\n')) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
  if (!m) continue;
  if (process.env[m[1]]) continue;
  process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
}

const req = createRequire(import.meta.url);
const serverOnlyPath = req.resolve('server-only');
req.cache[serverOnlyPath] = { exports: {}, loaded: true, id: serverOnlyPath, filename: serverOnlyPath, paths: [], children: [], parent: null, require: req, isPreloading: false } as unknown as NodeJS.Module;

async function main() {
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });

  // Find Score Test Teacher's submitted assessment
  const { data: pages } = await sb.auth.admin.listUsers({ perPage: 200 });
  const user = pages.users.find((u) => u.email === 'score-test-teacher@example.com');
  if (!user) throw new Error('Test user not found');
  const { data: assessment } = await sb
    .from('assessments')
    .select('id, data, category')
    .eq('user_id', user.id)
    .eq('status', 'submitted')
    .order('updated_at', { ascending: false })
    .limit(1)
    .single();
  if (!assessment) throw new Error('No submitted assessment');

  const { getOrGenerateNarratives } = await import('@/lib/scoring/narratives');
  const { loadRubric, calculateScore } = await import('@/lib/scoring');
  const { assessmentDataSchema } = await import('@/lib/assessments/schemas/assessment');
  const rubric = await loadRubric(assessment.category);
  if (!rubric) throw new Error('No rubric');
  const score = calculateScore(assessmentDataSchema.parse(assessment.data), rubric);

  // COLD: nuke any existing cache
  await sb.from('assessments').update({ cached_narratives: null }).eq('id', assessment.id);
  const t1 = Date.now();
  const cold = await getOrGenerateNarratives(assessment.id, score, assessment.category);
  const coldMs = Date.now() - t1;
  console.log(`COLD: ${coldMs}ms`);
  console.log(`  whatsWorking[:60]: "${cold.whatsWorking.slice(0, 60)}..."`);

  // WARM: cache should be populated
  const t2 = Date.now();
  const warm = await getOrGenerateNarratives(assessment.id, score, assessment.category);
  const warmMs = Date.now() - t2;
  console.log(`WARM: ${warmMs}ms`);
  console.log(`  whatsWorking[:60]: "${warm.whatsWorking.slice(0, 60)}..."`);
  console.log(`  matches cold: ${warm.whatsWorking === cold.whatsWorking ? 'YES' : 'NO'}`);

  console.log(`\nSpeedup: ${(coldMs / Math.max(warmMs, 1)).toFixed(1)}x (saved ${coldMs - warmMs}ms per revisit)`);
}
main().catch((e) => { console.error('FAIL:', e); process.exit(1); });
