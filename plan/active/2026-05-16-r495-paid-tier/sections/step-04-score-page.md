---
step: 04
title: /members/[category]/score — band + LLM teasers + paywall (teaching-only)
status: blocked
depends: [02, 03]
plan: r495-paid-tier
scope-note: 2026-05-17 — teaching-only pilot. ScoringComingSoon component is NOT built in this iteration. If `loadRubric` returns null, redirect to `/dashboard` (site won't go public until all rubrics exist; no real user will hit this path during the friends-and-family test).
---

# Step 04: Score result page

## Objective

A new server page that shows the user their banded score, one top-strength line, one top-blocker line, and a paywall CTA. **Teaching only** for this iteration.

## Context

### Architecture

Route: `/members/[category]/score` (server component, gated by
`requireProfile`). Reads the user's latest **submitted** assessment for
their `profile.category`, calls `calculateScore`, then calls OpenAI for
two short teaser strings (one strength, one blocker), then renders.

If `loadRubric(category)` returns `null`, redirect to `/dashboard` — this iteration only ships the teaching rubric, and the site is private until all rubrics exist. No user-facing placeholder is built.

The page lives inside the existing members guard — `requireProfile`
already redirects unauth → `/login`, and the category guard checks
`profile.category === category`.

### Database

- Read `assessments` where `user_id = auth.uid()` AND `category = ...`,
  most recent `status='submitted'` row.
- If no submitted assessment exists: redirect to `/members/[category]/assessment`.
- Read `profiles.tier` for the page; if `tier='paid'`, link to the report
  download (the paywall is bypassed).

### Existing Patterns

LLM grounding pattern from existing `/api/search/answer`:
- Service-role Supabase client
- Prompt assembled from concrete context
- `gpt-4o-mini`, `temperature: 0.2`, JSON response_format

For the teasers we want even tighter constraints:
- Max ~150 tokens
- Returns JSON: `{ strength: string, blocker: string }`
- System prompt MUST cite a dimension + rubric reason; if the model
  doesn't reference a dimension, fall back to the highest/lowest scoring
  dimension's `reason`.

### Risk

- **R2 (hallucination):** Solution — pass the scored dimensions +
  contributing rules as context. The model picks ONE highest-scoring
  contributing rule for the strength, ONE lowest for the blocker, and
  rewrites the `reason` field into a 1-line sentence. We never ask
  "what's the user's strength?" without supplying the answer.

## Implementation

1. Create `app/members/[category]/score/page.tsx`:

```tsx
import { redirect } from 'next/navigation';
import { CATEGORIES } from '@/lib/categories';
import { requireProfile } from '@/lib/auth-guards';
import { loadRubric, calculateScore } from '@/lib/scoring';
import { getLatestAssessment } from '@/lib/assessments/assessment-client';
import { generateScoreTeasers } from '@/lib/scoring/teasers';
import ScoreResult from '@/components/ScoreResult';
import SiteNav from '@/components/SiteNav';

export default async function ScorePage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const { user, profile } = await requireProfile(`/members/${category}/score`);
  if (!profile) redirect('/dashboard');
  if (profile.category !== category) redirect(`/members/${profile.category}/score`);

  const rubric = await loadRubric(category);
  if (!rubric) {
    // Teaching-only pilot: site is private; no public path can reach a rubricless category.
    redirect('/dashboard');
  }

  const assessment = await getLatestAssessment(user.id);
  if (!assessment || assessment.status !== 'submitted') {
    redirect(`/members/${category}/assessment`);
  }

  const score = calculateScore(assessment.data, rubric);
  const { strength, blocker } = await generateScoreTeasers(score, category);

  return (
    <ScoreResult
      categoryLabel={CATEGORIES.find(c => c.id === category)?.label ?? category}
      band={score.band}
      strength={strength}
      blocker={blocker}
      isPaid={profile.tier === 'paid'}
    />
  );
}
```

2. Create `lib/scoring/teasers.ts`:

```ts
import OpenAI from 'openai';
import type { ScoreResult } from './types';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function generateScoreTeasers(
  score: ScoreResult,
  category: string,
): Promise<{ strength: string; blocker: string }> {
  // Pick the single highest-contribution rule from highest dimension
  const sortedDims = [...score.dimensions].sort((a, b) => b.score - a.score);
  const topDim = sortedDims[0];
  const worstDim = sortedDims[sortedDims.length - 1];
  const topRule = topDim.contributing.sort((a, b) => b.points - a.points)[0];
  const worstRule = worstDim.contributing.sort((a, b) => a.points - b.points)[0];

  const system = `You are an assessment summarizer for Jobabroad, a service helping South Africans work overseas. You will be given two rubric findings, each with a dimension label and a reason. Rewrite each as a single conversational sentence (max 22 words) in the "we" voice. Each sentence MUST explicitly name the dimension (e.g. "Your biggest blocker is likely documentation readiness — ..." or "Your strongest factor is credentials — ..."). This tells the reader what to fix, not just that something is off. NEVER add facts not in the input. NEVER hedge with "might" or "could". State the finding plainly. Return JSON: { "strength": "...", "blocker": "..." }`;

  const user = JSON.stringify({
    category,
    strength_finding: { dimension: topDim.label, reason: topRule.reason },
    blocker_finding: { dimension: worstDim.label, reason: worstRule.reason },
  });

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0.2,
    max_tokens: 150,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
  });

  try {
    const parsed = JSON.parse(completion.choices[0]?.message?.content ?? '{}');
    return {
      strength: String(parsed.strength ?? topRule.reason),
      blocker: String(parsed.blocker ?? worstRule.reason),
    };
  } catch {
    // Fall back to raw rubric reasons if LLM JSON parse fails
    return { strength: topRule.reason, blocker: worstRule.reason };
  }
}
```

3. Create `components/ScoreResult.tsx` — banded card with strength + blocker + paywall CTA (or "Download your report" for paid).

4. ~~Create `components/ScoringComingSoon.tsx`~~ — **Deferred.** Teaching-only pilot; site stays private until other rubrics ship. The null-rubric branch redirects to `/dashboard` instead.

5. Bands map to colour + copy:
   - `high_blockers` — red accent, "High blockers", "Significant gaps to close before applying"
   - `needs_prep`   — gold accent, "Needs prep", "Real potential, with clear gaps to address"
   - `strong_potential` — green accent, "Strong potential", "You're application-ready in most respects"

## Files to Create/Modify

| Action | File | Purpose |
|--------|------|---------|
| create | `app/members/[category]/score/page.tsx` | Server page |
| create | `lib/scoring/teasers.ts` | LLM-grounded teaser generation |
| create | `components/ScoreResult.tsx` | Banded card UI |
| ~~create~~ | `components/ScoringComingSoon.tsx` | **Deferred** — teaching-only pilot |

## Done When

1. `/members/healthcare/score` for a logged-in user with submitted assessment renders: band label + 1-line strength + 1-line blocker + paywall CTA "Get your full report + 15-min call — R495".
2. `/members/accounting/score` (or any non-teaching category) redirects to `/dashboard` — no public path can reach it, but the redirect is in place for safety. Teaching-only pilot.
3. Visiting `/score` without a submitted assessment redirects to `/assessment`.
4. Paid users (`profile.tier='paid'`) see "Download your report" CTA instead of paywall.
5. Teaser LLM never produces facts absent from the rubric's reason strings (verify by inspecting prompt + a sample run).
6. `npm run build` passes.

## Gotchas

- LLM has a small chance to add words like "should consider" or "might
  want to" — instruct against it in the prompt.
- Always fall back to raw rubric reason if JSON parsing fails. Never show
  an error state for what's essentially copy.
- Don't show the numeric score yet — that comes in the paid report.
  Public-facing is band + 2 lines only.
