import { ImageResponse } from 'next/og';
import { SITE_DESCRIPTION } from '@/lib/site';

// Default social-share card, applied to every route that doesn't define its
// own opengraph-image. Rendered at build time by next/og (Satori).
export const alt = 'Jobabroad — Work Abroad from South Africa';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
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
        {/* Kicker */}
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
            Work Abroad from South Africa
          </div>
        </div>

        {/* Wordmark + tagline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          <div style={{ display: 'flex', fontSize: '150px', fontWeight: 800, lineHeight: 1 }}>
            <span style={{ color: '#F8F5F0' }}>job</span>
            <span style={{ color: '#ff751f' }}>abroad</span>
          </div>
          <div
            style={{
              fontSize: '40px',
              color: 'rgba(248,245,240,0.85)',
              maxWidth: '900px',
              lineHeight: 1.3,
            }}
          >
            {SITE_DESCRIPTION}
          </div>
        </div>

        {/* Domain */}
        <div style={{ fontSize: '30px', color: '#C9A84C', fontWeight: 700 }}>
          jobabroad.co.za
        </div>
      </div>
    ),
    { ...size },
  );
}
