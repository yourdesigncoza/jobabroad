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
