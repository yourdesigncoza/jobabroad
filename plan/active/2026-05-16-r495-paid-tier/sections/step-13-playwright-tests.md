---
step: 13
title: Playwright regression — score, paywall, paid dashboard, follow-up
status: blocked
depends: [04, 09, 11]
plan: r495-paid-tier
---

# Step 13: Playwright regression

## Objective

Add Playwright tests covering the new paid-tier surfaces. Builds on the
existing `tests/auth-flow.spec.ts` and `tests/helpers.ts`. Bypasses live
payment (admin-creates a paid user via service-role).

## Context

### Architecture

Existing test patterns from auth migration:
- `tests/helpers.ts` has `svc()`, `uniqueEmail`, `uniquePhone`, `registerAndLogin`
- `playwright.config.ts` loads `.env.local`
- Live payment skipped — use a helper to flip `tier='paid'` and
  `paid_email_credits=5` directly via service role

New helper to add in `tests/helpers.ts`:

```ts
export async function makePaid(userId: string, credits = 5): Promise<void> {
  await svc().from('profiles').update({
    tier: 'paid',
    paid_email_credits: credits,
  }).eq('user_id', userId);
}
```

### Database

Tests create + delete users (existing pattern). For paid-tier tests they
flip the tier directly. Cleanup happens in `afterAll`.

### Existing Patterns

- `npx playwright test` runs against the dev server (auto-started)
- Tests use admin-seeded users (skips SMTP)
- `tests/auth-flow.spec.ts` already has happy-path + form validation +
  gate checks

### Risk

- Don't test payment flow live in CI — use mocked or admin-created paid
  state. Live payment integration test = one-time manual.
- Don't actually send follow-up emails in tests — would spam John. Mock
  the Brevo API via `page.route('**/api.brevo.com/**')`.

## Implementation

1. Add helper to `tests/helpers.ts`:
```ts
export async function makePaid(userId: string, credits = 5): Promise<void> {
  const { error } = await svc().from('profiles').update({
    tier: 'paid',
    paid_email_credits: credits,
  }).eq('user_id', userId);
  if (error) throw error;
}

export async function findUserIdByEmail(email: string): Promise<string> {
  const { data } = await svc().auth.admin.listUsers({ perPage: 200 });
  const u = data.users.find(u => u.email === email);
  if (!u) throw new Error(`user ${email} not found`);
  return u.id;
}
```

2. Create `tests/paid-tier.spec.ts`:

