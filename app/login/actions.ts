'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';

const schema = z.object({
  email: z.string().trim().email('Enter a valid email'),
  password: z.string().min(1, 'Enter your password'),
});

export type LoginFieldErrors = Partial<
  Record<'email' | 'password' | '_form', string>
>;

export type LoginState = {
  ok: boolean;
  fieldErrors: LoginFieldErrors;
};

export async function login(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = schema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });
  if (!parsed.success) {
    const fe: LoginFieldErrors = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof LoginFieldErrors;
      if (!fe[key]) fe[key] = issue.message;
    }
    return { ok: false, fieldErrors: fe };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    const msg = error.message.toLowerCase();
    if (msg.includes('confirm')) {
      return {
        ok: false,
        fieldErrors: { _form: 'Please confirm your email first. Check your inbox.' },
      };
    }
    if (msg.includes('invalid') || msg.includes('credentials')) {
      return {
        ok: false,
        fieldErrors: { _form: 'Email or password is incorrect.' },
      };
    }
    return { ok: false, fieldErrors: { _form: error.message } };
  }

  redirect('/dashboard');
}
