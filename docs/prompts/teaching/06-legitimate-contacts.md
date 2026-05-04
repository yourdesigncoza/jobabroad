# Prompt: Teaching — Legitimate Contacts & Official Links

> Run with `/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-teaching-06-contacts`

---

/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-teaching-06-contacts

**Goal:** Build a verified directory of legitimate destination regulators, official UK/Australia/NZ teacher recruitment channels, and SA-based teaching-specific recruiters and support organisations that a South African school teacher can contact with confidence — with scope, contact details, fee model, and any red flags clearly noted.

**Seed entities:**
- DfE QTS digital service (UK Department for Education — free online QTS application from August 2025; gov.uk/guidance/qualified-teacher-status-qts)
- AITSL (Australian Institute for Teaching and School Leadership — mandatory migration skills assessment authority for teacher visas to Australia; note: classroom registration is done by state/territory teacher regulators, not AITSL)
- Teaching Council of Aotearoa New Zealand (Matatū Aotearoa — NZ teacher registration for overseas applicants)
- SACE (South African Council for Educators — Letter of Good Standing and registration certificate)
- UK ENIC / Ecctis (formerly UK NARIC — Statement of Comparability for SA qualifications against English standards; UK's national recognition service, delivered by Ecctis)

**Source constraints:** gov.uk/guidance/qualified-teacher-status-qts, apply-for-qts-in-england.education.gov.uk, getintoteaching.education.gov.uk/non-uk-teachers/teach-in-england-if-you-trained-overseas, teaching-vacancies.service.gov.uk, gov.uk/register-of-licensed-sponsors, gov.uk/find-an-immigration-adviser, sace.org.za, aitsl.edu.au, teachingcouncil.nz, nzqa.govt.nz, ecctis.com, homeaffairs.gov.au, tes.com, eteach.com, reed.co.uk/jobs/teaching, cipc.co.za, HelloPeter, TrustPilot, SA teacher expat communities such as "SA Teachers Abroad" (flag as anecdotal)

**Iterations:** 6

---

## Note schemas

**DESTINATION REGULATOR note:**
```markdown
---
type: destination_regulator
name:
short_name:
country:
profession_regulated: school teaching
registration_portal_url:
overseas_applicant_guidance_url:
sa_specific_guidance_url:
processing_time_official:
processing_time_reported:
cost_destination_currency:
evidence_strength: confirmed
tags: [destination-regulator, teaching, work-abroad]
sources:
  -
---

# Destination Regulator Name

What this body does, why an SA teacher must engage with them, and what the process involves.

## SA Teacher Registration / Recognition Process
Step-by-step from the official overseas applicant guidance. Note any subject or phase restrictions that affect SA qualifications.

## Real Processing Times
Official vs. reported real-world times (cite expat forums as anecdotal).

## Connections
- [[Visa Route]] — required_before, source: [url]
- [[SACE]] — accepts_certificate_from, source: [url]

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
entity_type: [teaching_recruiter | document_concierge | immigration_consultant | support_organisation]
destinations_covered: []
iaa_registered: [yes | no | not_applicable]  # IAA = Immigration Advice Authority (formerly OISC, renamed January 2025)
scope:
initial_consultation_fee: [Amount ZAR | Free]
success_fee_structure: [teacher_pays | employer_pays | milestone | not_applicable]
contact_url:
evidence_strength: confirmed | alleged | rumoured
tags: [organisation, teaching-recruiter, work-abroad]
sources:
  -
---

# Organisation Name

What they do for SA teachers, which destinations they cover, and their fee model.

## Services for SA Teachers
Specific services offered (qualification recognition guidance, CV placement, visa support, school matching, etc.).

## Fee Structure
Who pays — teacher or employer. Note whether the organisation charges the teacher or the hiring school. Any recruiter charging SA teachers a placement or "shortlisting" fee should be flagged.

## Reputation Signals
HelloPeter / TrustPilot summary. If none found, state "No documented complaints found as at [date]."

## Connections
- [[Destination]] — places_teachers_in, source: [url]

## Sources
- [Source title](url)
```

**EDGE metadata:**
- `relationship_type`: required_before | accepts_certificate_from | places_teachers_in | registered_with | partners_with | administers | warns_against
- `description`: short label
- `evidence_strength`: confirmed | alleged | rumoured
- `sources`: at least one URL

---

## Runtime rules

- Date-stamp all costs, thresholds, and occupation-list statuses — these change annually
- Flag any closed or suspended routes explicitly as [CLOSED - do not recommend]
- Never present agent estimates as confirmed figures; source must be a government or regulator URL
- If a source is older than 12 months, flag evidence_strength as alleged unless confirmed by a recent primary source
- Distinguish destination regulators (mandatory, non-commercial) from recruiters (optional, commercial)
- Date-stamp processing times and fees — these change
- **Licensed Sponsor verification:** Any teacher recruiter placing candidates in UK schools should only work with schools on the gov.uk Register of Licensed Sponsors (filter: Education sector). Recruiters who cannot confirm the school's sponsor status should be flagged
- **SACE pre-conditions:** The SACE Letter of Good Standing requires the teacher to have taught in SA for ≥1 year after qualifying. Recruiters who do not mention this requirement are likely insufficiently informed about the SA-to-UK pathway — flag as a red flag for quality
- **QTS subject restriction awareness:** Legitimate recruiters targeting the DfE Apply for QTS route should note that subject/age restrictions apply to SA teachers NOT already in a valid teaching role in England (shortage subjects: Maths, Science, Languages, ages 11–16). Recruiters promising QTS for all subjects and phases without this caveat are either misinformed or misleading
- **DfE QTS is free (professional recognition route):** Legitimate organisations do not charge for DfE Apply for QTS applications. Charge for "QTS assistance" or "QTS application processing" is a red flag — flag any such service. Note: assessment-only QTS and training programmes charge separately
- **Fee model:** In SA, charging a work-seeker a placement fee is governed by the Employment Services Act 4 of 2014, section 15 — not the Labour Relations Act. Flag any recruiter whose fee model is unclear or where the candidate bears a cost the employer should cover
- **UK immigration adviser registration:** Legitimate immigration advisers practising in the UK must be registered with the Immigration Advice Authority (IAA, formerly OISC) or be a regulated legal professional (SRA, BSB, CILEx). Verify via gov.uk/find-an-immigration-adviser
- Folder structure: `Destination Regulators/`, `Organisations/`

<!--
## Canvas export (on-demand)
Generate canvas only when user explicitly requests "generate canvas".
-->
