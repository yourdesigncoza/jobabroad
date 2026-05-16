---
slug: supabase-auth-migration
created: 2026-05-16
git-hash-at-plan: eb1d7b510a8069341e2db1da2c729e9152ee8b71
total-steps: 14
---

# Progress — Supabase Auth migration

## Status

| # | Title | Status | Depends on | Section file |
|---|---|---|---|---|
| 01 | Supabase SSR client wrappers | done | — | [step-01-supabase-ssr-wrappers.md](sections/step-01-supabase-ssr-wrappers.md) |
| 02 | SA phone validator | done | — | [step-02-phone-validator.md](sections/step-02-phone-validator.md) |
| 03 | Profiles migration + trigger + RLS | done | — | [step-03-profiles-migration.md](sections/step-03-profiles-migration.md) |
| 04 | /register page + server action | done | 01, 02, 03 | [step-04-register-page.md](sections/step-04-register-page.md) |
| 05 | Login / logout / forgot / reset / callback | done | 01, 03 | [step-05-login-and-recovery.md](sections/step-05-login-and-recovery.md) |
| 06 | /auth/confirm-email + resend | done | 05 | [step-06-confirm-email-page.md](sections/step-06-confirm-email-page.md) |
| 07 | Rename /members/[token] → /members/[category] | done | 01, 03 | [step-07-members-rename-gate.md](sections/step-07-members-rename-gate.md) |
| 08 | /dashboard page | done | 01, 03, 07 | [step-08-dashboard.md](sections/step-08-dashboard.md) |
| 09 | middleware.ts full redirects + email_confirmed_at gate | done | 04, 05, 06, 07, 08 | [step-09-middleware-full.md](sections/step-09-middleware-full.md) |
| 10 | Supabase Auth dashboard config (manual) | done | 03 | [step-10-supabase-auth-config.md](sections/step-10-supabase-auth-config.md) |
| 11 | Landing copy strip + CategoryCard + Nav | done | 04 | [step-11-landing-and-nav.md](sections/step-11-landing-and-nav.md) |
| 12 | Retire /admin + ADMIN_SECRET + mark whatsapp-templates | done | 09 | [step-12-retire-admin.md](sections/step-12-retire-admin.md) |
| 13 | Drop legacy tables migration | done | 12 | [step-13-drop-legacy-tables.md](sections/step-13-drop-legacy-tables.md) |
| 14 | Playwright auth-flow.spec.ts + update member-page.spec.ts | done | 11, 13 | [step-14-playwright.md](sections/step-14-playwright.md) |

## Completion log

