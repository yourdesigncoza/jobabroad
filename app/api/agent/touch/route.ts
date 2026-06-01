import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createSupabaseServiceClient } from '@/lib/supabase/service';
import { rollWindow } from '@/lib/agent/access';
import { getJourney } from '@/lib/agent/journey';
import { hasCoachAccess } from '@/lib/access';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Rolls the rolling-90-day window when the user actively opens the coach. Called
// by the client on mount — NOT during server render (write-on-render double-fires
// under RSC). This is what "reactivates" a lapsed or NULL window.
export async function POST() {
  const ssr = await createSupabaseServerClient();
  const {
    data: { user },
  } = await ssr.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const svc = createSupabaseServiceClient();
  const { data: profile } = await svc
    .from('profiles')
    .select('tier, category')
    .eq('user_id', user.id)
    .single();
  if (!profile) return NextResponse.json({ error: 'no_profile' }, { status: 401 });
  if (!hasCoachAccess(profile.tier))
    return NextResponse.json({ error: 'no_access' }, { status: 403 });

  // Roll the window and persist the journey seed (idempotent) now that the user
  // is actively here — keeps both writes out of server render.
  await Promise.all([rollWindow(svc, user.id), getJourney(user.id, profile.category as string)]);
  return NextResponse.json({ ok: true });
}
