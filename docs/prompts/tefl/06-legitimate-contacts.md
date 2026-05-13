# Prompt: TEFL — Legitimate Contacts & Official Links

> Run with `/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-tefl-06-contacts`

---

/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-tefl-06-contacts

**Goal:** Build a verified directory of legitimate TEFL programme operators (EPIK, SMOE, GEPIK, JET, Auxiliares de Conversación), destination labour / immigration authorities, accredited TEFL certificate issuers (Cambridge CELTA, Trinity CertTESOL, Ofqual-regulated Level 5 providers), SA-side service providers (DIRCO, SAQA, SAPS) and any reputable SA / international recruiters where applicable — with scope, official URLs, application fee, and known reputation signals.

**Seed entities:**
- EPIK (English Program in Korea — Korean Ministry of Education programme; SMOE handled as a regional placement under EPIK rather than a separate direct-application channel)
- JET Programme (Japan — administered collaboratively by MIC, MOFA, MEXT, CLAIR; SA candidates apply via the Embassy of Japan in South Africa)
- Auxiliares de Conversación (Spanish Ministry of Education / Acción Educativa Exterior — verify SA passport eligibility against the current call before listing as open to SA candidates)
- Cambridge Assessment English (CELTA issuing body — formerly Cambridge English Language Assessment / now part of Cambridge University Press & Assessment)
- Trinity College London (Trinity CertTESOL issuing body)
- Ofqual Register of Regulated Qualifications (UK qualifications regulator — regulates qualifications and awarding organisations, NOT TEFL course providers directly)
- DIRCO Legalisation Service (SA-side apostille or authentication, depending on destination's Apostille Convention status)
- SAQA (Individual Verification Letter for SA-issued degrees; evaluation service is for foreign qualifications)
- Saudi MOFA + Saudi Cultural Mission (Saudi-side attestation — required only where employer/authority demands a step on top of the DIRCO apostille, since Saudi joined the Apostille Convention in 2022)

**Source constraints:** epik.go.kr (including EPIK's official recruiting partners / MOU page), smoe.sen.go.kr (Seoul placement info under EPIK), jetprogramme.org + Embassy of Japan in South Africa JET application page, aee.educacionfpydeportes.gob.es (Spain Acción Educativa Exterior — Auxiliares eligibility list), cambridgeenglish.org (CELTA centres directory), trinitycollege.com, register.ofqual.gov.uk (Ofqual Register of Regulated Qualifications), dirco.gov.za, saqa.org.za, dhet.gov.za + umalusi.org.za, saps.gov.za, mofa.gov.sa + embassies.mofa.gov.sa (Saudi MOFA mission pages — replaces older ksa.embassy.org.za reference), hrsd.gov.sa + qiwa.sa (Saudi MHRSD work-permit framework), mohre.gov.ae, mofa.gov.ae (UAE MOFAIC), khda.gov.ae and adek.gov.ae (UAE teacher licensing), icp.gov.ae and gdrfad.gov.ae, Vietnam Decree 219/2025/ND-CP via chinhphu.vn / vbpl.vn + dichvucong.gov.vn + provincial People's Committees, fuwu.most.gov.cn (China MOST Foreigner Work Permit portal — replaces SAFEA), nia.gov.cn, mfa.gov.cn, visaforchina.cn, Korea Visa Portal (visa.go.kr) + hikorea.go.kr + Embassy of Korea in South Africa, hcch.net (Apostille Convention status table), Department of Employment and Labour (labour.gov.za — private employment agency registration under the Employment Services Act), CIPC (cipc.co.za) for SA company verification, OISC register (gov.uk/find-an-immigration-adviser) for UK-side advisers if any SA candidate uses one, HelloPeter and TrustPilot for SA company reputation (flag as `alleged`)

**Iterations:** 6

---

## Note schemas

**PROGRAMME OPERATOR note:** (government-run TEFL programmes — EPIK, JET, Auxiliares, SMOE, GEPIK)
```markdown
---
type: programme_operator
name:
short_name:
country:
operator_type: [government_programme | metro_office | bilateral_agreement]
official_url:
sa_candidates_accepted: [yes | no | conditional]
sa_specific_requirements: []
intake_schedule:
typical_contract_length_months:
salary_or_stipend_range:
benefits_included: []
application_fee: [Free | Amount]
known_reputation: [official | well_documented_in_use | newer]
evidence_strength: confirmed | alleged | rumoured
tags: [programme, tefl, work-abroad, contact]
sources:
  -
---

# Programme Operator Name

What this programme is, who runs it, and how an SA candidate applies directly (no agent needed).

## Application Process
End-to-end from the official application page. Include deadlines.

## What This Programme Pays / Provides
Salary or stipend, housing, flight, insurance, end-of-contract terms.

## SA-Specific Notes
Any extra SA-applicant requirement (e.g. EPIK English-medium schooling letters).

## Connections
- [[Destination]] — operates_in, source: [url]
- [[Visa Route]] — sponsors_via, source: [url]

## Sources
- [Source title](url)
```

**ACCREDITATION BODY note:** (Cambridge, Trinity, Ofqual)
```markdown
---
type: accreditation_body
name:
short_name:
jurisdiction:
official_register_url:
what_is_accredited: [celta | trinity_certtesol | ofqual_level_5_diploma | other_tefl_cert]
how_to_verify_a_cert:
evidence_strength: confirmed
tags: [accreditation-body, tefl, certificate-verification]
sources:
  -
---

# Body Name

What this body accredits, why employers and visa offices accept it, and how an SA candidate can verify a specific certificate against this register.

## How to Verify a Certificate
Step-by-step from the official register page.

## Connections
- [[TEFL Certificate]] — accredits, source: [url]

## Sources
- [Source title](url)
```

**SA-SIDE SERVICE note:** (DIRCO, SAQA, SAPS, SA-based CELTA centres)
```markdown
---
type: sa_side_service
name:
short_name:
category: [authentication | qualification_evaluation | police_clearance | embassy | training_provider]
official_url:
service_for_tefl_applicants:
processing_time:
cost_zar:
evidence_strength: confirmed | alleged | rumoured
tags: [sa-side, tefl, service, contact]
sources:
  -
---

# Service Name

What this body does for an SA TEFL applicant, where to access the service, and current cost / processing time.

## Connections
- [[Document]] — provides, source: [url]
- [[Authentication Step]] — performs, source: [url]

## Sources
- [Source title](url)
```

**GOVERNMENT BODY note:** (destination embassies, labour authorities, immigration ministries)
```markdown
---
type: government_body
name:
short_name:
country:
category: [embassy | consulate | labour_authority | immigration_ministry | foreign_experts_authority]
jurisdiction: [National | Provincial | Municipal]
relevant_function_for_tefl:
sa_office_address:
contact_url:
evidence_strength: confirmed | alleged | rumoured
tags: [government, tefl, contact]
sources:
  -
---

# Body Name

What this body does, where its SA office is (if any), and how an SA TEFL applicant interacts with it.

## Connections
- [[Visa Route]] — administers, source: [url]

## Sources
- [Source title](url)
```

**RECRUITER / SERVICE COMPANY note:** (where named)
```markdown
---
type: organisation
legal_name:
trading_name:
cipc_registered: [yes | no | unknown]
entity_type: [tefl_recruiter | certificate_provider | apostille_concierge | translation_service]
destinations_covered: []
fee_model: [free_candidate | placement_fee_charged | course_revenue]
contact_url:
known_complaints_documented: [yes | no | not_assessed]
evidence_strength: confirmed | alleged | rumoured
tags: [organisation, tefl-recruiter, sa-side, contact]
sources:
  -
---

# Organisation Name

What they do for SA TEFL candidates, which destinations they cover, and their fee model.

## Fee Structure
Who pays — candidate, employer, or revenue from course sales. Note that charging a candidate a placement fee is illegal in SA; flag any recruiter whose model is unclear on this.

## Reputation Signals
HelloPeter / TrustPilot / Reddit summary. If none found, state "No documented complaints found as at [date]."

## Connections
- [[Destination]] — places_teachers_in, source: [url]

## Sources
- [Source title](url)
```

**EDGE metadata:**
- `relationship_type`: operates_in | accredits | administers | places_teachers_in | required_before | provides | performs | sponsors_via | partners_with
- `description`: short label
- `evidence_strength`: confirmed | alleged | rumoured
- `sources`: at least one URL

---

## Runtime rules

- `evidence_strength`: `confirmed` | `alleged` | `rumoured`.
- **Programme operators are the safest contact path** — surface EPIK (direct + EPIK's published official recruiting partners), JET via Embassy of Japan in South Africa, and Spain Auxiliares (only if SA eligibility is confirmed against the current Acción Educativa Exterior call) as the recommended primary contacts. Document the direct application URL for each.
- **EPIK / SMOE / GEPIK clarification** — EPIK's national programme accepts direct applications and works with official recruiting partners listed on epik.go.kr. SMOE placements go via EPIK's preference system, not a separate SMOE direct-application route. Treat GEPIK as legacy unless the current Gyeonggi Provincial Office of Education page documents a separate live channel; if not, fold GEPIK into EPIK regional placements.
- **JET administration is collaborative** — Japan's Ministry of Internal Affairs and Communications (MIC), Ministry of Foreign Affairs (MOFA), Ministry of Education (MEXT), and CLAIR jointly run JET; the Embassy of Japan in South Africa handles SA-side recruitment.
- **Distinguish programme operators (government-run, free, primary contact) from recruiters (private, commercial, optional)** — same way nursing distinguishes destination regulators from recruiters.
- **SA-side mandatory services** — DIRCO (apostille or authentication, depending on destination Apostille Convention status), SAQA (Individual Verification Letter for SA-issued degrees), SAPS (criminal record check) are typically required for any TEFL applicant going to Korea / Saudi / Vietnam / China. Exact requirements vary by visa, employer, and document origin — surface the variation in the per-destination notes.
- **Apostille Convention status anchors the DIRCO path** — refer to hcch.net status table. Vietnam-bound documents need DIRCO authentication + Vietnamese consular legalisation until **11 September 2026** when the Convention enters force for Vietnam. Saudi and China bound documents use DIRCO apostille (Saudi since Dec 2022, China since Nov 2023).
- **TEFL certificate accreditation lookups** — every TEFL certificate the guide mentions must point to its issuing-body register (Cambridge Assessment English for CELTA, Trinity College London for CertTESOL, Ofqual Register of Regulated Qualifications for named Ofqual-regulated Level 5 qualifications with awarding organisation + qualification number). A reader must be able to verify their certificate themselves in under 5 minutes. Note that Ofqual regulates qualifications and awarding organisations, not TEFL course providers directly.
- **Recruiter listings need a clear fee-model line** — under SA law, charging a job-seeker a placement fee is regulated by the Employment Services Act (labour.gov.za). Add `registered_private_employment_agency: [yes | no | unknown]` and check the Department of Employment and Labour register. Any recruiter not transparent about whether the candidate or the employer pays should be flagged.
- **Confirmed-source list** — programme-operator, government, and accredited awarding-body URLs (Cambridge, Trinity, Ofqual) all go to `confirmed`. Industry blogs (tefl.org, teflheaven.com, teflinstitute.com) are `alleged` until primary-verified.
- **No Facebook groups or WhatsApp-only contacts** — exclude. They are channels for the Fake Job Offer Scam pattern.
- **Treat OISC / MARA / Law Society Ireland boundary lightly** — TEFL destinations are not UK / AU / Ireland, so the regulated immigration-advice constraints from those wikis do not apply directly. Keep the "information not advice" framing per project house style.
- Folder structure: `Programme Operators/`, `Accreditation Bodies/`, `SA-Side Services/`, `Government/`, `Organisations/`
