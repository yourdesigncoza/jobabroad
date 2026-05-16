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
