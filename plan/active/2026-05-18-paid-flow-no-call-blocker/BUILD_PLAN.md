# Build Plan — Paid flow refactor (call as optional CTA)

**Spec:** see `README.md` in this folder (all 8 questions resolved 2026-05-18)
**Review:** see `GEMINI_REVIEW.md` for the adversarial pass; this plan incorporates the 10 accepted decisions
**Scope:** teaching pilot only (other categories still rubricless)
**Estimated effort:** Phase 1 expanded to ~12-15h after review; Phases 2-5 unchanged at ~6h + ~2h Playwright

Phased so each phase can land independently without breaking the current flow.

---

## What changed after the Gemini review

The original Phase 1 had three weak points: `waitUntil` silent failures, brittle `meta-refresh` polling, and an admin UI that would be out of sync between Phase 1 and Phase 4. All three resolved by expanding Phase 1 to include:

1. New `paid_reports.generation_status` column (pending/completed/failed) + `generation_error` + `generation_attempts` + timestamps — observability without a job queue
2. Client-side `<ReportStatusCard />` with exponential backoff polling (3→5→8→13s, cap 15s, total ~90s) replacing the meta-refresh
3. New `/api/reports/status` (read) + `/api/reports/regenerate` (user-facing retry, capped at 5 attempts)
4. Minimal admin patch in Phase 1 (status column + hide stale "Generate" button) so admin UI is consistent during the Phase 1→4 gap
5. Initial `paid_reports` row insert moved into `applySuccessfulPayment` so the tier flip and report-record creation are coupled

**Already covered, no work needed:**
- Webhook signature verification: HMAC SHA512 + `timingSafeEqual` in `lib/payments/paystack.ts:90-107`
- Webhook idempotency: `profile.last_payment_ref === evt.externalRef` check in `lib/payments/apply.ts:46-48`

---

## Phase 1 — Webhook + email plumbing + observability (revised)

Order matters within this phase. Migration first, then the data-write changes, then the UI surfaces.

### 1.1 — Migration: `paid_reports.generation_status`

**File:** `supabase/migrations/20260518_paid_reports_generation_status.sql`

```sql
ALTER TABLE paid_reports
  ADD COLUMN generation_status TEXT NOT NULL DEFAULT 'completed'
    CHECK (generation_status IN ('pending', 'completed', 'failed')),
  ADD COLUMN generation_error TEXT,
  ADD COLUMN generation_attempts INT NOT NULL DEFAULT 0,
  ADD COLUMN generation_started_at TIMESTAMPTZ,
  ADD COLUMN generation_completed_at TIMESTAMPTZ;

-- Backfill: any existing row already has pdf_path (we never wrote rows without it),
-- so they're 'completed'. The default above handles this, but be explicit:
UPDATE paid_reports
  SET generation_status = 'completed',
      generation_completed_at = generated_at
  WHERE pdf_path IS NOT NULL;

-- After this migration, the default for NEW rows flips to 'pending' (set in code).
-- We keep the column default as 'completed' so backfilled rows look right and so
-- forgotten inserts don't accidentally read as 'pending' forever.
```

### 1.2 — Add initial `paid_reports` row to `applySuccessfulPayment`

**File:** `lib/payments/apply.ts`

After the profiles.update succeeds (line 50-62), upsert a `paid_reports` row with `generation_status='pending'`, `attempts=1`, `generation_started_at=now()`. No PDF path yet. This is the row that the dashboard `<ReportStatusCard />` will poll.

Transactional integrity: Supabase JS doesn't expose multi-statement transactions cleanly. Two acceptable options:
- **(A)** Write a Postgres function `apply_payment_atomic(user_id, ref, ...)` that does both in one transaction; call via RPC.
- **(B)** Order the writes so the worst-case state is recoverable: insert paid_reports row first (status='pending'), then flip tier. If tier flip fails, we have a stale pending row but no paid user — buyer sees error, tries again, idempotency kicks in.

Going with **(B)** for the smaller surface area. If (A) is preferred later, refactor at that point.

### 1.3 — Wire status into `generateReport`

**File:** `lib/reports/generator.ts`

- Wrap the body of `generateReport()` in a try/catch
- On success: existing upsert path stays, but now sets `generation_status='completed'`, `generation_completed_at=now()`, clears `generation_error`
- On caught error: upsert with `generation_status='failed'`, `generation_error=err.message.slice(0, 1000)`, rethrow (caller still gets the error; status is just side-effect bookkeeping)
- Bump `generation_attempts` on every entry to generateReport (so retry attempts increment correctly)

