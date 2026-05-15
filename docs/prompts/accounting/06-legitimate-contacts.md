# Prompt: Accounting — Legitimate Contacts & Official Links

> Run with `/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-accounting-06-contacts`

---

/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-accounting-06-contacts

**Goal:** Catalogue every legitimate, primary-source contact and resource an SA accountant needs across the work-abroad journey — SAICA (SA), the SAICA reciprocity / RMA / MRA partners and programmes (ICAEW, ICAS, CA ANZ, CPA Canada and provincial bodies, Chartered Accountants Ireland — CAI — note CPA Ireland amalgamated into CAI effective 1 Sept 2024, NASBA-IQAB/IQEX), destination government visa portals (Home Office, DHA, IRCC, DETE, INZ), destination tax / audit / AML regulators (FRC and Recognised Supervisory Bodies, IRBA, IAASA, TPB, AUSTRAC, FINTRAC, HMRC AML), SA-side document services (SAQA, DIRCO, SAPS), and vetted SA migration / document concierge companies (Sable International, Apostil.co.za). Include scope clarity — what each organisation actually does, what it costs, and what it does NOT do.

**Seed entities:**
- SAICA — SA Institute of Chartered Accountants (saica.org.za)
- ICAEW (icaew.com) — UK CA designation via reciprocity, members-of-other-bodies SAICA page
- ICAS (icas.com) — Scotland CA designation; SAICA reciprocity partner
- CA ANZ (charteredaccountantsanz.com) — AU/NZ CA designation via RMA
- CPA Canada (cpacanada.ca) — Canadian CPA via Reciprocal Membership Agreement (provincial registration required)
- Chartered Accountants Ireland — CAI (charteredaccountants.ie) — Ireland reciprocity partner; CPA Ireland amalgamated into CAI effective 1 Sept 2024
- NASBA-IQAB / IQEX (nasba.org/saica + iqab.nasba.org) — US route via International Qualification Examination

**Source constraints:** saica.org.za, icaew.com, icas.com, charteredaccountantsanz.com, cpacanada.ca, cpaontario.ca, cpabc.ca, cpaalberta.ca, cpaquebec.ca, charteredaccountants.ie, nasba.org/saica/, iqab.nasba.org, frc.org.uk (Recognised Supervisory Bodies / RSB list for UK audit), irba.co.za (SA Independent Regulatory Board for Auditors), iaasa.ie (Ireland Auditing and Accounting Supervisory Authority), gov.uk/skilled-worker-visa, homeaffairs.gov.au, immi.homeaffairs.gov.au, immi.homeaffairs.gov.au/visas/working-in-australia/skill-occupation-list (CSOL — Core Skills Occupation List), canada.ca/en/immigration-refugees-citizenship.html, ircc.canada.ca, enterprise.gov.ie, immigration.govt.nz, tpb.gov.au (Australia Tax Practitioners Board), ato.gov.au (ATO — Australia tax-agent context), ird.govt.nz (NZ Inland Revenue tax-agent context), revenue.ie (Irish Revenue tax-agent context), gov.uk/government/organisations/hm-revenue-customs (HMRC AML / tax-agent), austrac.gov.au, fintrac-canafe.canada.ca, accaglobal.com (UK RSB for audit context; not a SAICA reciprocity partner), cimaglobal.com (international body), saiba.org.za (SA secondary body), saipa.org.za (SA secondary body with smaller reciprocity network including IPA Australia / IFA GB), publicaccountants.org.au (IPA Australia — recognises SAIPA), saqa.org.za, dirco.gov.za, saps.gov.za, wes.ca, sableinternational.com, apostil.co.za, finglobal.com, oisc.gov.uk, mara.gov.au, college-ic.ca (College of Immigration and Citizenship Consultants — Canada; formerly ICCRC)

**Iterations:** 6

---

## Note schemas

**ORGANISATION note:**
```markdown
---
type: organisation
legal_name:
short_name:
country:
scope:                    # short description of what they actually do
official_url:
verification_search_url:
typical_cost_zar_or_native:
saica_mra_partner: [yes | no | not_applicable]
designation_granted:
what_they_do_not_do:      # critical for avoiding scope creep / misrepresentation
contact_channels:
evidence_strength: confirmed | alleged | rumoured
tags: [organisation, accounting, work-abroad, [country_code]]
sources:
  -
---

# Legal Name

Plain-language summary: what this organisation is, what it grants, who it serves, what it costs.

## What They Do
Concrete services and outputs.

## What They Do NOT Do
Common misconceptions that cause buyers to pay for the wrong service or expect the wrong outcome.

## How to Contact
Email, phone, online portal — primary-source URLs only.

## Connections
- [[SAICA]] — partner_via_mra, source: [url]
- [[Visa Route]] — required_for, source: [url]

## Sources
- [Source title](url)
```

