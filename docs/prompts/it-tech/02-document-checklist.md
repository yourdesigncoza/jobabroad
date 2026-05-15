# Prompt: IT / Tech — Document Checklist

> Run with `/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-it-tech-02-documents`

---

/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-it-tech-02-documents

**Goal:** Build a complete, sequenced, source-verified document checklist for a South African ICT professional applying to work in Ireland, the UK, Germany, Canada, or Australia — covering every document from SA-side preparation (passport, police clearance, degree apostille, SAQA evaluation) through skills assessment (ACS / WES), language test (IELTS / OET / TOEFL where applicable), visa application, and destination-side registration, with processing times, costs (ZAR + local currency), and known logistical traps.

**Seed entities:**
- SAPS Police Clearance Certificate (PCC) + DIRCO apostille
- SAQA Verifications Service / Individual Verification Letter (for SA-issued degrees used abroad — NOT SAQA Foreign Qualification Evaluation, which is for non-SA qualifications coming INTO SA)
- WES ECA OR any IRCC-designated ECA provider (CES Toronto, ICAS, IQAS Alberta, ICES BC, MCC for physicians — see IRCC designated-organisations page; WES is one of several)
- ACS Migration Skills Assessment (Australian Computer Society) — Skills-Based / Post-Australian-Study / Temporary Graduate / RPL pathways
- Anabin database lookup (institution AND degree/type/field must show as H+ / equivalent/corresponding) + ZAB Statement of Comparability (Germany)
- IELTS General Training / IELTS for UKVI (SELT) / CELPIP-General / PTE Core / TEF Canada — destination-specific, not interchangeable
- UK Certificate of Sponsorship (CoS) from a licensed sponsor + UK ENIC / Ecctis statement of comparability (for overseas-degree equivalence and English-taught-degree proof)

**Source constraints:** saps.gov.za (PCC application), dirco.gov.za (legalisation / apostille — note: DIRCO apostille is free of charge, but courier / agent / High Court / notary costs apply separately), saqa.org.za (Verifications Service / Individual Verification Letter for SA-issued qualifications used abroad), wes.org (ECA process), canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/documents/education-assessed.html (full IRCC designated-ECA-providers list — not WES-only), acs.org.au (ACS Migration Skills Assessment portal — pathway-specific fees, RPL guidelines), anabin.kmk.org (German degree-recognition database — H+ institution AND specific degree/type/field must show as equivalent/corresponding for direct recognition), kmk.org/zab and zab.kmk.org (official ZAB Statement of Comparability source), make-it-in-germany.com (federal portal), anerkennung-in-deutschland.de (recognition portal for regulated professions), ielts.org, celpip.ca, pearsonpte.com (PTE Core for Canada and IELTS/PTE/TOEFL for AU/UK), gov.uk/skilled-worker-visa (CoS, documents required), ecctis.com (UK ENIC — overseas degree equivalence and English-taught-degree proof), gov.uk/government/publications/register-of-licensed-sponsors-workers, enterprise.gov.ie (Ireland CSEP documentation), irishimmigration.ie (Ireland entry visa / preclearance / Stamp permissions — South African nationals require an Irish entry visa), canada.ca/en/immigration-refugees-citizenship (Express Entry document checklist + language-test page for IELTS/CELPIP/PTE Core/TEF/TCF and CLB mappings), immi.homeaffairs.gov.au (482/189/186 documentation requirements; English-evidence rules — IELTS is one accepted test alongside PTE/TOEFL/etc.; SA passport is NOT on the exempt-passport list), iitpsa.org.za

**Iterations:** 6

---

## Note schemas

**DOCUMENT note:**
```markdown
---
type: document
name:
aliases: []
stage: [sa_preparation | sa_submission | skills_assessment | language_test | visa_application | destination_registration]
issued_by: "[[issuing_body]]"
submitted_to: "[[receiving_body]]"
required_for_destinations: []
processing_time_official:
processing_time_reported:
cost_zar:
cost_destination_currency:
validity_period:
apostille_required: [yes | no | destination_dependent]
direct_shipping_required: [yes — body sends direct | no — issued to applicant | destination_dependent]
sa_to_destination_dependency: "[[other_document_name]] or null"
evidence_strength: confirmed | alleged | rumoured
tags: [document, ict, work-abroad, checklist, south-africa]
sources:
  -
---

# Document Name

What this document is, what it proves, and at what stage of the ICT pathway it is needed.

## How to Obtain
Step-by-step from the official source — exact URL, application form name, SA application centre if relevant.

## Cost & Processing
- Cost (ZAR): R[amount] (as of [date])
- Cost (local currency, if any): [amount] [currency]
- Official processing time: [days/weeks]
- Reported real-world time: [days/weeks]

## Known Delays & Traps
Real-world issues. Specific to SA — e.g. SAPS PCC backlog, DIRCO apostille queue, WES vs ACS scan vs original requirement, SAQA application backlog.

## Connections
- [[Issuing Body]] — issued_by, source: [url]
- [[Receiving Body]] — submitted_to, source: [url]
- [[Dependent Document]] — precedes, source: [url]

## Sources
- [Source title](url)
```

