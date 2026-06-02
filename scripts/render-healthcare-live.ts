// One-off: seed a strong nurse profile EXCEPT for Basic English, run the REAL
// report generator (scoring + corpus + OpenAI + PDF), save the PDF locally,
// then clean up. Exercises band-capping end to end: fundamentals score well but
// the Basic-English gate must cap the band to "needs prep" and surface the gate
// callout on the cover.
// Run: npx tsx scripts/render-healthcare-live.ts
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { createSupabaseServiceClient } from '@/lib/supabase/service';
import { generateReport } from '@/lib/reports/generator';
import { calculateScore, loadRubric } from '@/lib/scoring';
import { assessmentDataSchema } from '@/lib/assessments/schemas/assessment';

const svc = createSupabaseServiceClient();
const EMAIL = `playwright+hc-live-${Date.now()}@example.com`;

// ICU nurse, 8 years, active SANC, overseas reg completed, valid passport,
// strong finances — would land in strong_potential on the weighted score alone.
// The single deliberate failure is Basic English, which is an absolute
// registration gate for the NMC/AHPRA/NCNZ. The band must cap to needs_prep.
const DATA = {
  'personal.full_name': { q: 'Full name', v: 'Lerato Mokoena' },
  'personal.age': { q: 'Age', v: 34 },
  'personal.city_province': { q: 'City', v: 'Durban, KwaZulu-Natal' },
  'personal.whatsapp_number': { q: 'WhatsApp', v: '0721234567' },
  'qualifications.highest_qualification': { q: 'Qual', v: 'Degree' },
  'qualifications.institution': { q: 'Institution', v: 'University of KwaZulu-Natal' },
  'qualifications.graduation_year': { q: 'Grad year', v: 2012 },
  'qualifications.speciality': { q: 'Speciality', v: 'ICU' },
  'registration.sanc_number': { q: 'SANC no', v: '1234567' },
  'registration.sanc_status': { q: 'SANC', v: 'Active' },
  'registration.prior_nmc_ahpra_ncnz': { q: 'Overseas reg', v: 'Completed' },
  'experience.years_experience': { q: 'Years', v: 8 },
  'experience.employer_type': { q: 'Employer', v: 'Public hospital' },
  'experience.worked_abroad': { q: 'Abroad', v: true },
  'experience.notice_period': { q: 'Notice', v: '1 calendar month' },
  'documents.passport_status': { q: 'Passport', v: 'Valid — 2+ years remaining' },
  'documents.police_clearance': { q: 'PCC', v: 'Current (within 6 months)' },
  'documents.dependants_count': { q: 'Dependants', v: 0 },
  'documents.available_capital': { q: 'Capital', v: 'R150k+' },
  'readiness.english_rating': { q: 'English', v: 'Basic' },
  'readiness.english_test': { q: 'Test', v: 'Not yet' },
  'readiness.target_destinations': { q: 'Destinations', v: ['UK', 'Australia'] },
  'readiness.target_timeline': { q: 'Timeline', v: 'Within 6 months' },
};

async function main() {
  // Print the score first so the cap is visible even without opening the PDF.
  const rubric = await loadRubric('healthcare');
  const score = calculateScore(assessmentDataSchema.parse(DATA), rubric!);
  console.log(`SCORE: ${score.overall}/100 · band=${score.band}`);
  console.log('applied_caps:', JSON.stringify(score.applied_caps ?? [], null, 2));

  const { data: created, error: cErr } = await svc.auth.admin.createUser({
    email: EMAIL,
    password: 'Test12345!',
    email_confirm: true,
    user_metadata: { name: 'Lerato Mokoena', phone: '27721234567', category: 'healthcare' },
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
        category: 'healthcare',
        schema_version: 1,
        completed_step_slugs: ['personal', 'qualifications', 'registration', 'experience', 'documents', 'readiness'],
        data: DATA,
        status: 'submitted',
        submitted_at: new Date().toISOString(),
      })
      .select('id')
      .single();
    if (aErr || !assess) throw new Error(`assessment insert failed: ${aErr?.message}`);
    assessmentId = assess.id as string;

    console.log('generating report (corpus + OpenAI + PDF)…');
    const result = await generateReport(userId);
    pdfPath = result.pdfPath;

    const outDir = join(process.cwd(), 'docs/prompt-tests');
    mkdirSync(outDir, { recursive: true });
    const outPath = join(outDir, 'healthcare-live.pdf');
    writeFileSync(outPath, result.pdfBuffer);
    console.log('wrote', outPath, `(${result.pdfBuffer.length} bytes)`);
  } finally {
    if (pdfPath) await svc.storage.from('paid-reports').remove([pdfPath]).catch(() => {});
    await svc.from('paid_reports').delete().eq('user_id', userId).then(() => {}, () => {});
    if (assessmentId) await svc.from('assessments').delete().eq('id', assessmentId).then(() => {}, () => {});
    await svc.auth.admin.deleteUser(userId).then(() => {}, () => {});
    console.log('cleaned up test user + report');
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
