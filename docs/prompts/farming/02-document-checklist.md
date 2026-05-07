# Prompt: Farming — Document Checklist

> Run with `/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-farming-02-documents`

---

/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-farming-02-documents

**Goal:** Build a complete, sequenced, source-verified document checklist for a South African farm worker applying via the UK Seasonal Worker visa, USA H-2A, Canada Agricultural Stream / LMIA, or Australian skilled-stream agricultural visas — covering every document from SA-side preparation through to visa approval, with lead times, costs, and known traps. Document the absence of professional registration (farming is non-regulated) and what replaces it (employer-issued certificates, scheme-operator confirmation letters, LMIA approval).

**Seed entities:**
- UK Certificate of Sponsorship (CoS) — issued by an approved Seasonal Worker scheme operator (currently 6 per GOV.UK guidance: AGRI-HR, Concordia (UK) Ltd, Fruitful Jobs, HOPS Labour Solutions Ltd, Pro-Force Limited, RE Recruitment — poultry only; verify at gov.uk/guidance/seasonal-work-on-farms-guidance-for-workers at vault-build time)
- USA H-2A petition I-129 + DOL Temporary Labor Certification (ETA Form 9142A) — employer-side documents that precede the worker's DS-160 / visa interview
- Canada Labour Market Impact Assessment (LMIA) — ESDC-issued; required before the worker can apply for a closed work permit
- SAPS Police Clearance Certificate (apostille via DIRCO) — required for some destinations only: Australia skilled visa applications generally require police certificates; UK Seasonal Worker and US H-2A typically do NOT require a SAPS PCC upfront; Canada may request one. Verify per current visa-application checklist for each route
- SA passport (machine-readable, ≥ 6 months validity) — required for all visa applications

**Source constraints:** gov.uk/seasonal-worker-visa, gov.uk/government/publications/seasonal-worker-visa-guidance-for-applicants, uscis.gov (I-129, H-2A petition guidance), travel.state.gov (DS-160, US visa interview), dol.gov/agencies/eta/foreign-labor (H-2A Temporary Labor Certification), canada.ca (LMIA, work permit application, agricultural stream), immi.homeaffairs.gov.au (skills assessment, visa application), saps.gov.za (Police Clearance), home-affairs.gov.za (passport), dirco.gov.za (apostille), saqa.org.za (qualification evaluation if relevant for skilled-stream Australia)

**Iterations:** 6

---

## Note schemas — apply to every note created

**DOCUMENT note:**
```markdown
---
type: document
name:
aliases: []
stage: [sa_preparation | sa_submission | employer_or_scheme_processing | visa_application | destination_arrival]
issued_by: "[[issuing_body]]"
submitted_to: "[[receiving_body]]"
required_for_routes: [uk_seasonal_worker | usa_h2a | canada_agricultural_stream | australia_482 | australia_491 | all]
processing_time_official:
processing_time_reported:
cost_zar:
cost_destination_currency:
validity_period:
must_precede: []
apostille_required: [yes | no | depends_on_destination]
evidence_strength: confirmed | alleged | rumoured
tags: [document, farming, work-abroad, south-africa]
sources:
  -
---

# Document Name

What this document is, what it proves, and at which stage of the process it is needed.

## How to Obtain
Step-by-step from the official source. Exact URL for application. Distinguish online vs in-person processes.

## Known Delays & Traps
Real-world processing issues specific to SA applicants — apostille via DIRCO turnaround, SAPS CRC via station vs eSAPS, peak-season backlogs at destination consulates.

## Sequencing Note
Which documents must be in hand before this one can be started; which documents this one unblocks.

## Connections
- [[Issuing Body]] — issued_by, source: [url]
- [[Visa Route]] — required_for, source: [url]

## Sources
- [Source title](url)
```

