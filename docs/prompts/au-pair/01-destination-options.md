# Prompt: Au Pair — Destination Options

> Run with `/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-au-pair-01-destinations`

---

/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-au-pair-01-destinations

**Goal:** Map the realistic au-pair destination options for a South African candidate aged 18–26 in 2025–2026 — covering which countries operate a structured, state-regulated au-pair programme that accepts SA passport-holders, which require language certification (Germany A1 mandatory), age cap per destination, weekly hours and pocket-money minimums, and an honest assessment of accessibility, pay vs. cost-of-living, and employer/sponsor coverage of flights and insurance.

**Seed entities:**
- USA J-1 Au Pair programme (US State Department Bureau of Educational and Cultural Affairs — 22 CFR 62.31; ~12 designated sponsor agencies; 12–24 month duration; SA candidates strongly preferred for English + driver's licence)
- Netherlands IND au-pair residence permit (Immigratie- en Naturalisatiedienst — application via IND-recognised sponsor only; age 18–25; max 30 hrs/week light household duties; 12-month permit, non-renewable)
- Germany au-pair national D visa + Aufenthaltserlaubnis — administered by Federal Foreign Office (Auswärtiges Amt) at visa stage; Bundesagentur für Arbeit publishes the model contract + €280/mo pocket-money guideline; local Ausländerbehörde issues the residence permit on arrival; mandatory A1 German certificate at visa application; age 18–26; 6–12 months
- France VLS-TS "jeune au pair" visa (long-stay visa serving as residence permit; Préfecture / OFII; age 18–30; French language-school enrolment requirement; €320/mo pocket money minimum per service-public.fr)
- UK "au pair" status (no dedicated visa post-Brexit; closest fallback is the Youth Mobility Scheme Tier 5 ballot — flag as NOT an au-pair programme)

**Source constraints:** j1visa.state.gov (US State Dept J-1 sponsor search), ecfr.gov (22 CFR 62.31 — au-pair programme regulation primary text), travel.state.gov (J-1 visa application process for SA), ice.gov/sevis (SEVIS I-901 fee schedule — $35 for au-pair category), ind.nl (Netherlands au pair residence permit + public register of recognised sponsors), www.government.nl (Dutch government immigration policy), auswaertiges-amt.de (German Federal Foreign Office — au-pair visa policy), arbeitsagentur.de (Bundesagentur für Arbeit au-pair guideline — €280/mo pocket money + model contract), southafrica.diplo.de (German Missions in SA — au-pair visa info sheet, current fees), goethe.de (Goethe-Institut A1 German certification — Johannesburg, Pretoria centres), france-visas.gouv.fr (French visa portal for SA candidates), service-public.fr (French service-public au-pair rules — pocket money, hours, language school), legifrance.gouv.fr (French primary law for jeune au pair stay), saps.gov.za (SAPS Police Clearance Certificate), dha.gov.za (Department of Home Affairs — passport), gov.uk/youth-mobility-scheme (UK YMS — NOT an au-pair route, flag if surfaced), iapa.org (International Au Pair Association — industry body, vetted members), culturalcare.com / culturalcare.co.za (Cultural Care — largest J-1 sponsor with active SA recruitment), aupairinamerica.com / aupairinamerica.co.za (AIFS — first-designated J-1 sponsor), goaupair.com (Go Au Pair), aupaircare.com (AuPairCare), interexchange.org (InterExchange Au Pair USA), aupairworld.com (AuPairWorld — EU au-pair directory, IAPA member), sars.gov.za (SA tax residency reference)

**Iterations:** 8

---

## Note schemas

**DESTINATION note:**
```markdown
---
type: destination
country:
sa_candidates_accepted: [yes | no | conditional]
sa_specific_caveat:
primary_visa_route: "[[visa_route_name]]"
secondary_visa_routes: []
age_minimum: 18
age_maximum_official:
age_maximum_practical:
typical_pocket_money_local_currency_monthly:
typical_pocket_money_usd_monthly:
weekly_hours_cap:
weekly_childcare_hours_cap:
language_certificate_required_at_visa: [yes — language and level | no | preferred]
drivers_licence_required: [yes — mandatory | strongly_preferred | no]
host_family_pays: [flight | insurance | room_board | pocket_money | language_lessons]
contract_minimum_months:
contract_maximum_months:
contract_extension_possible: [yes — terms | no]
pr_pathway: [no — explicitly_not_a_pr_route]
route_status: [open | restricted | closed | emerging]
last_signal_date:
evidence_strength: confirmed | alleged | rumoured
tags: [destination, au-pair, work-abroad]
sources:
  -
---

# Country Name

2–4 sentences: why SA au-pair candidates choose this destination, accessibility for someone aged 18–26 with a driver's licence and clean PCC, and a realistic assessment of pay vs. cost-of-living vs. cultural experience.

## Demand Signal & SA Diaspora
Quantified evidence — sponsor agency intake numbers, IAPA statistics where published, scale of the SA au-pair diaspora in this country. Date every figure.

## SA-Specific Eligibility Notes
What an SA applicant must prove that a US/UK applicant does not — e.g. Goethe-Institut A1 certificate for Germany, French language-school enrolment for France, 200hr documented childcare experience for USA J-1, never-previously-in-NL clause for Netherlands.

## Realistic Assessment
Honest appraisal: who this destination suits (degreed vs non-degreed is irrelevant for au pair; key axes are language ability, savings buffer, target experience — USA for income + travel, NL for short-term EU exposure, Germany for language acquisition, France for francophone career angle). Note who should look elsewhere.

## Connections
- [[Visa Route]] — accessed_via, source: [url]
- [[Sponsor Agency]] — administered_by, source: [url]
- [[Regulatory Body]] — regulated_by, source: [url]

## Sources
- [Source title](url)
```

**SPONSOR AGENCY note:** (USA J-1 designated sponsors, IND-recognised NL sponsors, BA Gütezeichen DE agencies)
```markdown
---
type: sponsor_agency
name:
short_name:
country:
operator_type: [j1_designated_sponsor | ind_recognised_sponsor | ba_guetezeichen_member | other_regulated_au_pair_agency]
official_url:
sa_office_or_partner:
sa_candidates_accepted: [yes | no | conditional]
typical_program_fee_paid_by_au_pair: [Free | Amount + currency]
typical_program_fee_paid_by_host_family: [Amount + currency]
benefits_included: [flight | health_insurance | program_academy | 24h_support_line | end_of_program_certificate]
intake_schedule:
typical_match_time_weeks:
contract_length_months:
known_reputation: [official_designated | well_documented_in_use | newer | flagged]
evidence_strength: confirmed | alleged | rumoured
tags: [sponsor-agency, au-pair, work-abroad, contact]
sources:
  -
---

# Agency Name

What this agency is, which destination it serves, and its standing with the regulator (US State Dept designation / IND recognition / BA quality mark).

## SA-Specific Application Path
How an SA candidate applies — direct online + local SA office or partner (e.g. Cultural Care via African Ambassadors; AIFS via Au Pair in America SA; OVC across multiple destinations).

## What the Agency Pays / Charges
Itemise: programme fee (if any), flight, insurance, programme academy fee, education allowance. State who pays what.

## Connections
- [[Destination]] — operates_in, source: [url]
- [[Visa Route]] — sponsors, source: [url]
- [[Regulatory Body]] — designated_by, source: [url]

## Sources
- [Source title](url)
```

**REGULATORY BODY note:** (the bodies that regulate sponsor agencies — US State Dept ECA, IND, BA, OFII)
```markdown
---
type: regulatory_body
name:
short_name:
country:
category: [federal_department | immigration_service | labour_authority | foreign_office]
official_url:
sponsor_register_url:
function_for_au_pair_programme:
designation_or_recognition_criteria:
public_register_searchable: [yes | no]
evidence_strength: confirmed | alleged | rumoured
tags: [regulator, au-pair, work-abroad]
sources:
  -
---

# Body Name

What this body regulates within the au-pair programme — sponsor designation, host-family compliance, residence-permit issuance, programme rule-setting.

## Public Register
Link to the searchable register of designated/recognised sponsors. Explain how an SA candidate uses it to confirm a sponsor is legitimate.

## Connections
- [[Sponsor Agency]] — designates, source: [url]
- [[Destination]] — regulates_au_pair_in, source: [url]

## Sources
- [Source title](url)
```

**EDGE metadata:**
- `relationship_type`: accessed_via | administered_by | operates_in | sponsors | designates | regulated_by | requires_language_cert | excludes_country (for "cannot be from same country as host family") | replaced_by
- `description`: short label
- `date_range`: YYYY–present
- `evidence_strength`: confirmed | alleged | rumoured
- `sources`: at least one URL

---

## Runtime rules

- `evidence_strength`: `confirmed` | `alleged` | `rumoured`
- **USA J-1 Au Pair is the top-tier destination for SA candidates** because (a) sponsor agencies actively recruit in SA (Cultural Care, AIFS, Go Au Pair, AuPairCare, InterExchange, EurAuPair, expert AuPair, GreatAuPair, A.P.EX, Au Pair International — verify the current designated list at j1visa.state.gov against the search tool there), (b) English is the working language, (c) driver's licence is standard for SA candidates, (d) earning potential (minimum USD $220.50/wk + $500 education allowance + room + board + flight + insurance) is materially higher than any European au-pair route.
- **Netherlands and Germany are mid-tier**: Netherlands has the most generous EU pocket money cap (~€340/mo) but is age-capped at 25 and non-renewable; Germany requires A1 German certificate at visa application (Goethe-Institut Johannesburg/Pretoria — verify current fee).
- **France is lower-tier for SA candidates** because of the French-language barrier, but viable for francophone candidates.
- **UK is NOT an au-pair destination** — there is no dedicated au-pair visa post-Brexit. The Youth Mobility Scheme Tier 5 (£298 visa, £2,530 maintenance, ballot-based, age 18–30) is a generic work-and-travel visa, NOT an au-pair programme. Flag as `route_status: closed` for the au-pair use case; do not describe it as a UK au-pair route.
- **Gulf state "au pair" arrangements (UAE, Saudi, Qatar, Kuwait) are OUT OF SCOPE** — these are domestic-worker visas under the Kafala system, not cultural exchange. Different legal framework, materially higher abuse risk. Do not include them as au-pair destinations.
- **Age caps must be sourced from the destination's official ministry/agency:**
  - USA J-1: 18–26 (must be under 27 at visa issuance) per 22 CFR 62.31 — confirm with ecfr.gov + j1visa.state.gov
  - Netherlands: confirm current cap directly on ind.nl/en/residence-permits/au-pair-and-exchange/residence-permit-au-pair (historical 18–25 rule has been updated; the current IND age range may be 18–30 — verify against the live IND page and quote the page retrieval date)
  - Germany: 18–26 per Federal Foreign Office au-pair info sheet (southafrica.diplo.de)
  - France: 18–30 per france-visas.gouv.fr
- **Pocket money minimums** — quote in local currency with the official source URL and date:
  - USA: FLSA-derived minimum starting at approximately USD $195.75/wk for Standard au pair (figure has been subject to litigation per Capron v. OAGA and 2024 State Dept programme updates — verify current minimum at j1visa.state.gov and on each designated sponsor's fee-disclosure page; some states (CA, MA) impose higher state-minimum rates). EduCare is approximately 75% of Standard; Au Pair Extraordinaire requires ≥ 1 yr early-childhood education and pays a higher stipend (commonly USD $300+/wk). State an "approximately" figure with the source URL and retrieval date — do not hard-code a single figure.
  - Netherlands: max ~€340/mo zakgeld per ind.nl (Netherlands cap, not minimum)
  - Germany: €280/mo per BA guideline (arbeitsagentur.de)
  - France: €320/mo minimum per service-public.fr
- **2025 US Visa Integrity Fee** — verify the current amount and effective date against goaupair.com's policy update and travel.state.gov. Quote with the source page and retrieval date. Do not invent a figure.
- **The "cannot be from same country as host family" rule** — applies to Netherlands, Germany, and France. SA candidates cannot work for a SA expat host family in those three destinations unless a non-SA adult is in the household. NOTE: 22 CFR 62.31 does NOT contain a same-nationality exclusion for the USA J-1 au-pair programme; the US rule is that host parents must be US citizens or LPRs and fluent in English. Mention this distinction in the destination notes.
- **No au-pair-to-PR pathway exists** for any of these destinations. The programme is a 6–24 month cultural exchange. Document honestly; do not oversell as a migration route.
- **Driver's licence is the single biggest practical filter** for the USA. The IDP (international driving permit) issued by AA South Africa is the standard add-on. Note this in the USA destination note.
- **Single-source rule** — every age cap, pocket money figure, programme fee, and weekly-hours cap must be primary-source-verified (US State Dept, IND, BAMF/BA, France-visas portal). Sponsor agency websites are tier-2 acceptable for their own programme fees. Forum posts, AuPairWorld articles, blog round-ups are `alleged` until primary-verified.
- **Date-stamp all currency conversions** — quote ZAR equivalent with source and date (xe.com, oanda.com, Reuters).
- Folder structure: `Destinations/`, `Sponsor Agencies/`, `Regulatory Bodies/`