### 1.4 — Repurpose `sendBookingInvite` → `sendReportReadyEmail`

**File:** `lib/notifications/booking-invite.ts` → rename `lib/notifications/report-ready-email.ts`

- New signature: `sendReportReadyEmail(userId, pdfBuffer, userName, categoryLabel)`
- Subject: `"Your personalised ${categoryLabel} report is ready"`
- Body: thanks + PDF attached + "Open dashboard" CTA + soft mention of optional 15-min call ("If you want to talk it through, you can book a 15-min call from your dashboard whenever you're ready.")
- Brevo attachment pattern from existing `lib/notifications/report-ready.ts:36-41`
- Swallow errors (existing pattern)

### 1.5 — `generateAndEmail` helper + webhook wire

**File:** `app/api/payments/webhook/route.ts`

```ts
async function generateAndEmail(userId: string) {
  try {
    const { pdfBuffer, userName, categoryLabel } = await generateReport(userId);
    await sendReportReadyEmail(userId, pdfBuffer, userName, categoryLabel);
  } catch (err) {
    console.error('[webhook] generate+email failed', { userId, err });
    // generation_status already flipped to 'failed' inside generateReport
  }
}

// in POST handler, replace sendBookingInvite line:
if (result.flipped) {
  waitUntil(generateAndEmail(evt.userId));
}
```

Same wiring in `/paid` page fallback path (`app/members/[category]/paid/page.tsx:53`).

### 1.6 — `/paid` redirects to `/dashboard`

**File:** `app/members/[category]/paid/page.tsx`

- When `isPaid === true`, replace the JSX (lines 64-107) with `redirect('/dashboard')`
- Keep race-condition polling UI (lines 112-134) for the not-yet-paid branch
- Net: ~60 lines instead of 135

### 1.7 — `/api/reports/status` route

**File:** new `app/api/reports/status/route.ts`

```ts
// GET: returns { status: 'pending'|'completed'|'failed', pdfUrl?: string, attempts: number, canRetry: boolean }
// Derives userId from session — never trusts query params for ownership.
// pdfUrl populated via createSignedUrl(pdf_path) only when status='completed'.
// canRetry = (status === 'failed' && attempts < 5).
```

### 1.8 — `<ReportStatusCard />` client component

**File:** new `components/ReportStatusCard.tsx`

- Client component, takes initial `{status, pdfUrl?, attempts, canRetry}` as props (server-rendered first paint)
- If initial `status === 'completed'`: render the download CTA immediately, no polling
- If `status === 'pending'`: poll `/api/reports/status` with backoff 3s → 5s → 8s → 13s (cap 15s, max ~90s elapsed), then show "Still working — we'll email you when ready. You can close this page." 
- If `status === 'failed'`: show error message + "Try again" button that POSTs to `/api/reports/regenerate`, then resumes polling
- Visible loading state, accessible polite live-region for status changes

### 1.9 — `/api/reports/regenerate` route

**File:** new `app/api/reports/regenerate/route.ts`

```ts
// POST: session-derived userId. Checks profile.tier='paid' and paid_reports.generation_attempts < 5.
// On valid: bump attempts, set status='pending', clear error, set generation_started_at.
// Returns { ok: true } and fires waitUntil(generateAndEmail(userId)).
// Returns 429 if attempts >= 5, 403 if not paid.
```

### 1.10 — Dashboard wiring (minimal)

**File:** `app/dashboard/page.tsx`

Phase 3 will fully rework the dashboard layout. For Phase 1, the minimal change:
- Replace the existing `getCachedReportPath` call with a single query for `pdf_path` + `generation_status` + `generation_attempts` + `generation_error`
- Replace the "Report ready after your call" placeholder card with `<ReportStatusCard initialStatus={...} initialPdfUrl={...} />`
- Drop the existing `bookHref` "Book your 15-min call" CTA — that becomes Phase 3's "optional call" card. For Phase 1, leave the existing card in place (Phase 1 is plumbing-focused).

### 1.11 — Admin awareness patch

**File:** `app/admin/post-call/page.tsx` (and the listing component if it lives in a sub-file)

- Add a "Status" column to the paid-user list showing `generation_status` with a colour pill (green/yellow/red)
- Hide or disable the "Generate report" button when `pdf_path` exists; replace with a "PDF available" indicator
- Full rewrite (save-notes-and-email + force-regenerate) still in Phase 4

