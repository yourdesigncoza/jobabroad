import { test, expect, type Page } from '@playwright/test';
import {
  deleteUser,
  findUserIdByEmail,
  insertSubmittedTeachingAssessment,
  registerAndLogin,
  svc,
  uniqueEmail,
  uniquePhone,
} from './helpers';

const PASSWORD = 'Test12345!';
const ADMIN_EMAIL = process.env.PLAYWRIGHT_ADMIN_EMAIL ?? '';

/** Seed an admin via service role and sign in through /login. */
async function seedAndLoginAdmin(page: Page): Promise<void> {
  const { error } = await svc().auth.admin.createUser({
    email: ADMIN_EMAIL,
    password: PASSWORD,
    email_confirm: true,
    user_metadata: { name: 'Admin', phone: `27${uniquePhone().slice(1)}`, category: 'teaching' },
  });
  if (error) throw new Error(`admin createUser failed: ${error.message}`);

  await page.goto('/login');
  await page.locator('input[name="email"]').fill(ADMIN_EMAIL);
  await page.locator('input[name="password"]').fill(PASSWORD);
  await page.getByRole('button', { name: /sign in/i }).click();
  await expect(page).toHaveURL(/\/dashboard/);
}

// =========================================================================
// Auth gate — the whole /admin segment 404s for non-admins
// =========================================================================
test.describe('Admin funnel — gates', () => {
  test('redirects unauthenticated request to login', async ({ request }) => {
    const res = await request.get('/admin/funnel', { maxRedirects: 0 });
    expect([302, 307]).toContain(res.status());
    expect(res.headers()['location']).toContain('/login');
  });

  test('404 for authenticated non-admin', async ({ page }) => {
    const email = uniqueEmail('funnel-nonadmin');
    await registerAndLogin(page, {
      email,
      password: PASSWORD,
      name: 'Non Admin',
      phone: uniquePhone(),
      category: 'teaching',
    });
    try {
      const res = await page.goto('/admin/funnel');
      expect(res?.status()).toBe(404);
    } finally {
      await deleteUser(email);
    }
  });
});

// =========================================================================
// Dashboard — renders the funnel, the numbers, and the category breakdown
// =========================================================================
test.describe('Admin funnel — dashboard', () => {
  test.skip(!ADMIN_EMAIL, 'set PLAYWRIGHT_ADMIN_EMAIL (and add it to ADMIN_EMAILS)');

  test('renders funnel stages, numbers, and signups by category', async ({ page }) => {
    // Seed a known free user with a submitted teaching assessment via service
    // role so the funnel + the Teaching category are guaranteed to have data,
    // independent of whatever else is in the DB.
    const email = uniqueEmail('funnel-seed');
    const { error } = await svc().auth.admin.createUser({
      email,
      password: PASSWORD,
      email_confirm: true,
      user_metadata: { name: 'Funnel Seed', phone: `27${uniquePhone().slice(1)}`, category: 'teaching' },
    });
    if (error) throw new Error(`seed createUser failed: ${error.message}`);
    const uid = await findUserIdByEmail(email);
    await insertSubmittedTeachingAssessment(uid);

    try {
      await seedAndLoginAdmin(page);
      await page.goto('/admin/funnel');

      await expect(page.getByRole('heading', { name: /funnel & metrics/i })).toBeVisible();

      // Conversion funnel section + a known stage
      await expect(page.getByText('Conversion funnel', { exact: true })).toBeVisible();
      await expect(page.getByText('Registered', { exact: true })).toBeVisible();
      await expect(page.getByText('Submitted assessment', { exact: true })).toBeVisible();

      // Numbers snapshot
      await expect(page.getByText('The numbers', { exact: true })).toBeVisible();
      await expect(page.getByText('Registered users', { exact: true })).toBeVisible();

      // This-week momentum strip
      await expect(page.getByText(/This week — last 7 days/i)).toBeVisible();
      await expect(page.getByText('New signups', { exact: true })).toBeVisible();

      // AI coach activity section
      await expect(page.getByText('AI coach activity', { exact: true })).toBeVisible();
      await expect(page.getByText('Used the coach', { exact: true })).toBeVisible();

      // Traffic deep-links out to Vercel (new tab, per the external-links rule)
      await expect(page.getByText('Traffic', { exact: true })).toBeVisible();
      const analytics = page.getByRole('link', { name: /Web Analytics/i });
      await expect(analytics).toHaveAttribute('href', /vercel\.com\/.+\/analytics/);
      await expect(analytics).toHaveAttribute('target', '_blank');
      await expect(analytics).toHaveAttribute('rel', /noopener/);

      // Signups by category — the seeded Teaching row must appear
      await expect(page.getByText(/Signups by category/i)).toBeVisible();
      await expect(page.getByText('Teaching', { exact: true })).toBeVisible();

      // Nav link is present and points at the funnel
      await expect(page.getByRole('link', { name: 'Funnel' })).toBeVisible();
    } finally {
      await deleteUser(email);
      await deleteUser(ADMIN_EMAIL);
    }
  });
});
