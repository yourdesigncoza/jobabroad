import { ImageResponse } from 'next/og';
import { getRoutePage, listRouteParams } from '@/lib/route-content';

// Per-route share card: brand wordmark + page title + keyword kicker.
export const alt = 'Jobabroad — work-abroad route share card';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export function generateStaticParams() {
  return listRouteParams();
}

export default async function RouteOgImage({
  params,
}: {
  params: Promise<{ role: string; country: string }>;
}) {
  const { role, country } = await params;
  const page = getRoutePage(role, country);
  const kicker = page?.frontmatter.primaryKeyword ?? 'Work Abroad';
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
