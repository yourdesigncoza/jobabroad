import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createSupabaseServiceClient } from '@/lib/supabase/service';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

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

  // bookings RLS allows service-role full access; user can read their own.
  // We use service-role here since the INSERT policy is service-role-only.
  const svc = createSupabaseServiceClient();
  const { error } = await svc.from('bookings').insert({
    user_id: user.id,
    consented_at: new Date().toISOString(),
  });
  if (error) {
    console.error('[booking/consent] insert failed', error);
    return NextResponse.json({ error: 'insert_failed' }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
