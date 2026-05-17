---
plan: r495-paid-tier
created: 2026-05-16
status: briefed
scope-pivot-2026-05-17: Teaching-only pilot. Ship the full paid-tier flow end-to-end for `teaching` only. Site stays private (no public landing route to other categories) until additional rubrics ship in later plans. Friends-and-family testing will validate the teaching flow before the other 10 categories are built.
---

# Brief: R495 Paid Tier — Eligibility Score + Expanded Report + 15-min Call

## Original Instruction

> Add R495 paid tier to Jobabroad. Free flow: user completes the assessment
> (with a new 5-question personal-context section: family status, dependants,
> savings band, urgency, current employment) and instead of an
> AssessmentConfirmation receives an Eligibility Score result page — banded
> (Strong potential / Needs prep / High blockers), one LLM-generated
> top-strength line, one LLM-generated top-blocker line, and a paywall CTA
> to upgrade. The score itself is rule-based via per-category JSON rubrics
> (auditable, deterministic), starting with healthcare, teaching, farming;
> the other 8 categories say "scoring coming soon" until rubrics exist.
> Paid R495 tier unlocks: full expanded LLM report (grounded in answers +
> per-category corpus + rubric breakdown) delivered as PDF + email via
> Brevo; a single 15-minute Cal.com booking with daily slot cap; a POPIA
> recording-consent checkbox on the booking form (mandatory); and 5 email
> follow-up credits per buyer tracked on profiles, decremented when they
> send a follow-up from the dashboard. Payment processor is TBD between
> Paystack and PayFast — choose at plan-execution time based on which
> approves the merchant account; the plan should keep that swappable
> behind a small abstraction. On success the user's profiles row gets
> tier='paid' and paid_email_credits=5. Defer for now: automated
> call-recording-to-report pipeline (John handles manually), any
> second-call upsell, partner referral fee tracking.

## Evaluation

| Dimension | Status | Notes |
|-----------|--------|-------|
| Scope | ✅ | New feature: paid tier with scoring engine, payment, calendar booking, email-credits system |
| Module | ✅ | Touches assessment, profiles, payment (new), calendar (new), report-gen (new), email (extend Brevo wiring), dashboard UI |
| Done condition | ✅ | Free flow shows banded score + 1-strength + 1-blocker + paywall; paid users get PDF report by email + bookable call slot + 5 email credits; verifiable end-to-end via Playwright with a test Paystack/PayFast key |
| Constraints | ✅ | Resolved via clarifications: PDF via @react-pdf/renderer; multi-dimensional scoring; dashboard form → Brevo email to John (no in-app inbox) |
| Scale | ✅ | Cross-cutting (acknowledged); multi-module but each piece is small |

## Clarified Requirement

Add a paid tier on top of the existing free flow. After a registered user
completes their category's assessment (extended by a new 5-question
**personal-context** section: family status, dependants, savings band,
urgency, current employment), they land on an **Eligibility Score** result
page instead of the current `AssessmentConfirmation`. The score is computed
deterministically by a **per-category multi-dimensional rubric** (3–5
dimensions per category, e.g. credentials, language, finances,
family-readiness, urgency; each scored 0–100; overall = weighted average,
mapped to a band: *Strong potential* / *Needs prep* / *High blockers*).
Rubrics are JSON files at `lib/assessments/scoring/{category}.json`. Only
**healthcare, teaching, farming** ship with rubrics in this plan; the other
eight categories show a "Scoring coming soon — chat to us on WhatsApp"
placeholder.

The free result page shows: the overall band, one LLM-generated
top-strength line, one LLM-generated top-blocker line, and a paywall CTA
("Get your full report + 15-min call — R495"). LLM copy is grounded in (a)
the user's assessment answers, (b) the rubric dimensional breakdown, and
(c) the existing per-category pgvector pathway corpus — never freeform.

The paid R495 tier, paid via either **Paystack** or **PayFast** (chosen at
execution time based on which approves the merchant account; both wired
behind a small `lib/payments/provider.ts` abstraction with
`initiateCheckout(userId, productId)` and `verifyWebhook(req)`), unlocks
on successful webhook: `profiles.tier='paid'` and
`profiles.paid_email_credits=5`. The post-payment dashboard surfaces:

1. **PDF report** auto-generated via `@react-pdf/renderer` on first request,
   covering all rubric dimensions with detailed gaps + named contacts +
   per-pathway gotchas + recommended next 3 actions. Emailed to the buyer
   via Brevo with the PDF attached; also downloadable from the dashboard.
