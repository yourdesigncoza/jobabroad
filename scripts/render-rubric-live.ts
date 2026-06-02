// One-off QA: seed a STRONG profile that trips exactly one band-cap gate, run
// the REAL report generator (scoring + corpus + OpenAI + PDF), print the score
// + applied caps, save the PDF locally, then clean up. Proves the new caps/gates
// render on the /score page + PDF cover for the rubrics reviewed on 2026-06-02.
//
// Generalises the render-healthcare-live.ts pattern across categories so we
// don't duplicate the seed/generate/cleanup harness per vertical.
//
// Run: npx tsx scripts/render-rubric-live.ts --category=au-pair
//      npx tsx scripts/render-rubric-live.ts --category=tefl
//      npx tsx scripts/render-rubric-live.ts --category=trades
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { createSupabaseServiceClient } from '@/lib/supabase/service';
import { generateReport } from '@/lib/reports/generator';
import { calculateScore, loadRubric } from '@/lib/scoring';
import { assessmentDataSchema } from '@/lib/assessments/schemas/assessment';

type Fixture = {
  name: string;
  phone: string;
  // The gate(s) this fixture deliberately trips, for the run log.
  gates: string[];
  // step slug → list of submitted steps
  steps: string[];
  // field_id → { q, v } — values are otherwise strong so the weighted score
  // would land in strong_potential; only the gate field(s) force the cap.
  data: Record<string, { q: string; v: string | number | boolean | string[] }>;
};

