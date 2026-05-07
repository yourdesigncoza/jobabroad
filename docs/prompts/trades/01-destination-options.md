# Prompt: Trades — Destination Options

> Run with `/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-trades-01-destinations`

---

/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-trades-01-destinations

**Goal:** Map which countries are realistic, current destinations for South African qualified tradespeople (electricians, plumbers, welders, carpenters, builders, vehicle technicians, fitters, boilermakers) seeking work abroad as of 2025–2026 — covering Australia (Skills in Demand 482 → 186), United Kingdom (Skilled Worker via Temporary Shortage List, time-limited to 31 Dec 2026), Canada (FSTP + Express Entry Trades category-based draws + PNPs), New Zealand (Green List Tier 2), and UAE (employer-sponsored, no PR), with honest assessment of which routes work for which trades and which are closing.

**Seed entities:**
- Trades Recognition Australia (TRA) — assessing authority for many trade occupations; Offshore Skills Assessment Program (OSAP) for licensed permanent-migration trades (Air-conditioning and Refrigeration Mechanic, Electrician General, Electrician Special Class, Plumber General); other trades use the Migration Skills Assessment (MSA)
- UK Temporary Shortage List (TSL) — RQF 3-5 trades sponsorable on Skilled Worker visa until 31 December 2026
- Canada Federal Skilled Trades Program (FSTP) and Express Entry category-based **Trade occupation** draws (NOC TEER 2 / TEER 3); FSTP requires either a valid job offer OR a Canadian certificate of qualification
- New Zealand Green List Tier 2 (Work to Residence) — Tier 2 was expanded on 18 August 2025 to include additional construction and trade occupations; occupation-specific registration (e.g. EWRB for electricians, PGDB for plumbers/gasfitters/drainlayers, BPB for licensed building practitioners) and wage thresholds apply
- Australian Department of Home Affairs Core Skills Occupation List (CSOL) — 456 occupations, effective 7 December 2024

**Source constraints:** tradesrecognitionaustralia.gov.au, immi.homeaffairs.gov.au (CSOL + 482 + 186 + 491), gov.uk/skilled-worker-visa, gov.uk/government/publications/immigration-rules (Appendix Skilled Worker; Appendix Temporary Shortage List; Appendix Immigration Salary List — primary rule sources), gov.uk/government/publications/skilled-worker-visa-temporary-shortage-list, assets.publishing.service.gov.uk (Home Office statements of changes), canada.ca/en/immigration-refugees-citizenship (Express Entry, FSTP, category-based draws), noc.esdc.gc.ca, tradesecrets.alberta.ca (Alberta Apprenticeship and Industry Training), skilledtradesbc.ca (SkilledTradesBC), skilledtradesontario.ca (Skilled Trades Ontario), saskapprenticeship.ca, immigration.govt.nz/work/requirements-for-work-visas/green-list-occupations-qualifications-and-skills, ewrb.govt.nz, pgdb.co.nz, lbp.govt.nz (Licensed Building Practitioners), icp.gov.ae (UAE Federal Authority for Identity, Citizenship, Customs & Port Security), gdrfa.ae (Dubai General Directorate of Residency and Foreigners Affairs), mohre.gov.ae, actvet.gov.ae, qcto.org.za

**Iterations:** 8

---

## Note schemas — apply to every note created

**DESTINATION note:**
```markdown
---
type: destination
country:
sa_diaspora_size:
sa_trades_demand_signal:
primary_visa_route: "[[visa_route_name]]"
secondary_visa_routes: []
trades_in_active_demand: []
skills_assessment_body: "[[regulator_or_assessment_body]]"
sa_red_seal_recognised: [yes | partial | no | not_applicable]
route_status: [open | restricted | closing | closed | emerging]
route_sunset_date:
pr_pathway: [direct | after_2_yrs | after_3_yrs | none]
age_limit:
dependants_allowed: [yes | no | route_dependent]
last_signal_date:
evidence_strength: confirmed | alleged | rumoured
tags: [destination, trades, work-abroad, south-africa]
sources:
  -
---

# Country Name

2–4 sentences: which SA trades are most in demand here, current realistic assessment, what closes the door.

## Demand Evidence
Quantified signals — occupation list status (CSOL / TSL / Green List / PNP streams), shortage statements, employer sponsorship volumes for trades, government workforce-strategy publications.

## Which Trades Work, Which Don't
Trade-by-trade breakdown — electricians, plumbers, welders, carpenters, vehicle technicians, builders, fitters, boilermakers — flagging which are on which lists and which are not eligible.

## Realistic Assessment
Honest appraisal: is this a strong route for SA trades right now, or is it closing/restricted? Is the TSL sunset relevant? Is age a blocker (NZ)? Are dependants allowed?

## Connections
- [[Visa Route]] — accessed_via, source: [url]
- [[Skills Assessment Body]] — assessed_by, source: [url]

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
route_status: [open | restricted | closing | closed | emerging]
route_sunset_date:
rqf_or_teer_level:
occupation_code_system: [csol | rqf_soc | noc_teer | green_list | other]
occupation_code:
occupation_list_name:
occupation_list_verified_date:
language_requirement:
salary_or_wage_threshold:
processing_time:
pr_pathway:
dependants_allowed: [yes | no | route_dependent]
dependants_notes:
licensing_required: [yes | no | post_arrival]
post_arrival_licensing_steps: []
provincial_or_state_regulator: "[[regulator_name]]"
age_limit:
last_policy_change:
last_policy_change_date:
evidence_strength: confirmed | alleged | rumoured
tags: [visa-route, trades, work-abroad, south-africa]
sources:
  -
---

# Visa Route Name

Plain-language description: what this route is, who it is for, current status.

## Eligibility for SA Trades
Specific requirements applicable to SA-qualified tradespeople — Red Seal recognition status, language, salary, employer sponsorship, age, dependants policy.

## Current Status & Recent Changes
2024–2026 changes; UK TSL sunset 31 Dec 2026; AU SID replaced TSS 482 (7 Dec 2024); NZ NZ$35/hr threshold (9 Mar 2026); UK ILR 5 → 10 yrs (April 2026).

## Connections
- [[Destination]] — available_in, source: [url]
- [[Skills Assessment Body]] — requires_assessment_by, source: [url]

## Sources
- [Source title](url)
```

