import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export type Profile = {
  user_id: string;
  name: string;
  phone: string;
  category: string;
};

export async function requireSession(returnTo: string) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(returnTo)}`);
  return { supabase, user };
}

export async function requireProfile(returnTo: string) {
  const { supabase, user } = await requireSession(returnTo);
  const { data: profile } = await supabase
    .from('profiles')
    .select('user_id, name, phone, category')
    .eq('user_id', user.id)
    .single();
  return { supabase, user, profile: (profile as Profile | null) ?? null };
}

/**
 * Gates admin-only routes. Allow-list lives in ADMIN_EMAILS env (comma-separated,
 * case-insensitive). Unauthenticated users go to /login; authenticated but
 * non-admin users hit a 404 via notFound() so the admin surface stays hidden.
 */
export async function requireAdmin(returnTo: string) {
  const { supabase, user } = await requireSession(returnTo);
  const raw = process.env.ADMIN_EMAILS ?? '';
  const allowList = new Set(
    raw
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean),
  );
  const email = user.email?.toLowerCase() ?? '';
  if (!email || !allowList.has(email)) {
    const { notFound } = await import('next/navigation');
    notFound();
  }
  return { supabase, user };
}

/**
 * Returns the current user's tier without redirecting. Used by site-wide
 * chrome (SiteNav, SiteFooter, StickyNav callers, AnswerCard) to hide
 * WhatsApp CTAs once a user has paid — they have self-service tools
 * (download report, book call, follow-up form) and shouldn't be routed
 * back into the manual WhatsApp pipeline.
 *
 * Returns 'paid' | 'free' for authenticated users, null for unauth or
 * users without a profile row.
 */
export async function getCurrentTier(): Promise<'paid' | 'free' | null> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from('profiles')
    .select('tier')
    .eq('user_id', user.id)
    .single();
  return (data?.tier as 'paid' | 'free' | undefined) ?? null;
}
