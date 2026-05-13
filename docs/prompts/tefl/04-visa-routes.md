# Prompt: TEFL — Visa Routes

> Run with `/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-tefl-04-visa-routes`

---

/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-tefl-04-visa-routes

**Goal:** Build a current, source-verified reference of every visa / work-permit route available to South African TEFL teachers in 2025–2026 — covering Korea E-2, Saudi Arabia Iqama, UAE Employment Visa, Vietnam Work Permit + TRC (under Decree 219/2025/ND-CP), China Z-visa, and Spain Auxiliares — with eligibility, processing times, employer sponsorship roles, residency / PR pathways (where they exist), and recent policy changes that affect SA applicants.

**Seed entities:**
- Korea E-2 Foreign Language Instructor Visa (under Korean Ministry of Justice; programme NOA from EPIK / SMOE / GEPIK or Visa Issuance Number from hagwon)
- Saudi Arabia Iqama / Work Residency under Saudi MOFA + GOSI registration
- UAE Employment Visa (employer-sponsored under MOHRE; KHDA permit for Dubai school teachers)
- Vietnam Work Permit (LĐ) + Temporary Residence Card (TRC) under Decree 219/2025/ND-CP (effective 7 Aug 2025)
- China Notification Letter of Foreigner's Work Permit → Z-visa → Foreigner's Work Permit → work-type Residence Permit (administered via the MOST Foreigner Work Permit service portal; SAFEA/Foreign Expert Certificate naming is legacy)
- Spain Auxiliares de Conversación visa (student-assistant; programme-issued NIE letter)

**Source constraints:** epik.go.kr, visa.go.kr and hikorea.go.kr (Korean E-2 visa application + 7-nation list), moj.go.kr (Korean Ministry of Justice / Korea Immigration Service), Embassy of Korea in South Africa (overseas.mofa.go.kr/zaf-en/), mofa.gov.sa and embassies.mofa.gov.sa (Saudi MOFA + Saudi Cultural Mission attestation pages), hrsd.gov.sa + qiwa.sa (MHRSD Saudi work-permit framework), absher.sa / muqeem.sa / jawazat (Iqama issuance), mohre.gov.ae (UAE work permits), khda.gov.ae and adek.gov.ae (UAE school teacher licensing), icp.gov.ae and gdrfad.gov.ae (UAE Identity / GDRFA Dubai residence), mofa.gov.ae (UAE MOFAIC attestation), Vietnam Decree 219/2025/ND-CP via chinhphu.vn / vbpl.vn (official gazette text), molisa.gov.vn (Vietnamese Ministry of Labour, Invalids and Social Affairs), dichvucong.gov.vn (Vietnam National Public Service Portal) + provincial People's Committees / Public Administration Service Centers, mfa.gov.cn (Chinese MFA Z-visa), fuwu.most.gov.cn (China MOST Foreigner Work Permit service portal — replaces SAFEA), nia.gov.cn (China National Immigration Administration / Exit-Entry), visaforchina.cn, aee.educacionfpydeportes.gob.es (Spain MEFD Acción Educativa Exterior — verify SA eligibility), exteriores.gob.es (Spanish Consulate visa pages), hcch.net (Apostille Convention status), gov.uk (general SA passport reference where relevant)

**Iterations:** 8

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
employer_sponsorship_required: [yes | no]
programme_sponsorship_route: [yes — operator | no | optional]
degree_required: [yes | no | preferred]
tefl_certificate_required: [yes — hours | no | preferred]
language_requirement_native: [yes | no | conditional]
language_test_alternative_for_non_natives: [IELTS_score | TOEFL_score | not_applicable]
age_minimum:
age_maximum_official:
age_maximum_practical:
sa_specific_extra_requirement:
processing_time_official:
processing_time_reported:
initial_visa_duration_months:
renewable: [yes | no | conditional]
pr_pathway: [yes — route | no]
pr_timeline:
last_policy_change:
last_policy_change_date:
official_url:
evidence_strength: confirmed | alleged | rumoured
tags: [visa-route, tefl, work-abroad]
sources:
  -
---

# Visa Route Name

Plain-language summary: what this visa is, who it is for, current status, and the single biggest gotcha for an SA applicant.

## Eligibility for SA Teachers
Specific requirements that apply to SA-qualified TEFL teachers — degree, TEFL hours, native-speaker status, age, criminal record, and any SA-specific extra (e.g. EPIK English-medium schooling letters).

## Application Process (SA Side → Embassy → Arrival)
End-to-end sequence with realistic time per step. Note where the employer / programme operator's role begins (e.g. EPIK issues NOA → teacher applies for E-2 at Korean Consulate Pretoria).

## Current Status & Recent Changes
Any policy change in the last 24 months that affects SA applicants. Cite the decree / regulation / announcement and its effective date.

