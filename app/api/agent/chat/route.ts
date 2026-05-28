import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createSupabaseServiceClient } from '@/lib/supabase/service';
import { searchCorpus } from '@/lib/rag/corpus';
import { extractCitedIndexes } from '@/lib/rag/prompt';
import {
  buildCoachPrompt,
  buildAssessmentSummary,
  type ChatMessage,
} from '@/lib/agent/prompt';
import { getJourney, updateJourney } from '@/lib/agent/journey';
import { rollWindow, isWindowOpen } from '@/lib/agent/access';
import type { MilestoneUpdate, MilestoneStatus } from '@/lib/agent/milestones';
import { assessmentDataSchema, type AssessmentData } from '@/lib/assessments/schemas/assessment';
import { CATEGORIES } from '@/lib/categories';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
const MODEL = 'gpt-4o-mini';
const DAILY_CAP = 30;
const MAX_MESSAGE_CHARS = 2000;
const HISTORY_TURNS = 12;
const STATUSES: MilestoneStatus[] = ['not_started', 'in_progress', 'done'];

interface ParsedAnswer {
  answer: string;
  refused: boolean;
  topic: string;
  milestone_updates: MilestoneUpdate[];
}

function parseModelOutput(raw: string): ParsedAnswer | null {
  let obj: Record<string, unknown>;
  try {
    obj = JSON.parse(raw);
  } catch {
    return null;
  }
  const answer = typeof obj.answer === 'string' ? obj.answer.trim() : '';
  if (!answer) return null;
  const refused = obj.refused === true;
  const topic = typeof obj.topic === 'string' ? obj.topic.trim().slice(0, 120) : '';
  const updates: MilestoneUpdate[] = Array.isArray(obj.milestone_updates)
    ? obj.milestone_updates
        .filter(
          (u): u is MilestoneUpdate =>
            !!u &&
            typeof (u as MilestoneUpdate).key === 'string' &&
            STATUSES.includes((u as MilestoneUpdate).status),
        )
        .slice(0, 8)
    : [];
  return { answer, refused, topic, milestone_updates: updates };
}

