import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createClient } from '@supabase/supabase-js';

const envFile = resolve(process.cwd(), '.env.local');
for (const line of readFileSync(envFile, 'utf8').split('\n')) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
  if (!m) continue;
  const [, key, raw] = m;
  if (process.env[key]) continue;
  process.env[key] = raw.replace(/^['"]|['"]$/g, '');
}

async function main() {
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
  const { data: pages } = await sb.auth.admin.listUsers({ perPage: 200 });
  const { data: profiles } = await sb
    .from('profiles')
    .select('user_id, name, category, tier')
    .like('name', '%Test%');
  console.log('Test profiles count:', profiles?.length ?? 0);
  for (const p of profiles ?? []) {
    const auth = pages.users.find((u) => u.id === p.user_id);
    const { data: assessments } = await sb
      .from('assessments')
      .select('id, category, status, updated_at')
      .eq('user_id', p.user_id);
    const { data: reports } = await sb
      .from('paid_reports')
      .select('user_id, generated_at, call_notes')
      .eq('user_id', p.user_id);
    console.log(JSON.stringify({ id: p.user_id, email: auth?.email, ...p, assessments, reports }, null, 2));
  }
}
main().catch((e) => { console.error('FAIL:', e); process.exit(1); });
