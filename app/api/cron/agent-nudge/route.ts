import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual } from 'node:crypto';
import { createSupabaseServiceClient } from '@/lib/supabase/service';
import { sendNudgeEmail } from '@/lib/notifications/agent-nudge-email';
import { milestoneLabel } from '@/lib/agent/milestones';
import { CATEGORIES } from '@/lib/categories';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 300;

const BATCH = 50;

function authorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const header = req.headers.get('authorization') ?? '';
  const expected = `Bearer ${secret}`;
  const a = Buffer.from(header);
  const b = Buffer.from(expected);
  // timingSafeEqual throws on length mismatch — guard first.
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

interface Candidate {
  user_id: string;
  name: string | null;
  category: string;
  unsub_token: string;
  incomplete_count: number;
  next_milestone_key: string | null;
  last_topic: string | null;
}

// Vercel Cron issues a GET. Templates each nudge from stored journey state — no
// LLM calls. agent_last_nudge_at is set only after a confirmed Brevo send.
export async function GET(req: NextRequest) {
  if (!authorized(req)) return new NextResponse('unauthorized', { status: 401 });

  const svc = createSupabaseServiceClient();
  const { data, error } = await svc.rpc('claim_nudge_candidates', { p_limit: BATCH });
  if (error) {
    console.error('[cron/agent-nudge] claim failed', error);
    return NextResponse.json({ error: 'claim_failed' }, { status: 500 });
  }

  const candidates = (data ?? []) as Candidate[];
  let sent = 0;

  for (const c of candidates) {
    const { data: authUser } = await svc.auth.admin.getUserById(c.user_id);
    const email = authUser?.user?.email ?? '';
    if (!email) continue;

    const categoryLabel = CATEGORIES.find((x) => x.id === c.category)?.label ?? c.category;
    const ok = await sendNudgeEmail({
      userEmail: email,
      userName: c.name || 'there',
      categoryLabel,
      categorySlug: c.category,
      lastTopic: c.last_topic ?? null,
      nextMilestoneLabel: milestoneLabel(c.category, c.next_milestone_key),
      unsubToken: c.unsub_token,
    });

    if (ok) {
      await svc
        .from('profiles')
        .update({ agent_last_nudge_at: new Date().toISOString() })
        .eq('user_id', c.user_id);
      sent++;
    }
  }

  return NextResponse.json({ processed: candidates.length, sent });
}
