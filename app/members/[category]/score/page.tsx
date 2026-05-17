import { notFound, redirect } from 'next/navigation';
import { CATEGORIES } from '@/lib/categories';
import { requireProfile } from '@/lib/auth-guards';
import { loadRubric, calculateScore } from '@/lib/scoring';
import { getLatestAssessment } from '@/lib/assessments/assessment-client';
import { assessmentDataSchema } from '@/lib/assessments/schemas/assessment';
import { generateScoreTeasers } from '@/lib/scoring/teasers';
import { createSupabaseServerClient } from '@/lib/supabase/server';
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
  const { strength, blocker } = await generateScoreTeasers(score, category);

  const categoryLabel = CATEGORIES.find((c) => c.id === category)?.label ?? category;

  return (
    <ScoreResult
      categoryLabel={categoryLabel}
      band={score.band}
      strength={strength}
      blocker={blocker}
      isPaid={isPaid}
    />
  );
}
