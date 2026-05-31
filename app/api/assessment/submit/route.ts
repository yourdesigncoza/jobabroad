import { NextResponse } from 'next/server';
import { waitUntil } from '@vercel/functions';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { submitAssessment, getLatestAssessment } from '@/lib/assessments/assessment-client';
import { PAYMENTS_ENABLED } from '@/lib/access';
import { generateAndEmail } from '@/lib/reports/generate-and-email';

export const runtime = 'nodejs';
export const maxDuration = 300;

export async function POST() {
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

  // Payments shelved: completing the eligibility check is now what unlocks the
  // full report (when payments are on, the Paystack webhook does this instead).
  // The draft→submitted transition above only happens once per submission, so
  // this fires at most once per check. Runs in the background; the dashboard
  // polls /api/reports/status and the user is emailed a copy on completion.
  if (!PAYMENTS_ENABLED) {
    waitUntil(generateAndEmail(user.id));
  }

  return NextResponse.json({ ok: true });
}