| # | Date | Notes |
|---|---|---|
| 01 | 2026-05-16 | Added lib/supabase/{server,client,service}.ts — build + lint pass, no imports yet |
| 02 | 2026-05-16 | Added lib/phone.ts (normaliseSaPhone, isSaPhone, formatSaPhoneDisplay, saPhoneSchema) — all accept/reject assertions pass, build clean |
| 03 | 2026-05-16 | Wrote supabase/migrations/20260516_profiles_and_auth.sql; user applied via dashboard SQL editor; verify block confirmed (missing-metadata raise, successful insert, profile row present, cleanup OK) |
| 04 | 2026-05-16 | Built app/register/{page,RegisterForm,actions}.tsx with useActionState + BotID; excludes 'other' (only registrable cats); Playwright verified: preselect from ?category, inline phone error from saPhoneSchema; build clean |
| 05 | 2026-05-16 | Built /login, /logout, /forgot-password, /reset-password, /auth/callback. Extracted components/auth/PasswordInput.tsx (show/hide toggle reused across register/login/reset). Playwright verified: login wrong-creds error, forgot-password generic anti-enumeration message, reset-password "link expired" branch when no session. Build clean. |
| 06 | 2026-05-16 | Built /auth/confirm-email (server page + ConfirmEmailClient). Already-confirmed users redirect to /dashboard. Unauth branch verified via Playwright (generic message + login link, no resend button). Resend uses browser client. Build clean. |
| 07 | 2026-05-16 | Renamed members/[token] → members/[category]. Built lib/auth-guards.ts (requireSession, requireProfile). Page checks session + profile.category match; mismatch shows 403 view with link to own guide. Sitemap comment updated. Smoke-tested: unauth → /login redirect, bad category → 404, assessment same. KNOWN FOLLOW-UP: PathwaySearch/AssessmentWizard/WikiNotePanel POST a "token" to /api/* endpoints that still resolve via member_tokens — those APIs need a session-auth refactor before step 13 drops the legacy tables. user.id is passed through as a placeholder identifier; runtime calls will fail until APIs are refactored. |
| 08 | 2026-05-16 | Built /dashboard with requireSession + profile fetch. Greets by name, shows category, 4-card grid (guide/assessment/recruiters/scam-warnings), POST /logout form, force-dynamic. Null-profile race handled with meta-refresh skeleton + WhatsApp fallback. Smoke-tested unauth → /login?next=/dashboard. |
| 09 | 2026-05-16 | Created proxy.ts (Next 16 convention, replaces deprecated middleware.ts). Combined admin basic-auth gate (to be removed in step 12) + Supabase session refresh + auth_required/auth_forbidden/email_confirmed_at routing. Uses getUser() for verified user data. Smoke-tested: /dashboard + /members/* → /login?next=, /login + /register + /auth/callback pass through, /admin → 401, public routes 200. |
| 10 | 2026-05-16 | User configured Supabase dashboard: Confirm email ON, redirect URLs + Site URL set, custom Confirm-signup + Reset-password templates saved. E2E smoke test via Playwright: registered laudes.michael+jb1778936148@gmail.com, confirmation email arrived with our custom body, clicked link → exchanged code → dashboard rendered "Hi Test Nurse" + Healthcare cards; logout cleared session; login round-trip worked. Side fixes: /auth/callback + /logout now use request.url origin (was hardcoding NEXT_PUBLIC_BASE_URL=production, which sent local-dev callbacks to jobabroad.co.za and 404'd). Round 2 (after user added /auth/callback path to redirect URLs allowlist): confirmed the email now contains redirect_to=https://jobabroad.co.za/auth/callback ✓. Set NEXT_PUBLIC_BASE_URL=http://localhost:3000 in .env.local so future local-dev signups email links pointing to localhost directly. Hit Supabase built-in SMTP rate limit on round-2 verify (expected; resets ~1h). All flow components proven across the two rounds. |
| 11 | 2026-05-16 | Stripped R199/PayShap copy from landing surfaces. CategoryCard now routes to /register?category=X&src= via next/link for 11 registrable cats; 'other' tile still opens wa.me (no pathway content). InterestGrid passes external flag. HowItWorks rewritten to register→confirm→log in flow; price pill says "Free / after registration". FAQ pricing Q replaced with "Is it really free?". AccessBadge stripped of PayShap reference card; lib/payshap.ts kept (still referenced by deprecated whatsapp-templates.ts) with a comment. SiteNav now async server component showing Log in/Register free (signed out) or Dashboard/Log out (signed in); WhatsApp button always present. SiteFooter "lost link" link swapped for /forgot-password. Smoke-test via Playwright: nav shows correct signed-out items; clicking Healthcare tile lands on /register?category=healthcare. Build clean. |
| 12 | 2026-05-16 | Deleted app/admin/, app/api/admin/, lib/admin-auth.ts. Dropped ADMIN_GATED block + isAdminAuthorized import from proxy.ts. Added deprecation header to lib/whatsapp-templates.ts. Stripped ADMIN_SECRET from CLAUDE.md env section, .env.local, .env.example. Verified /admin + /api/admin/generate-token both 404. REMINDER FOR USER: remove ADMIN_SECRET from Vercel project env vars after next deploy. |
| 13 | 2026-05-16 | Resolved the implicit API-refactor sub-step before the drop. Refactored /api/search, /api/search/answer, /api/wiki/[id], /api/assessment/save, /api/assessment/submit to session-auth (createSupabaseServerClient + getUser, profile lookup for category). Rewrote lib/assessments/assessment-client.ts to take userId (was memberTokenId). Updated PathwaySearch, WikiNotePanel, AssessmentWizard, AssessmentCTA, members/[category]/page.tsx, assessment/page.tsx to drop the token prop. Wrote 20260516_assessments_user_id.sql (truncate + swap member_token_id→user_id + RLS) and 20260516_drop_legacy_onboarding.sql (drop member_tokens, leads, cv_submissions). User applied both via dashboard. Verify query returned 0 rows. Playwright smoke: logged in as Test Nurse → /members/healthcare → "OSCE cost in NZ" search returned 6 results + RAG answer generating; no auth errors. Build clean. |
| 14 | 2026-05-16 | Added tests/helpers.ts (svc, uniqueEmail, uniquePhone, confirmUser, deleteUser, registerAndLogin). Wrote tests/auth-flow.spec.ts: happy path (login→dashboard→guide→403 mismatch→logout→re-login), form validation (preselect, invalid phone, wrong login creds, forgot-password anti-enumeration), gate checks (unauth → /login for /dashboard + /members/*, /members/bogus also gated since proxy intercepts before notFound), service-role smoke. Rewrote tests/member-page.spec.ts to use admin-seeded users instead of UUID tokens; covers article + TOC + search (results-or-no-match) + cap-at-6 + no-match-fallback + external-link rule + assessment-CTA per category. playwright.config.ts loads .env.local. NOTE: tests intentionally bypass live signUp (Supabase SMTP is rate-limited ~3-4/h); admin.createUser + form-based login is the test path. Final run: 31/31 pass. Leftover test users cleaned. |

## Next ready

All steps done. Plan ready to close.

## Skipped Gemini review note

Per user direction, Phase 4 (Gemini review) was completed *interactively* before plan-build:
- Plan was Gemini-reviewed in the building session; agreements + resolved disagreements + blind spots + new ideas were all incorporated into this plan.
- `review.md` is intentionally absent — equivalent content lives in the section files' "Risk context" and "Gemini-noted considerations" subsections.
- Skip directly to `/ydcoza-plan execute supabase-auth-migration` in a new Sonnet session.
