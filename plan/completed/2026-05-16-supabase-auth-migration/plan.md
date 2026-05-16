---
slug: supabase-auth-migration
created: 2026-05-16
status: built
brief: brief.md
---

# Plan — Supabase Auth migration

## Context

Replace the WhatsApp-token onboarding (admin-issued UUID member links) with a self-serve Supabase Auth email+password registration. One category locked at signup; access free after email confirm. Pre-launch — drop `member_tokens` and `leads` tables outright. Keep WhatsApp comms buttons everywhere; strip R199/PayShap copy from landing.

Architecture model is documented in `brief.md`. Locked decisions and Gemini-reviewed details are baked into each section file — do not re-debate.

## Affected scope

| Layer | Files |
|---|---|
| **DB migrations** | `supabase/migrations/20260516_profiles_and_auth.sql` (new), `supabase/migrations/20260516_drop_legacy_onboarding.sql` (new) |
| **Lib** | `lib/supabase/server.ts` (new), `lib/supabase/client.ts` (new), `lib/phone.ts` (new) |
| **Middleware** | `middleware.ts` (new at repo root) |
| **App routes (new)** | `app/register/page.tsx` + `actions.ts`, `app/login/page.tsx` + `actions.ts`, `app/logout/route.ts`, `app/forgot-password/page.tsx`, `app/reset-password/page.tsx`, `app/auth/callback/route.ts`, `app/auth/confirm-email/page.tsx`, `app/dashboard/page.tsx` |
| **App routes (rename)** | `app/members/[token]/page.tsx` → `app/members/[category]/page.tsx`, `app/members/[token]/assessment/page.tsx` → `app/members/[category]/assessment/page.tsx` |
| **App routes (delete)** | `app/admin/page.tsx`, `app/api/admin/generate-token/route.ts`, `lib/admin-auth.ts` |
| **Components — copy edits** | `app/page.tsx`, `components/StatStrip.tsx`, `components/HowItWorks.tsx`, `components/FAQ.tsx`, `lib/site.ts`, `components/SiteFooter.tsx` |
| **Components — behaviour** | `components/CategoryCard.tsx` (route → `/register?category=X`), `components/SiteNav.tsx`, `components/MobileNav.tsx` (add Login/Register/Dashboard) |
| **Templates marked deprecated** | `lib/whatsapp-templates.ts` (keep file, add header comment) |
| **Env** | Drop `ADMIN_SECRET` (from `CLAUDE.md` + `.env.example`) |
| **Tests** | `tests/auth-flow.spec.ts` (new), `tests/member-page.spec.ts` (update for new route) |

## Steps overview

| # | Title | Module | Depends on |
|---|---|---|---|
| 01 | Supabase SSR client wrappers | lib | — |
| 02 | SA phone validator (`lib/phone.ts`) | lib | — |
| 03 | Profiles migration + `handle_new_user` trigger + RLS | db | — |
| 04 | `/register` page + server action with error UX | app/auth | 01, 02, 03 |
| 05 | `/login`, `/logout`, `/forgot-password`, `/reset-password`, `/auth/callback` | app/auth | 01, 03 |
| 06 | `/auth/confirm-email` page + resend button | app/auth | 05 |
| 07 | Rename `/members/[token]` → `/members/[category]` + per-page session gate | app/members | 01, 03 |
| 08 | `/dashboard` page with graceful null-profile handling | app/dashboard | 01, 03, 07 |
| 09 | `middleware.ts` — full redirects + email_confirmed_at gate | middleware | 04, 05, 06, 07, 08 |
| 10 | Supabase Auth dashboard config (manual checklist) | ops | 03 |
| 11 | Landing copy strip + CategoryCard reroute + nav additions | components | 04 |
| 12 | Retire `/admin` + `ADMIN_SECRET` + mark `whatsapp-templates.ts` deprecated | cleanup | 09 |
| 13 | Drop legacy tables migration (`member_tokens`, `leads`) | db | 12 |
| 14 | Playwright `tests/auth-flow.spec.ts` + update `member-page.spec.ts` | tests | 11, 13 |

## Dependency graph

```
01 ─┬─► 04 ─┬─► 09 ─► 12 ─► 13 ─► 14
    │      │              ▲
02 ─┘      │              │
           ├─► 11 ────────┘
03 ─┬─► 04 ┘
    ├─► 05 ─► 06 ─► 09
    ├─► 07 ─► 08 ─► 09
    └─► 10
```

## Risks

| # | Risk | Mitigation |
|---|---|---|
| R1 | Race: user lands on `/dashboard` post-confirm before trigger creates `profiles` row | Step 08 handles null-profile gracefully (skeleton + retry) |
| R2 | Trigger fails silently if `raw_user_meta_data` JSON keys missing | Step 03 trigger uses explicit `->>` extraction with `coalesce` + raises exception on missing critical fields |
| R3 | Middleware cookie handling differs in Next.js 16 vs prior versions | Step 04 instructs reading `node_modules/next/dist/docs/` before writing — per `AGENTS.md` |
| R4 | `member_tokens.token` column referenced by stale Playwright test | Step 14 explicitly updates `tests/member-page.spec.ts` |
| R5 | Email-confirmation gate accidentally bypassed if middleware checks only session existence | Step 09 explicitly checks `user.email_confirmed_at !== null` |
| R6 | Phone UNIQUE constraint trips on legitimate household sharing | Accepted — household sharing is rare and we want one-account-per-phone for the future paid tier |
| R7 | `botid` package collides with new register form | Step 04 notes existing botid usage in `app/page.tsx`; reuse same pattern |

## Out of scope

See `brief.md` § Out of scope. Future phases (LLM summary, paid call) will be separate plans.
