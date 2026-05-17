/**
 * End-to-end smoke: flips the existing "Score Test Teacher" user to paid,
 * invokes the same generator+notify path that /admin/post-call uses, and
 * reports back what landed in the DB + storage. Sends a real Brevo email to
 * the test user (gmail+ alias, lands in laudes.michael@gmail.com).
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { createRequire } from 'node:module';
import { createClient } from '@supabase/supabase-js';

// Bypass the `server-only` runtime check: in Next.js the import is webpack-aliased
// to an empty module; outside Next it throws. Pre-warm require.cache with a stub
// before any downstream module imports it.
const req = createRequire(import.meta.url);
const serverOnlyPath = req.resolve('server-only');
req.cache[serverOnlyPath] = { exports: {}, loaded: true, id: serverOnlyPath, filename: serverOnlyPath, paths: [], children: [], parent: null, require: req, isPreloading: false } as unknown as NodeJS.Module;

const envFile = resolve(process.cwd(), '.env.local');
for (const line of readFileSync(envFile, 'utf8').split('\n')) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
  if (!m) continue;
  const [, key, raw] = m;
  if (process.env[key]) continue;
  process.env[key] = raw.replace(/^['"]|['"]$/g, '');
}

const TARGET_USER_ID = '925e2fa4-11c4-42b2-9828-85c18ca78652';
const SAMPLE_NOTES = `On the call you confirmed UK is your primary target for September 2026.
You're a registered SACE teacher with 5 years secondary maths experience.

We agreed on:
- You'll start SAPS clearance this week — Cape Town Civic Centre is faster than online
- You'll get a quote from Apostil.co.za for the apostille batch
- We'll send you a UK-format CV template separately
- Book a follow-up call in 4 weeks to review applications

One concern raised: your maths PGCE is from 2008. Some UK academies prefer "recent" PGCE (last 10 years). We discussed framing your CPD and IB workshop attendance to bridge that perception.`;

async function main() {
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );

  // 1. Flip to paid (set credits too, mimic webhook).
  const { error: tierErr } = await sb
    .from('profiles')
    .update({ tier: 'paid', paid_email_credits: 5 })
    .eq('user_id', TARGET_USER_ID);
  if (tierErr) throw tierErr;
  console.log('✓ Flipped tier=paid');

  // 2. Call generateAndNotify — same code path the admin endpoint hits.
  // Import inside main() so env vars are populated before module evaluation.
  const { generateAndNotify } = await import('@/lib/notifications/report-ready');
  console.log('→ Running generateAndNotify with call notes…');
  const t0 = Date.now();
  await generateAndNotify(TARGET_USER_ID, { callNotes: SAMPLE_NOTES });
  console.log(`✓ generateAndNotify completed (${Date.now() - t0}ms)`);

  // 3. Read back paid_reports row.
  const { data: report } = await sb
    .from('paid_reports')
    .select('user_id, pdf_path, generated_at, call_notes')
    .eq('user_id', TARGET_USER_ID)
    .single();
  console.log('paid_reports row:', JSON.stringify({
    pdf_path: report?.pdf_path,
    generated_at: report?.generated_at,
    call_notes_len: report?.call_notes?.length ?? 0,
    call_notes_preview: report?.call_notes?.slice(0, 80),
  }, null, 2));

  // 4. Download the PDF for visual inspection.
  if (report?.pdf_path) {
    const { data: signed } = await sb.storage
      .from('paid-reports')
      .createSignedUrl(report.pdf_path, 60);
    if (signed?.signedUrl) {
      const buf = Buffer.from(await (await fetch(signed.signedUrl)).arrayBuffer());
      const out = join(process.cwd(), 'docs/prompt-tests/e2e-post-call-output.pdf');
      mkdirSync(join(process.cwd(), 'docs/prompt-tests'), { recursive: true });
      writeFileSync(out, buf);
      console.log(`✓ Downloaded PDF → ${out} (${buf.length} bytes)`);
    }
  }

  console.log('\nDONE — check inbox for the Brevo email to laudes.michael+jobabroad-test@gmail.com');
}

main().catch((e) => { console.error('FAIL:', e); process.exit(1); });
