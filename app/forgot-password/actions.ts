'use server';

import { z } from 'zod';
import { createSupabaseServerClient } from '@/lib/supabase/server';

const schema = z.object({
  email: z.string().trim().email('Enter a valid email'),
});

export type ForgotState = {
  sent: boolean;
  fieldErrors: { email?: string };
};

export async function requestReset(
  _prev: ForgotState,
  formData: FormData,
): Promise<ForgotState> {
  const parsed = schema.safeParse({ email: formData.get('email') });
  if (!parsed.success) {
    return {
      sent: false,
      fieldErrors: { email: parsed.error.issues[0]?.message ?? 'Enter a valid email' },
    };
  }

  const supabase = await createSupabaseServerClient();
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback?next=/reset-password`,
  });

  // Always return success — anti-enumeration. Supabase silently no-ops on unknown emails.
  return { sent: true, fieldErrors: {} };
}
