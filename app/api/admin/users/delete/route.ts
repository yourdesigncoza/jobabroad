import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createSupabaseServiceClient } from '@/lib/supabase/service';
import { isAdminEmail } from '@/lib/auth-guards';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const Body = z.object({ userId: z.string().uuid() });

// User-keyed app tables cleared before removing the auth user. profiles is left
// to cascade from the auth delete (handle_new_user FK). Best-effort per table —
// a missing row is fine; we don't want one stray table to block the delete.
const USER_TABLES = [
  'assessments',
  'paid_reports',
  'bookings',
  'agent_messages',
  'agent_rate_limits',
  'user_journey',
];

export async function POST(req: NextRequest) {
  const ssr = await createSupabaseServerClient();
  const {
    data: { user },
  } = await ssr.auth.getUser();
  if (!isAdminEmail(user?.email)) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await req.json());
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }

  // Never let an admin delete their own signed-in account.
  if (body.userId === user?.id) {
    return NextResponse.json({ error: 'cannot_delete_self' }, { status: 409 });
  }

  const svc = createSupabaseServiceClient();
  for (const table of USER_TABLES) {
    const { error } = await svc.from(table).delete().eq('user_id', body.userId);
    if (error) console.error(`[admin/users/delete] ${table} cleanup failed`, error);
  }

  const { error } = await svc.auth.admin.deleteUser(body.userId);
  if (error) {
    console.error('[admin/users/delete] auth delete failed', error);
    return NextResponse.json({ error: 'delete_failed' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
