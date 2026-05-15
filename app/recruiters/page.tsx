import type { Metadata } from 'next';
import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';
import RecruitersTable from '@/components/RecruitersTable';
import { pageMetadata } from '@/lib/site';

export const metadata: Metadata = pageMetadata({
  title: 'Recruiters & Agencies',
  description:
    'A list of recruiters, placement agencies and migration consultants we found while researching work-abroad pathways for South Africans. We don\'t endorse any of them — verify each one independently before paying anything.',
  path: '/recruiters',
});

interface Props {
  searchParams: Promise<{ src?: string }>;
}

export default async function RecruitersPage({ searchParams }: Props) {
  const { src } = await searchParams;

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#F8F5F0' }}>
      <SiteNav src={src} />

      <div className="max-w-6xl mx-auto px-6">
        <div className="h-px" style={{ backgroundColor: '#EDE8E0' }} />
      </div>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-12 pb-8">
        <div className="flex flex-col gap-5">
          <div className="max-w-3xl flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-px" style={{ backgroundColor: '#ff751f' }} />
              <span
                className="font-display text-[0.65rem] md:text-xs font-semibold uppercase tracking-[0.08em] md:tracking-[0.2em]"
                style={{ color: '#ff751f' }}
              >
                Recruiters &amp; agencies — research log
              </span>
            </div>

            <h1
              className="font-display font-bold uppercase leading-none"
              style={{ fontSize: 'clamp(2.2rem, 6vw, 3.8rem)', color: '#2C2C2C' }}
            >
              Recruiters &amp; agencies we&apos;ve come across
            </h1>

            <p className="font-body text-lg leading-relaxed" style={{ color: '#2C2C2C' }}>
              While we built our work-abroad guides, we kept a list of every recruiter,
              placement agency and migration consultant that came up. This is that list — open
              for anyone to use.
            </p>
          </div>

          <div
            className="rounded-2xl p-5 border"
            style={{ backgroundColor: '#FFFFFF', borderColor: '#EDE8E0' }}
          >
            <p className="font-display text-xs uppercase tracking-[0.15em] mb-2" style={{ color: '#ff751f' }}>
              Important
            </p>
            <p className="font-body text-sm leading-relaxed" style={{ color: '#2C2C2C' }}>
              We do <strong>not</strong> endorse any company below. Inclusion only means we found
              them while researching — not that we vouch for them. Always verify a recruiter
              yourself before paying anything: search reviews, confirm their CIPC registration,
              and never pay an upfront placement fee.{' '}
              <a
                href="/scam-warnings"
                className="underline"
                style={{ color: '#1B4D3E' }}
              >
                See common scam patterns
              </a>{' '}
              if you&apos;re unsure.
            </p>
          </div>
        </div>
      </section>

      {/* Table */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <RecruitersTable />
      </section>

      <SiteFooter src={src} />
    </main>
  );
}
