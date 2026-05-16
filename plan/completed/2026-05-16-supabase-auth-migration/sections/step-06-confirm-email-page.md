---
step: 06
title: /auth/confirm-email page + resend button
status: done
depends-on: [05]
module: app/auth
---

# Step 06 — /auth/confirm-email + resend button

## Objective

Standalone "check your inbox" page shown to users in the unconfirmed-email state. Includes a "Resend confirmation email" button that calls `supabase.auth.resend()`. This is the page middleware (Step 09) redirects unconfirmed users to.

## Architecture context

- Users land here in three scenarios:
  1. Immediately after a successful `/register` submission (via `redirect('/auth/confirm-email')` from Step 04).
  2. Redirected by middleware (Step 09) if they have a session but `email_confirmed_at === null`.
  3. Direct navigation (e.g. reopening the tab later).
- We can read the user's email from the session if they have one. If not (scenario 3 with no session), show a generic message and a link to `/login`.

## Files to create

### `app/auth/confirm-email/page.tsx`

Server component reads the session, passes email + signed-in flag to the client component.

```tsx
import { createSupabaseServerClient } from '@/lib/supabase/server';
import ConfirmEmailClient from './ConfirmEmailClient';

export default async function ConfirmEmailPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user?.email_confirmed_at) {
    // Already confirmed — bounce to dashboard
    const { redirect } = await import('next/navigation');
    redirect('/dashboard');
  }
  return <ConfirmEmailClient email={user?.email ?? null} />;
}
```

### `app/auth/confirm-email/ConfirmEmailClient.tsx`

```tsx
'use client';

import { useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export default function ConfirmEmailClient({ email }: { email: string | null }) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleResend() {
    if (!email) return;
    setStatus('sending');
    setErrorMsg(null);
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.resend({ type: 'signup', email });
    if (error) {
      setStatus('error');
      setErrorMsg(error.message);
    } else {
      setStatus('sent');
    }
  }

  // Render heading "Confirm your email", body with the email address, Resend button,
  // status feedback, link back to /login.
}
```

## Files to modify

None in this step.

## Pattern context

- Brand colours inlined. Layout consistent with `/login`, `/register` (centered card on `#F8F5F0` background).
- The "Resend" button is rate-limited by Supabase Auth (default: 60s between sends for the same email) — surface that error message cleanly if it triggers.
- If `email === null` (scenario 3 with no session), hide the Resend button and show: "Check the inbox you used when registering. If you can't find the email, please log in and we'll resend it."

## Risk context

- The bounce-to-dashboard guard (`if (user?.email_confirmed_at) redirect('/dashboard')`) prevents a confused state where a confirmed user lands here and sees a Resend button for an already-confirmed email.
- The `resend` call uses the **browser** client deliberately — it has the user's session and doesn't need service-role privileges. Don't call this from a server action that bypasses the client; we want the session context.

## Gemini-noted considerations

- Dedicated `/auth/confirm-email` page (Gemini new idea, incorporated): central place for the unconfirmed state instead of a generic 403 or login redirect.
- Resend button via `supabase.auth.resend()` (Gemini new idea, incorporated): improves UX for users who lost the original email.

## Done when

- `/auth/confirm-email` renders with the user's email (if signed in but unconfirmed) and a working Resend button.
- Confirmed user hitting this URL is bounced to `/dashboard`.
- Unsigned-in user hitting this URL sees a generic message + login link, no Resend button.
- Resend success shows "Confirmation email sent — check your inbox."
- Resend rate-limit error surfaces the underlying message.
- `npm run lint` + `npm run build` pass.
