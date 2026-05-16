---
step: 14
title: Playwright auth-flow.spec.ts + update member-page.spec.ts
status: done
depends-on: [11, 13]
module: tests
---

# Step 14 — Playwright regression coverage

## Objective

End-to-end Playwright spec covering the full new auth flow. Update the existing `tests/member-page.spec.ts` to use a signed-in session instead of a UUID token URL.

## Architecture context

- Playwright already installed (`@playwright/test@^1.59.1`). Existing spec: `tests/member-page.spec.ts`. CLAUDE.md test tokens are now obsolete (member_tokens table dropped in Step 13).
- Email confirmation in Supabase Auth normally requires clicking a link in a real email. For tests we bypass this by using the service-role client to directly toggle `email_confirmed_at`.
- Service-role helper: `lib/supabase/service.ts` from Step 01.
- Each test creates a fresh user with a unique email and cleans up at the end (or uses a `beforeAll` fixture).

## Files to create

### `tests/auth-flow.spec.ts`

```ts
import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function svc() {
  return createClient(SUPABASE_URL, SERVICE_ROLE, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function unique(suffix: string) {
  return `playwright+${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${suffix}@example.com`;
}

async function confirmUser(email: string) {
  // Look up user by email, set email_confirmed_at directly via service role.
  const supabase = svc();
  const { data: users } = await supabase.auth.admin.listUsers();
  const user = users.users.find((u) => u.email === email);
  if (!user) throw new Error(`User ${email} not found`);
  await supabase.auth.admin.updateUserById(user.id, { email_confirm: true });
  return user;
}

async function deleteUser(email: string) {
  const supabase = svc();
  const { data: users } = await supabase.auth.admin.listUsers();
  const user = users.users.find((u) => u.email === email);
  if (user) await supabase.auth.admin.deleteUser(user.id);
}

test.describe('Auth flow — full happy path', () => {
  const email = unique('happy');
  const password = 'Test12345!';
  const phone = '0617114715';
  const name = 'Playwright Tester';
  const category = 'healthcare';

  test.afterAll(async () => { await deleteUser(email); });

  test('register → confirm → login → dashboard → guide → assessment → category-mismatch 403 → logout → login', async ({ page }) => {
    // 1. Register
    await page.goto(`/register?category=${category}`);
    await expect(page.getByRole('radio', { name: /healthcare/i })).toBeChecked();
    await page.getByLabel(/name/i).fill(name);
    await page.getByLabel(/email/i).fill(email);
    await page.getByLabel(/phone/i).fill(phone);
    await page.getByLabel(/password/i).fill(password);
    await page.getByRole('button', { name: /register|sign up/i }).click();
    await expect(page).toHaveURL(/\/auth\/confirm-email/);

    // 2. Service-role: confirm the email
    await confirmUser(email);

    // 3. Log in
    await page.goto('/login');
    await page.getByLabel(/email/i).fill(email);
    await page.getByLabel(/password/i).fill(password);
    await page.getByRole('button', { name: /log in|sign in/i }).click();
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByText(name)).toBeVisible();
    await expect(page.getByText(/healthcare/i)).toBeVisible();

    // 4. Click through to guide
    await page.getByRole('link', { name: /healthcare guide/i }).click();
    await expect(page).toHaveURL(/\/members\/healthcare/);

    // 5. Back to dashboard, click assessment
    await page.goto('/dashboard');
    await page.getByRole('link', { name: /assessment/i }).click();
    await expect(page).toHaveURL(/\/members\/healthcare\/assessment/);

    // 6. Category mismatch 403
    await page.goto('/members/teaching');
    await expect(page.getByText(/your account is for the healthcare/i)).toBeVisible();
    await expect(page.getByRole('link', { name: /go to your guide/i })).toBeVisible();

    // 7. Logout
    await page.goto('/dashboard');
    await page.getByRole('button', { name: /log out/i }).click();
    await expect(page).toHaveURL(/^\/$|^\/\?/);

    // 8. Verify session gone — /dashboard redirects to /login
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);

    // 9. Log back in
    await page.getByLabel(/email/i).fill(email);
    await page.getByLabel(/password/i).fill(password);
    await page.getByRole('button', { name: /log in|sign in/i }).click();
    await expect(page).toHaveURL(/\/dashboard/);
  });
});

test.describe('Auth flow — error states', () => {
  test('duplicate email surfaces field error', async ({ page }) => {
    const email = unique('dup');
    const supabase = svc();
    // Pre-create the user via admin API so we don't need to register first
    await supabase.auth.admin.createUser({
      email,
      password: 'Test12345!',
      email_confirm: true,
      user_metadata: { name: 'Dup', phone: '27617114716', category: 'healthcare' },
    });

    await page.goto('/register?category=healthcare');
    await page.getByLabel(/name/i).fill('Duplicate');
    await page.getByLabel(/email/i).fill(email);
    await page.getByLabel(/phone/i).fill('0617114717');
    await page.getByLabel(/password/i).fill('Test12345!');
    await page.getByRole('button', { name: /register/i }).click();
    await expect(page.getByText(/already registered/i)).toBeVisible();

    await deleteUser(email);
  });

  test('invalid phone surfaces field error', async ({ page }) => {
    await page.goto('/register?category=healthcare');
    await page.getByLabel(/name/i).fill('Bad Phone');
    await page.getByLabel(/email/i).fill(unique('badphone'));
    await page.getByLabel(/phone/i).fill('1234567');
    await page.getByLabel(/password/i).fill('Test12345!');
    await page.getByRole('button', { name: /register/i }).click();
    await expect(page.getByText(/valid sa phone/i)).toBeVisible();
  });

  test('unconfirmed user is redirected to /auth/confirm-email', async ({ page }) => {
    const email = unique('unconfirmed');
    const password = 'Test12345!';
    await page.goto('/register?category=teaching');
    await page.getByLabel(/name/i).fill('Unconfirmed');
    await page.getByLabel(/email/i).fill(email);
    await page.getByLabel(/phone/i).fill('0617114718');
    await page.getByLabel(/password/i).fill(password);
    await page.getByRole('button', { name: /register/i }).click();
    await expect(page).toHaveURL(/\/auth\/confirm-email/);

    // Attempt to access /dashboard before confirming
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/auth\/confirm-email|\/login/);

    await deleteUser(email);
  });
});
```

## Files to modify

### `tests/member-page.spec.ts`

The existing spec navigates to UUID token URLs. Rewrite each test to:
1. Set up a signed-in session (use `confirmUser` + login helper from `auth-flow.spec.ts` — or extract into `tests/helpers.ts`).
2. Navigate to `/members/[category]` instead of `/members/[uuid-token]`.
3. Update assertions if route-shape change broke any selectors.

If the existing spec only verified specific content rendering (TOC, h2 headings), those assertions still work — only the URL + setup changes.

## Files to create (optional)

### `tests/helpers.ts`

Extract the `svc`, `unique`, `confirmUser`, `deleteUser`, and a `registerAndLogin(page, opts)` helper. Both spec files import from here. Reduces duplication.

## Pattern context

- `npx playwright test` runs against the local dev server (`http://localhost:3000`); CI should start the dev server before the test run.
- Service-role key MUST be set in the env for the tests to run. Document this in `tests/README.md` (create if absent).
- Per `CLAUDE.md` "Testing — Playwright First": this is the authoritative test method. No Jest/Vitest unit tests needed for auth.

## Risk context

- Tests create real `auth.users` rows. The cleanup in `afterAll` is essential; if a test crashes mid-run, you'll accumulate orphan users. Run a cleanup script periodically (`select id from auth.users where email like 'playwright+%@example.com'`).
- Service-role calls (`auth.admin.*`) bypass RLS. Be careful what tests do.
- Email regex `playwright+...@example.com` is non-deliverable — fine for tests, but if Supabase's "Confirm email" is ON, the registration step will try to send a real email. The test bypasses that by calling `confirmUser` directly, but the SMTP attempt still happens. To suppress, use `auth.admin.createUser({ email_confirm: true, ... })` in tests where possible — already done in the "duplicate email" test.

## Gemini-noted considerations

- Playwright regression is essential (Gemini agreed).
- Category-mismatch 403 is part of the happy-path test, validating the locked-category UX.
- Defence-in-depth verification: the unconfirmed-redirect test confirms middleware works.

## Done when

- `tests/auth-flow.spec.ts` exists with happy-path + 3 error-state tests.
- `tests/member-page.spec.ts` rewritten to use session-based access, all tests pass.
- `npx playwright test` runs green locally with dev server running.
- `tests/helpers.ts` (if extracted) is the single source of test fixtures.
- No leftover `playwright+...@example.com` users in `auth.users` after the run.
