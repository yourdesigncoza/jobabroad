# Prompt: Trades — Visa Route Overview

> Run with `/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-trades-04-visa-routes`

---

/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-trades-04-visa-routes

**Goal:** Build a source-verified reference of every active visa / work-permit route open to South African qualified tradespeople (electrician, plumber, welder, carpenter, builder, vehicle technician, fitter, boilermaker) as of 2025–2026 — covering Australia (Skills in Demand 482 Core Skills + ENS 186 + Skilled Independent 189 + Skilled Nominated 190 + Skilled Work Regional 491), the UK (Skilled Worker via the Temporary Shortage List, time-limited to 31 December 2026), Canada (Federal Skilled Trades Program + Express Entry category-based Trade draws + Provincial Nominee Programs in Alberta / BC / Ontario / Saskatchewan), New Zealand (Accredited Employer Work Visa + Green List Tier 2 Work to Residence), and the UAE (employer-sponsored work permit, no PR pathway), with eligibility, processing time, PR pathway, and SA-specific restrictions.

**Seed entities:**
- Australia Skills in Demand visa (Subclass 482) — Core Skills stream — replaced TSS 482 on 7 December 2024
- UK Skilled Worker visa via Temporary Shortage List (TSL) — RQF 3-5 trades route, **expires 31 December 2026**, **no dependants**; an "earned settlement" model extending Skilled Worker ILR from 5 to 10 years has been **proposed/announced for April 2026** but is not yet in the Immigration Rules — treat as proposed/alleged until reflected in primary GOV.UK rules
- Canada Federal Skilled Trades Program (FSTP) and Express Entry **category-based Trade occupation draws** (NOC TEER 2 / TEER 3)
- New Zealand Green List Tier 2 — Work to Residence pathway via the Accredited Employer Work Visa (AEWV); minimum NZ$35/hour from 9 March 2026 for Green List roles
- Provincial Nominee Programs (PNPs) for trades — Alberta Advantage Immigration Program (AAIP), BC PNP Skilled Worker / Skills Immigration, Ontario OINP Employer Job Offer: In-Demand Skills, Saskatchewan SINP Hard-to-Fill Skills

**Source constraints:** immi.homeaffairs.gov.au (482, 186, 189, 190, 491), tradesrecognitionaustralia.gov.au, jobsandskills.gov.au (CSOL and labour-market analysis underpinning the list), gov.uk/skilled-worker-visa, gov.uk/government/publications/immigration-rules (Appendix Skilled Worker; Appendix Skilled Occupations; Appendix Temporary Shortage List; Appendix Immigration Salary List — primary rule sources), gov.uk/guidance/workers-and-temporary-workers-guidance-for-sponsors (sponsor guidance), gov.uk/government/organisations/migration-advisory-committee (MAC TSL reports), gov.uk/government/publications/skilled-worker-visa-temporary-shortage-list, assets.publishing.service.gov.uk (Home Office Statements of Changes), canada.ca/en/immigration-refugees-citizenship (Express Entry, FSTP, category-based draws), noc.esdc.gc.ca, alberta.ca / tradesecrets.alberta.ca (AAIP), welcomebc.ca / skilledtradesbc.ca (BC PNP), ontario.ca/page/oinp (OINP), skilledtradesontario.ca, saskatchewan.ca/sinp (SINP), saskapprenticeship.ca (SATCC), immigration.govt.nz/work/requirements-for-work-visas/green-list-occupations-qualifications-and-skills, immigration.govt.nz/employ-migrants/accredited-employer-work-visa, ewrb.govt.nz, pgdb.co.nz, lbp.govt.nz, building.govt.nz, icp.gov.ae, gdrfa.ae, mohre.gov.ae

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
province_state_or_region:
administering_body:
licensing_body:
route_status: [open | restricted | closing | closed | emerging]
route_sunset_date:
visa_subclass_or_code:
occupation_code_system: [csol_anzsco | rqf_soc | noc_teer | green_list | other]
occupation_code:
list_version_date:
rqf_or_teer_level:
eligibility_age_min:
eligibility_age_max:
language_requirement:
salary_or_wage_threshold:
employer_sponsorship_required: [yes | no | optional]
skills_assessment_required: [yes | no | trade_dependent]
qualification_recognition_status: [auto | by_assessment | not_recognised]
post_arrival_registration_required: [yes | no | trade_dependent]
job_offer_required_before_visa: [yes | no | depends]
processing_time_estimate:
visa_duration:
extensions_possible: [yes | no | limited]
dependants_allowed: [yes | no | route_dependent]
pr_pathway: [direct | after_2_yrs | after_3_yrs | after_5_yrs | after_10_yrs | none]
pr_pathway_route_name:
last_policy_change:
last_policy_change_date:
verification_date:
evidence_strength: confirmed | alleged | rumoured
tags: [visa-route, trades, work-abroad, south-africa]
sources:
  -
