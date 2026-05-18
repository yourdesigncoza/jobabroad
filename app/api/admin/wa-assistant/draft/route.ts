import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { isAdminEmail } from '@/lib/auth-guards';
import { DraftInputSchema, type DraftApiResponse, type RuleViolation } from '@/lib/wa-assistant/schema';
import { draftReply } from '@/lib/wa-assistant/draft';
import { validateDraft } from '@/lib/wa-assistant/validate';
import { loadThread, serialiseThreadForPrompt } from '@/lib/wa-assistant/thread';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const ssr = await createSupabaseServerClient();
  const { data: { user } } = await ssr.auth.getUser();
  if (!isAdminEmail(user?.email)) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  let body;
  try {
    body = DraftInputSchema.parse(await req.json());
  } catch (err) {
    return NextResponse.json(
      { error: 'invalid_body', detail: err instanceof Error ? err.message : String(err) },
      { status: 400 },
    );
  }

  try {
    // Auto-load prior thread context from conversations/<phone>.md (server-
    // side). The client no longer pastes prior turns manually — phone number
    // is the single source of truth. If the client also passes priorContext
    // (e.g. for testing) we append it after the loaded thread.
    const thread = await loadThread(body.phone);
    const loadedContext = serialiseThreadForPrompt(thread);
    const combinedContext = [loadedContext, body.priorContext?.trim() ?? '']
      .filter(Boolean)
      .join('\n\n');

    const draft = await draftReply({
      ...body,
      priorContext: combinedContext || undefined,
    });

    // Hard Rule 4: the reply must end with exactly one follow-up question.
    // The model often drops it — patch deterministically by appending the
    // followUpQuestion field if the draft doesn't end with '?'. Flag as a
    // regex violation so the human knows the model misbehaved.
    let finalDraft = draft.draftReply;
    const trimmed = finalDraft.trimEnd();
    const dropViolations: RuleViolation[] = [];
    if (!trimmed.endsWith('?') && draft.followUpQuestion.trim()) {
      const question = draft.followUpQuestion.trim().endsWith('?')
        ? draft.followUpQuestion.trim()
        : `${draft.followUpQuestion.trim()}?`;
      finalDraft = `${trimmed}\n\n${question}`;
      dropViolations.push({
        rule: 4,
        reason: 'Model dropped the follow-up question — auto-appended from followUpQuestion field',
        source: 'regex',
      });
    }

    const regexViolations = validateDraft(finalDraft);
    const response: DraftApiResponse = {
      ...draft,
      draftReply: finalDraft,
      ruleViolations: [
        ...draft.ruleViolations.map((v) => ({ ...v, source: 'model' as const })),
        ...dropViolations,
        ...regexViolations,
      ],
    };
    return NextResponse.json(response);
  } catch (err) {
    console.error('[wa-assistant/draft]', err);
    return NextResponse.json(
      { error: 'draft_failed', detail: err instanceof Error ? err.message : 'unknown' },
      { status: 502 },
    );
  }
}
