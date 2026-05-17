import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createSupabaseServiceClient } from '@/lib/supabase/service';
import { sendEmail, escapeHtml, stripNewlines } from '@/lib/email/brevo';
import { CATEGORIES } from '@/lib/categories';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Sender is env-configurable so you can swap to any verified Brevo sender
// (e.g. your account email) before the jobabroad.co.za domain is DKIM-verified.
const FROM_EMAIL_DEFAULT = 'no-reply@jobabroad.co.za';
const FROM_NAME_DEFAULT = 'Jobabroad Follow-up';
const TO_NAME = 'John Montgomery';
const SUBJECT_MAX = 120;
const BODY_MAX = 2000;

export async function POST(req: NextRequest) {
  const johnInbox = process.env.JOHN_INBOX_EMAIL;
  if (!johnInbox) {
    console.error('[follow-up/send] JOHN_INBOX_EMAIL not configured');
    return NextResponse.json({ error: 'not_configured' }, { status: 500 });
  }

  const ssr = await createSupabaseServerClient();
  const {
    data: { user },
  } = await ssr.auth.getUser();
  if (!user?.email) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  let parsed: { subject?: unknown; body?: unknown };
  try {
    parsed = await req.json();
  } catch {
    return NextResponse.json({ error: 'bad_json' }, { status: 400 });
  }

  const subjectRaw = typeof parsed.subject === 'string' ? parsed.subject : '';
  const bodyRaw = typeof parsed.body === 'string' ? parsed.body : '';
  const subject = stripNewlines(subjectRaw).slice(0, SUBJECT_MAX).trim();
  const message = bodyRaw.slice(0, BODY_MAX).trim();
  if (!subject || !message) {
    return NextResponse.json({ error: 'subject_and_body_required' }, { status: 400 });
  }

  const { data: profile } = await ssr
    .from('profiles')
    .select('name, category, tier')
    .eq('user_id', user.id)
    .single();
  if (!profile) {
    return NextResponse.json({ error: 'no_profile' }, { status: 401 });
  }
  if (profile.tier !== 'paid') {
    return NextResponse.json({ error: 'paid_only' }, { status: 403 });
  }

  // Atomic decrement via service-role RPC (function is service_role-only per step 01).
  // Throws inside the function if credits=0; we map that to a 403.
  const svc = createSupabaseServiceClient();
  const { data: remainingData, error: decErr } = await svc.rpc('decrement_email_credit', {
    p_user_id: user.id,
  });
  if (decErr) {
    if (decErr.message?.includes('no_credits_remaining')) {
      return NextResponse.json({ error: 'no_credits_remaining' }, { status: 403 });
    }
    console.error('[follow-up/send] decrement failed', decErr);
    return NextResponse.json({ error: 'decrement_failed' }, { status: 500 });
  }
  const remaining = remainingData as number;

  const categoryLabel =
    CATEGORIES.find((c) => c.id === profile.category)?.label ?? profile.category;
  const safeSubject = subject;
  const safeBody = escapeHtml(message).replace(/\n/g, '<br>');
  const safeName = escapeHtml(profile.name);

  const fromEmail = process.env.BREVO_FROM_EMAIL || FROM_EMAIL_DEFAULT;
  const fromName = process.env.BREVO_FROM_NAME || FROM_NAME_DEFAULT;

  try {
    await sendEmail({
      from: { email: fromEmail, name: fromName },
      to: [{ email: johnInbox, name: TO_NAME }],
      replyTo: { email: user.email, name: profile.name },
      subject: `[Follow-up — ${categoryLabel}] ${safeSubject}`,
      htmlContent: `
        <p>From: <strong>${safeName}</strong> &lt;${escapeHtml(user.email)}&gt;</p>
        <p>Category: <strong>${escapeHtml(categoryLabel)}</strong> · Credits remaining: ${remaining} of 5</p>
        <hr>
        <p>${safeBody}</p>
        <hr>
        <p style="color:#888;font-size:12px">Reply directly to this email — your reply goes to ${safeName}.</p>
      `,
    });
  } catch (err) {
    console.error('[follow-up/send] brevo send failed', err);
    // Best-effort rollback — see step plan R4b for the KNOWN LIMITATION note.
    // This is two separate transactions; if the process crashes between failure
    // and the increment call, the user silently loses one credit.
    const { error: incErr } = await svc.rpc('increment_email_credit', { p_user_id: user.id });
    if (incErr) {
      console.error('[follow-up/send] credit refund failed — manual fix needed for', user.id, incErr);
    }
    return NextResponse.json({ error: 'send_failed' }, { status: 502 });
  }

  return NextResponse.json({ ok: true, remaining });
}
