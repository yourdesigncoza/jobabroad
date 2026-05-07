# Hospitality Pipeline Run Report

## Stage 3 — Vault Building (Batch 1)
**Completed:** 2026-05-07T13:40:34+02:00

Shared vaults: 5/5 reused (wa-shared-documents, wa-shared-scams, wa-shared-regulatory-bodies, wa-shared-migration-cos, wa-shared-legal-boundary).

| Section | Status | Iter | Notes | SHA256 | Size |
|---|---|---|---|---|---|
| 01-destinations | completed | 7 | 60 | `2f0309e08cbbccd44374e3c32d66834d5cbd37ec8144cee164e4960ab7a2bde8` | 6506 |
| 02-documents | completed | 8 | 38 | `5b4dfd71b5c9c33b5e81b7da991f6b158c37a1b6c4d64e3018d92c0a2e3319e4` | 9034 |
| 03-costs | completed | 4 | 25 | `8a5e5431664e0537f35d7c600d2723386af7b1a4f6745a3e121709d1afd3d363` | 6609 |

**Vaults remaining:** 3 (04-visa-routes, 05-scams, 06-contacts).

**Next action:** `/build-pathway hospitality` to run batch 2.

---

## Stage 3 — Vault Building (Batch 2 + Close-out)
**Completed:** 2026-05-07T14:05:26+02:00

| Section | Status | Iter | Notes | SHA256 | Size |
|---|---|---|---|---|---|
| 04-visa-routes | completed | 4 | 41 | `e3bfd081d65b41ab6458f4bc3cf7acfc7e439023b2ce28e91ea6bd35638676a7` | 8800 |
| 05-scams | completed | 5 | 53 | `27d27dea60cf3795ec8125c70cd28c03ea00ded024f1e8bb26bf14c5685ccfde` | 8096 |
| 06-contacts | completed | 6 | 33 | `8140a1272debd67612bad1937b72d0b09c49d2d271cd6dcb3d22b1a72a2ac4ea` | 8094 |

**All 6 vaults complete.** `manifest.json` written. Manifest hash:
```
04f91119c7c065a2c705d27faeef8d747ed3d6a23c6b205cc95ea55b6269ac17
```

### Vault quality assessment (Gemini gemini-2.5-pro)

| Section | Verdict | Reason |
|---|---|---|
| 01-destinations | PASS | Exceptionally detailed, well-sourced, verifiable data sufficient to build a comprehensive guide. |
| 02-documents | PASS | Comprehensive structured brief with clear instructions, specific data points, and official sources. |
| 03-costs | PASS | Exceptionally detailed, well-sourced, actionable breakdown of all realistic costs. |
| 04-visa-routes | BORDERLINE | High-quality specific data and official sources but reads as a research prompt/data schema rather than a final report. |
| 05-scams | FAIL | Gemini flagged FAIL on grounds the file looks like a brief; manual inspection shows the FINAL_REPORT does contain substantive findings (7 scam patterns with damage ranges, vectors, verification methods, reporting channels, 53 wiki notes). Likely false negative — review before proceeding. |
| 06-contacts | PASS | Comprehensive, well-structured directory of verified official contacts and portals. |

### Conflicts to reconcile at synthesis (Stage 4)

- **UK SOC 5434 chefs:**
  - 01-destinations finding: SOC 5434 chefs *retained* (Anderson Strathern article was wrong)
  - 04-visa-routes finding: SOC 5434 chefs *removed* on 22 Jul 2025 along with the rest
  - 05-scams treats UK chef placement post-22-Jul-2025 as inherently a scam pattern
  - **Synthesis must verify against gov.uk Statement of Changes HC 836 (Jul 2025) and pick one source of truth.**

- **VETASSESS chef cost:**
  - Brief assumed AUD $1,096 (professional)
  - 03-costs found AUD $5,320 (Pathway 1, all 3 stages, trade)
  - 02-documents found AUD $3,120 total (Stage 1 $1,120 + Stage 2 $2,000)
  - **Synthesis must reconcile — likely depends on whether SA chef holds NQF L5 cert (Pathway 1 vs 2) and whether Stage 3 practical is required.**

- **Australia 482 visa fee:**
  - 03-costs cites AUD $3,210 (Jul 2025 confirmed)
  - Brief states $3,115 — outdated.

### Next action

```
/build-pathway hospitality proceed 04f91119c7c065a2c705d27faeef8d747ed3d6a23c6b205cc95ea55b6269ac17
```

