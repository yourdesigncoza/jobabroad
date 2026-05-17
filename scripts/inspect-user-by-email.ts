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

const email = process.argv[2];
if (!email) {
  console.error('usage: tsx scripts/inspect-user-by-email.ts <email>');
  process.exit(1);
}

async function main() {
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
  const { data: pages } = await sb.auth.admin.listUsers({ perPage: 500 });
  const user = pages.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
  if (!user) {
    console.log('NOT FOUND in auth.users:', email);
    return;
  }
  console.log(JSON.stringify({
    id: user.id,
    email: user.email,
    created_at: user.created_at,
    email_confirmed_at: user.email_confirmed_at,
    confirmation_sent_at: user.confirmation_sent_at,
    last_sign_in_at: user.last_sign_in_at,
    role: user.role,
    aud: user.aud,
  }, null, 2));

  const { data: profile } = await sb
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();
  console.log('Profile:', profile);
}
main().catch((e) => { console.error('FAIL:', e); process.exit(1); });
