import { notFound, redirect } from 'next/navigation';
import { waitUntil } from '@vercel/functions';
import { CATEGORIES } from '@/lib/categories';
import { requireProfile } from '@/lib/auth-guards';
import { loadRubric, calculateScore } from '@/lib/scoring';
import { getOrGenerateNarratives } from '@/lib/scoring/narratives';
import { getLatestAssessment } from '@/lib/assessments/assessment-client';
import { assessmentDataSchema } from '@/lib/assessments/schemas/assessment';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { hasFullAccess, hasCoachAccess } from '@/lib/access';
import { sendScoreEmailOnce } from '@/lib/notifications/score-email';
import { seedFollowupOnScoreView } from '@/lib/agent/followup';
import ScoreResult from '@/components/ScoreResult';
import ScoreNudgeConsent from '@/components/ScoreNudgeConsent';
import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';

export default async function ScorePage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;

  if (!CATEGORIES.some((c) => c.id === category)) notFound();

  const { user, profile } = await requireProfile(`/members/${category}/score`);
  if (!profile) redirect('/dashboard');
  if (profile.category !== category) redirect(`/members/${profile.category}/score`);

  const rubric = await loadRubric(category);
  if (!rubric) {
    // All categories have a rubric except accounting (which has no assessment
    // yet). Send anyone who reaches a rubricless category back to the dashboard.
    redirect('/dashboard');
  }

  const assessment = await getLatestAssessment(user.id);
  if (!assessment || assessment.status !== 'submitted' || assessment.category !== category) {
    redirect(`/members/${category}/assessment`);
  }

  const ssr = await createSupabaseServerClient();
  const { data: tierRow } = await ssr
    .from('profiles')
    .select('tier, agent_nudge_consent')
    .eq('user_id', user.id)
    .single();
  const isPaid = hasFullAccess(tierRow?.tier);
  // Follow-up nudge opt-in is only offered where the coach is reachable (free
  // while the gate is off, paid otherwise) — the consent route gates the same way.
  const canOptInToNudges = hasCoachAccess(tierRow?.tier);
  const alreadyConsented = tierRow?.agent_nudge_consent === true;

  const parsedAnswers = assessmentDataSchema.parse(assessment.data);
  const score = calculateScore(parsedAnswers, rubric);

  // Cached on the assessment row — first /score load runs the two LLM calls
  // in parallel, every subsequent visit is a ~10ms DB read. The cache is
  // invalidated when the user resubmits the assessment (wizard nulls the
  // column on new submission).
  const { whatsWorking, whatsBlocking } = await getOrGenerateNarratives(
    assessment.id,
    score,
    category,
  );

  const categoryLabel = CATEGORIES.find((c) => c.id === category)?.label ?? category;

  // Score-email: send on FIRST /score load (not on assessment submission).
  // The sender claims the timestamp atomically before sending so double-loads
  // can't double-send. Fire-and-forget via waitUntil — the page must not
  // block on Brevo.
  const { data: emailRow } = await ssr
    .from('assessments')
    .select('score_email_sent_at')
    .eq('id', assessment.id)
    .single();
  const alreadyEmailed = Boolean(emailRow?.score_email_sent_at);
  if (!alreadyEmailed) {
    waitUntil(
      sendScoreEmailOnce({
        userId: user.id,
        assessmentId: assessment.id,
        categoryId: category,
        categoryLabel,
        overall: score.overall,
        band: score.band,
        dimensions: score.dimensions,
        whatsWorking,
        whatsBlocking,
      }),
    );
  }

  // Bring this completer into the proactive-nudge funnel: persist their journey
  // and start the 7-day idle clock. Idempotent + fire-and-forget (must not block
  // render on the write). Only meaningful when nudges are reachable for them.
  if (canOptInToNudges) {
    waitUntil(seedFollowupOnScoreView(user.id, category));
  }

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#F8F5F0' }}>
      <SiteNav />
      <ScoreResult
        categoryLabel={categoryLabel}
        overall={score.overall}
        band={score.band}
        dimensions={score.dimensions}
        appliedCaps={score.applied_caps ?? []}
        whatsWorking={whatsWorking}
        whatsBlocking={whatsBlocking}
        isPaid={isPaid}
        // We say "we've emailed you a copy" on first load. After that, the row
        // has score_email_sent_at set; user might revisit but already has it.
        emailedCopy
      />
      {canOptInToNudges && <ScoreNudgeConsent initialConsent={alreadyConsented} />}
      <SiteFooter />
    </main>
  );
}
