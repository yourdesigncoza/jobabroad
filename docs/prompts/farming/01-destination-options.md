# Prompt: Farming — Destination Options

> Run with `/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-farming-01-destinations`

---

/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-farming-01-destinations

**Goal:** Map every realistic destination for South African farm and agricultural workers as of 2025–2026 — covering UK Seasonal Worker (horticulture / poultry), USA H-2A, Canada Agricultural Stream / LMIA, and Australian skilled-stream agricultural routes — and explicitly document the destinations that exclude South Africans (Australia PALM, New Zealand RSE, Canada SAWP) so readers can recognise when a recruiter pitch is fraudulent.

**Seed entities:**
- UK Seasonal Worker visa — 6 currently-approved scheme operators per GOV.UK farm-worker guidance (AGRI-HR, Concordia (UK) Ltd, Fruitful Jobs, HOPS Labour Solutions Ltd, Pro-Force Limited, RE Recruitment — poultry only — Defra-endorsed Home Office-licensed sponsors; GLAA labour-provider licensing is a separate check; verify current list at gov.uk/guidance/seasonal-work-on-farms-guidance-for-workers at vault-build time) and 2026 quota allocation
- USA H-2A Temporary Agricultural Worker visa — Department of Homeland Security eligible-countries list (South Africa designation)
- Canada Agricultural Stream (TFWP) — LMIA-based employer sponsorship, distinct from SAWP
- Australia Skills in Demand (Subclass 482) and Skilled Work Regional (Subclass 491) — agricultural manager / livestock occupations on CSOL
- Pacific Australia Labour Mobility (PALM) scheme — Pacific + Timor-Leste only (closed to SA — flag as scam vector)

**Source constraints:** gov.uk/seasonal-worker-visa, gov.uk/government/publications/seasonal-worker-visa-guidance-for-applicants, gov.uk/government/publications/register-of-licensed-sponsors-workers, gla.gov.uk (GLAA register of licensed labour providers), uscis.gov/working-in-the-united-states/temporary-workers/h-2a-temporary-agricultural-workers, federalregister.gov (DHS H-2A/H-2B annual eligible-countries notice), dol.gov/agencies/eta/foreign-labor (H-2A FLAG / OFLC disclosure data + debarment list), canada.ca/en/employment-social-development/services/foreign-workers/agricultural.html, canada.ca/en/employment-social-development/services/foreign-workers/employer-compliance.html (LMIA non-compliance list), immi.homeaffairs.gov.au, jobsandskills.gov.au (CSOL / occupation lists), palmscheme.gov.au, immigration.govt.nz, southafrica.embassy.gov.au/pret/visascams.html, dalrrd.gov.za, agriseta.co.za

**Iterations:** 8

---

## Note schemas — apply to every note created

**DESTINATION note:**
```markdown
---
type: destination
country:
sa_diaspora_size:
sa_farm_worker_demand_signal:
primary_visa_route: "[[visa_route_name]]"
secondary_visa_routes: []
seasonal_or_skilled: [seasonal | skilled | both]
sa_eligible: [yes | no | yes_skilled_only]
sa_excluded_from_pacific_or_regional_scheme: [yes | no | not_applicable]
who_runs_recruitment: [employer | scheme_operator | bilateral_govt | mixed]
pr_pathway: [none | possible_skilled_only | direct]
who_red_list_status: [listed | not_listed | not_applicable]
route_status: [open | restricted | closed | emerging]
last_signal_date:
evidence_strength: confirmed | alleged | rumoured
tags: [destination, farming, work-abroad, south-africa]
sources:
  -
---

# Country Name

2–4 sentences: which farming routes are realistic for SA workers, current demand level, honest assessment of what kind of agricultural work is achievable.

## Demand Evidence
Quantified signals — UK Seasonal Worker quota allocation (per year), H-2A petition approval volumes, Canadian LMIA approvals for primary agriculture, Australian agricultural CSOL occupation status.

## Who Is Actively Recruiting
Named scheme operators (UK), H-2A agents (USA), licensed Canadian employers, or Australian regional sponsors actively placing SA farm workers. If none specifically named, state "No SA-specific named recruiter confirmed in the public record" rather than guessing.

## Realistic Assessment
Honest appraisal: is this a strong route right now, or is it closing/restricted? Distinguish seasonal (no PR) from skilled (PR-eligible) routes. Flag where a country looks accessible but the specific seasonal scheme excludes SA (Australia PALM, NZ RSE, Canada SAWP).

## Connections
- [[Visa Route]] — accessed_via, source: [url]
- [[Scheme Operator or Sponsor]] — placed_by, source: [url]

## Sources
- [Source title](url)
```

