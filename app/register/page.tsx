import type { Metadata } from 'next';
import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';
import { CATEGORIES } from '@/lib/categories';
import RegisterForm from './RegisterForm';

export const metadata: Metadata = {
  title: 'Create your account — Jobabroad',
  description:
    'Register for free access to your work-abroad pathway guide. South African mobile + email required.',
  alternates: { canonical: '/register' },
};

const REGISTRABLE = CATEGORIES.filter((c) => c.id !== 'other').map((c) => ({
  id: c.id,
  label: c.label,
  emoji: c.emoji,
}));

const REGISTRABLE_IDS = new Set<string>(REGISTRABLE.map((c) => c.id));

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const params = await searchParams;
  const preselect =
    params.category && REGISTRABLE_IDS.has(params.category)
      ? params.category
      : null;

  const previewCat = preselect
    ? CATEGORIES.find((c) => c.id === preselect) ?? null
    : null;

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#F8F5F0' }}>
      <SiteNav />

      <section className="max-w-2xl mx-auto px-6 pt-12 pb-16">
        <div className="flex flex-col gap-6 mb-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-px" style={{ backgroundColor: '#ff751f' }} />
            <span
              className="font-display text-[0.65rem] md:text-xs font-semibold uppercase tracking-[0.08em] md:tracking-[0.2em]"
              style={{ color: '#ff751f' }}
            >
              Free access
            </span>
          </div>
          <h1
            className="font-display font-bold uppercase leading-tight"
            style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', color: '#2C2C2C' }}
          >
            Create your account
          </h1>
          <p className="font-body" style={{ color: '#6B6B6B' }}>
            Pick the pathway that fits you. We&apos;ll send a confirmation email — click
            the link inside to unlock your guide.
          </p>
        </div>

        <RegisterSummary category={previewCat} />

        <RegisterForm preselect={preselect} categories={REGISTRABLE} />
      </section>

      <SiteFooter />
    </main>
  );
}

/** Pre-signup teaser: what a registered user gets, free. Driven by the
 *  pre-selected category when present, generic otherwise. The full guides
 *  live behind registration; this is the enticement to create an account. */
function RegisterSummary({
  category,
}: {
  category: (typeof CATEGORIES)[number] | null;
}) {
  const label = category?.label ?? 'your';
  const destinations = category?.destinations ?? [];

  const guideItems = [
    destinations.length
      ? `Where ${label} jobs are: ${destinations.join(', ')}`
      : 'Which countries are hiring right now',
    'Visa routes and realistic, all-in costs',
    'Vetted recruiters — and the scams to avoid',
    'Documents and steps, in the right order',
  ];

  const checkItems = [
    'A personalised eligibility score for your profile',
    'What’s working, and your single biggest blocker',
    'A personalised PDF action plan, emailed to you',
    'Your own dashboard to track it all',
  ];

  return (
    <div
      className="rounded-2xl overflow-hidden mb-10"
      style={{ backgroundColor: '#FFFFFF', border: '1.5px solid #EDE8E0' }}
    >
      <div style={{ height: 3, backgroundColor: '#ff751f' }} aria-hidden />
      <div className="px-6 py-6 flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h2
            className="font-display font-bold uppercase tracking-wide text-lg"
            style={{ color: '#2C2C2C' }}
          >
            {category ? `Your ${label} pathway — free` : 'What you get — free'}
          </h2>
          <p className="font-body text-sm" style={{ color: '#6B6B6B' }}>
            Create your free account to unlock the full guide. No payment, ever.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <SummaryList
            kicker="Inside your guide"
            accent="#1B4D3E"
            items={guideItems}
          />
          <SummaryList
            kicker="After a quick eligibility check"
            accent="#ff751f"
            items={checkItems}
          />
        </div>
      </div>
    </div>
  );
}

function SummaryList({
  kicker,
  accent,
  items,
}: {
  kicker: string;
  accent: string;
  items: string[];
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <div className="w-6 h-px" style={{ backgroundColor: accent }} aria-hidden />
        <span
          className="font-display text-xs font-semibold uppercase tracking-wider"
          style={{ color: accent }}
        >
          {kicker}
        </span>
      </div>
      <ul className="flex flex-col gap-2">
        {items.map((item, i) => (
          <li
            key={i}
            className="font-body text-sm flex items-start gap-2"
            style={{ color: '#2C2C2C' }}
          >
            <span aria-hidden style={{ color: accent, lineHeight: 1.4 }}>
              ✓
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
