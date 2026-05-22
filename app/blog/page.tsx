import type { Metadata } from 'next';
import Link from 'next/link';
import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';
import { getAllBlogPosts } from '@/lib/blog-content';
import { pageMetadata } from '@/lib/site';

export const metadata: Metadata = pageMetadata({
  title: 'Blog — Work Abroad Guides for South Africans',
  description:
    'Practical, up-to-date guides on working abroad from South Africa — visa routes, costs, salaries, and how to avoid recruitment scams.',
  path: '/blog',
});

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default function BlogIndexPage() {
  const posts = getAllBlogPosts();

  return (
    <main className="min-h-screen flex flex-col" style={{ backgroundColor: '#F8F5F0' }}>
      <SiteNav />

      <section className="flex-1 max-w-4xl w-full mx-auto px-6 py-16 flex flex-col gap-10">
        <header className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <span style={{ width: 56, height: 6, backgroundColor: '#ff751f' }} aria-hidden />
            <span
              className="font-display font-bold uppercase tracking-[0.22em] text-xs"
              style={{ color: '#C9A84C' }}
            >
              Work Abroad Guides
            </span>
          </div>
          <h1
            className="font-display font-bold uppercase tracking-wide text-4xl sm:text-5xl"
            style={{ color: '#2C2C2C' }}
          >
            The Jobabroad Blog
          </h1>
          <p className="font-body text-base" style={{ color: '#6B6B6B' }}>
            Practical, honest guides on working abroad from South Africa — visa routes, real
            costs, salaries, and how to spot the scams.
          </p>
        </header>

        {posts.length === 0 ? (
          <p className="font-body text-base" style={{ color: '#6B6B6B' }}>
            No articles published yet — check back soon.
          </p>
        ) : (
          <ul className="flex flex-col gap-5">
            {posts.map(post => (
              <li key={post.slug}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="block rounded-2xl p-6 transition-colors hover:border-[#C9A84C]"
                  style={{ backgroundColor: '#FFFFFF', border: '1.5px solid #EDE8E0' }}
                >
                  <span
                    className="font-display font-bold uppercase tracking-[0.18em] text-xs"
                    style={{ color: '#C9A84C' }}
                  >
                    {post.frontmatter.primaryKeyword}
                  </span>
                  <h2
                    className="font-display font-bold uppercase tracking-wide text-xl mt-2 leading-snug"
                    style={{ color: '#2C2C2C' }}
                  >
                    {post.frontmatter.title}
                  </h2>
                  <p className="font-body text-sm mt-2" style={{ color: '#6B6B6B' }}>
                    {post.frontmatter.description}
                  </p>
                  <span
                    className="font-body text-xs mt-3 inline-block"
                    style={{ color: '#6B6B6B' }}
                  >
                    {formatDate(post.frontmatter.published)} · {post.readTime} min read
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <SiteFooter />
    </main>
  );
}
