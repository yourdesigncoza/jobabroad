import type { Metadata } from 'next';
import { requireAdmin } from '@/lib/auth-guards';
import { getFunnelMetrics } from '@/lib/admin/funnel-metrics';
import StatCard from '@/components/admin/StatCard';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Admin · Funnel & metrics',
  robots: { index: false, follow: false },
};

const GREEN = '#1B4D3E';
const CHARCOAL = '#2C2C2C';
const MUTED = '#6B6B6B';
const OFFWHITE = '#EDE8E0';

export default async function AdminFunnelPage() {
  await requireAdmin('/admin/funnel');
  const m = await getFunnelMetrics();

  const generated = new Date(m.generatedAt).toLocaleString('en-ZA', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#F8F5F0' }}>
      <div className="max-w-5xl mx-auto px-6 py-10 flex flex-col gap-10">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-px" style={{ backgroundColor: GREEN }} />
            <span
              className="font-display text-xs font-semibold uppercase tracking-wider"
              style={{ color: GREEN }}
            >
              Admin
            </span>
          </div>
          <h1
            className="font-display font-bold uppercase tracking-wide text-3xl"
            style={{ color: CHARCOAL }}
          >
            Funnel &amp; metrics
          </h1>
          <p className="font-body text-sm" style={{ color: MUTED }}>
            The whole pipeline at a glance — signup → confirm → assess → submit →
            book → pay — plus which categories are actually pulling demand. Live
            snapshot taken {generated}.
          </p>
        </div>

        {/* This week — momentum read */}
        <section className="flex flex-col gap-4">
          <SectionLabel>This week — last 7 days</SectionLabel>
          <div className="grid grid-cols-3 gap-4">
            <StatCard label="New signups" value={m.recent7d.signups} hint="registered in last 7d" />
            <StatCard
              label="New submissions"
              value={m.recent7d.submissions}
              hint="assessments submitted"
            />
            <StatCard label="New paid" value={m.recent7d.paid} hint="payments in last 7d" />
          </div>
        </section>

        {/* Conversion funnel */}
        <section className="flex flex-col gap-4">
          <SectionLabel>Conversion funnel</SectionLabel>
          <div
            className="rounded-2xl p-6 flex flex-col gap-4"
            style={{ backgroundColor: '#FFFFFF', border: `1.5px solid ${OFFWHITE}` }}
          >
            {m.funnel.map((s) => (
              <div key={s.key} className="flex flex-col gap-1.5">
                <div className="flex items-baseline justify-between gap-3">
                  <span
                    className="font-display text-sm font-semibold uppercase tracking-wide"
                    style={{ color: CHARCOAL }}
                  >
                    {s.label}
                  </span>
                  <span className="font-body text-sm" style={{ color: MUTED }}>
                    <strong style={{ color: GREEN }}>{s.count}</strong>
                    {' · '}
                    {s.pctOfRegistered}% of registered
                    {s.pctOfPrev != null ? ` · ${s.pctOfPrev}% from prev` : ''}
                  </span>
                </div>
                <div
                  className="h-3 rounded-full overflow-hidden"
                  style={{ backgroundColor: OFFWHITE }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${s.pctOfRegistered}%`, backgroundColor: GREEN }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Raw numbers snapshot */}
        <section className="flex flex-col gap-4">
          <SectionLabel>The numbers</SectionLabel>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              label="Registered users"
              value={m.users.total}
              hint={`${m.users.confirmed} confirmed · ${m.users.unconfirmed} pending`}
            />
            <StatCard
              label="Tier"
              value={`${m.tier.free} / ${m.tier.paid}`}
              hint={`free / paid${m.tier.other ? ` · ${m.tier.other} other` : ''}`}
            />
            <StatCard
              label="Assessments"
              value={m.assessments.total}
              hint={`${m.assessments.submitted} submitted · ${m.assessments.draft} draft`}
            />
            <StatCard
              label="Submitted (unique)"
              value={m.assessments.submittedUsers}
              hint={`${m.assessments.startedUsers} started one`}
            />
            <StatCard label="Bookings" value={m.bookings} />
            <StatCard
              label="Paid reports"
              value={m.reports.rows}
              hint={`${m.reports.withPdf} with PDF · ${m.reports.failed} failed`}
            />
            <StatCard label="Storage objects" value={m.storageObjects} hint="paid-reports bucket" />
            <StatCard
              label="Paid users"
              value={m.tier.paid}
              hint={`${pctStr(m.tier.paid, m.users.total)} of registered`}
            />
          </div>
        </section>

        {/* AI coach activity */}
        <section className="flex flex-col gap-4">
          <SectionLabel>AI coach activity</SectionLabel>
          <div className="grid grid-cols-3 gap-4">
            <StatCard
              label="Used the coach"
              value={m.coach.usersChatted}
              hint={`${pctStr(m.coach.usersChatted, m.users.total)} of registered`}
            />
            <StatCard label="Questions asked" value={m.coach.userTurns} hint="user turns total" />
            <StatCard
              label="Nudge opt-ins"
              value={m.coach.nudgeOptIns}
              hint="consented to follow-up email"
            />
          </div>
        </section>

        {/* Traffic — lives in Vercel; deep-link out rather than double-count */}
        <section className="flex flex-col gap-4">
          <SectionLabel>Traffic</SectionLabel>
          <div
            className="rounded-2xl p-6 flex flex-col gap-4"
            style={{ backgroundColor: '#FFFFFF', border: `1.5px solid ${OFFWHITE}` }}
          >
            <p className="font-body text-sm" style={{ color: MUTED }}>
              Pageviews, top pages, referrers and per-source breakdowns live in
              Vercel Analytics. Filter by the <code>src</code> query parameter in the
              dashboard to see traffic per QR / campaign (the <code>?src=</code> UTMs).
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="https://vercel.com/yourdesigncozas-projects/jobroad/analytics"
                target="_blank"
                rel="noopener noreferrer"
                className="font-display text-xs font-semibold uppercase tracking-wider rounded-full px-5 py-2.5"
                style={{ backgroundColor: GREEN, color: '#F8F5F0' }}
              >
                Web Analytics ↗
              </a>
              <a
                href="https://vercel.com/yourdesigncozas-projects/jobroad/speed-insights"
                target="_blank"
                rel="noopener noreferrer"
                className="font-display text-xs font-semibold uppercase tracking-wider rounded-full px-5 py-2.5"
                style={{ border: `1.5px solid ${GREEN}`, color: GREEN }}
              >
                Speed Insights ↗
              </a>
            </div>
          </div>
        </section>

        {/* Signups by category */}
        <section className="flex flex-col gap-4">
          <SectionLabel>Signups by category — the market has voted</SectionLabel>
          <div
            className="rounded-2xl p-6 flex flex-col gap-3"
            style={{ backgroundColor: '#FFFFFF', border: `1.5px solid ${OFFWHITE}` }}
          >
            {m.byCategory.length === 0 ? (
              <p className="font-body text-sm" style={{ color: MUTED }}>
                No signups yet.
              </p>
            ) : (
              m.byCategory.map((c, i) => (
                <div key={c.id} className="flex items-center gap-3">
                  <span
                    className="font-body text-sm w-36 shrink-0 truncate"
                    style={{ color: i === 0 ? GREEN : CHARCOAL, fontWeight: i === 0 ? 700 : 400 }}
                    title={c.label}
                  >
                    {c.label}
                  </span>
                  <div
                    className="h-4 rounded-full overflow-hidden flex-1"
                    style={{ backgroundColor: OFFWHITE }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${c.share}%`,
                        backgroundColor: i === 0 ? GREEN : '#C9A84C',
                      }}
                    />
                  </div>
                  <span
                    className="font-body text-sm w-24 shrink-0 text-right"
                    style={{ color: MUTED }}
                  >
                    <strong style={{ color: CHARCOAL }}>{c.count}</strong> · {c.share}%
                  </span>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="font-display text-sm font-semibold uppercase tracking-wider"
      style={{ color: CHARCOAL }}
    >
      {children}
    </h2>
  );
}

function pctStr(n: number, d: number): string {
  if (d <= 0) return '0%';
  return `${Math.round((n / d) * 1000) / 10}%`;
}
