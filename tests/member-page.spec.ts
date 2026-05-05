import { test, expect, Page } from '@playwright/test';

const TOKENS: Record<string, string> = {
  healthcare: 'd2e097bc-47b4-4db2-b55a-d0886ce65d3c',
  teaching: '684d2bbc-e704-4756-b377-79dcbcc4c3a2',
  seasonal: '3c625e74-5f85-4d61-844b-3087a8e27ed8',
};

async function search(page: Page, query: string) {
  const input = page.getByPlaceholder(/search this guide/i);
  await input.fill(query);
  await page.getByRole('button', { name: /^search$/i }).click();
}

function searchSection(page: Page) {
  return page.locator('section', {
    has: page.getByPlaceholder(/search this guide/i),
  });
}

for (const [category, token] of Object.entries(TOKENS)) {
  test.describe(`member page — ${category}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`/members/${token}`);
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

    test('search returns results for a relevant query', async ({ page }) => {
      await search(page, 'visa');
      const results = searchSection(page).getByRole('listitem');
      await expect(results.first()).toBeVisible({ timeout: 15_000 });
      expect(await results.count()).toBeGreaterThan(0);
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
      // not every guide has external links, but if any exist they must be target=_blank
      for (let i = 0; i < count; i++) {
        await expect(externalLinks.nth(i)).toHaveAttribute('target', '_blank');
        await expect(externalLinks.nth(i)).toHaveAttribute('rel', /noopener/);
      }
    });

    test('assessment CTA links to the assessment page', async ({ page }) => {
      const cta = page.getByRole('link', { name: /assessment|start|continue/i }).filter({
        has: page.locator(`[href$="/members/${token}/assessment"]`),
      }).first();
      // fallback: any link whose href ends with /assessment
      const href = page.locator(`a[href="/members/${token}/assessment"]`).first();
      await expect(href).toBeVisible();
      await expect(href).toHaveAttribute('href', `/members/${token}/assessment`);
    });
  });
}
