# Prompt: TEFL — Destination Options

> Run with `/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-tefl-01-destinations`

---

/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-tefl-01-destinations

**Goal:** Map the realistic TEFL destination options for a South African passport-holder in 2025–2026 — covering which countries explicitly accept SA candidates as "native English speakers," which have current open hiring pipelines, which are degree-required vs. degree-optional, and an honest assessment of earning potential, lifestyle, and route status per destination.

**Seed entities:**
- South Korea EPIK / GEPIK / SMOE programmes (E-2 Foreign Language Instructor visa; 7-nation native English list including SA)
- Saudi Arabia Vision 2030 ELT expansion (Iqama employment under Saudi MOFA, tax-free Gulf package)
- UAE TEFL market (KHDA Dubai schools authority, Employment Visa)
- Vietnam Decree 219/2025/ND-CP work-permit framework (Hanoi / HCMC / Da Nang centres + international schools)
- Spain Ministerio de Educación Auxiliares de Conversación programme (stipend-based, non-salary route)

**Source constraints:** epik.go.kr (eligibility + intake schedule), visa.go.kr and hikorea.go.kr (E-2 visa rules), the Embassy of Korea in South Africa (overseas.mofa.go.kr/zaf-en/ for SA-side issuance), khda.gov.ae (Dubai schools), adek.gov.ae (Abu Dhabi schools), mohre.gov.ae (UAE Ministry of Human Resources and Emiratisation), mofa.gov.ae (UAE MOFAIC attestation), mofa.gov.sa (Saudi MOFA), hrsd.gov.sa and qiwa.sa (Saudi MHRSD work-permit framework), Vietnam Decree 219/2025/ND-CP text via chinhphu.vn and Vietnam National Public Service Portal (dichvucong.gov.vn) + provincial People's Committees, fuwu.most.gov.cn (China MOST Foreigner Work Permit service portal), mfa.gov.cn (Chinese MFA Z-visa guidance), educacionfpydeportes.gob.es (Spain MEFD Auxiliares programme — verify SA eligibility), gov.uk (general SA passport reference), hcch.net (Apostille Convention party / effective-date status table), tefl.org and teflinstitute.com (industry references — flag as `alleged` unless confirmed via primary), cambridgeenglish.org (CELTA centre directory + accreditation status)

**Iterations:** 8

---

## Note schemas

**DESTINATION note:**
```markdown
---
type: destination
country:
sa_passport_accepted_as_native: [yes | no | conditional]
sa_specific_caveat:
primary_visa_route: "[[visa_route_name]]"
secondary_visa_routes: []
salary_range_usd_monthly:
typical_employer_covers: [housing | flight | health_insurance | end_of_contract_bonus]
degree_required: [yes | no | preferred]
typical_tefl_cert_required: [120hr | celta_level_5 | trinity_certtesol | any_accredited]
age_practical_ceiling:
route_status: [open | restricted | closed | emerging]
last_signal_date:
evidence_strength: confirmed | alleged | rumoured
tags: [destination, tefl, work-abroad]
sources:
  -
---

# Country Name

2–4 sentences: why SA TEFL teachers go here, current demand level, realistic assessment of pay vs. lifestyle vs. accessibility for an SA candidate specifically.

## Demand Signal
Quantified evidence — programme intake sizes, school-group hiring pages, current vacancy volumes. Date every figure.

## SA-Specific Eligibility Notes
What an SA applicant must prove that a US/UK applicant does not — e.g. EPIK's grade-7-to-university English-medium schooling letter, Saudi MOFA degree attestation chain, Vietnam Vietnamese-translated docs.

## Realistic Assessment
Honest appraisal: who this destination suits (degreed vs non-degreed, younger vs older, savings-focused vs lifestyle), and which candidates should look elsewhere.

## Connections
- [[Visa Route]] — accessed_via, source: [url]
- [[Programme Operator]] — administered_by, source: [url]

## Sources
- [Source title](url)
```

