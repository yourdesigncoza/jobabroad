# Jobabroad — Strategic Assessment & Action Plan

_Written 2026-06-02. A brutally-honest review of where the business actually is,
grounded in live DB numbers, plus a prioritised set of moves to work through._

---

## TL;DR

**The product is finished and the business has never started.** Payments are
switched OFF (`NEXT_PUBLIC_PAYMENTS_ENABLED` ≠ `true`), so all 20 users currently
get the full personalised GPT report **and** the AI coach for free. We have never
once asked a human to pay, so we have zero willingness-to-pay signal. We are still
in *build* mode when the data says we should be in *validate-price* mode.

**If we only do one thing:** turn payments on for healthcare + hospitality, and
pitch 3 UK nursing recruiters our assessed-candidate leads — two revenue
experiments, zero new code, run in parallel. The answer to "is this a business?"
is one week away and we've never asked the question.

---

## The numbers (live DB snapshot, 2026-06-02)

- **auth.users:** 20 (18 confirmed) over ~2 weeks (17 May – 1 Jun)
- **profiles:** 20 — tier split: **18 free, 2 paid** (the 2 paid are manual/test;
  payments are off)
- **assessments:** 8 total → **6 submitted, 2 draft**
- **bookings:** 1
- **paid_reports:** 2 / storage objects: 2

### Signups by category — the market has voted

| Category | Signups | Share |
|---|---|---|
| **Hospitality** | 7 | 35% |
| **Healthcare** | 4 | 20% |
| Trades | 2 | 10% |
| **Teaching** | 2 | 10% |
| Accounting / TEFL / Farming / IT-Tech / Au-pair | 1 each | 5% each |

- **Hospitality + Healthcare = 55% of all demand.**
- **Teaching = 10%** — yet docs, the "pilot", and much of the effort centre on it.
  We've been optimising for the vertical the market cares least about.
- Assessment categories actually completed: teaching, au-pair, healthcare,
  hospitality, tefl — so non-teaching users *are* reaching the score page.

### The funnel leak

```
20 signups → 8 assessments started → 6 submitted → 1 booking → 0 real paid
```

**70% of registrants never complete an assessment** — the one action that creates
value AND qualifies the lead. This leak is worth more than any new feature.

---

## Findings & recommendations (prioritised)

### 1. Stop building. Freeze the feature set.
We have 11 reviewed rubrics, RAG reports, an AI coach, journey tracking, a
proactive nudge cron, a WhatsApp reply assistant, a blog engine, and an outreach
pipeline — for **20 users**. The engineering quality is genuinely high (cap
engine, idempotency, error handling are professional-grade). That's the problem,
not a compliment: craft is being spent on *building* instead of *selling*. Every
feature is now permanent maintenance. Diminishing returns hit a while ago.

### 2. The R495 PDF is the wrong product. The *lead* is the product.
A one-time GPT-written PDF is a commodity — ChatGPT writes a passable version for
free, and so will every competitor soon. But a **qualified, assessed,
document-ready healthcare candidate** is worth **£1,000–3,000** to a UK NHS
nursing recruiter. That single lead is worth more to a recruiter than R495 is to
the nurse. We've built a B2C paywall on top of a **B2B lead-gen goldmine** and
pointed the revenue gun at the wrong target. We already own the recruiter
directory + outreach engine.

### 3. Go deep on healthcare/nursing, not teaching.
Highest LTV, clearest buyer ROI (a nurse landing in the UK earns multiples — any
fee is trivially justified), an established recruiter ecosystem to sell leads
into, and already our #2 organic demand with zero targeting. Teaching is crowded
and lower-margin by comparison. Back the winner the market already handed us.

### 4. Turn payments ON for hospitality + healthcare — as a price *test*.
We have never asked a human to pay; we have no willingness-to-pay data. Flip it on
for the two high-demand verticals, watch conversion, learn. Even 2% tells us more
than another month of polishing. Rubrics + report generation already work for all
11 verticals (verified live), so the only blocker is the env flag + gating.

### 5. Fix the assessment leak before any more B2C work.
70% bounce, likely the 11-step wall. Shorten it, surface the score teaser earlier
("you scored 78 — here's the one gate holding you back; unlock the rest"), make
finishing feel inevitable. More completed assessments = more value delivered AND
more saleable leads.

---

## Operational debt (unglamorous but real)

- **Manual dashboard SQL migrations are a liability.** Three copy-pasted this
  week. One fat-finger on `profiles` in prod and there's no rollback. Wire up the
  Supabase CLI or a real psql connection so migrations are *applied*, not pasted.
- **Uncapped GPT report generation = cost/abuse bomb at scale.** Free + automatic
  on every submit is fine at 20 users; at 2,000 it's a surprise OpenAI bill or an
  abuse vector. Cap before it matters.
- **Flying blind on the funnel.** We currently need ad-hoc DB queries to see
  conversion. We should glance at signup→assess→submit→score→book→pay daily. That
  dashboard beats three features.
- **Docs have drifted from reality.** CLAUDE.md says "teaching-only paid pilot";
  the code says "everything free, payments shelved." When the source of truth
  lies, decisions get made on fiction.

---

## What's genuinely good

The code is *better* than the business currently needs — that's the diagnosis,
not flattery. The scoring/cap engine is elegant, the RAG report pipeline is real,
the auth/idempotency discipline is strong. The builder is clearly capable. Which
is exactly why the honest nudge is: **we've proven we can build it — now prove
someone will pay, before building the next thing.**

---

## Action backlog (what we'll work through)

Ordered by leverage. Tick + date as we complete; mirror finished items into
`docs/TODO.md` Done.

- [ ] **A. Recruiter B2B pitch** — draft outreach to 3–5 UK/Gulf nursing (and
  hospitality) recruiters offering assessed, document-ready candidate leads.
  Decide the offer (per-lead / per-placement / referral split). _Highest leverage,
  zero new code._
- [ ] **B. Flip payments ON for healthcare + hospitality** — as a price test, not
  a launch. Confirm `PAYMENTS_ENABLED` path + per-category gating; decide whether
  to gate by category or globally. Watch conversion.
- [x] **C. Funnel dashboard** — _done 2026-06-02._ Live admin view at
  `/admin/funnel`: conversion funnel (registered→confirmed→started→submitted→
  paid→booked), the raw numbers snapshot, and signups-by-category. Backed by
  `lib/admin/funnel-metrics.ts` (single source of truth, mirrors the old
  `inventory-users.ts` numbers). Replaces ad-hoc DB queries.
- [ ] **D. Tighten the assessment flow** — diagnose the 70% drop; shorten / add
  early score teaser / strengthen save-and-resume. Re-measure completion.
- [ ] **E. Reposition the paid offer** — move the value from "a PDF" to "the call +
  coach + accountability / done-with-you", PDF as the artefact. Test messaging.
- [ ] **F. Reconcile docs with reality** — fix the "teaching-only pilot" vs
  "payments off" contradiction across CLAUDE.md / MVP plan so the source of truth
  is honest.
- [ ] **G. Ops hardening (later)** — proper migration tooling; cap free report
  generation.

_Recommended first two: **A (recruiter pitch) + B (paywall flip)**, in parallel._
