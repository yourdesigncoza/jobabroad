// Verifies notifyAdminOfNewUser end to end against the real DB. Exercises every
// branch WITHOUT sending mail by default; pass --live to actually send one real
// admin email (to ADMIN_EMAILS) for a final eyeball of the formatting.
//
// Requires the 20260602_profiles_admin_notified_at migration to be applied.
// Run: NODE_OPTIONS="--require ./scripts/shim-server-only.cjs" \
//        npx tsx scripts/test-new-user-notify.ts [--live]
import { createSupabaseServiceClient } from '@/lib/supabase/service';
import { notifyAdminOfNewUser } from '@/lib/notifications/new-user-admin-email';

const LIVE = process.argv.includes('--live');
const svc = createSupabaseServiceClient();

let failures = 0;
function check(name: string, cond: boolean, detail?: unknown) {
  const tag = cond ? '✓ PASS' : '✗ FAIL';
  if (!cond) failures++;
  console.log(`${tag}  ${name}${cond ? '' : `  →  ${JSON.stringify(detail)}`}`);
}

async function main() {
  // 1. Unknown user → no_profile, no send.
  const r0 = await notifyAdminOfNewUser('00000000-0000-0000-0000-000000000000');
  check('unknown user → no_profile (no send)', r0.sent === false && r0.reason === 'no_profile', r0);

  // Seed a confirmed user (handle_new_user trigger creates the profile).
  const email = `playwright+notify-${Date.now()}@example.com`;
  const { data: created, error: cErr } = await svc.auth.admin.createUser({
    email,
    password: 'Test12345!',
    email_confirm: true,
    user_metadata: { name: 'Notify Tester', phone: '27721239999', category: 'teaching' },
  });
  if (cErr || !created?.user) throw new Error(`createUser failed: ${cErr?.message}`);
  const userId = created.user.id;
  console.log('seeded user', userId, email);

  try {
    // 2. ADMIN_EMAILS empty → no_recipients, flag must stay null.
    const savedAdmins = process.env.ADMIN_EMAILS;
    process.env.ADMIN_EMAILS = '';
    const r1 = await notifyAdminOfNewUser(userId);
    check('empty ADMIN_EMAILS → no_recipients (no send)', r1.sent === false && r1.reason === 'no_recipients', r1);
    const { data: p1 } = await svc.from('profiles').select('admin_notified_at').eq('user_id', userId).single();
    check('flag still null after no_recipients', p1?.admin_notified_at == null, p1);
    process.env.ADMIN_EMAILS = savedAdmins;

    // 3. Pre-set the flag → already_notified short-circuit (no send).
    await svc.from('profiles').update({ admin_notified_at: new Date().toISOString() }).eq('user_id', userId);
    const r2 = await notifyAdminOfNewUser(userId);
    check('pre-set flag → already_notified (no send)', r2.sent === false && r2.reason === 'already_notified', r2);

    // 4. Live happy path (opt-in): clear the flag, send for real, assert flag set,
    //    then assert the immediate re-call is idempotent.
    if (LIVE) {
      await svc.from('profiles').update({ admin_notified_at: null }).eq('user_id', userId);
      const r3 = await notifyAdminOfNewUser(userId);
      check('live send → sent:true', r3.sent === true, r3);
      const { data: p3 } = await svc.from('profiles').select('admin_notified_at').eq('user_id', userId).single();
      check('flag set after live send', p3?.admin_notified_at != null, p3);
      const r4 = await notifyAdminOfNewUser(userId);
      check('immediate re-call → already_notified', r4.sent === false && r4.reason === 'already_notified', r4);
      console.log(`(a real notification was sent to ADMIN_EMAILS=${process.env.ADMIN_EMAILS})`);
    } else {
      console.log('(skipped live send — pass --live to send one real admin email)');
    }
  } finally {
    await svc.auth.admin.deleteUser(userId).then(() => {}, () => {});
    console.log('cleaned up test user');
  }

  console.log(failures === 0 ? '\nALL CHECKS PASSED' : `\n${failures} CHECK(S) FAILED`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => { console.error(e); process.exit(1); });