**SKILLS ASSESSMENT BODY note:**
```markdown
---
type: skills_assessment_body
name:
short_name:
country:
trades_assessed: []
sa_pathway_known: [yes | partial | no]
practical_assessment_required: [yes | no | trade_dependent]
practical_locations: []
fee_range_local_currency:
fee_range_zar_approx:
typical_processing_time:
official_url:
evidence_strength: confirmed | alleged | rumoured
tags: [skills-assessment, trades, work-abroad]
sources:
  -
---

# Body Name

What it assesses, which trades, and how SA Red Seal credentials are evaluated.

## Pathway Steps
Pre-assessment → Documentary Evidence → Technical Interview → Practical (where required).

## SA-Specific Notes
SA Red Seal + N-level recognition; logbook / apprenticeship evidence; minimum work-experience years.

## Connections
- [[Visa Route]] — required_by, source: [url]
- [[Destination]] — administers_in, source: [url]

## Sources
- [Source title](url)
```

**EDGE metadata:**
- `relationship_type`: accessed_via | regulates | recognises | requires_assessment_by | available_in | administers_in | replaced_by | sunset_on | partners_with
- `description`: short label
- `date_range`: YYYY–present or YYYY–YYYY
- `evidence_strength`: confirmed | alleged | rumoured
- `sources`: at least one URL

---

## Runtime rules

- `evidence_strength`: `confirmed` | `alleged` | `rumoured`
- **UK TSL sunset is mandatory to surface:** Every UK destination/visa-route note MUST state that the Temporary Shortage List expires **31 December 2026**, and that after the sunset only RQF 6+ roles remain on the standard Skilled Worker visa — which excludes most trades. Do not present UK as an open-ended route.
- **UK TSL = no dependants:** Workers sponsored under TSL roles (RQF 3-5) cannot bring dependants. Surface this prominently — it changes the buyer's calculation.
- **UK ILR / "earned settlement" 10-year proposal:** A 10-year earned-settlement model has been proposed (consultation Nov 2025 – Feb 2026) and announced for April 2026. Until the change is reflected in primary GOV.UK rules pages or the Immigration Rules, treat the 10-year claim as **proposed/unconfirmed** (`evidence_strength: alleged`); GOV.UK's Skilled Worker page may still state 5 years. Verify at gov.uk and Appendix Skilled Worker before recording as confirmed.
- **Australia SID Visa replaced TSS 482 on 7 December 2024.** Do not refer to "TSS" in current-state copy. CSOL covers 456 occupations.
- **TRA OSAP scope:** The OSAP route applies only to a small list of nominated/licensed permanent-migration occupations (currently Air-conditioning and Refrigeration Mechanic, Electrician General, Electrician Special Class, Plumber General). Other trades (welder, carpenter, fitter, boilermaker, vehicle technician, builder) are assessed via the Migration Skills Assessment (MSA) or another authority depending on the occupation. Confirm exact OSAP list and per-trade routing at tradesrecognitionaustralia.gov.au at point of writing.
- **Canada FSTP eligibility:** FSTP requires either a valid job offer for ≥1 year OR a Canadian certificate of qualification, plus 2 years' trade experience in past 5 years and CLB 5 (speak/listen) / CLB 4 (read/write). Express Entry category-based **Trade** draws are a separate pathway with their own (often lower) CRS cutoffs but still require Express Entry profile eligibility. Document FSTP and Trade-category draws as distinct routes.
- **SA Red Seal does not transfer to Canada.** Canadian Red Seal is interprovincial within Canada only — every SA trade applicant must be re-assessed by the destination provincial body (Alberta AIT, BC SkilledTradesBC, Ontario equivalent). Surface this — common SA misconception.
- **Canada Express Entry general draw cutoffs (470–530+) are not realistic for most SA trades without PNP.** Steer the user to category-based **Trades draws** (430–480 cutoffs typical) or PNP. Do not present Express Entry general draws as the path for trades.
- **NZ age limit 55** at residence visa application — affects mid-career applicants; flag prominently. NZ minimum wage threshold for Green List roles is **NZ$35/hr from 9 March 2026** — verify current rate.
- **UAE has no PR pathway.** Do not present as a migration route. Frame as cash-flow / experience destination at most. UAE construction/hospitality wage levels and contract terms must be sourced from MOHRE.
- **No SA–destination bilateral trade labour agreement exists** (Sydney/Dublin Accords are engineering only; SAICA MRA is accounting only). Do not lift cross-category copy.
- **Date-stamp every occupation-list status, fee, and salary threshold** — these change annually. Use the format `(verified May 2026 — check [primary URL] for current)`.
- **WHO Red List irrelevant** for trades; do not include.
- All factual claims about visa routes, occupation lists, wages, and timelines must be verified from the primary source (gov.uk, immi.homeaffairs.gov.au, canada.ca, immigration.govt.nz, mohre.gov.ae). Search snippets alone are not confirmation. If a claim cannot be verified at the primary source, set `evidence_strength: alleged` and note the limitation.
- Folder structure: `Destinations/`, `Visa Routes/`, `Skills Assessment Bodies/`
