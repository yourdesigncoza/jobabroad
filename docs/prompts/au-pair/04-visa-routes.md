# Prompt: Au Pair — Visa Routes

> Run with `/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-au-pair-04-visa-routes`

---

/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-au-pair-04-visa-routes

**Goal:** Build a current, source-verified reference of every visa / residence-permit route available to South African au-pair candidates in 2025–2026 — covering the USA J-1 Exchange Visitor Visa (Au Pair category under 22 CFR 62.31), Netherlands MVV + Au-pair Residence Permit, Germany National D Visa (au-pair) + post-arrival Aufenthaltserlaubnis, France VLS-TS jeune au pair (long-stay visa serving as residence permit), and the explicit non-existence of a UK au-pair visa post-Brexit — with eligibility (age caps, language requirements, criminal record, childcare-experience minimums), processing times, sponsor / host-family roles, extension and renewal rules, the absence of any PR pathway, and recent policy changes including the 2025 US Visa Integrity Fee.

**Seed entities:**
- USA J-1 Exchange Visitor Visa (Au Pair category) under 22 CFR 62.31 — administered by US State Department Bureau of Educational and Cultural Affairs (ECA); sponsor agencies are the designated programme operators
- Netherlands Au-pair Residence Permit (Verblijfsvergunning au pair) + MVV (Machtiging tot Voorlopig Verblijf) — administered by IND, applied for by an IND-recognised sponsor
- Germany National D Visa (au-pair category) + Aufenthaltserlaubnis (residence permit) — administered by Federal Foreign Office (Auswärtiges Amt) at the visa stage and the Ausländerbehörde at the residence-permit stage
- France VLS-TS mention "jeune au pair" (long-stay visa valant titre de séjour — long-stay visa serving as residence permit; per service-public.fr F13348 / F15813) — applied via France-Visas portal + CAPAGO South Africa; post-arrival online validation via the ANEF portal (administration-etrangers-en-france.interieur.gouv.fr) within 3 months of arrival
- UK Youth Mobility Scheme (NOT an au-pair visa — explicit flag) and the absence of any dedicated UK au-pair route post-Brexit. NOTE: South Africa WAS added to the UK YMS in 2024 with an annual quota and ballot — verify current SA eligibility at gov.uk/youth-mobility-scheme + the Appendix Youth Mobility Scheme eligible-nations list before stating SA is or is not eligible.

**Source constraints:** j1visa.state.gov (US State Dept J-1 official portal including 22 CFR 62.31 programme rules + designated sponsor search), travel.state.gov (US non-immigrant visa application + reciprocity for SA), eca.state.gov (Bureau of Educational and Cultural Affairs — programme oversight), ice.gov/sevis (SEVIS I-901 fee), za.usembassy.gov (US Embassy Pretoria + Cape Town / Johannesburg / Durban consulates — interview procedure), www.ecfr.gov (electronic Code of Federal Regulations — 22 CFR 62.31 au-pair programme rule), ind.nl (Netherlands IND — au-pair residence permit + recognised sponsor register + MVV procedure), www.government.nl (Dutch government immigration policy), netherlandsworldwide.nl (NL embassy SA + application procedure), bamf.de (German BAMF — residence permit policy), southafrica.diplo.de (German Mission SA — au-pair visa info sheet, current fees, document checklist), auswaertiges-amt.de (German Federal Foreign Office — au-pair visa policy), arbeitsagentur.de (Bundesagentur für Arbeit — au-pair model contract + €280/mo guideline + RAL Gütezeichen list), goethe.de (Goethe-Institut A1 — prerequisite for German visa), france-visas.gouv.fr (French long-stay visa portal — au-pair category), service-public.fr (F13348 / F15813 — jeune au pair Cerfa convention, weekly hours, €320 pocket money, extension to 2 years), legifrance.gouv.fr (French primary legislation for jeune au pair stay), administration-etrangers-en-france.interieur.gouv.fr (ANEF — post-arrival VLS-TS online validation portal), interieur.gouv.fr (Ministry of the Interior), ofii.fr (OFII — verify whether arrival medical applies under current VLS-TS procedure; may have been superseded by ANEF online steps), fr-za.capago.eu (CAPAGO South Africa — France visa appointment provider since 2023; replaced VFS Global), gov.uk/youth-mobility-scheme (UK YMS — flag as NOT an au-pair route + verify SA eligibility on the current Appendix Youth Mobility Scheme eligible-nations list), hcch.net (Apostille Convention status — all four primary destinations are parties), goaupair.com (Go Au Pair — 2025 Visa Integrity Fee policy update — tier-2 reference), culturalcare.com (Cultural Care — current programme rules and SA-specific notes — tier-2)

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
visa_code_or_subclass:
route_status: [open | restricted | closed | emerging]
replaced_by:
replaced_what:
sponsor_required: [yes — type | no | optional]
host_family_required: [yes — matched_before_visa | yes — matched_after_visa | not_applicable]
degree_required: [yes | no | preferred]
childcare_experience_minimum_hours:
childcare_experience_documentation: [references | logbook | qualification | combination]
drivers_licence_required: [yes — mandatory | strongly_preferred | no]
language_requirement_at_visa: [yes — language + level | no]
language_test_alternative: [yes — IELTS/TOEFL score | no | not_applicable]
age_minimum:
age_maximum_official:
age_maximum_practical:
sa_specific_extra_requirement:
processing_time_official:
processing_time_reported_at_pretoria:
initial_visa_duration_months:
renewable: [yes — months added | no | conditional]
maximum_total_duration_months:
pr_pathway: [no — explicit_note]
last_policy_change:
last_policy_change_date:
official_url:
evidence_strength: confirmed | alleged | rumoured
tags: [visa-route, au-pair, work-abroad]
sources:
  -
