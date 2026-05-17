// One-off: seed a confirmed teaching test user with a submitted assessment so the
// /members/teaching/score page can be smoke-tested in the browser.
// Idempotent — re-running deletes the user first and recreates.

import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

// Manually load .env.local (reindex.ts pattern: reads from process env passed by caller; here we want self-contained)
const envFile = '.env.local';
if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, 'utf8').split('\n')) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && !process.env[m[1]]) {
      process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
    }
  }
}

const TEST_EMAIL = 'score-test-teacher@example.com';
const TEST_PASSWORD = 'ScoreTest!2026';
const TEST_NAME = 'Score Test Teacher';
const TEST_PHONE = '27821234567';
const TEST_CATEGORY = 'teaching';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
if (!url || !serviceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

async function main() {
  // Find + delete any existing test user (clean slate)
  const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
  const existing = list?.users.find((u) => u.email === TEST_EMAIL);
  if (existing) {
    console.log('Deleting existing user', existing.id);
    await admin.auth.admin.deleteUser(existing.id);
  }

  // Create confirmed user — handle_new_user trigger inserts profile row from metadata
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
    email_confirm: true,
    user_metadata: { name: TEST_NAME, phone: TEST_PHONE, category: TEST_CATEGORY },
  });
  if (createErr || !created.user) {
    console.error('createUser failed:', createErr);
    process.exit(1);
  }
  const userId = created.user.id;
  console.log('Created user', userId, TEST_EMAIL);

  // Profile choice — STRONG or WEAK, set via PROFILE env var (default STRONG)
  const profile = (process.env.PROFILE ?? 'STRONG').toUpperCase();
  const data = profile === 'WEAK'
    ? {
        'personal.full_name': { q: 'Full name', v: TEST_NAME },
        'personal.age': { q: 'Age', v: 41 },
        'personal.city_province': { q: 'City', v: 'Bloemfontein, Free State' },
        'personal.whatsapp_number': { q: 'WhatsApp', v: '082 999 0000' },
        'situation.family_status': { q: 'Family status', v: 'Single parent with children' },
        'situation.current_employment': { q: 'Employment', v: 'Unemployed' },
        'qualifications.highest_qualification': { q: 'Qualification', v: 'Other' },
        'qualifications.institution': { q: 'Institution', v: 'Private college' },
        'qualifications.graduation_year': { q: 'Graduation', v: 2008 },
        'qualifications.phase': { q: 'Phase', v: ['Intermediate (Gr 4–6)'] },
        'qualifications.subjects': { q: 'Subjects', v: ['English'] },
        'registration.sace_number': { q: 'SACE number', v: '' },
        'registration.sace_status': { q: 'SACE status', v: 'Not registered' },
        'registration.sace_expiry': { q: 'SACE expiry', v: "I don't know" },
        'registration.qts_started': { q: 'QTS', v: 'None started' },
        'experience.years_teaching': { q: 'Years', v: 1 },
        'experience.school_type': { q: 'School', v: 'Tutoring / online' },
        'experience.taught_abroad': { q: 'Taught abroad', v: false },
        'experience.notice_period': { q: 'Notice', v: 'Other / not employed' },
        'documents.passport_status': { q: 'Passport', v: 'No passport' },
        'documents.police_clearance': { q: 'PCC', v: 'None' },
        'documents.dependants_count': { q: 'Dependants', v: 3 },
        'documents.available_capital': { q: 'Capital', v: 'Under R30k' },
        'readiness.english_rating': { q: 'English', v: 'Conversational' },
        'readiness.english_test': { q: 'English test', v: 'Not yet' },
        'readiness.target_destinations': { q: 'Destinations', v: ['UAE'] },
        'readiness.target_timeline': { q: 'Timeline', v: 'Just exploring' },
      }
    : {
        'personal.full_name': { q: 'Full name', v: TEST_NAME },
        'personal.age': { q: 'Age', v: 34 },
        'personal.city_province': { q: 'City', v: 'Cape Town, Western Cape' },
        'personal.whatsapp_number': { q: 'WhatsApp', v: '082 123 4567' },
        'situation.family_status': { q: 'Family status', v: 'Married / partnered with children' },
        'situation.current_employment': { q: 'Employment', v: 'Employed full-time in my field' },
        'qualifications.highest_qualification': { q: 'Qualification', v: 'B.Ed Honours' },
        'qualifications.institution': { q: 'Institution', v: 'University of Cape Town' },
        'qualifications.graduation_year': { q: 'Graduation', v: 2014 },
        'qualifications.phase': { q: 'Phase', v: ['FET (Gr 10–12)'] },
        'qualifications.subjects': { q: 'Subjects', v: ['Maths', 'Sciences'] },
        'registration.sace_number': { q: 'SACE number', v: '12345678' },
        'registration.sace_status': { q: 'SACE status', v: 'Active (full)' },
        'registration.sace_expiry': { q: 'SACE expiry', v: '2027' },
        'registration.qts_started': { q: 'QTS', v: 'In progress' },
        'experience.years_teaching': { q: 'Years', v: 8 },
        'experience.school_type': { q: 'School', v: 'Private / independent' },
        'experience.taught_abroad': { q: 'Taught abroad', v: false },
        'experience.notice_period': { q: 'Notice', v: 'End of current term' },
        'documents.passport_status': { q: 'Passport', v: 'Valid, 2+ years remaining' },
        'documents.police_clearance': { q: 'PCC', v: 'Older than 6 months' },
        'documents.dependants_count': { q: 'Dependants', v: 2 },
        'documents.available_capital': { q: 'Capital', v: 'R70k – R150k' },
        'readiness.english_rating': { q: 'English', v: 'Fluent' },
        'readiness.english_test': { q: 'English test', v: 'Not yet' },
        'readiness.target_destinations': { q: 'Destinations', v: ['UAE', 'UK'] },
        'readiness.target_timeline': { q: 'Timeline', v: 'Within 6 months' },
      };
  console.log('profile:', profile);

  const slugs = [
    'personal', 'situation', 'qualifications', 'registration',
    'experience', 'documents', 'readiness',
  ];

  const { error: insertErr } = await admin.from('assessments').insert({
    user_id: userId,
    category: TEST_CATEGORY,
    schema_version: 1,
    completed_step_slugs: slugs,
    data,
    status: 'submitted',
    submitted_at: new Date().toISOString(),
  });
  if (insertErr) {
    console.error('assessment insert failed:', insertErr);
    process.exit(1);
  }
  console.log('Inserted submitted teaching assessment');
  console.log('---');
  console.log('Login at /login with:');
  console.log('  email:', TEST_EMAIL);
  console.log('  password:', TEST_PASSWORD);
  console.log('Then visit /members/teaching/score');
}

main();