**PROGRAMME OPERATOR note:** (use for EPIK, JET, Auxiliares, SMOE — government-run programmes, not regulators)
```markdown
---
type: programme_operator
name:
short_name:
country:
operator_type: [government_programme | metro_office | private_recruiter_chain]
official_url:
sa_candidates_accepted: [yes | no | conditional]
sa_specific_requirements: []
intake_schedule:
typical_contract_length_months:
salary_range:
benefits_included: []
application_fee: [Free | Amount]
evidence_strength: confirmed | alleged | rumoured
tags: [programme, tefl, work-abroad]
sources:
  -
---

# Programme Operator Name

What this programme is, who runs it, and whether SA candidates can apply directly.

## SA Application Process
Specific steps for an SA applicant — link to the official application page, list the deadlines, and note any SA-specific document required.

## What the Programme Pays
Base salary + housing + flight + bonus structure with currency and date.

## Connections
- [[Destination]] — operates_in, source: [url]
- [[Visa Route]] — sponsors, source: [url]

## Sources
- [Source title](url)
```

**EDGE metadata:**
- `relationship_type`: accessed_via | administered_by | operates_in | sponsors | accepts_sa_candidates | restricted_to_native_list
- `description`: short label
- `date_range`: YYYY–present
- `evidence_strength`: confirmed | alleged | rumoured
- `sources`: at least one URL

---

## Runtime rules

- `evidence_strength`: `confirmed` | `alleged` | `rumoured`
- **The 7-nation native English list is Korea-E-2-specific** (USA, Canada, UK, Ireland, AUS, NZ, South Africa). Do NOT generalise it as a global TEFL rule. Gulf and Vietnam acceptance of SA candidates is employer/programme-specific and primary-source-verifiable per destination.
- **EPIK SA-specific catch:** South African applicants must submit letters from each school proving English-medium instruction from grade 7 through university. Flag this in EPIK / SMOE destination notes.
- **Vietnam Decree 219/2025/ND-CP** became effective 7 Aug 2025 and replaces Decree 152/2020 + Decree 70/2023 for new applications. Transitional documents may still apply; confirm against current chinhphu.vn / vbpl.vn text. Foreign-worker processing is now devolved to provincial People's Committees and Public Administration Service Centers, NOT a single national "Department of Overseas Labour."
- **Tax-free Gulf packages** — distinguish gross salary from comparable taxed take-home for SA candidates (SARS foreign income exemption cap R1.25M applies; check sars.gov.za for current threshold).
- **Date-stamp all salaries** (KRW, SAR, AED, USD, VND) with the month/year of the source; FX moves fast.
- **Age caps** — Korea E-2 has no universal statutory age cap; the "62" figure is an EPIK / public-school programme cap. Document the EPIK programme cap separately from any visa-level cap.
- **Japan JET** is competitive but accessible to SA candidates via the Embassy of Japan in South Africa (jetprogramme.org + the embassy page). Flag it as competitive, not low-feasibility.
- **Hong Kong NET Scheme** is administered by the HK Education Bureau (edb.gov.hk); SA eligibility narrow but verifiable on the official scheme page.
- **Spain Auxiliares de Conversación** — confirm SA eligibility against the current MEFD / Acción Educativa Exterior (aee.educacionfpydeportes.gob.es) eligible-countries list before treating as an open route. If SA is not on the official list for the current cycle, mark the route restricted and document the actual programme channels open to South Africans.
- **Single-source rule** — a salary or visa fact only counts as `confirmed` if the primary government / programme operator / awarding-body source is fetched and the claim is found there. Industry blogs (tefl.org, teflheaven.com, teflinstitute.com) are `alleged` until primary-verified.
- Never present any "guaranteed placement" course-seller package as a legitimate destination route — those are commercial products, not destinations.
- Folder structure: `Destinations/`, `Programme Operators/`
