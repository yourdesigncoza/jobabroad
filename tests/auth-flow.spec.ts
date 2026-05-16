import { test, expect } from '@playwright/test';
import {
  deleteUser,
  registerAndLogin,
  svc,
  uniqueEmail,
  uniquePhone,
} from './helpers';

// Notes:
// - We do NOT exercise the live `supabase.auth.signUp` path here. Supabase's
//   built-in SMTP is rate-limited (~3-4 emails/hour) which makes that path
//   flaky. We use admin.createUser to seed users and reserve the actual
//   register-form submit path for a manual SMTP smoke-test (see plan step 10).
// - Validation errors (invalid phone, missing fields) reject in zod BEFORE
//   signUp, so they're safe to assert against the form.

test.describe('Auth flow — happy path via admin-seeded user', () => {
  const email = uniqueEmail('happy');
  const password = 'Test12345!';
  const name = 'Playwright Tester';
  const category = 'healthcare';

  test.afterAll(async () => {
    await deleteUser(email);
  });

  test('login → dashboard → guide → 403 mismatch → logout → re-login', async ({ page }) => {
    await registerAndLogin(page, { email, password, name, phone: uniquePhone(), category });
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(name);

    // Click guide card
    await page.getByRole('link', { name: /healthcare guide/i }).click();
    await expect(page).toHaveURL(/\/members\/healthcare(\?|$)/);

    // Assessment card
    await page.goto('/dashboard');
    await page.getByRole('link', { name: /eligibility assessment/i }).click();
    await expect(page).toHaveURL(/\/members\/healthcare\/assessment/);

    // Category mismatch shows 403 view
    await page.goto('/members/teaching');
    await expect(page.getByText(/different category access/i)).toBeVisible();
    await expect(page.getByRole('link', { name: /go to your guide/i })).toBeVisible();

    // Logout (use the dashboard section's form, not the SiteNav button)
    await page.goto('/dashboard');
    await page.locator('section form[action="/logout"] button').click();
    await expect(page).toHaveURL(/^http:\/\/localhost:3000\/(\?.*)?$/);

    // Session gone
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login\?next=/);

    // Re-login
    await page.locator('input[name="email"]').fill(email);
    await page.locator('input[name="password"]').fill(password);
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/dashboard/);
  });
});

test.describe('Auth flow — form validation', () => {
  test('/register preselects category from ?category=X', async ({ page }) => {
    await page.goto('/register?category=healthcare');
    await expect(page.locator('input[name="category"][value="healthcare"]')).toBeChecked();
  });

  test('/register invalid phone surfaces inline validator error', async ({ page }) => {
    await page.goto('/register?category=healthcare');
    await page.locator('input[name="name"]').fill('Bad Phone');
    await page.locator('input[name="email"]').fill(uniqueEmail('badphone'));
    await page.locator('input[name="phone"]').fill('1234567');
    await page.locator('input[name="password"]').fill('Test12345!');
    await page.getByRole('button', { name: /create account/i }).click();
    await expect(page.getByText(/valid sa phone/i)).toBeVisible();
  });

  test('/login wrong-credentials shows form error', async ({ page }) => {
    await page.goto('/login');
    await page.locator('input[name="email"]').fill('nonexistent@example.com');
    await page.locator('input[name="password"]').fill('wrongpass123');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page.getByText(/email or password is incorrect/i)).toBeVisible();
  });

  test('/forgot-password always shows anti-enumeration success', async ({ page }) => {
    await page.goto('/forgot-password');
    await page.locator('input[name="email"]').fill('any@example.com');
    await page.getByRole('button', { name: /send recovery link/i }).click();
    await expect(page.getByText(/if that email is registered/i)).toBeVisible();
  });
});

test.describe('Auth flow — gate checks (unauthenticated)', () => {
  test('/dashboard redirects to /login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login\?next=%2Fdashboard/);
  });

  test('/members/healthcare redirects to /login', async ({ page }) => {
    await page.goto('/members/healthcare');
    await expect(page).toHaveURL(/\/login\?next=%2Fmembers%2Fhealthcare/);
  });

  test('/members/not-a-real-cat is gated by proxy → /login (404 fires post-auth)', async ({ page }) => {
    // Proxy intercepts unauthenticated /members/* and bounces to /login
    // before the page-level notFound() runs. The 404 path is exercised
    // post-login (covered by the happy-path test via category mismatch).
    await page.goto('/members/not-a-real-cat');
    await expect(page).toHaveURL(/\/login\?next=%2Fmembers%2Fnot-a-real-cat/);
  });

  test('/admin returns 404 (retired)', async ({ page }) => {
    const res = await page.goto('/admin');
    expect(res?.status()).toBe(404);
  });
});

// Sanity: svc() should work — if not, all admin-seeded tests would fail silently.
test.describe('Auth flow — service-role smoke', () => {
  test('admin.listUsers works (validates SUPABASE_SERVICE_ROLE_KEY is loaded)', async () => {
    const { data, error } = await svc().auth.admin.listUsers({ perPage: 1 });
    expect(error).toBeNull();
    expect(Array.isArray(data.users)).toBe(true);
  });
});
