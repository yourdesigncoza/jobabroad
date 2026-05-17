---
step: 02
title: Personal-context section — 5 Qs added to teaching assessment (other categories deferred)
status: ready
depends: []
plan: r495-paid-tier
scope-note: 2026-05-17 — teaching-only pilot. SITUATION_STEP file is still created as a shared module, but only `teaching.ts` imports it for this iteration. Other 10 categories pick it up when their rubrics ship.
---

# Step 02: Personal-context section

## Objective

Add a new "Your situation" section with 5 questions to every category's
assessment. These answers drive both the rule-based scoring (family /
financial readiness dimensions) and the LLM grounding for teaser lines
and the paid report.

## Context

### Architecture

Each category has its own step definition file at
`lib/assessments/steps/{category}.ts`. Each file exports an ordered list
of steps; the first step is typically `personal` (name/age/city/whatsapp).
The new section should sit after `personal` and before the
category-specific sections, so it's gathered early for the LLM but feels
contextual to the user.

Existing AssessmentWizard renders these steps in order; saves answers to
`assessments.data` JSONB as `{ [field.id]: { q, v } }`.

Implementation pattern: add a shared `situation` step exported from
`lib/assessments/steps/situation.ts` and import it into each category file.

### Database

No schema changes. Answers persist into existing `assessments.data` JSONB
under keys like `situation.family_status`, `situation.dependants`, etc.

### Existing Patterns

Question types supported by `AssessmentStep`:
- `text`, `number`, `radio`, `checkbox`, `select`, `range`

Each question has `{ id, version, label, type, options?, placeholder?, hint?, validation? }`.

### Risk

- Adding fields mid-flight for users with in-progress assessments: the
  new section's keys won't exist in their saved `data`. AssessmentWizard
  treats missing values as empty and the user can fill them on continue.
  No migration of stored data needed.
- Don't expose answer **labels** publicly — they're for John's read of
  the answers.

## Implementation

1. Create `lib/assessments/steps/situation.ts`:

```ts
import type { Step } from '../types';

export const SITUATION_STEP: Step = {
  slug: 'situation',
  title: 'Your situation',
  description: 'A few questions about your circumstances so we can sharpen the assessment.',
  fields: [
    {
      id: 'situation.family_status',
      version: 1,
      label: 'Family status',
      type: 'radio',
      options: [
        { value: 'single', label: 'Single, no dependants' },
        { value: 'partnered_no_kids', label: 'Married/partnered, no children' },
        { value: 'partnered_with_kids', label: 'Married/partnered with children' },
        { value: 'single_parent', label: 'Single parent with children' },
        { value: 'caring_for_parents', label: 'Supporting elderly parents in SA' },
      ],
    },
    {
      id: 'situation.dependants',
      version: 1,
      label: 'Number of dependants who would relocate with you',
      type: 'number',
      placeholder: '0',
      hint: '0 = going alone; include spouse + children + others moving with you',
    },
    {
      id: 'situation.savings_band',
      version: 1,
      label: 'Available savings for relocation costs',
      type: 'radio',
      options: [
        { value: 'under_20k',  label: 'Under R20,000' },
        { value: '20k_50k',    label: 'R20,000 — R50,000' },
        { value: '50k_150k',   label: 'R50,000 — R150,000' },
        { value: '150k_500k',  label: 'R150,000 — R500,000' },
        { value: 'over_500k',  label: 'Over R500,000' },
      ],
    },
    {
      id: 'situation.urgency',
      version: 1,
      label: 'When do you want to be working abroad?',
      type: 'radio',
      options: [
        { value: 'asap',         label: 'As soon as possible (within 6 months)' },
        { value: '6_12_months',  label: '6 — 12 months' },
        { value: '1_2_years',    label: '1 — 2 years' },
        { value: 'exploring',    label: 'Just exploring options' },
      ],
    },
    {
      id: 'situation.current_employment',
      version: 1,
      label: 'Current employment status',
      type: 'radio',
      options: [
        { value: 'employed_fulltime',  label: 'Employed full-time in my field' },
        { value: 'employed_other',     label: 'Employed in a different field' },
        { value: 'self_employed',      label: 'Self-employed / contracting' },
        { value: 'studying',           label: 'Studying / recently qualified' },
        { value: 'unemployed',         label: 'Unemployed' },
      ],
    },
  ],
};
```

2. Import `SITUATION_STEP` into **`lib/assessments/steps/teaching.ts` only** for this iteration and insert it as the second step (after `personal`):

```ts
import { SITUATION_STEP } from './situation';

export const TEACHING_STEPS: Step[] = [
  PERSONAL_STEP,
  SITUATION_STEP,        // ← new
  // …existing teaching-specific steps
];
```

**Other 10 category files are NOT touched in this iteration.** They keep their existing flow and will pick up SITUATION_STEP when their rubrics ship in a future plan.

3. Update Zod schema in `lib/assessments/schemas/assessment.ts` if it
   enumerates keys (check whether it whitelists keys; if it allows
   arbitrary `${slug}.${field}` keys, no change needed).

## Files to Create/Modify

| Action | File | Purpose |
|--------|------|---------|
| create | `lib/assessments/steps/situation.ts` | Shared 5-Q personal-context step |
| modify | `lib/assessments/steps/teaching.ts` | Insert SITUATION_STEP |
| modify | `lib/assessments/schemas/assessment.ts` | If keys are whitelisted, add the 5 new keys |
| ~~modify~~ | other 10 category step files | **Deferred** — teaching-only pilot |

## Done When

1. `lib/assessments/steps/situation.ts` exports `SITUATION_STEP` with 5 fields.
2. `teaching.ts` imports + includes it as step #2.
3. Build passes; AssessmentWizard renders the new step between Personal and the first teaching-specific step.
4. Visiting `/members/teaching/assessment` shows "Your situation" as step 2 of N.

## Gotchas

- Don't rename or remove existing field IDs in other steps — assessments
  stored by previous users key off them.
- `version: 1` on each new field — bumps later if you change semantics.
