import type { Metadata } from 'next';
import InterestGrid from '@/components/InterestGrid';
import CountryStats from '@/components/CountryStats';
import HowItWorks from '@/components/HowItWorks';
import FAQ from '@/components/FAQ';
import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';

// Title, description and Open Graph come from the root layout's defaults;
// only the canonical URL is page-specific (?src= UTM params must not fork it).
export const metadata: Metadata = {
  alternates: { canonical: '/' },
};

interface Props {
  searchParams: Promise<{ src?: string }>;
}

export default async function Home({ searchParams }: Props) {
  const { src } = await searchParams;

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#F8F5F0' }}>

      <SiteNav src={src} />

      {/* Divider */}
      <div className="max-w-6xl mx-auto px-6">
        <div className="h-px" style={{ backgroundColor: '#EDE8E0' }} />
      </div>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-14 pb-12">
        <div className="flex flex-col gap-6 max-w-3xl">

          {/* Kicker */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-px" style={{ backgroundColor: '#ff751f' }} />
            <span
              className="font-display text-[0.65rem] md:text-xs font-semibold uppercase tracking-[0.08em] md:tracking-[0.2em]"
              style={{ color: '#ff751f' }}
            >
              Before you pay a recruiter, get the facts first.
            </span>
          </div>

          {/* Headline */}
          <h1
            className="font-display font-bold uppercase leading-none"
            style={{ fontSize: 'clamp(2.8rem, 8vw, 5rem)', color: '#2C2C2C' }}
          >
            Your next job<br />
            <span style={{ color: '#1B4D3E' }}>is overseas.</span>
          </h1>

          {/* Sub-headline */}
          <p className="font-body text-base leading-relaxed max-w-xl" style={{ color: '#6B6B6B' }}>
            Get a{' '}
            <em className="italic font-semibold" style={{ color: '#1B4D3E' }}>
              Personalised Eligibility Check
            </em>{' '}
            before spending money on documents, agents, or visa applications.
          </p>

          {/* Trust line */}
          <p className="font-body text-sm font-semibold max-w-xl" style={{ color: '#1B4D3E' }}>
            No placement fees. No fake promises. Just clear information.
          </p>

          {/* CTA hint pill */}
          <div className="flex items-center gap-3 mt-2 self-start px-4 py-2 rounded-full" style={{ backgroundColor: '#EDE8E0' }}>
            <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: '#ff751f' }} />
            <span className="font-body text-sm font-bold" style={{ color: '#2C2C2C' }}>
              Pick your field below — WhatsApp opens automatically.
            </span>
          </div>
        </div>
      </section>

      {/* Interest Selector */}
      <section id="interest-grid" className="px-6 py-14" style={{ backgroundColor: '#EDE8E0' }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <h2
              className="font-display font-bold uppercase text-lg tracking-[0.12em]"
              style={{ color: '#1B4D3E' }}
            >
              What's your field?
            </h2>
            <div className="flex-1 h-px" style={{ backgroundColor: '#C9A84C', opacity: 0.4 }} />
          </div>
          <InterestGrid source={src} />
        </div>
      </section>

      {/* How it works */}
      <HowItWorks />

      {/* Trust band */}
      <section className="px-6 py-16" style={{ backgroundColor: '#1B4D3E' }}>
        <div className="max-w-6xl mx-auto">

          {/* Heading — full width */}
          <p
            className="font-display font-bold uppercase leading-tight text-center mb-10"
            style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', color: '#F8F5F0' }}
          >
            Know what&apos;s real before<br />you pay a recruiter anything.
          </p>

          <div className="flex flex-col items-center gap-6 max-w-3xl mx-auto">

            <p className="font-body text-sm leading-relaxed text-center" style={{ color: 'rgba(248,245,240,0.7)' }}>
              The information comes from official government, regulator, and programme sources. Not WhatsApp rumours. Not word of mouth. Not an agent guessing.
            </p>

            <p className="font-body leading-relaxed text-center italic" style={{ fontSize: 'clamp(1rem, 2.5vw, 1.25rem)', color: '#F8F5F0' }}>
              I built Jobabroad because I watched too many South Africans hand money to fake recruiters and get nothing back.
            </p>

            <div className="w-16 h-px" style={{ backgroundColor: '#C9A84C' }} />

            <p
              className="font-body font-semibold leading-relaxed text-center"
              style={{ fontSize: 'clamp(1rem, 2vw, 1.2rem)', color: '#C9A84C' }}
            >
              The Work Abroad Playbook is free. Register, confirm your email, and your guide unlocks immediately.<br />
              No monthly fees, no hidden costs. No fake recruiter taking R5,000 from you.
            </p>

            <a
              href="#interest-grid"
              className="flex items-center gap-2 font-body font-semibold text-sm px-6 py-3 rounded-full mt-2"
              style={{ backgroundColor: '#C9A84C', color: '#FFFFFF' }}
            >
              Pick your field →
            </a>

          </div>
        </div>
      </section>

      {/* FAQ */}
      <FAQ />

      {/* Country stats */}
      <CountryStats />

      <SiteFooter src={src} />
    </main>
  );
}
