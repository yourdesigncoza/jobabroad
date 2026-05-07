# Prompt: Farming — Legitimate Contacts & Official Links

> Run with `/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-farming-06-contacts`

---

/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-farming-06-contacts

**Goal:** Build a verified directory of legitimate scheme operators, government visa portals, regulatory bodies, and SA-side support services that a South African farm worker can contact for the UK Seasonal Worker visa, USA H-2A, Canada Agricultural Stream, or Australian skilled-stream agricultural visas — with each entity's scope, fee structure, and SA-specific notes clearly documented. Include official channels for reporting scams (SAPS, US Embassy Pretoria, AHC Pretoria, Action Fraud, Canadian Anti-Fraud Centre).

**Seed entities:**
- AGRI-HR — UK Defra-endorsed, Home Office-licensed Seasonal Worker approved scheme operator (also check GLAA licence)
- Concordia (UK) Ltd — UK Defra-endorsed, Home Office-licensed Seasonal Worker approved scheme operator (also check GLAA licence)
- Fruitful Jobs — UK Defra-endorsed, Home Office-licensed Seasonal Worker approved scheme operator (also check GLAA licence)
- HOPS Labour Solutions Ltd — UK Defra-endorsed, Home Office-licensed Seasonal Worker approved scheme operator (also check GLAA licence)
- Pro-Force Limited — UK Defra-endorsed, Home Office-licensed Seasonal Worker approved scheme operator (also check GLAA licence)
- RE Recruitment — UK Defra-endorsed, Home Office-licensed Seasonal Worker approved scheme operator (poultry workers only; also check GLAA licence)
- U.S. Mission South Africa — visa interview infrastructure for H-2A applicants (US consulates in Johannesburg, Cape Town, and Durban; the Pretoria post does not offer routine visa services). Appointment workflow at ais.usvisa-info.com/en-za/niv

