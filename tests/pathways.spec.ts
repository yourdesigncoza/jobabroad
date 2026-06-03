import { test, expect } from '@playwright/test';

// Public pathway pillar pages — guards the GEO/FAQ-schema fix: every pathway
// now ships a visible FAQ section plus FAQPage + BreadcrumbList JSON-LD, on a
// par with the route/compare/guide pages.
test.describe('Pathway pillar — FAQ + schema', () => {
  test('renders a visible FAQ section', async ({ page }) => {
    await page.goto('/pathways/teaching');

    await expect(
      page.getByRole('heading', { name: 'Frequently asked questions' }),
    ).toBeVisible();
    // At least one extracted question is on the page.
    await expect(
      page.getByRole('heading', { name: /permanent residence in New Zealand/i }),
    ).toBeVisible();
  });

  test('emits FAQPage and BreadcrumbList JSON-LD', async ({ page }) => {
    await page.goto('/pathways/teaching');

    const types = await page
      .locator('script[type="application/ld+json"]')
      .evaluateAll(nodes =>
        nodes.map(n => {
          try {
            return JSON.parse(n.textContent || '{}')['@type'];
          } catch {
            return null;
          }
        }),
      );

    expect(types).toContain('FAQPage');
    expect(types).toContain('BreadcrumbList');
    expect(types).toContain('Article');
  });

  test('adds the FAQ entry to the table of contents', async ({ page }) => {
    await page.goto('/pathways/teaching');
    // TOC anchor matches the FAQ section id.
    await expect(page.locator('a[href="#faq"]').first()).toBeVisible();
  });
});
