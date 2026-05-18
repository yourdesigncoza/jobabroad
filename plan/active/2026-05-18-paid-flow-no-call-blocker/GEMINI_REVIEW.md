# Gemini Adversarial Review — 2026-05-18

Review of `BUILD_PLAN.md` (original version) by Gemini 2.5 Pro via `mcp__gemini-cli__ask-gemini`. Three disagreements resolved through one round of adversarial exchange. Decisions below have been merged into the current `BUILD_PLAN.md`.

## Agreements

Gemini validated four core decisions:
- Core strategy of decoupling the call from the report
- 5-phase rollout order
- Pre-warm from webhook (UX value > OpenAI cost for no-shows)
- Decouple call notes from the PDF

## Resolved Disagreements

### 1. `waitUntil` observability + retry
- **Gemini's challenge:** waitUntil has no observability or retry; proposed a Postgres `report_jobs` table + Vercel Cron processor.
- **Resolution (synthesised):** Keep `waitUntil` for happy-path latency. Add `paid_reports.generation_status` (pending/completed/failed) + `generation_error` + `generation_attempts` + timestamp columns. User-facing retry button on dashboard for `failed` state. Admin gets "Force regenerate" escape hatch in Phase 4.
- **Key reasoning:** Vercel Cron adds ~60s scheduling latency on top of ~30s generation, defeating the entire pre-warm justification. A status column gives observability without the latency penalty.

### 2. Dashboard polling
- **Gemini's challenge:** `meta-refresh content=5` is brittle and polls forever; proposed client-side exponential backoff + 90s timeout.
- **Resolution (conceded):** New `/api/reports/status` route (session-derived userId). New `<ReportStatusCard />` client component polls 3→5→8→13s capped at 15s, max ~90s, then "Still working — we'll email you" message.
- **Key reasoning:** Exponential backoff with a deterministic timeout is strictly better UX and avoids back-pressure issues.

### 3. Admin UI consistency during phase gap
- **Gemini's challenge:** Admin will be confused if Phase 1 ships auto-generation but `/admin/post-call` still shows "Generate report" as if generation is admin-triggered.
- **Resolution (conceded):** Pull minimal admin awareness into Phase 1: surface `generation_status` column in the user list, hide "Generate report" button when `pdf_path` exists. Full admin rewrite stays in Phase 4.
- **Key reasoning:** Cost of small Phase 1 admin patch < cost of admin confusion + potential support ticket.

## Blind Spots Raised

Four issues neither Claude nor the spec named:

1. **Webhook idempotency** — Paystack can replay events. **Status: ALREADY COVERED** via `profile.last_payment_ref === evt.externalRef` check in `lib/payments/apply.ts:46-48`.
2. **Transactional integrity** — If `profiles.tier` flips to 'paid' but the `paid_reports` row insert fails, user is paid with no report record. **Resolution:** Order writes so the worst-case state is recoverable: insert `paid_reports` row with `status='pending'` first, then flip tier. If tier flip fails, stale pending row is benign; idempotency check handles retry.
3. **Webhook signature verification** — **Status: ALREADY COVERED** via HMAC SHA512 + `timingSafeEqual` in `lib/payments/paystack.ts:90-107`.
4. **Email delivery strategy** — Attaching PDF has size/spam-filter risks. **Resolution (adjusted):** keep PDF attached AND include dashboard link in email body. Belt and braces.

## New Ideas Incorporated

1. **User-facing retry button** — Dashboard surfaces "Try again" when `generation_status='failed'`. Calls new `/api/reports/regenerate` route, increments attempts (capped at 5 then locks for support).
2. **Admin force-regenerate** — Confirmation-gated button on `/admin/post-call` (Phase 4) that bypasses the 5-attempt cap.
3. **Structured red-flags content** (JSON/MDX per category) — **DEFERRED** to v2. Hand-maintained TS file is fine for teaching-only pilot.

## Decision Table

| # | Point / Issue | Decision | Final Rationale | Impact |
|---|---|---|---|---|
| 1 | Add `paid_reports.generation_status` + `generation_error` + `generation_attempts` columns | Incorporate | Unlocks observability + user retry + admin escape hatch without queue infrastructure | High |
| 2 | Client-side polling with exponential backoff via `/api/reports/status` + `<ReportStatusCard />` | Incorporate | Replaces meta-refresh; strictly better UX; deterministic timeout | High |
| 3 | Webhook idempotency check | Already covered | `last_payment_ref` check exists | High |
| 4 | Order writes: insert `paid_reports` row before tier flip | Incorporate | Prevents "paid user, no report record" inconsistent state | High |
| 5 | Webhook signature verification | Already covered | HMAC SHA512 + timing-safe compare exists | High |
| 6 | Pull minimal admin UI awareness into Phase 1 | Incorporate | Prevents admin confusion during the Phase 1 → Phase 4 gap | Medium |
| 7 | User-facing "Try again" button on dashboard for `failed` status | Incorporate | Resolves transient failures without support tickets | Medium |
| 8 | Admin "Force regenerate" button on `/admin/post-call` (Phase 4) | Incorporate | Escape hatch for subtle failures and prompt/template changes | Medium |
| 9 | Email delivery: keep PDF attached AND include dashboard link | Adjust | Belt and braces: attachment for convenience, link as fallback if attachment caught in spam | Medium |
| 10 | Move red-flags to `content/red-flags/teaching.json` | Reject | Defer to v2; TS file is fine for teaching-only pilot | Low |