**Source constraints:** gov.uk/government/publications/seasonal-worker-visa-guidance-for-applicants (current approved scheme operator list), gov.uk/government/publications/register-of-licensed-sponsors-workers (Home Office Register of Licensed Sponsors), gla.gov.uk (GLAA register of licensed labour providers — verify each scheme operator's licence), agri-hr.com (or current AGRI-HR site), concordia.org.uk, fruitfuljobs.com, hopslaboursolutions.com, pro-force.co.uk, za.usembassy.gov, dol.gov/agencies/eta/foreign-labor (FLAG / OFLC disclosure data + H-2A debarment list), canada.ca/en/employment-social-development/services/foreign-workers/agricultural.html, canada.ca/en/employment-social-development/services/foreign-workers/employer-compliance.html (LMIA non-compliance / employer violations list), immi.homeaffairs.gov.au, jobsandskills.gov.au (CSOL / occupation lists), vetassess.com.au, dalrrd.gov.za, agriseta.co.za, saqa.org.za, dirco.gov.za (apostille), saps.gov.za (PCC), HelloPeter (SA community trust signal — flag as anecdotal), cipc.co.za (CIPC company registration check)

**Iterations:** 6

---

## Note schemas — apply to every note created

**SCHEME OPERATOR / SPONSOR note:**
```markdown
---
type: scheme_operator
legal_name:
trading_name:
scope: [uk_seasonal_worker_scheme_operator | h2a_recruiter | canada_lmia_employer_or_agent | au_skilled_sponsor]
country_of_operation:
sa_facing: [yes | no | unknown]
visa_routes_handled: [uk_seasonal_worker | usa_h2a | canada_agricultural_stream | australia_skilled]
defra_licensed: [yes | no | not_applicable]
us_dol_h2a_compliant: [yes | no | unknown | not_applicable]
canada_lmia_employer: [yes | no | not_applicable]
sa_cipc_registered: [yes | no | unknown | not_applicable]
worker_fee_charged: [no | yes | unknown]
worker_fee_amount_zar:
job_placement_included: [yes | no | optional]
accommodation_arranged: [yes | no | optional]
contact_url:
evidence_strength: confirmed | alleged | rumoured
tags: [scheme-operator, farming, work-abroad, south-africa]
sources:
  -
---

# Scheme Operator Name

What they do for SA farm workers, which visa routes they handle, and their fee model. State explicitly if they charge the worker any fee — under H-2A and UK scheme operator rules they generally must not.

## Services for SA Applicants
Specific services (CoS issuance for UK Seasonal Worker; H-2A petition support; LMIA-backed Canadian placement; etc.). Distinguish sponsor / scheme-operator role (regulated, accountable) from intermediary recruiters (often unregulated).

## Fee Structure
What is paid by whom. UK Seasonal Worker: scheme operator may deduct accommodation but cannot charge a recruitment fee. H-2A: employer pays petition + return transport; worker pays only DS-160 / MRV fee. Document the actual fee model with the operator's own published terms.

## SA Community Reputation
HelloPeter / Facebook SA work-abroad groups reputation summary. If none found, state: "No documented complaints found as at [date]." Do not embellish.

## Connections
- [[Visa Route]] — administers, source: [url]
- [[Government Body]] — licensed_by, source: [url]

## Sources
- [Source title](url)
```

**GOVERNMENT BODY note:**
```markdown
---
type: government_body
name:
short_name:
category: [visa_authority | programme_administrator | embassy | regulator | sa_apostille | sa_qualification_evaluator]
jurisdiction:
relevant_url:
sa_specific_page_url:
evidence_strength: confirmed
tags: [government, farming, visa, south-africa]
sources:
  -
---

# Government Body Name

What this body does and why a SA farm worker needs to know about it.

## SA Applicant's Interaction
Exactly what an SA worker must do with this body (e.g. "Apply for UK Seasonal Worker visa at gov.uk/seasonal-worker-visa using the CoS reference number from your scheme operator"; "Book H-2A visa interview at za.usembassy.gov/visas"; "Apply for SAPS Police Clearance via eSAPS or your local SAPS station, then apostille at DIRCO Pretoria.").

## Connections
- [[Visa Route]] — administers, source: [url]
- [[Scheme Operator]] — licenses, source: [url]

## Sources
- [Source title](url)
```

**REPORTING CHANNEL note:**
```markdown
---
type: reporting_channel
name:
country:
scope: [domestic_sa | uk | usa | canada | australia]
applicable_to_scams: [closed_scheme_pitch | fake_operator | upfront_fee | maritime_offshore | identity_theft | all]
contact_url:
contact_phone:
contact_email:
evidence_strength: confirmed
tags: [reporting, scam-protection, farming, south-africa]
sources:
  -
---

# Reporting Channel Name

Where a SA farm worker reports a suspected scam, by destination scheme.

## How to Report
Step-by-step from incident to filed complaint.

## Connections
- [[Scam Pattern]] — receives_reports_about, source: [url]

## Sources
- [Source title](url)
```

**EDGE metadata:**
- `relationship_type`: administers | licensed_by | places_applicants_in | receives_reports_about | designated_by | partners_with | required_before
- `description`: short label
- `evidence_strength`: confirmed | alleged | rumoured
- `sources`: at least one URL

---

## Runtime rules

- `evidence_strength`: `confirmed` | `alleged` | `rumoured`
- **The currently-approved UK Seasonal Worker scheme operators are non-negotiable facts** — 6 per current GOV.UK farm-worker guidance: AGRI-HR, Concordia (UK) Ltd, Fruitful Jobs, HOPS Labour Solutions Ltd, Pro-Force Limited, RE Recruitment (poultry only). The list has changed year-on-year (ethero Strategic Staffing has appeared at times). Verify the current GOV.UK guidance at gov.uk/guidance/seasonal-work-on-farms-guidance-for-workers and the Home Office Register of Licensed Sponsors at vault-build time. Cross-check each operator on the GLAA register at gla.gov.uk for labour-provider licence status. Document each operator with its current website URL and SA-applicant guidance
- **H-2A SA recruiter landscape is sparse and may be fragile** — there is no standardised "H-2A sponsor list" equivalent to the J1 designated-sponsor list. Document the official path: SA worker → US Embassy Pretoria DS-160 application after employer files I-129 / DOL TLC. Be cautious about naming SA-side H-2A "agents" unless they are clearly verifiable; if one is named, cross-check CIPC registration and any DOL action history
- **Canadian Agricultural Stream channel** — Canadian employers (often farms or labour suppliers in Ontario, BC, Alberta) hold the LMIA. There is no SA-side government-licensed intermediary equivalent to the UK scheme operators. Document the canada.ca portal as the official application path and warn against intermediaries who claim to "guarantee" Canadian placements for an upfront fee
- **Australian skills-assessing authorities** — for skilled-stream agricultural roles, the assessing authority depends on the ANZSCO occupation. VETASSESS (vetassess.com.au) handles many farm management / agricultural roles, but other occupations route through different bodies. Note that VETASSESS is an Australian skills-assessing authority — it is not a government body and not a SA qualification evaluator (SAQA covers SA-domestic recognition only)
- **Distinguish sponsor / scheme operator (regulated) from recruiter (often unregulated)** — for UK and H-2A, regulated scheme-operator / DOL-compliant employer roles carry legal accountability; an unregulated recruiter has no legal standing in the visa programme. Document this distinction in every relevant note
- **No worker-paid placement fee under H-2A or UK Seasonal Worker** — flag any operator whose fee model charges the worker upfront for placement. Under SA's Employment Services Act 4 of 2014, s. 15, charging a work seeker a fee for finding employment is prohibited (the relevant statute is the Employment Services Act, not BCEA s. 91)
- **SA-side bodies to include:** DIRCO (apostille — free service); SAPS Criminal Record Centre (PCC — no online "eSAPS" application; SAPS website is for status enquiry only); Department of Home Affairs (passport — dha.gov.za); Department of Employment and Labour (labour.gov.za — private employment agency rules and scam reporting); DALRRD (sectoral, not licensing); AgriSETA (NQF qualifications). Note: SAQA evaluates foreign qualifications for SA-domestic recognition; for Australian skilled migration the relevant assessing authority is VETASSESS (or other Australian assessing authority per occupation), NOT SAQA. Document each with its current SA URL and exact relevance to farm-worker work-abroad applications
- **Reporting channels per destination:**
  - SA: SAPS (saps.gov.za); SA Department of Employment and Labour
  - UK: Action Fraud (actionfraud.police.uk); UKVI fraud reporting
  - USA: US Embassy Pretoria; FTC (reportfraud.ftc.gov); DOL Wage and Hour Division (H-2A worker-fee violations)
  - Canada: Canadian Anti-Fraud Centre
  - Australia: AHC Pretoria; Scamwatch (ACCC)
- **Date-stamp all fees and contact details** — these change annually
- **Do not duplicate generic SA migration-services content from wa-shared-migration-cos** — focus on farming-specific scheme operators and government bodies
- Folder structure: `Scheme Operators/`, `Government Bodies/`, `Reporting Channels/`
