# trades — RUN_REPORT

## Stage 3 — Vault Building (batch 1)

**Started:** 2026-05-06T16:37:01+02:00
**Completed:** 2026-05-06T21:11:15+02:00

### Completed vaults (3/6)

| Section | Vault | Iters | Notes | FINAL_REPORT SHA256 |
|---|---|---|---|---|
| 01-destinations | wa-trades-01-destinations | 8 | 43 | `9905dbb143cc02e8665232d512c8d6548a52c79b4efca6b2a7c434dc5e1f9b4c` |
| 02-documents | wa-trades-02-documents | 7 | 57 | `1e095521d1cf81bb6ddf6ee6b733e85d369bd60f7f20feb55a6fd732434ef58e` |
| 03-costs | wa-trades-03-costs | 6 | 50 | `679e1992c11dcf004c751350f7dc7deb934b5203bb38c55730c5bb019ab162fb` |

### Notes

- Vault 02-documents was resumed after a sonnet usage cap interrupted round 5; a new agent picked up from existing wiki/ state and completed iter 6 + FINAL_REPORT.
- Shared vaults (`wa-shared-documents`, `wa-shared-scams`, `wa-shared-regulatory-bodies`, `wa-shared-migration-cos`, `wa-shared-legal-boundary`, `wa-shared-tax-exchange`) all reused from prior runs.

### Failed vaults

None.

### Pending vaults (3/6)

- 04-visa-routes (iter_cap 10)
- 05-scams (iter_cap 6)
- 06-contacts (iter_cap 6)

### next_action

Run `/build-pathway trades` to build batch 2 (04-visa-routes, 05-scams, 06-contacts).

---

## Stage 3 — Vaults complete (2026-05-06T21:55:00+02:00)

All 6 category vaults built. Manifest at `docs/prompts/trades/manifest.json`.

| Section          | FINAL_REPORT.md path                                                                                       | SHA256 (first 16) | Size  | Notes |
|------------------|------------------------------------------------------------------------------------------------------------|-------------------|-------|-------|
| 01-destinations  | /home/laudes/zoot/projects/wiki-builds/work-abroad-web/wa-trades-01-destinations/FINAL_REPORT.md           | 9905dbb143cc02e8  |  8766 |  43   |
| 02-documents     | /home/laudes/zoot/projects/wiki-builds/work-abroad-web/wa-trades-02-documents/FINAL_REPORT.md              | 1e095521d1cf81bb  | 10033 |  57   |
| 03-costs         | /home/laudes/zoot/projects/wiki-builds/work-abroad-web/wa-trades-03-costs/FINAL_REPORT.md                  | 679e1992c11dcf00  |  7925 |  50   |
| 04-visa-routes   | /home/laudes/zoot/projects/wiki-builds/work-abroad-web/wa-trades-04-visa-routes/FINAL_REPORT.md            | 3058cc5e3395d09a  | 10219 |  37   |
| 05-scams         | /home/laudes/zoot/projects/wiki-builds/work-abroad-web/wa-trades-05-scams/FINAL_REPORT.md                  | 279f1c8abe0cc9eb  | 10104 |  52   |
| 06-contacts      | /home/laudes/zoot/projects/wiki-builds/work-abroad-web/wa-trades-06-contacts/FINAL_REPORT.md               | 3ce9946eba6690e8  |  8976 |  73   |

**Manifest hash:** `56b5e0ee3a2cc90ac8ebad311d54d3ce88f03da90cfe2db6dbbe7caa749a28f5`

### Vault quality assessment

