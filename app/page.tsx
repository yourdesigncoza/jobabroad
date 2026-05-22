import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import InterestGrid from '@/components/InterestGrid';
import CountryStats from '@/components/CountryStats';
import HowItWorks from '@/components/HowItWorks';
import FAQ from '@/components/FAQ';
import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';
import HomeStickyCta from '@/components/HomeStickyCta';

// Title, description and Open Graph come from the root layout's defaults;
// only the canonical URL is page-specific (?src= UTM params must not fork it).
export const metadata: Metadata = {
  alternates: { canonical: '/' },
};

// What a free registration actually unlocks — drives the hero proof card.
// These mirror the real free-tier deliverables (see FAQ + HowItWorks); no
// invented stats or testimonials.
const HERO_FREE_ITEMS = [
  'A personalised eligibility check for your profile',
  'Which countries are realistic for your field',
  'Document checklist and realistic costs',
  'Scam red flags and a legitimate recruiter list',
] as const;

// Official-source authorities cited across the pathway guides — shown as a
// credibility strip. Text wordmarks only (government crests are Crown
// copyright / trademarked); every name is a real source used in the guides.
const AUTHORITY_SOURCES = [
  'GOV.UK',
  'U.S. State Department',
  'Dept. Home Affairs',
  'NHS',
  'Immigration NZ',
] as const;

interface Props {
  searchParams: Promise<{ src?: string }>;
}

export default async function Home({ searchParams }: Props) {
  const { src } = await searchParams;

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#F8F5F0' }}>

      <SiteNav />

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-14 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-10 lg:gap-12 items-center">

          {/* Left — copy + CTAs */}
          <div className="flex flex-col gap-6">

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

            {/* Sub-headline — leads with the free offer */}
            <p className="font-body text-base leading-relaxed max-w-xl" style={{ color: '#6B6B6B' }}>
              Register free and get your{' '}
              <em className="italic font-semibold" style={{ color: '#1B4D3E' }}>
                country options, document checklist, real costs
              </em>{' '}
              and a personalised eligibility check — before spending a cent on documents, agents, or visa applications.
            </p>

            {/* Trust line */}
            <p className="font-body text-sm font-semibold max-w-xl" style={{ color: '#1B4D3E' }}>
              No placement fees. No fake promises. Just clear information.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-2">
              <a
                href="#interest-grid"
                className="inline-flex items-center justify-center gap-2 font-display font-bold uppercase text-sm tracking-wide px-7 py-4 rounded-full transition-all"
                style={{ backgroundColor: '#ff751f', color: '#FFFFFF' }}
              >
                Choose your field — it&apos;s free →
              </a>
              <Link
                href="/register"
                className="inline-flex items-center justify-center font-body text-sm font-semibold underline underline-offset-4 px-2 py-2"
                style={{ color: '#1B4D3E' }}
              >
                Already know your field? Register now
              </Link>
            </div>
          </div>

          {/* Right — what a free account unlocks */}
          <div className="rounded-2xl p-7 md:p-8" style={{ backgroundColor: '#1B4D3E' }}>
            <p
              className="font-display font-bold uppercase text-xs tracking-[0.15em] mb-1"
              style={{ color: '#C9A84C' }}
            >
              Free when you register
            </p>
            <p className="font-body text-sm leading-relaxed mb-5" style={{ color: 'rgba(248,245,240,0.7)' }}>
              No card. No monthly fees. Confirm your email and it unlocks immediately.
            </p>
            <ul className="flex flex-col gap-3">
              {HERO_FREE_ITEMS.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <div
                    className="mt-0.5 shrink-0 flex items-center justify-center rounded-full font-display font-bold"
                    style={{ width: '20px', height: '20px', backgroundColor: '#C9A84C', color: '#1B4D3E', fontSize: '12px' }}
                  >
                    ✓
                  </div>
                  <span className="font-body text-sm leading-snug" style={{ color: 'rgba(248,245,240,0.9)' }}>
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </section>

      {/* Authority strip — why the guides can be trusted, before the action */}
      <section className="px-6" style={{ backgroundColor: '#F8F5F0' }}>
        <div
          className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center gap-x-4 gap-y-2 py-5"
          style={{ borderTop: '1px solid #EDE8E0' }}
        >
          <span
            className="font-display font-bold uppercase text-xs tracking-[0.15em] shrink-0"
            style={{ color: '#1B4D3E' }}
          >
            Built from official sources
          </span>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            {AUTHORITY_SOURCES.map((source, i) => (
              <span key={source} className="contents">
                {i > 0 && (
                  <span
                    className="hidden sm:inline-block w-1 h-1 rounded-full"
                    style={{ backgroundColor: '#C9A84C' }}
                    aria-hidden="true"
                  />
                )}
                <span
                  className="font-display font-semibold uppercase text-xs tracking-wide"
                  style={{ color: '#6B6B6B' }}
                >
                  {source}
                </span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Interest Selector */}
      <section id="interest-grid" className="px-6 py-14" style={{ backgroundColor: '#EDE8E0' }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-3">
            <h2
              className="font-display font-bold uppercase text-lg tracking-[0.12em]"
              style={{ color: '#1B4D3E' }}
            >
              What&apos;s your field?
            </h2>
            <div className="flex-1 h-px" style={{ backgroundColor: '#C9A84C', opacity: 0.4 }} />
          </div>
          <p className="font-body text-sm leading-relaxed max-w-xl mb-8" style={{ color: '#6B6B6B' }}>
            Choose the work category that best matches your background so we can guide you to the right route.
          </p>
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

            {/* Founder — a real, named, verifiable person behind the promise */}
            <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-6 w-full">
              <Image
                src="/founder.webp"
                alt="John, founder of Jobabroad"
                width={112}
                height={112}
                className="rounded-full shrink-0 object-cover"
                style={{ border: '2px solid #C9A84C' }}
              />
              <div className="flex flex-col gap-3 text-center sm:text-left">
                <p
                  className="font-body leading-relaxed"
                  style={{ fontSize: 'clamp(0.95rem, 2vw, 1.05rem)', color: '#F8F5F0' }}
                >
                  I&apos;m John — a software developer in Mossel Bay. For 22 years I&apos;ve built
                  research and data tools with one job: telling verified fact apart from rumour.
                  Jobabroad is that same discipline pointed at working abroad. Every guide is built
                  from official government and regulator sources — because I watched too many South
                  Africans pay fake recruiters and get nothing back.
                </p>
                <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3">
                  <span
                    className="font-display font-bold uppercase text-sm tracking-wide"
                    style={{ color: '#C9A84C' }}
                  >
                    John
                  </span>
                  <a
                    href="https://www.devai.co.za/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-body text-xs font-semibold underline underline-offset-4"
                    style={{ color: 'rgba(248,245,240,0.6)' }}
                  >
                    More about John →
                  </a>
                </div>
              </div>
            </div>

            <div className="w-16 h-px" style={{ backgroundColor: '#C9A84C' }} />

            <p
              className="font-body font-semibold leading-relaxed text-center"
              style={{ fontSize: 'clamp(1rem, 2vw, 1.2rem)', color: '#C9A84C' }}
            >
              The pathway guide and personalised eligibility check are free. Register, confirm your email, and your guide unlocks immediately.<br />
              The R495 upgrade gives you a personalised action plan, emailed immediately, with an optional 15-minute review call. No subscriptions. No fake recruiter taking R5,000 from you.
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

      <SiteFooter />

      {/* Mobile sticky CTA — keeps registration tappable on the long scroll */}
      <HomeStickyCta />
    </main>
  );
}
