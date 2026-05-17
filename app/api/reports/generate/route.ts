import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { generateReport } from '@/lib/reports/generator';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST() {
  const ssr = await createSupabaseServerClient();
  const {
    data: { user },
  } = await ssr.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const { data: profile } = await ssr
    .from('profiles')
    .select('tier')
    .eq('user_id', user.id)
    .single();
  if (profile?.tier !== 'paid') {
    return NextResponse.json({ error: 'paid_only' }, { status: 403 });
  }

  try {
    const { signedUrl } = await generateReport(user.id);
    return NextResponse.json({ url: signedUrl });
  } catch (err) {
    console.error('[reports/generate]', err);
    return NextResponse.json({ error: 'generation_failed' }, { status: 500 });
  }
}
