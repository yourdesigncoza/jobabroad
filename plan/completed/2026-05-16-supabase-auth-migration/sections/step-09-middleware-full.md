---
step: 09
title: middleware.ts — full redirects + email_confirmed_at gate
status: done
depends-on: [04, 05, 06, 07, 08]
module: middleware
---

# Step 09 — Root middleware (full)

## Objective

Single root `middleware.ts` that:
1. Refreshes the Supabase session on every request (so cookies stay fresh on long sessions).
2. Redirects unauthenticated requests to `/dashboard` and `/members/*` → `/login?next=...`.
3. Redirects authenticated-but-unconfirmed users on those routes → `/auth/confirm-email`.
4. Redirects authenticated users hitting `/login`, `/register`, `/forgot-password` → `/dashboard`.

## Architecture context

- Before this step, no root `middleware.ts` exists. Each page calls `requireSession` / `requireProfile` (Step 07's helpers) for defence-in-depth — keep that even after middleware is in place.
- `@supabase/ssr` provides a middleware pattern: instantiate the server client with adapter-pattern cookies that read from `request.cookies` and write to `response.cookies`. Per `AGENTS.md`, verify the exact API in `node_modules/@supabase/ssr/dist/` and `node_modules/next/dist/docs/` before writing.

## Files to create

### `middleware.ts` (at repo root, NOT inside `app/`)

```ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const AUTH_REQUIRED = [/^\/dashboard(\/|$)/, /^\/members\//];
const AUTH_FORBIDDEN_IF_SIGNED_IN = [/^\/login(\/|$)/, /^\/register(\/|$)/, /^\/forgot-password(\/|$)/];

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // CRITICAL: getUser() — not getSession() — for trusted user data.
  const { data: { user } } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;
  const isAuthRequired = AUTH_REQUIRED.some((re) => re.test(path));
  const isAuthForbidden = AUTH_FORBIDDEN_IF_SIGNED_IN.some((re) => re.test(path));

  if (isAuthRequired && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', path);
    return NextResponse.redirect(url);
  }

  if (isAuthRequired && user && !user.email_confirmed_at) {
    const url = request.nextUrl.clone();
    url.pathname = '/auth/confirm-email';
    url.search = '';
    return NextResponse.redirect(url);
  }

  if (isAuthForbidden && user && user.email_confirmed_at) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    url.search = '';
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    // Run on all paths except static assets and Next internals.
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:png|jpg|jpeg|svg|webp|ico|css|js|woff2?)$).*)',
  ],
};
```

## Files to modify

- Each page-level guard (Step 07's `requireSession` / `requireProfile`) STAYS — middleware can be misconfigured and we want defence-in-depth.

## Pattern context

- Always use `getUser()`, never `getSession()` (the latter trusts the cookie without round-trip to Supabase).
- The matcher excludes `_next/*`, static assets, and the standard SEO files. Add other excludes if found (e.g. `/api/*` is included by default — be sure those routes self-validate; the existing `app/api/admin/generate-token/route.ts` will be deleted in Step 12 so that's moot).
- Cookie write pattern in middleware is fiddly — both `request.cookies.set(...)` AND `response.cookies.set(...)` are required; this is the pattern shown in `@supabase/ssr` docs.

## Risk context

- **R3 (Next.js 16 cookie API):** verify against `node_modules/next/dist/docs/` and `node_modules/@supabase/ssr/dist/` — APIs may have shifted from 15.x.
- **R5 (email_confirmed_at gate):** if this check is dropped, unconfirmed users gain access. The explicit `&& !user.email_confirmed_at` line is the linchpin — do NOT remove.
- API routes are included in the matcher. If you add new API routes in future, they must self-validate via `createSupabaseServerClient().auth.getUser()` (defence-in-depth). The existing `/api/rag/*`, `/api/assessments/*`, `/api/demo/*` continue to work because they don't need auth (they're either public or use service-role).
- The `getUser()` call on every request adds a small Supabase round-trip. Acceptable for this app's traffic; revisit if measurable latency hits.

## Gemini-noted considerations

- Middleware checks `email_confirmed_at` (Gemini blind spot, incorporated): central enforcement instead of relying on every page to remember.
- Per-page guards stay alongside middleware (Gemini's defence-in-depth note).

## Done when

- `middleware.ts` exists at repo root.
- Unsigned-in user → `/dashboard` → redirected to `/login?next=/dashboard`.
- Unsigned-in user → `/members/healthcare` → redirected to `/login?next=/members/healthcare`.
- Signed-in unconfirmed user → `/dashboard` → redirected to `/auth/confirm-email`.
- Signed-in confirmed user → `/login` → redirected to `/dashboard`.
- Signed-in confirmed user → `/register` → redirected to `/dashboard`.
- Public routes (`/`, `/recruiters`, `/scam-warnings`, `/auth/callback`) work for everyone.
- `npm run lint` + `npm run build` pass.
- Local browser test: full flow works without infinite-redirect loops.