## PR / Residency Pathway
Whether long-term residency is available, and the practical timeline. For most TEFL destinations PR is not realistic; document this honestly.

## Connections
- [[Destination]] — available_in, source: [url]
- [[Programme Operator]] — sponsors_via, source: [url]
- [[Government Body]] — administered_by, source: [url]

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
impact_on_sa_teachers:
source_document:
evidence_strength: confirmed | alleged | rumoured
tags: [policy-change, visa, tefl, work-abroad]
sources:
  -
---

# Policy Change: [Short Description]

What changed, when, and what it means for an SA TEFL teacher applying now.

## Before vs After
| | Before | After |
|---|---|---|
| Qualification requirement | | |
| TEFL hours required | | |
| Document list | | |
| Translation requirement | | |
| Native-speaker rule | | |

## Connections
- [[Visa Route]] — affects, source: [url]

## Sources
- [Source title](url)
```

**GOVERNMENT BODY note:**
```markdown
---
type: government_body
name:
short_name:
category: [department | embassy | consulate | regulatory_body | labour_authority]
country:
jurisdiction: [National | Provincial | Municipal]
relevant_function_for_tefl:
contact_url:
evidence_strength: confirmed | alleged | rumoured
tags: [government, tefl, visa, work-abroad]
sources:
  -
---

# Body Name

What this body does and how it intersects with the SA TEFL applicant's journey.

## Connections
- [[Visa Route]] — administers, source: [url]
- [[Destination]] — operates_in, source: [url]

## Sources
- [Source title](url)
```

**EDGE metadata:**
- `relationship_type`: available_in | administers | sponsors_via | replaced_by | replaced | affects | pr_leads_to | requires_attestation_from | issued_by
- `description`: short label
- `date_range`: YYYY–present or YYYY–YYYY (if closed)
- `evidence_strength`: confirmed | alleged | rumoured
- `sources`: at least one URL

---

## Runtime rules

- `evidence_strength`: `confirmed` | `alleged` | `rumoured`
- **Vietnam Decree 219/2025/ND-CP** effective 7 Aug 2025 — replaced Decree 152/2020/ND-CP and Decree 70/2023. Quote the decree number and date. Foreign-worker processing is now devolved to provincial People's Committees and Public Administration Service Centers. There is no single national "Department of Overseas Labour" handling foreign teacher work permits.
- **Korea E-2 SA-specific clause** — SA applicants must submit letters from each school proving English-medium instruction from grade 7 through university. This is the single most-missed requirement. Surface it on the E-2 visa note explicitly.
- **Apostille Convention changes the Saudi / China chains:**
  - **Saudi Arabia** acceded effective 7 Dec 2022 — SA documents may use SAQA Individual Verification Letter → DIRCO apostille. Saudi Cultural Mission / Embassy / MOFA in-country attestation is required only where a specific Saudi employer or authority demands it on top of apostille (document case-by-case, do not assume universal).
  - **China (mainland)** acceded effective 7 Nov 2023 — DIRCO apostille is now accepted by mainland authorities for SA public documents.
  - **Vietnam Apostille Convention** not in force for Vietnam until **11 September 2026** — until then use DIRCO authentication + Vietnamese consular legalisation chain.
- **UAE attestation** — UAE requires MOFA UAE attestation (mofa.gov.ae). Dubai school teachers also need KHDA permit; Abu Dhabi teachers need ADEK approval. Document both.
- **No realistic PR pathway** — for Korea / Saudi / UAE / Vietnam / China, long-term residency is theoretically possible (F-series visas in Korea after years; Saudi premium residence) but not realistic for a TEFL teacher's profile. Document honestly — do not oversell.
- **Spain Auxiliares de Conversación SA eligibility** — confirm against the current Acción Educativa Exterior call. If SA is not on the eligible-countries list, mark route restricted; do not state Spain Auxiliares is open to SA candidates without primary-source confirmation. Spain Auxiliares does not lead to residency in any case.
- **Native-speaker / 7-nation rule is Korea-E-2-specific.** Do NOT describe it as a binary global rule. UAE, Saudi, China, and Vietnam handle "native English" via employer policy, school accreditation rules, and (for non-natives in Vietnam) IELTS 6.5+ alternatives. Confirm per destination from primary sources.
- **Age caps** — Korea E-2 has no universal statutory age cap; "62" is an EPIK / public-school programme cap. China and Gulf practical caps vary by school/employer, not by visa. Document programme cap vs visa cap separately.
- **Online teaching is out of scope** — this route covers in-country teaching only.
- **Single-source rule** — visa codes, durations, and processing times must come from a primary government source (embassy, ministry, immigration department). Industry summaries are `alleged`.
- **Closed / restricted routes** — flag any route confirmed closed (e.g. if China private-school sectors hit a regulatory pause) as `[CLOSED — do not recommend]` with the policy source.
- Folder structure: `Visa Routes/`, `Policy Changes/`, `Government/`
