import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createSupabaseServiceClient } from '@/lib/supabase/service';
import { generateAndNotify } from '@/lib/notifications/report-ready';

export const runtime = 'nodejs';
export const maxDuration = 300;

const Body = z.object({
  userId: z.string().uuid(),
  callNotes: z.string().max(20_000).optional(),
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

export async function POST(req: NextRequest) {
  const ssr = await createSupabaseServerClient();
  const {
    data: { user },
  } = await ssr.auth.getUser();
  // Surface admin gate as 404 so the endpoint stays invisible to non-admins.
  if (!isAdmin(user?.email)) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  let body;
  try {
    body = Body.parse(await req.json());
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }

  // Verify the target user is actually paid — refuse to generate for free users
  // even though the admin theoretically could trigger anything.
  const svc = createSupabaseServiceClient();
  const { data: profile } = await svc
    .from('profiles')
    .select('tier')
    .eq('user_id', body.userId)
    .single();
  if (profile?.tier !== 'paid') {
    return NextResponse.json({ error: 'target_not_paid' }, { status: 409 });
  }

  // Synchronous: admin needs to see success/failure inline, not fire-and-forget.
  try {
    await generateAndNotify(body.userId, { callNotes: body.callNotes });
  } catch (err) {
    console.error('[admin/post-call/generate]', err);
    const reason = err instanceof Error ? err.message : 'generation_failed';
    return NextResponse.json({ error: reason }, { status: 500 });
  }

  // Read back the timestamp the generator wrote so the client shows accurate state.
  const { data: report } = await svc
    .from('paid_reports')
    .select('generated_at')
    .eq('user_id', body.userId)
    .single();

  return NextResponse.json({
    ok: true,
    generatedAt: report?.generated_at ?? new Date().toISOString(),
  });
}
