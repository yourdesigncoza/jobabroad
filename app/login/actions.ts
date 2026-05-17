'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';

const schema = z.object({
  email: z.string().trim().email('Enter a valid email'),
  password: z.string().min(1, 'Enter your password'),
  next: z.string().optional(),
  hash: z.string().optional(),
});

/** Allow only same-origin relative paths to prevent open-redirect attacks. */
function safeNext(raw: string | undefined): string {
  if (!raw) return '/dashboard';
  if (!raw.startsWith('/') || raw.startsWith('//')) return '/dashboard';
  return raw;
}

/**
 * Build the post-login destination URL. Hash fragments aren't sent server-side,
 * so we forward them as `?h=<anchor>` and a small client effect on the
 * destination page scrolls to that element on mount. We don't append a `#`
 * fragment here because Next.js's redirect() strips client hashes anyway.
 */
function destinationWithAnchor(next: string, rawHash: string | undefined): string {
  if (!rawHash) return next;
  const cleaned = rawHash.replace(/^#+/, '');
  if (!/^[A-Za-z0-9\-_]+$/.test(cleaned)) return next;
  const sep = next.includes('?') ? '&' : '?';
  return `${next}${sep}h=${encodeURIComponent(cleaned)}`;
}

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
    next: formData.get('next'),
    hash: formData.get('hash'),
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

  redirect(destinationWithAnchor(safeNext(parsed.data.next), parsed.data.hash));
}
