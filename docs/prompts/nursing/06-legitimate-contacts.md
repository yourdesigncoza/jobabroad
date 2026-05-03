# Prompt: Nursing — Legitimate Contacts & Official Links

> Run with `/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-nursing-06-contacts`

---

/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-nursing-06-contacts

**Goal:** Build a verified directory of legitimate destination regulators, official NHS/hospital recruitment programmes, and SA-based nursing-specific recruiters and support organisations that an SA nurse can contact with confidence — with scope, contact details, and any red flags clearly noted.

**Seed entities:**
- NMC (Nursing and Midwifery Council — UK)
- AHPRA (Australian Health Practitioner Regulation Agency)
- NMBI (Nursing and Midwifery Board of Ireland)
- NHS England International Recruitment programme
- Global Nurse Force (SA-based healthcare recruiter)
- Pulse Staffing (SA-based healthcare recruiter)
- SANC (SA Nursing Council — certificate of good standing process)

**Source constraints:** nmc.org.uk, ahpra.gov.au, nmbi.ie, england.nhs.uk/international-recruitment, nhsemployers.org, company websites, CIPC (cipc.co.za), OISC register (gov.uk/find-an-immigration-adviser), HelloPeter, TrustPilot, LinkedIn, "Nurses on the Move" and similar SA nursing communities for company reputation signals (flag as anecdotal)

**Iterations:** 10

---

## Note schemas

**DESTINATION REGULATOR note:**
```markdown
---
type: destination_regulator
name:
short_name:
country:
profession_regulated: nursing
registration_portal_url:
overseas_applicant_guidance_url:
sa_specific_guidance_url:
processing_time_official:
processing_time_reported:
cost_destination_currency:
evidence_strength: confirmed
tags: [destination-regulator, nursing, work-abroad]
sources:
  -
---

# Destination Regulator Name

What this body does, why an SA nurse must register with them, and what the process involves.

## SA Nurse Registration Process
Step-by-step from the official overseas applicant guidance.

## Real Processing Times
Official vs. reported real-world (cite expat forums as anecdotal).

## Connections
- [[Visa Route]] — required_before, source: [url]
- [[SANC]] — accepts_certificate_from, source: [url]

## Sources
- [Source title](url)
```

**ORGANISATION note:**
```markdown
---
type: organisation
legal_name:
trading_name:
cipc_registered: [yes | no | unknown]
entity_type: [nursing_recruiter | document_concierge | immigration_consultant | support_organisation]
destinations_covered: []
oisc_registered: [yes | no | not_applicable]
initial_consultation_fee: [Amount ZAR | Free]
success_fee_structure: [nurse_pays | employer_pays | milestone | not_applicable]
contact_url:
evidence_strength: confirmed | alleged | rumoured
tags: [organisation, nursing-recruiter, work-abroad]
sources:
  -
---

# Organisation Name

What they do for SA nurses, which destinations they cover, and their fee model.

## Services for SA Nurses
Specific services (registration guidance, CV placement, visa support, etc.).

## Fee Structure
Who pays — nurse or employer. Charging the nurse a placement fee is illegal in SA; note if this applies.

## Reputation Signals
HelloPeter / TrustPilot summary. If none found, state "No documented complaints found as at [date]."

## Connections
- [[Destination]] — places_nurses_in, source: [url]

## Sources
- [Source title](url)
```

**EDGE metadata:**
- `relationship_type`: required_before | accepts_certificate_from | places_nurses_in | registered_with | partners_with
- `description`: short label
- `evidence_strength`: confirmed | alleged | rumoured
- `sources`: at least one URL

---

## Runtime rules

- `evidence_strength`: `confirmed` | `alleged` | `rumoured`
- Note that charging a nurse a placement fee is illegal under SA law — flag any recruiter whose model is unclear on this
- Distinguish destination regulators (mandatory, non-commercial) from recruiters (optional, commercial)
- Date-stamp processing times and fees — these change
- Folder structure: `Destination Regulators/`, `Organisations/`