```ts
import { test, expect } from '@playwright/test';
import {
  registerAndLogin,
  deleteUser,
  uniqueEmail,
  uniquePhone,
  makePaid,
  findUserIdByEmail,
} from './helpers';

test.describe('Paid tier — score page', () => {
  const email = uniqueEmail('score');
  const password = 'Test12345!';

  test.afterAll(async () => { await deleteUser(email); });

  test('healthcare assessment → completes → /score shows band + paywall', async ({ page }) => {
    await registerAndLogin(page, {
      email, password,
      name: 'Score Tester',
      phone: uniquePhone(),
      category: 'healthcare',
    });

    // Walk through the assessment. For v1 of the test, just submit empty/default
    // values via the API to simulate a completed assessment. This avoids brittle
    // step-by-step form filling.
    // (Alternative: full form-fill in a later test pass.)

    // For now: hit /api/assessment/submit with stub data, then visit /score
    const userId = await findUserIdByEmail(email);
    // … insert a minimal submitted assessment via service role here …

    await page.goto('/members/healthcare/score');
    await expect(page.getByText(/strong potential|needs prep|high blockers/i)).toBeVisible();
    await expect(page.getByRole('link', { name: /R495/i })).toBeVisible();
  });

  test('non-rubric category shows "scoring coming soon"', async ({ page }) => {
    const e = uniqueEmail('coming-soon');
    await registerAndLogin(page, {
      email: e, password,
      name: 'Coming Soon Tester',
      phone: uniquePhone(),
      category: 'accounting',
    });
    await page.goto('/members/accounting/score');
    await expect(page.getByText(/scoring coming soon/i)).toBeVisible();
    await deleteUser(e);
  });
});

test.describe('Paid tier — dashboard surfaces', () => {
  const email = uniqueEmail('paid-dash');
  const password = 'Test12345!';

  test.afterAll(async () => { await deleteUser(email); });

  test('paid user sees report + book + follow-up form', async ({ page }) => {
    await registerAndLogin(page, {
      email, password,
      name: 'Paid Tester',
      phone: uniquePhone(),
      category: 'healthcare',
    });
    const userId = await findUserIdByEmail(email);
    await makePaid(userId, 5);

    await page.goto('/dashboard');
    await expect(page.getByText(/your full report.*call/i)).toBeVisible();
    await expect(page.getByRole('link', { name: /download.*report/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /book.*15-min/i })).toBeVisible();
    await expect(page.getByText(/5 of 5 left/i)).toBeVisible();
  });

  test('follow-up form decrements credits on send', async ({ page }) => {
    const e = uniqueEmail('followup-dec');
    await registerAndLogin(page, {
      email: e, password,
      name: 'Follow Up Tester',
      phone: uniquePhone(),
      category: 'healthcare',
    });
    const userId = await findUserIdByEmail(e);
    await makePaid(userId, 5);

    // Mock Brevo so the test doesn't actually send
    await page.route('**/api.brevo.com/**', (route) => route.fulfill({ status: 201, body: '{}' }));

    await page.goto('/dashboard');
    await page.locator('input[placeholder="Subject"]').fill('Test follow-up');
    await page.locator('textarea').fill('Just testing the credit decrement.');
    await page.getByRole('button', { name: /^send$/i }).click();
    await expect(page.getByText(/sent\. john will reply/i)).toBeVisible();
    await expect(page.getByText(/4 of 5 left/i)).toBeVisible();

    await deleteUser(e);
  });

  test('follow-up form hides at 0 credits', async ({ page }) => {
    const e = uniqueEmail('followup-zero');
    await registerAndLogin(page, {
      email: e, password,
      name: 'Zero Credits',
      phone: uniquePhone(),
      category: 'healthcare',
    });
    const userId = await findUserIdByEmail(e);
    await makePaid(userId, 0);

    await page.goto('/dashboard');
    await expect(page.getByText(/out of follow-ups/i)).toBeVisible();

    await deleteUser(e);
  });
});

test.describe('Paid tier — booking gate', () => {
  test('free user redirected from /book to /dashboard', async ({ page }) => {
    const e = uniqueEmail('book-free');
    await registerAndLogin(page, {
      email: e, password: 'Test12345!',
      name: 'Book Free',
      phone: uniquePhone(),
      category: 'healthcare',
    });
    await page.goto('/members/healthcare/book');
    await expect(page).toHaveURL(/\/dashboard/);
    await deleteUser(e);
  });

  test('paid user sees consent checkbox, embed disabled until ticked', async ({ page }) => {
    const e = uniqueEmail('book-paid');
    await registerAndLogin(page, {
      email: e, password: 'Test12345!',
      name: 'Book Paid',
      phone: uniquePhone(),
      category: 'healthcare',
    });
    const userId = await findUserIdByEmail(e);
    await makePaid(userId);

    await page.goto('/members/healthcare/book');
    await expect(page.getByText(/I consent to this call being recorded/i)).toBeVisible();
    await expect(page.getByText(/tick the consent checkbox/i)).toBeVisible();
    await deleteUser(e);
  });
});
```

3. Note: full happy-path with form submission to a sandbox payment
   provider is OUT of scope. Test that manually once during execution
   and document.

## Files to Create/Modify

| Action | File | Purpose |
|--------|------|---------|
| modify | `tests/helpers.ts` | Add `makePaid`, `findUserIdByEmail` |
| create | `tests/paid-tier.spec.ts` | New regression suite for paid-tier flows |

## Done When

1. `npx playwright test` runs green (all existing tests + new paid-tier suite).
2. Test cleanup leaves no `playwright+*` users in `auth.users`.
3. No actual Brevo emails sent during test runs (verified by checking Brevo activity log).
4. Manual e2e of payment flow (sandbox provider) tested at least once and documented in progress.md.

## Gotchas

- The score page test needs an assessment to exist — easiest is to
  insert one directly via service role rather than form-fill the wizard.
- Mocking Brevo: use `page.route('**/api.brevo.com/**', ...)`. Don't
  globally disable network — the dev server itself needs to reach
  Supabase.
- Cal.com embed loads remote JS; tests assert on the surrounding consent
  UI, not on the iframe contents (cross-origin).
- Don't include a live payment test in CI — too brittle and the sandbox
  provider state isn't deterministic. Manual once per provider change.
