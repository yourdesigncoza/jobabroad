---
plan: r495-paid-tier
reviewer: gemini-2.5-pro
reviewed: 2026-05-16
verdict: REVISE → applied
---

# Review — Gemini 2.5 Pro

## Verdict

**REVISE** → all Bucket A findings auto-applied; all Bucket B findings approved by user and applied.

## Decision Table

| # | Finding | Category | Bucket | Action Taken | Impact |
|---|---------|----------|--------|-------------|--------|
| 1 | Storage bucket RLS policy missing (defense-in-depth) | Risk Flag | A | Added `CREATE POLICY` on `storage.objects` for `paid-reports` in step 01 | Medium |
| 2 | `last_payment_ref` column should be in step 01 migration, not step 07 extension | Missing Step | A | Moved column declaration into step 01; removed extension snippet from step 07 | Low |
| 3 | Step 11: best-effort rollback misrepresented as atomic | Risk Flag | A | Added "R4b — KNOWN LIMITATION" with rationale + monitoring approach | Low |
| 4 | Pre-flight checklist needs to be more prominent than just in progress.md | Section Improvement | A | Added "Pre-flight" table to plan.md above Key Constraints | Low |
| 5 | **PDF generation timeout / poor UX** | Risk Flag (P0) | B | User approved option 1: **eager generation on payment webhook** using `waitUntil`. Step 12 fully rewritten | High |
| 6 | **Payment abstraction leaks (`evt.metadata?.userId`)** | Risk Flag (P1) | B | User approved: `VerifiedWebhook.userId` is now top-level + provider impl responsible for normalisation. Step 06 interface updated; step 07 handler simplified | High |
| 7 | **Pre-existing-assessment users won't have new situation.* fields** | Risk Flag (P2) | B | User confirmed "no users have submitted yet" — accepted v1 ship-before-anyone-submits posture. TODO comment added in step 12's generator wrapper | Low |
| 8 | WhatsApp notification add-on (user requirement during review) | New requirement | B | Step 12 expanded to include WhatsApp deep-link in the email (wa.me, zero infra). Programmatic WhatsApp send via Twilio/Meta wrapped behind future `lib/whatsapp/notify.ts` if/when needed | Medium |

## Gemini's full response (raw)

### Missing Steps

- **Storage Bucket RLS Policy**: Step 01 defines RLS policies for the
  `paid_reports` database table but not for the `paid-reports` storage
  bucket itself. While a private bucket with signed URLs is a strong
  control, adding a storage RLS policy (e.g., `CREATE POLICY "User can
  read own reports" ON storage.objects FOR SELECT USING (bucket_id =
  'paid-reports' AND auth.uid()::text = (storage.foldername(name))[1]);`)
  would provide defense-in-depth, ensuring users can only access objects
  within their own user-ID-named folder.
- **Formal Pre-flight Checklist**: Key external dependencies like
  "Merchant Account Approval" (Step 06), "Brevo API Key Generation"
  (Step 11), and "Cal.com Setup" (Step 10) are mentioned within
  individual steps but should be consolidated into a single, explicit
  pre-flight checklist at the beginning of the plan.
- **Idempotency Migration Formalization**: Step 07 proposes adding a
  `last_payment_ref` column to the `profiles` table for webhook
  idempotency and mentions this could be part of the Step 01 migration.
  This should be formalized as a required change within
  `supabase/migrations/20260516_paid_tier_tables.sql` in Step 01 to
  ensure it is not missed.

### Dependency Issues

None found. The dependency graph in `plan.md` is sound and the
individual step dependencies are correctly identified.

### Scope Issues

Aligned with brief. The plan's 13 steps comprehensively cover all 12
acceptance criteria outlined in `brief.md` without introducing any
noticeable scope creep.

### Risk Flags

