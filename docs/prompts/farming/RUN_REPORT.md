# Farming Pipeline — Run Report

## Stage 0 (2026-05-07)

Pre-flight checks passed:
- All required files readable (research-prompt.md, guide-template.md, pathway-intelligence-research.md, TRACKER.md, nursing prompts)
- Wiki index readable
- Vault root writable
- Farming category found in pathway-intelligence-research.md (section 7)
- Output directory created at docs/prompts/farming/

State file scaffolded.

## Stage 1 (2026-05-07)

Brief written at docs/prompts/farming/_BRIEF.md.

Source material reviewed:
- docs/pathway-intelligence-research.md (section 7 — Farming)
- wiki/index.md + wiki/Conclusion.md
- wiki/Scam Patterns/Fake Job Offer Scam.md
- 3 web searches (UK Seasonal Worker, Australia PALM, Canada TFWP, USA H-2A)

Critical findings embedded in brief:
- Australia PALM closed to SA (Pacific + Timor-Leste only) — primary scam vector
- New Zealand RSE closed to SA (Pacific Forum only)
- Canada SAWP closed to SA (Mexico + Caribbean only) — but Agricultural Stream / LMIA route open
- UK Seasonal Worker: 42,900 places 2026 (41,000 horticulture + 1,900 poultry); Nov 2025 rule changes (6-in-10 horticulture cap, 4-month cooling-off)
- USA H-2A: SA on Nov 2024 DHS list; 17 Jan 2025 regulatory change
- Australia skilled stream (482 SID, 491, DAMA) accessible for skilled/managerial agricultural roles only

## Stage 2 (2026-05-07)

6 prompts written and Codex-reviewed:
- 01-destination-options.md
- 02-document-checklist.md
- 03-realistic-costs.md
- 04-visa-routes.md
- 05-scam-red-flags.md
- 06-legitimate-contacts.md

Codex adversarial review applied corrections to all 6 prompts. Material corrections:

| Correction | Source review | Files updated |
|---|---|---|
| UK approved scheme operators: 5 → **6** including RE Recruitment (poultry only) | All 6 reviews | _BRIEF + all 6 prompts |
| UK 6-in-10-month rolling cap: applies to **horticulture only**; poultry is fixed 2 Oct–31 Dec window | 04 | 01, 04 |
| UK Seasonal Worker: **no IHS** when applying from outside UK for ≤ 6 months | 03 | 03 |
| UK SW route minimum: £12.71/hr, 32 paid hours/week | 03 | 03 |
| H-2A CFR precision: §655.135(j)–(k) recruitment fees; §655.122(h) transport/subsistence; §655.122(p) visa reimbursement; §655.122(q) visa disclosure | 03, 04, 05 | 03, 04, 05 |
| H-2A worker may pay MRV upfront but employer must reimburse — net to worker is near zero | 03 | 03 |
| Canada Agricultural Stream: LMIA processing fee **exempt for primary-agriculture NOCs** | 03 | 03 |
| DIRCO apostille is **free** (only courier/notary costs) | 03 | 03 |
| US Embassy Pretoria does NOT do visa services — use Joburg, Cape Town, Durban consulates via ais.usvisa-info.com | 06 | 06 |
| SA labour law citation: **Employment Services Act 4 of 2014, s. 15** (not BCEA s. 91) | 06 | 06 |
| VETASSESS is Australian skills-assessing authority, NOT a government body or SA qualification evaluator | 06 | 06 |
| Australia 491 → 191: 3 years on regional provisional visa + ATO notices for 3 income years (no minimum income threshold) | 04 | 04 |
| Australia subclass 482 is now Skills in Demand (SID); TSS replaced 7 Dec 2024 | 03 | brief noted |
| CSOL applies to subclass 482 Core Skills; 491 uses skilled / state occupation lists; DAMA uses agreement-specific lists | 04 | 01, 04 |
| Canada Agri-Food Pilot **closed to new applications 14 May 2025** | 01 review | 01, 04 |
| SAPS PCC: no online "eSAPS" application — issued only by SAPS Criminal Record Centre | 02 | 02 |
| Apostille for H-2A: **not** typically required | 02 | 02 |
| Canada LMIA advertising rule: ≥ 14 calendar days within 3 months before LMIA | 02 | 02 |
| PALM "most common" → "lead pattern" (unsupported comparative claim) | 05 | 05 |
| AHC Pretoria visa-scams page is generic — not maritime-specific; use AMSA / consular sources for maritime scam evidence | 05 | 05 |
| Australia scam reporting: Department of Home Affairs / Australian Border Watch + OMARA (mara.gov.au), not just Scamwatch | 05 | 05 |
| H-2A scam reporting: U.S. DOL Wage and Hour Division for labour/fee violations | 05 | 05 |
| Add Telegram to scam channels enum | 05 | 05 |
| Source additions: GLAA register (gla.gov.uk), GOV.UK farm-worker guidance, Home Office Register of Licensed Sponsors, DOL FLAG/OFLC, ESDC Compliance, Jobs and Skills Australia CSOL, ais.usvisa-info.com, dha.gov.za, labour.gov.za | All | All 6 |

