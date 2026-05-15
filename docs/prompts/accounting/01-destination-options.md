# Prompt: Accounting — Destination Options

> Run with `/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-accounting-01-destinations`

---

/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-accounting-01-destinations

**Goal:** Map the realistic 2025–2026 destination options for South African accountants and finance professionals (CA(SA), SAIPA, CIMA, ACCA holders), with primary emphasis on the UK, Australia, Canada, Ireland, and New Zealand — including how the SAICA reciprocity / RMA / MRA network (ICAEW, ICAS, CA ANZ, CPA Canada, Chartered Accountants Ireland (CAI), NASBA-IQAB) changes which routes are actually accessible, and which routes are blocked (e.g. UK statutory audit rights / Audit Qualification under the FRC-recognised framework).

**Seed entities:**
- SAICA reciprocity / RMA / MRA network 2025–2026 status (ICAEW, ICAS, CA ANZ, CPA Canada, Chartered Accountants Ireland (CAI), NASBA-IQAB)
- ICAEW UK pathway for SAICA members (icaew.com/membership/becoming-a-member/members-of-other-bodies)
- CA ANZ SAICA RMA route to Australia / NZ designation (charteredaccountantsanz.com)
- CPA Canada Reciprocal Membership Agreement + provincial registration (cpacanada.ca + CPA provincial bodies)
- UK statutory audit rights / Audit Qualification under FRC-recognised framework via Recognised Supervisory Bodies (ICAEW, ACCA, ICAS, CAI) — the audit ceiling for SAICA members

**Source constraints:** saica.org.za/members/member-networks/reciprocity-and-affiliations/, icaew.com (members-of-other-bodies SAICA page), icas.com (ICAS — UK; SAICA RMA partner), charteredaccountantsanz.com (membership pathways via RMA), cpacanada.ca (Internationally-trained accountants / MRA), cpaontario.ca, cpabc.ca, cpaalberta.ca, cpaquebec.ca (CPA provincial bodies — Canada provincial registration), charteredaccountants.ie (Chartered Accountants Ireland — note CPA Ireland amalgamated into CAI 1 Sept 2024), cpaaustralia.com.au (CPA Australia — migration skills assessment for non-SAICA route), publicaccountants.org.au (IPA Australia — recognises SAIPA), nasba.org/saica/, iqab.nasba.org, frc.org.uk (Audit Qualification framework + Recognised Supervisory Bodies list), gov.uk/skilled-worker-visa, gov.uk/government/publications/skilled-worker-visa-going-rates-for-eligible-occupations (SOC 2421/2422 going rates), homeaffairs.gov.au (Skills in Demand 482, ENS 186, Core Skills Occupation List — CSOL), immigration.govt.nz (AEWV, Green List Tier 2), canada.ca/en/immigration-refugees-citizenship.html (Express Entry, NOC 11100/10010), enterprise.gov.ie (CSEP Critical Skills Occupations List for finance/accounting)

**Iterations:** 8

---

## Note schemas

**DESTINATION note:**
```markdown
---
type: destination
country:
sa_diaspora_size:
sa_accountant_demand_signal:
primary_visa_route: "[[visa_route_name]]"
secondary_visa_routes: []
saica_mra_partner_body: "[[partner_body_name_or_none]]"
mra_route_status: [confirmed | restricted | none]
non_mra_route_required_for: []
route_status: [open | restricted | closed | emerging]
last_signal_date:
evidence_strength: confirmed | alleged | rumoured
tags: [destination, accounting, finance, work-abroad]
sources:
  -
---

# Country Name

2–4 sentences: why SA accountants go here, current demand level, MRA shortcut available or not.

## Demand Evidence
Quantified signals — finance/accounting roles on shortage/priority lists, permit numbers issued to SA nationals where available, top recruiting employers.

## MRA Shortcut Available?
Which SAICA MRA covers this country (if any), what it grants (full membership, no exam), and what it does NOT cover (e.g. UK Audit Qualification).

## Realistic Assessment for SA Accountants
Honest appraisal: how realistic is this route in 2025–2026 for CA(SA) holders, SAIPA holders, CIMA holders, ACCA holders separately.

## Connections
- [[Visa Route]] — accessed_via, source: [url]
- [[Destination Regulator]] — regulated_by, source: [url]
- [[SAICA MRA Partner]] — recognised_via, source: [url]

## Sources
- [Source title](url)
```

