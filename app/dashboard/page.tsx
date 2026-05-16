import type { Metadata } from 'next';
import Link from 'next/link';
import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';
import { requireSession } from '@/lib/auth-guards';
import { CATEGORIES } from '@/lib/categories';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Your dashboard — Jobabroad',
  description: 'Access your pathway guide, eligibility assessment, recruiters list, and scam warnings.',
  alternates: { canonical: '/dashboard' },
  robots: { index: false, follow: false },
};

type CardProps = {
  href: string;
  title: string;
  body: string;
  accent?: string;
};

function Card({ href, title, body, accent = '#1B4D3E' }: CardProps) {
  return (
    <Link
      href={href}
      className="block rounded-2xl p-6 transition-shadow hover:shadow-md"
      style={{ backgroundColor: '#FFFFFF', border: '1.5px solid #EDE8E0' }}
    >
      <div className="flex flex-col gap-2">
        <div className="w-8 h-px" style={{ backgroundColor: accent }} aria-hidden />
        <h2
          className="font-display font-bold uppercase tracking-wide text-base"
          style={{ color: '#2C2C2C' }}
        >
          {title}
        </h2>
        <p className="font-body text-sm" style={{ color: '#6B6B6B' }}>
          {body}
        </p>
      </div>
    </Link>
  );
}

function ProfilePendingSkeleton() {
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '';
  const waLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    "Hi, my dashboard is stuck on 'Setting up your account…'. Can you help?",
  )}`;
  return (
    <main className="min-h-screen" style={{ backgroundColor: '#F8F5F0' }}>
      {/* meta-refresh: profile usually appears within 1-2 cycles */}
      <meta httpEquiv="refresh" content="2" />
      <SiteNav />
      <section className="max-w-md mx-auto px-6 py-20 flex flex-col gap-4">
        <h1
          className="font-display font-bold uppercase tracking-wide text-2xl"
          style={{ color: '#2C2C2C' }}
        >
          Setting up your account…
        </h1>
        <p className="font-body" style={{ color: '#6B6B6B' }}>
          Just a moment while we finalise your profile. This page refreshes automatically.
        </p>
        <p className="font-body text-sm" style={{ color: '#6B6B6B' }}>
          Stuck for longer than 30 seconds?{' '}
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
            style={{ color: '#1B4D3E' }}
          >
            WhatsApp us
          </a>{' '}
          and we&apos;ll sort it out.
        </p>
      </section>
      <SiteFooter />
    </main>
  );
}

export default async function DashboardPage() {
  const { supabase, user } = await requireSession('/dashboard');

  const { data: profile } = await supabase
    .from('profiles')
    .select('name, category')
    .eq('user_id', user.id)
    .single();

  if (!profile) return <ProfilePendingSkeleton />;

  const categoryLabel =
    CATEGORIES.find((c) => c.id === profile.category)?.label ?? profile.category;

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#F8F5F0' }}>
      <SiteNav />

      <div className="max-w-6xl mx-auto px-6">
        <div className="h-px" style={{ backgroundColor: '#EDE8E0' }} />
      </div>

      <section className="max-w-3xl mx-auto px-6 pt-12 pb-16">
        <div className="flex flex-col gap-3 mb-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-px" style={{ backgroundColor: '#ff751f' }} />
            <span
              className="font-display text-[0.65rem] md:text-xs font-semibold uppercase tracking-[0.08em] md:tracking-[0.2em]"
              style={{ color: '#ff751f' }}
            >
              Your account
            </span>
          </div>
          <h1
            className="font-display font-bold uppercase leading-tight"
            style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', color: '#2C2C2C' }}
          >
            Hi {profile.name}
          </h1>
          <p className="font-body" style={{ color: '#6B6B6B' }}>
            Your pathway:{' '}
            <strong style={{ color: '#1B4D3E' }}>{categoryLabel}</strong>
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          <Card
            href={`/members/${profile.category}`}
            title={`${categoryLabel} guide`}
            body="Field-tested pathway: countries, documents, costs, visa routes."
          />
          <Card
            href={`/members/${profile.category}/assessment`}
            title="Eligibility assessment"
            body="Find out what blockers stand between you and a job abroad."
          />
          <Card
            href="/recruiters"
            title="Vetted recruiters"
            body="Browse legitimate recruiters and placement agencies."
            accent="#C9A84C"
          />
          <Card
            href="/scam-warnings"
            title="Scam warnings"
            body="Patterns to avoid — protect yourself before you pay anyone."
            accent="#ff751f"
          />
        </div>

        <form action="/logout" method="POST">
          <button
            type="submit"
            className="font-display uppercase tracking-wider text-xs font-semibold px-5 py-2 rounded-md cursor-pointer"
            style={{
              backgroundColor: '#F8F5F0',
              border: '1px solid #EDE8E0',
              color: '#6B6B6B',
            }}
          >
            Log out
          </button>
        </form>
      </section>

      <SiteFooter />
    </main>
  );
}
