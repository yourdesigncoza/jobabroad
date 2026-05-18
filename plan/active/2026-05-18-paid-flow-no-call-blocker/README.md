# Paid flow: drop the call as a blocker

**Status:** Draft — concept agreed, needs refinement before build
**Date raised:** 2026-05-18

## The shift

Take the 15-min review call (currently a hard step between payment and the personalised report) and turn it into an **optional dashboard CTA**. Pay → report. Call whenever you want.

## Current vs proposed

**Current**
```
assessment → score → /book (Cal.com) → /checkout → webhook flips tier → /paid (Book CTA) → user books → call happens → admin writes notes → admin triggers report → email with PDF
```

**Proposed**
```
assessment → score → /checkout → webhook flips tier → /paid (success) → /dashboard
  → dashboard lazily triggers generateReport() on first visit (paid + no pdf_path)
  → email fires when PDF lands
  → "Book your 15-min review call (optional)" lives as a secondary CTA on dashboard
```

## Why

- Cal.com booking is the highest friction in the funnel right now
- Most buyers want the deliverable first; the call is a value-add, not a gate
- Removes the "report ready after your call" awkwardness on the dashboard
- John keeps the call as a relationship/retention tool, not a delivery dependency

## Open questions (need refinement before build)

1. ~~**Cal.com slug**~~ — RESOLVED 2026-05-18: keep `jobabroad/15min`, call stays 15 minutes. Copy stays "15-min review call".
2. ~~**Trusted-partners footer in the PDF**~~ — RESOLVED 2026-05-18: **both**. Keep the full "Recommended partners" section near the end (cards with name, type, destinations, bullets, notes, link), AND add a compact one-line strip on every page footer (e.g. "Trusted partners: Name A · Name B · Name C"). Compact strip uses the same partner list from `getTrustedPartnersForBuyer()`; if no matches, fall back to the existing page-number footer.
3. ~~**Salary + cost-of-living data source**~~ — RESOLVED 2026-05-18: **skip for v1**. Ship trusted-partners footer + longer GPT sections first; add salary tables in a follow-up. No changes to `lib/reports/types.ts` for salary fields, no new `salary-data.ts`, no extra RAG queries for salary terms in this round.
4. ~~**/paid page after payment**~~ — RESOLVED 2026-05-18: **auto-redirect straight to /dashboard** once tier is confirmed paid. Server-side `redirect('/dashboard')` replaces the current "You're in" interstitial. The webhook-race polling UI stays (still needed when tier hasn't flipped yet); only the post-confirmation branch changes from interstitial → redirect. Dashboard owns the "your report is being prepared" message.
5. ~~**Report quality bar**~~ — RESOLVED 2026-05-18: two adds, no country shortlist, no 90-day plan.
   - **More + longer next actions**: bump from 3 → 5-7 actions, each from ~35 words → ~80-120 words with concrete how-to detail (registration links, fees, timelines, e.g. "Register on SACE, expect 4-6 weeks, fees R615"). Update `generateNextActions()` prompt + token budget; loosen the `max_tokens: 280` cap; allow JSON array of 5-7 items.
   - **More guide sections + red-flags block**: bump `pickContactChunks` from 4 → 8 passages with longer excerpts (`tightenSnippet` cap raised from 200 → ~400). Add new "Red flags to avoid" section with category-specific scam patterns sourced from `content/scam-warnings.md` (or wherever `/scam-warnings` content lives); render as bulleted list in the PDF.
   - **Skipped**: country-by-country shortlist, week-by-week 90-day plan, salary tables (Q3).
   - **Target length**: ~5-6 A4 pages instead of current 2-3.
6. ~~**Call notes path**~~ — RESOLVED 2026-05-18: **decouple notes from PDF**. The pre-call PDF is the only PDF. After the call, admin types notes on `/admin/post-call` → notes go out as a plain-text "Notes from our call" follow-up email + appear on a new dashboard "Notes from your review call" card. PDF is never regenerated.
   - Remove the "From your review call" section from `pdf-template.tsx` (lines 358-379) and the `callNotes` field from `ReportData` (`types.ts:22`).
   - `lib/notifications/report-ready.ts` no longer needs `GenerateReportOptions.callNotes`; simplify.
   - Add new `lib/notifications/call-notes.ts` that sends the post-call email (Brevo, plain prose, no attachment).
   - `paid_reports.call_notes` column stays (it's the source for the dashboard card and the email).
   - `/admin/post-call` action changes from "regenerate PDF with notes" to "save notes + send call-notes email."
   - Dashboard reads `paid_reports.call_notes` and renders a card when present.
7. ~~**Generation latency**~~ — RESOLVED 2026-05-18: **pre-warm from webhook via `waitUntil`**. After `applySuccessfulPayment` flips tier and `result.flipped === true`, fire `generateReport(userId)` inside `waitUntil()`. By the time buyer lands on dashboard, PDF is ready ~95% of the time. When generation completes, fire the "Your report is ready" email (replaces the old `sendBookingInvite`).
   - Dashboard still needs a fallback "preparing your report" skeleton with meta-refresh for the rare case buyer beats the generator.
   - Webhook route's `maxDuration` already 300s — plenty of headroom for ~30-40s generation.
   - Cost accepted: ~$0.02-0.05 OpenAI per payment, generated whether or not buyer returns. At R495/sale this is negligible.
   - No-call dashboard visit doesn't trigger generation (just reads `paid_reports.pdf_path`).
8. ~~**Email cadence**~~ — RESOLVED 2026-05-18: **one email from us after payment**. Paystack sends its own receipt automatically; we send only **"Your report is ready"** (PDF attached + dashboard link) once webhook-triggered generation completes. No "payment confirmed" interstitial email, no separate "book a call" email, no 24h nudge.
   - Optional later: **"Notes from our call"** email if/when the Cal.com call happens and admin types notes (Q6).
   - The optional 15-min call CTA lives on the dashboard, not in the report-ready email.
   - Repurpose `lib/notifications/booking-invite.ts` → `sendReportReadyEmail` with the PDF attached (move attachment logic from `report-ready.ts`).
   - `lib/notifications/report-ready.ts` (admin-triggered) becomes redundant for the main flow; either delete or keep as an admin-only "force regen + resend" tool.

## Files that would change

- `app/members/[category]/paid/page.tsx` — drop "Book call" CTA, route to dashboard
- `app/dashboard/page.tsx` — auto-trigger generation for paid users without `pdf_path`, replace placeholder card with skeleton/download, add optional "Book 50-min call" secondary CTA
- `app/members/[category]/book/page.tsx` — copy unchanged (still 15-min), stays reachable
- `lib/notifications/booking-invite.ts` — repurpose to `sendReportReadyEmail`
- `lib/notifications/report-ready.ts` — call from auto-gen path, not just admin
- `app/api/payments/webhook/route.ts` — swap email function, possibly pre-warm generation
- `lib/reports/generator.ts` — beefier sections, optional salary/COL block
- `lib/reports/pdf-template.tsx` + `types.ts` — trusted-partners footer treatment, optional salary block
## What does NOT change

- `/admin/post-call` stays (used to splice call notes into a v2 report after the optional call)
- `paid_reports` table schema unchanged (might bump `generated_at` on regeneration)
- Paystack flow, Supabase auth, scoring, assessment, free tier — all untouched
- `lib/recruiters.ts` + trusted-partner overlay — unchanged, just consumed differently in the PDF

## Out of scope

- Refactoring the assessment or scoring system
- Touching free-tier dashboard cards
- Multi-category rollout (still teaching-only pilot per [[project_teaching_only_pilot]])

## Next session — restart from here

Re-open this file, answer the 8 open questions, then I can produce a concrete implementation plan and execute.
