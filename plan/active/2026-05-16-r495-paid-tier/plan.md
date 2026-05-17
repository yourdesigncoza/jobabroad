---
plan: r495-paid-tier
created: 2026-05-16
status: planned
priority: high
model-planned: opus-4-7
scope-pivot-2026-05-17: Teaching-only pilot. Steps 02, 03, 04 narrowed to teaching. Healthcare/farming rubrics + ScoringComingSoon component deferred. Site stays private until other rubrics ship.
---

# Plan: R495 Paid Tier — Eligibility Score + Expanded Report + 15-min Call

## Context

Convert Jobabroad from free-only to a freemium model. The free flow now
ends with a banded **Eligibility Score** (rule-based via per-category JSON
rubric) plus two LLM-generated teaser lines, gating the full report behind
**R495**. The paid tier delivers a PDF report (auto-generated via
`@react-pdf/renderer`), a single 15-min Cal.com booking with POPIA
recording-consent, and 5 email follow-up credits (form on dashboard →
Brevo → John's Gmail with `reply-to` = buyer). Payment provider is
swappable between Paystack and PayFast behind a small abstraction —
chosen at execution time once one approves the merchant account. Three
categories ship with rubrics (healthcare, teaching, farming); the other
eight show a "Scoring coming soon" placeholder. Call-recording-to-report
automation, second-call upsell, and referral-fee accounting are
explicitly out of scope.

### Affected Scope

- **Modules:**
  - `app/members/[category]/*` (new score page, new book page)
  - `app/api/payments/*` (new checkout + webhook routes)
  - `app/api/follow-up/*` (new send route)
  - `app/api/reports/*` (new PDF generate route)
  - `app/dashboard/page.tsx` (paid surfaces)
  - `components/{ScoreResult, PaywallCard, BookingForm, FollowUpForm, ConsentCheckbox}.tsx` (new)
  - `components/AssessmentWizard.tsx` (drop completion-redirect to /score)
  - `lib/assessments/steps/*` (add 5-question personal-context section to all 11 categories)
  - `lib/scoring/{index.ts, rubrics/*.json}` (new)
  - `lib/payments/provider.ts` + one impl (Paystack OR PayFast)
  - `lib/reports/{pdf-template.tsx, generator.ts}` (new)
  - `lib/email/follow-up.ts` (new wrapper around Brevo)
- **DB tables (new/modified):**
  - `profiles` — add `tier text default 'free'`, `paid_email_credits int default 0`
  - `bookings` — new table (user_id, slot_at, consented_at, created_at)
  - `paid_reports` — new table (user_id PK, pdf_path, generated_at)
- **God nodes at risk:** none in current code; AssessmentWizard is the most-imported component but only its post-submit redirect changes
- **ADRs relevant:** none (no DevVault for this project)
- **Cross-module boundaries:** payments ↔ profiles, reports ↔ Supabase Storage, follow-up ↔ Brevo (existing)
- **Graphify blast radius:** ~77 nodes (stale May 6 graph; current accurate)

### Pre-flight (external prerequisites — must be done before the cited step runs)

| Before step | What | Why |
|---|---|---|
| 06 | One of **Paystack** or **PayFast** merchant account approved | Pick the impl that approves you; only one provider ships |
| 06 | Provider's secret API key + webhook secret in `.env.local` | `PAYSTACK_SECRET_KEY` / `PAYFAST_*` vars |
| 10 | Cal.com account, 15-min event type "Jobabroad intro" created with daily slot cap | Embed slug hardcoded in step 10's BookingClient |
| 11 | Brevo **REST API key** (different from SMTP key) | `BREVO_API_KEY` env var; SMTP key won't authenticate the REST endpoint |
| 11 | `JOHN_INBOX_EMAIL` env var set | Follow-ups need a destination inbox |
| 12 | Same Brevo key as step 11 | PDF attachment send uses the same wrapper |

### Key Constraints

- **CLAUDE.md rules:** all external links open in new tab; never store sensitive data client-side; service-role only on server.
- **Existing auth:** Supabase Auth (email+password), `profiles` table linked to `auth.users`. `lib/auth-guards.ts` provides `requireProfile`.
- **Existing email:** Brevo SMTP via Supabase Auth + has working `From: no-reply@jobabroad.co.za`. New transactional sends use Brevo's API directly (`@getbrevo/brevo` or simple `fetch` to `api.brevo.com/v3/smtp/email`).
- **Existing pgvector corpus:** per-category pathway content already indexed in `pathway_chunks` table. Used by LLM grounding for teaser lines + paid report.
- **PDF tech:** `@react-pdf/renderer` (decided in brief Q1).
- **Score shape:** multi-dimensional rubric, weighted average → band (decided in brief Q2).
- **Follow-up routing:** dashboard form → John's Gmail via Brevo (decided in brief Q3).
- **Payment processor:** decision deferred to execution. Abstraction must be small enough that swap is a one-file edit.

## Steps Overview

| #  | Step                                                                                | Module        | Depends on |
|----|-------------------------------------------------------------------------------------|---------------|------------|
| 01 | DB migration: profiles.tier + paid_email_credits, bookings + paid_reports tables     | db            | —          |
| 02 | Personal-context section: 5 Qs added to **teaching only** (others deferred)          | lib/assessments | —        |
| 03 | Scoring engine: pure function + **teaching.json** (healthcare/farming deferred)      | lib/scoring   | —          |
| 04 | /members/teaching/score page: band + LLM teasers + paywall (no ScoringComingSoon)    | app/members   | 02, 03     |
| 05 | AssessmentWizard: redirect to /score on submit instead of AssessmentConfirmation     | components    | 04         |
| 06 | Payment provider abstraction (lib/payments/provider.ts) + chosen impl (Paystack/PayFast) | lib/payments | 01    |
| 07 | Checkout API + webhook: /api/payments/checkout + /api/payments/webhook → flip tier  | app/api       | 06         |
| 08 | PDF report generator: @react-pdf/renderer template + Supabase Storage cache         | lib/reports   | —          |
| 09 | Paid dashboard surfaces: report link, book link, follow-up form, credits indicator  | app/dashboard | 01, 08     |
| 10 | /members/[category]/book: Cal.com embed + mandatory POPIA consent + bookings insert | app/members   | 01, 07     |
| 11 | Follow-up send: /api/follow-up/send + dashboard form, atomic credit decrement       | app/api       | 01, 07, 09 |
| 12 | Eager report gen on payment webhook + email PDF + WhatsApp deep-link notification    | lib/notifications | 07, 08 |
| 13 | Playwright regression: score, paywall, scoring-coming-soon, paid dashboard, follow-up | tests       | 04, 09, 11 |

## Dependency Graph

```
01 ─┬─► 06 ─► 07 ─┬─► 10
    │             ├─► 11 ◄── 09 ◄── 08
    │             └─► 12 ◄── 08
    └─► 09

02 ─┐
03 ─┴─► 04 ─► 05

04, 09, 11 ─► 13
```

## Risks

| #  | Risk                                                                         | Likelihood | Mitigation |
|----|------------------------------------------------------------------------------|------------|------------|
| R1 | Webhook race: user pays, hits dashboard before webhook flips tier            | Medium     | Step 07: success page polls profile for 5s after redirect; manual retry button |
| R2 | LLM teaser hallucinates a fact that contradicts the rubric                   | Low-Med    | Step 04 prompt constraints: teaser MUST cite the dimension and weight; corpus retrieval limited to ≤3 chunks per teaser; "we" voice |
| R3 | @react-pdf/renderer bloats bundle or fails to render Unicode (R, ✓, emoji)   | Medium     | Step 08: bundle a known Unicode font (Inter or Noto); only generate server-side; never ship to client |
| R4 | Email credit decrement race (two tabs send simultaneously)                   | Low        | Step 11: use a single SQL `UPDATE … WHERE paid_email_credits > 0 RETURNING …`; transactional |
| R5 | POPIA consent missing → legal exposure if recording stored later             | High if missed | Step 10: consent checkbox is form-level required; bookings.consented_at NOT NULL; stop call recording if column null |
| R6 | Payment provider abstraction leaks (Paystack-specific shape in caller code)  | Medium     | Step 06: interface returns generic { checkoutUrl, externalRef }; webhook normalised to { externalRef, status }; caller code knows nothing else |
| R7 | Rubric authoring is slow (subject matter requires John's input)              | High       | Step 03: ship a v1 rubric skeleton per category (~5 dimensions × 3 questions); John iterates after launch; rubrics are JSON so changes need no deploy |
| R8 | Cal.com free tier limits or branding shows                                   | Low-Med    | Step 10: confirm Cal.com paid tier is acceptable cost; consider Cal.com self-host as fallback |
| R9 | Supabase Storage bucket misconfigured → PDFs publicly listable               | Medium     | Step 08: bucket is private; signed URLs only; RLS on paid_reports table — user can only read own row |
| R10 | Scope creep on "expanded report" content                                    | High       | Step 08: template has fixed sections (cover, dimensions ×N, gaps, contacts, next-3-actions, disclaimer); LLM fills, doesn't add sections |

## Post-launch revisit

- **Drop the 15-min call from the R495 bundle once traction is visible.** GPT review (notes.md, 2026-05-17) flagged service-load risk: at volume, 20 buyers ≈ 20 calls + chasing. Current decision is to ship the call in v1 because it's the asymmetric trust signal that justifies R495 vs the dropped R199 — slot scarcity via Cal.com daily cap is the v1 throttle. **Revisit after ~30 paid buyers OR if weekly call load > 5 hrs of John's time, whichever first.** Likely path at that point: keep call as launch-bonus / "Strong potential only" / R350 add-on (GPT's options A/B/C). Do not pre-emptively remove — wait for data.
