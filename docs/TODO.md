# Jobabroad — TODO backlog

Working list we tackle one item at a time. Each item: status checkbox, who owns
it, the context, and a clear "done when". Tick the box and move it to **Done**
once complete.

_Last updated: 2026-06-02._

---

## Open

### 1. Apply the `call_notes` column drop (DB migration)
- **Owner:** John (manual — no DB connection locally)
- **Priority:** Medium
- **Effort:** ~30 seconds
- **Context:** Migration `supabase/migrations/20260601_drop_paid_reports_call_notes.sql`
  exists and all code references are already removed. The column still lingers in
  the live DB until the migration is run in the Supabase dashboard SQL editor.
  (Service-role key is a PostgREST JWT, not a psql credential — same manual-apply
  flow as the other migrations.)
- **Done when:** `paid_reports.call_notes` no longer exists in the live DB.
- **Claude can help:** hand over the exact SQL + a `!`-prefixed reminder.

### 2. Refresh stale dates in the seasonal pathway guide
- **Owner:** Claude
- **Priority:** Medium
- **Effort:** Small (direct patch) or one `/build-pathway seasonal` run
- **Context:** `content/pathways/seasonal.md:46` says "the 2025 season closing in
  early February" — that J-1 SWT season is past (today is 2026-06-02; the 2026
  window already closed Jan–Feb and started). Other "2025–2026" references are
  forward-looking and fine; this is the one clearly-stale line.
- **Done when:** J-1 SWT timing references the current/next open season, no past
  season cited as if upcoming. Re-run `npm run reindex -- --category=seasonal`
  after editing.

### 3. Investigate the Vercel "deployment failed" email
- **Owner:** John (provide URL) → Claude (investigate)
- **Priority:** Low
- **Effort:** Small once URL is in hand
- **Context:** Flagged 2026-06-01. CLI showed all 4 projects green + site serving
  200, so likely a stale or other-scope notification. Blocked on the deployment
  URL from the email.
- **Done when:** Confirmed stale/other-scope, or root-caused and fixed if real.

### 4. Live-render QA PDFs for the changed rubrics
- **Owner:** Claude
- **Priority:** Low (verification follow-up)
- **Effort:** Medium (one render per vertical, uses OpenAI + corpus)
- **Context:** On 2026-06-02 all 11 rubrics were domain-reviewed, but only
  *healthcare* was eyeballed end-to-end in an actual PDF. The new caps/gates
  render on the `/score` page and PDF cover. Worth confirming a representative
  few render correctly: au-pair (own-children numeric cap), tefl (no-degree /
  no-cert), trades (Red Seal cap + cash-in-hand experience).
- **Done when:** Spot-checked PDFs for ~3 representative verticals show the gate
  callout + corrected scoring as expected. Use the `scripts/render-*-live.ts`
  pattern (`scripts/render-healthcare-live.ts` is the template).

---

## Done

- ✅ **2026-06-02 — All 11 scoring rubrics domain-reviewed** (healthcare,
  accounting, engineering, it-tech, trades, teaching, tefl, hospitality, farming,
  seasonal, au-pair). Engine gained band-capping (`when_value` + `when_min`) and
  multi-field `best_match` (`field_ids`). Each committed individually to `main`.
