import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { submitAssessment, getLatestAssessment } from '@/lib/assessments/assessment-client';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const { token } = await req.json();
  if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 400 });

  const { data: tokenRow } = await supabase
    .from('member_tokens')
    .select('id')
    .eq('token', token)
    .single();

  if (!tokenRow) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

  const assessment = await getLatestAssessment(tokenRow.id);
  if (!assessment || assessment.status === 'submitted') {
    return NextResponse.json({ error: 'No draft assessment found' }, { status: 404 });
  }

  await submitAssessment(assessment.id);
  return NextResponse.json({ ok: true });
}
