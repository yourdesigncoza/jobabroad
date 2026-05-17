import { test, expect } from '@playwright/test';
import {
  deleteUser,
  findUserIdByEmail,
  insertSubmittedTeachingAssessment,
  makePaid,
  registerAndLogin,
  uniqueEmail,
  uniquePhone,
} from './helpers';

const PASSWORD = 'Test12345!';

// =========================================================================
// Score page
// =========================================================================

test.describe('Paid tier — score page', () => {
  test('teaching: completed assessment → score page renders band + paywall', async ({ page }) => {
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
      // Paywall CTA — free user
      await expect(page.getByRole('button', { name: /unlock for r495/i })).toBeVisible();
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
  test('paid user sees report + book links + follow-up form with credits', async ({ page }) => {
    const email = uniqueEmail('paid-dash');
    await registerAndLogin(page, {
      email,
      password: PASSWORD,
      name: 'Paid Tester',
      phone: uniquePhone(),
      category: 'teaching',
    });
    try {
      const userId = await findUserIdByEmail(email);
      await makePaid(userId, 5);

      await page.goto('/dashboard');
      await expect(page.getByRole('heading', { name: /your full report.*call/i })).toBeVisible();
      // Pre-call state: download link is hidden behind the "report ready after
      // your call" placeholder. The PDF only exists after the post-call admin
      // action generates it.
      await expect(page.getByRole('link', { name: /book your 15-min call/i })).toBeVisible();
      await expect(page.getByText(/report ready after your call/i)).toBeVisible();
      await expect(page.getByRole('link', { name: /download report.*pdf/i })).toHaveCount(0);
      await expect(page.getByText(/5 of 5 left/i)).toBeVisible();
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
      await expect(page.getByRole('heading', { name: /your full report.*call/i })).toHaveCount(0);
      await expect(page.getByText(/of 5 left/i)).toHaveCount(0);
    } finally {
      await deleteUser(email);
    }
  });

  test('follow-up form decrements credits on send (Brevo mocked)', async ({ page }) => {
    const email = uniqueEmail('followup-dec');
    await registerAndLogin(page, {
      email,
      password: PASSWORD,
      name: 'Follow Up Tester',
      phone: uniquePhone(),
      category: 'teaching',
    });
    try {
      const userId = await findUserIdByEmail(email);
      await makePaid(userId, 5);

      // Mock Brevo so the test doesn't actually spam John's inbox
      await page.route('https://api.brevo.com/**', (route) =>
        route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({ messageId: 'mock' }),
        }),
      );

      await page.goto('/dashboard');
      await page.locator('input[placeholder="Subject"]').fill('Test follow-up');
      await page.locator('textarea').fill('Just testing the credit decrement.');
      await page.getByRole('button', { name: /^send follow-up$/i }).click();

      await expect(page.getByText(/sent\..*reply by email/i)).toBeVisible();
      await expect(page.getByText(/4 of 5 left/i)).toBeVisible();
    } finally {
      await deleteUser(email);
    }
  });

  test('follow-up form swaps to out-of-credits state at 0', async ({ page }) => {
    const email = uniqueEmail('followup-zero');
    await registerAndLogin(page, {
      email,
      password: PASSWORD,
      name: 'Zero Credits',
      phone: uniquePhone(),
      category: 'teaching',
    });
    try {
      const userId = await findUserIdByEmail(email);
      await makePaid(userId, 0);

      await page.goto('/dashboard');
      await expect(page.getByText(/used all 5 follow-ups/i)).toBeVisible();
      // Form fields should be gone
      await expect(page.locator('input[placeholder="Subject"]')).toHaveCount(0);
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
// WhatsApp visibility (paid vs free)
// =========================================================================

test.describe('Paid tier — WhatsApp CTAs hidden site-wide for paid', () => {
  test('free user dashboard: WhatsApp pill visible in nav', async ({ page }) => {
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
      ).toBeVisible();
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
