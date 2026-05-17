---
step: 03
title: Scoring engine + teaching rubric (healthcare/farming deferred)
status: ready
depends: []
plan: r495-paid-tier
scope-note: 2026-05-17 — teaching-only pilot. Engine is generic; only `teaching.json` ships in this iteration. Healthcare/farming rubrics ship in a later plan once teaching flow is validated.
---

# Step 03: Scoring engine + teaching rubric

## Objective

A pure, deterministic scoring function and the **teaching** category rubric. Same answers → same score, always. Multi-dimensional (3–5 dimensions) with weighted overall. Healthcare/farming rubrics are deferred — the engine handles them transparently when they're added later (just drop JSON in `lib/scoring/rubrics/`).

## Context

### Architecture

Score is computed server-side from `assessments.data` (JSONB of
`{ field.id: { q, v } }`) + a rubric JSON. Returns:

```ts
{
  overall: number;           // 0–100
  band: 'high_blockers' | 'needs_prep' | 'strong_potential';
  dimensions: Array<{
    key: string;             // e.g. 'credentials'
    label: string;           // e.g. 'Credentials & Registration'
    score: number;           // 0–100
    weight: number;          // 0–1, sums to 1 across dimensions
    contributing: Array<{    // for the paid report breakdown
      field_id: string;
      value: unknown;
      points: number;        // contribution to this dimension
      reason: string;        // human-readable
    }>;
  }>;
}
```

Bands (configurable per rubric, default thresholds):
- `0 ≤ overall < 40`  → `high_blockers`
- `40 ≤ overall < 70` → `needs_prep`
- `70 ≤ overall ≤ 100` → `strong_potential`

### Rubric JSON shape

```json
{
  "category": "healthcare",
  "version": 1,
  "dimensions": [
    {
      "key": "credentials",
      "label": "Credentials & Registration",
      "weight": 0.35,
      "rules": [
        {
          "field_id": "credentials.sanc_registered",
          "type": "match",
          "match": { "yes": 100, "no": 0 },
          "reason": { "yes": "SANC-registered ✓", "no": "Not SANC-registered — must complete before applying overseas" }
        },
        {
          "field_id": "credentials.years_experience",
          "type": "range",
          "ranges": [
            { "lt": 1, "score": 20, "reason": "Under 1 year of post-registration experience — most pathways require ≥2 years" },
            { "lt": 2, "score": 50, "reason": "1–2 years experience — some pathways open" },
            { "lt": 5, "score": 80, "reason": "2–5 years experience — most pathways open" },
            { "score": 100, "reason": "5+ years experience — strong applicant" }
          ]
        }
      ]
    },
    {
      "key": "language",
      "label": "Language",
      "weight": 0.15,
      "rules": [ … ]
    },
    {
      "key": "finances",
      "label": "Financial Readiness",
      "weight": 0.20,
      "rules": [
        {
          "field_id": "situation.savings_band",
          "type": "match",
          "match": {
            "under_20k": 10, "20k_50k": 35, "50k_150k": 65, "150k_500k": 85, "over_500k": 100
          },
          "reason": {
            "under_20k": "Savings below typical R30–80k pre-departure budget",
            "20k_50k": "Savings cover some pre-departure costs but tight",
            "50k_150k": "Comfortable pre-departure budget",
            "150k_500k": "Strong financial position",
            "over_500k": "Financially well-prepared"
          }
        }
      ]
    },
    {
      "key": "family",
      "label": "Family Readiness",
      "weight": 0.15,
      "rules": [
        {
          "field_id": "situation.family_status",
          "type": "match",
          "match": {
            "single": 100,
            "partnered_no_kids": 80,
            "partnered_with_kids": 60,
            "single_parent": 40,
            "caring_for_parents": 30
          },
          "reason": { /* per status */ }
        }
      ]
    },
    {
      "key": "urgency",
      "label": "Timing & Commitment",
      "weight": 0.15,
      "rules": [
        {
          "field_id": "situation.urgency",
          "type": "match",
          "match": { "asap": 100, "6_12_months": 80, "1_2_years": 60, "exploring": 30 },
          "reason": { /* per */ }
        }
      ]
    }
  ]
}
```

Rule types supported by the engine:
- `match` — literal value → score
- `range` — numeric, first match in order (`lt: X` means < X; final `{score}` is default)
- `present` — answered (non-empty) → score; absent → 0
- `count` — for checkboxes; counts selected items, maps to score

### Existing Patterns

The `assessments` table stores `data` as `{ [field.id]: { q, v } }` —
extract `v` for scoring.

### Risk

- **R7:** Rubric authoring is the slow part. Ship rubrics with sensible
  defaults; John iterates without redeploy (rubrics are just JSON).
- Missing fields (user skipped a step) — engine should award `0` for that
  rule's contribution, not throw. Dimension score = sum(points)/sum(max_points).

## Implementation

1. Create `lib/scoring/types.ts` exporting the types above.

2. Create `lib/scoring/index.ts` with:

```ts
export async function loadRubric(category: string): Promise<Rubric | null> {
  // dynamic import: lib/scoring/rubrics/{category}.json
  try { return (await import(`./rubrics/${category}.json`)).default as Rubric; }
  catch { return null; }
}

export function calculateScore(answers: AnswersJsonb, rubric: Rubric): ScoreResult {
  // 1. For each dimension, evaluate each rule
  // 2. Sum points, divide by max possible per dimension → dimension score 0-100
  // 3. Overall = sum(dimension.score * dimension.weight)
  // 4. Map overall to band
  // 5. Return ScoreResult with `contributing` rows for paid report breakdown
}
```

Pure function, deterministic, no LLM. Unit-testable but per CLAUDE.md no
test infra besides Playwright — add inline assertions to step 13.

3. Create **one** rubric JSON:
   - `lib/scoring/rubrics/teaching.json`

   v1 skeleton with ~5 dimensions × 2–3 rules each (credentials/registration, language, finances, family-readiness, urgency). John iterates.

4. Healthcare/farming and the other 8 categories: no rubric file in this iteration. `loadRubric('healthcare')` etc. returns `null` — step 04 handles that by redirecting to the WhatsApp tile (see step-04 scope-note; the in-product "manual review" placeholder is also out of scope until site goes public).

## Files to Create/Modify

| Action | File | Purpose |
|--------|------|---------|
| create | `lib/scoring/types.ts` | TS types for Rubric, ScoreResult |
| create | `lib/scoring/index.ts` | `loadRubric()` + `calculateScore()` |
| create | `lib/scoring/rubrics/teaching.json` | v1 skeleton rubric |
| ~~create~~ | `lib/scoring/rubrics/healthcare.json` | **Deferred** — teaching-only pilot |
| ~~create~~ | `lib/scoring/rubrics/farming.json` | **Deferred** — teaching-only pilot |

## Done When

1. `calculateScore(answers, rubric)` is pure and returns the documented shape.
2. Same inputs produce identical outputs across calls.
3. `teaching.json` exists and passes JSON schema validation (compile via TS import).
4. `loadRubric('engineering')` (and every category except teaching) returns `null`.
5. `npm run build` passes — including TS strictness on the engine.

## Gotchas

- Don't mix rubric authoring with engine logic. Engine is one file; each
  rubric is its own JSON. Schema for rubric should be documented in
  `lib/scoring/types.ts`.
- The `contributing[].reason` strings are user-facing in the paid report
  — write them in plain English, not jargon.
- Score must clamp to `[0, 100]` — even if a rubric is misconfigured.
