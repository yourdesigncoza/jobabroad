import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';
import AgentChat from '@/components/AgentChat';
import { CATEGORIES } from '@/lib/categories';
import { requireProfile } from '@/lib/auth-guards';
import { PAYMENTS_ENABLED } from '@/lib/access';
import { createSupabaseServiceClient } from '@/lib/supabase/service';
import { getJourneyForDisplay } from '@/lib/agent/journey';
import { extractCitedIndexes } from '@/lib/rag/prompt';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Your assistant — Jobabroad',
  description: 'Your always-on personal work-abroad assistant.',
  alternates: { canonical: '/dashboard' },
  robots: { index: false, follow: false },
};

export default async function CoachPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  if (!CATEGORIES.some((c) => c.id === category)) notFound();

  const { user, profile } = await requireProfile(`/members/${category}/coach`);
  if (!profile) redirect('/dashboard');
  if (profile.category !== category) redirect(`/members/${profile.category}/coach`);

  const categoryLabel = CATEGORIES.find((c) => c.id === category)?.label ?? category;

  const svc = createSupabaseServiceClient();
  const { data: agentProfile } = await svc
    .from('profiles')
    .select('tier, agent_nudge_consent')
    .eq('user_id', user.id)
    .single();

  if (agentProfile?.tier !== 'paid') {
    // Coach is hidden while payments are shelved and nothing is for sale, so
    // route direct visitors back to their dashboard instead of an upsell that
    // can't be acted on. (When payments are on, fall through to the pitch.)
    if (!PAYMENTS_ENABLED) redirect('/dashboard');
    return (
      <main className="min-h-screen" style={{ backgroundColor: '#F8F5F0' }}>
        <SiteNav />
        <section className="max-w-md mx-auto px-6 py-20 flex flex-col gap-5">
          <h1
            className="font-display font-bold uppercase tracking-wide text-2xl"
            style={{ color: '#2C2C2C' }}
          >
            Your private assistant is a premium feature
          </h1>
          <p className="font-body" style={{ color: '#2C2C2C' }}>
            Unlock your personal {categoryLabel} Abroad assistant, your journey tracker, and a personalised
            report when you upgrade.
          </p>
          <Link
            href={`/members/${category}/score#premium`}
            className="inline-flex items-center justify-center font-display uppercase tracking-wider text-sm font-semibold px-6 py-3 rounded-md self-start"
            style={{ backgroundColor: '#1B4D3E', color: '#F8F5F0' }}
          >
            See premium →
          </Link>
        </section>
        <SiteFooter />
      </main>
    );
  }

  // Read-only render — no DB writes here. The journey seed + window roll are
  // persisted by AgentChat's /api/agent/touch on mount.
  const [journey, msgsRes] = await Promise.all([
    getJourneyForDisplay(user.id, category),
    svc
      .from('agent_messages')
      .select('id, role, content')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
      .limit(200),
  ]);

  const initialMessages = (msgsRes.data ?? []).map((r) => ({
    id: r.id as string,
    role: r.role as 'user' | 'assistant',
    content: r.content as string,
    citations: r.role === 'assistant' ? extractCitedIndexes(r.content as string) : [],
  }));

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#F8F5F0' }}>
      <SiteNav />
      <section className="max-w-5xl mx-auto px-6 pt-12 pb-16">
        <div className="flex flex-col gap-3 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-px" style={{ backgroundColor: '#ff751f' }} />
            <span
              className="font-display text-[0.65rem] md:text-xs font-semibold uppercase tracking-[0.08em] md:tracking-[0.2em]"
              style={{ color: '#ff751f' }}
            >
              Your private assistant
            </span>
          </div>
          <h1
            className="font-display font-bold uppercase leading-tight"
            style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', color: '#2C2C2C' }}
          >
            Your {categoryLabel} assistant
          </h1>
          <p className="font-body text-sm" style={{ color: '#6B6B6B' }}>
            Grounded in your guide and your situation. Ask about visas, registration, documents,
            costs, and timelines — and track your next steps on the right.
          </p>
        </div>

        <AgentChat
          categoryLabel={categoryLabel}
          initialMessages={initialMessages}
          initialJourney={journey}
          consentGiven={agentProfile.agent_nudge_consent === true}
        />

        <div className="mt-8">
          <Link
            href="/dashboard"
            className="font-display uppercase tracking-wider text-xs font-semibold underline-offset-4 hover:underline"
            style={{ color: '#1B4D3E' }}
          >
            ← Back to dashboard
          </Link>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