**PROFESSIONAL BODY note:**
```markdown
---
type: professional_body
name:
short_name:
country:
saica_mra_partner: [yes | no]
mra_terms:
mra_last_renewed:
designation_granted:
exams_required_for_sa_ca: [none | conversion_exam | full_qualification]
application_fee:
official_url:
evidence_strength: confirmed | alleged | rumoured
tags: [professional-body, accounting, [country-code]]
sources:
  -
---

# Body Name

Plain-language summary: what designation this body issues, who it covers (members/non-members), and whether SAICA holds an MRA with it.

## SAICA MRA Details
If MRA exists: what document evidence SA CAs submit, current application fee, average processing time, ceiling on practice rights (e.g. UK AQ exclusion).

## Connections
- [[Destination]] — operates_in, source: [url]
- [[SAICA]] — partner_via_mra, source: [url]

## Sources
- [Source title](url)
```

**GOVERNMENT BODY note:**
```markdown
---
type: government_body
name:
short_name:
category: [department | regulator | tax_authority]
jurisdiction: [National | Provincial | State]
relevant_to_sa_accountants:
official_url:
evidence_strength: confirmed | alleged | rumoured
tags: [government, accounting, [country-code]]
sources:
  -
---

# Body Name

Summary of what they regulate and how that affects an SA accountant moving to this country.

## Connections
- [[Destination]] — regulates_in, source: [url]

## Sources
- [Source title](url)
```

**EDGE metadata:**
- `relationship_type`: accessed_via | regulated_by | recognised_via | requires_registration_with | partner_via_mra | operates_in | regulates_in | excluded_from
- `description`: short label
- `date_range`: YYYY–present
- `evidence_strength`: confirmed | alleged | rumoured
- `sources`: at least one URL

---

## Runtime rules

- `evidence_strength`: `confirmed` | `alleged` | `rumoured` — only set `confirmed` if fetched from a primary source (saica.org.za, icaew.com, icas.com, charteredaccountantsanz.com, cpacanada.ca, charteredaccountants.ie, nasba.org, or destination government domain).
- **Date-stamp every reciprocity / RMA / MRA status** — agreements are renewed periodically (e.g. SAICA-NASBA renewed April 2026); flag any agreement whose last public confirmation date is more than 24 months old as `evidence_strength: alleged`. **Note CPA Ireland amalgamated into Chartered Accountants Ireland (CAI) effective 1 September 2024** — for any pre-Sept-2024 source citing "CPA Ireland MRA", verify the current CAI-side position.
- **UK statutory audit rights ceiling**: Every UK destination note MUST explicitly state that SAICA reciprocity does NOT grant UK Audit Qualification / statutory audit signing rights. AQ is conferred via Recognised Supervisory Bodies (ICAEW, ACCA, ICAS, CAI) under the FRC-recognised framework, not directly by FRC. This is a recurring misconception.
- **CPA Canada is provincial**: never describe CPA Canada membership as "complete" without naming the provincial registration step (CPA Ontario, CPA BC, CPA Alberta, CPA Quebec, etc.).
- **Distinguish SAICA from SAIPA, CIMA, ACCA**: SAIPA has a smaller / limited reciprocity network (notably IPA Australia, IFA Great Britain) — flag the scope honestly; do NOT claim SAIPA has zero reciprocity. CIMA and ACCA are internationally portable independent of SAICA — flag this as a separate route.
- **Australia visa-list nomenclature**: For 482 / 186 visa eligibility, the operative list is the **Core Skills Occupation List (CSOL)**, not the "Skills Priority List" (which is Jobs and Skills Australia's labour-market ranking, separate from immigration). Use CSOL.
- Flag any closed/suspended agreement explicitly as `[CLOSED — do not recommend]`.
- Do not present agency estimates (Sable, Apostil) as confirmed facts for body application fees — fees must come from the body's own website.
- Folder structure: `Destinations/`, `Professional Bodies/`, `Government Bodies/`
