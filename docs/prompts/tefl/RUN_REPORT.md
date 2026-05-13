# Build-Pathway Run Report — TEFL

## Stage 0–2 (2026-05-13)

- Stage 0: Pre-flight passed; state file scaffolded
- Stage 1: `_BRIEF.md` written from pathway-intelligence-research.md TEFL wedge + wiki scan (Teachers, Fake Job Offer Scam, Immigration Advice Boundary) + 3 Brave searches (Korea EPIK 2026, Saudi/UAE TEFL salaries, Vietnam Decree 219/2025)
- Stage 2: 6 prompts written (01–06) + Codex adversarial review applied
  - Codex corrections applied: 6/6 prompts updated
  - Highest-impact fixes: Apostille Convention status corrections (Saudi 2022-12-07, China 2023-11-07, Vietnam not in force until 2026-09-11); domain fixes (visa.go.kr, fuwu.most.gov.cn, embassies.mofa.gov.sa, educacionfpydeportes.gob.es); Spain Auxiliares SA-eligibility flagged; 7-nation rule scoped to Korea E-2 only; Korea E-2 age cap scoped to EPIK programme; SAQA Individual Verification Letter terminology corrected; MOET Circular 21/2018 added as Vietnam teacher qualification source

## Stage 3 — Batch 1 (2026-05-13)

Vaults built this batch (serial):

| Section | Vault path | Iterations | Notes | FINAL_REPORT SHA256 |
|---|---|---|---|---|
| 01-destinations | `wa-tefl-01-destinations` | 6 | 77 | `a7ada5657f926bc7e22bd92861f132fdedf75a2c7f7e91ad1a72a7c623b4c715` |
| 02-documents | `wa-tefl-02-documents` | 6 | 50 | `89439d3667de50fb4cc631a127f3d41ab78e626ecfeacff9883366aec12ef01a` |
| 03-costs | `wa-tefl-03-costs` | 6 | 30 | `a1c8a170d3480b15cba8582819f590973d120e526ef2dc30973ebadb5b3c739d` |

**Key findings surfaced during the batch:**

- **01-destinations**: SA is named on the 7-nation native-speaker list in Korean E-2 visa regulation AND in Vietnamese Decree 219/2025/ND-CP. Hong Kong NET Scheme now requires a PGDE for new joiners from 2025/26. **Spain Auxiliares is confirmed CLOSED to SA candidates for 2025–2026** — not on the bilateral agreement list.
- **02-documents**: CELTA/CertTESOL certificates take the UK FCDO apostille path (NOT DIRCO). SAQA Individual Verification Letter eliminates the SA-degree notary step. Saudi apostille effective 2022-12-07; China apostille effective 2023-11-07.
- **03-costs**: Confirmed Korea EPIK Fall 2026 pay scale + entrance/exit allowance structure; Saudi/UAE tax-free packages broken down for SA tax-resident impact; Spain Auxiliares note flagged as not available to SA (consistent with 01-destinations finding).

**Vaults remaining for batch 2:** 04-visa-routes, 05-scams, 06-contacts

next_action: `/build-pathway tefl` to start batch 2

## Stage 3 — Batch 2 (2026-05-13)

Vaults built this batch (serial):

| Section | Vault path | Iterations | Notes | FINAL_REPORT SHA256 |
|---|---|---|---|---|
| 04-visa-routes | `wa-tefl-04-visa-routes` | 4 | 37 | `a8823ae8ebb850029466b85899d09f71577078c9ce8e46c1ba7c218bea0d0c45` |
| 05-scams | `wa-tefl-05-scams` | 4 | 36 | `ee907d20d47dc953375ca7dede57de7896c5955c05bed8ca21f57e1658a3482a` |
| 06-contacts | `wa-tefl-06-contacts` | 7 | 38 | `f48bb59c969f38fc67789f23a20566444778e9b4b0a45d88a179495646ac8844` |

## Stage 3 — Complete (all 6 vaults built)

**Manifest hash:** `061e1f0cdf66dbf327596720a5c96e1e27ee5d98f59952382f9b73c9dc30e683`

**Full manifest:** `docs/prompts/tefl/manifest.json`

### Vault quality assessment (Gemini gemini-2.5-pro)

| Section | Verdict | Reason |
|---|---|---|
| 01-destinations | BORDERLINE | Specific destination data + salary ranges + Korea SA-clause, but FINAL_REPORT itself lacks source URLs (URLs are in wiki/ notes, 77 of them). |
| 02-documents | PASS | Specific fees, timelines, apostille routes; cites qiwa.sa, hcch.net, epik.go.kr. |
| 03-costs | PASS | Specific ZAR amounts dated to 2025/2026; cites saps.gov.za, fuwu.most.gov.cn, saqa.org.za. |
| 04-visa-routes | PASS | Visa codes + eligibility + Korea SA-specific schooling clause; cites fuwu.most.gov.cn, visa.go.kr, moj.go.kr. |
| 05-scams | PASS | 6 named scam patterns + 7 verification tools + URLs; brief Conclusion noted. |
| 06-contacts | PASS | EPIK, JET, Cambridge CELTA, Trinity, Ofqual named with specific contact channels; cites epik.go.kr, register.ofqual.gov.uk, labour.gov.za. |

**No FAIL vaults.** 01-destinations is borderline only because the FINAL_REPORT summary doesn't repeat URLs; the synthesised wiki has full citations on every note.

### Key TEFL-specific findings locked in across all 6 vaults

- **Spain Auxiliares CONFIRMED CLOSED to SA candidates for 2025–2026** (not on bilateral list)
- **Hong Kong NET Scheme** now requires a PGDE for new joiners from 2025/26
- **Korea EPIK SA-specific clause**: schooling-in-English letters from grade 7 through university (single most-missed requirement)
- **Apostille Convention status anchored**: Saudi 2022-12-07, China 2023-11-07, Vietnam pending 2026-09-11
- **CELTA/CertTESOL apostille via UK FCDO, not DIRCO** (sequencing trap)
- **SAQA Individual Verification Letter** (not "evaluation") for SA degrees — eliminates SA-side notary step
- **Vietnam Decree 219/2025/ND-CP**: SA listed as native English-speaking country
- **China**: employer initiates work permit via fuwu.most.gov.cn (replaces obsolete SAFEA)
- **Korvia** confirmed as only no-fee SA-eligible programme recruiter for EPIK

next_action: `/build-pathway tefl proceed 061e1f0cdf66dbf327596720a5c96e1e27ee5d98f59952382f9b73c9dc30e683`
