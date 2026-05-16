import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { submitAssessment, getLatestAssessment } from '@/lib/assessments/assessment-client';

export async function POST(_req: NextRequest) {
  const ssr = await createSupabaseServerClient();
  const { data: { user } } = await ssr.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const assessment = await getLatestAssessment(user.id);
  if (!assessment || assessment.status === 'submitted') {
    return NextResponse.json({ error: 'No draft assessment found' }, { status: 404 });
  }

  await submitAssessment(assessment.id);
  return NextResponse.json({ ok: true });
}
