import { test, expect } from '@playwright/test';
import {
  deleteUser,
  findUserIdByEmail,
  insertSubmittedTeachingAssessment,
  makePaid,
  registerAndLogin,
  seedReport,
  uniqueEmail,
  uniquePhone,
} from './helpers';

const PASSWORD = 'Test12345!';

// Payments are shelved by default (NEXT_PUBLIC_PAYMENTS_ENABLED unset). While
// off, every registered user has full report access for free — the paywall and
// the paid-only API gates flip to open. These tests branch on the flag so the
// suite stays correct in both modes.
const PAYMENTS_ENABLED = process.env.NEXT_PUBLIC_PAYMENTS_ENABLED === 'true';

// =========================================================================
// Score page
// =========================================================================

test.describe('Paid tier — score page', () => {
  test('teaching: completed assessment → score page renders band + access state', async ({ page }) => {
    const email = uniqueEmail('score');
    await registerAndLogin(page, {
      email,
      password: PASSWORD,
      name: 'Score Tester',
      phone: uniquePhone(),
      category: 'teaching',
    });
    try {
      const userId = await findUserIdByEmail(email);
      await insertSubmittedTeachingAssessment(userId);

      await page.goto('/members/teaching/score');
      await expect(page.getByRole('heading', { name: /your score/i })).toBeVisible();
      // Band pill (one of the three)
      await expect(
        page.getByText(/strong potential|needs prep|high blockers/i).first(),
      ).toBeVisible();
      // Strength + blocker teasers — LLM may produce different copy run-to-run,
      // but the two labels are template-driven so we can assert on them.
      await expect(page.getByText(/^what's working$/i)).toBeVisible();
      await expect(page.getByText(/^biggest blocker$/i)).toBeVisible();
      if (PAYMENTS_ENABLED) {
        // Paywall CTA — unpaid user
        await expect(page.getByRole('button', { name: /get my action plan/i })).toBeVisible();
      } else {
        // Payments shelved — registered user gets the full report free, no paywall
        await expect(page.getByRole('heading', { name: /your full report is ready/i })).toBeVisible();
        await expect(page.getByRole('button', { name: /get my action plan/i })).toHaveCount(0);
      }
    } finally {
      await deleteUser(email);
    }
  });

  test('non-rubric category (accounting) redirects to /dashboard', async ({ page }) => {
    const email = uniqueEmail('no-rubric');
    await registerAndLogin(page, {
      email,
      password: PASSWORD,
      name: 'No Rubric Tester',
      phone: uniquePhone(),
      category: 'accounting',
    });
    try {
      // Visiting the score page for a category without a rubric should bounce
      // to /dashboard (teaching-only pilot — see project_teaching_only_pilot memory).
      await page.goto('/members/accounting/score');
      await expect(page).toHaveURL(/\/dashboard/);
    } finally {
      await deleteUser(email);
    }
  });

  test('no submitted assessment → redirects to /assessment', async ({ page }) => {
    const email = uniqueEmail('no-assessment');
    await registerAndLogin(page, {
      email,
      password: PASSWORD,
      name: 'Empty Tester',
      phone: uniquePhone(),
      category: 'teaching',
    });
    try {
      await page.goto('/members/teaching/score');
      await expect(page).toHaveURL(/\/members\/teaching\/assessment/);
    } finally {
      await deleteUser(email);
    }
  });
});

// =========================================================================
// Paid dashboard surfaces
// =========================================================================

test.describe('Paid tier — dashboard surfaces', () => {
  test('paid user without paid_reports row sees pending skeleton + optional call CTA', async ({ page }) => {
    const email = uniqueEmail('paid-pending');
    await registerAndLogin(page, {
      email,
      password: PASSWORD,
      name: 'Paid Pending',
      phone: uniquePhone(),
      category: 'teaching',
    });
    try {
      const userId = await findUserIdByEmail(email);
      await makePaid(userId, 5);
      // Submitted check but no seedReport — the realistic mid-generation state
      // (the report card only shows once the eligibility check is in).
      await insertSubmittedTeachingAssessment(userId);

      await page.goto('/dashboard');
      await expect(page.getByRole('heading', { name: /preparing your personalised report/i })).toBeVisible();
      // Optional call CTA is always visible for paid users
      await expect(page.getByRole('link', { name: /book a 15-min review call/i })).toBeVisible();
      // Download CTA must NOT be present in pending state
      await expect(page.getByRole('link', { name: /download report/i })).toHaveCount(0);
      // Assistant card replaces the old follow-up form for paid users
      await expect(page.getByRole('link', { name: /open your assistant/i })).toBeVisible();
    } finally {
      await deleteUser(email);
    }
  });

  test('paid user with completed report sees download CTA', async ({ page }) => {
    const email = uniqueEmail('paid-completed');
    await registerAndLogin(page, {
      email,
      password: PASSWORD,
      name: 'Paid Completed',
      phone: uniquePhone(),
      category: 'teaching',
    });
    try {
      const userId = await findUserIdByEmail(email);
      await makePaid(userId, 5);
      // pdf_path doesn't need to point at a real object for the dashboard render
      // — only createSignedUrl uses it, and Supabase will hand back a signed URL
      // even for non-existent paths (404s on fetch, but render-time succeeds).
      await seedReport(userId, { status: 'completed', pdfPath: `${userId}/report-test.pdf` });

      await page.goto('/dashboard');
      await expect(page.getByRole('heading', { name: /personalised report ready/i })).toBeVisible();
      await expect(page.getByRole('link', { name: /download report.*pdf/i })).toBeVisible();
      await expect(page.getByRole('link', { name: /book a 15-min review call/i })).toBeVisible();
    } finally {
      await deleteUser(email);
    }
  });

  test('paid user with completed report + call_notes sees Notes card', async ({ page }) => {
    const email = uniqueEmail('paid-notes');
    await registerAndLogin(page, {
      email,
      password: PASSWORD,
      name: 'Paid Notes',
      phone: uniquePhone(),
      category: 'teaching',
    });
    try {
      const userId = await findUserIdByEmail(email);
      await makePaid(userId, 5);
      await seedReport(userId, {
        status: 'completed',
        pdfPath: `${userId}/report-notes-test.pdf`,
        callNotes:
          'On the call we agreed you would start with SAPS clearance this week.\n\nNext steps: book a follow-up in 4 weeks once the apostille is back.',
      });

      await page.goto('/dashboard');
      // All three primary cards visible together
      await expect(page.getByRole('heading', { name: /personalised report ready/i })).toBeVisible();
      await expect(page.getByRole('link', { name: /book a 15-min review call/i })).toBeVisible();
      await expect(page.getByRole('heading', { name: /notes from our session/i })).toBeVisible();
      await expect(page.getByText(/start with SAPS clearance this week/i)).toBeVisible();
      await expect(page.getByText(/book a follow-up in 4 weeks/i)).toBeVisible();
    } finally {
      await deleteUser(email);
    }
  });

  test('paid user without call_notes does not see Notes card', async ({ page }) => {
    const email = uniqueEmail('paid-no-notes');
    await registerAndLogin(page, {
      email,
      password: PASSWORD,
      name: 'Paid NoNotes',
      phone: uniquePhone(),
      category: 'teaching',
    });
    try {
      const userId = await findUserIdByEmail(email);
      await makePaid(userId, 5);
      await seedReport(userId, {
        status: 'completed',
        pdfPath: `${userId}/report-test.pdf`,
        // no callNotes set
      });

      await page.goto('/dashboard');
      await expect(page.getByRole('heading', { name: /personalised report ready/i })).toBeVisible();
      await expect(page.getByRole('heading', { name: /notes from our session/i })).toHaveCount(0);
    } finally {
      await deleteUser(email);
    }
  });

  test('paid user with failed report (< 5 attempts) sees Try again button', async ({ page }) => {
    const email = uniqueEmail('paid-failed');
    await registerAndLogin(page, {
      email,
      password: PASSWORD,
      name: 'Paid Failed',
      phone: uniquePhone(),
      category: 'teaching',
    });
    try {
      const userId = await findUserIdByEmail(email);
      await makePaid(userId, 5);
      await seedReport(userId, {
        status: 'failed',
        attempts: 2,
        error: 'openai_timeout',
      });

      await page.goto('/dashboard');
      await expect(page.getByRole('heading', { name: /something went wrong/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /try again/i })).toBeVisible();
    } finally {
      await deleteUser(email);
    }
  });

  test('paid user with failed report at retry cap sees support-needed copy, no Try again', async ({ page }) => {
    const email = uniqueEmail('paid-locked');
    await registerAndLogin(page, {
      email,
      password: PASSWORD,
      name: 'Paid Locked',
      phone: uniquePhone(),
      category: 'teaching',
    });
    try {
      const userId = await findUserIdByEmail(email);
      await makePaid(userId, 5);
      await seedReport(userId, {
        status: 'failed',
        attempts: 5,
        error: 'persistent_failure',
      });

      await page.goto('/dashboard');
      await expect(page.getByRole('heading', { name: /we need to fix this manually/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /try again/i })).toHaveCount(0);
    } finally {
      await deleteUser(email);
    }
  });

  test('free user sees no paid surfaces on dashboard', async ({ page }) => {
    const email = uniqueEmail('free-dash');
    await registerAndLogin(page, {
      email,
      password: PASSWORD,
      name: 'Free Tester',
      phone: uniquePhone(),
      category: 'teaching',
    });
    try {
      await page.goto('/dashboard');
      await expect(page.getByRole('heading', { name: /preparing your personalised report/i })).toHaveCount(0);
      await expect(page.getByRole('heading', { name: /personalised report ready/i })).toHaveCount(0);
      await expect(page.getByRole('link', { name: /book a 15-min review call/i })).toHaveCount(0);
      await expect(page.getByText(/of 5 left/i)).toHaveCount(0);
    } finally {
      await deleteUser(email);
    }
  });
});

// =========================================================================
// Booking gate
// =========================================================================

test.describe('Paid tier — booking page', () => {
  test('free user → /book redirects to /dashboard', async ({ page }) => {
    const email = uniqueEmail('book-free');
    await registerAndLogin(page, {
      email,
      password: PASSWORD,
      name: 'Book Free',
      phone: uniquePhone(),
      category: 'teaching',
    });
    try {
      await page.goto('/members/teaching/book');
      await expect(page).toHaveURL(/\/dashboard/);
    } finally {
      await deleteUser(email);
    }
  });

  test('paid user sees consent checkbox + locked-overlay before tick', async ({ page }) => {
    const email = uniqueEmail('book-paid');
    await registerAndLogin(page, {
      email,
      password: PASSWORD,
      name: 'Book Paid',
      phone: uniquePhone(),
      category: 'teaching',
    });
    try {
      const userId = await findUserIdByEmail(email);
      await makePaid(userId);

      await page.goto('/members/teaching/book');
      await expect(
        page.getByText(
          /I agree that this call may be recorded for the purpose of preparing or improving my work-abroad guidance/i,
        ),
      ).toBeVisible();
      await expect(page.getByText(/tick the consent checkbox/i)).toBeVisible();
      await expect(page.locator('iframe')).toHaveCount(0);
    } finally {
      await deleteUser(email);
    }
  });
});

// =========================================================================
// Status + regenerate API routes
// =========================================================================

test.describe('Paid tier — /api/reports/status', () => {
  // page.request inherits the page's session cookies; the top-level `request`
  // fixture does NOT, so unauthenticated assertions belong with `request` and
  // every authenticated assertion uses `page.request`.
  test('returns 401 for unauthenticated request', async ({ request }) => {
    const res = await request.get('/api/reports/status');
    expect(res.status()).toBe(401);
  });

  test('registered user without report: 403 when payments on, 200 missing when shelved', async ({ page }) => {
    const email = uniqueEmail('status-free');
    await registerAndLogin(page, {
      email,
      password: PASSWORD,
      name: 'Status Free',
      phone: uniquePhone(),
      category: 'teaching',
    });
    try {
      const res = await page.request.get('/api/reports/status');
      if (PAYMENTS_ENABLED) {
        expect(res.status()).toBe(403);
      } else {
        expect(res.status()).toBe(200);
        expect((await res.json()).status).toBe('missing');
      }
    } finally {
      await deleteUser(email);
    }
  });

  test('returns missing status for paid user with no paid_reports row', async ({ page }) => {
    const email = uniqueEmail('status-missing');
    await registerAndLogin(page, {
      email,
      password: PASSWORD,
      name: 'Status Missing',
      phone: uniquePhone(),
      category: 'teaching',
    });
    try {
      const userId = await findUserIdByEmail(email);
      await makePaid(userId);

      const res = await page.request.get('/api/reports/status');
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.status).toBe('missing');
      expect(body.pdfUrl).toBeNull();
      expect(body.canRetry).toBe(false);
    } finally {
      await deleteUser(email);
    }
  });

  test('returns completed status with download URL when report ready', async ({ page }) => {
    const email = uniqueEmail('status-ready');
    await registerAndLogin(page, {
      email,
      password: PASSWORD,
      name: 'Status Ready',
      phone: uniquePhone(),
      category: 'teaching',
    });
    try {
      const userId = await findUserIdByEmail(email);
      await makePaid(userId);
      // pdf_path can point at a non-existent object — the status route hands
      // back /api/reports/download (which signs on click), so we don't need to
      // upload anything to storage for this assertion.
      await seedReport(userId, { status: 'completed', pdfPath: `${userId}/report-status-test.pdf` });

      const res = await page.request.get('/api/reports/status');
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.status).toBe('completed');
      expect(body.pdfUrl).toBe('/api/reports/download');
    } finally {
      await deleteUser(email);
    }
  });

  test('returns canRetry=false for failed status at attempt cap', async ({ page }) => {
    const email = uniqueEmail('status-locked');
    await registerAndLogin(page, {
      email,
      password: PASSWORD,
      name: 'Status Locked',
      phone: uniquePhone(),
      category: 'teaching',
    });
    try {
      const userId = await findUserIdByEmail(email);
      await makePaid(userId);
      await seedReport(userId, { status: 'failed', attempts: 5, error: 'cap_reached' });

      const res = await page.request.get('/api/reports/status');
      const body = await res.json();
      expect(body.status).toBe('failed');
      expect(body.canRetry).toBe(false);
      expect(body.error).toBe('cap_reached');
    } finally {
      await deleteUser(email);
    }
  });
});

