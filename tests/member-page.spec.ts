import { test, expect, type Page } from '@playwright/test';
import {
  deleteUser,
  registerAndLogin,
  uniqueEmail,
  uniquePhone,
} from './helpers';

const CATEGORIES = ['healthcare', 'teaching', 'seasonal'] as const;

async function search(page: Page, query: string) {
  await page.getByPlaceholder(/search this guide/i).fill(query);
  await page.getByRole('button', { name: /^search$/i }).click();
}

function searchSection(page: Page) {
  return page.locator('section', {
    has: page.getByPlaceholder(/search this guide/i),
  });
}

for (const category of CATEGORIES) {
  test.describe(`member page — ${category}`, () => {
    const email = uniqueEmail(`member-${category}`);
    const password = 'Test12345!';

    test.beforeAll(async ({ browser }) => {
      const ctx = await browser.newContext();
      const page = await ctx.newPage();
      await registerAndLogin(page, {
        email,
        password,
        name: `Member ${category}`,
        phone: uniquePhone(),
        category,
      });
      await ctx.close();
    });

    test.afterAll(async () => {
      await deleteUser(email);
    });

    test.beforeEach(async ({ page }) => {
      // Each test gets its own fresh context — log in again per test.
      await registerAndLoginIfNeeded(page, email, password);
      await page.goto(`/members/${category}`);
    });

    test('page loads and renders an article', async ({ page }) => {
      await expect(page.locator('article').first()).toBeVisible();
    });

    test('table of contents renders with items', async ({ page }) => {
      const toc = page.getByRole('navigation', { name: /table of contents/i });
      await expect(toc).toBeVisible();
      const items = toc.getByRole('link');
      expect(await items.count()).toBeGreaterThan(0);
    });

    test('search returns results or no-match fallback for a relevant query', async ({ page }) => {
      await search(page, 'visa');
      const section = searchSection(page);
      // Either we got result list items OR the empty-state appeared. Both
      // confirm the API path resolved (session auth → category → search).
      await Promise.race([
        section.getByRole('listitem').first().waitFor({ timeout: 20_000 }),
        section.getByText(/no matches for/i).waitFor({ timeout: 20_000 }),
      ]);
    });

    test('search caps results at 6', async ({ page }) => {
      await search(page, 'work');
      const section = searchSection(page);
      await Promise.race([
        section.getByRole('listitem').first().waitFor({ timeout: 15_000 }),
        section.getByText(/no matches for/i).waitFor({ timeout: 15_000 }),
      ]);
      const count = await section.getByRole('listitem').count();
      expect(count).toBeLessThanOrEqual(6);
    });

    test('search shows no-match fallback when API returns []', async ({ page }) => {
      await page.route('**/api/search', (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ results: [] }),
        }),
      );
      await search(page, 'anything');
      const section = searchSection(page);
      await expect(section.getByText(/no matches for/i)).toBeVisible({ timeout: 15_000 });
      await expect(section.getByRole('link', { name: /whatsapp us/i })).toBeVisible();
    });

    test('all article external links open in a new tab', async ({ page }) => {
      const externalLinks = page.locator('article a[href^="http"]');
      const count = await externalLinks.count();
      for (let i = 0; i < count; i++) {
        await expect(externalLinks.nth(i)).toHaveAttribute('target', '_blank');
        await expect(externalLinks.nth(i)).toHaveAttribute('rel', /noopener/);
      }
    });

    test('assessment CTA links to the assessment page', async ({ page }) => {
      const cta = page.locator(`a[href="/members/${category}/assessment"]`).first();
      await expect(cta).toBeVisible();
    });
  });
}

/**
 * Per-test login: each Playwright test gets its own context, so the cookies
 * from beforeAll don't carry over. Re-log in the user that already exists.
 */
async function registerAndLoginIfNeeded(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill(password);
  await page.getByRole('button', { name: /sign in/i }).click();
  await expect(page).toHaveURL(/\/dashboard/);
}
