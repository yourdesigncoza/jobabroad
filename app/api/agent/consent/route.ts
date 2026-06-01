import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createSupabaseServiceClient } from '@/lib/supabase/service';
import { hasCoachAccess } from '@/lib/access';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Records POPIA consent for proactive nudge emails + mints the unsubscribe token.
export async function POST() {
  const ssr = await createSupabaseServerClient();
  const {
    data: { user },
  } = await ssr.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const svc = createSupabaseServiceClient();
  const { data: profile } = await svc
    .from('profiles')
    .select('tier, agent_nudge_unsub_token')
    .eq('user_id', user.id)
    .single();
  if (!profile) return NextResponse.json({ error: 'no_profile' }, { status: 401 });
  if (!hasCoachAccess(profile.tier))
    return NextResponse.json({ error: 'no_access' }, { status: 403 });

  const { error } = await svc
    .from('profiles')
    .update({
      agent_nudge_consent: true,
      agent_nudge_consented_at: new Date().toISOString(),
      agent_nudge_unsubscribed_at: null,
      agent_nudge_unsub_token: profile.agent_nudge_unsub_token ?? randomUUID(),
    })
    .eq('user_id', user.id);
  if (error) {
    console.error('[agent/consent] update failed', error);
    return NextResponse.json({ error: 'db_error' }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
