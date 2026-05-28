import { test, expect } from '@playwright/test';

/**
 * Route pages (/routes/{role}/{country}) and the reusable document guides.
 * Each route page is built from content/routes/{role}/{country}.md and must
 * funnel to its OWN category, link up to its pillar, and emit the GEO schema
 * stack (Article + BreadcrumbList + FAQPage). When a new route or guide is
 * published, add a row here.
 */
const ROUTES = [
  {
    slug: '/routes/registered-nurse/ireland',
    title: /How South African Registered Nurses Can Work in Ireland/i,
    knownHeading: /Can South African registered nurses work in Ireland/i,
    registerHref: '/register?category=healthcare',
    pillarHref: '/pathways/healthcare',
  },
  {
    slug: '/routes/seasonal-farm-worker/united-kingdom',
    title: /How South African Seasonal Farm Workers Can Work in the UK/i,
    knownHeading: /Can South Africans do seasonal farm work in the UK/i,
    registerHref: '/register?category=farming',
    pillarHref: '/pathways/farming',
  },
  {
    slug: '/routes/software-developer/ireland',
    title: /How South African Software Developers Can Work in Ireland/i,
    knownHeading: /Can South African software developers work in Ireland/i,
    registerHref: '/register?category=it-tech',
    pillarHref: '/pathways/it-tech',
  },
  {
    slug: '/routes/electrician/australia',
    title: /How South African Electricians Can Work in Australia/i,
    knownHeading: /Can South African electricians work in Australia/i,
    registerHref: '/register?category=trades',
    pillarHref: '/pathways/trades',
  },
  {
    slug: '/routes/tefl-teacher/south-korea',
    title: /How South Africans Can Teach English in South Korea/i,
    knownHeading: /Can South Africans teach English in South Korea/i,
    registerHref: '/register?category=tefl',
    pillarHref: '/pathways/tefl',
  },
  {
    slug: '/routes/civil-engineer/australia',
    title: /How South African Civil Engineers Can Work in Australia/i,
    knownHeading: /Can South African civil engineers work in Australia/i,
    registerHref: '/register?category=engineering',
    pillarHref: '/pathways/engineering',
  },
  {
    slug: '/routes/chef/uae',
    title: /How South African Chefs Can Work in the UAE/i,
    knownHeading: /Can South African chefs work in the UAE/i,
    registerHref: '/register?category=hospitality',
    pillarHref: '/pathways/hospitality',
  },
  {
    slug: '/routes/accountant/canada',
    title: /How South African Accountants Can Work in Canada/i,
    knownHeading: /Can South African accountants work in Canada/i,
    registerHref: '/register?category=accounting',
    pillarHref: '/pathways/accounting',
  },
  {
    slug: '/routes/carnival-worker/united-states',
    title: /How South Africans Can Do Carnival & Seasonal Work in the USA/i,
    knownHeading: /Can South Africans work at US carnivals or fairs/i,
    registerHref: '/register?category=seasonal',
    pillarHref: '/pathways/seasonal',
  },
  {
    slug: '/routes/electrician/united-kingdom',
    title: /How South African Electricians Can Work in the UK/i,
    knownHeading: /Can South African electricians work in the UK/i,
    registerHref: '/register?category=trades',
    pillarHref: '/pathways/trades',
  },
  {
    slug: '/routes/plumber/united-kingdom',
    title: /How South African Plumbers Can Work in the UK/i,
    knownHeading: /Can South African plumbers work in the UK/i,
    registerHref: '/register?category=trades',
    pillarHref: '/pathways/trades',
  },
  {
    slug: '/routes/accountant/united-kingdom',
    title: /How South African Accountants Can Work in the UK/i,
    knownHeading: /Can South African accountants work in the UK/i,
    registerHref: '/register?category=accounting',
    pillarHref: '/pathways/accounting',
  },
  {
    slug: '/routes/software-developer/germany',
    title: /How South African Software Developers Can Work in Germany/i,
    knownHeading: /Can South African software developers work in Germany/i,
    registerHref: '/register?category=it-tech',
    pillarHref: '/pathways/it-tech',
  },
  {
    slug: '/routes/software-developer/canada',
    title: /How South African Software Developers Can Work in Canada/i,
    knownHeading: /Can South African software developers work in Canada/i,
    registerHref: '/register?category=it-tech',
    pillarHref: '/pathways/it-tech',
  },
  {
    slug: '/routes/civil-engineer/canada',
    title: /How South African Civil Engineers Can Work in Canada/i,
    knownHeading: /Can South African civil engineers work in Canada/i,
    registerHref: '/register?category=engineering',
    pillarHref: '/pathways/engineering',
  },
  {
    slug: '/routes/registered-nurse/australia',
    title: /How South African Registered Nurses Can Work in Australia/i,
    knownHeading: /Can South African registered nurses work in Australia/i,
    registerHref: '/register?category=healthcare',
    pillarHref: '/pathways/healthcare',
  },
  {
    slug: '/routes/registered-nurse/new-zealand',
    title: /How South African Registered Nurses Can Work in New Zealand/i,
    knownHeading: /Can South African registered nurses work in New Zealand/i,
    registerHref: '/register?category=healthcare',
    pillarHref: '/pathways/healthcare',
  },
] as const;

