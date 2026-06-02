import { NextRequest, NextResponse } from 'next/server';
import { waitUntil } from '@vercel/functions';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { notifyAdminOfNewUser } from '@/lib/notifications/new-user-admin-email';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const next = url.searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // This callback serves two flows: new-user email confirmation (next
      // defaults to /dashboard) and password reset (next=/reset-password).
      // Only the confirmation path is a genuine new registration, so notify
      // the admin only there. The builder is idempotent on profiles.admin_
      // notified_at, so resend-confirmation can't double-fire.
      const userId = data.user?.id;
      if (userId && next !== '/reset-password') {
        waitUntil(notifyAdminOfNewUser(userId));
      }
      return NextResponse.redirect(new URL(next, url.origin));
    }
  }
  return NextResponse.redirect(new URL('/login?error=callback', url.origin));
}
