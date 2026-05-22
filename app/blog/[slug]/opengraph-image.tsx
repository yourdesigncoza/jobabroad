import { ImageResponse } from 'next/og';
import { getBlogPost, listBlogSlugs } from '@/lib/blog-content';

// Per-article share card: brand wordmark + article title + kicker.
export const alt = 'Jobabroad — article share card';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export function generateStaticParams() {
  return listBlogSlugs().map(slug => ({ slug }));
}

export default async function BlogOgImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  const kicker = post?.frontmatter.primaryKeyword ?? 'Work Abroad';
  const title = post?.frontmatter.title ?? 'Jobabroad';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#1B4D3E',
          padding: '80px',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ width: '56px', height: '6px', backgroundColor: '#ff751f' }} />
          <div
            style={{
              fontSize: '26px',
              letterSpacing: '0.22em',
              color: '#C9A84C',
              fontWeight: 700,
              textTransform: 'uppercase',
            }}
          >
            {kicker}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            fontSize: '60px',
            color: '#F8F5F0',
            fontWeight: 800,
            lineHeight: 1.2,
            maxWidth: '1040px',
          }}
        >
          {title}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', fontSize: '34px', fontWeight: 800 }}>
            <span style={{ color: '#F8F5F0' }}>job</span>
            <span style={{ color: '#ff751f' }}>abroad</span>
          </div>
          <div style={{ fontSize: '24px', color: '#C9A84C', fontWeight: 700 }}>
            · jobabroad.co.za
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
