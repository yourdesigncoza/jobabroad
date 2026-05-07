# Prompt: Hospitality — Document Checklist

> Run with `/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-hospitality-02-documents`

---

/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-hospitality-02-documents

**Goal:** Document every document a South African hospitality worker (chef, cook, restaurant manager, hotel staff, front-of-house) needs for the four open destination routes — UAE Employment Visa, UK Skilled Worker (senior chef + management only since 22 July 2025), Australia Subclass 482 Core Skills (chef/cook via VETASSESS), and Canada TFWP LMIA-based work permit — including SA-side foundation documents, document attestation/apostille requirements, employer-side documents the worker must verify are on schedule, and hospitality-specific qualification recognition (CATHSSETA, City & Guilds, International Hotel School, Capsicum, Prue Leith).

**Seed entities:**
- SA Passport (DHA) — 6–12 month processing; ≥6 months validity required for all destination visas
- SAPS Police Clearance Certificate (PCC) — required for UK, Australia, Canada (NOT UAE — UAE uses its own MOHRE security clearance); R190 standard fee
- DIRCO Apostille — required for SA documents going to UAE (Hague Apostille countries) and Australia; UK and Canada use different attestation
- VETASSESS Skills Assessment — chef ANZSCO 351311, cook 351411; AUD $1,096 standard offshore Full Skills Assessment (Oct 2025 fee schedule)
- UK Certificate of Sponsorship (CoS) — issued by sponsoring employer holding Worker sponsor licence; valid 3 months from assignment

**Source constraints:** dha.gov.za, saps.gov.za/services/applying_clearence_certificate.php, dirco.gov.za/legalisation, mohre.gov.ae, u.ae/en/information-and-services/jobs/working-in-the-uae, gov.uk/skilled-worker-visa/your-job, gov.uk/skilled-worker-visa/documents-you-must-provide, vetassess.com.au/skills-assessment-for-migration, vetassess.com.au/home/our-fees, immi.homeaffairs.gov.au, canada.ca/en/employment-social-development/services/foreign-workers/, ircc.canada.ca, vfsglobal.com, cathsseta.org.za, saqa.org.za

**Iterations:** 6

---

## Note schemas — apply to every note created

**DOCUMENT note:**
```markdown
---
type: document
name:
issuing_body:
purpose:
required_for_routes: []
fee_zar:
fee_destination_currency:
processing_time:
validity:
sa_specific_steps:
common_errors:
evidence_strength: confirmed | alleged | rumoured
tags: [document, hospitality, south-africa]
sources:
  -
---

# Document Name

2–3 sentences: what it is, who issues it, which routes require it.

## How to Obtain
Step-by-step from a SA worker's perspective. Where to apply, what to submit, how to track.

## Costs and Timing
ZAR fee + destination currency where applicable. Realistic processing range (state minimum and peak-backlog).

## Common Failure Modes
Specific errors that delay or invalidate the document for hospitality applications.

## Connections
- [[Visa Route]] — required_for, source: [url]

## Sources
- [Source title](url)
```

**ATTESTATION note:** *(create one per attestation chain — DIRCO apostille, UAE attestation, UK ECCTIS, Canada IRCC verification)*
```markdown
---
type: attestation
name:
issuing_body:
documents_covered: []
fee_zar:
processing_time:
hague_or_alternative: [hague-apostille | embassy-attestation | online-verification]
required_for_routes: []
evidence_strength: confirmed
tags: [attestation, hospitality, south-africa]
sources:
  -
---

# Attestation Process Name

Plain statement: which documents need this attestation, for which destinations.

## Process
Document-by-document workflow. Note the order of operations (e.g. police clearance → DIRCO apostille → UAE embassy attestation, in that order).

## Cost and Time
Standard vs express. Direct vs via concierge agent (with realistic agent fees).

## Connections
- [[Document]] — attests, source: [url]

## Sources
- [Official attestation page](url)
```

**EDGE metadata:**
- `relationship_type`: required_for | issued_by | attests | replaces | precedes | reimbursed_by_employer | sponsor_pays
- `description`: short label
- `evidence_strength`: confirmed | alleged | rumoured
- `sources`: at least one URL

---

## Runtime rules

- `evidence_strength`: `confirmed` | `alleged` | `rumoured`
- **UAE attestation chain matters** — for SA documents going to UAE: SAPS/DIRCO certifies → DIRCO apostille → (for some documents) UAE Embassy in Pretoria attestation → MOFAIC attestation in UAE. Document this full chain. Hospitality contracts often need only educational certificates and police clearance attested
- **UAE has NO worker-paid visa fees** — MOHRE Resolution No. 47 of 2022. Employment Visa, Emirates ID, MOHRE work permit, medical test, and labour-contract registration are all employer-paid. Worker pays only personal costs (passport renewal if needed, optional document concierge fees). State this clearly
- **UK CoS validity** — 3 months from assignment. Worker must submit Skilled Worker visa application within this window or CoS lapses. Employer cannot easily reissue
- **UK senior chef and management routes only since 22 July 2025** — line-level cook / waiter / barista / kitchen porter no longer eligible. Salary must meet £41,700 general (or £33,400 new-entrant) AND going-rate for SOC 5434
- **Australia VETASSESS chef/cook** — Full Skills Assessment requires both qualification component AND employment component (5 years post-qualification work or 6 years no-qualification work). Both required, not either-or. Cost ~AUD $1,096 for offshore Full Skills Assessment per Oct 2025 fee schedule
- **Canada IRCC educational credential assessment (ECA)** — required for chef NOC 62200 PNP applications in some provinces; not required for TFWP work permit itself but increasingly required for downstream PR. Name the assessing bodies (WES, ICES, IQAS, CES, ICAS)
- **CATHSSETA NQF recognition** — SA hospitality qualifications are NQF-aligned. International Hotel School, Capsicum Culinary Studio, Prue Leith Culinary Institute issue qualifications recognized by CATHSSETA + City & Guilds International. Mention these as common SA-side training providers but do not endorse any single one
- **Cruise-line documents are NOT visa documents** — cruise medicals, STCW certificates, MARLINS English test are maritime requirements, not destination visas. Flag if surfaced to avoid confusion
- All fees and processing times must be date-stamped
- Folder structure: `Documents/`, `Attestation/`, `Qualification Bodies/`
