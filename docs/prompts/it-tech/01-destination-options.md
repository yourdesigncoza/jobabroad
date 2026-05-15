# Prompt: IT / Tech — Destination Options

> Run with `/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-it-tech-01-destinations`

---

/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-it-tech-01-destinations

**Goal:** Build a current, source-verified reference of every realistic work-abroad destination for a South African ICT professional (software developer, data engineer, cybersecurity, cloud / DevOps, IT architect) as of 2026 — answering "where should I actually go?" with quantified demand signals, SA-specific feasibility, and an honest open / restricted / out-of-scope verdict per country.

**Seed entities:**
- Ireland Critical Skills Employment Permit (DETE — 2024: 1,631 SA permits issued ACROSS ALL SECTORS, not ICT-only; top all-sector sponsors include Google, Amazon, Nua Healthcare; ICT-specific employer leaders skew to Google, Amazon, Microsoft, Meta — confirm against DETE permits-by-employer-and-sector data)
- UK Register of Licensed Sponsors (downloadable CSV; verify a UK employer by name + route + rating; Skilled Worker IT SOC codes 2134 / 2135 / 2136 / 2137 / 2139 are eligible separately under Appendix Skilled Occupations)
- Germany Opportunity Card (Chancenkarte) AND Germany EU Blue Card (the Blue Card with a qualifying job offer is the main ICT WORK route; the Opportunity Card is the JOB-SEARCH route — distinguish them)
- Canada Express Entry STEM category-based draws (IRCC — 2025–2026 CRS cut-offs; specific NOC 2021 codes 21231 software dev, 21232 software engineer, 21222 data analyst, 21220 cybersecurity, 21311 computer engineer)
- Australia ACS (Australian Computer Society) Migration Skills Assessment — Skills-Based / Post-Australian-Study / RPL pathways, with ANZSCO mapping (2613xx software, 2621xx database/systems, 2624xx cybersecurity)

**Source constraints:** enterprise.gov.ie (DETE — CSEP statistics by source country, employer permit data, Critical Skills Occupations List), citizensinformation.ie (Ireland permit thresholds + Roadmap to 2030), irishimmigration.ie (Immigration Service Delivery — Stamp 4 / residence pathway, SA visa requirements), gov.uk/government/publications/register-of-licensed-sponsors-workers (UK CSV download), gov.uk/guidance/immigration-rules/immigration-rules-appendix-skilled-occupations (UK Appendix Skilled Occupations + going rates), gov.uk/guidance/immigration-rules/immigration-rules-appendix-skilled-worker, gov.uk/guidance/immigration-rules/immigration-rules-appendix-temporary-shortage-list (TSL expiry 31 Dec 2026), gov.uk/government/organisations/migration-advisory-committee (MAC reports), make-it-in-germany.com (Opportunity Card portal — federal data), auswaertiges-amt.de (Federal Foreign Office), bamf.de (BAMF — Skilled Worker / Blue Card), arbeitsagentur.de (Bundesagentur für Arbeit — shortage occupations), anerkennung-in-deutschland.de (recognition portal), anabin.kmk.org (degree-recognition database), iwkoeln.de (German Economic Institute Opportunity Card uptake studies), canada.ca/en/immigration-refugees-citizenship (IRCC Express Entry rounds + category-based STEM draws + Ministerial Instructions), noc.esdc.gc.ca (NOC 2021 codes), jobbank.gc.ca (Canada labour-market signals), acs.org.au (ACS skills-assessment data — fee schedule and pathways), immi.homeaffairs.gov.au (Department of Home Affairs CSOL ICT occupations), jobsandskills.gov.au (Jobs and Skills Australia — CSOL evidence), legislation.gov.au (LIN 24/089 CSOL instrument; LIN 19/051 assessing authorities), iitpsa.org.za (Institute of Information Technology Professionals SA — voluntary SA body context)

**Iterations:** 8

---

## Note schemas

**DESTINATION note:**
```markdown
---
type: destination
country:
sa_diaspora_size:
sa_ict_demand_signal:
primary_visa_route: "[[visa_route_name]]"
secondary_visa_routes: []
ict_skills_assessment_required: [yes | no | depends_on_route]
assessment_body: "[[org]] or null"
language_test_required: [yes | no | b2_english | clb_7]
route_status: [open | restricted | closed | emerging | out_of_scope]
pr_pathway_timeline:
last_signal_date:
evidence_strength: confirmed | alleged | rumoured
tags: [destination, ict, software-development, work-abroad, south-africa]
sources:
  -
---

# Country Name

2–4 sentences: why SA ICT workers realistically go here, current demand level, honest assessment for SA passport-holders.

## Demand Evidence
Quantified signals — employment permits issued to SA nationals, top employer sponsorship counts, occupation-list inclusions, vacancy data. Date-stamp every figure.

## Who Is Actively Sponsoring SA Tech Workers
Named employers, recruitment programmes, or sector signals (e.g. Dublin tech-hub multinationals, UK licensed sponsors filtered by IT SOC codes, German Bitkom shortage data).

## Realistic Assessment for SA ICT Workers
Honest appraisal. Is this open, getting tighter, or effectively closed? What are the SA-specific barriers (skills assessment, language, salary threshold)?

## Connections
- [[Visa Route]] — accessed_via, source: [url]
- [[Destination Skills-Assessment Body]] — assessed_by, source: [url]

## Sources
- [Source title](url)
```

**DEMAND SIGNAL note:**
```markdown
---
type: demand_signal
name:
country:
metric: [permits_issued | vacancies | occupation_list_inclusion | crs_cutoff | sponsor_count]
value:
period: [YYYY or YYYY-Qn]
source_url:
sa_specific: [yes | no]
evidence_strength: confirmed
tags: [demand-signal, ict, [country_slug]]
sources:
  -
---

# Demand Signal Name

What this number means in plain language and why it matters for an SA ICT worker.

## Connections
- [[Destination]] — measures_demand_in, source: [url]

## Sources
- [Source title](url)
```

**EDGE metadata:**
- `relationship_type`: accessed_via | assessed_by | measures_demand_in | requires | regulates | sponsors | available_in | out_of_scope_for
- `description`: short label
- `date_range`: YYYY–present
- `evidence_strength`: confirmed | alleged | rumoured
- `sources`: at least one URL

---

## Runtime rules

- `evidence_strength`: `confirmed` | `alleged` | `rumoured` — never present allegations as fact
- ICT is **non-regulated in Ireland, UK, and Germany** — call this out explicitly per destination; many SA candidates assume every country requires an ACS-style skills assessment
- Date-stamp every salary threshold, permit count, and occupation-list status — they change annually
- Confirm 2026 status of: Ireland CSEP salary thresholds (effective 1 Mar 2026), UK Skilled Worker £41,700 (or 100% of occupation going rate, whichever higher) threshold + B2 English (effective 8 Jan 2026), UK Temporary Shortage List (mostly RQF 3–5 occupations including limited IT technician codes — does NOT cover core software / data / cloud professional SOCs; expires 31 Dec 2026 unless renewed)
- Never quote a destination salary in ZAR — always cite local currency from the primary source
- Flag closed/restricted routes explicitly: USA H-1B (annual lottery — not realistic for individual planning); UAE (no PR pathway — covered briefly as out-of-scope)
- If a claim only appears on a single non-primary source (blog, aggregator, agency site), set evidence_strength: alleged and note the source limitation — do not promote to confirmed without a primary government / regulator URL
- Folder structure: `Destinations/`, `Demand Signals/`
