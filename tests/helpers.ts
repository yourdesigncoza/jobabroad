import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { expect, type Page } from '@playwright/test';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SERVICE_ROLE) {
  throw new Error(
    'NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set for Playwright tests.',
  );
}

export function svc(): SupabaseClient {
  return createClient(SUPABASE_URL, SERVICE_ROLE, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function uniqueEmail(suffix: string): string {
  return `playwright+${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${suffix}@example.com`;
}

export function uniquePhone(): string {
  // Always returns a valid SA mobile in 0XXXXXXXXX form, with low collision risk.
  const tail = String(Date.now()).slice(-7);
  return `072${tail}`;
}

async function findUserByEmail(email: string) {
  const supabase = svc();
  // listUsers paginates; default page size 50 — sufficient for test runs.
  const { data } = await supabase.auth.admin.listUsers({ perPage: 200 });
  return data.users.find((u) => u.email === email) ?? null;
}

export async function confirmUser(email: string): Promise<void> {
  const user = await findUserByEmail(email);
  if (!user) throw new Error(`User ${email} not found (cannot confirm)`);
  await svc().auth.admin.updateUserById(user.id, { email_confirm: true });
}

export async function deleteUser(email: string): Promise<void> {
  const user = await findUserByEmail(email);
  if (user) await svc().auth.admin.deleteUser(user.id);
}

export async function deleteAllPlaywrightUsers(): Promise<number> {
  const supabase = svc();
  const { data } = await supabase.auth.admin.listUsers({ perPage: 200 });
  const stale = data.users.filter((u) => u.email?.startsWith('playwright+'));
  await Promise.all(stale.map((u) => supabase.auth.admin.deleteUser(u.id)));
  return stale.length;
}

/**
 * Create + confirm a user via the service-role admin API (skips email),
 * then sign in through the /login form so the browser session cookies are set.
 */
export async function registerAndLogin(
  page: Page,
  opts: {
    email: string;
    password: string;
    name: string;
    phone: string;
    category: string;
  },
): Promise<void> {
  const supabase = svc();
  await supabase.auth.admin.createUser({
    email: opts.email,
    password: opts.password,
    email_confirm: true,
    user_metadata: { name: opts.name, phone: normaliseSaPhone(opts.phone), category: opts.category },
  });

  await page.goto('/login');
  await page.locator('input[name="email"]').fill(opts.email);
  await page.locator('input[name="password"]').fill(opts.password);
  await page.getByRole('button', { name: /sign in/i }).click();
  await expect(page).toHaveURL(/\/dashboard/);
}

function normaliseSaPhone(input: string): string {
  const cleaned = input.replace(/[\s\-()]/g, '');
  const m = cleaned.match(/^(?:\+?27|0)(\d{9})$/);
  if (!m) throw new Error(`Invalid SA phone: ${input}`);
  return `27${m[1]}`;
}

export async function findUserIdByEmail(email: string): Promise<string> {
  const user = await findUserByEmail(email);
  if (!user) throw new Error(`user ${email} not found`);
  return user.id;
}

/** Flip the user's tier + credit balance via service role. */
export async function makePaid(userId: string, credits = 5): Promise<void> {
  const { error } = await svc()
    .from('profiles')
    .update({ tier: 'paid', paid_email_credits: credits })
    .eq('user_id', userId);
  if (error) throw error;
}

/**
 * Insert a submitted teaching assessment for the user. Uses a "Strong potential"
 * profile so the score page renders the upper band. Skips the wizard entirely
 * (form-fill is brittle and tested separately in auth-flow / member-page specs).
 */
export async function insertSubmittedTeachingAssessment(userId: string): Promise<void> {
  const data = {
    'personal.full_name': { q: 'Full name', v: 'Playwright Tester' },
    'personal.age': { q: 'Age', v: 32 },
    'personal.city_province': { q: 'City', v: 'Cape Town' },
    'personal.whatsapp_number': { q: 'WhatsApp', v: '0820000000' },
    'situation.family_status': { q: 'Family status', v: 'Single, no dependants' },
    'situation.current_employment': { q: 'Employment', v: 'Employed full-time in my field' },
    'qualifications.highest_qualification': { q: 'Qualification', v: 'B.Ed Honours' },
    'qualifications.institution': { q: 'Institution', v: 'UCT' },
    'qualifications.graduation_year': { q: 'Graduation', v: 2018 },
    'qualifications.phase': { q: 'Phase', v: ['FET (Gr 10–12)'] },
    'qualifications.subjects': { q: 'Subjects', v: ['Maths'] },
    'registration.sace_number': { q: 'SACE number', v: '12345678' },
    'registration.sace_status': { q: 'SACE status', v: 'Active (full)' },
    'registration.sace_expiry': { q: 'SACE expiry', v: '2027' },
    'registration.qts_started': { q: 'QTS', v: 'Completed' },
    'experience.years_teaching': { q: 'Years', v: 6 },
    'experience.school_type': { q: 'School', v: 'Private / independent' },
    'experience.taught_abroad': { q: 'Abroad', v: true },
    'experience.notice_period': { q: 'Notice', v: 'End of current term' },
    'documents.passport_status': { q: 'Passport', v: 'Valid, 2+ years remaining' },
    'documents.police_clearance': { q: 'PCC', v: 'Current (within 6 months)' },
    'documents.dependants_count': { q: 'Dependants', v: 0 },
    'documents.available_capital': { q: 'Capital', v: 'R150k+' },
    'readiness.english_rating': { q: 'English', v: 'Native / first language' },
    'readiness.english_test': { q: 'English test', v: 'IELTS' },
    'readiness.target_destinations': { q: 'Destinations', v: ['UK'] },
    'readiness.target_timeline': { q: 'Timeline', v: 'As soon as possible' },
  };
  const slugs = [
    'personal', 'situation', 'qualifications', 'registration',
    'experience', 'documents', 'readiness',
  ];
  const { error } = await svc().from('assessments').insert({
    user_id: userId,
    category: 'teaching',
    schema_version: 1,
    completed_step_slugs: slugs,
    data,
    status: 'submitted',
    submitted_at: new Date().toISOString(),
  });
  if (error) throw error;
}