**FEE note:**
```markdown
---
type: fee
name:
visa_route: [uk_seasonal_worker | usa_h2a | canada_agricultural_stream | australia_482 | australia_491]
amount_destination_currency:
amount_zar_approx:
exchange_rate_date:
paid_to:
paid_by: [worker | employer | scheme_operator | shared]
paid_when:
refundable: [yes | no | partial]
worker_fee_prohibited: [yes | no]
evidence_strength: confirmed | alleged | rumoured
tags: [fee, farming, visa-cost, south-africa]
sources:
  -
---

# Fee Name

What this fee is for and when in the process it must be paid. Note any prohibition on charging the worker (H-2A, UK scheme operator rules).

## Payment Method
How to pay (online portal, card, bank transfer) and to whom.

## Refund Policy
Whether this fee is refundable on visa denial or programme cancellation.

## Connections
- [[Visa Route]] — required_by, source: [url]

## Sources
- [Source title](url)
```

**EDGE metadata:**
- `relationship_type`: issued_by | submitted_to | required_for | precedes | follows | paid_to | unblocks | apostilled_by
- `description`: short label
- `date_range`: if applicable
- `evidence_strength`: confirmed | alleged | rumoured
- `sources`: at least one URL

---

## Runtime rules

- `evidence_strength`: `confirmed` | `alleged` | `rumoured`
- **Sequencing chain — UK Seasonal Worker:** scheme operator job-match → CoS issued → worker applies for visa via gov.uk → biometrics at VFS Global SA centre → decision (~3 weeks). Worker cannot apply without a valid CoS reference number; only the 6 currently-approved scheme operators per GOV.UK guidance (verify at vault-build) can issue CoS — flag this as the primary anti-scam check
- **Sequencing chain — H-2A:** employer files DOL ETA Form 9142A (Temporary Labor Certification) → DOL approval → employer files I-129 with USCIS → USCIS approval → worker applies for DS-160 → US Embassy interview in SA → admission via POE. Document each step's typical processing time
- **Sequencing chain — Canada Agricultural Stream:** employer advertises for at least 14 calendar days within the 3 months before LMIA submission → employer submits LMIA application to ESDC → LMIA approved → worker applies for closed work permit via IRCC → biometrics at VFS Global SA → decision. The SAWP is closed to SA; do NOT include SAWP-specific documents (e.g. Mexican SAWP application form) in any SA-facing checklist
- **Apostille requirements vary by destination** — UK does not require apostille on SAPS PCC for Seasonal Worker; H-2A does NOT typically require a police certificate; Canada accepts SAPS PCC without apostille for most TFWP applications; Australia generally requires certified police certificates and translations as specified per visa, but apostille is not a blanket skilled-stream requirement. Verify each per current official guidance and date-stamp
- **No worker-paid recruitment fees:** H-2A regulations explicitly prohibit charging the worker recruitment, transportation, or visa fees (employer must pay). UK Seasonal Worker scheme operators are subject to similar prohibitions under their licence conditions. Any document or fee request from a "recruitment agent" charging the worker is a red flag — flag clearly in every document note that involves a fee
- **Australia skilled-stream additional documents:** for points-tested 491 a positive skills assessment by the relevant assessing authority is generally required before EOI / invitation. For 482 (Skills in Demand, formerly TSS — replaced 7 Dec 2024) skills assessment is only required where specified for the occupation, passport, or program — and not always VETASSESS. List the actual assessment process, fee, turnaround, and required evidence per the specific occupation; SAQA evaluation is for SA qualifications going to South African contexts and is not the Australian skills assessing authority. Do not present skilled-stream as a low-document alternative to seasonal — it is materially heavier
- **SAPS PCC delivery:** the SAPS Police Clearance Certificate is issued only by the SAPS Criminal Record Centre — there is no online "eSAPS" application. Applicants submit fingerprints in person at a SAPS station (or via accredited courier services) and the SAPS website is for status enquiry only. Document the actual current procedure and turnaround time
- **DIRCO apostille processing** — date-stamp current turnaround time; flag historical backlogs
- All processing times must be date-stamped (vault-build month/year); flag any older than 12 months as `evidence_strength: alleged`
- Folder structure: `Documents/`, `Fees/`