- **CRITICAL - PDF Generation Timeout**: Step 08 estimates PDF generation
  could take 8-15 seconds. Standard Vercel serverless functions have a
  10-second timeout on the Hobby plan (and can be configured up to 60s
  on Pro), creating a high risk of timeouts, especially on cold starts.
  - **Recommendation**: This architecture must be changed. The
    `/api/reports/generate` route should trigger a Vercel Background
    Function (or a Supabase Edge Function with a longer timeout) to
    perform the generation asynchronously. The API should return
    immediately with a `jobId`, and the frontend should poll a separate
    `/api/reports/status` endpoint until the PDF is ready.

  > **Note from Claude:** Vercel's default function timeout was raised
  > to 300s across all plans (Fluid Compute) per the latest Vercel
  > knowledge update. Gemini's outdated info on the 10s ceiling.
  > Real concern is UX latency — addressed by option 1 (eager
  > generation on webhook with `waitUntil`).

- **HIGH - Incomplete Payment Abstraction**: Step 07's webhook code
  example reads `evt.metadata?.userId`. However, Step 06 correctly notes
  that PayFast doesn't support a `metadata` field and requires using a
  custom field like `custom_str1`. This creates a direct contradiction.
  - **Recommendation**: Mandate that the `verifyWebhook` method within
    the `PaymentProvider` interface (Step 06) is responsible for
    normalizing the provider-specific payload into the generic
    `VerifiedWebhook` shape.

- **MEDIUM - Race Condition with Pre-existing Assessments**: Step 02
  correctly handles in-progress assessments, but does not account for
  users who have already submitted an assessment prior to the deployment
  of the new personal-context questions. If such a user pays, the
  scoring engine will run on incomplete data.
  - **Recommendation**: The report generation flow (Step 08) must check
    if the user's latest submitted assessment contains the new
    `situation.*` fields. If not, prompt the user to "Please complete
    your profile to generate your report".

- **LOW - Best-Effort Email Credit Rollback**: Step 11's plan to handle a
  Brevo API failure by making a second, separate database call to refund
  a follow-up credit is not a true atomic transaction.
  - **Recommendation**: Acknowledge this limitation explicitly in the
    step's risk section.

### Sequencing Observations

The current sequencing is sound. Alternative for phased release:
- **v1 (Free Value)**: Steps 01 (partial), 02, 03, 04, 05, 13 (partial)
- **v2 (Paid Monetization)**: Steps 01 (remainder), 06–12, 13 (remainder)

The all-in-one plan is also valid.

### Verdict

**REVISE** — The plan is exceptionally detailed and well-structured, but
contains a critical architectural flaw and a high-risk implementation
detail that must be addressed before execution.

1. **[P0] Asynchronous PDF Generation** — re-architect.
2. **[P1] True Payment Abstraction** — enforce normalisation.
3. **[P2] Handle Pre-existing Assessments** — block report gen until
   profile complete.

---

## How findings were processed

- **A1–A4 (Bucket A)** — applied directly without user prompt.
  Documented above. Diff: step-01 + step-07 + step-11 + plan.md changed.
- **B5–B7 (Bucket B)** — user chose between 3 options each via
  AskUserQuestion:
  - **B5 PDF generation**: user picked "Generate eagerly on payment
    webhook" — additionally requested **WhatsApp notification**.
    Step 12 rewritten to do eager `waitUntil` generation + Brevo email
    with PDF attachment + WhatsApp deep-link in email body.
  - **B6 Payment abstraction**: user picked "Normalise userId inside
    verifyWebhook". Step 06's `VerifiedWebhook` gained top-level
    `userId: string`; step 07's handler uses `evt.userId`.
  - **B7 Pre-existing assessments**: user picked "Don't worry, no users
    yet". TODO comment added in step 12's generator with detection +
    remediation pattern for future use.

## Next step

Run `/ydcoza-plan execute r495-paid-tier` in a fresh Sonnet session.

Steps **01, 02, 03, 08** are `ready` and independent — can execute in
any order (or in parallel sessions).