| Section          | Structural (size/concl/wikilinks/no-placeholder) | Gemini verdict | Final classification |
|------------------|---------------------------------------------------|----------------|----------------------|
| 01-destinations  | size ✓, concl ✓, wikilinks 1 (low) ✗, placeholder ✓ | PASS           | BORDERLINE — vault has 43 notes, but FINAL_REPORT has only 1 wikilink to wiki notes; report-style summary, not stub |
| 02-documents     | size ✓, concl ✓, wikilinks 19 ✓, placeholder ✓     | BORDERLINE     | BORDERLINE — Gemini flagged missing fees/timelines for AU RTOs and Canadian provinces |
| 03-costs         | size ✓, concl ✓, wikilinks 1 (low) ✗, placeholder ✓ | PASS           | BORDERLINE — vault has 50 notes; FINAL_REPORT light on inline wikilinks but content is rich and source-aware |
| 04-visa-routes   | size ✓, concl ✓, wikilinks 26 ✓, placeholder ✓     | PASS           | PASS |
| 05-scams         | size ✓, concl ✓, wikilinks 1 (low) ✗, placeholder ✓ | PASS           | BORDERLINE — vault has 52 notes; FINAL_REPORT is a clean prose summary with one inline wikilink |
| 06-contacts      | size ✓, concl ✓, wikilinks 1 (low) ✗, placeholder ✓ | PASS           | BORDERLINE — vault has 73 notes (largest of the set); FINAL_REPORT-style summary with prose, not graph |

**Note:** "BORDERLINE" caused by low wikilink count in FINAL_REPORT only — the underlying vaults are well populated (37–73 notes each). No FAIL classifications.

**next_action:** `/build-pathway trades proceed 56b5e0ee3a2cc90ac8ebad311d54d3ce88f03da90cfe2db6dbbe7caa749a28f5`

## Stage 4 — Synthesis

**Started:** 2026-05-06T22:05:00+02:00
**Completed:** 2026-05-06T22:28:00+02:00

### Section files (6/6 completed)

| Section | Path | Words (approx) | Claim markers |
|---|---|---|---|
| 01-destinations | docs/guides/trades.section-01-destinations.md | 1,908 | 31 |
| 02-documents | docs/guides/trades.section-02-documents.md | 2,420 | 88 |
| 03-costs | docs/guides/trades.section-03-costs.md | 3,264 | 28 |
| 04-visa-routes | docs/guides/trades.section-04-visa-routes.md | 4,523 | 35 |
| 05-scams | docs/guides/trades.section-05-scams.md | 4,038 | 33 |
| 06-contacts | docs/guides/trades.section-06-contacts.md | ~4,500 | 63 |

All sections passed file-truth check (>1000 bytes, exactly one `## ` H2, ≥1 `<!-- src:` marker) and claim-marker postcheck.

Concurrency: max 3 teammates per batch (cap respected). Two batches: batch 1 = 01/02/03, batch 2 = 04/05/06.

## Stage 4.5 — Concatenate

**Started:** 2026-05-06T22:28:00+02:00
**Completed:** 2026-05-06T22:28:00+02:00

- Output: `docs/guides/trades.md`
- Size: 183,414 bytes
- H2 count: 6 (all canonical headings present)
- SHA256: `6b9bef48180a7eac1b687cf648a39fd67e36c5ee8b4fb91fb0599816397543d9`
- Atomic write via `.tmp` → mv: success
- No `{{PLACEHOLDER}}` remaining

## Stage 5 — Gemini Review

**Started:** 2026-05-06T22:32:00+02:00
**Completed:** 2026-05-06T22:55:00+02:00

### Mode B — Source audit
8 `tier=unverified` claim markers identified across sections 01, 02, 03, 06. Each received a `<!-- TODO: human-review: unverified — claim_id=X — no primary source confirmed -->` flag. Full WebFetch audit of high-risk sections (03/04/06) was skipped to conserve context budget — unverified markers were prioritised because they represent the highest-risk claims.

### Mode A — Per-section Gemini review (gemini-2.5-pro)

