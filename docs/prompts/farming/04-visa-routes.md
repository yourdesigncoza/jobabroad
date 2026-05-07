# Prompt: Farming — Visa Route Overview

> Run with `/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-farming-04-visa-routes`

---

/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-farming-04-visa-routes

**Goal:** Build a source-verified reference of every farming and agricultural visa route accessible to South Africans as of 2025–2026 — covering the UK Seasonal Worker visa, USA H-2A Temporary Agricultural Worker visa, Canada Agricultural Stream / Low-Wage / High-Wage TFWP streams, and Australian skilled-stream agricultural visas (subclass 482, 491, DAMA endorsements) — with eligibility, processing times, PR pathways, and SA-specific restrictions. Document the closed routes (Australia PALM, NZ RSE, Canada SAWP) so readers can identify scam pitches that reference them.

**Seed entities:**
- UK Seasonal Worker visa (Temporary Work) — horticulture: 6 months in any 10-month rolling period (effective 11 Nov 2025); poultry: fixed seasonal window (typically 2 October to 31 December)
- USA H-2A Temporary Agricultural Worker visa — DHS country eligibility list and post-17-Jan-2025 case-by-case provisions
- Canada Temporary Foreign Worker Program — Agricultural Stream + Low-Wage Stream + High-Wage Stream (SAWP excluded for SA)
- Australia Skills in Demand visa (Subclass 482) and Skilled Work Regional visa (Subclass 491) for agricultural managers / livestock farmers / mixed crop farmers on CSOL
- Pacific Australia Labour Mobility visa stream (Subclass 403) — closed to SA (eligible: Pacific island countries + Timor-Leste only)

**Source constraints:** gov.uk/seasonal-worker-visa, gov.uk/government/publications/seasonal-worker-visa-guidance-for-applicants, uscis.gov/working-in-the-united-states/temporary-workers/h-2a-temporary-agricultural-workers, federalregister.gov (annual H-2A/H-2B eligible-countries notice — search "Identification of Foreign Countries"), travel.state.gov/content/travel/en/us-visas/employment/temporary-worker-visas.html, canada.ca/en/employment-social-development/services/foreign-workers/agricultural.html, immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/skills-in-demand, immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/skilled-work-regional-491, immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/temporary-work-403/pacific-australia-labour-mobility-stream, palmscheme.gov.au, immigration.govt.nz/new-zealand-visas/apply-for-a-visa/about-visa/recognised-seasonal-employer-rse-limited-visa, vetassess.com.au

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
route_status: [open | restricted | closed_to_sa | closed | emerging]
visa_category_code:
seasonal_or_skilled: [seasonal | skilled | both]
sa_eligible: [yes | no | yes_skilled_only]
employer_sponsorship_required: [yes | no | yes_via_scheme_operator]
skills_assessment_required: [yes | no]
language_requirement:
salary_or_wage_threshold:
processing_time_estimate:
visa_duration:
extensions_possible: [yes | no | limited | yes_with_cooling_off]
pr_pathway: [none | possible_after_years | direct]
pr_timeline:
last_policy_change:
last_policy_change_date:
evidence_strength: confirmed | alleged | rumoured
tags: [visa-route, farming, work-abroad, south-africa]
sources:
  -
---

# Visa Route Name

Plain-language description: what this visa is, who runs it, current status for SA applicants.

## Eligibility for SA Applicants
Specific requirements applicable to SA-passport holders — sponsorship requirement, qualification level, English requirement, age, savings.

## How the Process Works for SA
Step-by-step from sponsor / employer match → visa application → biometrics in SA → arrival. For each route note who issues the underlying sponsorship document (CoS, LMIA, Form 9142A) and where the worker submits their visa application.

## Current Status & Recent Changes
Any 2024–2026 changes affecting SA applicants — cite the official source (gov.uk policy statement, USCIS regulation, IRCC notice, Department of Home Affairs change). UK Nov 2025 rolling-cap change must be flagged for the Seasonal Worker route.

## PR Pathway
Explicit statement: does this route lead to PR? Timeline? Or is it strictly time-limited? UK Seasonal Worker, H-2A, and Canadian Low-Wage / Agricultural Stream (in most cases) do NOT lead to PR. Australian 491 → 191 and Canadian high-wage LMIA can lead to PR but require multi-year skilled employment.

## Connections
- [[Destination]] — available_in, source: [url]
- [[Scheme Operator or Sponsoring Body]] — administered_through, source: [url]

## Sources
- [Source title](url)
```

**EXCLUDED ROUTE note:** *(create one per Pacific / regional scheme that excludes SA)*
```markdown
---
type: excluded_route
name:
country:
short_name:
eligible_countries: []
sa_eligible: no
official_eligibility_url:
why_relevant_to_sa_readers:
common_scam_pitch:
evidence_strength: confirmed
tags: [excluded-route, scam-vector, farming, south-africa]
sources:
  -
---

# Excluded Route Name

Plain statement: South Africans are NOT eligible for this scheme. List the eligible-country list with the official URL. State why this matters: recruiters frequently pitch this route to SA workers — every such pitch is fraudulent.

## Eligibility — From Official Source
Quote (with URL) the exact eligibility from the administering government body.

## Why SA Readers Hear About It
The recruiter pitch typically claims SA is being "added" or that there is a "back door". State plainly: there is no SA pathway into this scheme.

## Connections
- [[Australian High Commission Pretoria]] or equivalent embassy — issues_warning_about, source: [url]

