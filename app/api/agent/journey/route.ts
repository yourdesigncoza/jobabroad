import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createSupabaseServiceClient } from '@/lib/supabase/service';
import { updateJourney } from '@/lib/agent/journey';
import { isWindowOpen } from '@/lib/agent/access';
import { milestonesForCategory, type MilestoneStatus } from '@/lib/agent/milestones';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const STATUSES: MilestoneStatus[] = ['not_started', 'in_progress', 'done'];

// Manual milestone set/correct from the JourneyTracker. Unlike LLM updates these
// may regress and may set "done" (the user is the authority on their own docs).
export async function POST(req: NextRequest) {
  const ssr = await createSupabaseServerClient();
  const {
    data: { user },
  } = await ssr.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  let body: { key?: unknown; status?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'bad_json' }, { status: 400 });
  }
  const key = typeof body.key === 'string' ? body.key : '';
  const status = body.status as MilestoneStatus;
  if (!key || !STATUSES.includes(status))
    return NextResponse.json({ error: 'invalid_update' }, { status: 400 });

  const svc = createSupabaseServiceClient();
  const { data: profile } = await svc
    .from('profiles')
    .select('category, tier, agent_access_expires_at')
    .eq('user_id', user.id)
    .single();
  if (profile?.tier !== 'paid')
    return NextResponse.json({ error: 'paid_only' }, { status: 403 });
  if (!isWindowOpen(profile.agent_access_expires_at as string | null))
    return NextResponse.json({ error: 'on_hold' }, { status: 403 });

  const category = profile.category as string;
  const validKeys = new Set((milestonesForCategory(category) ?? []).map((d) => d.key));
  if (!validKeys.has(key))
    return NextResponse.json({ error: 'unknown_milestone' }, { status: 400 });

  const journey = await updateJourney(user.id, category, [{ key, status }], 'manual');
  return NextResponse.json({ journey });
}
