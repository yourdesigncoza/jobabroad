# Prompt: Engineering — Legitimate Contacts & Official Links

> Run with `/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-engineering-06-contacts`

---

/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-engineering-06-contacts

**Goal:** Build a verified directory of legitimate destination engineering authorities and skills-assessment bodies, official immigration portals, and SA-based engineering-focused recruiters and support organisations that a South African engineer can contact with confidence — with scope, contact details, fee model, and any red flags clearly noted.

**Seed entities:**
- Engineers Australia — Migration Skills Assessment authority for engineering occupations
- Engineering New Zealand — engineering competence assessment and the CPEng / Chartered Membership pathways
- NZQA — New Zealand Qualifications Authority, which runs the International Qualification Assessment for overseas qualifications
- Engineering Council UK (EngC) — Chartered / Incorporated Engineer registration
- ECSA — Engineering Council of South Africa (statutory body; degree accreditation and the international Accords)
- Move Up — SA-based recruiter matching SA engineers with UK sponsoring employers
- WES — World Education Services (Educational Credential Assessment body for Canada)
- Engineers Ireland — professional title recognition

**Source constraints:** engineersaustralia.org.au, engineeringnz.org, nzqa.govt.nz (NZ International Qualification Assessment), engc.org.uk, ecsa.co.za, engineersireland.ie, wes.org, canada.ca (including the IRCC designated-ECA-organisations page to verify WES status), engineerscanada.ca and provincial / territorial engineering regulators (e.g. PEO, EGBC, APEGA), immi.homeaffairs.gov.au, enterprise.gov.ie, gov.uk (including the UK Register of Worker and Temporary Worker licensed sponsors), immigration.govt.nz, ieagreements.org (Accord signatory verification), cipc.co.za (SA company registry), immigrationadviceauthority.gov.uk (UK Immigration Advice Authority register — replaced the OISC), mara.gov.au (OMARA — the Office of the Migration Agents Registration Authority register), labour.gov.za (SA Department of Employment and Labour — Employment Services Act, work-seeker fee legality), HelloPeter and LinkedIn (flag as anecdotal for reputation signals)

**Iterations:** 6

---

## Note schemas — apply to every note created

**ENGINEERING AUTHORITY note** (regulators, skills-assessment bodies, official portals):
```markdown
---
type: engineering_authority
name:
short_name:
country:
authority_type: [skills_assessment_body | professional_regulator | immigration_authority | accreditation_signatory]
profession_scope: engineering
registration_or_assessment_portal_url:
overseas_applicant_guidance_url:
sa_specific_guidance_url:
processing_time_official:
processing_time_reported:
cost_destination_currency:
evidence_strength: confirmed
tags: [engineering-authority, engineering, work-abroad]
sources:
  -
---

# Authority Name

What this body does, why an SA engineer interacts with it, and what the process involves.

## SA Engineer Process
Step-by-step from the official overseas-applicant guidance.

## Real Processing Times
Official vs reported real-world (cite forums as anecdotal).

## Connections
- [[Visa Route]] — required_before, source: [url]
- [[ECSA]] — recognises, source: [url]

## Sources
- [Source title](url)
```

**ORGANISATION note** (recruiters, document concierges, support organisations):
```markdown
---
type: organisation
legal_name:
trading_name:
cipc_registered: [yes | no | unknown]
entity_type: [engineering_recruiter | document_concierge | immigration_consultant | support_organisation]
scope:
destinations_covered: []
iaa_or_omara_registered: [yes | no | not_applicable]
initial_consultation_fee: [Amount ZAR | Free]
fee_model: [engineer_pays | employer_pays | milestone | not_applicable]
contact_url:
evidence_strength: confirmed | alleged | rumoured
tags: [organisation, engineering-recruiter, work-abroad]
sources:
  -
---

# Organisation Name

What they do for SA engineers, which destinations they cover, and their fee model. The `scope:` field must state plainly what they do and do not do.

## Services for SA Engineers
Specific services (skills-assessment guidance, CV placement, job matching, visa support, document handling).

## Fee Structure
Who pays — engineer or employer. Charging a work-seeker a placement fee is restricted under SA law; note if the model is unclear on this.

## Reputation Signals
HelloPeter / LinkedIn summary. If none found, state "No documented complaints found as at [date]."

## Connections
- [[Destination]] — places_engineers_in, source: [url]
- [[Engineering Authority]] — partners_with, source: [url]

## Sources
- [Source title](url)
```

**EDGE metadata (record on every direct verifiable connection):**
- `relationship_type`: required_before | recognises | places_engineers_in | registered_with | partners_with | accredits
- `description`: short label
- `evidence_strength`: confirmed | alleged | rumoured
- `sources`: at least one URL

---

## Runtime rules for vault-builder

- `evidence_strength`: `confirmed` | `alleged` | `rumoured`
- Every note and every connection must cite at least one source URL
- Distinguish mandatory non-commercial authorities (Engineers Australia, ECSA, immigration portals) from optional commercial recruiters and consultants — the buyer must not confuse the two
- The `scope:` field on every ORGANISATION note must clearly state what the organisation does and does not do, so the buyer knows exactly what they would be paying for
- Charging a work-seeker a placement fee is restricted under SA law — flag any recruiter whose fee model is unclear on this
- Date-stamp all processing times and fees — these change
- Verify Accord signatory claims against ieagreements.org — do not rely on a body's own marketing copy alone
- This product signposts IAA-registered advisers (UK — the Immigration Advice Authority, which replaced the OISC) and OMARA-registered migration agents (Australia) for individual cases; it does not itself give regulated immigration advice
- Folder structure: `Engineering Authorities/`, `Organisations/`

<!--
## Canvas export (on-demand only — do not generate unless explicitly requested)
-->