Stage 2 complete. Hard-exiting per pipeline rules.

## Stage 3 Batch 1 (2026-05-07)

3 vaults completed in parallel (within 3-concurrent resource cap):

| Vault | Iter | Notes | FINAL_REPORT size | SHA256 |
|---|---|---|---|---|
| wa-farming-01-destinations | 5/8 | 42 | 9,130 bytes | 52e76d9a4b02b7b1cb2f4620e7f8e377b525df072f08bb8f205a8c0fcbe4e2c1 |
| wa-farming-02-documents | 7/6 | 46 | 13,142 bytes | a23551d782bcb5a72a10e4d4dea81b767c4453f6fa6aa24cc31f6b2259be4d0d |
| wa-farming-03-costs | 7/6 | 61 | 7,227 bytes | daab64d0242a53a4cffa9a7c553a6f7f6771b8531a6a734ca5b358a03d6f386b |

0 failed. Shared vaults (wa-shared-documents, wa-shared-scams, wa-shared-regulatory-bodies, wa-shared-migration-cos, wa-shared-legal-boundary) reused from prior runs.

next_action: `/build-pathway farming` to build batch 2 (vaults 04-visa-routes, 05-scams, 06-contacts).

---

## Stage 3 batch 2 — 2026-05-07T10:55:00+02:00

3 vaults built:

| vault | iter | notes | size | sha256 |
|---|---|---|---|---|
| wa-farming-04-visa-routes | 3/10 | 43 | 8,607 bytes | 97a599bd691d2b580c45a23baa5e6c5dd7e33d65086c3520b4eda252b0d83ad4 |
| wa-farming-05-scams | 6/6 | 39 | 6,606 bytes | 736c1eed59e2fe3be172514f011d7c4417343ade3250d78d75944030b1d0716e |
| wa-farming-06-contacts | 7/6 | 35 | 7,577 bytes | 89f7641aa33b748c5c00a0ce6ee0fe86e35701a07ec264bf742c75e080b52db0 |

0 failed.

## Stage 3 — REVIEW GATE — 2026-05-07T10:55:00+02:00

All 6 farming vaults complete. Manifest written to `manifest.json`.

| section | sha256 | size |
|---|---|---|
| 01-destinations | 52e76d9a4b02b7b1cb2f4620e7f8e377b525df072f08bb8f205a8c0fcbe4e2c1 | 9,130 |
| 02-documents | a23551d782bcb5a72a10e4d4dea81b767c4453f6fa6aa24cc31f6b2259be4d0d | 13,142 |
| 03-costs | daab64d0242a53a4cffa9a7c553a6f7f6771b8531a6a734ca5b358a03d6f386b | 7,227 |
| 04-visa-routes | 97a599bd691d2b580c45a23baa5e6c5dd7e33d65086c3520b4eda252b0d83ad4 | 8,607 |
| 05-scams | 736c1eed59e2fe3be172514f011d7c4417343ade3250d78d75944030b1d0716e | 6,606 |
| 06-contacts | 89f7641aa33b748c5c00a0ce6ee0fe86e35701a07ec264bf742c75e080b52db0 | 7,577 |

manifest_hash: `7b0c4abe37496ab52f67c6c838fb2921624a0d96e2853fa0f2c52e4c2a35dc6c`

### Vault quality assessment (structural + Gemini)

Structural checks: all 6 PASS (size > 5KB, ## Conclusion present, no placeholders, wiki-folder graphs healthy 198–286 wikilinks each).

Gemini quality pass (gemini-2.5-pro):

| section | verdict | reason |
|---|---|---|
| 01-destinations | PASS | Specific, sourced, actionable intelligence on viable destinations; clearly identifies fraudulent routes. |
| 02-documents | PASS | Clear, actionable comparison of pathways with specific, sourced data on costs and requirements. |
| 03-costs | BORDERLINE | High-quality, specific financial data but the FINAL_REPORT summary lacks narrative depth (underlying wiki has 37 notes / 215 wikilinks). |
| 04-visa-routes | PASS | Specific, sourced, actionable intelligence on visa routes; distinguishes them from common scams. |
| 05-scams | PASS | Well-researched, deeply sourced with official links; specific actionable evidence to build scam-avoidance guide. (Gemini Q1 NO reflects topic — scams, not demand — not a content gap.) |
| 06-contacts | BORDERLINE | Strong fact-checked summary but FINAL_REPORT sections are condensed paragraphs (underlying wiki has 11 notes / 198 wikilinks; sufficient content density). |

No FAILs. The two BORDERLINE verdicts reflect the FINAL_REPORT's role as a digest — the underlying wiki vaults are graph-rich and have full evidence. Synthesis stage will pull from the wiki notes, not the FINAL_REPORT prose.

next_action: `/build-pathway farming proceed 7b0c4abe37496ab52f67c6c838fb2921624a0d96e2853fa0f2c52e4c2a35dc6c`
