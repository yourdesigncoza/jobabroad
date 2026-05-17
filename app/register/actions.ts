'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { checkBotId } from 'botid/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { CATEGORIES } from '@/lib/categories';
import { saPhoneSchema } from '@/lib/phone';

const REGISTRABLE_IDS = CATEGORIES
  .filter((c) => c.id !== 'other')
  .map((c) => c.id);

const schema = z.object({
  name: z.string().trim().min(2, 'Enter your name'),
  email: z.string().trim().email('Enter a valid email'),
  phone: saPhoneSchema,
  password: z.string().min(8, 'At least 8 characters'),
  category: z.enum(REGISTRABLE_IDS as [string, ...string[]]),
});

export type RegisterFieldErrors = Partial<
  Record<'name' | 'email' | 'phone' | 'password' | 'category' | '_form', string>
>;

export type RegisterState = {
  ok: boolean;
  fieldErrors: RegisterFieldErrors;
};

export async function register(
  _prev: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  try {
    const verification = await checkBotId();
    if (verification.isBot) {
      return { ok: false, fieldErrors: { _form: 'Bot detected. Please try again.' } };
    }
  } catch (err) {
    console.error('[register] checkBotId failed', err);
    if (process.env.NODE_ENV === 'production') {
      return { ok: false, fieldErrors: { _form: 'Verification unavailable. Try again shortly.' } };
    }
  }

  const parsed = schema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    password: formData.get('password'),
    category: formData.get('category'),
  });
  if (!parsed.success) {
    const fe: RegisterFieldErrors = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof RegisterFieldErrors;
      if (!fe[key]) fe[key] = issue.message;
    }
    return { ok: false, fieldErrors: fe };
  }

  const { name, email, phone, password, category } = parsed.data;
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`,
      data: { name, phone, category },
    },
  });

  if (error) {
    const msg = error.message.toLowerCase();
    if (msg.includes('already') || msg.includes('registered')) {
      return { ok: false, fieldErrors: { email: 'That email is already registered. Try logging in.' } };
    }
    if (msg.includes('phone') || (msg.includes('duplicate key') && msg.includes('phone'))) {
      return { ok: false, fieldErrors: { phone: 'That phone number is already registered.' } };
    }
    if (msg.includes('password')) {
      return { ok: false, fieldErrors: { password: error.message } };
    }
    // Supabase wraps profile-trigger failures (unique constraint violations on
    // phone, etc.) as the opaque "database error saving new user". The actual
    // constraint detail is buried in Supabase logs — for the form we fall back
    // to a friendly default that points users at the most likely cause.
    if (msg.includes('database error saving new user')) {
      return {
        ok: false,
        fieldErrors: {
          phone: 'This phone number may already be registered — try a different number, or log in.',
        },
      };
    }
    return { ok: false, fieldErrors: { _form: error.message } };
  }

  // Supabase quirk: signing up an already-confirmed email returns no error
  // and a user object that LOOKS fresh, but with an empty identities array.
  // This is the anti-enumeration path — Supabase won't tell us the email
  // exists, so we infer it from the empty identities and surface the same
  // message the explicit error path uses.
  if (data?.user && (data.user.identities?.length ?? 0) === 0) {
    return { ok: false, fieldErrors: { email: 'That email is already registered. Try logging in.' } };
  }

  redirect('/auth/confirm-email');
}
