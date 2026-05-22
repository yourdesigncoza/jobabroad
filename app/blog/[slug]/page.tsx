import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import JsonLd from '@/components/JsonLd';
import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';
import TableOfContents from '@/components/TableOfContents';
import { getBlogPost, listBlogSlugs } from '@/lib/blog-content';
import { pageMetadata, SITE_URL, SITE_NAME, SITE_AUTHOR } from '@/lib/site';

export function generateStaticParams() {
  return listBlogSlugs().map(slug => ({ slug }));
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
  const post = getBlogPost(slug);
  if (!post) return { robots: { index: false, follow: false } };

  return pageMetadata({
    title: post.frontmatter.title,
    description: post.frontmatter.description,
    path: `/blog/${slug}`,
    type: 'article',
    publishedTime: new Date(post.frontmatter.published),
  });
}

export default async function BlogArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  const { frontmatter, html, toc, readTime } = post;
  const published = frontmatter.published;
  const updated = frontmatter.updated ?? frontmatter.published;
  const canonical = `${SITE_URL}/blog/${slug}`;
  const registerHref = frontmatter.category
    ? `/register?category=${frontmatter.category}`
    : '/register';

  const faqs = frontmatter.faqs ?? [];
  const tocItems = faqs.length ? [...toc, { id: 'faq', text: 'FAQ' }] : toc;

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: frontmatter.title,
    description: frontmatter.description,
    image: `${canonical}/opengraph-image`,
    url: canonical,
    datePublished: new Date(published).toISOString(),
    dateModified: new Date(updated).toISOString(),
    author: { '@type': 'Organization', name: SITE_AUTHOR, url: SITE_URL },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/icon-512.png` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
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

  // Article HTML is sanitised in getBlogPost → renderMarkdown (sanitize-html),
  // the same trusted pipeline used by the pathway guides.
  const bodyHtml = { __html: html };

  return (
    <main className="min-h-screen flex flex-col" style={{ backgroundColor: '#F8F5F0' }}>
      <JsonLd data={articleSchema} />
      {faqSchema && <JsonLd data={faqSchema} />}

      {/* Wrapper keeps SiteNav out of the flex-item context, so its mx-auto
          nav spans full width like on the home page (block <main>). */}
      <div>
        <SiteNav />
      </div>

      <div className="flex-1 max-w-6xl w-full mx-auto px-4 lg:px-8 py-10">
        {/* Article header */}
        <header className="flex flex-col gap-4 mb-10">
          <Link
            href="/blog"
            className="font-display font-bold uppercase tracking-[0.18em] text-xs hover:underline"
            style={{ color: '#C9A84C' }}
          >
            ← Blog
          </Link>
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
            <span>Published {formatDate(published)}</span>
            {updated !== published && <span>· Updated {formatDate(updated)}</span>}
            <span>· {readTime} min read</span>
          </div>
          {frontmatter.pillarHref && frontmatter.pillarLabel && (
            <Link
              href={frontmatter.pillarHref}
              className="font-body text-sm hover:underline self-start"
              style={{ color: '#1B4D3E' }}
            >
              Part of the {frontmatter.pillarLabel} →
            </Link>
          )}
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
                  Register free to unlock the full pathway guide and an eligibility assessment
                  built for your situation.
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
                <strong style={{ color: '#2C2C2C' }}>Disclaimer:</strong> This article is general
                information about work-abroad pathways. It is not immigration advice and is not
                tailored to your circumstances. For advice on your situation, consult a licensed
                immigration adviser. Visa rules, fees and exam requirements change — always confirm
                against the official source before acting.
              </p>
            </footer>
          </div>
        </div>
      </div>

      <SiteFooter />
    </main>
  );
}
