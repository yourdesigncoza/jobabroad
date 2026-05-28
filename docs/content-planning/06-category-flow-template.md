# Category Flow Template — Teaching as the gold standard

**Goal:** finalise every category's member/paid flow to match **teaching**, the one complete
category. This doc maps the teaching flow end to end, marks what is category-agnostic vs
category-specific, and gives a per-category "definition of done". Start here before building
any other category's flow.

## The end-to-end flow (teaching = reference)

| # | Stage | Route / file | Category-specific? |
|---|---|---|---|
| 1 | Capture interest | `/` landing tiles, `buildWhatsAppLink` | No — driven by `lib/categories.ts` |
| 2 | Register (category locked) | `/register?category=…` → Supabase Auth | No |
| 3 | Pathway guide | `/members/[category]` ← `content/pathways/[category].md` | Content exists for all 11 |
| 4 | Assessment | `/members/[category]/assessment` → `AssessmentWizard` ← `lib/assessments/steps/[category].ts` | **Yes — needs a steps file** |
| 5 | Score | `/members/[category]/score` → `loadRubric` + `calculateScore` | **Yes — needs a rubric** |
| 6 | Score narratives + email | `lib/scoring/narratives.ts`, `lib/notifications/score-email.ts` | No — take `category` as a param, LLM-generated |
| 7 | Checkout | `/members/[category]/paid`, `/api/payments/checkout` (Paystack) | No |
| 8 | Webhook → paid | `/api/payments/webhook` → `tier='paid'` → `waitUntil(generateAndEmail)` | No |
| 9 | Paid report (PDF) | `lib/reports/generator.ts` → `searchCorpus(category)` → GPT → PDF | No — but **hard-depends on the rubric** (see below) |
| 10 | Booking (optional) | `/members/[category]/book` (Cal.com + POPIA) | No |
| 11 | Post-call notes | `/admin/post-call` → `paid_reports.call_notes` | No |
| 12 | AI coach (paid) | `/members/[category]/coach`, `/api/agent/*` | No — RAG chat, category-driven |

## The single gate: the rubric

The score page (`app/members/[category]/score/page.tsx`) is **entirely category-agnostic
except one line** — `loadRubric(category)`. If it returns null the user is bounced to
`/dashboard`. And the paid report (`lib/reports/generator.ts:~253`) does
`if (!rubric) throw new Error('no_rubric_for_<category>')`.

**So the rubric is the one thing gating both the score page and the paid report.** Everything
downstream — narratives, score email, RAG report, trusted-partner matching, the AI coach —
already takes `category` and works generically. Author the rubric, register it, and the whole
paid flow lights up for that category.

## Per-category Definition of Done (match teaching)

A category's flow is "finalised to match teaching" when:

1. **Pathway guide** exists — `content/pathways/[category].md` ✅ (all 11 done).
2. **Assessment steps** exist — `lib/assessments/steps/[category].ts`, registered in
   `lib/assessments/steps/index.ts`.
3. **Rubric** exists — `lib/scoring/rubrics/[category].json`, registered in
   `loadRubric()` (`lib/scoring/index.ts`).
4. The rubric's `field_id`s and option strings **exactly match** that category's assessment
   steps (the engine matches on literal strings — see below).
5. Smoke-tested: submit an assessment → `/score` renders a band + dimensions → (paid) report
   generates without `no_rubric_for_*`.

## Current status

| Category | Pathway | Assessment steps | Rubric | Flow complete? |
|---|---|---|---|---|
| teaching | ✅ | ✅ | ✅ | **✅ reference** |
| healthcare | ✅ | ✅ | ❌ | rubric only |
| seasonal | ✅ | ✅ | ❌ | rubric only |
| farming | ✅ | ✅ | ❌ | rubric only |
| hospitality | ✅ | ✅ | ❌ | rubric only |
| tefl | ✅ | ✅ | ❌ | rubric only |
| au-pair | ✅ | ✅ | ❌ | rubric only |
| engineering | ✅ | ✅ | ❌ | rubric only |
| trades | ✅ | ✅ | ❌ | rubric only |
| it-tech | ✅ | ✅ | ❌ | rubric only |
| **accounting** | ✅ | ❌ **missing** | ❌ | **steps + rubric** |

So: 9 categories need **just a rubric**; **accounting needs an assessment steps file first**,
then a rubric. (Accounting isn't in the steps `REGISTRY`, and there's no `accounting.ts`.)

## How to author a rubric (from the teaching example)

A rubric is `lib/scoring/rubrics/[category].json`:

```jsonc
{
  "category": "<id>",
  "version": 1,
  "bands": { "high_blockers_lt": 40, "needs_prep_lt": 70 },   // optional; these are the defaults
  "dimensions": [
    { "key": "...", "label": "...", "weight": 0.30, "rules": [ /* … */ ] }
  ]
}
```

- **Weights** across dimensions should sum to 1.0. The overall score is the weighted average
  of each dimension's 0–100 score; the band is derived from the `bands` thresholds.
- **Rule types** (from `lib/scoring/index.ts`):
  - `match` — map an exact option string → points (+ a `reason` per option). Used for selects.
  - `range` — numeric field → first matching `{ lt, score, reason }` (last entry is the
    fallback). Used for numbers like years of experience.
  - `present` — field is non-empty → `score`, else 0 (`reason.present` / `reason.absent`).
  - `count` — array length × `per_item`, capped at `max`. Used for multiselects.
- **Exact-match requirement (critical):** `field_id`s must equal the assessment step field IDs,
  and `match` keys must equal the option strings **character-for-character** (e.g.
  `"Active (full)"`). A mismatch silently scores 0. Always open the category's
  `lib/assessments/steps/[category].ts` and copy IDs/options verbatim.

**Reusable dimensions** (most categories share these, adapt the credential one): Credentials &
Registration (the category's regulator — NMBI/AHPRA/SACE/ECSA/etc.), Experience, Language,
Documents & Finances, Family & Timing. The `documents.*`, `readiness.english_*`,
`situation.family_status` and `readiness.target_timeline` fields are common across the step
files, so those rules port with minimal change.

## Recommended sequence

1. **Healthcare** rubric first (highest demand; routes already driving traffic).
2. Then the categories with the most route/blog traffic (watch Search Console).
3. **Accounting** last among the rubrics — it needs an assessment steps file built first.

> Scoring drives a user-facing viability verdict (YMYL). Draft each rubric from the teaching
> logic + the verified route research, but have the scoring/weights reviewed before it goes
> live.
