# Prompt: Teaching — Destination Options

> Run with `/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-teaching-01-destinations`

---

/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-teaching-01-destinations

**Goal:** Map all active destination countries and demand signals for South African school teachers seeking overseas work — covering the UK, Australia, and New Zealand as primary destinations — including current qualification recognition routes, vacancy data, and honest route assessments, as of 2025–2026. Canada is a secondary entry: document the Express Entry framework briefly and honest barriers only; do not attempt provincial-level detail.

**Seed entities:**
- DfE QTS digital service (UK Department for Education — free Qualified Teacher Status from August 2025)
- SACE (South African Council for Educators — issues Letter of Good Standing for UK QTS and overseas recognition)
- AITSL (Australian Institute for Teaching and School Leadership — skills assessment authority for teacher migration)
- Teaching Council of Aotearoa New Zealand (Matatū Aotearoa — NZ teacher registration for overseas applicants)
- UK Register of Licensed Sponsors — schools (Home Office public register of schools holding Skilled Worker sponsorship licences)

**Source constraints:** gov.uk/guidance/qualified-teacher-status-qts, gov.uk/government/publications/overseas-trained-teachers-apply-for-qualified-teacher-status-in-england/overseas-trained-teachers-apply-for-qualified-teacher-status-in-england, apply-for-qts-in-england.education.gov.uk, gov.uk/register-of-licensed-sponsors, gov.uk/government/publications/skilled-worker-visa-eligible-occupations, teaching-vacancies.service.gov.uk, sace.org.za, aitsl.edu.au/migrate-to-australia, vit.edu.au (Victoria), nesa.nsw.edu.au (NSW), qct.edu.au (Queensland), trbwa.wa.edu.au (Western Australia), immigration.govt.nz/work/requirements-for-work-visas/green-list-occupations-qualifications-and-skills/, immigration.govt.nz/new-zealand-visas/apply-for-a-visa/about-visa/straight-to-residence-visa, teachingcouncil.nz, nzqa.govt.nz, ircc.canada.ca, tes.com, eteach.com

**Iterations:** 8

---

## Note schemas

**DESTINATION note:**
```markdown
---
type: destination
country:
sa_diaspora_size:
sa_teacher_demand_signal:
primary_visa_route: "[[visa_route_name]]"
secondary_visa_routes: []
qualification_recognition_body:
qts_or_equivalent_free: [yes | no | partial]
shortage_subjects: []
route_status: [open | restricted | closed | emerging]
age_limit_for_residence:
last_signal_date:
evidence_strength: confirmed | alleged | rumoured
tags: [destination, teaching, work-abroad]
sources:
  -
---

# Country Name

2–4 sentences: why SA teachers go here, current demand level, realistic assessment.

## Demand Evidence
Quantified signals — vacancy numbers, DfE subject shortage data, AITSL processing volumes, or immigration statistics.

## Qualification Recognition Path
Step-by-step: how SA teaching qualifications are recognised in this country. Name the specific body and route. Note any subject or age-range restrictions.

## Realistic Assessment
Honest appraisal of route strength for SA teachers right now — note any subject restrictions, sponsorship costs to the school, or practical barriers.

## Connections
- [[Visa Route]] — accessed_via, source: [url]
- [[Qualification Recognition Body]] — requires_assessment_from, source: [url]

## Sources
- [Source title](url)
```

**VISA ROUTE note:**
```markdown
---
type: visa_route
name:
short_name:
country:
soc_codes: []
route_status: [open | restricted | closed | emerging]
qualification_level_required:
subject_restrictions: []
language_requirement:
minimum_salary_threshold:
employer_sponsorship_required: [yes | no]
processing_time:
initial_visa_duration:
pr_pathway:
pr_timeline:
last_policy_change:
last_policy_change_date:
evidence_strength: confirmed | alleged | rumoured
tags: [visa-route, teaching, work-abroad]
sources:
  -
---

# Visa Route Name

Plain-language summary: what this visa is, who it is for, current status.

## Eligibility for SA Teachers
Specific requirements for SA-qualified teachers — qualification level, QTS requirement, subject restrictions, salary threshold, employer sponsorship.

## Current Status & Recent Changes
Any changes in the last 12 months affecting SA teachers. Flag UK July 2025 RQF 6 reform and QTS free-from-August-2025 change explicitly.

## PR Pathway
How and when a teacher on this visa can apply for permanent residence.

## Employer's Role
What the sponsoring school must do — sponsor licence, Certificate of Sponsorship, salary compliance.

## Connections
- [[Destination]] — available_in, source: [url]
- [[Qualification Recognition Body]] — requires_recognition_from, source: [url]

## Sources
- [Source title](url)
```

**EDGE metadata:**
- `relationship_type`: accessed_via | requires_assessment_from | requires_recognition_from | available_in | closed_to | regulated_by | sponsors
- `description`: short label
- `date_range`: YYYY–present or YYYY–YYYY
- `evidence_strength`: confirmed | alleged | rumoured
- `sources`: at least one URL

---

## Runtime rules

- Date-stamp all costs, thresholds, and occupation-list statuses — these change annually
- Flag any closed or suspended routes explicitly as [CLOSED - do not recommend]
- Never present agent estimates as confirmed figures; source must be a government or regulator URL
- If a source is older than 12 months, flag evidence_strength as alleged unless confirmed by a recent primary source
- **QTS subject restriction (CRITICAL):** The UK DfE Apply for QTS route for SA teachers who are NOT already working in a valid teaching role in England requires subject specialism in Maths, Science, or Languages for ages 11–16. SA teachers already in a valid teaching role in England can apply without this subject/age restriction. Primary/Foundation Phase teachers and non-shortage-subject teachers can still teach on a Skilled Worker Visa for up to 4 years without QTS. Research and confirm the current DfE subject list — do not assume all SA teachers get free QTS regardless of context
- **SA citizens / UK:** SA passport holders CANNOT use the Youth Mobility Scheme for the UK — employer-sponsored Skilled Worker Visa is mandatory regardless of age. Confirm this explicitly
- **NZ age limit:** Teaching Council of Aotearoa NZ Green List has an age limit of 55 at time of residence visa application — flag this as an eligibility constraint
- **NZ headline finding (CRITICAL):** New Zealand's Straight to Residence visa for school teachers (secondary from 1 May 2024, primary/intermediate from 26 March 2025) is currently the most accessible PR pathway for SA teachers — no employer sponsorship required for the residence application. This should be presented as the standout finding for NZ, not buried. Verify current INZ Green List teacher categories
- **Australia: state-level registration (CRITICAL):** AITSL does the migration skills assessment; actual classroom registration requires separate state/territory approval. UK-destined teachers only need QTS — Australia requires BOTH AITSL + state registration. This two-step process is a key barrier to flag clearly
- **Canada:** Document as "complex — out of scope for this guide." Note the provincial licensing barrier and Express Entry CRS dependency; do not attempt to give a complete route assessment
- Folder structure: `Destinations/`, `Visa Routes/`

<!--
## Canvas export (on-demand)
Generate canvas only when user explicitly requests "generate canvas".
-->
