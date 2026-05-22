import { test, expect } from '@playwright/test';

/**
 * One fixture per published blog article. Every article must funnel to its OWN
 * category — the register CTA and the pillar up-link are derived from the
 * article's `category` / `pillarHref` frontmatter, never copied from a sibling.
 * When a new article is published, add a row here.
 */
const ARTICLES = [
  {
    slug: '/blog/nursing-jobs-uk-from-south-africa',
    title: /Nursing Job in the UK From South Africa/i,
    knownHeading: /Can South African nurses work in the UK/i,
    registerHref: '/register?category=healthcare',
    pillarHref: '/pathways/healthcare',
  },
  {
    slug: '/blog/teach-in-uk-from-south-africa',
    title: /Teach in the UK From South Africa/i,
    knownHeading: /Can South African teachers work in the UK/i,
    registerHref: '/register?category=teaching',
    pillarHref: '/pathways/teaching',
  },
] as const;

test.describe('blog', () => {
  test('blog index lists every published article', async ({ page }) => {
    await page.goto('/blog');
    await expect(page.getByRole('heading', { name: 'The Jobabroad Blog' })).toBeVisible();
    for (const article of ARTICLES) {
      await expect(page.getByRole('link', { name: article.title })).toBeVisible();
    }
  });

  for (const article of ARTICLES) {
    test(`article ${article.slug} renders and funnels to its own category`, async ({ page }) => {
      await page.goto(article.slug);

      // H1 from frontmatter
      await expect(
        page.getByRole('heading', { level: 1, name: article.title }),
      ).toBeVisible();

      // body rendered from markdown — a known H2 from the article
      await expect(page.getByRole('heading', { name: article.knownHeading })).toBeVisible();

      // FAQ section rendered from frontmatter
      await expect(
        page.getByRole('heading', { name: 'Frequently asked questions' }),
      ).toBeVisible();

      // primary CTA funnels to register with THIS article's category locked in
      // (the arrow distinguishes the article CTA from the nav/footer register links)
      await expect(page.getByRole('link', { name: 'Register free →' })).toHaveAttribute(
        'href',
        article.registerHref,
      );

      // links up to its own pillar page
      await expect(page.getByRole('link', { name: /pathway guide/i })).toHaveAttribute(
        'href',
        article.pillarHref,
      );
    });
  }

  test('unknown article slug returns 404', async ({ page }) => {
    const res = await page.goto('/blog/this-article-does-not-exist');
    expect(res?.status()).toBe(404);
  });
});