**EXCLUDED SCHEME note:** *(create one for every Pacific / regional scheme that excludes SA — this is critical anti-scam content)*
```markdown
---
type: excluded_scheme
name:
country:
short_name:
eligible_countries: []
sa_eligible: no
official_eligibility_url:
common_misrepresentation:
how_scammers_exploit:
evidence_strength: confirmed
tags: [excluded-scheme, scam-vector, farming, south-africa]
sources:
  -
---

# Excluded Scheme Name

Plain statement: South Africans are NOT eligible for this scheme. List the eligible-country list with the official URL. State why this matters: recruiters frequently pitch this scheme to SA workers — every such pitch is fraudulent.

## Eligibility — From Official Source
Quote (with URL) the exact eligibility criteria from the administering government body. List every eligible country.

## How This Becomes a Scam
What the recruiter pitch looks like (e.g. "Australian PALM placement R8,000 deposit"); how to verify the scheme excludes SA (link to official page); reporting channel.

## Connections
- [[Australian High Commission Pretoria]] or equivalent embassy — issues_warning_about, source: [url]

## Sources
- [Official scheme eligibility page](url)
```

**EDGE metadata:**
- `relationship_type`: accessed_via | placed_by | regulated_by | excludes_country | issued_warning_about | replaced_by | available_in | competes_with
- `description`: short label
- `date_range`: YYYY–present or YYYY–YYYY (if closed)
- `evidence_strength`: confirmed | alleged | rumoured
- `sources`: at least one URL

---

## Runtime rules

- `evidence_strength`: `confirmed` | `alleged` | `rumoured`
- **PALM exclusion is critical** — Australia's Pacific Australia Labour Mobility scheme is restricted to 9 Pacific island countries + Timor-Leste; **South Africans are not eligible**; verify and link palmscheme.gov.au/who-can-apply (or current equivalent); document this as the most common scam vector targeting SA farm workers
- **NZ RSE exclusion** — Recognised Seasonal Employer scheme is restricted to specified Pacific Forum nations; SA not eligible; verify via immigration.govt.nz
- **Canada SAWP exclusion** — Seasonal Agricultural Worker Program is restricted to Mexico + 11 Caribbean countries; SA not eligible for SAWP **but is eligible** via the broader Agricultural Stream and Low/High-Wage LMIA streams — distinguish these explicitly so readers do not give up on Canada entirely
- **UK Seasonal Worker November 2025 rule changes:** From 11 November 2025, **horticulture** workers are limited to 6 months in any rolling 10-month period (was 12) plus a 4-month cooling-off before re-entry on a new CoS. **Poultry** production remains a fixed seasonal window (typically 2 October to 31 December). Document horticulture and poultry rules separately, do not conflate
- **UK 2026 quota:** 42,900 places (41,000 horticulture + 1,900 poultry production) — was 43,000 / 2,000 in 2025; verify the official 2026 announcement and date-stamp
- **H-2A SA designation** — South Africa was on the Nov 2024 DHS list valid through 7 Nov 2025; check the most recent Federal Register notice (search federalregister.gov for "Identification of Foreign Countries... H-2A") and confirm SA is on the current list; note that as of 17 Jan 2025 nationality designation is no longer strictly required, allowing case-by-case eligibility even off-list
- **Australia entry-level vs skilled distinction** — there is **no entry-level seasonal scheme** open to SA workers in Australia; the PALM scheme that fills this niche is closed to SA. Skilled / managerial agricultural roles (farm manager, livestock farmer, mixed crop farmer) are accessible via 482 (CSOL Core Skills), 491 (skilled / state occupation lists), and DAMA (agreement-specific occupation lists) — these are NOT all the same list; document the distinction. All require qualifications, experience, and skills assessment via VETASSESS — do not present these as low-skill seasonal alternatives
- **No PR via seasonal routes** — UK Seasonal Worker, H-2A, and Canadian Low-Wage / Agricultural Stream do not lead to PR; only Australian skilled (491 → 191) and Canadian high-wage LMIA can lead to PR over multiple years. Note: the **Canada Agri-Food Pilot closed to new applications on 14 May 2025** — do not present it as an open PR option. Other Canadian Provincial Nominee Programs, Atlantic Immigration Program, Rural Community Immigration Class, and Francophone Community Immigration Class may support PR for eligible skilled agri-food workers — flag as secondary skilled pathways, not seasonal
- All quota numbers, fees, and route statuses must be date-stamped — annual review cycles
- Folder structure: `Destinations/`, `Excluded Schemes/`
