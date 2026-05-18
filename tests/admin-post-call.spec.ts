import { test, expect } from '@playwright/test';
import {
  deleteUser,
  findUserIdByEmail,
  makePaid,
  registerAndLogin,
  seedReport,
  svc,
  uniqueEmail,
  uniquePhone,
} from './helpers';

const PASSWORD = 'Test12345!';

// Happy-path tests require an admin email configured in ADMIN_EMAILS. Set
// PLAYWRIGHT_ADMIN_EMAIL in .env.local AND add the same value to
// ADMIN_EMAILS (then restart the dev server). Without it, only the gate
// tests run.
const ADMIN_EMAIL = process.env.PLAYWRIGHT_ADMIN_EMAIL ?? '';

// =========================================================================
// /api/admin/post-call/save-notes — auth + validation gates
// =========================================================================

test.describe('Admin save-notes — gates', () => {
  test('returns 404 for unauthenticated request', async ({ request }) => {
    const res = await request.post('/api/admin/post-call/save-notes', {
      data: { userId: '00000000-0000-0000-0000-000000000000', callNotes: 'x' },
    });
    expect(res.status()).toBe(404);
  });

  test('returns 404 for authenticated non-admin', async ({ page }) => {
    const email = uniqueEmail('savenotes-nonadmin');
    await registerAndLogin(page, {
      email,
      password: PASSWORD,
      name: 'Non Admin',
      phone: uniquePhone(),
      category: 'teaching',
    });
    try {
      const res = await page.request.post('/api/admin/post-call/save-notes', {
        data: { userId: '00000000-0000-0000-0000-000000000000', callNotes: 'x' },
      });
      expect(res.status()).toBe(404);
    } finally {
      await deleteUser(email);
    }
  });
});

// =========================================================================
// /api/admin/post-call/regenerate — auth gate
// =========================================================================

test.describe('Admin force-regenerate — gates', () => {
  test('returns 404 for unauthenticated request', async ({ request }) => {
    const res = await request.post('/api/admin/post-call/regenerate', {
      data: { userId: '00000000-0000-0000-0000-000000000000' },
    });
    expect(res.status()).toBe(404);
  });

  test('returns 404 for authenticated non-admin', async ({ page }) => {
    const email = uniqueEmail('regen-nonadmin');
    await registerAndLogin(page, {
      email,
      password: PASSWORD,
      name: 'Non Admin',
      phone: uniquePhone(),
      category: 'teaching',
    });
    try {
      const res = await page.request.post('/api/admin/post-call/regenerate', {
        data: { userId: '00000000-0000-0000-0000-000000000000' },
      });
      expect(res.status()).toBe(404);
    } finally {
      await deleteUser(email);
    }
  });
});

// =========================================================================
// Happy paths — require PLAYWRIGHT_ADMIN_EMAIL (and it must be in
// ADMIN_EMAILS in .env.local, with dev server restarted)
// =========================================================================

test.describe('Admin save-notes — happy path', () => {
  test.skip(!ADMIN_EMAIL, 'PLAYWRIGHT_ADMIN_EMAIL not set');

  test('admin saves notes → row populated → buyer dashboard shows Notes card', async ({ page, browser }) => {
    // Buyer setup
    const buyerEmail = uniqueEmail('savenotes-buyer');
    await registerAndLogin(page, {
      email: buyerEmail,
      password: PASSWORD,
      name: 'Notes Buyer',
      phone: uniquePhone(),
      category: 'teaching',
    });
    const buyerId = await findUserIdByEmail(buyerEmail);
    await makePaid(buyerId, 5);
    await seedReport(buyerId, {
      status: 'completed',
      pdfPath: `${buyerId}/report-test.pdf`,
    });

    // Admin context (separate browser context so cookies don't collide)
    const adminCtx = await browser.newContext();
    const adminPage = await adminCtx.newPage();
    try {
      // Admin seeded directly via service role (real-world: admin already exists)
      await svc().auth.admin.createUser({
        email: ADMIN_EMAIL,
        password: PASSWORD,
        email_confirm: true,
        user_metadata: { name: 'Admin', category: 'teaching' },
      });

      await adminPage.goto('/login');
      await adminPage.locator('input[name="email"]').fill(ADMIN_EMAIL);
      await adminPage.locator('input[name="password"]').fill(PASSWORD);
      await adminPage.getByRole('button', { name: /sign in/i }).click();
      await expect(adminPage).toHaveURL(/\/dashboard/);

      // Mock Brevo so the test doesn't actually send mail
      await adminPage.route('https://api.brevo.com/**', (route) =>
        route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({ messageId: 'mock' }),
        }),
      );

      const notes = 'Test notes from the call. We agreed on starting SAPS clearance this week.';
      const res = await adminPage.request.post('/api/admin/post-call/save-notes', {
        data: { userId: buyerId, callNotes: notes },
      });
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.ok).toBe(true);
      expect(body.emailed).toBe(true);

      // Verify DB write
      const { data: report } = await svc()
        .from('paid_reports')
        .select('call_notes')
        .eq('user_id', buyerId)
        .single();
      expect(report?.call_notes).toContain('SAPS clearance');

      // Buyer reloads dashboard — Notes card should now appear
      await page.goto('/dashboard');
      await expect(page.getByRole('heading', { name: /notes from our session/i })).toBeVisible();
      await expect(page.getByText(/SAPS clearance this week/i)).toBeVisible();
    } finally {
      await adminCtx.close();
      await deleteUser(ADMIN_EMAIL);
      await deleteUser(buyerEmail);
    }
  });
});

test.describe('Admin force-regenerate — happy path', () => {
  test.skip(!ADMIN_EMAIL, 'PLAYWRIGHT_ADMIN_EMAIL not set');

  test('bypasses the 5-attempt cap and flips status to pending', async ({ page, browser }) => {
    const buyerEmail = uniqueEmail('regen-buyer');
    await registerAndLogin(page, {
      email: buyerEmail,
      password: PASSWORD,
      name: 'Regen Buyer',
      phone: uniquePhone(),
      category: 'teaching',
    });
    const buyerId = await findUserIdByEmail(buyerEmail);
    await makePaid(buyerId);
    await seedReport(buyerId, { status: 'failed', attempts: 5, error: 'past_cap' });

    const adminCtx = await browser.newContext();
    const adminPage = await adminCtx.newPage();
    try {
      await svc().auth.admin.createUser({
        email: ADMIN_EMAIL,
        password: PASSWORD,
        email_confirm: true,
        user_metadata: { name: 'Admin', category: 'teaching' },
      });

      await adminPage.goto('/login');
      await adminPage.locator('input[name="email"]').fill(ADMIN_EMAIL);
      await adminPage.locator('input[name="password"]').fill(PASSWORD);
      await adminPage.getByRole('button', { name: /sign in/i }).click();
      await expect(adminPage).toHaveURL(/\/dashboard/);

      const res = await adminPage.request.post('/api/admin/post-call/regenerate', {
        data: { userId: buyerId },
      });
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.ok).toBe(true);
      // Capped user retry route would have returned 429; admin bypasses
      expect(body.attempts).toBe(6);

      // Status should now read pending (waitUntil fires async, but the synchronous
      // upsert happens before the response returns)
      const { data: report } = await svc()
        .from('paid_reports')
        .select('generation_status, generation_attempts')
        .eq('user_id', buyerId)
        .single();
      expect(report?.generation_status).toBe('pending');
      expect(report?.generation_attempts).toBe(6);
    } finally {
      await adminCtx.close();
      await deleteUser(ADMIN_EMAIL);
      await deleteUser(buyerEmail);
    }
  });
});
