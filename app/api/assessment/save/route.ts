import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { assessmentDataSchema } from '@/lib/assessments/schemas/assessment';
import { saveAssessmentStep, getLatestAssessment } from '@/lib/assessments/assessment-client';
import { SCHEMA_VERSION } from '@/lib/assessments/types';
import { hasAssessment } from '@/lib/assessments/steps';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { stepSlug, stepData } = body;

  if (!stepSlug || !stepData) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const ssr = await createSupabaseServerClient();
  const { data: { user } } = await ssr.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: profile } = await ssr
    .from('profiles')
    .select('category')
    .eq('user_id', user.id)
    .single();
  if (!profile) {
    return NextResponse.json({ error: 'No profile' }, { status: 401 });
  }

  if (!hasAssessment(profile.category)) {
    return NextResponse.json({ error: 'Assessment not available for this category' }, { status: 400 });
  }

  const parsed = assessmentDataSchema.safeParse(stepData);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid data', details: parsed.error.flatten() }, { status: 422 });
  }

  const existing = await getLatestAssessment(user.id);
  const shouldCreateNew = !existing || existing.status === 'submitted';

  const assessmentId = await saveAssessmentStep({
    assessmentId: shouldCreateNew ? null : existing?.id ?? null,
    userId: user.id,
    category: profile.category,
    schemaVersion: SCHEMA_VERSION,
    stepSlug,
    stepData: parsed.data,
    existingData: shouldCreateNew ? {} : (existing?.data ?? {}),
    existingSlugs: shouldCreateNew ? [] : (existing?.completed_step_slugs ?? []),
  });

  return NextResponse.json({ ok: true, assessmentId });
}
