# Jobabroad — TODO backlog

Working list we tackle one item at a time. Each item: status checkbox, who owns
it, the context, and a clear "done when". Tick the box and move it to **Done**
once complete.

_Last updated: 2026-06-02._

---

## Open

_Nothing open. 🎉_

---

## Done

- ✅ **2026-06-02 — Admin funnel dashboard** (`/admin/funnel`). Conversion funnel
  (registered→confirmed→started→submitted→paid→booked), raw-numbers snapshot, and
  signups-by-category — live from `lib/admin/funnel-metrics.ts`. Replaces ad-hoc
  DB queries; first move from `docs/strategic-assessment.md` (action C). Playwright
  spec `tests/admin-funnel.spec.ts` (gates + dashboard) green.
- ✅ **2026-06-02 — Admin notification on new-user email confirmation.** When a
  newly-registered user confirms their email, `/auth/callback` fires
  `notifyAdminOfNewUser` (background `waitUntil`) → branded email to
  `ADMIN_EMAILS` with name/category/email/WhatsApp + reply-to set to the user.
  Gated off the password-reset path; idempotent via `profiles.admin_notified_at`
  (migration `20260602_profiles_admin_notified_at.sql`, applied to live DB).
  Verified: `scripts/test-new-user-notify.ts --live` — all 7 checks pass, real
  email delivered.
- ✅ **2026-06-02 — Live-rendered QA PDFs for the changed rubrics.** Spot-checked
  au-pair, tefl, trades end-to-end (real scoring + corpus + OpenAI + PDF). All
  three cap correctly to **needs prep** despite strong weighted scores:
  au-pair 92/100 (own-children numeric cap), tefl 73/100 (no-degree + no-cert —
  both gates render, heading pluralises to "CRITICAL GATES"), trades 75/100
  (Red Seal cap + cash-in-hand discounts Experience to 73, not 100). Gate
  callout + red dimension bars render on the PDF cover as expected. Added a DRY
  parameterised runner `scripts/render-rubric-live.ts` (generalises the per-
  vertical `render-*-live.ts` pattern); run via
  `NODE_OPTIONS="--require ./scripts/shim-server-only.cjs" npx tsx scripts/render-rubric-live.ts --category=<cat>`.
- ✅ **2026-06-02 — Vercel "deployment failed" email resolved.** Confirmed
  stale/other-scope — all projects green, site serving 200. No real failure.
- ✅ **2026-06-02 — Dropped `paid_reports.call_notes` from the live DB.**
  Ran `alter table paid_reports drop column if exists call_notes;` in the Supabase
  SQL editor ("Success. No rows returned"). Column gone; code references were
  already removed. Migration `supabase/migrations/20260601_drop_paid_reports_call_notes.sql`
  now reflects live state.
- ✅ **2026-06-02 — Refreshed stale J-1 SWT date in seasonal guide.**
  `content/pathways/seasonal.md` no longer cites the past 2025 season as upcoming;
  now points to the 2027 season window (2026 already closed, participants on
  placement). Re-ran `npm run reindex -- --category=seasonal` (404/404 chunks).
- ✅ **2026-06-02 — All 11 scoring rubrics domain-reviewed** (healthcare,
  accounting, engineering, it-tech, trades, teaching, tefl, hospitality, farming,
  seasonal, au-pair). Engine gained band-capping (`when_value` + `when_min`) and
  multi-field `best_match` (`field_ids`). Each committed individually to `main`.
