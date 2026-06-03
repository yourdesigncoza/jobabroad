import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import JsonLd from '@/components/JsonLd';
import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';
import TableOfContents from '@/components/TableOfContents';
import FaqSection from '@/components/FaqSection';
import { faqPageSchema } from '@/lib/schema';
import { getRoutePage, listRouteParams } from '@/lib/route-content';
import { CATEGORIES } from '@/lib/categories';
import { pageMetadata, SITE_URL, SITE_NAME, SITE_AUTHOR } from '@/lib/site';

export function generateStaticParams() {
  return listRouteParams();
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
  params: Promise<{ role: string; country: string }>;
}): Promise<Metadata> {
  const { role, country } = await params;
  const page = getRoutePage(role, country);
  if (!page) return { robots: { index: false, follow: false } };

  return pageMetadata({
    title: page.frontmatter.title,
    description: page.frontmatter.description,
    path: `/routes/${role}/${country}`,
    type: 'article',
    publishedTime: page.frontmatter.published
      ? new Date(page.frontmatter.published)
      : undefined,
  });
}

export default async function RoutePageView({
  params,
}: {
  params: Promise<{ role: string; country: string }>;
}) {
  const { role, country } = await params;
  const page = getRoutePage(role, country);
  if (!page) notFound();

  const { frontmatter, html, toc, readTime } = page;
  const categoryDef = CATEGORIES.find(c => c.id === frontmatter.category);
  const categoryLabel = categoryDef?.label ?? 'Work abroad';
  const pillarHref = `/pathways/${frontmatter.category}`;
  const registerHref = `/register?category=${frontmatter.category}`;

  const published = frontmatter.published ?? frontmatter.lastVerified;
  const updated = frontmatter.updated ?? frontmatter.lastVerified ?? published;
  const canonical = `${SITE_URL}/routes/${role}/${country}`;

  const faqs = frontmatter.faqs ?? [];
  const tocItems = faqs.length ? [...toc, { id: 'faq', text: 'FAQ' }] : toc;

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: frontmatter.title,
    description: frontmatter.description,
    image: `${canonical}/opengraph-image`,
    url: canonical,
    ...(published ? { datePublished: new Date(published).toISOString() } : {}),
    ...(updated ? { dateModified: new Date(updated).toISOString() } : {}),
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
      {
        '@type': 'ListItem',
        position: 2,
        name: `${categoryLabel} pathway`,
        item: `${SITE_URL}${pillarHref}`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: `${frontmatter.role} in ${frontmatter.country}`,
        item: canonical,
      },
    ],
  };

  const faqSchema = faqPageSchema(faqs);

  // Body HTML is sanitised in getRoutePage → renderMarkdown (sanitize-html),
  // the same trusted pipeline used by pathway guides and blog articles.
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
          {/* Breadcrumb trail (matches BreadcrumbList schema) */}
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-x-2 gap-y-1 font-display font-bold uppercase tracking-[0.18em] text-xs"
            style={{ color: '#C9A84C' }}
          >
            <Link href="/" className="hover:underline">Home</Link>
            <span aria-hidden style={{ color: '#6B6B6B' }}>/</span>
            <Link href={pillarHref} className="hover:underline">{categoryLabel}</Link>
            <span aria-hidden style={{ color: '#6B6B6B' }}>/</span>
            <span style={{ color: '#6B6B6B' }}>{frontmatter.country}</span>
          </nav>

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
            {frontmatter.scamRisk && (
              <span
                className="inline-flex items-center rounded-full px-2 py-0.5 font-display font-bold uppercase tracking-wide"
                style={{ backgroundColor: '#EDE8E0', color: '#B8902F' }}
              >
                Scam risk: {frontmatter.scamRisk}
              </span>
            )}
          </div>
          <Link
            href={pillarHref}
            className="font-body text-sm hover:underline self-start"
            style={{ color: '#1B4D3E' }}
          >
            Part of the {categoryLabel} work-abroad pathway →
          </Link>
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

            <FaqSection faqs={faqs} />

            {/* Primary CTA */}
            <div className="rounded-2xl p-6 flex flex-col gap-4" style={{ backgroundColor: '#1B4D3E' }}>
              <div className="flex flex-col gap-1">
                <h2
                  className="font-display font-bold uppercase tracking-wide text-base"
                  style={{ color: '#F8F5F0' }}
                >
                  Check your eligibility — free
                </h2>
                <p className="font-body text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
                  Before you spend money on documents or recruiters, find out whether this
                  route fits your profile. Register free for the full {categoryLabel.toLowerCase()}{' '}
                  pathway guide and an eligibility assessment built for your situation.
                </p>
              </div>
              <Link
                href={registerHref}
                className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 font-display font-bold uppercase text-sm tracking-wide self-start"
                style={{ backgroundColor: '#C9A84C', color: '#FFFFFF' }}
              >
                Register free →
              </Link>
            </div>

            <footer
              className="border-t pt-6 pb-2 flex flex-col gap-3 font-body text-xs leading-relaxed"
              style={{ color: '#6B6B6B', borderColor: '#EDE8E0' }}
            >
              <p>
                <strong style={{ color: '#2C2C2C' }}>Disclaimer:</strong> This page is general
                information about work-abroad pathways for South Africans. It is not immigration
                advice and is not tailored to your circumstances. For advice on your situation,
                consult a licensed immigration adviser. Visa rules, fees and registration
                requirements change — always confirm against the official source before acting.
              </p>
              <p>
                We are an information service. We do not place candidates or act as recruiters,
                and we do not guarantee employment.
              </p>
            </footer>
          </div>
        </div>
      </div>

      <SiteFooter />
    </main>
  );
}