test.describe('Paid tier — /api/reports/regenerate', () => {
  test('returns 401 for unauthenticated request', async ({ request }) => {
    const res = await request.post('/api/reports/regenerate');
    expect(res.status()).toBe(401);
  });

  test('registered user without report: 403 when payments on, not gated when shelved', async ({ page }) => {
    const email = uniqueEmail('regen-free');
    await registerAndLogin(page, {
      email,
      password: PASSWORD,
      name: 'Regen Free',
      phone: uniquePhone(),
      category: 'teaching',
    });
    try {
      const res = await page.request.post('/api/reports/regenerate');
      if (PAYMENTS_ENABLED) {
        expect(res.status()).toBe(403);
      } else {
        // Full access — no paywall gate. With no submitted assessment the
        // background regen no-ops; the route still acks 200.
        expect(res.status()).toBe(200);
      }
    } finally {
      await deleteUser(email);
    }
  });

  test('returns 429 when attempts already at cap', async ({ page }) => {
    const email = uniqueEmail('regen-cap');
    await registerAndLogin(page, {
      email,
      password: PASSWORD,
      name: 'Regen Cap',
      phone: uniquePhone(),
      category: 'teaching',
    });
    try {
      const userId = await findUserIdByEmail(email);
      await makePaid(userId);
      await seedReport(userId, { status: 'failed', attempts: 5 });

      const res = await page.request.post('/api/reports/regenerate');
      expect(res.status()).toBe(429);
    } finally {
      await deleteUser(email);
    }
  });
});

