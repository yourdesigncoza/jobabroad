# Prompt: Trades — Document Checklist

> Run with `/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-trades-02-documents`

---

/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-trades-02-documents

**Goal:** Build a complete, sequenced, source-verified document checklist for a South African qualified tradesperson (electrician, plumber, welder, carpenter, vehicle technician, builder, fitter, boilermaker) applying for skilled migration to Australia, the UK (Temporary Shortage List route), Canada (FSTP / Express Entry / PNP), or New Zealand — covering every document from SA-side preparation (QCTO trade certificate verification, MerSETA logbook, N-level certificates, SAQA evaluation, SAPS clearance, DIRCO apostille) through to skills assessment submission and visa lodgement, with lead times and known traps.

**Seed entities:**
- QCTO trade test certificate (Quality Council for Trades and Occupations) — primary SA-side trade qualification document; replaced DHET trade-testing function
- MerSETA artisan logbook / Section 13 contract (apprenticeship evidence required for TRA and provincial trade equivalency assessments)
- SAQA Verification Letter / NLRD verification for South African qualifications (used when a destination assessor or employer asks for SAQA confirmation of an SA qualification; SAQA's foreign-qualification evaluation service is a separate product, not used for SA-issued credentials)
- DIRCO apostille / authentication of SA documents — required only where the receiving authority demands legalisation (apostille for Hague countries, authentication for non-Hague routes; not universal)
- SAPS Police Clearance Certificate (PCC) — required for Australia, Canada, NZ visa applications

**Source constraints:** qcto.org.za, merseta.org.za, saqa.org.za, umalusi.org.za (N3, NSC, NC(V), verification/replacement), dhet.gov.za (N4–N6 / N-Diploma re-issuance), dirco.gov.za, saps.gov.za (PCC submission and online status enquiry), tradesrecognitionaustralia.gov.au (OSAP / MSA documentary requirements; RTO Finder for current practical-assessment locations), immi.homeaffairs.gov.au (visa documentary checklists; state/territory post-arrival licensing pages), gov.uk/skilled-worker-visa, gov.uk/government/publications/skilled-worker-visa-temporary-shortage-list, gov.uk/government/publications/immigration-rules (Appendix Skilled Worker; Appendix Temporary Shortage List), cscs.uk.com, ecscard.org.uk, jib.org.uk (UK on-site competence cards), canada.ca (FSTP / Express Entry document checklists), wes.org (WES ECA — used for non-trade educational credentials where required), tradesecrets.alberta.ca, skilledtradesbc.ca, skilledtradesontario.ca, saskapprenticeship.ca, immigration.govt.nz, ewrb.govt.nz, pgdb.co.nz, lbp.govt.nz, icp.gov.ae, gdrfa.ae, mohre.gov.ae, actvet.gov.ae, home-affairs.gov.za (passport, unabridged birth certificate, marriage certificate)

**Iterations:** 6

---

## Note schemas — apply to every note created

**DOCUMENT note:**
```markdown
---
type: document
name:
aliases: []
stage: [sa_preparation | sa_verification | apostille_or_authentication | skills_assessment | visa_application | post_arrival_licensing]
issued_by: "[[issuing_body]]"
submitted_to: "[[receiving_body]]"
required_for_destinations: [australia | uk | canada | new_zealand | uae | all]
required_for_trades: [electrician | plumber | welder | carpenter | builder | vehicle_technician | fitter | boilermaker | all]
processing_time_official:
processing_time_reported:
cost_zar:
cost_destination_currency:
fee_verified_date:
exchange_rate_date:
source_accessed_date:
validity_period:
must_precede: []
must_follow: []
legalisation_required_by: "[[receiving_authority]]"
apostille_or_authentication_required: [yes_apostille | yes_authentication | no | destination_dependent]
document_format_required:
certified_copy_allowed: [yes | no | depends]
translation_required: [yes | no | language_specific]
evidence_strength: confirmed | alleged | rumoured
tags: [document, trades, work-abroad, south-africa]
sources:
  -
---

# Document Name

What this document is, what it proves, and at which stage of the process it is needed.

## How to Obtain
Step-by-step from the official issuing body. Exact URL for application if available. Note QCTO/MerSETA/DHET/NAMB-specific channels.

## Known Delays & Traps
Real-world processing issues specific to SA trades applicants — e.g. lost trade-test records at Olifantsfontein, MerSETA logbook reconstruction, SAPS eSAPS vs police-station PCC, DIRCO apostille queue.

## Sequencing Note
Which documents must be in hand before this one can be started; which documents it unblocks.

## Connections
- [[Issuing Body]] — issued_by, source: [url]
- [[Skills Assessment Body]] — submitted_to, source: [url]
- [[Visa Route]] — required_for, source: [url]

## Sources
- [Source title](url)
```

**WORK EXPERIENCE EVIDENCE note:**
```markdown
---
type: work_experience_evidence
name:
acceptable_forms: [logbook | section_13_contract | sars_irp5 | uif_record | employer_reference | payslips | tax_certificate]
required_for_destinations: []
minimum_years_required: [4_yrs_with_formal_training | 6_yrs_no_formal_training | other]
minimum_recent_employment: "12 months full-time paid in the nominated occupation in the 3 years before assessment (TRA standard — confirm)"
acceptable_employers: [registered_company | self_employed | family_business_with_evidence | informal_excluded]
evidence_strength: confirmed | alleged | rumoured
tags: [work-experience, trades, skills-assessment, south-africa]
sources:
  -
---

# Evidence Type Name

What counts as proof of trade experience for skills assessments.

## What Assessors Accept
TRA, provincial Canadian bodies, EWRB/PGDB, UK employer (CoS) — comparison of acceptable evidence.

## What Trips SA Applicants Up
Informal "side-job" hours not accepted; family-business work needs corroboration; self-employment needs SARS records + invoices + client testimonials.

## Connections
- [[Skills Assessment Body]] — accepted_by, source: [url]
- [[Document]] — supports, source: [url]

## Sources
- [Source title](url)
```

**EDGE metadata:**
- `relationship_type`: issued_by | submitted_to | required_for | precedes | follows | unblocks | apostilled_by | accepted_by | rejected_by | supports
- `description`: short label
- `date_range`: if applicable
- `evidence_strength`: confirmed | alleged | rumoured
- `sources`: at least one URL

---

## Runtime rules

- `evidence_strength`: `confirmed` | `alleged` | `rumoured`
- **Sequence is destination- and assessor-specific:** Typical chain is SAQA / QCTO verification → (legalisation/apostille if required by the receiving authority) → skills assessment submission → positive outcome → employer offer / EOI → visa application. Do not assume DIRCO legalisation is universally required — confirm per destination/assessor at point of writing.
- **TRA work-experience minimums:** Licensed trades require ≥4 years (formal training) or ≥6 years (no formal training). Non-licensed trades require ≥3 years (formal training) or ≥5 years (no formal training). All paths additionally require ≥12 months full-time paid employment in the nominated occupation in the 3 years before lodgement. Verify current rules at tradesrecognitionaustralia.gov.au — these are reviewed.
- **TRA OSAP practical assessment locations vary by RTO and trade.** Historically locations have included Australia, the UK, India, the Philippines and South Africa. Look up the current list per trade via the TRA RTO Finder at tradesrecognitionaustralia.gov.au at point of writing; flag travel cost where applicable.
- **Legalisation via DIRCO is conditional, not universal:** DIRCO apostille is required only where the receiving authority demands legalisation. Use apostille for Hague-Convention countries (UK, AU, NZ are Hague members; Canada acceded to the Apostille Convention in January 2024) and authentication for non-Hague routes. Confirm receiving-authority requirement before recommending DIRCO; document the DIRCO walk-in vs mail-in process and current turnaround.
- **SAPS PCC channel:** SAPS issues PCC via police-station submission with collection from SAPS Criminal Record Centre (or courier where supported). SAPS does not email or scan certificates as the primary delivery channel — confirm current submission and collection process at saps.gov.za and use the online status enquiry where supported. Do not represent unofficial third-party "fast-track PCC" services as a SAPS channel.
- **MerSETA logbook reconstruction** — many SA artisans lost or never received their original Section 13 logbook; reconstruction options via the original training provider or MerSETA must be documented for older applicants.
- **N-level qualifications — different issuers:** N1, N2, N3, NSC, and NC(V) verification and replacement go via Umalusi (umalusi.org.za); N4, N5, N6 and the N-Diploma go via DHET (dhet.gov.za). Some lost-document records are held at Olifantsfontein for older qualifications. Direct applicants to the correct body per certificate.
- **Canada provincial Trade Equivalency Assessment (TEA)** is destination-specific — Alberta AIT (tradesecrets.alberta.ca), BC SkilledTradesBC, Skilled Trades Ontario (skilledtradesontario.ca), Saskatchewan have different document requirements. Document by province; do not collapse into one process. SA Red Seal **does not transfer** — re-assessment is required.
- **NZ EWRB / PGDB registration** requires both documentary assessment AND post-arrival examination/licensing for plumbers and electricians; flag the post-arrival step distinctly so applicants budget time and money.
- **UK Skilled Worker (TSL-eligible occupation)** does not require a UK-side skills assessment (employer's CoS + UKVI process), but on-site competency cards (CSCS, ECS for electricians, JIB) are typically required by employers post-arrival. The TSL is a list of occupations within the Skilled Worker visa, not a separate visa route — phrase as "Skilled Worker via a TSL- or ISL-eligible occupation." Document the post-arrival card pathway as a separate stage.
- **Unabridged birth certificate (and marriage certificate where applicable)** issued by Home Affairs SA is required for most family-route applications and dependants — note that UK TSL does not allow dependants, so this requirement may not apply for UK TSL applicants.
- **SAQA evaluation is for educational credentials** (N-level, post-school qualifications) — it is NOT a substitute for a TRA OSAP / MSA skills assessment, nor for a provincial Canadian TEA. Clarify the distinction prominently.
- **All fees and processing times must be date-stamped** with the verification date; ZAR conversions must include the exchange-rate date.
- All factual claims about document requirements must be verified at the primary source (qcto.org.za, dirco.gov.za, saps.gov.za, tradesrecognitionaustralia.gov.au, gov.uk, canada.ca, immigration.govt.nz). Search snippets alone are not confirmation.
- Folder structure: `Documents/`, `Work Experience Evidence/`
