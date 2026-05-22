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

// Trust signals — guards the founder block and the official-source strip.
test.describe('Homepage — trust signals', () => {
  test('founder block shows a named, photographed, verifiable founder', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('img', { name: /john, founder of jobabroad/i })).toBeVisible();

    const verifyLink = page.getByRole('link', { name: /more about john/i });
    await expect(verifyLink).toHaveAttribute('href', 'https://www.devai.co.za/');
    await expect(verifyLink).toHaveAttribute('target', '_blank');
    await expect(verifyLink).toHaveAttribute('rel', /noopener/);
  });

  test('authority strip lists official sources', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByText('Built from official sources')).toBeVisible();
    await expect(page.getByText('GOV.UK', { exact: true })).toBeVisible();
  });
});

// Mobile sticky CTA — keeps registration tappable once the hero scrolls away.
test.describe('Homepage — mobile sticky CTA', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('hidden at the top, revealed after scrolling past the hero', async ({ page }) => {
    await page.goto('/');

    // Located by test id, not role: when hidden the bar is aria-hidden, so
    // its link is intentionally absent from the accessibility tree.
    const stickyBar = page.getByTestId('sticky-cta');
    await expect(stickyBar.locator('a')).toHaveAttribute('href', '/register');

    // At the top, the hero CTA is on screen — the sticky bar stays hidden.
    await expect(stickyBar).not.toBeInViewport();

    // Scrolled past the hero and the grid, it slides into view.
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expect(stickyBar).toBeInViewport();
  });
});