const FIXTURES: Record<string, Fixture> = {
  // au-pair: a maximal childcare profile (500+ hrs, infant experience, full
  // licence, A1 German) — but ONE dependent child of her own. The numeric cap
  // (documents.dependants_count when_min:1) must clamp the band to needs_prep.
  'au-pair': {
    name: 'Thandeka Nkosi',
    phone: '27721234501',
    gates: ['documents.dependants_count = 1 (own-children numeric cap → needs_prep)'],
    steps: ['personal', 'experience', 'practical', 'qualifications', 'documents', 'readiness'],
    data: {
      'personal.full_name': { q: 'Full name', v: 'Thandeka Nkosi' },
      'personal.age': { q: 'Age', v: 23 },
      'personal.city_province': { q: 'City', v: 'Cape Town, Western Cape' },
      'personal.nationality': { q: 'Nationality', v: 'South African' },
      'personal.gender': { q: 'Gender', v: 'Female' },
      'personal.whatsapp_number': { q: 'WhatsApp', v: '0721234501' },
      'experience.childcare_hours': { q: 'Childcare hours', v: '500+ hours' },
      'experience.contexts': { q: 'Contexts', v: ['Nanny / au pair (paid)', 'Crèche / preschool', 'Babysitting (paid)'] },
      'experience.youngest_age': { q: 'Youngest age', v: 'Under 12 months (infant)' },
      'experience.references': { q: 'References', v: '3+ contactable references' },
      'experience.first_aid': { q: 'First aid', v: 'Current (within 2 years)' },
      'practical.drivers_licence': { q: 'Licence', v: 'Code B (full)' },
      'practical.driving_experience': { q: 'Driving exp', v: 'Daily driver (1+ year)' },
      'practical.idp': { q: 'IDP', v: 'Already have it' },
      'practical.swimming': { q: 'Swimming', v: 'Yes — confident swimmer' },
      'qualifications.highest_qualification': { q: 'Qual', v: 'Bachelor degree' },
      'qualifications.english_rating': { q: 'English', v: 'Fluent' },
      'qualifications.german': { q: 'German', v: 'A1 certificate (Goethe / telc)' },
      'qualifications.french': { q: 'French', v: 'A2 or higher' },
      'qualifications.other_languages': { q: 'Other langs', v: 'Afrikaans, isiZulu' },
      'documents.passport_status': { q: 'Passport', v: 'Valid — 2+ years remaining' },
      'documents.police_clearance': { q: 'PCC', v: 'Current (within 6 months)' },
      'documents.dirco_legalisation': { q: 'DIRCO', v: 'Done' },
      'documents.medical': { q: 'Medical', v: 'Done — within 6 months' },
      'documents.dependants_count': { q: 'Dependants', v: 1 },
      'documents.available_capital': { q: 'Capital', v: 'R60k+' },
      'readiness.target_destinations': { q: 'Destinations', v: ['USA (J-1 Au Pair)', 'Germany'] },
      'readiness.priority': { q: 'Priority', v: 'USA J-1 specifically' },
      'readiness.contract_length': { q: 'Contract', v: '12 months + extension' },
      'readiness.target_timeline': { q: 'Timeline', v: 'Within 6 months' },
    },
  },

  // tefl: 5+ years teaching, taught abroad, native English, strong finances —
  // but Matric only AND no TEFL cert. Two caps fire (degree_status Matric only,
  // tefl_cert_type None — not planning); band must clamp to needs_prep.
  tefl: {
    name: 'Sipho Dlamini',
    phone: '27721234502',
    gates: [
      'qualifications.degree_status = Matric only (no-degree cap → needs_prep)',
      'credential.tefl_cert_type = None — not planning (no-cert cap → needs_prep)',
    ],
    steps: ['personal', 'qualifications', 'credential', 'experience', 'documents', 'readiness'],
    data: {
      'personal.full_name': { q: 'Full name', v: 'Sipho Dlamini' },
      'personal.age': { q: 'Age', v: 30 },
      'personal.city_province': { q: 'City', v: 'Johannesburg, Gauteng' },
      'personal.nationality': { q: 'Nationality', v: 'South African' },
      'personal.whatsapp_number': { q: 'WhatsApp', v: '0721234502' },
      'qualifications.degree_status': { q: 'Degree', v: 'Matric only' },
      'qualifications.saqa_letter': { q: 'SAQA', v: 'Not started' },
      'credential.tefl_cert_type': { q: 'TEFL cert', v: 'None — not planning' },
      'credential.specialism': { q: 'Specialism', v: ['Young Learners (YL)', 'Online teaching'] },
      'experience.years_teaching': { q: 'Years teaching', v: '5+ years' },
      'experience.context': { q: 'Context', v: ['Language centre / academy', 'Online (1-on-1)'] },
      'experience.taught_abroad': { q: 'Taught abroad', v: true },
      'experience.taught_abroad_where': { q: 'Where', v: 'Thailand' },
      'experience.notice_period': { q: 'Notice', v: 'Within 1 month' },
      'documents.passport_status': { q: 'Passport', v: 'Valid — 2+ years remaining' },
      'documents.police_clearance': { q: 'PCC', v: 'Current (within 6 months)' },
      'documents.degree_legalisation': { q: 'Legalisation', v: 'Not applicable' },
      'documents.dependants_count': { q: 'Dependants', v: 0 },
      'documents.available_capital': { q: 'Capital', v: 'R150k+' },
      'readiness.english_rating': { q: 'English', v: 'Native / first language' },
      'readiness.target_destinations': { q: 'Destinations', v: ['South Korea (EPIK / hagwon)', 'Vietnam'] },
      'readiness.priority': { q: 'Priority', v: 'Highest savings' },
      'readiness.target_timeline': { q: 'Timeline', v: 'As soon as possible' },
    },
  },

  // trades: 10 yrs experience, IELTS done, R400k+ — but NO formal trade test
  // (Red Seal cap → needs_prep) and mostly cash-in-hand work (the experience
  // dimension should discount unverifiable cash work).
  trades: {
    name: 'Pieter van Wyk',
    phone: '27721234503',
    gates: [
      'trade.red_seal_status = No formal trade test (Red Seal cap → needs_prep)',
      'experience.employment_type = Mostly cash-in-hand (experience discount, not a cap)',
    ],
    steps: ['personal', 'trade', 'experience', 'qualifications', 'assessment', 'documents', 'readiness'],
    data: {
      'personal.full_name': { q: 'Full name', v: 'Pieter van Wyk' },
      'personal.age': { q: 'Age', v: 35 },
      'personal.city_province': { q: 'City', v: 'Durban, KwaZulu-Natal' },
      'personal.whatsapp_number': { q: 'WhatsApp', v: '0721234503' },
      'trade.occupation': { q: 'Trade', v: 'Electrician' },
      'trade.red_seal_status': { q: 'Red Seal', v: 'No formal trade test' },
      'trade.section_13_logbook': { q: 'Logbook', v: 'Not applicable (6-yr on-the-job route)' },
      'trade.training_route': { q: 'Route', v: 'On-the-job (6+ years)' },
      'experience.years_post_qualification': { q: 'Years', v: 10 },
      'experience.recent_12_months': { q: 'Recent 12mo', v: 'Yes — same trade' },
      'experience.employment_type': { q: 'Employment type', v: 'Mostly cash-in-hand / family business' },
      'experience.employer_references': { q: 'References', v: 'Some employers contactable' },
      'experience.notice_period': { q: 'Notice', v: '1 month' },
      'qualifications.n_level': { q: 'N-level', v: ['N3 (Matric equivalent)'] },
      'qualifications.umalusi_verified': { q: 'Umalusi', v: 'Done' },
      'qualifications.dhet_verified': { q: 'DHET', v: 'Not applicable' },
      'qualifications.qcto_verified': { q: 'QCTO', v: 'Not started' },
      'assessment.tra_osap_status': { q: 'TRA OSAP', v: 'Not started' },
      'assessment.canadian_tea_status': { q: 'Canadian TEA', v: 'Not started' },
      'assessment.nz_iqa_status': { q: 'NZ IQA', v: 'Not started' },
      'documents.passport_status': { q: 'Passport', v: 'Valid — 2+ years remaining' },
      'documents.unabridged_birth_cert': { q: 'Birth cert', v: 'On hand' },
      'documents.police_clearance': { q: 'PCC', v: 'Current (within 6 months)' },
      'documents.dirco_apostille': { q: 'Apostille', v: 'Not started' },
      'documents.dependants_count': { q: 'Dependants', v: 0 },
      'documents.available_capital': { q: 'Capital', v: 'R400k+' },
      'readiness.english_rating': { q: 'English', v: 'Fluent' },
      'readiness.english_test': { q: 'English test', v: 'IELTS General Training (Canada / NZ)' },
      'readiness.english_score': { q: 'Score', v: 'IELTS 7.0 overall, 6.5 lowest' },
      'readiness.target_destinations': { q: 'Destinations', v: ['Australia', 'Canada'] },
      'readiness.uk_before_2026': { q: 'UK before 2026', v: 'Yes — solo, no dependants' },
      'readiness.priority': { q: 'Priority', v: 'Highest salary' },
      'readiness.target_timeline': { q: 'Timeline', v: 'Within 6 months' },
    },
  },
};

