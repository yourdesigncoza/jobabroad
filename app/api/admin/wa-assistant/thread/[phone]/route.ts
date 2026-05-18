import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { isAdminEmail } from '@/lib/auth-guards';
import { loadThread } from '@/lib/wa-assistant/thread';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PHONE_REGEX = /^\d{10,15}$/;

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ phone: string }> },
) {
  const ssr = await createSupabaseServerClient();
  const { data: { user } } = await ssr.auth.getUser();
  if (!isAdminEmail(user?.email)) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  const { phone } = await ctx.params;
  if (!PHONE_REGEX.test(phone)) {
    return NextResponse.json({ error: 'invalid_phone' }, { status: 400 });
  }

  try {
    const thread = await loadThread(phone);
    return NextResponse.json(thread);
  } catch (err) {
    console.error('[wa-assistant/thread]', err);
    return NextResponse.json(
      { error: 'load_failed', detail: err instanceof Error ? err.message : 'unknown' },
      { status: 500 },
    );
  }
}
