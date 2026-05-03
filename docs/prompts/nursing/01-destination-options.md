# Prompt: Nursing — Destination Options

> Run with `/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-nursing-01-destinations`

---

/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-nursing-01-destinations

**Goal:** Fill the critical gaps identified after 4 research iterations on SA nurse destination options. The vault already has strong coverage of UK, Australia, Ireland, New Zealand, Middle East, and Canada. This run must resolve the 6 unconfirmed gaps below — do not re-research what is already covered.

**Seed entities (gap-targeted):**
- SA nursing diploma RQF level equivalence UK (pre-2005 diploma-trained nurses — do they qualify for the Health and Care Visa?)
- NMC Annual Data Report 2024–25 SA country-of-training row (nmc.org.uk annual PDF)
- NMBI English language exemption SA nurses (do SA-trained nurses require IELTS/OET or are they exempt?)
- Netherlands Belgium SA nurse recruitment (emerging EU destinations — Flemish Belgium, Dutch BIG register)
- Canada provincial SA nurse recruitment pipeline (NNAS credential + NCLEX-RN + provincial licensing)
- SANC annual clearance certificate data (how many SA nurses requested CoGS for overseas work 2023–24?)

**Source constraints:** nmc.org.uk (Annual Data Report PDF — parse country-of-training table), nmbi.ie (language requirements page), bigregister.nl, vlaanderen.be (Flemish Belgium nursing recognition), NNAS (nnas.ca), college-of-nurses.org (Ontario), SANC annual report (sanc.co.za), gov.uk/health-care-worker-visa (RQF level requirements), NMC overseas applicant guidance

**Iterations:** 6

---

## Note schemas

**DESTINATION note:**
```markdown
---
type: destination
country:
sa_diaspora_size:
sa_nurse_demand_signal:
primary_visa_route: "[[visa_route_name]]"
secondary_visa_routes: []
active_nhs_or_equivalent_recruitment: [yes | no | unknown]
who_red_list_status: [listed | not_listed]
route_status: [open | restricted | closed | emerging]
last_signal_date:
evidence_strength: confirmed | alleged | rumoured
tags: [destination, nursing, work-abroad]
sources:
  -
---

# Country Name

2–4 sentences: why SA nurses go here, current demand level, realistic assessment.

## Demand Evidence
Quantified signals — vacancy numbers, NMC/AHPRA application volumes, visa approval stats.

## Who Is Actively Recruiting
Named NHS trusts, hospital groups, or government programmes actively recruiting from SA.

## Realistic Assessment
Honest appraisal: is this a strong route right now, or is it closing/uncertain?

## Connections
- [[Visa Route]] — accessed_via, source: [url]
- [[Destination Regulator]] — regulated_by, source: [url]

## Sources
- [Source title](url)
```

**VISA ROUTE note:**
```markdown
---
type: visa_route
name:
country:
route_status: [open | restricted | closed | emerging]
replaced_by:
rqf_level_required:
language_requirement:
salary_threshold:
processing_time:
pr_pathway:
last_policy_change:
evidence_strength: confirmed | alleged | rumoured
tags: [visa-route, nursing, work-abroad]
sources:
  -
---

# Visa Route Name

Plain-language summary of the route, who it is for, and current status.

## Current Status
Open / restricted / closed — with date and source. Note July 2025 UK reforms where relevant.

## Eligibility for SA Nurses
Specific requirements applicable to SA-qualified nurses (NMC registration stage, language test, salary threshold).

## Connections
- [[Destination]] — available_in, source: [url]
- [[Destination Regulator]] — requires_registration_with, source: [url]

## Sources
- [Source title](url)
```

**EDGE metadata:**
- `relationship_type`: accessed_via | regulated_by | replaced_by | requires_registration_with | available_in | closed_to
- `description`: short label
- `date_range`: YYYY–present or YYYY–YYYY (if closed)
- `evidence_strength`: confirmed | alleged | rumoured
- `sources`: at least one URL

---

## Runtime rules

- `evidence_strength`: `confirmed` | `alleged` | `rumoured`
- Flag the UK care worker route closure (July 2025) explicitly — many SA nurses still believe this route is open
- Confirm WHO Red List status for SA with a current official source — do not assume
- All demand figures must be dated — NMC stats are annual, AHPRA quarterly
- Folder structure: `Destinations/`, `Visa Routes/`
