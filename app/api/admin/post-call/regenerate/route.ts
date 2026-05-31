import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { waitUntil } from '@vercel/functions';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createSupabaseServiceClient } from '@/lib/supabase/service';
import { generateAndEmail } from '@/lib/reports/generate-and-email';
import { hasFullAccess } from '@/lib/access';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

const Body = z.object({
  userId: z.string().uuid(),
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
 * Admin force-regenerate. Same plumbing as /api/reports/regenerate but
 * bypasses the user-facing 5-attempt cap — this is the escape hatch for
 * subtle failures that the user retry button can't shake loose, or for
 * regenerating after a template/prompt change.
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
  if (!hasFullAccess(profile?.tier)) {
    return NextResponse.json({ error: 'target_no_access' }, { status: 409 });
  }

  const { data: report } = await svc
    .from('paid_reports')
    .select('generation_attempts')
    .eq('user_id', body.userId)
    .maybeSingle();
  const currentAttempts = (report?.generation_attempts as number) ?? 0;

  const { error: updateErr } = await svc.from('paid_reports').upsert(
    {
      user_id: body.userId,
      generation_status: 'pending',
      generation_attempts: currentAttempts + 1,
      generation_started_at: new Date().toISOString(),
      generation_error: null,
    },
    { onConflict: 'user_id' },
  );
  if (updateErr) {
    console.error('[admin/regenerate] status update failed', updateErr);
    return NextResponse.json({ error: 'db_error' }, { status: 500 });
  }

  waitUntil(generateAndEmail(body.userId));
  return NextResponse.json({ ok: true, attempts: currentAttempts + 1 });
}
