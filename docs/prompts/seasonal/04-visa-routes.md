# Prompt: Seasonal — Visa Route Overview

> Run with `/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-seasonal-04-visa-routes`

---

/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-seasonal-04-visa-routes

**Goal:** Build a source-verified reference of every seasonal and working holiday programme available to South African university students and young adults as of 2025–2026 — covering the J1 Exchange Visitor Visa (Summer Work Travel category), UK Youth Mobility Scheme Visa, and Canada IEC Working Holiday permit — with eligibility requirements, processing times, PR pathways, and SA-specific restrictions.

**Seed entities:**
- J1 Exchange Visitor Visa — Summer Work Travel (SWT) category (US Department of State BridgeUSA)
- UK Youth Mobility Scheme (YMS) Visa (UK Home Office)
- Canada IEC Working Holiday work permit (IRCC — via Recognized Organization for SA applicants)
- SWAP Working Holidays / GO International (IEC Recognized Organizations — SA access point)
- US Embassy Pretoria — J1 visa interview process for SA applicants

**Source constraints:** j1visa.state.gov/programs/summer-work-travel, gov.uk/youth-mobility, gov.uk/youth-mobility/eligibility, ircc.canada.ca/iec, canada.ca/en/immigration-refugees-citizenship/services/work-canada/iec.html, za.usembassy.gov, swapworkingholidays.org, fmjfee.com (SEVIS fee official)

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
administering_body:
route_status: [open | quota_filled | closed | restricted]
visa_category_code:
eligibility_age_min:
eligibility_age_max:
student_status_required: [yes | no]
savings_requirement:
job_offer_required_before_visa: [yes | no]
sponsor_agency_required: [yes | no]
processing_time_estimate:
visa_duration:
extensions_possible: [yes | no | limited]
pr_pathway: [none | possible | route_specific]
pr_timeline:
sa_ballot_required: [yes | no]
last_policy_change:
last_policy_change_date:
evidence_strength: confirmed | alleged | rumoured
tags: [visa-route, seasonal, work-abroad, south-africa]
sources:
  -
---

# Visa Route Name

Plain-language description: what this programme/visa is, who it is for, current status.

## Eligibility for SA Applicants
Specific requirements for South African nationals — age, student status, savings, ballot status.

## How the Process Works for SA
Step-by-step: how an SA applicant goes from "interested" to "on a plane" — including sponsor agency involvement for J1, direct gov.uk application for YMS, and Recognized Organization channel for IEC.

## Current Status & Recent Changes
Any 2024–2026 changes affecting SA applicants; quota changes, eligibility expansions or restrictions.

## PR Pathway
Explicit statement: does this route lead to PR? Timeline? Or is it strictly time-limited?

## Connections
- [[Destination]] — available_in, source: [url]
- [[Sponsor Agency]] — administered_through, source: [url]

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
impact_on_sa_applicants:
source_document:
evidence_strength: confirmed | alleged | rumoured
tags: [policy-change, seasonal, visa, south-africa]
sources:
  -
---

# Policy Change: [Short Description]

What changed, when, and what it means for an SA student or young adult applying now.

## Before vs After
| | Before | After |
|---|---|---|
| Age limit | | |
| Student status requirement | | |
| Savings threshold | | |
| SA ballot required | | |

## Connections
- [[Visa Route]] — affects, source: [url]

## Sources
- [Source title](url)
```

**EDGE metadata:**
- `relationship_type`: available_in | administered_through | requires_enrolment_at | replaced_by | affects | pr_leads_to | quota_shared_with
- `description`: short label
- `date_range`: YYYY–present or YYYY–YYYY
- `evidence_strength`: confirmed | alleged | rumoured
- `sources`: at least one URL

---

## Runtime rules

- `evidence_strength`: `confirmed` | `alleged` | `rumoured`
- **No direct PR pathway on any listed route** — J1 SWT, UK YMS, and Canada IEC Working Holiday are all time-limited; none provides a direct PR pathway; note that Canadian work experience gained on IEC *may* contribute toward a future Express Entry profile but this is indirect and not guaranteed — state "no direct PR pathway" per route note
- **J1 student-status hard gate** — Summer Work Travel category requires current full-time enrolment at an accredited post-secondary institution (university or college) outside the US, with at least one completed semester; the student must be enrolled at the time of application; non-students cannot access J1 SWT (they may qualify for J1 Intern category if profession-matched, but that is a different programme); document this precisely per US Dept of State guidance at j1visa.state.gov/programs/summer-work-travel
- **Canada IEC not direct for SA** — South Africa does not have a direct bilateral youth mobility agreement with Canada; SA applicants must be nominated by a Recognized Organization (SWAP Working Holidays, GO International); do not describe IEC as a direct application process for SA nationals
- **UK YMS ballot status** — confirm via gov.uk/youth-mobility/eligibility whether SA currently requires a ballot (as of research date); ballot is required for HK, India, Japan, SK, Taiwan — verify SA status explicitly
- **J1 programme fills early** — document the annual timeline: US Dept of State opens for following summer; SA quotas through USIT/CIEE typically close January–February; late applicants are turned away
- All fees, savings thresholds, and age limits must be date-stamped — they are reviewed annually
- Folder structure: `Visa Routes/`, `Policy Changes/`
