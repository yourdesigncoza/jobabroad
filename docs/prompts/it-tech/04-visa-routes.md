# Prompt: IT / Tech — Visa Routes

> Run with `/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-it-tech-04-visa-routes`

---

/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-it-tech-04-visa-routes

**Goal:** Build a current, source-verified reference of every visa / permit route available to South African ICT professionals (software developers, data engineers, cybersecurity specialists, cloud / DevOps engineers, IT architects) for Ireland, the UK, Germany, Canada, and Australia as of 2026 — covering eligibility (SOC / ANZSCO / NOC codes, salary thresholds, language requirements, skills assessment), processing times, PR pathways, and any recent policy changes that affect SA applicants.

**Seed entities:**
- Ireland Critical Skills Employment Permit (CSEP) — 1 March 2026 threshold update €40,904
- UK Skilled Worker Visa — RQF 6+ requirement, £41,700 threshold from 22 July 2025, B2 English from 8 January 2026
- Germany Opportunity Card (Chancenkarte) — points route requires German A1 OR English B2 + 6 points; the alternative recognised-skilled-worker direct route (full Anabin equivalence) may not require formal language proof
- Germany EU Blue Card — IT-specialist shortage-occupation lower threshold
- Canada Express Entry — STEM category-based draws using specific NOC 2021 5-digit codes (e.g. 21231 software developer / programmer, 21232 software engineer & designer, 21222 information systems analyst / data analyst, 21220 cybersecurity, 21311 computer engineer, 21300 civil/electrical/mechanical engineer for crossover roles)
- Australia Skills in Demand Visa (Subclass 482) — Core Skills stream, ICT occupations on CSOL

**Source constraints:** enterprise.gov.ie (DETE CSEP page + Critical Skills Occupations List + Intra-Company Transfer permit + General Employment Permit), citizensinformation.ie (Ireland salary-threshold roadmap from 1 March 2026), irishimmigration.ie (Ireland Stamp 4 / registration / SA-entry-visa requirements), gov.uk/skilled-worker-visa, gov.uk/guidance/immigration-rules/immigration-rules-appendix-skilled-occupations (Appendix Skilled Occupations + going rates), gov.uk/guidance/immigration-rules/immigration-rules-appendix-skilled-worker, gov.uk/guidance/immigration-rules/immigration-rules-appendix-temporary-shortage-list, gov.uk/government/organisations/migration-advisory-committee (MAC reports — Salaries Requirements Review Jan 2026), make-it-in-germany.com (Opportunity Card + EU Blue Card + Skilled Worker Visa portals), auswaertiges-amt.de (Type D national visa requirements), bamf.de (Federal Office for Migration and Refugees — Blue Card thresholds + Skilled Worker Visa), anerkennung-in-deutschland.de (recognition portal for regulated professions; ICT is non-regulated so the direct route applies), anabin.kmk.org (institution + degree/type/field equivalence), arbeitsagentur.de (Bundesagentur für Arbeit — shortage occupations), canada.ca/en/immigration-refugees-citizenship (Express Entry, category-based draws, Ministerial Instructions, rounds of invitations), canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/documents/education-assessed.html (full IRCC designated-ECA-providers list — WES is one), noc.esdc.gc.ca (NOC 2021 5-digit occupation codes for ICT), immi.homeaffairs.gov.au (subclass 482 / 186 / 189 — Core Skills Occupation List with ICT ANZSCO codes), legislation.gov.au (LIN 24/089 CSOL instrument; LIN 19/051 assessing authorities), acs.org.au (ICT skills-assessment route-specific requirements — NOTE: ACS assessment is required for GSM / SkillSelect / 189 and most permanent routes; 482 Core Skills sometimes requires it depending on occupation, not universally)

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
route_status: [open | restricted | closed | emerging | not_applicable_for_sa]
visa_subclass_or_code:
replaced_by:
replaced_what:
ict_occupations_eligible: []
rqf_or_qualification_level:
language_requirement:
minimum_salary_threshold:
salary_threshold_currency:
salary_threshold_effective_date:
employer_sponsorship_required: [yes | no]
skills_assessment_required: [yes | no | route_dependent]
skills_assessment_body: "[[org]] or null"
points_test_required: [yes | no]
age_limit:
proof_of_funds_required:
health_character_police_requirements:
dependent_work_rights: [yes | no | restricted]
immigration_health_surcharge_applies: [yes | no | waived]
processing_time_standard:
processing_time_priority:
initial_visa_duration:
pr_pathway:
pr_timeline:
last_policy_change:
last_policy_change_date:
dependants_allowed: [yes | no | restricted]
evidence_strength: confirmed | alleged | rumoured
tags: [visa-route, ict, work-abroad, [country_slug]]
sources:
  -
