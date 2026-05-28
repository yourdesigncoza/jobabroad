import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import JsonLd from '@/components/JsonLd';
import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';
import TableOfContents from '@/components/TableOfContents';
import { getGuidePage, listGuideSlugs } from '@/lib/guide-content';
import { pageMetadata, SITE_URL, SITE_NAME, SITE_AUTHOR } from '@/lib/site';

export function generateStaticParams() {
  return listGuideSlugs().map(slug => ({ slug }));
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = getGuidePage(slug);
  if (!page) return { robots: { index: false, follow: false } };

  return pageMetadata({
    title: page.frontmatter.title,
    description: page.frontmatter.description,
    path: `/guides/${slug}`,
    type: 'article',
    publishedTime: page.frontmatter.lastVerified
      ? new Date(page.frontmatter.lastVerified)
      : undefined,
  });
}

export default async function GuidePageView({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = getGuidePage(slug);
  if (!page) notFound();

  const { frontmatter, html, toc, readTime } = page;
  const canonical = `${SITE_URL}/guides/${slug}`;

  const faqs = frontmatter.faqs ?? [];
  const tocItems = faqs.length ? [...toc, { id: 'faq', text: 'FAQ' }] : toc;

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: frontmatter.title,
    description: frontmatter.description,
    image: `${canonical}/opengraph-image`,
    url: canonical,
    ...(frontmatter.lastVerified
      ? {
          datePublished: new Date(frontmatter.lastVerified).toISOString(),
          dateModified: new Date(frontmatter.lastVerified).toISOString(),
        }
      : {}),
    author: { '@type': 'Organization', name: SITE_AUTHOR, url: SITE_URL },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/icon-512.png` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Guides', item: `${SITE_URL}/guides` },
      { '@type': 'ListItem', position: 3, name: frontmatter.title, item: canonical },
    ],
  };

  const faqSchema = faqs.length
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map(f => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      }
    : null;

  // Body HTML is sanitised in getGuidePage → renderMarkdown (sanitize-html),
  // the same trusted pipeline used by pathway guides, blog and route pages.
  const bodyHtml = { __html: html };

  return (
    <main className="min-h-screen flex flex-col" style={{ backgroundColor: '#F8F5F0' }}>
      <JsonLd data={articleSchema} />
      <JsonLd data={breadcrumbSchema} />
      {faqSchema && <JsonLd data={faqSchema} />}

      <div>
        <SiteNav />
      </div>

      <div className="flex-1 max-w-6xl w-full mx-auto px-4 lg:px-8 py-10">
        <header className="flex flex-col gap-4 mb-10">
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-x-2 gap-y-1 font-display font-bold uppercase tracking-[0.18em] text-xs"
            style={{ color: '#C9A84C' }}
          >
            <Link href="/" className="hover:underline">Home</Link>
            <span aria-hidden style={{ color: '#6B6B6B' }}>/</span>
            <span style={{ color: '#6B6B6B' }}>Guides</span>
          </nav>

          {frontmatter.kicker && (
            <p
              className="font-display font-bold uppercase tracking-[0.18em] text-xs"
              style={{ color: '#C9A84C' }}
            >
              {frontmatter.kicker}
            </p>
          )}
          <h1
            className="font-display font-bold uppercase tracking-wide text-3xl sm:text-4xl leading-tight"
            style={{ color: '#2C2C2C' }}
          >
            {frontmatter.title}
          </h1>
          <p className="font-body text-base" style={{ color: '#6B6B6B' }}>
            {frontmatter.description}
          </p>
          <div
            className="flex flex-wrap items-center gap-x-3 gap-y-1 font-body text-xs"
            style={{ color: '#6B6B6B' }}
          >
            <span>By {SITE_NAME}</span>
            {frontmatter.lastVerified && (
              <span>· Last verified {formatDate(frontmatter.lastVerified)}</span>
            )}
            <span>· {readTime} min read</span>
          </div>
        </header>

        <div className="lg:grid lg:grid-cols-[260px_1fr] lg:gap-12 lg:items-start">
          <aside
            className="hidden lg:block sticky top-20 self-start rounded-2xl p-5"
            style={{ backgroundColor: '#FFFFFF', border: '1.5px solid #EDE8E0' }}
          >
            <TableOfContents items={tocItems} />
          </aside>

          <div className="flex flex-col gap-10 min-w-0">
            <article
              className="prose prose-sm sm:prose-base max-w-none
                prose-headings:font-display prose-headings:uppercase prose-headings:tracking-wide
                prose-h1:text-2xl prose-h2:text-xl prose-h3:text-base
                prose-headings:text-[#2C2C2C]
                prose-p:text-[#2C2C2C] prose-p:font-body
                prose-li:text-[#2C2C2C] prose-li:font-body
                prose-a:text-[#1B4D3E] prose-a:no-underline hover:prose-a:underline
                prose-strong:text-[#2C2C2C]
                prose-table:text-sm
                prose-th:bg-[#EDE8E0] prose-th:text-[#2C2C2C]
                prose-td:text-[#2C2C2C] prose-td:text-xs
                prose-blockquote:border-l-[#C9A84C] prose-blockquote:text-[#6B6B6B]
                prose-hr:border-[#EDE8E0]"
              dangerouslySetInnerHTML={bodyHtml}
            />

            {faqs.length > 0 && (
              <section id="faq" className="flex flex-col gap-4 scroll-mt-24">
                <h2
                  className="font-display font-bold uppercase tracking-wide text-xl"
                  style={{ color: '#2C2C2C' }}
                >
                  Frequently asked questions
                </h2>
                {faqs.map(faq => (
                  <div
                    key={faq.q}
                    className="rounded-xl p-5 flex flex-col gap-2"
                    style={{ backgroundColor: '#FFFFFF', border: '1px solid #EDE8E0' }}
                  >
                    <h3 className="font-display font-bold text-base" style={{ color: '#2C2C2C' }}>
                      {faq.q}
                    </h3>
                    <p className="font-body text-sm leading-relaxed" style={{ color: '#2C2C2C' }}>
                      {faq.a}
                    </p>
                  </div>
                ))}
              </section>
            )}

            <footer
              className="border-t pt-6 pb-2 flex flex-col gap-3 font-body text-xs leading-relaxed"
              style={{ color: '#6B6B6B', borderColor: '#EDE8E0' }}
            >
              <p>
                <strong style={{ color: '#2C2C2C' }}>Disclaimer:</strong> This guide is general
                information for South Africans preparing to work abroad. It is not legal or
                immigration advice. Government fees, processing times and requirements change —
                always confirm against the official source before acting.
              </p>
            </footer>
          </div>
        </div>
      </div>

      <SiteFooter />
    </main>
  );
}