## Sources
- [Official scheme eligibility page](url)
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
tags: [policy-change, farming, visa, south-africa]
sources:
  -
---

# Policy Change: [Short Description]

What changed, when, and what it means for an SA farm worker applying now.

## Before vs After
| | Before | After |
|---|---|---|
| Maximum stay | | |
| Cooling-off period | | |
| Quota | | |
| SA eligibility | | |

## Connections
- [[Visa Route]] — affects, source: [url]

## Sources
- [Source title](url)
```

**EDGE metadata:**
- `relationship_type`: available_in | administered_through | requires_sponsor | replaced_by | affects | pr_leads_to | excludes_country | issued_warning_about
- `description`: short label
- `date_range`: YYYY–present or YYYY–YYYY
- `evidence_strength`: confirmed | alleged | rumoured
- `sources`: at least one URL

---

## Runtime rules

- `evidence_strength`: `confirmed` | `alleged` | `rumoured`
- **UK Seasonal Worker — November 2025 rule changes are mandatory facts** — applies to **horticulture**: for CoS assigned on/after 11 November 2025, maximum 6 months' work in any rolling 10-month period (replaces 12-month cap), with a 4-month cooling-off period before re-entry on a new horticulture CoS. **Poultry production** retains a fixed seasonal window (typically 2 October to 31 December). Document horticulture and poultry rules separately and verify both at gov.uk/seasonal-worker-visa and the current Sponsor a Seasonal Worker guidance
- **UK 2026 quota:** total 42,900 (41,000 horticulture + 1,900 poultry); was 43,000 + 2,000 for 2025 — verify the formal 2026 announcement
- **UK Seasonal Worker has a small set of currently-approved scheme operators** — 6 per current GOV.UK farm-worker guidance (AGRI-HR, Concordia (UK) Ltd, Fruitful Jobs, HOPS Labour Solutions Ltd, Pro-Force Limited, RE Recruitment — poultry only). Defra-endorsed Home Office-licensed sponsors; GLAA labour-provider licensing is a separate check. The list has changed year-on-year. Any other "UK farm visa agency" issuing CoS is fraudulent. Verify current operator list at gov.uk/guidance/seasonal-work-on-farms-guidance-for-workers and date-stamp
- **H-2A SA eligibility:** South Africa was on the DHS Federal Register list dated Nov 2024, valid through 7 Nov 2025. Re-verify the most recent annual designation; from 17 Jan 2025 nationality designation is no longer strictly required (case-by-case allowed even off-list) — note this regulatory change but do not present off-list as routine
- **H-2A worker-fee prohibition:** 20 CFR § 655.135(j)–(k) prohibits recruitment / labor-certification / job-placement fees being charged to the worker; transportation and subsistence are governed by 20 CFR § 655.122(h); visa disclosure timing at § 655.122(q). Document each precisely as a defining feature of H-2A. Note: from 17 Jan 2025 USCIS no longer has to consider DHS country designation for H-2A beneficiary nationality — case-by-case admission to off-list nationals is possible — but the published list still strongly influences employer behaviour
- **Canada SAWP exclusion** — SAWP is restricted to Mexico + 11 Caribbean countries; SA is not eligible. Canada is still accessible via Agricultural Stream (LMIA-based) and the broader Low-Wage / High-Wage streams. Document this distinction precisely in the Canada visa-route note — do not present SAWP as an SA option
- **Australia PALM exclusion** — PALM (subclass 403 Pacific Australia Labour Mobility stream) is restricted to 9 Pacific island countries + Timor-Leste. SA is not eligible. Create an EXCLUDED ROUTE note for PALM and document the typical scam pitch ("PALM placement deposit") that targets SA workers
- **NZ RSE exclusion** — RSE is restricted to specified Pacific Forum nations (Samoa, Tonga, Vanuatu, Solomon Islands, Tuvalu, Kiribati, Fiji, PNG, Nauru, etc.); SA is not eligible. Create an EXCLUDED ROUTE note
- **Australia 482 / 491 / DAMA require skilled occupation** — agricultural management, livestock farmer, mixed crop farmer, dairy cattle farmer, etc.; subclass 482 Core Skills uses CSOL, subclass 491 uses skilled / state occupation lists, DAMA uses agreement-specific occupation lists — these are NOT all the same list, document the distinction. All require VETASSESS skills assessment and multi-year experience. Do not present as an entry-level seasonal alternative — these are skilled-migration routes
- **No PR via seasonal routes — explicit statement required per route** — UK Seasonal Worker, H-2A, Canadian Low-Wage / Agricultural Stream do not lead to PR. Australian 491 → 191 transition: applicant must hold an eligible regional provisional visa for at least 3 years, comply with visa conditions, and provide ATO notices of assessment for 3 income years (no minimum income threshold required). Canadian high-wage LMIA can support PR via Express Entry CRS but is not automatic. Note: **Canada Agri-Food Pilot closed to new applications on 14 May 2025** — explicitly flag as closed and do not present as an open option. Eligible skilled agri-food workers may still pursue PR via Provincial Nominee Programs, Atlantic Immigration Program, Rural Community Immigration Class, or Francophone Community Immigration Class — list these as secondary skilled pathways, not seasonal options
- All processing times, fees, and quotas must be date-stamped — annual review cycle
- Folder structure: `Visa Routes/`, `Excluded Routes/`, `Policy Changes/`