### 1.12 — Delete unused admin-trigger helper

**File:** `lib/notifications/report-ready.ts` — DELETE
- Was the admin's post-call regenerate+email helper; superseded by 1.5
- Verify no other callers via grep before deleting

### Phase 1 test gate

- `tests/paid-tier.spec.ts` updated:
  - Existing "books call" test → DELETE
  - Existing "paid landing shows book CTA" → DELETE
  - Add: paid landing redirects to dashboard
  - Add: status route returns expected shape for a paid user with completed report
  - Add: ReportStatusCard transitions from skeleton → download when status flips to completed (mock the status endpoint)
  - Add: regenerate route enforces 5-attempt cap and paid-only access

---

## Phase 2 — PDF report changes (unchanged from original plan)

The report itself gets richer; structure changes; call-notes section removed.

### 2.1 — Strip call notes from the PDF

**Files:**
- `lib/reports/types.ts` — remove `callNotes?: string` field (line 22)
- `lib/reports/pdf-template.tsx` — remove lines 358-379 (the "From your review call" block) and the related `callNotesBlock` / `callNotesPara` styles
- `lib/reports/generator.ts` — remove `GenerateReportOptions.callNotes` (lines 235-243), the call-notes load+fallback block (lines 300-311), `callNotes` from `ReportData` construction (line 322), the `call_notes` upsert pass-through (line 346)

`paid_reports.call_notes` column **stays** — source for the dashboard card + email in Phase 4.

### 2.2 — Beefier "Next actions" section

**File:** `lib/reports/generator.ts` — `generateNextActions()`

- Change system prompt: "You write exactly **5 to 7** concrete next actions" and bump `body` cap from "<= 35 words" to "**<= 110 words**"
- Bump `max_tokens` from 280 → 1200
- Update JSON schema in prompt to allow array length 5-7
- Add to prompt: "Each action MUST include a concrete first step the reader can take today — a URL, a fee, a timeline, or a document name. No abstract advice."
- Fallback path (`fallback = gaps.slice(0, 3).map(...)`) — bump to `gaps.slice(0, 5)` and synthesise a longer body line

### 2.3 — More "Helpful guide sections"

**File:** `lib/reports/generator.ts` — `pickContactChunks()`

- Bump cap from `out.length >= 4` (line 171) → `out.length >= 8`
- Bump `tightenSnippet(c.content, 200)` (line 167) → `tightenSnippet(c.content, 400)`
- Caller passes `limit = 25` to `searchCorpus` — enough headroom

### 2.4 — New "Red flags to avoid" section

**File:** new `lib/reports/red-flags.ts` exporting `getRedFlagsForCategory(category: CategoryId): string[]`

- Initial teaching content: "upfront placement fee," "no SACE registration help," "contract not in English," "passport held by employer," "salary in cash with no payslip," etc. (4-6 bullets)
- Add to `ReportData`: `redFlags: string[]`
- Render in `pdf-template.tsx` after "Recommended next actions": new `<Text style={styles.h2}>Red flags to avoid</Text>` + bulleted list (reuse `styles.partnerBullet` pattern)

### 2.5 — Compact trusted-partners strip in page footer

**File:** `lib/reports/pdf-template.tsx`

- Replace single-line footer with two-line footer: compact partner strip (orange tint) above the existing page X/Y line
- When `data.partners` empty/undefined → fall back to current single-line footer
- Compute partner-names string at the top of `ReportTemplate`; reference from inside the footer
- Truncate to first 3 partner names to avoid overflow

### 2.6 — Keep the full "Recommended partners" section

No change — current cards stay (`pdf-template.tsx:410-432`).

### Phase 2 test gate

- Render fixture report locally: `npx tsx scripts/render-step4-fixture.ts` (or new fixture script if needed)
- Visual check: 5-6 pages, every page has partner strip, "Red flags" section appears, no "From your review call" section
- Trusted-partner-less category renders — strip falls back to plain page X/Y

---

## Phase 3 — Dashboard rework

The dashboard becomes the buyer's single landing place post-payment.

### 3.1 — Replace "Your full report & call" section with three cards

**File:** `app/dashboard/page.tsx` (lines 190-279)

**Card 1 — Your report (primary)**
- Hosts `<ReportStatusCard />` from Phase 1.8
- Visually primary: green background, large CTA when complete