---

# Visa Route Name

Plain-language description: what this route is, who it is for, and current status.

## Eligibility for SA Trades
Specific requirements for South African qualified tradespeople — Red Seal recognition status (where applicable), language test, salary/wage threshold, employer sponsorship, age limits, dependant policy, route sunset.

## How the Process Works for SA
Step-by-step: skills assessment (TRA / provincial TEA / EWRB / PGDB) → employer / sponsor / EOI → visa application → arrival → post-arrival licensing where required.

## Current Status & Recent Changes
2024–2026 changes: AU SID replaced TSS (7 Dec 2024); UK TSL introduced 22 July 2025 and expires 31 Dec 2026; UK ILR 5 → 10 yrs (April 2026); UK English raised to B2; UK BRP replaced by eVisa; NZ NZ$35/hr threshold (9 Mar 2026).

## PR Pathway
Explicit statement: does this route lead to PR? Timeline? Or is it strictly time-limited (UAE) / sunsetting (UK TSL)?

## Connections
- [[Destination]] — available_in, source: [url]
- [[Skills Assessment Body]] — requires_assessment_by, source: [url]
- [[Policy Change]] — affected_by, source: [url]

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
sunset_date:
what_changed:
impact_on_sa_trades:
source_document:
evidence_strength: confirmed | alleged | rumoured
tags: [policy-change, trades, visa, south-africa]
sources:
  -
---

# Policy Change: [Short Description]

What changed, when, and what it means for an SA tradesperson applying now or planning a future application.

## Before vs After
| | Before | After |
|---|---|---|
| RQF / TEER level | | |
| Salary / wage threshold | | |
| English level | | |
| Settlement timeline | | |
| Dependants | | |
| Sunset date | | |

## Connections
- [[Visa Route]] — affects, source: [url]