**SKILLS ASSESSMENT note:**
```markdown
---
type: skills_assessment
name:
short_name:
country:
required_for_routes: []
sa_degree_typical_outcome:
processing_time_official:
processing_time_reported:
cost_zar:
cost_local_currency:
documents_required: []
rpl_pathway_available: [yes | no]
evidence_strength: confirmed | alleged | rumoured
tags: [skills-assessment, ict, work-abroad]
sources:
  -
---

# Skills Assessment Name

What this assessment proves, who requires it, and the typical outcome for an SA computer-science / IT degree.

## Required Documents
Itemised list with notes on apostille / certified-copy requirements.

## Typical Outcome for SA Degrees
What WES / ACS / ZAB / NARIC typically returns for a SA BSc Comp Sci, BCom Informatics, BEng Computer Engineering, or NQF 6+ diploma.

## Connections
- [[Visa Route]] — required_for, source: [url]

## Sources
- [Source title](url)
```

**LANGUAGE TEST note:**
```markdown
---
type: language_test
name:
short_name:
required_by: []
minimum_score_ict:
valid_for_years:
test_centres_sa: []
booking_lead_time:
cost_zar:
cost_local_currency:
prep_resources: []
sa_passport_exemption: [yes | no | route_dependent]
evidence_strength: confirmed | alleged | rumoured
tags: [language-test, ict, work-abroad]
sources:
  -
---

# Test Name

What this test is, who requires it for ICT roles, and whether SA passport-holders qualify as native English speakers (route-dependent).

## ICT-Relevant Score Requirements
- Ireland CSEP: [score or n/a]
- UK Skilled Worker (B2 from 8 Jan 2026): [score]
- Germany Opportunity Card B2 English route: [score]
- Canada Express Entry CLB 7+: [score]
- Australia 482/189: [score]

## SA Test Centres
City list and booking notes.

## Connections
- [[Visa Route]] — required_by, source: [url]

## Sources
- [Source title](url)
```

**EDGE metadata:**
- `relationship_type`: issued_by | submitted_to | required_for | precedes | follows | direct_ships_to | apostilled_by
- `description`: short label
- `date_range`: if applicable
- `evidence_strength`: confirmed | alleged | rumoured
- `sources`: at least one URL

---

## Runtime rules

- `evidence_strength`: `confirmed` | `alleged` | `rumoured`
- Sequence matters — note which documents must be obtained before others can be started (e.g. SAPS PCC must precede DIRCO apostille; WES ECA requires sealed academic transcript sent direct from SA university)
- For each destination route, list the documents in the exact order the official source requires
- SA passport-holders qualify as "native English speakers" for some routes (Ireland CSEP — no formal test) but NOT all: Canada Express Entry requires IELTS General Training / CELPIP-General / PTE Core / TEF Canada (CLB 7+ minimum for FSWP); Australia 482 / 189 requires English evidence unless exempt — SA passport is NOT on the DHA exempt-passport list; UK Skilled Worker requires B2 English from 8 Jan 2026 (was B1) and SA candidates can prove via SELT (IELTS for UKVI) OR an English-medium degree confirmed by UK ENIC. Confirm per route, do not generalise.
- Add a separate ISSUING_BODY and RECEIVING_BODY note schema if any government / regulator entity is referenced more than twice across documents — the existing DOCUMENT schema references `[[issuing_body]]` and `[[receiving_body]]` but no dedicated entity note exists
- Date-stamp every fee and processing time
- Distinguish ZAB Statement of Comparability (Germany) from Anabin status check (free, instant) — most SA candidates only need the latter if the SA university is listed H+
- Folder structure: `Documents/`, `Skills Assessments/`, `Language Tests/`