async function main() {
  const arg = process.argv.find((a) => a.startsWith('--category='));
  const category = arg?.split('=')[1];
  if (!category || !FIXTURES[category]) {
    console.error(`Usage: npx tsx scripts/render-rubric-live.ts --category=<${Object.keys(FIXTURES).join('|')}>`);
    process.exit(1);
  }
  const fx = FIXTURES[category];
  const svc = createSupabaseServiceClient();
  const EMAIL = `playwright+${category}-live-${Date.now()}@example.com`;

  // Print the score first so the cap is visible even without opening the PDF.
  const rubric = await loadRubric(category);
  if (!rubric) throw new Error(`no rubric for ${category}`);
  const score = calculateScore(assessmentDataSchema.parse(fx.data), rubric);
  console.log(`\n=== ${category} ===`);
  console.log('expected gate(s):');
  for (const g of fx.gates) console.log('  •', g);
  console.log(`SCORE: ${score.overall}/100 · band=${score.band}`);
  console.log('applied_caps:', JSON.stringify(score.applied_caps ?? [], null, 2));

  const { data: created, error: cErr } = await svc.auth.admin.createUser({
    email: EMAIL,
    password: 'Test12345!',
    email_confirm: true,
    user_metadata: { name: fx.name, phone: fx.phone, category },
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
        category,
        schema_version: 1,
        completed_step_slugs: fx.steps,
        data: fx.data,
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
    const outPath = join(outDir, `${category}-live.pdf`);
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
