import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';
import { CATEGORIES } from '@/lib/categories';
import { listPathwaySlugs } from '@/lib/pathway-content';
import { listRouteParams, getRoutePage } from '@/lib/route-content';
import { listGuideSlugs, getGuidePage } from '@/lib/guide-content';
import { getAllBlogPosts } from '@/lib/blog-content';
import { pageMetadata, SITE_URL } from '@/lib/site';

export const metadata: Metadata = pageMetadata({
  title: 'Directory — Every Work-Abroad Guide for South Africans',
  description:
    'Browse every Jobabroad resource in one place: category pathway guides, role-and-country route guides, document guides, and articles for South Africans working abroad.',
  path: '/directory',
});

interface RouteLink {
  href: string;
  title: string;
  country: string;
}

/** Group every published route under its category slug. */
function routesByCategory(): Map<string, RouteLink[]> {
  const map = new Map<string, RouteLink[]>();
  for (const { role, country } of listRouteParams()) {
    const page = getRoutePage(role, country);
    if (!page) continue;
    const cat = page.frontmatter.category;
    const list = map.get(cat) ?? [];
    list.push({
      href: `/routes/${role}/${country}`,
      title: page.frontmatter.title,
      country: page.frontmatter.country,
    });
    map.set(cat, list);
  }
  return map;
}

const kicker = 'font-display font-bold uppercase tracking-[0.18em] text-xs';
const cardLink =
  'block rounded-xl px-4 py-3 font-body text-sm transition-colors hover:border-[#C9A84C]';

export default function DirectoryPage() {
  const pathwaySlugs = new Set(listPathwaySlugs());
  const routeMap = routesByCategory();
  const guides = listGuideSlugs()
    .map(getGuidePage)
    .filter((g): g is NonNullable<typeof g> => g !== null);
  const posts = getAllBlogPosts();

  // Only real categories that have a published pathway guide (skip "other").
  const categories = CATEGORIES.filter(
    c => c.id !== 'other' && pathwaySlugs.has(c.id),
  );

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Jobabroad Directory',
    description:
      'Every Jobabroad work-abroad resource: pathway guides, route guides, document guides and articles.',
    url: `${SITE_URL}/directory`,
  };

  return (
    <main className="min-h-screen flex flex-col" style={{ backgroundColor: '#F8F5F0' }}>
      <JsonLd data={collectionSchema} />
      <div>
        <SiteNav />
      </div>

      <section className="flex-1 max-w-5xl w-full mx-auto px-6 py-16 flex flex-col gap-12">
        <header className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-px" style={{ backgroundColor: '#ff751f' }} aria-hidden />
            <span className={kicker} style={{ color: '#ff751f' }}>
              Browse everything
            </span>
          </div>
          <h1
            className="font-display font-bold uppercase tracking-wide text-4xl sm:text-5xl"
            style={{ color: '#2C2C2C' }}
          >
            Directory
          </h1>
          <p className="font-body text-base" style={{ color: '#6B6B6B' }}>
            Every work-abroad resource in one place — category pathway guides, specific
            role-and-country route guides, document guides, and articles. Pick your category to
            start, or jump straight to a route.
          </p>
        </header>

        {/* Pathways + their routes, grouped by category */}
        <div className="flex flex-col gap-10">
          {categories.map(cat => {
            const routes = routeMap.get(cat.id) ?? [];
            return (
              <div key={cat.id} className="flex flex-col gap-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2 border-b pb-2" style={{ borderColor: '#EDE8E0' }}>
                  <h2
                    className="font-display font-bold uppercase tracking-wide text-xl"
                    style={{ color: '#2C2C2C' }}
                  >
                    <span aria-hidden className="mr-2">{cat.emoji}</span>
                    {cat.label}
                  </h2>
                  <Link
                    href={`/pathways/${cat.id}`}
                    className="font-body text-sm hover:underline"
                    style={{ color: '#1B4D3E' }}
                  >
                    {cat.label} pathway guide →
                  </Link>
                </div>

                {routes.length > 0 ? (
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {routes.map(r => (
                      <li key={r.href}>
                        <Link
                          href={r.href}
                          className={cardLink}
                          style={{ backgroundColor: '#FFFFFF', border: '1.5px solid #EDE8E0', color: '#2C2C2C' }}
                        >
                          <span style={{ color: '#1B4D3E' }}>{r.title}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="font-body text-sm" style={{ color: '#6B6B6B' }}>
                    Route guides for {cat.label.toLowerCase()} are coming soon — start with the
                    pathway guide above.
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Document guides */}
        {guides.length > 0 && (
          <div className="flex flex-col gap-4">
            <h2
              className="font-display font-bold uppercase tracking-wide text-xl border-b pb-2"
              style={{ color: '#2C2C2C', borderColor: '#EDE8E0' }}
            >
              Document guides
            </h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {guides.map(g => (
                <li key={g.slug}>
                  <Link
                    href={`/guides/${g.slug}`}
                    className={cardLink}
                    style={{ backgroundColor: '#FFFFFF', border: '1.5px solid #EDE8E0', color: '#2C2C2C' }}
                  >
                    <span style={{ color: '#1B4D3E' }}>{g.frontmatter.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Articles */}
        {posts.length > 0 && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2 border-b pb-2" style={{ borderColor: '#EDE8E0' }}>
              <h2
                className="font-display font-bold uppercase tracking-wide text-xl"
                style={{ color: '#2C2C2C' }}
              >
                Articles
              </h2>
              <Link href="/blog" className="font-body text-sm hover:underline" style={{ color: '#1B4D3E' }}>
                All articles →
              </Link>
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {posts.map(post => (
                <li key={post.slug}>
                  <Link
                    href={`/blog/${post.slug}`}
                    className={cardLink}
                    style={{ backgroundColor: '#FFFFFF', border: '1.5px solid #EDE8E0', color: '#2C2C2C' }}
                  >
                    <span style={{ color: '#1B4D3E' }}>{post.frontmatter.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Trust pages */}
        <div className="flex flex-col gap-4">
          <h2
            className="font-display font-bold uppercase tracking-wide text-xl border-b pb-2"
            style={{ color: '#2C2C2C', borderColor: '#EDE8E0' }}
          >
            Trust &amp; safety
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <li>
              <Link href="/scam-warnings" className={cardLink} style={{ backgroundColor: '#FFFFFF', border: '1.5px solid #EDE8E0', color: '#1B4D3E' }}>
                Work-abroad scam warnings
              </Link>
            </li>
            <li>
              <Link href="/recruiters" className={cardLink} style={{ backgroundColor: '#FFFFFF', border: '1.5px solid #EDE8E0', color: '#1B4D3E' }}>
                Recruiter directory
              </Link>
            </li>
          </ul>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
