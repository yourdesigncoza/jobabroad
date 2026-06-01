// One-off: seed a realistic accounting user, run the REAL report generator
// (scoring + corpus + OpenAI narratives/next-actions + PDF render), save the
// PDF locally, then clean up. Exercises the full live path end to end.
// Run: npx tsx scripts/render-accounting-live.ts
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { createSupabaseServiceClient } from '@/lib/supabase/service';
import { generateReport } from '@/lib/reports/generator';

const svc = createSupabaseServiceClient();
const EMAIL = `playwright+acc-live-${Date.now()}@example.com`;

// A strong CA(SA) profile with a few real gaps (recognition not started, stale
// police clearance, no English test) so the report has meaningful next actions.
const DATA = {
  'personal.full_name': { q: 'Full name', v: 'Thandi Nkosi' },
  'personal.age': { q: 'Age', v: 31 },
  'personal.city_province': { q: 'City', v: 'Johannesburg, Gauteng' },
  'personal.whatsapp_number': { q: 'WhatsApp', v: '0721234567' },
  'situation.family_status': { q: 'Family', v: 'Married / partnered, no children' },
  'situation.current_employment': { q: 'Employment', v: 'Employed full-time in my field' },
  'qualifications.designation': { q: 'Designation', v: 'CA(SA) — SAICA' },
  'qualifications.academic': { q: 'Academic', v: 'Honours / CTA' },
  'qualifications.institution': { q: 'Institution', v: 'University of the Witwatersrand' },
  'qualifications.articles_status': { q: 'Articles', v: 'Completed (signed off)' },
  'registration.membership_status': { q: 'Membership', v: 'Active member in good standing' },
  'registration.overseas_body_started': { q: 'Overseas', v: 'None started' },
  'registration.public_practice': { q: 'Practice', v: 'No — commerce / industry roles (no audit rights needed)' },
  'experience.years_experience': { q: 'Years', v: 7 },
  'experience.seniority': { q: 'Seniority', v: 'Manager / Senior' },
  'experience.specialisms': { q: 'Specialisms', v: ['Tax', 'Financial Accounting / Reporting'] },
  'experience.worked_abroad': { q: 'Abroad', v: false },
  'experience.notice_period': { q: 'Notice', v: '1 calendar month' },
  'documents.passport_status': { q: 'Passport', v: 'Valid, 2+ years remaining' },
  'documents.police_clearance': { q: 'PCC', v: 'Older than 6 months' },
  'documents.dependants_count': { q: 'Dependants', v: 0 },
  'documents.available_capital': { q: 'Capital', v: 'R70k – R150k' },
  'readiness.english_rating': { q: 'English', v: 'Native / first language' },
  'readiness.english_test': { q: 'Test', v: 'Not yet' },
  'readiness.target_destinations': { q: 'Destinations', v: ['UK', 'Australia'] },
  'readiness.target_timeline': { q: 'Timeline', v: 'Within 6 months' },
};

async function main() {
  // 1. Seed user (handle_new_user trigger creates the profile from metadata).
  const { data: created, error: cErr } = await svc.auth.admin.createUser({
    email: EMAIL,
    password: 'Test12345!',
    email_confirm: true,
    user_metadata: { name: 'Thandi Nkosi', phone: '27721234567', category: 'accounting' },
  });
  if (cErr || !created?.user) throw new Error(`createUser failed: ${cErr?.message}`);
  const userId = created.user.id;
  console.log('seeded user', userId);

  let assessmentId: string | undefined;
  let pdfPath: string | undefined;
  try {
    const { data: assess, error: aErr } = await svc
      .from('assessments')
      .insert({
        user_id: userId,
        category: 'accounting',
        schema_version: 1,
        completed_step_slugs: ['personal', 'situation', 'qualifications', 'registration', 'experience', 'documents', 'readiness', 'about'],
        data: DATA,
        status: 'submitted',
        submitted_at: new Date().toISOString(),
      })
      .select('id')
      .single();
    if (aErr || !assess) throw new Error(`assessment insert failed: ${aErr?.message}`);
    assessmentId = assess.id as string;

    // 2. Run the REAL generator (corpus + OpenAI + PDF).
    console.log('generating report (corpus + OpenAI + PDF)…');
    const result = await generateReport(userId);
    pdfPath = result.pdfPath;

    const outDir = join(process.cwd(), 'docs/prompt-tests');
    mkdirSync(outDir, { recursive: true });
    const outPath = join(outDir, 'accounting-live.pdf');
    writeFileSync(outPath, result.pdfBuffer);
    console.log('wrote', outPath, `(${result.pdfBuffer.length} bytes)`);
  } finally {
    // 3. Cleanup so we don't leave a test user / report behind.
    if (pdfPath) await svc.storage.from('paid-reports').remove([pdfPath]).catch(() => {});
    await svc.from('paid_reports').delete().eq('user_id', userId).then(() => {}, () => {});
    if (assessmentId) await svc.from('assessments').delete().eq('id', assessmentId).then(() => {}, () => {});
    await svc.auth.admin.deleteUser(userId).then(() => {}, () => {});
    console.log('cleaned up test user + report');
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
