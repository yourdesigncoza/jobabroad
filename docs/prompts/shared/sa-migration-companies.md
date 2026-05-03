# Prompt: SA Migration Companies

> Run with `/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-shared-migration-cos`

---

/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-shared-migration-cos

**Goal:** Build a verified directory of legitimate South African companies and individuals that assist SA professionals with working abroad — covering their services, pricing (including consultation fees and success fee structure), regulated status, professions served, and destination coverage, so they can be referenced as vetted contacts in category guides.

**Seed entities:**
- Sable International
- Apostil.co.za
- FinGlobal
- Intergate Emigration
- Breytenbachs (dominant UK-focused SA firm)
- New Way (Australia / NZ specialist)
- Global Nurse Force (healthcare recruiter)
- Pulse Staffing (healthcare recruiter)
- Move Up (UK engineering recruiter)

**Source constraints:** company websites, CIPC company registry (cipc.co.za), OISC register (gov.uk/find-an-immigration-adviser), MARA register (mara.gov.au), HelloPeter.com for complaint patterns, TrustPilot for international-facing firm reviews, LinkedIn company pages, News24/Daily Maverick business coverage, any credible SA consumer publication

**Iterations:** 15

---

## Note schemas

**ORGANISATION note:**
```markdown
---
type: organisation
legal_name:
trading_name:
registration_number:
cipc_registered: [yes | no | unknown]
entity_type: [immigration_consultant | document_concierge | recruiter | expat_tax | legal_firm | healthcare_recruiter | mixed]
founded:
headquarters:
oisc_registered: [yes | no | not_applicable]
mara_registered: [yes | no | not_applicable]
services: []
professions_served: []
destinations_covered: []
initial_consultation_fee: [Amount ZAR | Free]
pricing_range_zar:
success_fee_structure: [fixed | percentage | milestone | not_applicable]
contact_url:
evidence_strength: confirmed | alleged | rumoured
tags: [organisation, sa-migration, work-abroad, vetted]
sources:
  -
---

# Company Legal Name

2–4 sentence factual summary: what they do, who they serve, how long they've operated.

## Services
Bullet list of specific services offered with pricing where known.

## Regulated Status
OISC / MARA / Law Society registration status and verification link.

## Professions & Destinations
Which professions they specialise in and which destination countries they cover.

## Fees
- Initial consultation: [amount or free]
- Full service range: [ZAR range]
- Success fee structure: [fixed / percentage / milestone]

## Red Flags or Complaints
Any documented complaints, HelloPeter or TrustPilot patterns, or regulatory actions. State source and date. If none found, state "No documented complaints found as at [date]."

## Connections
- [[Destination Country]] — operates_in, source: [url]
- [[Regulatory Body]] — registered_with, source: [url]

## Sources
- [Source title](url)
```

**PERSON note (key advisers/founders only if publicly documented):**
```markdown
---
type: person
full_name:
aliases: []
role_type: [immigration_adviser | tax_adviser | recruiter | founder]
affiliation: "[[organisation_name]]"
oisc_level: [1 | 2 | 3 | not_applicable]
evidence_strength: confirmed | alleged | rumoured
tags: [person, sa-migration, adviser]
sources:
  -
---

# Full Name

Short factual summary of role and public profile.

## Connections
- [[Organisation]] — employed_by | founded, source: [url]

## Sources
- [Source title](url)
```

**EDGE metadata:**
- `relationship_type`: registered_with | operates_in | founded_by | employed_by | partners_with | competes_with | specialises_in
- `description`: short label
- `evidence_strength`: confirmed | alleged | rumoured
- `sources`: at least one URL

---

## Runtime rules

- `evidence_strength`: `confirmed` | `alleged` | `rumoured` — distinguish verified registration from claimed status
- Only include companies with verifiable SA presence (CIPC registration or established web presence with contact details)
- Flag any company with documented complaints or regulatory action — do not exclude, but document honestly
- Check both HelloPeter AND TrustPilot — some international-facing firms have no HelloPeter presence
- Date-stamp all pricing — it changes
- Folder structure: `Organisations/`, `People/`