---

# Visa Route Name

Plain-language summary: what this visa is, who it is for, current status, and the single biggest gotcha for an SA candidate.

## Eligibility for SA Au-Pair Candidates
Specific requirements that apply to SA candidates — age, driver's licence, childcare hours, language certificate, criminal record, and any SA-specific extra.

## Application Process (SA Side → Embassy / Consulate → Arrival)
End-to-end sequence with realistic time per step. Note where the sponsor agency / host family's role begins and ends (e.g. Cultural Care issues match → DS-2019 → candidate applies for J-1 at US Embassy Pretoria; IND-recognised sponsor files MVV → candidate visits NL embassy Pretoria for MVV sticker).

## Current Status & Recent Changes
Any policy change in the last 24 months that affects SA applicants. Cite the regulation / announcement and its effective date. Include the 2025 US Visa Integrity Fee under the One Big Beautiful Bill Act.

## Extension and Renewal
USA J-1: optional 6, 9, or 12-month extension (max 24 months total). Netherlands: 12 months, non-renewable. Germany: up to 12 months total, generally non-renewable. France: up to 12 months, generally non-renewable.

## PR / Residency Pathway
**No au-pair visa leads to permanent residence in any destination.** Document explicitly so SA candidates don't expect a migration outcome.

## Connections
- [[Destination]] — available_in, source: [url]
- [[Sponsor Agency]] — sponsored_via, source: [url]
- [[Regulatory Body]] — administered_by, source: [url]

## Sources
- [Source title](url)
```

**POLICY CHANGE note:**
```markdown
---
type: policy_change
name:
visa_route_affected: "[[visa_route_name]]"
country:
effective_date:
what_changed:
impact_on_sa_au_pairs:
source_document:
evidence_strength: confirmed | alleged | rumoured
tags: [policy-change, visa, au-pair, work-abroad]
sources:
  -
---

# Policy Change: [Short Description]

What changed, when, and what it means for an SA au-pair candidate applying now.

## Before vs After
| | Before | After |
|---|---|---|
| Fee | | |
| Document list | | |
| Age cap | | |
| Renewal terms | | |

## Connections
- [[Visa Route]] — affects, source: [url]

## Sources
- [Source title](url)
```

**REGULATORY BODY note:**
```markdown
---
type: regulatory_body
name:
short_name:
country:
category: [federal_department | immigration_service | labour_authority | foreign_ministry | embassy]
jurisdiction: [National | Provincial | Municipal]
relevant_function_for_au_pair:
contact_url:
sa_office:
evidence_strength: confirmed | alleged | rumoured
tags: [regulator, au-pair, visa]
sources:
  -