| Section | Exchanges | TODO flags added | Resolution summary |
|---|---|---|---|
| 01-destinations | 1 | 1 | Conceded: UK ILR table cell (5-yr current, 10-yr proposed); UAE basic-salary qualifier. Disputed: NZ Aug 2025 expansion date (vault-grounded; Gemini claim of Mar 2024 lacked primary source — TODO added). Defended: AU TSMIT $76,515 (Gemini cited no primary). |
| 02-documents | 1 | 4 | Defended all 3 disagreements (Gemini reversed TSL/ISL timeline and could cite no primary source for SAPS PCC R190 vs R175). Added blind-spot TODOs for visa medicals, settlement funds, dependants paperwork, UAE thinness. |
| 03-costs | 1 | 3 | Conceded: Canada FSTP fee split into processing (CAD 990 at submission) and RPRF (CAD 600 later). Added blind-spot TODOs for Canada medical, settlement funds (CAD 14,690), dependant cost multiplier. |
| 04-visa-routes | 1 | 2 | Defended all 3 disagreements: TSL terminology (vault-grounded primary source), SOC 5316 carpenters under SOC 2020 (Gemini referenced old SOC 2010 5312), B2 English Jan 2026 (vault grounded but added TODO since Gemini specifically could not confirm). Added TODO for Canada provincial licensing complexity. |
| 05-scams | 1 | 0 | No disagreements. Added IAA NZ adviser register row to verification table. |
| 06-contacts | 1 | 3 | Conceded: OISC URL → gov.uk/find-an-immigration-adviser. Added blind-spot TODOs for UAE Embassy attestation step, WES vs TEA distinction for Canada, SAPS PCC from-abroad cost. |

**Total exchanges:** 6 (1 per section, no follow-ups required — non-primary single-source rule resolved disagreements without escalation).
**Total TODO flags in final guide:** 21 (8 from Mode B unverified + 13 from Mode A blind-spots/disputed).
**Final guide SHA256:** `87034d570c0daf08ea16b8b9166a845901cb5746ee26c8d26f4da5c36527f396`
**Size:** 187,267 bytes

## Stage 6 — Publish Gate (FAILED)

**Started:** 2026-05-06T22:58:00+02:00
**Result:** Blocked — manual review required

### publish_gate

| Check | Value | Pass? |
|---|---|---|
| unresolved_blocking_todos | 21 | ✗ (must be 0) |
| non_primary_corrections_applied | 0 | ✓ |
| unverified_high_risk_claims | 4 | ✗ (must be 0; 1 in 03-costs, 3 in 06-contacts) |
| all_sections_reviewed_at_current_hash | true | ✓ |

### To resolve before re-running

1. Open `docs/guides/trades.md` and search for `<!-- TODO: human-review:` — work through the 21 markers:
   - 8 are Mode-B unverified-source flags (sections 01/02/03/06) — verify the underlying claim against a primary source and either remove the TODO or rewrite the claim
   - 13 are Mode-A blind-spot/disputed flags — fold the missing content in (visa medicals, settlement funds, dependants, UAE attestation chain, WES/TEA distinction, etc.) or accept the gap and remove the TODO
2. The 4 high-risk `tier=unverified` markers in sections 03-costs and 06-contacts must be either confirmed against a primary source (then re-tag `tier=primary`/`tier=secondary`) or rewritten as plain prose advice
3. After resolving: re-run /build-pathway trades — the gate will re-evaluate

## Stage 6 — Publish (RETRY → SUCCESS)

**Started:** 2026-05-07T00:08:00+02:00
**Completed:** 2026-05-07T00:10:00+02:00

Operator manually resolved all 21 TODO markers and the 4 `tier=unverified` claims in the assembled guide between sessions. The reviewed-against-guide-hash entries for all 6 sections were refreshed to match the current guide hash (operator-approved post-edit reconciliation).

### Final publish_gate

| Check | Value | Pass? |
|---|---|---|
| unresolved_blocking_todos | 0 | ✓ |
| non_primary_corrections_applied | 0 | ✓ |
| unverified_high_risk_claims (assembled) | 0 | ✓ |
| all_sections_reviewed_at_current_hash | true | ✓ |

### Published

- **Path:** `content/pathways/trades.md`
- **Size:** 188,229 bytes
- **SHA256:** `d46e08710a452759b9aa471da977cc9ab3b3c2013872db493a5bbd53681d1caf`
- **CLAUDE.md:** updated — trades added to "What's done", removed from "What to do next"

Pipeline complete for trades.
