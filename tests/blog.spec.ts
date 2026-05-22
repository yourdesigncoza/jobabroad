import { test, expect } from '@playwright/test';

/**
 * One fixture per published blog article. The register CTA and the pillar
 * up-link are derived from the article's `category` / `pillarHref`
 * frontmatter — every article must funnel to its OWN category, never a
 * sibling's. `pillarHref: null` marks a hub/cross-cutting article with no
 * pillar up-link. When a new article is published, add a row here.
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
  {
    slug: '/blog/best-countries-south-africans-work-abroad',
    title: /Best Countries for South Africans to Work Abroad/i,
    knownHeading: /7 countries that hire South Africans/i,
    registerHref: '/register',
    pillarHref: null,
  },
  {
    slug: '/blog/work-abroad-without-a-degree-south-africa',
    title: /Working Abroad Without a Degree/i,
    knownHeading: /Do you really need a degree/i,
    registerHref: '/register',
    pillarHref: '/blog/best-countries-south-africans-work-abroad',
  },
  {
    slug: '/blog/au-pair-in-america-from-south-africa',
    title: /Become an Au Pair in America From South Africa/i,
    knownHeading: /Can South Africans be au pairs/i,
    registerHref: '/register?category=au-pair',
    pillarHref: '/pathways/au-pair',
  },
  {
    slug: '/blog/work-abroad-recruitment-scams-south-africa',
    title: /Work-Abroad Recruitment Scams/i,
    knownHeading: /The 9 red flags/i,
    registerHref: '/register',
    pillarHref: '/scam-warnings',
  },
  {
    slug: '/blog/nurse-salary-uk-vs-south-africa',
    title: /How Much More Do South African Nurses Earn Abroad/i,
    knownHeading: /South African nurse salary/i,
    registerHref: '/register?category=healthcare',
    pillarHref: '/pathways/healthcare',
  },
  {
    slug: '/blog/it-jobs-abroad-from-south-africa',
    title: /Best Route for South African IT Professionals/i,
    knownHeading: /Why South African IT skills are in demand/i,
    registerHref: '/register?category=it-tech',
    pillarHref: '/pathways/it-tech',
  },
  {
    slug: '/blog/document-checklist-working-abroad-south-africa',
    title: /Police Clearance, Apostille/i,
    knownHeading: /Apostille and legalisation via DIRCO/i,
    registerHref: '/register',
    pillarHref: null,
  },
  {
    slug: '/blog/uk-ancestry-visa-vs-skilled-worker-visa',
    title: /UK Ancestry Visa vs Skilled Worker Visa/i,
    knownHeading: /The UK Ancestry visa explained/i,
    registerHref: '/register',
    pillarHref: '/blog/best-countries-south-africans-work-abroad',
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

      // pillar up-link — present and pointing at its own pillar, or absent
      // entirely for hub / cross-cutting articles
      const pillarLink = page.getByRole('link', { name: /^Part of the/i });
      if (article.pillarHref) {
        await expect(pillarLink).toHaveAttribute('href', article.pillarHref);
      } else {
        await expect(pillarLink).toHaveCount(0);
      }
    });
  }

  test('unknown article slug returns 404', async ({ page }) => {
    const res = await page.goto('/blog/this-article-does-not-exist');
    expect(res?.status()).toBe(404);
  });
});
