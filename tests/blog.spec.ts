import { test, expect } from '@playwright/test';

const ARTICLE = '/blog/nursing-jobs-uk-from-south-africa';

test.describe('blog', () => {
  test('blog index lists published articles', async ({ page }) => {
    await page.goto('/blog');
    await expect(page.getByRole('heading', { name: 'The Jobabroad Blog' })).toBeVisible();
    await expect(
      page.getByRole('link', { name: /Nursing Job in the UK From South Africa/i }),
    ).toBeVisible();
  });

  test('article renders with heading, TOC, FAQ and the register CTA', async ({ page }) => {
    await page.goto(ARTICLE);

    // H1 from frontmatter
    await expect(
      page.getByRole('heading', { level: 1, name: /Nursing Job in the UK From South Africa/i }),
    ).toBeVisible();

    // body rendered from markdown — a known H2 from the article
    await expect(
      page.getByRole('heading', { name: /Can South African nurses work in the UK/i }),
    ).toBeVisible();

    // FAQ section rendered from frontmatter
    await expect(page.getByRole('heading', { name: 'Frequently asked questions' })).toBeVisible();

    // primary CTA funnels to register with the healthcare category locked in
    // (the arrow distinguishes the article CTA from the nav/footer register links)
    await expect(page.getByRole('link', { name: 'Register free →' })).toHaveAttribute(
      'href',
      '/register?category=healthcare',
    );

    // links up to its pillar page
    await expect(page.getByRole('link', { name: /pathway guide/i })).toHaveAttribute(
      'href',
      '/pathways/healthcare',
    );
  });

  test('unknown article slug returns 404', async ({ page }) => {
    const res = await page.goto('/blog/this-article-does-not-exist');
    expect(res?.status()).toBe(404);
  });
});
