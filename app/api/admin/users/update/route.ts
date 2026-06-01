import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createSupabaseServiceClient } from '@/lib/supabase/service';
import { isAdminEmail } from '@/lib/auth-guards';
import { saPhoneSchema } from '@/lib/phone';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// At least one editable field must be present. Phone is validated + normalised
// to 27XXXXXXXXX by saPhoneSchema (the profiles_phone_check constraint rejects
// a leading + or 0).
const Body = z
  .object({
    userId: z.string().uuid(),
    name: z.string().trim().min(1).max(120).optional(),
    email: z.string().trim().email().optional(),
    phone: saPhoneSchema.optional(),
  })
  .refine((b) => b.name !== undefined || b.email !== undefined || b.phone !== undefined, {
    message: 'nothing_to_update',
  });

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

  const svc = createSupabaseServiceClient();

  // 1. profiles row — name + phone (phone already normalised by the schema).
  const profilePatch: Record<string, string> = {};
  if (body.name !== undefined) profilePatch.name = body.name;
  if (body.phone !== undefined) profilePatch.phone = body.phone;
  if (Object.keys(profilePatch).length) {
    const { error } = await svc.from('profiles').update(profilePatch).eq('user_id', body.userId);
    if (error) {
      console.error('[admin/users/update] profile update failed', error);
      return NextResponse.json({ error: 'db_error' }, { status: 500 });
    }
  }

  // 2. auth user — email (kept confirmed so login still works) + mirror name
  //    into user_metadata so the two stores stay in sync.
  if (body.email !== undefined || body.name !== undefined) {
    const patch: { email?: string; email_confirm?: boolean; user_metadata?: Record<string, unknown> } = {};
    if (body.email !== undefined) {
      patch.email = body.email;
      patch.email_confirm = true;
    }
    if (body.name !== undefined) patch.user_metadata = { name: body.name };
    const { error } = await svc.auth.admin.updateUserById(body.userId, patch);
    if (error) {
      if (/registered|already|exists|duplicate/i.test(error.message)) {
        return NextResponse.json({ error: 'email_taken' }, { status: 409 });
      }
      console.error('[admin/users/update] auth update failed', error);
      return NextResponse.json({ error: 'auth_error' }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}
