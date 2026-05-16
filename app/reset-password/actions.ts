'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';

const schema = z.object({
  password: z.string().min(8, 'At least 8 characters'),
});

export type ResetFieldErrors = Partial<Record<'password' | '_form', string>>;

export type ResetState = {
  ok: boolean;
  fieldErrors: ResetFieldErrors;
};

export async function resetPassword(
  _prev: ResetState,
  formData: FormData,
): Promise<ResetState> {
  const parsed = schema.safeParse({ password: formData.get('password') });
  if (!parsed.success) {
    return {
      ok: false,
      fieldErrors: {
        password: parsed.error.issues[0]?.message ?? 'At least 8 characters',
      },
    };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return {
      ok: false,
      fieldErrors: { _form: 'Recovery link expired. Request a new one.' },
    };
  }

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    return { ok: false, fieldErrors: { _form: error.message } };
  }

  redirect('/dashboard');
}
