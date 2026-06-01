import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createSupabaseServiceClient } from '@/lib/supabase/service';
import { getJourney } from '@/lib/agent/journey';
import { extractCitedIndexes } from '@/lib/rag/prompt';
import { hasCoachAccess } from '@/lib/access';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const MAX_MESSAGES = 200;

export async function GET() {
  const ssr = await createSupabaseServerClient();
  const {
    data: { user },
  } = await ssr.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const svc = createSupabaseServiceClient();
  const { data: profile } = await svc
    .from('profiles')
    .select('category, tier')
    .eq('user_id', user.id)
    .single();
  if (!profile) return NextResponse.json({ error: 'no_profile' }, { status: 401 });
  if (!hasCoachAccess(profile.tier))
    return NextResponse.json({ error: 'no_access' }, { status: 403 });

  const category = profile.category as string;
  const [{ data: rows }, journey] = await Promise.all([
    svc
      .from('agent_messages')
      .select('id, role, content, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
      .limit(MAX_MESSAGES),
    getJourney(user.id, category),
  ]);

  const messages = (rows ?? []).map((r) => ({
    id: r.id,
    role: r.role,
    content: r.content,
    citations: r.role === 'assistant' ? extractCitedIndexes(r.content as string) : [],
    createdAt: r.created_at,
  }));

  return NextResponse.json({ messages, journey });
}
