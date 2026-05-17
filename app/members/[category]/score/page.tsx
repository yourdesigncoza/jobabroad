import { notFound, redirect } from 'next/navigation';
import { waitUntil } from '@vercel/functions';
import { CATEGORIES } from '@/lib/categories';
import { requireProfile } from '@/lib/auth-guards';
import { loadRubric, calculateScore } from '@/lib/scoring';
import { generateWhatsWorking, generateWhatsBlocking } from '@/lib/scoring/narratives';
import { getLatestAssessment } from '@/lib/assessments/assessment-client';
import { assessmentDataSchema } from '@/lib/assessments/schemas/assessment';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { sendScoreEmailOnce } from '@/lib/notifications/score-email';
import ScoreResult from '@/components/ScoreResult';

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
    // Teaching-only pilot: site is private; no public path can reach a rubricless category.
    redirect('/dashboard');
  }

  const assessment = await getLatestAssessment(user.id);
  if (!assessment || assessment.status !== 'submitted' || assessment.category !== category) {
    redirect(`/members/${category}/assessment`);
  }

  const ssr = await createSupabaseServerClient();
  const { data: tierRow } = await ssr
    .from('profiles')
    .select('tier')
    .eq('user_id', user.id)
    .single();
  const isPaid = tierRow?.tier === 'paid';

  const parsedAnswers = assessmentDataSchema.parse(assessment.data);
  const score = calculateScore(parsedAnswers, rubric);

  // Generate the same narratives the PDF uses — page and PDF should read as
  // one product. Parallel for latency.
  const [whatsWorking, whatsBlocking] = await Promise.all([
    generateWhatsWorking(score, category),
    generateWhatsBlocking(score, category),
  ]);

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

  return (
    <ScoreResult
      categoryLabel={categoryLabel}
      overall={score.overall}
      band={score.band}
      dimensions={score.dimensions}
      whatsWorking={whatsWorking}
      whatsBlocking={whatsBlocking}
      isPaid={isPaid}
      // We say "we've emailed you a copy" on first load. After that, the row
      // has score_email_sent_at set; user might revisit but already has it.
      emailedCopy
    />
  );
}
