import type { Metadata } from 'next';
import Link from 'next/link';
import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';
import ReportStatusCard from '@/components/ReportStatusCard';
import { requireSession } from '@/lib/auth-guards';
import { hasFullAccess, hasCoachAccess } from '@/lib/access';
import { CATEGORIES } from '@/lib/categories';
import { getLatestAssessment } from '@/lib/assessments/assessment-client';
import { loadRubric, calculateScore } from '@/lib/scoring';
import { assessmentDataSchema } from '@/lib/assessments/schemas/assessment';
import PremiumUpsell from '@/components/PremiumUpsell';
import type { Band } from '@/lib/scoring/types';
import type { ReportStatusResponse } from '@/app/api/reports/status/route';

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
  /** Orange dashed border + glow — marks the card as the next action.
   *  Matches the "Trusted partner" card style on /recruiters. */
  highlight?: boolean;
};

function Card({ href, title, body, accent = '#1B4D3E', newTab, badge, highlight }: CardProps) {
  const badgeColour = badge?.tone === 'green' ? '#1B4D3E' : '#ff751f';
  return (
    <Link
      href={href}
      target={newTab ? '_blank' : undefined}
      rel={newTab ? 'noopener noreferrer' : undefined}
      className="relative block rounded-2xl p-6 transition-shadow hover:shadow-md"
      style={{
        backgroundColor: '#FFFFFF',
        border: highlight ? '1px dashed #ff751f' : '1.5px solid #EDE8E0',
        boxShadow: highlight ? '0 2px 12px rgba(255, 117, 31, 0.15)' : undefined,
      }}
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
    .select('name, category, tier')
    .eq('user_id', user.id)
    .single();

  if (!profile) return <ProfilePendingSkeleton />;

  const categoryLabel =
    CATEGORIES.find((c) => c.id === profile.category)?.label ?? profile.category;
  const isPaid = profile.tier === 'paid';
  const fullAccess = hasFullAccess(profile.tier);
  const coachAccess = hasCoachAccess(profile.tier);
  const bookHref = `/members/${profile.category}/book`;

  // Assessment status drives both the report card (generation now starts when
  // the eligibility check is submitted — payments shelved) and the next-step
  // card lower down.
  const latestAssessment = await getLatestAssessment(user.id);
  const assessmentSubmitted =
    latestAssessment?.status === 'submitted' &&
    latestAssessment.category === profile.category;

  // Server-render the report status for first paint, then the client component
  // takes over polling for the pending → completed transition. We only read it
  // once the user has full access AND has submitted the check (the trigger for
  // generation). We also pull call_notes here for the coach/call section, which
  // only renders for true paid users (coach hidden while payments are off).
  let reportStatus: ReportStatusResponse | null = null;
  let callNotes: string | null = null;
  if (fullAccess) {
    const { data: report } = await supabase
      .from('paid_reports')
      .select('pdf_path, generation_status, generation_attempts, generation_error, call_notes')
      .eq('user_id', user.id)
      .maybeSingle();
    // Only surface the report card once there's a reason to: the user has done
    // the eligibility check (generation is on its way) or a report row already
    // exists. Otherwise a freshly-registered user would see a "preparing your
    // report" card before they've even started the check.
    if (!report && !assessmentSubmitted) {
      reportStatus = null;
    } else if (!report) {
      reportStatus = { status: 'missing', pdfUrl: null, attempts: 0, canRetry: false, error: null };
    } else {
      const status = (report.generation_status as ReportStatusResponse['status']) ?? 'pending';
      const attempts = (report.generation_attempts as number) ?? 0;
      reportStatus = {
        status,
        // /api/reports/download handles auth + fresh signing on click; safe to
        // hand out even when the PDF object hasn't been uploaded yet.
        pdfUrl: status === 'completed' && report.pdf_path ? '/api/reports/download' : null,
        attempts,
        canRetry: status === 'failed' && attempts < 5,
        error: status === 'failed' ? ((report.generation_error as string | null) ?? null) : null,
      };
      const rawNotes = (report.call_notes as string | null) ?? null;
      callNotes = rawNotes && rawNotes.trim() ? rawNotes.trim() : null;
    }
  }

  // Surface the premium upsell on the dashboard once the user has scored,
  // so the next step is visible without forcing a /score revisit. Compute
  // the band so the copy speaks to their actual situation (rule-based,
  // sub-100ms — no LLM call). Only shows when payments are ON and the user
  // hasn't paid; with payments shelved fullAccess is true so it never renders.
  let upsellBand: Band | null = null;
  if (assessmentSubmitted && !fullAccess && latestAssessment) {
    const rubric = await loadRubric(profile.category);
    if (rubric) {
      try {
        const answers = assessmentDataSchema.parse(latestAssessment.data);
        upsellBand = calculateScore(answers, rubric).band;
      } catch {
        // Schema mismatch (older draft format etc) — just skip the upsell.
      }
    }
  }

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#F8F5F0' }}>
      <SiteNav />

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

          {!isPaid && (
            <div
              className="rounded-xl px-5 py-4 mt-1"
              style={{ backgroundColor: '#EDE8E0', borderLeft: '3px solid #ff751f' }}
            >
              <p className="font-body text-sm leading-relaxed" style={{ color: '#2C2C2C' }}>
                Thank you for registering. You&apos;ve taken the first step toward
                exploring your work-abroad options. We&apos;ll help you understand
                where you stand, what to fix, and which route may make the most
                sense for your background.
              </p>
            </div>
          )}

          {isPaid && (
            <div
              className="rounded-xl px-5 py-4 mt-1"
              style={{ backgroundColor: '#FFF8E8', borderLeft: '3px solid #C9A84C' }}
            >
              <p className="font-body text-sm leading-relaxed" style={{ color: '#2C2C2C' }}>
                Thank you for taking the next step with us. Your premium profile
                helps us give you clearer guidance, better next steps, and a more
                focused work-abroad plan.
              </p>
            </div>
          )}
        </div>

        {/* Premium upsell — only for users who've completed the eligibility
            check and haven't paid yet. Band-aware copy so the pitch speaks
            to their actual situation. */}
        {upsellBand && (
          <div className="mb-10">
            <PremiumUpsell band={upsellBand} />
          </div>
        )}

        {fullAccess && reportStatus && (
          <div className="flex flex-col gap-4 mb-10">
            <ReportStatusCard initial={reportStatus} />

            {coachAccess && (
              <>
            <Link
              href={`/members/${profile.category}/coach`}
              className="relative block rounded-2xl p-5 transition-shadow hover:shadow-md"
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px dashed #ff751f',
                boxShadow: '0 2px 12px rgba(255, 117, 31, 0.15)',
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-px" style={{ backgroundColor: '#ff751f' }} />
                <span
                  className="font-display text-xs font-semibold uppercase tracking-wider"
                  style={{ color: '#ff751f' }}
                >
                  Your coach
                </span>
              </div>
              <span
                className="font-display font-bold uppercase tracking-wide text-sm block"
                style={{ color: '#2C2C2C' }}
              >
                Chat with your {categoryLabel} coach
              </span>
              <span className="font-body text-xs block mt-1" style={{ color: '#6B6B6B' }}>
                Ask anything about your move, and track your next steps. Grounded in your guide and
                your situation.
              </span>
              <span
                className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 rounded-xl font-display font-bold uppercase tracking-wide text-xs"
                style={{ backgroundColor: '#1B4D3E', color: '#F8F5F0' }}
              >
                Open coach →
              </span>
            </Link>

            <Link
              href={bookHref}
              className="block rounded-2xl p-5 transition-shadow hover:shadow-md"
              style={{ backgroundColor: '#FFFFFF', border: '1.5px dashed #C9A84C' }}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-px" style={{ backgroundColor: '#C9A84C' }} />
                <span
                  className="font-display text-xs font-semibold uppercase tracking-wider"
                  style={{ color: '#C9A84C' }}
                >
                  Optional
                </span>
              </div>
              <span
                className="font-display font-bold uppercase tracking-wide text-sm block"
                style={{ color: '#2C2C2C' }}
              >
                Book a 15-min review call
              </span>
              <span className="font-body text-xs block mt-1" style={{ color: '#6B6B6B' }}>
                Want to talk it through? Pick a slot whenever you&apos;re ready — no rush.
              </span>
              <span
                className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 rounded-xl font-display font-bold uppercase tracking-wide text-xs"
                style={{ backgroundColor: '#1B4D3E', color: '#F8F5F0' }}
              >
                Pick a slot →
              </span>
            </Link>

            {callNotes && (
              <section
                className="rounded-2xl p-6 flex flex-col gap-3"
                style={{ backgroundColor: '#FFF8E8', border: '1.5px solid #C9A84C' }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-px" style={{ backgroundColor: '#C9A84C' }} />
                  <span
                    className="font-display text-xs font-semibold uppercase tracking-wider"
                    style={{ color: '#8A6A1F' }}
                  >
                    From your review call
                  </span>
                </div>
                <h2
                  className="font-display font-bold uppercase text-xl"
                  style={{ color: '#2C2C2C' }}
                >
                  Notes from our session
                </h2>
                <div className="font-body text-sm flex flex-col gap-2" style={{ color: '#2C2C2C' }}>
                  {callNotes.split(/\n\s*\n/).map((para, i) => (
                    <p key={i} style={{ whiteSpace: 'pre-wrap' }}>
                      {para}
                    </p>
                  ))}
                </div>
              </section>
            )}
              </>
            )}
          </div>
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
              accent="#ff751f"
              highlight
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
