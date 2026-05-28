import { ImageResponse } from 'next/og';
import { getComparePage, listCompareSlugs } from '@/lib/compare-content';

// Per-comparison share card: brand wordmark + page title + keyword kicker.
export const alt = 'Jobabroad — work-abroad comparison share card';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export function generateStaticParams() {
  return listCompareSlugs().map(slug => ({ slug }));
}

export default async function CompareOgImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = getComparePage(slug);
  const kicker = page?.frontmatter.primaryKeyword ?? 'Compare Work-Abroad Routes';
  const title = page?.frontmatter.title ?? 'Jobabroad';

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
            fontSize: '58px',
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
