import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServiceClient } from '@/lib/supabase/service';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Token-based, unauthenticated opt-out from nudge emails. The token is the only
// credential (random uuid, unique-indexed, not enumerable). Always renders the
// SAME generic confirmation whether or not the token matched, so it leaks no
// signal an attacker could probe.
const CONFIRMATION = `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Unsubscribed — Jobabroad</title></head>
<body style="font-family:system-ui,sans-serif;background:#F8F5F0;color:#2C2C2C;margin:0;padding:48px 24px;">
<div style="max-width:480px;margin:0 auto;background:#fff;border:1.5px solid #EDE8E0;border-radius:16px;padding:32px;">
<h1 style="font-size:20px;margin:0 0 12px;">You're unsubscribed</h1>
<p style="color:#6B6B6B;line-height:1.6;margin:0;">You won't receive any more assistant reminder emails. You can still chat with your assistant any time from your dashboard.</p>
</div></body></html>`;

function render() {
  return new NextResponse(CONFIRMATION, {
    status: 200,
    headers: { 'content-type': 'text/html; charset=utf-8' },
  });
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')?.trim();
  if (!token) return render();

  const svc = createSupabaseServiceClient();
  const { data: profile } = await svc
    .from('profiles')
    .select('user_id')
    .eq('agent_nudge_unsub_token', token)
    .maybeSingle();

  if (profile) {
    await svc
      .from('profiles')
      .update({
        agent_nudge_consent: false,
        agent_nudge_unsubscribed_at: new Date().toISOString(),
        agent_nudge_unsub_token: null,
      })
      .eq('user_id', profile.user_id);
  }

  return render();
}
