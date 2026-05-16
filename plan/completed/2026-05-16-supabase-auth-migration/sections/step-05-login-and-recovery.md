---
step: 05
title: Login / logout / forgot-password / reset-password / auth-callback
status: done
depends-on: [01, 03]
module: app/auth
---

# Step 05 — Login + logout + password recovery + auth callback

## Objective

All non-register auth routes: login form, logout endpoint, forgot-password form (triggers Supabase recovery email), reset-password form (consumes the recovery callback), and the `/auth/callback` route handler that processes email-confirmation + recovery tokens.

## Architecture context

- `lib/supabase/server.ts` from Step 01 provides the cookie-aware client.
- Brand tokens inlined; reuse the form styling pattern from Step 04 `RegisterForm.tsx`.
- All routes are public (no auth required to reach them) but `/login` should redirect to `/dashboard` if a session is already active.

## Files to create

### `app/login/page.tsx` + `app/login/LoginForm.tsx` + `app/login/actions.ts`

Server component renders `<LoginForm />`. Server action:

```ts
'use server';
import { z } from 'zod';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';

const schema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

export type LoginState = { ok: boolean; fieldErrors: { email?: string; password?: string; _form?: string } };

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = schema.safeParse({ email: formData.get('email'), password: formData.get('password') });
  if (!parsed.success) {
    const fe: LoginState['fieldErrors'] = {};
    for (const i of parsed.error.issues) (fe as Record<string, string>)[i.path[0] as string] = i.message;
    return { ok: false, fieldErrors: fe };
  }
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    const msg = error.message.toLowerCase();
    if (msg.includes('invalid') || msg.includes('credentials')) {
      return { ok: false, fieldErrors: { _form: 'Email or password is incorrect.' } };
    }
    if (msg.includes('confirm')) {
      return { ok: false, fieldErrors: { _form: 'Please confirm your email first. Check your inbox.' } };
    }
    return { ok: false, fieldErrors: { _form: error.message } };
  }
  redirect('/dashboard');
}
```

Server component variant should check session and redirect to `/dashboard` if already signed in:
```tsx
const supabase = await createSupabaseServerClient();
const { data: { user } } = await supabase.auth.getUser();
if (user) redirect('/dashboard');
```

### `app/logout/route.ts`

```ts
import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function POST() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_BASE_URL!), { status: 303 });
}
```

Logout via form POST in `SiteNav` / `MobileNav` (Step 11 wires the button).

### `app/forgot-password/page.tsx` + `app/forgot-password/actions.ts`

Server action calls `supabase.auth.resetPasswordForEmail(email, { redirectTo: `${BASE_URL}/auth/callback?next=/reset-password` })`. Always shows the same success message regardless of whether the email exists (anti-enumeration).

### `app/reset-password/page.tsx` + `app/reset-password/ResetForm.tsx` + `app/reset-password/actions.ts`

User arrives here from the `/auth/callback` redirect after clicking the recovery link. They should already have a session (set by the callback). The form takes a new password, calls `supabase.auth.updateUser({ password })`, redirects to `/dashboard` on success.

### `app/auth/callback/route.ts`

Handles both email-confirmation and password-recovery callbacks.

```ts
import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const next = url.searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(next, process.env.NEXT_PUBLIC_BASE_URL!));
    }
  }
  return NextResponse.redirect(new URL('/login?error=callback', process.env.NEXT_PUBLIC_BASE_URL!));
}
```

## Files to modify

None.

## Pattern context

- Always use `supabase.auth.getUser()` not `getSession()` when validating server-side (per Supabase docs — `getSession()` reads from cookies without round-trip and is spoofable).
- All redirect URLs built from `NEXT_PUBLIC_BASE_URL` so dev (`http://localhost:3000`) and prod (`https://jobabroad.co.za`) both work.
- The `/auth/callback?next=/reset-password` pattern lets one route handler serve both email-confirm (defaults to `/dashboard`) and recovery (overrides via `next`).

## Risk context

- Forgot-password anti-enumeration: never reveal whether the email exists. Always show "If that email is registered, we've sent a recovery link." Supabase Auth itself silently no-ops on unknown emails, but the success message must be unconditional.
- Recovery flow requires the user's session to be set by `exchangeCodeForSession` BEFORE they hit `/reset-password`. If the callback fails, `/reset-password` will refuse the password update because no user is signed in — the form should handle that (`supabase.auth.getUser()` returns null → show "Recovery link expired, request a new one").
- `signInWithPassword` automatically rejects unconfirmed users with a specific error message — we map that to a friendly "please confirm" hint.

## Gemini-noted considerations

- Specific error UX (Gemini blind spot): wrong-password vs unconfirmed-email surface different messages.
- Defence-in-depth: server actions re-validate session server-side, not just trust middleware.

## Done when

- `/login` with valid creds redirects to `/dashboard`.
- `/login` already-signed-in redirects to `/dashboard`.
- `/login` with wrong password shows "Email or password is incorrect."
- `/login` with unconfirmed account shows "Please confirm your email first."
- POST `/logout` clears the session and redirects to `/`.
- `/forgot-password` always shows "if registered, link sent" success message.
- Clicking the recovery link in email lands the user on `/reset-password` with a valid session; submitting a new password works and signs them in.
- `npm run lint` + `npm run build` pass.
