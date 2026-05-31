import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { summariseUserChats } from '@/lib/admin/chat-summary';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const Body = z.object({ userId: z.string().uuid() });

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
 * Admin-only: generate an on-demand LLM summary of a user's AI-coach chat.
 * Triggered per row from the admin users dashboard so the page itself stays
 * fast and we only spend tokens on users an admin actually inspects.
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

  const result = await summariseUserChats(body.userId);
  return NextResponse.json(result);
}
