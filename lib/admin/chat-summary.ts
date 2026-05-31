import 'server-only';
import OpenAI from 'openai';
import { createSupabaseServiceClient } from '@/lib/supabase/service';

// Lazy, cached singleton — built on first call, not at module load, so importing
// this during `next build` doesn't require OPENAI_API_KEY.
let _openai: OpenAI | null = null;
function getOpenAI() {
  return (_openai ??= new OpenAI({ apiKey: process.env.OPENAI_API_KEY ?? '' }));
}

const MAX_TURNS = 60;
const SYSTEM_PROMPT = `You summarise a support chat transcript between a South African work-abroad applicant ("user") and an AI assistant. Write 1 to 2 sentences, max 45 words, third person, describing what the user is asking about and where they are in their journey.

Be concrete: name the topics raised (visas, registration, documents, costs, timelines, specific blockers). No preamble, no "the user" padding beyond what's needed. Never use em dashes. Return plain text, no JSON.`;

export interface ChatSummaryResult {
  empty: boolean;
  userTurns: number;
  summary: string | null;
}

/**
 * Reads a user's AI-coach transcript and returns a short LLM summary for the
 * admin dashboard. Generated on demand (per admin click) rather than on every
 * page load, so the list stays fast and we don't burn tokens summarising users
 * who haven't chatted. Returns { empty: true } when there's nothing to summarise.
 */
export async function summariseUserChats(userId: string): Promise<ChatSummaryResult> {
  const svc = createSupabaseServiceClient();
  const { data: msgs } = await svc
    .from('agent_messages')
    .select('role, content')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
    .limit(MAX_TURNS);

  const rows = (msgs ?? []) as { role: string; content: string }[];
  const userTurns = rows.filter((m) => m.role === 'user').length;
  if (rows.length === 0 || userTurns === 0) {
    return { empty: true, userTurns: 0, summary: null };
  }

  const transcript = rows
    .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
    .join('\n');

  if (!process.env.OPENAI_API_KEY) {
    return { empty: false, userTurns, summary: null };
  }

  try {
    const completion = await getOpenAI().chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.2,
      max_tokens: 120,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: transcript },
      ],
    });
    const summary = completion.choices[0]?.message?.content?.trim() || null;
    return { empty: false, userTurns, summary };
  } catch (err) {
    console.error('[admin/chat-summary] openai failure', err);
    return { empty: false, userTurns, summary: null };
  }
}
