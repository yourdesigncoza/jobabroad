---
step: 08
title: PDF report generator (@react-pdf/renderer + Supabase Storage cache)
status: ready
depends: []
plan: r495-paid-tier
---

# Step 08: PDF report generator

## Objective

Server-side PDF generation via `@react-pdf/renderer`. Fixed template with
LLM-filled sections, grounded in (a) user answers, (b) score breakdown,
(c) pgvector pathway corpus. Cached in Supabase Storage `paid-reports`
bucket. One PDF per user — regen overwrites.

## Context

### Architecture

Template structure (fixed, NEVER added to by LLM):

1. **Cover** — user name, category, score band, generation date
2. **Your Score Breakdown** — overall + each dimension's score + weight (from rubric)
3. **What's Working** — LLM-generated, grounded in highest-scoring dimensions + their rules
4. **What's Blocking You** — LLM-generated, grounded in lowest-scoring dimensions + their rules
5. **Recommended Next 3 Actions** — LLM-generated, each action cites a specific gap from §4 and a corpus chunk for context
6. **Contacts & Resources** — LLM picks 3-5 corpus chunks from the per-category index that match the user's biggest gaps; render heading + short excerpt + source link
7. **Disclaimer** — fixed paragraph about information service, not advice

**Length cap: 3–5 pages MAX.** The audience has a short attention span and the value is clarity, not page count. Tune section copy length so the rendered PDF stays in this range — if it grows past 5 pages, tighten the LLM `max_tokens` per section (start: §3 / §4 ≤ 120 tokens each, §5 actions ≤ 60 tokens each, §6 excerpts ≤ 40 tokens each). Treat 3–5 pages as a hard acceptance criterion, not a soft goal.

LLM prompts: one prompt per LLM-section, with structured input. Always
JSON output. Always grounded in concrete inputs — same constraint as
score teasers (step 04).

### Database

- Read assessment answers + score breakdown
- Read pgvector chunks via existing search-pathway edge function or
  direct query on `pathway_chunks`
- Insert/update `paid_reports(user_id, pdf_path, generated_at)`
- Upload PDF bytes to `paid-reports` bucket at path
  `{user_id}/report-{generated_at}.pdf` so old PDFs are kept (small
  storage cost; useful if John wants to compare versions)

### Existing Patterns

`@react-pdf/renderer` API:
```tsx
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { renderToBuffer } from '@react-pdf/renderer';

const Report = ({ data }: { data: ReportData }) => (
  <Document>
    <Page size="A4" style={styles.page}>...</Page>
  </Document>
);

const buffer = await renderToBuffer(<Report data={...} />);
```

Bundle a Unicode-safe font (Inter or DM Sans matching site typography)
to handle R/✓/em-dash:
```tsx
Font.register({
  family: 'DM Sans',
  src: '/fonts/dm-sans.ttf', // place in /public/fonts/
});
```

### Risk

- **R3:** @react-pdf-renderer can choke on unsupported Unicode if no
  font registered. Solution: bundle a known font file in `/public/fonts/`
  and register it explicitly.
- **R9:** `paid-reports` bucket MUST be private. Always serve via signed
  URL (5-min expiry). Never embed bucket URL directly.
- **R10:** Scope creep. The template's sections are fixed — LLM only
  fills text in pre-defined slots. Adding a new section requires a
  template change.

## Implementation

1. Install deps:
   ```bash
   npm install @react-pdf/renderer
   ```

2. Download DM Sans TTF (matches site UI font) to `public/fonts/dm-sans.ttf`. License: SIL OFL (permissive).

3. Create `lib/reports/types.ts`:
```ts
export interface ReportData {
  userName: string;
  categoryLabel: string;
  generatedAt: string;
  score: ScoreResult;           // from lib/scoring/types
  whatsWorking: string;          // markdown-ish string, LLM output
  whatsBlocking: string;         // same
  nextActions: Array<{ title: string; body: string }>;  // 3 items
  contacts: Array<{ heading: string; excerpt: string; source: string }>;
}
```

4. Create `lib/reports/pdf-template.tsx` — pure render of `ReportData` into a `<Document>`.

5. Create `lib/reports/generator.ts`:
```ts
export async function generateReport(userId: string): Promise<{ pdfPath: string; signedUrl: string }> {
  // 1. Load user + profile + latest submitted assessment
  // 2. calculateScore(answers, rubric)
  // 3. Generate each LLM section (parallel where possible):
  //    - whatsWorking from score + top dimensions
  //    - whatsBlocking from score + bottom dimensions  
  //    - nextActions from blocking + corpus search
  //    - contacts from corpus search (top 3-5 chunks)
  // 4. Assemble ReportData
  // 5. renderToBuffer(<ReportTemplate data={data} />)
  // 6. Upload to Supabase Storage `paid-reports/{userId}/report-{ts}.pdf`
  // 7. Upsert paid_reports row with new pdf_path
  // 8. Return { pdfPath, signedUrl (5-min) }
}
```

6. Create `app/api/reports/generate/route.ts`:
```ts
export async function POST(req: NextRequest) {
  const ssr = await createSupabaseServerClient();
  const { data: { user } } = await ssr.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauth' }, { status: 401 });

  const { data: profile } = await ssr.from('profiles').select('tier').eq('user_id', user.id).single();
  if (profile?.tier !== 'paid') return NextResponse.json({ error: 'paid only' }, { status: 403 });

  const { signedUrl } = await generateReport(user.id);
  return NextResponse.json({ url: signedUrl });
}
```

7. Create `app/api/reports/download/route.ts` (GET):
   - If `paid_reports` row exists, return signed URL (regenerated each request, 5-min expiry).
   - If missing, call `generateReport` then redirect to signed URL.

8. LLM prompts: tight structured prompts (per template section) that
   return JSON. Same anti-hallucination constraints as step 04 — every
   sentence cites a rubric rule or a corpus chunk.

## Files to Create/Modify

| Action | File | Purpose |
|--------|------|---------|
| modify | `package.json` | Add `@react-pdf/renderer` |
| create | `public/fonts/dm-sans.ttf` | Unicode-safe font for PDF |
| create | `lib/reports/types.ts` | ReportData interface |
| create | `lib/reports/pdf-template.tsx` | Pure render component |
| create | `lib/reports/generator.ts` | Orchestrates LLM + Supabase + render |
| create | `app/api/reports/generate/route.ts` | POST endpoint (re-gen) |
| create | `app/api/reports/download/route.ts` | GET — signed URL |

## Done When

1. `generateReport(userId)` returns a working PDF stored in Supabase Storage.
2. PDF renders with Unicode chars (R, ✓, em-dash, etc.) — no `□` boxes.
3. **Generated PDF is 3–5 pages.** Spot-check with two sample users (one "Strong potential", one "High blockers"). If either exceeds 5 pages, tighten the per-section `max_tokens` before shipping.
4. Bucket `paid-reports` is NOT publicly listable; URLs only via signed paths.
5. GET `/api/reports/download` returns signed URL within 1 second when PDF exists.
6. Free user calling `/api/reports/generate` gets 403.
7. Build passes; `@react-pdf/renderer` doesn't get bundled into client.

## Gotchas

- `@react-pdf/renderer` is server-only. NEVER import from a `'use client'`
  file. Keep template + generator in `lib/`.
- LLM cost per report: ~$0.02 with gpt-4o-mini. Cache aggressively.
- Don't store the rendered PDF as base64 in the DB — use Storage.
- Generation can take 8-15s (multiple LLM calls). Either run as a
  background job, or show a "Generating your report…" interstitial.
  Simplest: synchronous on first request, then cached.
