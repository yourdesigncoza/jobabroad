# Jobabroad — TODO backlog

Working list we tackle one item at a time. Each item: status checkbox, who owns
it, the context, and a clear "done when". Tick the box and move it to **Done**
once complete.

_Last updated: 2026-06-02._

---

## Open

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

- ✅ **2026-06-02 — Vercel "deployment failed" email resolved.** Confirmed
  stale/other-scope — all projects green, site serving 200. No real failure.
- ✅ **2026-06-02 — Dropped `paid_reports.call_notes` from the live DB.**
  Ran `alter table paid_reports drop column if exists call_notes;` in the Supabase
  SQL editor ("Success. No rows returned"). Column gone; code references were
  already removed. Migration `supabase/migrations/20260601_drop_paid_reports_call_notes.sql`
  now reflects live state.
- ✅ **2026-06-02 — Refreshed stale J-1 SWT date in seasonal guide.**
  `content/pathways/seasonal.md` no longer cites the past 2025 season as upcoming;
  now points to the 2027 season window (2026 already closed, participants on
  placement). Re-ran `npm run reindex -- --category=seasonal` (404/404 chunks).
- ✅ **2026-06-02 — All 11 scoring rubrics domain-reviewed** (healthcare,
  accounting, engineering, it-tech, trades, teaching, tefl, hospitality, farming,
  seasonal, au-pair). Engine gained band-capping (`when_value` + `when_min`) and
  multi-field `best_match` (`field_ids`). Each committed individually to `main`.
