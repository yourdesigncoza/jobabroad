import { NextResponse } from 'next/server';
import { waitUntil } from '@vercel/functions';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createSupabaseServiceClient } from '@/lib/supabase/service';
import { generateAndEmail } from '@/lib/reports/generate-and-email';
import { hasFullAccess } from '@/lib/access';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

const MAX_USER_ATTEMPTS = 5;

/**
 * User-facing retry for a failed report generation. Bumps generation_attempts
 * and re-fires the same waitUntil(generateReport + email) path as the webhook.
 * Capped at MAX_USER_ATTEMPTS to prevent runaway costs from a stuck failure;
 * past the cap a support intervention is needed (admin force-regenerate in
 * Phase 4 bypasses this cap).
 */
export async function POST() {
  const ssr = await createSupabaseServerClient();
  const {
    data: { user },
  } = await ssr.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const { data: profile } = await ssr
    .from('profiles')
    .select('tier')
    .eq('user_id', user.id)
    .single();
  if (!hasFullAccess(profile?.tier)) {
    return NextResponse.json({ error: 'paid_only' }, { status: 403 });
  }

  const svc = createSupabaseServiceClient();
  const { data: report } = await svc
    .from('paid_reports')
    .select('generation_attempts, generation_status')
    .eq('user_id', user.id)
    .maybeSingle();

  const currentAttempts = (report?.generation_attempts as number) ?? 0;
  if (currentAttempts >= MAX_USER_ATTEMPTS) {
    return NextResponse.json({ error: 'retry_limit_reached' }, { status: 429 });
  }

  // Flip status back to 'pending' and bump the counter atomically. We use a
  // simple update; the row is guaranteed to exist because applySuccessfulPayment
  // creates it on tier flip. If it somehow doesn't, upsert.
  const { error: updateErr } = await svc
    .from('paid_reports')
    .upsert(
      {
        user_id: user.id,
        generation_status: 'pending',
        generation_attempts: currentAttempts + 1,
        generation_started_at: new Date().toISOString(),
        generation_error: null,
      },
      { onConflict: 'user_id' },
    );
  if (updateErr) {
    console.error('[reports/regenerate] status update failed', updateErr);
    return NextResponse.json({ error: 'db_error' }, { status: 500 });
  }

  waitUntil(generateAndEmail(user.id));
  return NextResponse.json({ ok: true });
}
