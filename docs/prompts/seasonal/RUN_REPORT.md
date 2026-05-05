# Run Report — seasonal

---

## Stage 3 — Batch 1 (2026-05-04T20:36:00+02:00)

**Vaults processed:** 3 completed, 0 failed

| Vault | Status | Iters | Notes | SHA256 | Size |
|---|---|---|---|---|---|
| wa-seasonal-01-destinations | completed | 5 | 26 | `bb71bf5dfd70e26bba4aef90dc735b4c5248530106e7ce158ee1febc4262d388` | 7,177 B |
| wa-seasonal-02-documents | completed | 7 | 46 | `6f981bf63aca1e926a4093f534aefdba8522927f0c6e118983c0afd83db13573` | 8,150 B |
| wa-seasonal-03-costs | completed | 6 | 37 | `c4eb652a5122405f49eabab0710bd99d0a5568e6fbb9e1a2cc1ae50cedbf6cbe` | 8,345 B |

**Shared vaults:** all 5 reused from prior runs (wa-shared-documents, wa-shared-scams, wa-shared-regulatory-bodies, wa-shared-migration-cos, wa-shared-legal-boundary)

**Vaults remaining:** 3 (04-visa-routes, 05-scams, 06-contacts)

**Next action:** `/build-pathway seasonal`

---

## Stage 3 — Batch 2 (2026-05-04T21:40:30+02:00)

**Vaults processed:** 3 completed, 0 failed

| Vault | Status | Iters | Notes | SHA256 | Size |
|---|---|---|---|---|---|
| wa-seasonal-04-visa-routes | completed | 7 | 38 | `d4e9a6e8ce8e157996aafec9bffa743dafeb7345b215b2e726a638f4816886b4` | 7,695 B |
| wa-seasonal-05-scams | completed | 5 | 21 | `e04d691d019cb47ca8ea5a5469e5fd010875b744afccb563970a0f4f7d3dfa12` | 7,725 B |
| wa-seasonal-06-contacts | completed | 6 | 26 | `92e1f34063cdfdae3afa72d884690af78c3cd943f0b39c499c305ee1b3c36001` | 6,902 B |

**Manifest hash:** `bafedb6ea116f500c4ef9ebb9b68f9682842fbc4f6e1143ac3700dd1c3f82958`

### Vault Quality Assessment

| Section | Structural | Gemini Verdict | Gemini Reason |
|---|---|---|---|
| 01-destinations | PASS | PASS | Definitively answers core question, identifies single viable pathway, actionable next steps |
| 02-documents | PASS | PASS | Answers goal, provides critical source-verified correction to brief, actionable |
| 03-costs | PASS | PASS | Comprehensively covers J-1, correctly invalidates others, specific sourced financial data |
| 04-visa-routes | PASS | PASS | Definitive, source-verified, actionable — specific costs, eligibility, timelines |
| 05-scams | PASS | PASS | Comprehensive, well-sourced intelligence on seasonal scam patterns |
| 06-contacts | PASS | PASS | Verifiable entities, specific costs, official sources, actionable next steps |

Note: FINAL_REPORT wikilink check shows 1 `[[Conclusion]]` per report — consistent with nursing vault format. Real wikilink graph lives in wiki/ notes (178–264 links per vault). Not a quality issue.

**Next action:** `/build-pathway seasonal proceed bafedb6ea116f500c4ef9ebb9b68f9682842fbc4f6e1143ac3700dd1c3f82958`

## Stage 4 partial failure — 2026-05-04T21:55:00+02:00

| Section | Error class | Uncovered paragraphs | Attempts |
|---|---|---|---|
| 01-destinations | provenance_missing | 1 (comparison table) | 1 |
| 02-documents | provenance_missing | 2 (UK YMS prose + trap table) | 1 |
| 03-costs | provenance_missing | 3 (preamble + J1 table + total summary) | 1 |
| 04-visa-routes | provenance_missing | 4 (eligibility table + 2 prose + route table) | 1 |
| 05-scams | provenance_missing | 1 (legitimate programme rules table) | 1 |
| 06-contacts | PASSED | — | 0 |

All failures are `provenance_missing` (retryable). Max attempts = 1 (cap is 2).
Files exist on disk and pass file-truth check (size, H2, src marker count).
Issue: table rows and introductory paragraphs with factual claims lack `<!-- src: -->` markers.
Next: `/build-pathway seasonal` will re-spawn only the 5 failed sections.

---

## Stage 5 — Mode B Source Audit (2026-05-05T12:00:00+02:00)

**Guide hash at audit time:** `0054af22b5dbe6daada58bc69d1a2bb452c764cf80decbb42f449de32ca2cb93`

**Scope:** Full audit of `tier=primary` and `tier=secondary` markers in sections 03, 04, 06 (high-risk). Sections 01, 02, 05: audit of `tier=unverified` markers only (none found).

### Sources confirmed (fetchable)

| Source | Claim | Result |
|---|---|---|
| gov.uk/youth-mobility/eligibility | UK YMS SA ineligible | CONFIRMED — SA not in 2026 eligible list |
| travel.state.gov/…/SouthAfrica.html | J-1 reciprocity fee $0 for SA | CONFIRMED — "None" for J-1 |
| swap.ca/products/canada-ro-nomination-whv | SWAP programme fee CAD $2,100 | CONFIRMED |
| j1visa.state.gov/programs/summer-work-travel/ | J1 SWT programme accessible | CONFIRMED (page loads; SA pre-placed job requirement confirmed) |

### Sources unfetchable (403 / error after 2 attempts)

| Source URL | Affected claims | TODO markers added |
|---|---|---|
| ice.gov/sevis/i901/faq | SEVIS $35 SWT: 03-costs-005, 04-visa-routes-009, 06-contacts-008 | 3 (one per section) |
| za.usembassy.gov/visas/nonimmigrant-visas/ | MRV $185: 03-costs-007, 04-visa-routes-010, 06-contacts-015 | 3 (one per section) |
| support.disneyprograms.com/… | Disney deposit $227: 03-costs-014, 03-costs-015 | 1 (combined) |
| floridajobs.org/…/minimum-wage | FL min wage $14.00: 03-costs-022 | 1 |
| floridarevenue.com/… | FL no state income tax: 03-costs-023 | 0 (ECONNREFUSED; claim well-known; deferred to Mode A) |

**Note:** All 403s appear to be government site bot-blocking rather than missing pages. The SEVIS $35 correction was explicitly verified from ICE primary source in the 2026-05-05T11:00 manual correction pass.

### Critical discrepancy found

**Canada IEC participation fee:** SWAP page (fetched May 2026) shows **CAD $184.75**, but guide states **CAD $172** (sourced to unfetchable canada.ca). This contradicts the guide at claim_ids: 04-visa-routes-035, 06-contacts-029, and the Section 6 quick reference table. TODO markers added at all three locations. This issue was previously raised in Stage 5 Mode A and resolved as "Defend $172 (IRCC primary)" — but the primary source is currently unfetchable. **High priority for human verification before publish.**

### TODO markers added this audit (Mode B): 8 total
