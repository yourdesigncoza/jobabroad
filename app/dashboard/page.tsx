import type { Metadata } from 'next';
import Link from 'next/link';
import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';
import FollowUpForm from '@/components/FollowUpForm';
import { requireSession } from '@/lib/auth-guards';
import { CATEGORIES } from '@/lib/categories';
import { getCachedReportPath } from '@/lib/reports/generator';
import { getLatestAssessment } from '@/lib/assessments/assessment-client';

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
  /** Open in a new tab. Used for reference cards (recruiters, scam warnings)
   *  so the dashboard stays open behind them. */
  newTab?: boolean;
  /** Optional corner badge (e.g. "Start Here") drawn top-left. */
  badge?: { label: string; tone?: 'orange' | 'green' };
};

function Card({ href, title, body, accent = '#1B4D3E', newTab, badge }: CardProps) {
  const badgeColour = badge?.tone === 'green' ? '#1B4D3E' : '#ff751f';
  return (
    <Link
      href={href}
      target={newTab ? '_blank' : undefined}
      rel={newTab ? 'noopener noreferrer' : undefined}
      className="relative block rounded-2xl p-6 transition-shadow hover:shadow-md"
      style={{ backgroundColor: '#FFFFFF', border: '1.5px solid #EDE8E0' }}
    >
      {badge && (
        <span
          className="absolute -top-2 left-4 font-display font-bold uppercase text-[0.65rem] tracking-[0.15em] px-3 py-1 rounded-full"
          style={{ backgroundColor: badgeColour, color: '#FFFFFF' }}
        >
          {badge.label}
        </span>
      )}
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
    .select('name, category, tier, paid_email_credits')
    .eq('user_id', user.id)
    .single();

  if (!profile) return <ProfilePendingSkeleton />;

  const categoryLabel =
    CATEGORIES.find((c) => c.id === profile.category)?.label ?? profile.category;
  const isPaid = profile.tier === 'paid';
  const bookHref = `/members/${profile.category}/book`;
  // The PDF only exists AFTER the post-call admin action generates it. Until
  // then, the dashboard shows a "ready after your call" state instead of a
  // download link.
  const reportReady = isPaid ? Boolean(await getCachedReportPath(user.id)) : false;

  // If the user has already submitted the assessment, swap the "Eligibility
  // assessment" card to "View your score" pointing at /score. Form -> result
  // round-trip so users can return to their result rather than redo the form.
  const latestAssessment = await getLatestAssessment(user.id);
  const assessmentSubmitted =
    latestAssessment?.status === 'submitted' &&
    latestAssessment.category === profile.category;

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

        {isPaid && (
          <section
            className="rounded-2xl p-6 mb-10"
            style={{ backgroundColor: '#FFFFFF', border: '1.5px solid #EDE8E0' }}
          >
            <div className="flex flex-col gap-1 mb-6">
              <div className="flex items-center gap-2">
                <div className="w-6 h-px" style={{ backgroundColor: '#1B4D3E' }} />
                <span
                  className="font-display text-xs font-semibold uppercase tracking-wider"
                  style={{ color: '#1B4D3E' }}
                >
                  Paid tier
                </span>
              </div>
              <h2
                className="font-display font-bold uppercase text-xl"
                style={{ color: '#2C2C2C' }}
              >
                Your full report &amp; call
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <Link
                href={bookHref}
                className="block rounded-xl p-5 transition-shadow hover:shadow-md"
                style={{ backgroundColor: '#1B4D3E', color: '#F8F5F0' }}
              >
                <div className="flex flex-col gap-1">
                  <span className="font-display font-bold uppercase tracking-wide text-sm">
                    Book your 15-min call
                  </span>
                  <span
                    className="font-body text-xs"
                    style={{ color: 'rgba(248,245,240,0.75)' }}
                  >
                    Pick a slot that suits you
                  </span>
                </div>
              </Link>
              {reportReady ? (
                <a
                  href="/api/reports/download"
                  className="block rounded-xl p-5 transition-shadow hover:shadow-md"
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1.5px solid #1B4D3E',
                    color: '#1B4D3E',
                  }}
                >
                  <div className="flex flex-col gap-1">
                    <span className="font-display font-bold uppercase tracking-wide text-sm">
                      Download report (PDF)
                    </span>
                    <span className="font-body text-xs" style={{ color: '#6B6B6B' }}>
                      Your full personalised assessment
                    </span>
                  </div>
                </a>
              ) : (
                <div
                  className="block rounded-xl p-5"
                  style={{
                    backgroundColor: '#F8F5F0',
                    border: '1.5px dashed #C9A84C',
                    color: '#6B6B6B',
                  }}
                >
                  <div className="flex flex-col gap-1">
                    <span
                      className="font-display font-bold uppercase tracking-wide text-sm"
                      style={{ color: '#2C2C2C' }}
                    >
                      Report ready after your call
                    </span>
                    <span className="font-body text-xs">
                      We write your personalised report right after we speak, then email it here.
                    </span>
                  </div>
                </div>
              )}
            </div>

            <FollowUpForm
              credits={profile.paid_email_credits ?? 0}
              bookHref={bookHref}
            />
          </section>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          <Card
            href={`/members/${profile.category}`}
            title={`${categoryLabel} guide`}
            body="Field-tested pathway: countries, documents, costs, visa routes."
            badge={{ label: 'Start here' }}
          />
          {assessmentSubmitted ? (
            <Card
              href={`/members/${profile.category}/score`}
              title="View your score"
              body="See your eligibility band, what's working, and your biggest blocker. Retake the assessment anytime."
              accent="#ff751f"
            />
          ) : (
            <Card
              href={`/members/${profile.category}/assessment`}
              title="Eligibility assessment"
              body="Find out what blockers stand between you and a job abroad."
            />
          )}
          <Card
            href="/recruiters"
            title="Vetted recruiters"
            body="Browse legitimate recruiters and placement agencies."
            accent="#C9A84C"
            newTab
          />
          <Card
            href="/scam-warnings"
            title="Scam warnings"
            body="Patterns to avoid — protect yourself before you pay anyone."
            accent="#ff751f"
            newTab
          />
        </div>

        <div className="flex flex-col items-start gap-3">
          <form action="/logout" method="POST">
            <button
              type="submit"
              className="font-display uppercase tracking-wider text-sm font-semibold px-8 py-4 rounded-md cursor-pointer"
              style={{ backgroundColor: '#1B4D3E', color: '#F8F5F0' }}
            >
              Log out
            </button>
          </form>
          <Link
            href="/forgot-password"
            className="font-display uppercase tracking-wider text-xs font-semibold underline-offset-4 hover:underline"
            style={{ color: '#ff751f' }}
          >
            Reset password
          </Link>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
