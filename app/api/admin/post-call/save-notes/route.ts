import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createSupabaseServiceClient } from '@/lib/supabase/service';
import { sendCallNotesEmail } from '@/lib/notifications/call-notes';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const Body = z.object({
  userId: z.string().uuid(),
  callNotes: z.string().min(1).max(20_000),
});

function isAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  const raw = process.env.ADMIN_EMAILS ?? '';
  const allow = new Set(
    raw
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean),
  );
  return allow.has(email.toLowerCase());
}

/**
 * Admin saves call notes for a paid buyer. Two side-effects, both synchronous
 * so the admin sees success/failure inline:
 *   1. Upsert paid_reports.call_notes (drives the dashboard "Notes from our
 *      session" card on the buyer's next visit).
 *   2. sendCallNotesEmail — plain-text follow-up email, no PDF attached.
 */
export async function POST(req: NextRequest) {
  const ssr = await createSupabaseServerClient();
  const {
    data: { user },
  } = await ssr.auth.getUser();
  if (!isAdmin(user?.email)) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  let body;
  try {
    body = Body.parse(await req.json());
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }

  const svc = createSupabaseServiceClient();
  const { data: profile } = await svc
    .from('profiles')
    .select('tier')
    .eq('user_id', body.userId)
    .single();
  if (profile?.tier !== 'paid') {
    return NextResponse.json({ error: 'target_not_paid' }, { status: 409 });
  }

  const trimmed = body.callNotes.trim();
  const { error: upsertErr } = await svc.from('paid_reports').upsert(
    {
      user_id: body.userId,
      call_notes: trimmed,
    },
    { onConflict: 'user_id' },
  );
  if (upsertErr) {
    console.error('[admin/save-notes] db upsert failed', upsertErr);
    return NextResponse.json({ error: 'db_error' }, { status: 500 });
  }

  try {
    await sendCallNotesEmail(body.userId, trimmed);
  } catch (err) {
    console.error('[admin/save-notes] email send failed', err);
    const reason = err instanceof Error ? err.message : 'email_failed';
    // Notes are saved; admin gets a 207-ish signal so the UI can say "saved
    // but email failed" without losing the work.
    return NextResponse.json({ ok: true, emailed: false, reason }, { status: 502 });
  }

  return NextResponse.json({ ok: true, emailed: true });
}
