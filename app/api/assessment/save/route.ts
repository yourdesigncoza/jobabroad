import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { assessmentDataSchema } from '@/lib/assessments/schemas/assessment';
import { saveAssessmentStep, getLatestAssessment } from '@/lib/assessments/assessment-client';
import { SCHEMA_VERSION } from '@/lib/assessments/types';
import { hasAssessment } from '@/lib/assessments/steps';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { token, stepSlug, stepData } = body;

  if (!token || !stepSlug || !stepData) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const { data: tokenRow } = await supabase
    .from('member_tokens')
    .select('id, interest_category')
    .eq('token', token)
    .single();

  if (!tokenRow) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

  if (!hasAssessment(tokenRow.interest_category)) {
    return NextResponse.json({ error: 'Assessment not available for this category' }, { status: 400 });
  }

  const parsed = assessmentDataSchema.safeParse(stepData);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid data', details: parsed.error.flatten() }, { status: 422 });
  }

  const existing = await getLatestAssessment(tokenRow.id);
  const shouldCreateNew = !existing || existing.status === 'submitted';

  const assessmentId = await saveAssessmentStep({
    assessmentId: shouldCreateNew ? null : existing?.id ?? null,
    memberTokenId: tokenRow.id,
    category: tokenRow.interest_category,
    schemaVersion: SCHEMA_VERSION,
    stepSlug,
    stepData: parsed.data,
    existingData: shouldCreateNew ? {} : (existing?.data ?? {}),
    existingSlugs: shouldCreateNew ? [] : (existing?.completed_step_slugs ?? []),
  });

  return NextResponse.json({ ok: true, assessmentId });
}
