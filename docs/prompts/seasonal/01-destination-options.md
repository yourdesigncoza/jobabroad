# Prompt: Seasonal — Destination Options

> Run with `/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-seasonal-01-destinations`

---

/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-seasonal-01-destinations

**Goal:** Map which countries have active, SA-accessible seasonal and working holiday programmes as of 2025–2026 — comparing the J1 Summer Work Travel programme (USA), UK Youth Mobility Scheme, and Canada IEC Working Holiday for South African university students and young adults aged 18–30.

**Seed entities:**
- J1 Summer Work Travel Programme (US Department of State BridgeUSA)
- UK Youth Mobility Scheme — South African national quota and eligibility
- Canada International Experience Canada (IEC) Working Holiday — Recognized Organization channel for SA
- USIT / STS / CIEE — designated J1 sponsor agencies operating in South Africa
- Walt Disney World International Programs — US seasonal employer and J1 participant

**Source constraints:** j1visa.state.gov/programs/summer-work-travel, j1online.ie, ciee.org, gov.uk/youth-mobility, ircc.canada.ca/iec, canada.ca/en/immigration-refugees-citizenship/services/work-canada/iec.html, za.usembassy.gov

**Iterations:** 8

---

## Note schemas — apply to every note created

**DESTINATION note:**
```markdown
---
type: destination
country:
programme_name:
programme_type: [seasonal_work | working_holiday | exchange_visitor]
sa_eligible: [yes | yes_via_recognized_org | no]
age_requirement:
student_status_required: [yes | no]
annual_quota_or_cap:
quota_fills_by:
pr_pathway: [none | eligible_after_years | direct]
visa_duration:
route_status: [open | quota_filled | closed | restricted]
last_verified_date:
evidence_strength: confirmed | alleged | rumoured
tags: [destination, seasonal, work-abroad, south-africa]
sources:
  -
---

# Country Name

2–4 sentences: why SA students/young adults go here, current programme status, realistic demand.

## Who Is Eligible
Specific eligibility gate for SA nationals (student status, age cap, savings requirement).

## Seasonal Employers / Work Types
Which employers and industries actively hire on this programme (e.g. Disney, resort chains, hospitality, fruit picking).

## Timing & Quota Warning
When does the programme open; when does the quota typically fill for SA applicants; departure window.

## Realistic Assessment
Honest appraisal: is this a strong route right now, or is it restricted/uncertain for SA applicants?

## Connections
- [[Programme]] — accessed_via, source: [url]
- [[Sponsor Agency]] — administered_by, source: [url]

## Sources
- [Source title](url)
```

**PROGRAMME note:**
```markdown
---
type: programme
name:
short_name:
country:
administering_body:
sa_sponsor_agencies: []
programme_status: [open | closed | quota_filled | suspended]
annual_open_date:
application_deadline_sa:
minimum_age:
maximum_age:
student_status_required: [yes | no]
minimum_savings_required:
job_offer_required_before_visa: [yes | no]
pr_pathway: [none | possible]
processing_time_estimate:
evidence_strength: confirmed | alleged | rumoured
tags: [programme, seasonal, work-abroad, south-africa]
sources:
  -
---

# Programme Name

Plain-language description: what this programme is, who runs it, who it is for.

## How SA Applicants Access It
Step-by-step: sponsor agency → application → DS-2019 or equivalent → visa → departure.

## Current Status for SA
Is the SA quota open? When does it typically close? Any 2025–2026 changes?

## Connections
- [[Destination]] — available_in, source: [url]
- [[Sponsor Agency]] — administered_through, source: [url]

## Sources
- [Source title](url)
```

**EDGE metadata:**
- `relationship_type`: accessed_via | administered_by | sponsored_by | competes_with | requires_enrolment_at | quota_restricted_to
- `description`: short label
- `date_range`: YYYY–present or YYYY–YYYY (if closed)
- `evidence_strength`: confirmed | alleged | rumoured
- `sources`: at least one URL

---

## Runtime rules

- `evidence_strength`: `confirmed` | `alleged` | `rumoured`
- **J1 student-status gate:** J1 SWT requires current full-time enrolment at an SA university — document this as a hard eligibility requirement, not a preference; flag clearly
- **No PR pathway on any route:** All three programmes (J1, YMS, IEC) are time-limited; none leads to permanent residency — state this explicitly per destination note
- **Canada IEC limitation:** South Africa is NOT on the direct IEC bilateral-country list; SA applicants must go through a Recognized Organization (SWAP Working Holidays, GO International); document this carefully and do not present IEC as a direct application
- **UK YMS ballot status for SA:** Confirm whether SA requires a ballot or can apply directly; as of May 2026 the ballot applies only to HK, India, Japan, South Korea, Taiwan — verify via gov.uk/youth-mobility/eligibility
- **Quota urgency:** J1 SA allocation historically closes January–February for the following summer; document the timing pressure explicitly
- **All dates and quotas must be date-stamped** — these change annually; evidence older than 12 months must be flagged as `evidence_strength: alleged`
- Folder structure: `Destinations/`, `Programmes/`
