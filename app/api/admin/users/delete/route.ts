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

// Generated report PDFs live in this Storage bucket under a per-user folder
// (see lib/reports/generator.ts: pdfPath = `${userId}/report-${ts}.pdf`).
const REPORTS_BUCKET = 'paid-reports';

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

  // Purge the generated report PDF(s) from Storage — the paid_reports row above
  // only pointed at them. Best-effort: list the user's folder and remove every
  // object so we don't leave personal-data blobs orphaned in the bucket.
  const { data: files, error: listErr } = await svc.storage.from(REPORTS_BUCKET).list(body.userId);
  if (listErr) {
    console.error('[admin/users/delete] storage list failed', listErr);
  } else if (files && files.length) {
    const paths = files.map((f) => `${body.userId}/${f.name}`);
    const { error: rmErr } = await svc.storage.from(REPORTS_BUCKET).remove(paths);
    if (rmErr) console.error('[admin/users/delete] storage remove failed', rmErr);
  }

  const { error } = await svc.auth.admin.deleteUser(body.userId);
  if (error) {
    console.error('[admin/users/delete] auth delete failed', error);
    return NextResponse.json({ error: 'delete_failed' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
