import { ImageResponse } from 'next/og';
import { CATEGORIES } from '@/lib/categories';
import { listPathwaySlugs } from '@/lib/pathway-content';

// Per-category share card: brand wordmark + category label + destinations.
// Rendered at build time by next/og (Satori) for each generated demo route.
export const alt = 'Jobabroad — category share card';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export async function generateStaticParams() {
  return listPathwaySlugs().map(category => ({ category }));
}

export default async function CategoryOgImage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const categoryDef = CATEGORIES.find(c => c.id === category);
  const label = categoryDef?.label ?? 'Work Abroad';
  const destinations = categoryDef?.destinations.join(' · ') ?? 'Worldwide';
  const description = categoryDef
    ? `${categoryDef.description}. Visa routes, costs, scams.`
    : 'Real pathways to overseas work for South Africans.';

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
            {`${label} · Jobs Abroad`}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'flex', fontSize: '110px', fontWeight: 800, lineHeight: 1 }}>
            <span style={{ color: '#F8F5F0' }}>job</span>
            <span style={{ color: '#ff751f' }}>abroad</span>
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: '46px',
              color: '#F8F5F0',
              fontWeight: 700,
              lineHeight: 1.15,
              maxWidth: '1000px',
            }}
          >
            {`${label} pathways to ${destinations}`}
          </div>
          <div
            style={{
              fontSize: '28px',
              color: 'rgba(248,245,240,0.78)',
              maxWidth: '1000px',
              lineHeight: 1.4,
            }}
          >
            {description}
          </div>
        </div>

        <div style={{ fontSize: '30px', color: '#C9A84C', fontWeight: 700 }}>
          jobabroad.co.za
        </div>
      </div>
    ),
    { ...size },
  );
}
