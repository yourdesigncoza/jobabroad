import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createSignedUrl, getCachedReportPath } from '@/lib/reports/generator';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function GET() {
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
    // The PDF is generated post-call by the admin action — never on demand
    // from this endpoint. If no cached report exists yet, the buyer hasn't
    // had their call (or it hasn't been written up); tell them to wait.
    const cached = await getCachedReportPath(user.id);
    if (!cached) {
      return NextResponse.json({ error: 'report_not_ready' }, { status: 404 });
    }
    const signedUrl = await createSignedUrl(cached);
    return NextResponse.redirect(signedUrl, { status: 302 });
  } catch (err) {
    console.error('[reports/download]', err);
    return NextResponse.json({ error: 'download_failed' }, { status: 500 });
  }
}
