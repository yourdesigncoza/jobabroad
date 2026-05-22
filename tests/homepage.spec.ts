import { test, expect } from '@playwright/test';

// Homepage conversion path — guards the CRO changes:
// a live hero CTA above the fold, a direct-register escape hatch,
// category cards that read as CTAs, and the FAQ CTA routing back to the grid.
test.describe('Homepage — conversion path', () => {
  test('hero CTA is live and scrolls to the category grid', async ({ page }) => {
    await page.goto('/');

    const heroCta = page.getByRole('link', { name: /choose your field/i });
    await expect(heroCta).toBeVisible();
    await expect(heroCta).toHaveAttribute('href', '#interest-grid');

    await heroCta.click();
    await expect(page.locator('#interest-grid')).toBeInViewport();
  });

  test('hero offers a direct register link for ready visitors', async ({ page }) => {
    await page.goto('/');

    const registerLink = page.getByRole('link', { name: /already know your field/i });
    await expect(registerLink).toBeVisible();
    await expect(registerLink).toHaveAttribute('href', '/register');
  });

  test('category cards read as CTAs and link to category-scoped registration', async ({ page }) => {
    await page.goto('/');

    const healthcareCard = page.locator('#interest-grid a[href="/register?category=healthcare"]');
    await expect(healthcareCard).toBeVisible();
    await expect(healthcareCard).toContainText('Register free');
  });

  test('FAQ CTA routes back to the category grid', async ({ page }) => {
    await page.goto('/');

    const faqCta = page.getByRole('link', { name: 'Pick your field →' }).last();
    await expect(faqCta).toHaveAttribute('href', '#interest-grid');
  });
});
