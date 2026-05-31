import { test, expect, type Page } from '@playwright/test';
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

/**
 * Seed an admin user via the service-role API and sign in through the /login
 * form. The profiles.handle_new_user trigger writes a NOT-NULL phone, so the
 * phone must be present in user_metadata or createUser fails with a database
 * error — and createUser does not throw on error, it returns it.
 */
async function seedAndLoginAdmin(adminPage: Page): Promise<void> {
  const { error } = await svc().auth.admin.createUser({
    email: ADMIN_EMAIL,
    password: PASSWORD,
    email_confirm: true,
    user_metadata: { name: 'Admin', phone: `27${uniquePhone().slice(1)}`, category: 'teaching' },
  });
  if (error) throw new Error(`admin createUser failed: ${error.message}`);

  await adminPage.goto('/login');
  await adminPage.locator('input[name="email"]').fill(ADMIN_EMAIL);
  await adminPage.locator('input[name="password"]').fill(PASSWORD);
  await adminPage.getByRole('button', { name: /sign in/i }).click();
  await expect(adminPage).toHaveURL(/\/dashboard/);
}

// =========================================================================
// /api/admin/users/chat-summary — auth gate
// =========================================================================

test.describe('Admin chat-summary — gates', () => {
  test('returns 404 for unauthenticated request', async ({ request }) => {
    const res = await request.post('/api/admin/users/chat-summary', {
      data: { userId: '00000000-0000-0000-0000-000000000000' },
    });
    expect(res.status()).toBe(404);
  });

  test('returns 404 for authenticated non-admin', async ({ page }) => {
    const email = uniqueEmail('chatsummary-nonadmin');
    await registerAndLogin(page, {
      email,
      password: PASSWORD,
      name: 'Non Admin',
      phone: uniquePhone(),
      category: 'teaching',
    });
    try {
      const res = await page.request.post('/api/admin/users/chat-summary', {
        data: { userId: '00000000-0000-0000-0000-000000000000' },
      });
      expect(res.status()).toBe(404);
    } finally {
      await deleteUser(email);
    }
  });
});

// =========================================================================
// /api/admin/users/regenerate — auth gate
// =========================================================================

test.describe('Admin force-regenerate — gates', () => {
  test('returns 404 for unauthenticated request', async ({ request }) => {
    const res = await request.post('/api/admin/users/regenerate', {
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
      const res = await page.request.post('/api/admin/users/regenerate', {
        data: { userId: '00000000-0000-0000-0000-000000000000' },
      });
      expect(res.status()).toBe(404);
    } finally {
      await deleteUser(email);
    }
  });
});

// =========================================================================
// Admin page guard — the shared layout must hide admin chrome from non-admins
// =========================================================================

test.describe('Admin page — layout guard', () => {
  test('authenticated non-admin visiting /admin gets no admin nav', async ({ page }) => {
    const email = uniqueEmail('admin-page-nonadmin');
    await registerAndLogin(page, {
      email,
      password: PASSWORD,
      name: 'Non Admin',
      phone: uniquePhone(),
      category: 'teaching',
    });
    try {
      await page.goto('/admin');
      // requireAdmin in the layout notFound()s before the nav renders.
      await expect(page.getByRole('navigation').getByRole('link', { name: 'Members' })).toHaveCount(0);
      await expect(page.getByRole('heading', { name: /registered members/i })).toHaveCount(0);
    } finally {
      await deleteUser(email);
    }
  });
});

// =========================================================================
// Happy paths — require PLAYWRIGHT_ADMIN_EMAIL (and it must be in
// ADMIN_EMAILS in .env.local, with dev server restarted)
// =========================================================================

test.describe('Admin users dashboard — happy path', () => {
  test.skip(!ADMIN_EMAIL, 'PLAYWRIGHT_ADMIN_EMAIL not set');

  test('admin sees registered members + chat-summary works for a chatter', async ({ page, browser }) => {
    // A freshly registered member who has also chatted with the assistant.
    const memberEmail = uniqueEmail('dash-member');
    await registerAndLogin(page, {
      email: memberEmail,
      password: PASSWORD,
      name: 'Dash Member',
      phone: uniquePhone(),
      category: 'teaching',
    });
    const memberId = await findUserIdByEmail(memberEmail);

    // Seed a short transcript directly so the chat-summary endpoint has input.
    await svc()
      .from('agent_messages')
      .insert([
        { user_id: memberId, role: 'user', content: 'How do I get my SACE registration sorted for the UAE?' },
        { user_id: memberId, role: 'assistant', content: 'You already hold an active SACE certificate, so focus next on your police clearance and passport renewal.' },
      ]);

    const adminCtx = await browser.newContext();
    const adminPage = await adminCtx.newPage();
    try {
      await seedAndLoginAdmin(adminPage);

      // Dashboard renders the registered-members view with this user on it.
      await adminPage.goto('/admin');
      await expect(
        adminPage.getByRole('heading', { name: /registered members/i }),
      ).toBeVisible();
      await expect(adminPage.getByText(memberEmail)).toBeVisible();

      // Admin header/nav is present: the admin nav links + log out.
      const adminNav = adminPage.getByRole('navigation');
      await expect(adminNav.getByRole('link', { name: 'Members' })).toBeVisible();
      await expect(adminNav.getByRole('link', { name: 'WhatsApp' })).toBeVisible();
      await expect(adminNav.getByRole('button', { name: /log out/i })).toBeVisible();
      // The WhatsApp link navigates to the other admin page (same header).
      await adminNav.getByRole('link', { name: 'WhatsApp' }).click();
      await expect(adminPage).toHaveURL(/\/admin\/wa-assistant/);
      await expect(
        adminPage.getByRole('navigation').getByRole('link', { name: 'Members' }),
      ).toBeVisible();

      // Chat-summary endpoint returns a non-empty result for a user with turns.
      const res = await adminPage.request.post('/api/admin/users/chat-summary', {
        data: { userId: memberId },
      });
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.empty).toBe(false);
      expect(body.userTurns).toBeGreaterThan(0);

      // A user with no messages summarises to empty.
      const empty = await adminPage.request.post('/api/admin/users/chat-summary', {
        data: { userId: '00000000-0000-0000-0000-000000000000' },
      });
      expect(empty.status()).toBe(200);
      expect((await empty.json()).empty).toBe(true);
    } finally {
      await adminCtx.close();
      await deleteUser(ADMIN_EMAIL);
      await deleteUser(memberEmail);
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
      await seedAndLoginAdmin(adminPage);

      const res = await adminPage.request.post('/api/admin/users/regenerate', {
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