---

# Visa Route Name

Plain-language summary: what this visa is, who it is for, current status, and the SA ICT angle in 2 sentences.

## Eligibility for SA ICT Workers
Specific requirements that apply to SA-qualified IT professionals — SOC / NOC / ANZSCO code mapping, salary threshold in local currency with effective date, language test (note SA passport-holder context), skills-assessment requirement.

## Current Status & Recent Changes (2025–2026)
Any changes in the last 12 months. Flag explicitly:
- Ireland 1 March 2026 salary-threshold uplift
- UK 22 July 2025 £41,700 threshold + RQF 6 + B2 English from 8 January 2026
- UK Temporary Shortage List 31 December 2026 expiry
- Germany Opportunity Card €1,091/mo (2026)
- Canada STEM category-based draw cadence

## PR Pathway
How and when an ICT worker on this visa can apply for permanent residence (Stamp 4 / ILR / ENS 186 / EE PR / settlement). Cite the exact eligibility window in months/years.

## Employer's Role (if sponsored)
What the sponsoring employer must do — licensed sponsor status, Certificate of Sponsorship, salary compliance, Immigration Skills Charge (UK), Trusted Partner status (Ireland).

## Connections
- [[Destination]] — available_in, source: [url]
- [[Skills-Assessment Body]] — requires_assessment_by, source: [url]
- [[Occupation Code]] — eligible_for, source: [url]

## Sources
- [Source title](url)
```

**OCCUPATION CODE note:**
```markdown
---
type: occupation_code
code:
classification_system: [SOC_2020 | NOC_2021 | ANZSCO_2022 | CSOL_ireland_listed]
title:
country:
ict_relevance: [primary | secondary | not_relevant]
sa_typical_role_mapping: []
on_shortage_list: [yes | no | route_dependent]
evidence_strength: confirmed
tags: [occupation-code, ict, [country_slug]]
sources:
  -
---

# Occupation Code

What this code covers and how an SA "Software Developer" / "Data Engineer" / "Cybersecurity Analyst" job title maps to it.

## Connections
- [[Visa Route]] — eligible_for, source: [url]

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
impact_on_sa_ict_workers:
source_document:
evidence_strength: confirmed | alleged | rumoured
tags: [policy-change, visa, ict, work-abroad]
sources:
  -
---

# Policy Change: [Short Description]

What changed, when, and what it means for an SA ICT worker applying now.

## Before vs After
| | Before | After |
|---|---|---|
| Qualification / RQF level | | |
| Salary threshold | | |
| Language requirement | | |
| Eligible occupations | | |

## Connections
- [[Visa Route]] — affects, source: [url]

## Sources
- [Source title](url)
```

**EDGE metadata:**
- `relationship_type`: available_in | requires_assessment_by | replaced_by | replaced | affects | pr_leads_to | eligible_for | excludes
- `description`: short label
- `date_range`: YYYY–present or YYYY–YYYY
- `evidence_strength`: confirmed | alleged | rumoured
- `sources`: at least one URL

---

## Runtime rules

- `evidence_strength`: `confirmed` | `alleged` | `rumoured`
- ICT is non-regulated in Ireland, UK, and Germany (no formal ICT skills assessment required); Canada Express Entry requires an **ECA (Educational Credential Assessment)** for foreign education — this is a DEGREE-equivalence check, NOT an ICT-specific skills assessment, and any IRCC-designated provider (WES, ICAS, CES, IQAS, ICES) is acceptable; Australia ACS skills-assessment requirement is **route-dependent** — universally required for GSM / 189 / 190 / 491 and most permanent routes, sometimes required for 482 Core Skills depending on occupation. Call this out per route, do not generalise.
- All salary thresholds must be dated; Ireland thresholds shifted 1 March 2026, UK threshold 22 July 2025; do not quote pre-shift figures as current
- UK B2 English requirement effective 8 January 2026 — confirm with the gov.uk source; previously B1
- UK Temporary Shortage List (TSL) expires 31 December 2026 unless renewed — for any RQF 3–5 IT support roles routed via TSL, flag the cliff date prominently
- Distinguish the visa route from the skills-assessment process — they are sequential but separate; SA candidates often conflate them
- For Germany, distinguish Opportunity Card (job-seeker, 12 months) from EU Blue Card (job offer, faster PR) from Skilled Worker Visa (§ 18a/18b) — different thresholds and timelines
- Cite primary government sources only for any number, date, or eligibility detail; if only a non-primary source can be found, set evidence_strength: alleged
- Folder structure: `Visa Routes/`, `Occupation Codes/`, `Policy Changes/`
