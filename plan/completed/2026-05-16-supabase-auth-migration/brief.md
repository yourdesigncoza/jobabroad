---
slug: supabase-auth-migration
created: 2026-05-16
status: built
---

# Brief — Supabase Auth migration

## Original instruction

> Replace the WhatsApp-token onboarding flow with a standard Supabase Auth (email + password) registration & login system. Free single-category access after email-verified registration. Keep all WhatsApp buttons as communication-only. Pre-launch, so no user migration needed.

## Evaluation

| Dimension | Status | Notes |
|---|---|---|
| Scope | ✅ | Auth migration + onboarding-model pivot. Touches lib, app routes, components, supabase migrations. |
| Module | ✅ | `app/`, `lib/`, `components/`, `supabase/migrations/`, root `middleware.ts`, `tests/`. |
| Done condition | ✅ | Verifiable: register → email confirm → login → dashboard → category guide → assessment → logout. Old `/admin` + `/members/[token]` retired. |
| Constraints | ✅ | Next.js 16 (breaking — check `node_modules/next/dist/docs/`), Tailwind v4, `@supabase/ssr` already in deps, RLS, SA phone format, no Claude attribution, all external links new-tab. |
| Scale | ✅ | Cross-cutting (~14 steps), but each step is atomic; full plan replaces onboarding without ripping out content/assessment code. |

All ✅ — proceeding without clarification.

## Clarified requirement

Replace the existing token-link onboarding with Supabase Auth email+password registration. A registered user is **locked to one category at signup** (immutable from UI); the chosen category's pathway guide + assessment + recruiters + scam-warnings become freely accessible after they click an emailed confirmation link.

`/admin` and `member_tokens`/`leads` tables are deleted entirely (no migration — pre-launch). WhatsApp comms buttons stay everywhere as a parallel support channel; only the *onboarding* role of WhatsApp is removed. R199/PayShap pricing copy is stripped from landing-page surfaces.

Future paywall for a 15-min private call after assessment completion is **out of scope** for this plan.

## Acceptance criteria

1. New user can submit `/register` (name + email + SA phone + password + single-category radio) and receive a confirmation email.
2. Unconfirmed user attempting `/dashboard` or `/members/*` is redirected to `/auth/confirm-email` (with a "Resend email" button that works).
3. Confirmed user can log in at `/login`, lands on `/dashboard`, sees their category, and can click through to `/members/[their-category]` and the assessment.
4. Confirmed user trying `/members/[other-category]` gets a 403 with locked-category message and a link back to their dashboard.
5. `/forgot-password` triggers a recovery email; `/reset-password` (via callback) accepts a new password.
6. SA phone numbers in `0XXXXXXXXX`, `27XXXXXXXXX`, `+27XXXXXXXXX` formats all accept; everything stores normalised as `27XXXXXXXXX`.
7. Duplicate email, weak password, and invalid phone surface specific error messages on the `/register` form.
8. `/admin`, `app/api/admin/generate-token/route.ts`, `lib/admin-auth.ts`, `ADMIN_SECRET` env reference, `member_tokens`, and `leads` tables no longer exist.
9. `lib/whatsapp-templates.ts` still exists with a header comment marking it as future-use only.
10. Landing page (`app/page.tsx`, `StatStrip`, `HowItWorks`, `FAQ`, `lib/site.ts`) contains zero references to R199 or PayShap; CTAs route to `/register?category=X` instead of WhatsApp pre-fill.
11. `SiteNav` + `MobileNav` show Login/Register when signed out and Dashboard/Logout when signed in.
12. WhatsApp comms buttons in header, footer, `StickyNav`, and "coming soon" sections still work.
13. Playwright `tests/auth-flow.spec.ts` exercises the full register → confirm → login → dashboard → guide → assessment → category-mismatch → logout → login flow and passes.

## Out of scope

- LLM summary of assessment + bottlenecks
- Paywall for 15-min private call
- Email-provider swap (Resend/Postmark) — Supabase Auth's built-in sender stays
- WhatsApp template re-use for post-registration nurture (keeping the file, no new wiring)
- Real-time presence, social logins, MFA
- Migration of legacy `member_tokens` (none exist)