2. **15-min booking** via Cal.com embed (`cal.com/jobabroad/intro` or
   similar), with a daily slot cap configured in Cal.com itself. Booking
   form requires a **POPIA recording-consent** checkbox (stored as
   `booking.consent_at` timestamp in a new `bookings` table); without it,
   the Cal.com booking button is disabled.
3. **5 email follow-up credits**. Dashboard form (subject + textarea) sends
   the message to John's inbox via Brevo with `reply-to` set to the buyer's
   email; credit decrement is atomic with the send. UI shows "3 of 5
   follow-ups left".

Out of this plan: any automated call-recording → report pipeline (John
records in Zoom externally; uses the manual report-update path), any
second-call upsell, partner referral-fee accounting.

## Acceptance Criteria

1. A logged-in user in **teaching** can complete the
   assessment including the new 5-question personal-context section, and
   on submit lands on `/members/teaching/score` showing: band label,
   1-line top-strength, 1-line top-blocker, paywall CTA. No full report
   shown.
2. ~~The same flow on a category without a rubric (e.g. accounting) shows
   "Scoring coming soon" + WhatsApp CTA instead of a score.~~ **Deferred (teaching-only pilot).** Non-teaching categories redirect to `/dashboard` if reached directly. The site is not public during the pilot.
3. Score is deterministic: re-submitting the same answers produces the
   same band and same dimensional scores. LLM copy may differ but is
   grounded in the same dimensional inputs.
4. `lib/assessments/scoring/{healthcare,teaching,farming}.json` exist with
   weighted-dimensional rubrics. Score calculation is a pure function:
   `(answers, rubric) → { overall, dimensions[], band }`.
5. Clicking the paywall CTA initiates checkout via the selected payment
   provider (Paystack or PayFast, decided at execution-time). Successful
   webhook flips `profiles.tier='paid'` and `paid_email_credits=5`,
   verified by the user landing back on a paid-thank-you page.
6. Paid users see on `/dashboard`: a "Download report (PDF)" link, a
   "Book your 15-min call" link, and a "Send follow-up (N of 5 left)"
   form. Free users do not.
7. First request for the PDF generates it via `@react-pdf/renderer`,
   stores it (Supabase Storage or filesystem cache), and emails it to the
   buyer via Brevo with the PDF attached. Subsequent requests serve the
   cached copy.
8. `/members/[category]/book` shows the Cal.com embed; submit is gated by
   a POPIA recording-consent checkbox. Consent timestamp is stored in a
   new `bookings(user_id, consented_at, slot_at)` table.
9. Sending a follow-up email from the dashboard form: decrements
   `paid_email_credits` by 1 (transactionally), sends via Brevo with
   `reply-to` = buyer's email, surfaces success/failure inline, and hides
   the form when credits = 0 with "Out of follow-ups — book a fresh call
   to chat again".
10. Payment provider is swappable. Switching from Paystack to PayFast (or
    vice versa) requires editing only `lib/payments/provider.ts` and the
    env-vars; no callers change.
11. Playwright regression covers: complete assessment → score page renders
    for healthcare; paywall CTA visible; "scoring coming soon" branch for
    a non-rubric category; admin-created paid user sees the three paid
    dashboard surfaces; sending a follow-up decrements the counter.
12. `npm run lint` + `npm run build` pass.

## Out of Scope

- **Automated call-recording → auto-report pipeline.** John records the
  call externally (Zoom/Meet/phone) and manually updates the report or
  emails a personalised addendum. The plan does not store recording URLs
  or transcripts.
- **Rubrics for the 8 non-pilot categories** (engineering, IT/tech,
  accounting, seasonal, hospitality, trades, TEFL, au-pair). These show
  "Scoring coming soon" until separate plans add their rubrics.
- **Any in-app threaded messaging UI.** Follow-up emails go to John's
  Gmail via Brevo; he replies from Gmail; the buyer gets it directly. No
  jobabroad-side inbox view.
- **Second-call upsell** beyond the one R495 call.
- **Partner referral-fee accounting** for handoffs to recruiters.
- **Refund/dispute handling UI.** Out of v1; John handles refunds manually
  via the payment provider dashboard.
- **A/B testing of the paywall** (price, copy, band thresholds).
- **Localisation.** English-only.
