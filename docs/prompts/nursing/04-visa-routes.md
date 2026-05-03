# Prompt: Nursing — Visa Routes

> Run with `/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-nursing-04-visa-routes`

---

/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-nursing-04-visa-routes

**Goal:** Build a current, source-verified reference of every visa route available to South African nurses for the UK, Australia, and Ireland — covering eligibility, salary thresholds, processing times, PR pathways, and any recent policy changes that affect SA applicants.

**Seed entities:**
- UK Health and Care Worker Visa (Skilled Worker sub-route)
- UK Skilled Worker Visa (RQF 6 requirements post July 2025)
- Australia Skills in Demand Visa — subclass 482 (replaced TSS Dec 2024)
- Australia Employer Nomination Scheme — subclass 186 (PR)
- Ireland Critical Skills Employment Permit (CSEP)
- Ireland General Employment Permit (GEP)

**Source constraints:** gov.uk/health-care-worker-visa, gov.uk/skilled-worker-visa, homeaffairs.gov.au/visas, dete.ie/employment-permits, immigration.gov.ie, Home Office visa statistics (gov.uk), DETE Ireland permit statistics (dete.ie), any SA immigration law firm analysis citing primary Home Office / DETE guidance, NMC guidance on visa sponsorship

**Iterations:** 8

---

## Note schemas

**VISA ROUTE note:**
```markdown
---
type: visa_route
name:
short_name:
country:
route_status: [open | restricted | closed | emerging]
visa_subclass_or_code:
replaced_by:
replaced_what:
rqf_or_qualification_level:
language_requirement:
minimum_salary_threshold:
employer_sponsorship_required: [yes | no]
health_surcharge_applies: [yes | no | waived]
processing_time_standard:
processing_time_priority:
initial_visa_duration:
pr_pathway:
pr_timeline:
last_policy_change:
last_policy_change_date:
evidence_strength: confirmed | alleged | rumoured
tags: [visa-route, nursing, work-abroad]
sources:
  -
---

# Visa Route Name

Plain-language summary: what this visa is, who it is for, current status.

## Eligibility for SA Nurses
Specific requirements that apply to SA-qualified nurses — NMC/AHPRA/NMBI registration stage required before applying, salary threshold, language test.

## Current Status & Recent Changes
Any changes in the last 12 months that affect SA nurses. Flag UK July 2025 reforms explicitly.

## PR Pathway
How and when a nurse on this visa can apply for permanent residence or indefinite leave to remain.

## Employer's Role
What the sponsoring employer must do — sponsor licence, Certificate of Sponsorship, salary compliance.

## Connections
- [[Destination]] — available_in, source: [url]
- [[Destination Regulator]] — requires_registration_with, source: [url]

## Sources
- [Source title](url)
```

**POLICY CHANGE note:**
```markdown
---
type: policy_change
name:
visa_route_affected: "[[visa_route_name]]"
effective_date:
what_changed:
impact_on_sa_nurses:
source_document:
evidence_strength: confirmed | alleged | rumoured
tags: [policy-change, visa, nursing, work-abroad]
sources:
  -
---

# Policy Change: [Short Description]

What changed, when, and what it means for an SA nurse applying now.

## Before vs After
| | Before | After |
|---|---|---|
| Qualification level | | |
| Salary threshold | | |
| Language requirement | | |
| Care worker eligibility | | |

## Connections
- [[Visa Route]] — affects, source: [url]

## Sources
- [Source title](url)
```

**EDGE metadata:**
- `relationship_type`: available_in | requires_registration_with | replaced_by | replaced | affects | pr_leads_to
- `description`: short label
- `date_range`: YYYY–present or YYYY–YYYY
- `evidence_strength`: confirmed | alleged | rumoured
- `sources`: at least one URL

---

## Runtime rules

- `evidence_strength`: `confirmed` | `alleged` | `rumoured`
- UK care worker route (overseas applicants) closed July 2025 — document this with source and what it means for SA nurses
- All salary thresholds must be dated — they are reviewed annually
- Distinguish the visa route from the NMC registration process — they are sequential but separate
- Folder structure: `Visa Routes/`, `Policy Changes/`