const GUIDES = [
  { slug: '/guides/police-clearance', title: /Police Clearance Certificate for Working Abroad/i },
  { slug: '/guides/saqa-evaluation', title: /SAQA Evaluation of Your Qualification/i },
  { slug: '/guides/apostille-dirco', title: /Apostille & DIRCO Document Authentication/i },
] as const;

test.describe('routes', () => {
  for (const route of ROUTES) {
    test(`route ${route.slug} renders, funnels to its category, links its pillar`, async ({ page }) => {
      await page.goto(route.slug);

      await expect(page.getByRole('heading', { level: 1, name: route.title })).toBeVisible();

      // a known question-form H2 from the body markdown (level 2 — the same
      // question also appears as an FAQ H3, so scope to the body heading)
      await expect(
        page.getByRole('heading', { level: 2, name: route.knownHeading }),
      ).toBeVisible();

      // FAQ section from frontmatter
      await expect(
        page.getByRole('heading', { name: 'Frequently asked questions' }),
      ).toBeVisible();

      // primary CTA locks in THIS route's category
      await expect(page.getByRole('link', { name: 'Register free →' })).toHaveAttribute(
        'href',
        route.registerHref,
      );

      // pillar up-link points at its own category pathway
      await expect(
        page.getByRole('link', { name: /work-abroad pathway →$/i }),
      ).toHaveAttribute('href', route.pillarHref);

      // breadcrumb trail present (Home / Category / Country)
      await expect(page.getByRole('navigation', { name: 'Breadcrumb' })).toBeVisible();

      // GEO schema stack embedded server-side
      const html = await page.content();
      expect(html).toContain('"@type":"Article"');
      expect(html).toContain('"@type":"BreadcrumbList"');
      expect(html).toContain('"@type":"FAQPage"');
    });
  }

  test('unknown route returns 404', async ({ page }) => {
    const res = await page.goto('/routes/registered-nurse/narnia');
    expect(res?.status()).toBe(404);
  });

  for (const guide of GUIDES) {
    test(`guide ${guide.slug} renders`, async ({ page }) => {
      await page.goto(guide.slug);
      await expect(page.getByRole('heading', { level: 1, name: guide.title })).toBeVisible();
      await expect(
        page.getByRole('heading', { name: 'Frequently asked questions' }),
      ).toBeVisible();
    });
  }

  test('unknown guide returns 404', async ({ page }) => {
    const res = await page.goto('/guides/this-guide-does-not-exist');
    expect(res?.status()).toBe(404);
  });

  test('directory lists routes, guides and is linked from the footer', async ({ page }) => {
    await page.goto('/directory');
    await expect(page.getByRole('heading', { level: 1, name: 'Directory' })).toBeVisible();
    // a known route link and a known guide link are present
    await expect(
      page.getByRole('link', { name: /Registered Nurses Can Work in Ireland/i }),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: /Police Clearance Certificate/i }),
    ).toBeVisible();
    // footer link points here from any page
    await page.goto('/blog');
    await expect(page.getByRole('link', { name: 'Browse all guides' })).toHaveAttribute(
      'href',
      '/directory',
    );
  });

  test('llms.txt lists the route and guides', async ({ page }) => {
    const res = await page.goto('/llms.txt');
    expect(res?.status()).toBe(200);
    const body = await res!.text();
    expect(body).toContain('/routes/registered-nurse/ireland');
    expect(body).toContain('/guides/police-clearance');
    expect(body).toContain('# Jobabroad');
  });
});
