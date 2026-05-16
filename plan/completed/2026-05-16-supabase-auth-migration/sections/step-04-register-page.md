---
step: 04
title: /register page + server action with error UX
status: done
depends-on: [01, 02, 03]
module: app/auth
---

# Step 04 — /register page + server action

## Objective

Public registration form: name, email, SA phone, password, single-category radio. Pre-selects category from `?category=X`. Calls `supabase.auth.signUp` with `options.data = {name, phone, category}` so the trigger (Step 03) creates the profile. On success: redirects to `/auth/confirm-email`. On failure: surfaces specific errors inline.

## Architecture context

- 11 categories in `lib/categories.ts` (`CATEGORIES` array of `{id, label, ...}`).
- Brand tokens (colours, fonts) inlined as `style={}` props throughout — no Tailwind theme extension. See `app/page.tsx` for the established pattern: dark green `#1B4D3E`, charcoal `#2C2C2C`, gold `#C9A84C`, orange `#ff751f`, off-white `#EDE8E0`.
- `botid@^1.5.11` is integrated on the WhatsApp form in `app/page.tsx`. Re-use the same pattern on the register form (check `app/page.tsx` for the call shape).
- `zod` for validation; `saPhoneSchema` from `lib/phone.ts` (Step 02).

## Files to create

### `app/register/page.tsx`

Server component (no `'use client'`). Receives `searchParams` for `?category=X`. Renders the form (a client component) with that prefill.

```tsx
import { CATEGORIES } from '@/lib/categories';
import RegisterForm from './RegisterForm';

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const params = await searchParams;
  const preselect =
    params.category && CATEGORIES.some((c) => c.id === params.category)
      ? params.category
      : null;
  return <RegisterForm preselect={preselect} categories={CATEGORIES} />;
}
```

### `app/register/RegisterForm.tsx`

Client component. Form with five fields. Uses `useFormState` + `useFormStatus` to surface errors. Submits to the server action.

```tsx
'use client';

import { useActionState } from 'react';
import { register, type RegisterState } from './actions';
import type { Category } from '@/lib/categories';

const initial: RegisterState = { ok: false, fieldErrors: {} };

export default function RegisterForm({
  preselect,
  categories,
}: {
  preselect: string | null;
  categories: Category[];
}) {
  const [state, action] = useActionState(register, initial);
  // … form JSX with name, email, phone, password, category radio group ⋯
  // Show state.fieldErrors.email, .phone, .password, .category, .name, ._form (top-level)
}
```

### `app/register/actions.ts`

```ts
'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { CATEGORIES } from '@/lib/categories';
import { saPhoneSchema } from '@/lib/phone';

const schema = z.object({
  name: z.string().trim().min(2, 'Enter your name'),
  email: z.string().trim().email('Enter a valid email'),
  phone: saPhoneSchema,
  password: z.string().min(8, 'At least 8 characters'),
  category: z.enum(CATEGORIES.map((c) => c.id) as [string, ...string[]]),
});

export type RegisterState = {
  ok: boolean;
  fieldErrors: Partial<Record<'name' | 'email' | 'phone' | 'password' | 'category' | '_form', string>>;
};

export async function register(
  _prev: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const parsed = schema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    password: formData.get('password'),
    category: formData.get('category'),
  });
  if (!parsed.success) {
    const fe: RegisterState['fieldErrors'] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof RegisterState['fieldErrors'];
      fe[key] = issue.message;
    }
    return { ok: false, fieldErrors: fe };
  }

  const { name, email, phone, password, category } = parsed.data;
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`,
      data: { name, phone, category },
    },
  });

  if (error) {
    // Map common Supabase Auth errors to field-level messages.
    const msg = error.message.toLowerCase();
    if (msg.includes('already') || msg.includes('registered')) {
      return { ok: false, fieldErrors: { email: 'That email is already registered. Try logging in.' } };
    }
    if (msg.includes('password')) {
      return { ok: false, fieldErrors: { password: error.message } };
    }
    if (msg.includes('phone') || msg.includes('duplicate key') && msg.includes('phone')) {
      return { ok: false, fieldErrors: { phone: 'That phone number is already registered.' } };
    }
    return { ok: false, fieldErrors: { _form: error.message } };
  }

  redirect('/auth/confirm-email');
}
```

## Files to modify

None.

## Pattern context

- `CATEGORIES` ids include `remote-work` — but `remote-work` is **deferred** (per memory `project_remote_work_deferred.md`). Exclude it from the radio options here. Hard-code an exclude list rather than mutating the source array:
  ```ts
  const REGISTRABLE = CATEGORIES.filter((c) => c.id !== 'remote-work');
  ```
- External links rule does not apply here — registration is internal.
- Brand colours inlined; reuse exact hex values from `app/page.tsx`.
- Form copy: keep voice anonymous ("we") per memory `project_automation_objective`.

## Risk context

- `redirect()` inside a server action throws a special Next.js error — DO NOT wrap the `signUp` call in a try/catch that swallows it.
- `botid` integration: confirm whether registration needs bot protection (likely yes — this is a public form). Look at `app/page.tsx` for the existing pattern and replicate.
- Email confirmation gate must be enabled in Supabase dashboard (Step 10) for the redirect to `/auth/confirm-email` to make sense. If it's disabled, `signUp` returns a session immediately and we should still send the user to a "check your inbox" page or directly to `/dashboard`.

## Gemini-noted considerations

- All three error categories (duplicate-email, weak-password, invalid-phone) surface as field-level errors — Gemini flagged silent failure as a blind spot.
- Pre-select via `?category=X` reduces friction — Gemini agreed.
- Server action talks to Supabase Auth via the SSR client (not service-role) so the user's session cookie is set by the response.

## Done when

- `/register` renders with all 5 fields and 10 category options (excluding `remote-work`).
- `?category=healthcare` pre-selects the healthcare radio.
- Submitting empty form shows per-field errors inline.
- Submitting valid form creates an `auth.users` row + `profiles` row (verify in dashboard), sends a confirmation email, redirects to `/auth/confirm-email`.
- Submitting same email twice surfaces "already registered" under the email field.
- Submitting an invalid phone surfaces validator message under the phone field.
- `npm run lint` + `npm run build` pass.
