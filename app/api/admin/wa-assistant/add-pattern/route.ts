import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { isAdminEmail } from '@/lib/auth-guards';
import { AddPatternInputSchema } from '@/lib/wa-assistant/schema';
import { addPattern } from '@/lib/wa-assistant/add-pattern';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const ssr = await createSupabaseServerClient();
  const { data: { user } } = await ssr.auth.getUser();
  if (!isAdminEmail(user?.email)) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  let body;
  try {
    body = AddPatternInputSchema.parse(await req.json());
  } catch (err) {
    return NextResponse.json(
      { error: 'invalid_body', detail: err instanceof Error ? err.message : String(err) },
      { status: 400 },
    );
  }

  try {
    const result = await addPattern(body);
    return NextResponse.json(result);
  } catch (err) {
    console.error('[wa-assistant/add-pattern]', err);
    return NextResponse.json(
      { error: 'add_pattern_failed', detail: err instanceof Error ? err.message : 'unknown' },
      { status: 500 },
    );
  }
}