**Card 2 — Optional 15-min review call (secondary)**
- White card, dashed border, copy: "Want to talk it through? Book a 15-min call whenever you're ready — no rush."
- CTA → `/members/${category}/book`
- Always visible for paid users

**Card 3 — Notes from your review call** *(Phase 4 adds the data; reserve the slot)*
- Only renders when `paid_reports.call_notes` exists
- Displays the notes inline (formatted), not a download

Demote `<FollowUpForm />` below these three cards but keep it.

### 3.2 — Read `call_notes` alongside generation state

Extend the dashboard's `paid_reports` query to include `call_notes`.

### Phase 3 test gate

- Paid user with pending status → skeleton via ReportStatusCard
- Paid user with completed → download CTA + optional call CTA
- Paid user with completed + call_notes → all three cards

---

## Phase 4 — Admin + call-notes follow-up

### 4.1 — Rewrite `/admin/post-call` action

**Files:** `app/admin/post-call/*` and `app/api/admin/post-call/generate/route.ts`

- Drop the "generate report" terminology
- Primary action becomes "Save call notes + send to buyer"
- API endpoint:
  - Saves `call_notes` to `paid_reports.call_notes`
  - Fires `sendCallNotesEmail(userId, notes)` synchronously (admin sees success/fail inline)
- Add **"Force regenerate report"** button (confirmation gated): bumps `generation_attempts`, flips `generation_status='pending'`, fires `waitUntil(generateAndEmail)`. Bypasses the 5-attempt cap.
- Keep the typed-notes editor + buyer-list UI; only the submit handler changes

### 4.2 — New `sendCallNotesEmail`

**File:** new `lib/notifications/call-notes.ts`

```ts
export async function sendCallNotesEmail(userId: string, notes: string): Promise<void>
```

- Subject: `"Notes from our ${categoryLabel} review call"`
- Body: plain prose intro + notes rendered with paragraph breaks + dashboard link
- No PDF attachment

### 4.3 — Optional: rename `paid_reports.call_notes` → `paid_reports.post_call_notes`

Skip unless touching the migration tree. Column name is fine.

### Phase 4 test gate

- Admin types notes → submits → buyer's dashboard shows "Notes from your review call" card on next load
- Email lands in buyer's inbox with notes formatted
- Force regenerate triggers new PDF generation; admin sees status transition pending → completed

---

## Phase 5 — Playwright regression (folded into per-phase test gates)

Each phase has its own test additions in the gate section above. No separate Phase 5 commit — tests ship alongside the code they cover.

New file in Phase 4: `tests/admin-post-call.spec.ts` — admin saves notes → buyer dashboard shows card; force-regenerate produces new pdf_path.

---

## Rollout order

1. **Phase 1** ships alone — validates the riskiest plumbing (webhook + waitUntil generation + status surface) in production before any UI change.
2. **Phase 2** ships next — richer PDF. Existing buyers keep their old PDF; only new payments get the new format.
3. **Phase 3** ships after 2 — dashboard layout finalised. Data + emails already correct; presentation only.
4. **Phase 4** ships last — admin tooling. No buyer-facing impact.

---

## Things to verify before starting

- **Migration applies cleanly to dev Supabase** — run locally first, check the backfill UPDATE catches all existing rows
- **`scripts/render-step4-fixture.ts`** — does this generate a paid-report fixture for visual review, or only the assessment? If not paid-report capable, add `scripts/render-report-fixture.ts`
- **Webhook timeout headroom** — `maxDuration = 300` already set; ~30-40s generation well within
- **Brevo attachment size** — current PDFs ~50-100KB; 5-6 page PDFs likely still <500KB; Brevo limit 10MB total (base64 +33%)
- **`/admin/post-call` current state** — read `app/admin/post-call/page.tsx` to confirm rewrite surface area before Phase 4

---

## Already covered (no work)

- Webhook signature verification: HMAC SHA512 + timing-safe compare in `lib/payments/paystack.ts:90-107`
- Webhook idempotency: `last_payment_ref` check in `lib/payments/apply.ts:46-48`

---

## Out of scope (defer)

- Salary/cost-of-living tables (resolved Q3: skip v1)
- Country-by-country shortlist
- 90-day plan checklist
- Multi-category rollout
- Trusted-partners form-based self-serve admin (separate plan)
- Structured red-flags content (JSON/MDX per category) — TS file is fine for v1
- Any change to free tier, assessment, scoring, or auth
