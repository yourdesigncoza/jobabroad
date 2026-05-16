---
step: 01
title: Supabase SSR client wrappers
status: done
depends-on: []
module: lib
---

# Step 01 — Supabase SSR client wrappers

## Objective

Provide cookie-aware Supabase clients for server components, server actions, route handlers, and browser code. No behaviour change yet — these wrappers are dormant until later steps import them.

## Architecture context

- `@supabase/ssr@^0.10.2` already in `package.json`.
- `@supabase/supabase-js@^2.105.1` already in `package.json`.
- Existing API routes (`app/api/admin/generate-token/route.ts`, `app/api/rag/*`, `app/api/assessments/*`) use `createClient(URL, SERVICE_ROLE)` directly from `@supabase/supabase-js`. Do NOT touch those in this step — they keep working.
- New wrappers go in `lib/supabase/` alongside other lib utilities.

## Files to create

### `lib/supabase/server.ts`

Export `createSupabaseServerClient()` for use in server components, server actions, and route handlers. Use `@supabase/ssr`'s `createServerClient` with `cookies()` from `next/headers`.

```ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a server component — middleware will handle the refresh.
          }
        },
      },
    }
  );
}
```

### `lib/supabase/client.ts`

Export `createSupabaseBrowserClient()` for client components (registration form needs it for resend, password-reset form needs it for redirect callback handling).

```ts
'use client';

import { createBrowserClient } from '@supabase/ssr';

export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

### `lib/supabase/service.ts`

Service-role client for trigger/RLS-bypass server work. Keep separate from `server.ts` to make the privilege escalation explicit.

```ts
import { createClient } from '@supabase/supabase-js';

export function createSupabaseServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}
```

## Files to modify

None.

## Pattern context

- Next.js 16 App Router: `cookies()` returns a Promise — must be `await`ed. Per `AGENTS.md`, verify this against `node_modules/next/dist/docs/` before writing. If the API has changed in 16, follow the docs.
- `botid` is already integrated in `app/page.tsx` for the WhatsApp form; we'll need it on `/register` too (Step 04), but not here.

## Risk context

- These wrappers are dormant until imported. Shipping this step alone is safe (no behaviour change).
- Cookie API mismatch with Next.js 16 is the only realistic failure mode — verify the docs path first.

## Gemini-noted considerations

- Defence-in-depth: API routes (post-migration) should call `createSupabaseServerClient()` and validate the session themselves rather than trusting middleware. The wrappers must be safe to call from route handlers.

## Done when

- `lib/supabase/server.ts`, `lib/supabase/client.ts`, `lib/supabase/service.ts` exist and compile (`npm run build` succeeds).
- No file imports them yet (verified with `grep -r "from '@/lib/supabase" --include='*.ts' --include='*.tsx'`).
- `npm run lint` passes.
