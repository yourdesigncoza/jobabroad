# Prompt: Engineering — Destination Options

> Run with `/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-engineering-01-destinations`

---

/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-engineering-01-destinations

**Goal:** Map the realistic overseas work destinations for South African engineers — Australia, Ireland, the UK, New Zealand, and Canada — with current (2025–2026) demand signals, route status, skills-assessment requirements, and an honest assessment of which countries are genuinely realistic for an ECSA-accredited engineer.

**Seed entities:**
- Australia Skills in Demand Visa (Subclass 482) — Core Skills stream for engineering occupations
- Ireland Critical Skills Employment Permit — professional engineers and technologists on the Critical Skills Occupations List
- New Zealand Green List — engineering disciplines at Tier 1 (Straight to Residence)
- Canada Express Entry — STEM category-based draws for engineers
- Engineers Australia — Migration Skills Assessment authority for engineering occupations

**Source constraints:** immi.homeaffairs.gov.au (skilled occupation list / CSOL), jobsandskills.gov.au (Australia CSOL evidence and shortage data), engineersaustralia.org.au (migration skills assessment), enterprise.gov.ie (Critical Skills Employment Permit + Critical Skills Occupations List), irishimmigration.ie (visa-required nationalities, Long Stay 'D' visa), engineersireland.ie (Ireland engineering recognition), gov.uk/skilled-worker-visa, immigration.govt.nz (Green List occupations, qualifications and skills), engineeringnz.org (NZ engineering recognition), canada.ca (Express Entry, category-based draws), engineerscanada.ca (Canada engineering licensure context), ecsa.co.za (ECSA — degree accreditation and the international Accords), ieagreements.org (Washington / Sydney / Dublin Accord signatory lists)

**Iterations:** 8

---

## Note schemas — apply to every note created

**DESTINATION note:**
```markdown
---
type: destination
country:
sa_diaspora_size:
sa_engineer_demand_signal:
primary_visa_route: "[[visa_route_name]]"
secondary_visa_routes: []
skills_assessment_body:
accord_recognition: [washington | sydney | dublin | multiple | none | unknown]
pr_pathway_summary:
route_status: [open | restricted | closed | emerging]
last_signal_date:
evidence_strength: confirmed | alleged | rumoured
tags: [destination, engineering, work-abroad]
sources:
  -
---

# Country Name

2–4 sentences: why SA engineers go here, current demand level, realistic assessment.

## Demand Evidence
Quantified signals — permit/visa volumes, occupation-list status, skills-shortage data, draw statistics. Date every figure.

## Who Is Actively Recruiting / Hiring
Named sectors, employer types, or government programmes hiring SA engineers. Note if employer sponsorship is required.

## Realistic Assessment
Honest appraisal: is this a strong route right now for an ECSA-accredited engineer, or is it competitive / tightening / uncertain? State the SA-specific barriers.

## Connections
- [[Visa Route]] — accessed_via, source: [url]
- [[Skills Assessment Body]] — requires_assessment_by, source: [url]

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
route_status: [open | restricted | closed | emerging]
visa_subclass_or_code:
replaced_by:
qualification_level_required:
skills_assessment_required: [yes | no | strengthens_application]
language_requirement:
salary_threshold:
processing_time:
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

Plain-language summary of the route, who it is for, and current status.

## Current Status
Open / restricted / closed — with date and source.

## Eligibility for SA Engineers
Specific requirements applicable to ECSA-accredited engineers (skills assessment stage, language test, salary threshold, occupation-list status).

## Connections
- [[Destination]] — available_in, source: [url]
- [[Skills Assessment Body]] — requires_assessment_by, source: [url]

## Sources
- [Source title](url)
```

**EDGE metadata (record on every direct verifiable connection):**
- `relationship_type`: accessed_via | regulated_by | recognises | requires_assessment_by | replaced_by | available_in | closed_to | pr_leads_to
- `description`: short label
- `date_range`: YYYY–present or YYYY–YYYY (if closed)
- `evidence_strength`: confirmed | alleged | rumoured
- `sources`: at least one URL

---

## Runtime rules for vault-builder

- `evidence_strength`: `confirmed` | `alleged` | `rumoured` — never present allegations or agent estimates as fact
- Every note and every connection must cite at least one source URL
- Date-stamp all costs, thresholds, occupation-list statuses, and demand figures — these change annually
- Flag any closed or suspended routes explicitly as `[CLOSED - do not recommend]`
- Never present agent estimates as confirmed figures; the source must be a government or regulator URL
- If a source is older than 12 months, flag `evidence_strength` as `alleged` unless confirmed by a recent primary source
- **Accord coverage — do not under-state it:** South Africa is a signatory to the Washington Accord (since 1999, covering 4-year professional BEng degrees), the Sydney Accord (3-year engineering technologist degrees), and the Dublin Accord (engineering technician qualifications). Do NOT describe the Accord advantage as "Sydney/Dublin only" — it applies to virtually every ECSA-accredited engineering degree, via whichever Accord matches the qualification level.
- **Ireland:** South Africa has been visa-required for Ireland since 10 July 2024 — an engineer needs both the Critical Skills Employment Permit AND a Long Stay 'D' entry visa. Do not present the permit alone as sufficient.
- **UK:** the July 2025 Skilled Worker reforms raised the skill threshold to RQF 6 — degree-qualified engineers are unaffected. Sub-degree (RQF 3–5) technician roles are generally restricted for new applicants but may remain eligible if listed on the Immigration Salary List or Temporary Shortage List — verify current list status rather than stating a blanket closure. A 10-year "earned settlement" model has been proposed (Home Office consultation Nov 2025 – Feb 2026); treat it as a published policy position, not implemented law, unless final Immigration Rules confirm it.
- **New Zealand:** confirm current Tier 1 vs Tier 2 status per engineering discipline; flag the age limit (≤55 at residence application) and the NZD $35/hour Green List threshold (from 9 March 2026).
- **Canada:** do not hard-code CRS cutoffs — they move with every draw. Verify the current STEM category-based draw cutoffs from IRCC round-of-invitations data; historically category-based draws have run below general-draw cutoffs, but confirm the live figure. Note that Canada is reducing immigration intake targets post-2025.
- **Germany** is a secondary destination only — give an honest 1–2 paragraph assessment then stop. Do not produce shallow half-coverage. Key points: Opportunity Card / Skilled Worker D-Visa; ZAB/Anabin degree-equivalence recognition is the central step, and some engineering disciplines (civil, structural, electrical) carry state-level regulated-title requirements; most employment needs functional German.
- Folder structure: `Destinations/`, `Visa Routes/`

<!--
## Canvas export (on-demand only — do not generate unless explicitly requested)
-->