---

# Body Name

What this body does and how it intersects with the SA au-pair candidate's journey.

## Connections
- [[Visa Route]] — administers, source: [url]
- [[Destination]] — operates_in, source: [url]

## Sources
- [Source title](url)
```

**EDGE metadata:**
- `relationship_type`: available_in | administers | sponsored_via | replaced_by | replaced | affects | requires_language_cert | requires_apostille_from | issued_by | excludes_country (for "cannot be from same country as host family") | does_not_lead_to_pr
- `description`: short label
- `date_range`: YYYY–present or YYYY–YYYY (if closed)
- `evidence_strength`: confirmed | alleged | rumoured
- `sources`: at least one URL

---

## Runtime rules

- `evidence_strength`: `confirmed` | `alleged` | `rumoured`
- **USA J-1 is the anchor route** — administered under 22 CFR 62.31 (electronic CFR text on ecfr.gov). Programme rules are uniform across all designated sponsors; sponsor agencies operationalise them. Key rule references:
  - **Age 18–26** (must be under 27 at visa issuance)
  - **Childcare experience: 200 hours documented** general childcare; placements with children **under 2 years** require documented infant-specific childcare hours (sponsors enforce explicitly)
  - **Driver's licence required** for nearly all host families
  - **Weekly hours cap: 45**
  - **Stipend minimum: FLSA-derived federal baseline approximately USD $195.75/wk Standard** (under litigation history per Capron v. OAGA; state minimums in CA / MA exceed federal); EduCare approximately 75% of Standard; Au Pair Extraordinaire premium tier — verify current rates at j1visa.state.gov + sponsor disclosure pages, do not hard-code
  - **Programme length: 12 months, with optional 6/9/12-month extension** (max 24 months total)
  - **Education allowance: USD $500 minimum per programme year (Standard); up to USD $1,000 for EduCare**
  - Verify each against ecfr.gov (22 CFR 62.31) and j1visa.state.gov current text.
- **2025 US Visa Integrity Fee** — added under the One Big Beautiful Bill Act (July 2025). Verify current amount, effective date, and applicability to J-1 au-pair against travel.state.gov + goaupair.com policy update. Treat as `confirmed` only after primary source URL is fetched.
- **SEVIS I-901 fee for au-pair J-1 is USD $35** — confirmed at ice.gov/sevis FAQ. NOT the $220 figure that applies to intern/trainee/teacher J-1 categories.
- **Netherlands key rules** (verify against ind.nl current page):
  - **Age range** — verify current cap directly on ind.nl/en/residence-permits/au-pair-and-exchange/residence-permit-au-pair (historical rule was 18–25 but IND has updated; current range may be 18–30). Quote with page retrieval date.
  - **Single-attempt rule** — never previously held a Netherlands au-pair permit
  - **Must be unmarried, have no children, and not be related to the host family** — verify exact wording on ind.nl
  - **Permit is 12 months, non-renewable**
  - **Hours cap: 30/week light household duties**
  - **Pocket money cap: ~€340/mo zakgeld** (this is a maximum, not a minimum — to prevent disguised employment)
  - **Intermediary fees charged to the au pair are capped** at approximately €34 for preparation costs under Dutch labour law — agencies cannot charge the au pair a placement fee beyond this
  - **MVV-route** — IND-recognised sponsor files; candidate cannot apply direct. Sponsor must be in the IND "Au pair" section of the Au pair and Exchange recognised-sponsor register at ind.nl/en/public-register-recognised-sponsors
- **Germany key rules** (verify against southafrica.diplo.de info sheet + bamf.de):
  - **Age 18–26**
  - **A1 German certificate at visa application** — non-negotiable. Goethe-Institut or telc. SA candidates cannot enter on Working Holiday (no SA–Germany WHV agreement) — must use the au-pair visa
  - **Contract on BA model template** (arbeitsagentur.de) signed by host family
  - **Pocket money: €280/mo minimum** (BA guideline)
  - **Hours cap: 30/week** (incl. up to 6 hrs/day childcare; **1.5 days off/week** since the May 2023 BA guideline update — verify against arbeitsagentur.de current model contract)
  - **Programme length: 6–12 months**, generally non-renewable
  - **Cannot work for a host family of same nationality** unless a German national adult is in the household
- **France key rules** (verify against service-public.fr F13348 / F15813 + france-visas.gouv.fr):
  - **Age 18–30**
  - **Cerfa au-pair convention** (placement contract) signed pre-departure and submitted with the visa application
  - **Basic French OR secondary education OR professional qualifications required** (per service-public.fr) — A1 certificate not strictly required at visa stage but families and consulates commonly expect documented French ability
  - **Programme length: 3–12 months, extendable up to a total of 24 months** (verify against service-public.fr current rule)
  - **Pocket money: €320/mo minimum** per service-public.fr
  - **Weekly hours cap: 25 hrs/week** per service-public.fr (NB: lower than NL/DE)
  - **Post-arrival: validate VLS-TS online via ANEF** (administration-etrangers-en-france.interieur.gouv.fr) within 3 months and pay the validation tax (timbre); OFII medical is not a universal step under current VLS-TS — verify against france-visas.gouv.fr
- **UK: NO au-pair visa exists** — emphasise this. Closest fallback is the **UK Youth Mobility Scheme** (formerly Tier 5), a generic 2-year work-and-travel visa with ballot quota. **South Africa WAS added to the eligible-nations list in 2024** (annual quota, ballot-allocated) — verify current SA eligibility against gov.uk/youth-mobility-scheme + the Appendix Youth Mobility Scheme eligible-nations list with retrieval date before stating SA is or is not eligible (the eligible-nations list is the authoritative source; do not rely on commentary). YMS is NOT an au-pair programme: no sponsor support, no host-family-pays-flight-and-insurance benefit, no programme structure. Flag the route as `route_status: closed` for the au-pair use case while noting the underlying YMS facts.
- **Gulf "au pair" arrangements are OUT OF SCOPE** — these are Kafala domestic-worker visas, not cultural exchange. Different legal framework, materially higher abuse risk. Do not list them as au-pair visa routes.
- **Apostille Convention applies to all four primary destinations** — confirm against hcch.net. SA documents (SAPS PCC, etc.) use DIRCO apostille only; no additional embassy attestation needed for USA / NL / DE / FR.
- **"Cannot be from same country as host family"** — verify per destination:
  - **France** — yes, prohibited per service-public.fr
  - **Germany** — conditional; the au pair and host family must have different mother tongues (effectively excludes same-country placements unless a non-German-mother-tongue adult is in the household)
  - **Netherlands** — verify against ind.nl current rule (the older 18–25-and-same-country variants have evolved; do not assume a nationality bar without confirming)
  - **USA** — 22 CFR 62.31 does NOT contain a same-nationality exclusion; the US rule is that host parents must be US citizens or LPRs and fluent in English, and that the au pair cannot place with a relative
  Document the exact rule per destination from primary source. Do not paraphrase "same country" as a universal au-pair rule.
- **Age caps must be enforced from the destination's official source.** Do not paraphrase from sponsor websites if the primary source disagrees. Goethe-Institut centre staff and Cultural Care recruiters have been observed quoting older / wrong figures.
- **No au-pair-to-PR pathway exists** — document explicitly. Candidates seeking long-term migration should be referred to skilled-worker routes (nursing, teaching, IT). The au-pair experience is a 6–24 month cultural exchange.
- **Closed / restricted routes** — flag any route confirmed closed (e.g. if a sponsor agency loses State Department designation) as `[CLOSED — do not recommend]` with the policy source.
- **Single-source rule** — visa codes, durations, fees, and processing times must come from the primary government source (j1visa.state.gov, ind.nl, southafrica.diplo.de, france-visas.gouv.fr, ecfr.gov for 22 CFR 62.31). Sponsor agency summaries are `alleged` until primary-verified.
- Folder structure: `Visa Routes/`, `Policy Changes/`, `Regulatory Bodies/`
