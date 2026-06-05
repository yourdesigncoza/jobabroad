import { test, expect, type Page } from '@playwright/test';
import {
  deleteUser,
  findUserIdByEmail,
  insertSubmittedTeachingAssessment,
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

test.describe('Admin users dashboard — about-you column', () => {
  test.skip(!ADMIN_EMAIL, 'PLAYWRIGHT_ADMIN_EMAIL not set');

  test('shows each member\'s free-text about-you, with Show more for long answers', async ({ page, browser }) => {
    // Member A: standard seeded assessment → short about-text (renders in full).
    const shortEmail = uniqueEmail('about-short');
    await registerAndLogin(page, {
      email: shortEmail,
      password: PASSWORD,
      name: 'About Short',
      phone: uniquePhone(),
      category: 'teaching',
    });
    const shortId = await findUserIdByEmail(shortEmail);
    await insertSubmittedTeachingAssessment(shortId);
    const SHORT_ABOUT = 'I have a hearing impairment and would prefer a school experienced in supporting it.';

    // Member B: same seed, but overwrite about.summary with a >140-char answer so
    // the cell clamps and offers Show more / Show less.
    const longEmail = uniqueEmail('about-long');
    const longCtx = await browser.newContext();
    const longPage = await longCtx.newPage();
    await registerAndLogin(longPage, {
      email: longEmail,
      password: PASSWORD,
      name: 'About Long',
      phone: uniquePhone(),
      category: 'teaching',
    });
    await longCtx.close();
    const longId = await findUserIdByEmail(longEmail);
    await insertSubmittedTeachingAssessment(longId);
    const LONG_ABOUT =
      'I am a single parent of two school-age children and I am specifically looking for a placement in a country with strong public schooling and an established South African community so the kids settle quickly.';
    const { data: longRow } = await svc()
      .from('assessments')
      .select('id, data')
      .eq('user_id', longId)
      .single();
    const mergedData = {
      ...(longRow!.data as Record<string, unknown>),
      'about.summary': { q: 'about.summary.v1', v: LONG_ABOUT },
    };
    await svc().from('assessments').update({ data: mergedData }).eq('id', longRow!.id);

    const adminCtx = await browser.newContext();
    const adminPage = await adminCtx.newPage();
    try {
      await seedAndLoginAdmin(adminPage);
      await adminPage.goto('/admin');
      await expect(adminPage.getByRole('heading', { name: /registered members/i })).toBeVisible();

      // Short answer renders in full, no toggle needed.
      const shortMemberRow = adminPage.locator('tr', { hasText: shortEmail });
      await expect(shortMemberRow.getByText(SHORT_ABOUT)).toBeVisible();
      await expect(shortMemberRow.getByRole('button', { name: /show more/i })).toHaveCount(0);

      // Long answer is clamped behind Show more; expanding reveals the tail.
      const longMemberRow = adminPage.locator('tr', { hasText: longEmail });
      const tail = 'so the kids settle quickly.';
      await expect(longMemberRow.getByText(tail, { exact: false })).toHaveCount(0);
      await longMemberRow.getByRole('button', { name: /show more/i }).click();
      await expect(longMemberRow.getByText(tail, { exact: false })).toBeVisible();
      await expect(longMemberRow.getByRole('button', { name: /show less/i })).toBeVisible();
    } finally {
      await adminCtx.close();
      await deleteUser(ADMIN_EMAIL);
      await deleteUser(shortEmail);
      await deleteUser(longEmail);
    }
  });
});

test.describe('Admin users dashboard — score column', () => {
  test.skip(!ADMIN_EMAIL, 'PLAYWRIGHT_ADMIN_EMAIL not set');

  test('shows an at-a-glance score + band for submitted members, dash for unscored', async ({ page, browser }) => {
    // Member A: a submitted teaching assessment → has a computed score + band.
    const scoredEmail = uniqueEmail('score-done');
    await registerAndLogin(page, {
      email: scoredEmail,
      password: PASSWORD,
      name: 'Score Done',
      phone: uniquePhone(),
      category: 'teaching',
    });
    const scoredId = await findUserIdByEmail(scoredEmail);
    await insertSubmittedTeachingAssessment(scoredId);

    // Member B: registered but never completed the check → no score (dash).
    const unscoredEmail = uniqueEmail('score-none');
    const ctxB = await browser.newContext();
    const pageB = await ctxB.newPage();
    await registerAndLogin(pageB, {
      email: unscoredEmail,
      password: PASSWORD,
      name: 'Score None',
      phone: uniquePhone(),
      category: 'teaching',
    });
    await ctxB.close();

    const adminCtx = await browser.newContext();
    const adminPage = await adminCtx.newPage();
    try {
      await seedAndLoginAdmin(adminPage);
      await adminPage.goto('/admin');
      await expect(adminPage.getByRole('heading', { name: /registered members/i })).toBeVisible();
      await expect(adminPage.getByRole('columnheader', { name: 'Score' })).toBeVisible();

      // Submitted member: a number out of 100 + one of the three band chips.
      const scoredRow = adminPage.locator('tr', { hasText: scoredEmail });
      await expect(scoredRow.getByText(/\d{1,3}\/100/)).toBeVisible();
      await expect(
        scoredRow.getByText(/High blockers|Needs prep|Strong potential/),
      ).toBeVisible();

      // Unscored member: no "/100" in their row (score cell shows a dash).
      const unscoredRow = adminPage.locator('tr', { hasText: unscoredEmail });
      await expect(unscoredRow.getByText(/\d{1,3}\/100/)).toHaveCount(0);
    } finally {
      await adminCtx.close();
      await deleteUser(ADMIN_EMAIL);
      await deleteUser(scoredEmail);
      await deleteUser(unscoredEmail);
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

// =========================================================================
// /api/admin/users/update + /delete — auth gates
// =========================================================================

test.describe('Admin user update/delete — gates', () => {
  const FAKE_ID = '00000000-0000-0000-0000-000000000000';

  test('update + delete return 404 for unauthenticated requests', async ({ request }) => {
    const u = await request.post('/api/admin/users/update', { data: { userId: FAKE_ID, name: 'X' } });
    expect(u.status()).toBe(404);
    const d = await request.post('/api/admin/users/delete', { data: { userId: FAKE_ID } });
    expect(d.status()).toBe(404);
  });

  test('update + delete return 404 for authenticated non-admin', async ({ page }) => {
    const email = uniqueEmail('rud-nonadmin');
    await registerAndLogin(page, {
      email,
      password: PASSWORD,
      name: 'Non Admin',
      phone: uniquePhone(),
      category: 'teaching',
    });
    try {
      const u = await page.request.post('/api/admin/users/update', { data: { userId: FAKE_ID, name: 'X' } });
      expect(u.status()).toBe(404);
      const d = await page.request.post('/api/admin/users/delete', { data: { userId: FAKE_ID } });
      expect(d.status()).toBe(404);
    } finally {
      await deleteUser(email);
    }
  });
});

// =========================================================================
// Admin user RUD — happy paths (require PLAYWRIGHT_ADMIN_EMAIL)
// =========================================================================

test.describe('Admin user RUD — happy path', () => {
  test.skip(!ADMIN_EMAIL, 'PLAYWRIGHT_ADMIN_EMAIL not set');

  test('admin edits a member name, phone, and email', async ({ page, browser }) => {
    const email = uniqueEmail('rud-edit');
    await registerAndLogin(page, {
      email,
      password: PASSWORD,
      name: 'Edit Me',
      phone: uniquePhone(),
      category: 'teaching',
    });
    const userId = await findUserIdByEmail(email);
    const newEmail = uniqueEmail('rud-edited');

    const adminCtx = await browser.newContext();
    const adminPage = await adminCtx.newPage();
    try {
      await seedAndLoginAdmin(adminPage);
      const r = await adminPage.request.post('/api/admin/users/update', {
        data: { userId, name: 'Renamed Person', phone: '061 000 0001', email: newEmail },
      });
      expect(r.status()).toBe(200);
      expect((await r.json()).ok).toBe(true);

      const { data: prof } = await svc().from('profiles').select('name, phone').eq('user_id', userId).single();
      expect(prof?.name).toBe('Renamed Person');
      expect(prof?.phone).toBe('27610000001'); // normalised from 061 000 0001

      const { data: authUser } = await svc().auth.admin.getUserById(userId);
      expect(authUser?.user?.email).toBe(newEmail.toLowerCase());
    } finally {
      await adminCtx.close();
      await deleteUser(ADMIN_EMAIL);
      await svc().auth.admin.deleteUser(userId); // email changed; delete by id
    }
  });

  test('admin deletes a member — account + profile removed', async ({ page, browser }) => {
    const email = uniqueEmail('rud-del');
    await registerAndLogin(page, {
      email,
      password: PASSWORD,
      name: 'Delete Me',
      phone: uniquePhone(),
      category: 'teaching',
    });
    const userId = await findUserIdByEmail(email);

    // Seed a report PDF in Storage so we can prove the delete purges it.
    await svc()
      .storage.from('paid-reports')
      .upload(`${userId}/report-test.pdf`, Buffer.from('%PDF-1.4 test'), {
        contentType: 'application/pdf',
        upsert: true,
      });

    const adminCtx = await browser.newContext();
    const adminPage = await adminCtx.newPage();
    try {
      await seedAndLoginAdmin(adminPage);
      const r = await adminPage.request.post('/api/admin/users/delete', { data: { userId } });
      expect(r.status()).toBe(200);

      const { data: prof } = await svc().from('profiles').select('user_id').eq('user_id', userId).maybeSingle();
      expect(prof).toBeNull();
      const { data: authUser } = await svc().auth.admin.getUserById(userId);
      expect(authUser?.user).toBeFalsy();

      // Storage folder is now empty (the PDF blob was purged).
      const { data: files } = await svc().storage.from('paid-reports').list(userId);
      expect(files ?? []).toHaveLength(0);
    } finally {
      await adminCtx.close();
      await deleteUser(ADMIN_EMAIL);
    }
  });

  test('admin cannot delete their own account', async ({ browser }) => {
    const adminCtx = await browser.newContext();
    const adminPage = await adminCtx.newPage();
    try {
      await seedAndLoginAdmin(adminPage);
      const adminId = await findUserIdByEmail(ADMIN_EMAIL);
      const r = await adminPage.request.post('/api/admin/users/delete', { data: { userId: adminId } });
      expect(r.status()).toBe(409);
      expect((await r.json()).error).toBe('cannot_delete_self');
    } finally {
      await adminCtx.close();
      await deleteUser(ADMIN_EMAIL);
    }
  });

  test('members table shows Edit/Delete actions and an edit modal opens', async ({ page, browser }) => {
    const email = uniqueEmail('rud-ui');
    await registerAndLogin(page, {
      email,
      password: PASSWORD,
      name: 'UI Member',
      phone: uniquePhone(),
      category: 'teaching',
    });
    const adminCtx = await browser.newContext();
    const adminPage = await adminCtx.newPage();
    try {
      await seedAndLoginAdmin(adminPage);
      await adminPage.goto('/admin');
      await expect(adminPage.getByRole('button', { name: 'Edit' }).first()).toBeVisible();
      await expect(adminPage.getByRole('button', { name: 'Delete' }).first()).toBeVisible();

      await adminPage.getByRole('button', { name: 'Edit' }).first().click();
      await expect(adminPage.getByRole('heading', { name: /edit member/i })).toBeVisible();
      await adminPage.getByRole('button', { name: /^cancel$/i }).click();
      await expect(adminPage.getByRole('heading', { name: /edit member/i })).toHaveCount(0);
    } finally {
      await adminCtx.close();
      await deleteUser(ADMIN_EMAIL);
      await deleteUser(email);
    }
  });
});
