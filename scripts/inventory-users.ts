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
  const { data: pages } = await sb.auth.admin.listUsers({ perPage: 500 });
  console.log(`auth.users: ${pages.users.length}`);
  for (const u of pages.users) {
    console.log(`  - ${u.email}  (created ${u.created_at?.slice(0, 16)}, confirmed ${u.email_confirmed_at ? 'yes' : 'no'})`);
  }

  const [{ count: profileCount }, { count: assessCount }, { count: bookingCount }, { count: reportCount }] =
    await Promise.all([
      sb.from('profiles').select('user_id', { count: 'exact', head: true }),
      sb.from('assessments').select('id', { count: 'exact', head: true }),
      sb.from('bookings').select('id', { count: 'exact', head: true }),
      sb.from('paid_reports').select('user_id', { count: 'exact', head: true }),
    ]);
  console.log(`\nprofiles:     ${profileCount}`);
  console.log(`assessments:  ${assessCount}`);
  console.log(`bookings:     ${bookingCount}`);
  console.log(`paid_reports: ${reportCount}`);

  // Storage objects under paid-reports/ (these don't auto-cascade with user delete)
  const { data: rootList } = await sb.storage.from('paid-reports').list('', { limit: 100 });
  let totalObjects = 0;
  for (const top of rootList ?? []) {
    const { data: inner } = await sb.storage.from('paid-reports').list(top.name, { limit: 100 });
    totalObjects += inner?.length ?? 0;
  }
  console.log(`storage objects in paid-reports bucket: ${totalObjects}`);
}

main().catch((e) => { console.error('FAIL:', e); process.exit(1); });