**GOVERNMENT BODY note:**
```markdown
---
type: government_body
name:
short_name:
category: [department | regulator | tax_authority | immigration_authority]
jurisdiction: [National | Provincial | State]
country:
relevant_to_sa_accountants:
official_url:
verification_search_url:
evidence_strength: confirmed | alleged | rumoured
tags: [government, accounting, work-abroad, [country_code]]
sources:
  -
---

# Body Name

Summary of what they regulate and how that affects an SA accountant moving to this country.

## What an SA Accountant Uses This For
Concrete use case (visa application, tax-agent registration, AML/CFT regulation, etc.).

## Connections
- [[Destination]] — regulates_in, source: [url]

## Sources
- [Source title](url)
```

**SA MIGRATION SUPPORT COMPANY note:**
```markdown
---
type: sa_support_company
legal_name:
short_name:
country: South Africa
service_scope: []          # apostille | saqa_concierge | full_immigration_consulting | tax | recruitment
typical_fee_range_zar:
oisc_or_mara_registered: [yes | no | not_applicable]
official_url:
verification_search_url:   # CIPC search URL
known_alternatives: []
evidence_strength: confirmed | alleged | rumoured
tags: [sa-support, accounting, work-abroad]
sources:
  -
---

# Company Name

What they do for SA accountants, what they charge, and what they do NOT do (scope clarity).

## Services & Fees
| Service | Fee range (ZAR) |
|---|---|
| | |

## Boundary
What they do NOT do — and where an SA accountant must go instead for that service.

## Connections
- [[Document]] — provides_concierge_for, source: [url]
- [[Destination]] — serves, source: [url]

## Sources
- [Source title](url)
```

**EDGE metadata:**
- `relationship_type`: partner_via_mra | regulates_in | requires_registration_with | issues_designation | issues_document | provides_concierge_for | serves | verified_against | impersonated_by_scammers
- `description`: short label
- `date_range`: YYYY–present
- `evidence_strength`: confirmed | alleged | rumoured
- `sources`: at least one URL

---

## Runtime rules

- `evidence_strength`: `confirmed` | `alleged` | `rumoured` — only `confirmed` when the body's own website is fetched and the scope/fee/contact is verified.
- **Every organisation note MUST include a "What They Do NOT Do" section** — scope clarity prevents misuse and defeats scam impersonation patterns.
- **Date-stamp every fee** quoted from a body's own website. Bodies revise fees annually.
- **Distinguish SAICA reciprocity partners from non-partner bodies**: Current SAICA RMA/MRA partners include ICAEW, ICAS, CA ANZ, CPA Canada, Chartered Accountants Ireland (CAI), and NASBA-IQAB (IQEX route). **ACCA is NOT a SAICA reciprocity partner** but IS a UK Recognised Supervisory Body (RSB) for audit. **CAI IS a current SAICA reciprocity partner**. SAIPA has a smaller reciprocity network (notably IPA Australia, IFA GB); CIMA and ACCA are international-by-design designations not requiring SAICA reciprocity at all.
- **CPA Canada is provincially federated** — list provincial bodies (CPA Ontario, CPA BC, CPA Alberta, CPA Quebec, CPA Manitoba, CPA Saskatchewan, CPA Nova Scotia, CPA New Brunswick, etc.) as separate notes where they have distinct registration processes.
- **CPA Australia ≠ CA ANZ**: CPA Australia (cpaaustralia.com.au) provides migration skills assessment under the CPA designation path; CA ANZ is the SAICA-MRA partner. Both are legitimate but serve different routes.
- **Tax-agent registration is separate**: TPB Australia (tpb.gov.au), NZ Inland Revenue, HMRC (UK) tax-agent rules, IRS / state boards (US) — list as separate notes from the designation bodies.
- **AML/CFT regulators**: AUSTRAC (AU), FINTRAC (CA), HMRC AML (UK), CBI (Ireland) — list because accountants in public practice in destination must register with the local AML regulator. Often missed.
- **SA migration support companies** must include "What They Do NOT Do" — Sable does NOT provide MRA support to bodies; Apostil does NOT submit MRA applications; FinGlobal does NOT do immigration applications (financial emigration only). Scope clarity is what prevents scam patterns.
- **Include verification search URLs** on every note so the buyer can independently confirm legitimacy.
- **CIPC search must appear on SA migration support company notes** so buyers can verify SA-side company registration.
- Folder structure: `Organisations/`, `Government Bodies/`, `SA Support Companies/`