export async function POST(req: NextRequest) {
  const ssr = await createSupabaseServerClient();
  const {
    data: { user },
  } = await ssr.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  let body: { query?: unknown; requestId?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'bad_json' }, { status: 400 });
  }
  const query = typeof body.query === 'string' ? body.query.trim() : '';
  const requestId = typeof body.requestId === 'string' ? body.requestId.trim() : '';
  if (!query) return NextResponse.json({ error: 'query_required' }, { status: 400 });
  if (query.length > MAX_MESSAGE_CHARS)
    return NextResponse.json({ error: 'message_too_long' }, { status: 400 });
  if (!requestId) return NextResponse.json({ error: 'request_id_required' }, { status: 400 });

  const svc = createSupabaseServiceClient();

  const { data: profile } = await svc
    .from('profiles')
    .select('name, category, tier, agent_access_expires_at')
    .eq('user_id', user.id)
    .single();
  if (!profile) return NextResponse.json({ error: 'no_profile' }, { status: 401 });
  if (profile.tier !== 'paid') return NextResponse.json({ error: 'paid_only' }, { status: 403 });
  if (!isWindowOpen(profile.agent_access_expires_at as string | null))
    return NextResponse.json({ error: 'on_hold' }, { status: 403 });

  const category = profile.category as string;

  // 1. Idempotent replay — same requestId already answered? Return it; no
  //    increment, no second OpenAI call.
  const { data: prior } = await svc
    .from('agent_messages')
    .select('content')
    .eq('user_id', user.id)
    .eq('request_id', requestId)
    .eq('role', 'assistant')
    .maybeSingle();
  if (prior?.content) {
    const journey = await getJourney(user.id, category);
    return NextResponse.json({
      answer: prior.content,
      citations: extractCitedIndexes(prior.content as string),
      journey,
      replayed: true,
    });
  }

  // 2. Rate-limit fuse (atomic).
  const { data: rl, error: rlErr } = await svc.rpc('try_increment_agent_message', {
    p_user_id: user.id,
    p_cap: DAILY_CAP,
  });
  if (rlErr) {
    console.error('[agent/chat] rate-limit rpc failed', rlErr);
    return NextResponse.json({ error: 'rate_limit_unavailable' }, { status: 503 });
  }
  const allowed = Array.isArray(rl) ? rl[0]?.allowed === true : false;
  if (!allowed) return NextResponse.json({ error: 'daily_limit', cap: DAILY_CAP }, { status: 429 });

  const refund = () =>
    svc.rpc('refund_agent_message', { p_user_id: user.id }).then(
      () => {},
      (e) => console.error('[agent/chat] refund failed', user.id, e),
    );

  // 3. Gather context (prior history excludes the current turn — not yet stored).
  const [journeyState, histRes, corpus] = await Promise.all([
    getJourney(user.id, category),
    svc
      .from('agent_messages')
      .select('role, content')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(HISTORY_TURNS * 2),
    searchCorpus(category, query, { threshold: 0.5, limit: 8 }),
  ]);

  const history: ChatMessage[] = (histRes.data ?? [])
    .reverse()
    .map((r) => ({ role: r.role as 'user' | 'assistant', content: r.content as string }));

  // 4. Persist the user turn (idempotency guard via unique(user_id,request_id)).
  const { error: insErr } = await svc.from('agent_messages').insert({
    user_id: user.id,
    role: 'user',
    content: query,
    request_id: requestId,
  });
  if (insErr) {
    // 23505 = a concurrent submit with the same requestId won the race.
    await refund();
    if (insErr.code === '23505')
      return NextResponse.json({ error: 'duplicate_in_flight' }, { status: 409 });
    console.error('[agent/chat] user message insert failed', insErr);
    return NextResponse.json({ error: 'db_error' }, { status: 500 });
  }

  const cleanupUserTurn = () =>
    svc
      .from('agent_messages')
      .delete()
      .eq('user_id', user.id)
      .eq('request_id', requestId)
      .eq('role', 'user')
      .then(
        () => {},
        (e) => console.error('[agent/chat] cleanup failed', e),
      );

  // 5. Assemble prompt + call the model.
  let summaryData: AssessmentData | null = null;
  const { data: assessment } = await svc
    .from('assessments')
    .select('data')
    .eq('user_id', user.id)
    .eq('category', category)
    .eq('status', 'submitted')
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (assessment?.data) {
    try {
      summaryData = assessmentDataSchema.parse(assessment.data);
    } catch {
      summaryData = null;
    }
  }

  const categoryLabel = CATEGORIES.find((c) => c.id === category)?.label ?? category;
  const { messages, numberedChunkIds } = buildCoachPrompt({
    categoryLabel,
    category,
    assessmentSummary: buildAssessmentSummary(summaryData),
    milestones: journeyState.milestones,
    corpusChunks: corpus,
    history,
    query,
  });

  let parsed: ParsedAnswer | null = null;
  try {
    const completion = await openai.chat.completions.create({
      model: MODEL,
      temperature: 0.3,
      max_tokens: 700,
      response_format: { type: 'json_object' },
      messages,
    });
    parsed = parseModelOutput(completion.choices[0]?.message?.content?.trim() ?? '');
  } catch (err) {
    console.error('[agent/chat] openai failed', err);
  }

  if (!parsed) {
    await Promise.all([cleanupUserTurn(), refund()]);
    return NextResponse.json({ error: 'answer_unavailable' }, { status: 503 });
  }

  // 6. Persist assistant turn (chunk_ids stored for audit; displayed citations
  //    are derived from the answer text, so replay needs no chunk refetch).
  await svc.from('agent_messages').insert({
    user_id: user.id,
    role: 'assistant',
    content: parsed.answer,
    chunk_ids: numberedChunkIds,
    request_id: requestId,
  });

  // 7. Apply journey updates + last_topic (skip on refusal), else current state.
  let journey = journeyState;
  if (!parsed.refused && (parsed.milestone_updates.length > 0 || parsed.topic)) {
    journey = await updateJourney(
      user.id,
      category,
      parsed.milestone_updates,
      'llm',
      parsed.topic || null,
    );
  }

  // 8. Roll the rolling window.
  await rollWindow(svc, user.id);

  return NextResponse.json({
    answer: parsed.answer,
    citations: extractCitedIndexes(parsed.answer),
    journey,
  });
}
