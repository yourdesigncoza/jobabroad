# Prompt: Engineering — Visa Route Overview

> Run with `/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-engineering-04-visa-routes`

---

/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-engineering-04-visa-routes

**Goal:** Build a current, source-verified reference of every visa route available to South African engineers for Australia, Ireland, the UK, New Zealand, and Canada — covering eligibility, salary thresholds, processing times, PR pathways, and any recent policy changes that affect SA applicants as of 2025–2026.

**Seed entities:**
- Australia Skills in Demand Visa — Subclass 482 (Core Skills stream)
- Australia Employer Nomination Scheme — Subclass 186 (permanent residence)
- Australia points-tested skilled visas — Subclass 189 Skilled Independent / Subclass 190 Skilled Nominated
- Ireland Critical Skills Employment Permit (CSEP)
- UK Skilled Worker Visa (RQF 6+ requirements post 22 July 2025)
- New Zealand Green List via the Accredited Employer Work Visa, and the Skilled Migrant Category Resident Visa
- Canada Express Entry — Federal Skilled Worker Program and STEM category-based draws
- Germany Opportunity Card and Germany Skilled Worker D-Visa (secondary route)

**Source constraints:** immi.homeaffairs.gov.au/visas (Subclass 482, 186, 189, 190 and the Core Skills Occupation List), engineersaustralia.org.au (skills assessment requirement for the visa), enterprise.gov.ie (Critical Skills Employment Permit and Critical Skills Occupations List), irishimmigration.ie and dfa.ie (Long Stay 'D' visa and visa-required nationality rules), gov.uk/skilled-worker-visa and the Immigration Rules Appendix Skilled Worker / Appendix Skilled Occupations / Immigration Salary List / Temporary Shortage List, gov.uk (UK Register of Licensed Sponsors), immigration.govt.nz (Green List, Accredited Employer Work Visa, Skilled Migrant Category) and engineeringnz.org / nzqa.govt.nz (NZ qualification recognition), canada.ca (Express Entry Ministerial Instructions, round-of-invitations results, NOC/TEER pages), make-it-in-germany.com and anerkennung-in-deutschland.de / anabin (Germany Opportunity Card, Skilled Worker D-Visa, ZAB recognition — secondary route only)

**Iterations:** 10

---

## Note schemas — apply to every note created

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
skills_assessment_required: [yes | no | strengthens_application]
language_requirement:
minimum_salary_threshold:
employer_sponsorship_required: [yes | no]
processing_time_standard:
processing_time_priority:
initial_visa_duration:
pr_pathway:
pr_timeline:
last_policy_change:
last_policy_change_date:
evidence_strength: confirmed | alleged | rumoured
tags: [visa-route, engineering, work-abroad]
sources:
  -
---

# Visa Route Name

Plain-language summary: what this visa is, who it is for, current status.

## Eligibility for SA Engineers
Specific requirements that apply to ECSA-accredited engineers — which skills assessment is required before applying, occupation-list status, salary threshold, language test, age limits.

## Current Status & Recent Changes
Any changes in the last 12 months that affect SA engineers. Flag UK July 2025 reforms and the April 2026 settlement change explicitly.

## PR Pathway
How and when an engineer on this visa can apply for permanent residence.

## Employer's Role
What the sponsoring employer must do — sponsor licence / accreditation, nomination, Certificate of Sponsorship, salary compliance. Note routes that need no employer (e.g. points-based).

## Connections
- [[Destination]] — available_in, source: [url]
- [[Skills Assessment Body]] — requires_assessment_by, source: [url]

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
impact_on_sa_engineers:
source_document:
evidence_strength: confirmed | alleged | rumoured
tags: [policy-change, visa, engineering, work-abroad]
sources:
  -
---

# Policy Change: [Short Description]

What changed, when, and what it means for an SA engineer applying now.

## Before vs After
| | Before | After |
|---|---|---|
| Qualification level | | |
| Salary threshold | | |
| Language requirement | | |
| PR / settlement timeline | | |

## Connections
- [[Visa Route]] — affects, source: [url]

## Sources
- [Source title](url)
```

**EDGE metadata (record on every direct verifiable connection):**
- `relationship_type`: available_in | requires_assessment_by | replaced_by | replaced | affects | pr_leads_to | regulated_by
- `description`: short label
- `date_range`: YYYY–present or YYYY–YYYY
- `evidence_strength`: confirmed | alleged | rumoured
- `sources`: at least one URL

---

## Runtime rules for vault-builder

- `evidence_strength`: `confirmed` | `alleged` | `rumoured` — never present agent estimates as fact
- Every note and every connection must cite at least one source URL
- Date-stamp all salary thresholds, fees, and occupation-list statuses — they are reviewed annually
- Flag any closed or suspended routes explicitly as `[CLOSED - do not recommend]`
- Distinguish the visa route from the skills-assessment process — they are sequential but separate. A positive Engineers Australia skills assessment is **always** required for the points-tested routes (Subclass 189 / 190 / 491) and for ENS Direct Entry; for the Subclass 482 it may or may not be required depending on the nominated occupation and the applicant's passport — instruct the reader to confirm the requirement per occupation rather than assuming it.
- **UK Skilled Worker, recent reforms:** the 22 July 2025 reforms raised the skill threshold to RQF 6 (degree-qualified engineers unaffected; sub-degree RQF 3–5 roles restricted for new applicants unless on the Immigration Salary List or Temporary Shortage List) and increased salary thresholds. A higher B2 English requirement for new Skilled Worker applicants has also been announced — confirm the exact effective date from gov.uk rather than tying it to July 2025. A 10-year "earned settlement" baseline has been proposed (Home Office consultation Nov 2025 – Feb 2026); treat it as a published policy position, not implemented law, unless final Immigration Rules confirm it.
- **Ireland:** South Africa has been visa-required for Ireland since 10 July 2024 — the engineer needs both the Critical Skills Employment Permit AND a Long Stay 'D' entry visa. The CSEP has no Labour Market Needs Test and leads to Stamp 4. €40,904 salary threshold for Critical Skills Occupations List engineering roles; roles paying over €68,911 are eligible even if not on the Critical Skills list, provided the occupation is not on the Ineligible List.
- **New Zealand:** confirm current Tier 1 (Straight to Residence) vs Tier 2 (Work to Residence) status per engineering discipline; age limit ≤55 at residence application; NZD $35/hour Green List threshold from 9 March 2026; valid police certificate required upfront. Cover the Skilled Migrant Category Resident Visa as a separate points-based route.
- **Canada:** do not hard-code CRS cutoffs — they change every draw. Require current round-by-round CRS cutoffs from IRCC Ministerial Instructions / round-of-invitations data; describe the pattern (category-based STEM draws have historically had lower cutoffs than general draws) without stating a fixed range. A Provincial Nomination adds 600 CRS points; note that Canada is reducing immigration intake targets post-2025.
- **Germany** is a secondary route — cover the Opportunity Card and Skilled Worker D-Visa in one or two notes, flagging that ZAB recognition is required for regulated engineering disciplines (civil, structural, electrical) while non-regulated software/IT-adjacent engineering is exempt. Do not produce shallow half-coverage.
- This product provides general visa **information**, not regulated immigration advice — describe routes and eligibility criteria, never tell a reader which visa they personally should apply for.
- Folder structure: `Visa Routes/`, `Policy Changes/`

<!--
## Canvas export (on-demand only — do not generate unless explicitly requested)
-->
