/**
 * Destructive: deletes every auth.users row (cascades through profiles,
 * assessments, bookings, paid_reports via the FK on_delete = cascade) and
 * empties the paid-reports storage bucket. Used to reset the dev/staging
 * environment before real users arrive.
 *
 * Service-role required. No prompts — caller has already confirmed.
 */
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

  // 1. Storage cleanup first — paid-reports bucket organises objects under
  // `${userId}/...`. Listing top-level "folders" gives us the user-id prefixes
  // even though Supabase storage is technically flat.
  const { data: rootList } = await sb.storage.from('paid-reports').list('', { limit: 500 });
  let storageDeleted = 0;
  for (const top of rootList ?? []) {
    const { data: inner } = await sb.storage.from('paid-reports').list(top.name, { limit: 500 });
    const paths = (inner ?? []).map((o) => `${top.name}/${o.name}`);
    if (paths.length > 0) {
      const { error } = await sb.storage.from('paid-reports').remove(paths);
      if (error) console.error('storage remove failed', top.name, error.message);
      else storageDeleted += paths.length;
    }
  }
  console.log(`✓ Deleted ${storageDeleted} storage objects`);

  // 2. auth.users — cascade handles profiles/assessments/bookings/paid_reports.
  const { data: pages } = await sb.auth.admin.listUsers({ perPage: 500 });
  let userDeleted = 0;
  for (const u of pages.users) {
    const { error } = await sb.auth.admin.deleteUser(u.id);
    if (error) console.error(`failed to delete ${u.email}:`, error.message);
    else userDeleted++;
  }
  console.log(`✓ Deleted ${userDeleted} auth.users (cascaded to profiles + downstream)`);

  // 3. Verify cleanup
  const [{ count: profileCount }, { count: assessCount }, { count: bookingCount }, { count: reportCount }] =
    await Promise.all([
      sb.from('profiles').select('user_id', { count: 'exact', head: true }),
      sb.from('assessments').select('id', { count: 'exact', head: true }),
      sb.from('bookings').select('id', { count: 'exact', head: true }),
      sb.from('paid_reports').select('user_id', { count: 'exact', head: true }),
    ]);
  console.log('\nPost-wipe counts:');
  console.log(`  profiles:     ${profileCount}`);
  console.log(`  assessments:  ${assessCount}`);
  console.log(`  bookings:     ${bookingCount}`);
  console.log(`  paid_reports: ${reportCount}`);
}

main().catch((e) => { console.error('FAIL:', e); process.exit(1); });