## Sources
- [Source title](url)
```

**EDGE metadata:**
- `relationship_type`: available_in | administered_by | requires_assessment_by | affects | sunset_on | replaced_by | leads_to_pr_via | quota_shared_with | nominated_by | sponsored_by
- `description`: short label
- `date_range`: YYYY–present or YYYY–YYYY
- `evidence_strength`: confirmed | alleged | rumoured
- `sources`: at least one URL

---

## Runtime rules

- `evidence_strength`: `confirmed` | `alleged` | `rumoured`
- **UK TSL sunset 31 December 2026** is the most consequential fact in this section. Every UK note MUST state the sunset date and warn that no new TSL sponsorships are guaranteed beyond the sunset. After the sunset, only RQF 6+ roles remain on the standard Skilled Worker visa — which excludes most trades. Frame the UK route honestly as "open but closing."
- **UK TSL = no dependants.** Surface in every UK route note. This is a hard family-impact rule that changes the buyer's calculation.
- **UK English level:** B2 (CEFR) applies for first Skilled Worker applications from **8 January 2026**, and B2 for settlement from **26 March 2027**. Verify current effective dates against gov.uk Statement of Changes at point of writing — do not state "22 July 2025" as the B2 effective date.
- **UK ILR — 10-year earned-settlement proposal:** A 10-year earned-settlement model has been **proposed/announced for April 2026** (consultation Nov 2025 – Feb 2026). The current Skilled Worker settlement remains 5 years until the new rules are reflected in primary GOV.UK rules pages or the Immigration Rules. Treat 10 years as `evidence_strength: alleged` until then.
- **UK eVisa replaces BRP** for new Skilled Worker applicants from 2025; the entry process is now CoS → online application → eVisa → entry. Sponsored work normally must start within **28 days of the latest of (a) the CoS start date, (b) the eVisa / vignette valid-from date, or (c) the grant/notification date** — phrase precisely; do not state "28 days from CoS start date" alone.
- **Australia SID Visa replaced TSS 482 on 7 December 2024.** Do not refer to "TSS" in current-state copy. Three streams: Specialist Skills, Core Skills (the trades stream), Labour Agreement.
- **AU 482 → 186 ENS PR pathway:** The Temporary Residence Transition (TRT) stream of the 186 ENS generally requires **2 years** with the sponsoring employer on a temporary skilled visa. Direct Entry is a separate stream with its own criteria. Document the realistic timeline accordingly and note that the worker must still meet age and English thresholds at PR application stage.
- **AU points-based 189 / 190 / 491** are alternative routes for SA trades who score well on points + have a positive TRA assessment; document realistic point thresholds for trade occupations.
- **Canada FSTP** is one of three Express Entry programs and is specifically designed for tradespeople; eligibility requires either a job offer for ≥1 year OR a provincial certificate of qualification, plus 2 years' trade work experience in past 5 years and CLB 5 (speaking/listening) / CLB 4 (reading/writing). Document distinctly from general Express Entry.
- **Canada Express Entry general draw cutoffs (470–530+) are not realistic for most SA trades without PNP.** Steer the user explicitly to **category-based Trade occupation draws** (cutoffs typically 430–480) and **PNP** routes — not general draws.
- **Canada PNP adds 600 CRS points** and effectively guarantees an ITA when nominated. Provincial trade-specific streams (Alberta AAIP, BC PNP, Ontario OINP, Saskatchewan SINP) have province-specific eligibility — document each by province; do not collapse.
- **NZ Green List Tier 1 vs Tier 2** — confirm which trades are on which tier as of the verification date. Electricians have historically been on Tier 2 (Work to Residence). Tier 2 = 2 years' AEWV employment then residence application.
- **NZ age limit 55** at residence visa application — affects mid-career applicants; flag prominently.
- **NZ Green List wage thresholds:** The NZ$35/hour figure is the AEWV median-wage floor that applies where a higher occupation-specific rate is not specified. Some Green List trade occupations have **higher specified wage rates** — verify the per-occupation rate at immigration.govt.nz at point of writing rather than presenting NZ$35/hr as universal.
- **NZ AEWV requires Accredited Employer** — applicants must have a job offer from an Accredited Employer; confirm the public Accredited Employer list and how to verify it.
- **UAE has no PR pathway.** Frame strictly as a temporary employment route; do not present as migration. UAE-wide qualification verification for work-permit purposes is handled by **MOHRE** and **ICP** (Federal Authority for Identity, Citizenship, Customs & Port Security; Dubai uses GDRFA). **ACTVET** is the Abu Dhabi technical/vocational awarding body — cite it only where a worker is being placed into Abu Dhabi TVET-linked employment, not as a UAE-wide trade-recognition body.
- **Date-stamp every threshold, fee, and list status** at point of citation. Format: `(verified May 2026 — check [primary URL] for current)`. Visa policy changes monthly; TSL/CSOL/Green List quarterly.
- All factual claims about visa policy must be verified at the primary source (gov.uk, immi.homeaffairs.gov.au, canada.ca, immigration.govt.nz, mohre.gov.ae). If a primary-source page cannot be fetched or does not contain the claim, set `evidence_strength: alleged` and note the limitation in the body. Do not promote based on agent or aggregator copy.
- Folder structure: `Visa Routes/`, `Policy Changes/`