// =========================================================================
// /paid landing redirect
// =========================================================================

test.describe('Paid tier — /paid landing', () => {
  test('paid user visiting /paid redirects straight to /dashboard', async ({ page }) => {
    const email = uniqueEmail('paid-redirect');
    await registerAndLogin(page, {
      email,
      password: PASSWORD,
      name: 'Paid Redirect',
      phone: uniquePhone(),
      category: 'teaching',
    });
    try {
      const userId = await findUserIdByEmail(email);
      await makePaid(userId);

      await page.goto('/members/teaching/paid');
      await expect(page).toHaveURL(/\/dashboard/);
    } finally {
      await deleteUser(email);
    }
  });
});

// =========================================================================
// WhatsApp visibility — general WhatsApp CTAs were removed from public
// surfaces (header, footer, demo, FAQ). The nav no longer carries a WhatsApp
// pill for any user; the dashboard has no wa.me links for a normal account.
// =========================================================================

test.describe('WhatsApp CTAs removed from nav + dashboard', () => {
  test('free user dashboard: no WhatsApp pill in nav', async ({ page }) => {
    const email = uniqueEmail('wa-free');
    await registerAndLogin(page, {
      email,
      password: PASSWORD,
      name: 'WA Free',
      phone: uniquePhone(),
      category: 'teaching',
    });
    try {
      await page.goto('/dashboard');
      await expect(
        page.locator('nav').getByRole('link', { name: /whatsapp/i }),
      ).toHaveCount(0);
    } finally {
      await deleteUser(email);
    }
  });

  test('paid user dashboard: no wa.me links anywhere', async ({ page }) => {
    const email = uniqueEmail('wa-paid');
    await registerAndLogin(page, {
      email,
      password: PASSWORD,
      name: 'WA Paid',
      phone: uniquePhone(),
      category: 'teaching',
    });
    try {
      const userId = await findUserIdByEmail(email);
      await makePaid(userId);

      await page.goto('/dashboard');
      const waHrefs = await page.locator('a[href*="wa.me/"]').count();
      expect(waHrefs).toBe(0);
    } finally {
      await deleteUser(email);
    }
  });
});
