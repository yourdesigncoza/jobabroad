# Prompt: Teaching — Visa Route Overview

> Run with `/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-teaching-04-visa-routes`

---

/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-teaching-04-visa-routes

**Goal:** Map all active visa routes and eligibility requirements for South African school teachers seeking work permits in the UK, Australia, and New Zealand — including QTS requirements, salary thresholds, PR pathways, and recent policy changes affecting SA applicants, as of 2025–2026. Canada is out of scope: note it as a complex points-based system requiring provincial research and do not map it in detail.

**Seed entities:**
- UK Skilled Worker Visa (SOC 2313 Secondary school teachers; SOC 2314 Primary school teachers; SOC 2316 Special educational needs teachers — verify current codes against gov.uk/government/publications/skilled-worker-visa-eligible-occupations)
- Australia Skills in Demand Visa — Subclass 482 (requires state/territory teacher registration; AITSL skills assessment required for migration skills-assessment purposes)
- Australia Employer Nomination Scheme — Subclass 186 (PR pathway after 482)
- New Zealand Accredited Employer Work Visa — AEWV (Green List Tier 1 Straight to Residence for secondary school teachers from 1 May 2024; primary/intermediate teachers added Tier 1 from 26 March 2025)
- Canada [OUT OF SCOPE — brief note only]: Express Entry / Federal Skilled Worker requires provincial teacher certification (13 separate bodies); no national recognition route. Document barriers honestly; do not map visa or registration steps

**Source constraints:** gov.uk/skilled-worker-visa, gov.uk/government/publications/skilled-worker-visa-eligible-occupations, gov.uk/government/publications/national-pay-scales-for-eligible-teaching-and-education-jobs, gov.uk/guidance/qualified-teacher-status-qts, gov.uk/government/publications/overseas-trained-teachers-apply-for-qualified-teacher-status-in-england/overseas-trained-teachers-apply-for-qualified-teacher-status-in-england, homeaffairs.gov.au/visas/getting-a-visa/visa-listing/skills-in-demand-482, homeaffairs.gov.au/visas/getting-a-visa/visa-listing/employer-nomination-scheme-186, aitsl.edu.au/migrate-to-australia, vit.edu.au, nesa.nsw.edu.au, qct.edu.au, immigration.govt.nz/work/requirements-for-work-visas/accredited-employer-work-visa, immigration.govt.nz/work/requirements-for-work-visas/green-list-occupations-qualifications-and-skills/, immigration.govt.nz/new-zealand-visas/apply-for-a-visa/about-visa/straight-to-residence-visa, teachingcouncil.nz, ircc.canada.ca (brief Canada reference only), Home Office visa statistics (gov.uk)

**Iterations:** 10

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
qualification_level_required:
subject_restrictions: []
language_requirement:
qts_required: [yes | no | optional_up_to_4_years]
minimum_salary_threshold:
employer_sponsorship_required: [yes | no]
processing_time_standard:
processing_time_priority:
initial_visa_duration:
pr_pathway:
pr_timeline:
age_limit:
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
Specific requirements that apply to SA-qualified teachers — qualification level, QTS/equivalent requirement, subject restrictions, salary threshold, language requirement, employer sponsorship.

## Current Status & Recent Changes
Any changes in the last 12 months that affect SA teachers. Flag UK free QTS from August 2025 and RQF 6 reform from July 2025 explicitly. Flag NZ AEWV salary floor NZD $35/hr from March 2026 and police certificate change from December 2025.

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

**POLICY CHANGE note:**
```markdown
---
type: policy_change
name:
visa_route_affected: "[[visa_route_name]]"
effective_date:
what_changed:
impact_on_sa_teachers:
source_document:
evidence_strength: confirmed | alleged | rumoured
tags: [policy-change, visa, teaching, work-abroad]
sources:
  -
---

# Policy Change: [Short Description]

What changed, when, and what it means for an SA teacher applying now.

## Before vs After
| | Before | After |
|---|---|---|
| Qualification level | | |
| Salary threshold | | |
| QTS requirement | | |
| Subject restriction | | |

## Connections
- [[Visa Route]] — affects, source: [url]

## Sources
- [Source title](url)
```

**EDGE metadata:**
- `relationship_type`: available_in | requires_recognition_from | replaced_by | replaced | affects | pr_leads_to | closed_to | regulated_by
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
- **SA citizens / UK — NO Youth Mobility Scheme (CRITICAL):** South African passport holders cannot use the UK Youth Mobility Scheme regardless of age. All SA teachers must obtain a Skilled Worker Visa with employer sponsorship. Confirm this explicitly — do not present any alternative youth/working-holiday route for UK
- **UK QTS and unqualified teacher route:** Teachers with QTS (or recognised overseas equivalent) can be sponsored at the qualified teacher salary rate. Without QTS, schools can employ overseas teachers for up to 4 years on the unqualified rate on a Skilled Worker Visa before they must obtain QTS. Research and confirm current DfE rules on this 4-year limit
- **UK salary threshold (time-sensitive):** From September 2025, minimum qualified teacher salary is £32,916 outside London; Fringe, Outer London, and Inner London supplements apply. Independent schools must also meet Skilled Worker salary floor. Confirm current thresholds — these are reviewed annually
- **QTS subject restriction:** The UK DfE overseas QTS route for SA teachers is restricted to subject specialists in Maths, Science, or Languages qualified to teach ages 11–16. Primary and Foundation Phase teachers and other subjects can still work under Skilled Worker Visa without QTS for up to 4 years. Confirm the current DfE subject list — do not claim all SA teachers get free QTS
- **NZ age limit (CRITICAL):** Immigration New Zealand Straight to Residence visa requires applicants to be under 56 years of age at time of residence application — this is an INZ visa requirement, not a Teaching Council requirement. Flag as a disqualifying constraint for older teachers and confirm current INZ age-limit rule
- **NZ police certificate (time-sensitive):** From December 2025, a police clearance receipt is no longer accepted for NZ immigration — the actual SAPS police clearance certificate is required before applying
- **NZ salary floor:** AEWV requires NZD $35/hr minimum from March 2026 — verify current floor
- **NZ Straight to Residence (headline finding):** Secondary school teachers have been Green List Tier 1 since 1 May 2024; primary/intermediate teachers since 26 March 2025. Tier 1 means the teacher applies directly for residence — no Work to Residence step required. This is the most direct PR pathway of any destination covered. Verify current INZ criteria and present as the lead finding for NZ
- **Canada (out of scope):** Note Canada as a complex points-based system requiring provincial teacher certification (13 bodies). State explicitly that this guide does not map Canadian routes and direct readers to ircc.canada.ca and their relevant provincial college of teachers
- Distinguish the visa route from the qualification recognition process — they are sequential but separate; registration with the teaching authority must precede or accompany the visa in each jurisdiction
- Folder structure: `Visa Routes/`, `Policy Changes/`

<!--
## Canvas export (on-demand)
Generate canvas only when user explicitly requests "generate canvas".
-->
