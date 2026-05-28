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

  test('llms.txt lists the route and guides', async ({ page }) => {
    const res = await page.goto('/llms.txt');
    expect(res?.status()).toBe(200);
    const body = await res!.text();
    expect(body).toContain('/routes/registered-nurse/ireland');
    expect(body).toContain('/guides/police-clearance');
    expect(body).toContain('# Jobabroad');
  });
});
