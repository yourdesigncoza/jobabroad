---
step: 05
title: AssessmentWizard — redirect to /score on submit instead of AssessmentConfirmation
status: blocked
depends: [04]
plan: r495-paid-tier
---

# Step 05: Wizard redirect to score

## Objective

After the user clicks the final "Submit" in the assessment wizard,
navigate them to `/members/[category]/score` instead of showing the
existing in-page `AssessmentConfirmation` component.

## Context

### Architecture

`components/AssessmentWizard.tsx` currently:
1. POSTs to `/api/assessment/submit` to mark the assessment submitted
2. Sets local `submitted=true`
3. Renders `<AssessmentConfirmation />` inline

New behaviour:
1. POSTs to `/api/assessment/submit` (unchanged)
2. On success, `router.push('/members/<category>/score')`
3. `<AssessmentConfirmation />` component is no longer rendered here

### Database

No changes. The submit endpoint already sets `status='submitted'` +
`submitted_at`.

### Existing Patterns

`useRouter().push()` from `next/navigation` — wizard is a client
component already.

### Risk

- AssessmentConfirmation is currently shown if the user re-opens the
  assessment after submission (re-entry guard via `initialStatus`).
  Decision: keep the inline `submitted` state branch for that case —
  it's not the same path as a fresh submit.
- Actually simpler: on initial mount, if `initialStatus === 'submitted'`,
  immediately `router.push('/members/<category>/score')`. That way
  re-entry also routes to the score, never showing the old confirmation
  page. Then we can delete `AssessmentConfirmation.tsx` entirely.

## Implementation

1. In `components/AssessmentWizard.tsx`:
   - Import `useRouter` from `next/navigation`.
   - In the `handleNext` function (final step branch, after the
     `/api/assessment/submit` fetch):
     ```ts
     router.push(`/members/${category}/score`);
     ```
   - Remove the `submitted` state branch entirely (and the
     `AssessmentConfirmation` import + render).
   - On mount, if `initialStatus === 'submitted'`, immediately
     `router.push(...)`.

2. Delete `components/AssessmentConfirmation.tsx` (unreferenced after the
   above).

3. Verify no other component imports `AssessmentConfirmation`:
   `grep -rn "AssessmentConfirmation" components app --include='*.tsx'`

## Files to Create/Modify

| Action | File | Purpose |
|--------|------|---------|
| modify | `components/AssessmentWizard.tsx` | Redirect on submit + re-entry |
| delete | `components/AssessmentConfirmation.tsx` | No longer used |

## Done When

1. Submitting the final step in the wizard navigates to `/members/[category]/score`.
2. Re-opening the assessment after submission also redirects to `/score`.
3. `AssessmentConfirmation.tsx` is deleted.
4. `grep AssessmentConfirmation` returns no matches.
5. Build passes.

## Gotchas

- Push happens after the `submit` POST resolves successfully. If submit
  fails, stay on the wizard with a surfaced error.
- `router.push()` doesn't unmount the wizard immediately; ensure the
  wizard's interim state doesn't flash before navigation.
