# Prompt: TEFL — Document Checklist

> Run with `/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-tefl-02-documents`

---

/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-tefl-02-documents

**Goal:** Build a sequenced, source-verified document checklist for a South African TEFL applicant — covering every document from SA-side preparation through TEFL certificate accreditation through destination-side apostille and embassy attestation, with realistic processing times, costs, and the specific traps that delay SA applicants for Korea, the Gulf, Vietnam, and China.

**Seed entities:**
- SAPS Criminal Record Check (Police Clearance Certificate)
- DIRCO Apostille Service (Hague Convention apostille on SA documents)
- SAQA degree evaluation (South African Qualifications Authority — required by some destinations)
- CELTA / Trinity CertTESOL / Ofqual Level 5 TEFL Diploma (accredited certificate)
- EPIK Notice of Appointment (NOA) → Korean E-2 visa application
- Saudi MOFA degree attestation chain (DIRCO → Saudi Embassy Pretoria → Saudi MOFA in country)
- Vietnam work permit dossier under Decree 219/2025/ND-CP (notarised Vietnamese translations required)

**Source constraints:** saps.gov.za (criminal record check application), dirco.gov.za (legalisation / apostille service procedure), saqa.org.za (SA degree Individual Verification Letter for SA-issued degrees; evaluation service is for foreign qualifications), dhet.gov.za and umalusi.org.za (matric / school verification routes referenced by DIRCO), epik.go.kr (NOA + E-2 documents), visa.go.kr and hikorea.go.kr (E-2 document list), Embassy of Korea in South Africa (overseas.mofa.go.kr/zaf-en/), mofa.gov.sa and embassies.mofa.gov.sa (Saudi attestation), hrsd.gov.sa + qiwa.sa (MHRSD work-permit framework), khda.gov.ae and adek.gov.ae (UAE school documents), mofa.gov.ae (UAE MOFAIC attestation), Vietnam Decree 219/2025/ND-CP text via chinhphu.vn / vbpl.vn, dichvucong.gov.vn (Vietnam National Public Service Portal), provincial People's Committees + Public Administration Service Centers, fuwu.most.gov.cn (China MOST Foreigner Work Permit portal — replaces SAFEA), visaforchina.cn and PRC Embassy / Consulates in South Africa, mfa.gov.cn (Chinese MFA), cambridgeenglish.org (CELTA verification — Cambridge Assessment English / Cambridge University Press & Assessment), trinitycollege.com (Trinity CertTESOL register), register.ofqual.gov.uk (Ofqual Register of Regulated Qualifications — verify qualification number + awarding organisation, not "provider"), hcch.net (Apostille Convention party / effective-date status table), teflinstitute.com / tefl.org (industry checklists — flag as `alleged` unless confirmed against primary)

**Iterations:** 6

---

## Note schemas

**DOCUMENT note:**
```markdown
---
type: document
name:
aliases: []
stage: [sa_preparation | sa_authentication | destination_application | embassy_attestation]
issued_by: "[[issuing_body]]"
submitted_to: "[[receiving_body]]"
required_for_destinations: []
processing_time_official:
processing_time_reported:
cost_zar:
cost_destination_currency:
validity_period:
apostille_required: [yes | no | destination_dependent]
embassy_attestation_required: [yes | no | destination_dependent]
translation_required: [yes — language | no]
notarisation_required: [yes | no]
direct_shipping_required: [yes | no | not_applicable]
evidence_strength: confirmed | alleged | rumoured
tags: [document, tefl, work-abroad, checklist]
sources:
  -
---

# Document Name

What this document is, what it proves, and at what stage in the TEFL application process it is needed (apply, before flight, on arrival).

## How to Obtain
Step-by-step from the official issuing body. Include the exact URL of the application page.

## Known Delays & Traps
Real-world processing issues for SA applicants. Note documents that must be obtained in sequence (e.g. SAPS clearance before DIRCO apostille; SAQA evaluation before Saudi MOFA attestation).

## Connections
- [[Issuing Body]] — issued_by, source: [url]
- [[Receiving Body]] — submitted_to, source: [url]

## Sources
- [Source title](url)
```

**TEFL CERTIFICATE note:**
```markdown
---
type: tefl_certificate
name:
issuing_body:
hours:
accreditation_register:
ofqual_level: [3 | 5 | n/a]
in_class_practice_hours:
recognised_by_destinations: []
cost_zar:
cost_gbp_or_usd:
verification_url:
evidence_strength: confirmed | alleged | rumoured
tags: [tefl-certificate, accreditation, documents]
sources:
  -
---

# Certificate Name

What this certificate is, who recognises it, and why an unaccredited substitute will get an SA candidate rejected at the visa stage.

## Recognition Per Destination
Which destinations explicitly accept this certificate vs. which require CELTA / Level 5 minimum.

## Verification
How an employer or visa office verifies this certificate against the issuing body's register.

## Connections
- [[Destination]] — accepted_in, source: [url]
- [[Issuing Body]] — issued_by, source: [url]

## Sources
- [Source title](url)
```

**AUTHENTICATION STEP note:** (apostille / attestation / translation step)
```markdown
---
type: authentication_step
name:
performed_by:
applies_to_documents: []
applies_to_destinations: []
cost_zar:
processing_time_business_days:
where_to_submit:
evidence_strength: confirmed | alleged | rumoured
tags: [authentication, apostille, tefl, documents]
sources:
  -
---

# Authentication Step Name

What this step does, why it is required, and which destinations / documents trigger it.

## Step-by-Step
1.
2.
3.

## Connections
- [[Document]] — authenticates, source: [url]
- [[Destination]] — required_for, source: [url]

## Sources
- [Source title](url)
```

**EDGE metadata:**
- `relationship_type`: issued_by | submitted_to | required_for | precedes | follows | authenticates | translated_into | attested_by
- `description`: short label
- `date_range`: if applicable
- `evidence_strength`: confirmed | alleged | rumoured
- `sources`: at least one URL

---

## Runtime rules

- `evidence_strength`: `confirmed` | `alleged` | `rumoured`
- **SACE is NOT required for TEFL** — explicit statement. Some SA candidates assume SACE is a prerequisite because they hear "teaching." It is not; SACE applies only to formal school-teaching pathways (see the separate `teaching` guide).
- **Apostille Convention status per destination** — confirm against hcch.net (status table):
  - **Saudi Arabia** acceded to the Apostille Convention; effective for SA documents from **7 December 2022**. Default SA route is now SAQA Individual Verification Letter (for SA degrees) → DIRCO apostille. Saudi Embassy / Saudi Cultural Mission attestation only where the specific employer or Saudi authority requires it on top of apostille.
  - **China** (mainland) acceded; effective **7 November 2023**. DIRCO apostille is now accepted by mainland authorities. Hong Kong and Macau have always been Convention parties.
  - **Vietnam** has signed the Apostille Convention but it is **not yet in force for Vietnam until 11 September 2026**. Until then, SA documents for Vietnam require DIRCO authentication + Vietnamese consular legalisation chain. Document this transitional date.
  - **South Korea, UAE, Spain** are Convention parties; apostille route applies.
- **SAQA terminology** — for SA-issued degrees use **SAQA Individual Verification Letter** (verification of SA qualification). SAQA *evaluation* is for foreign qualifications, not SA ones. Do not confuse the two.
- **DIRCO processing time** — varies by submission channel: same-day or 1–2 days for booked individual submissions, 1–2 weeks for registered providers, 3–4 weeks for private courier. DIRCO legalisation/apostille is itself free; courier or concierge service fees are separate.
- **SAQA processing time** — Individual Verification of SA qualification ~25 working days minimum; foreign qualification evaluation ~90 working days.
- **TEFL certificate verifiability** — Vietnamese work-permit authorities and international schools in 2026 verify TEFL certificates against issuer registers. Flag Cambridge CELTA, Trinity CertTESOL, and named Ofqual-regulated qualifications (with awarding organisation + qualification number) as the safe choices. Generic / unverifiable certificates → visa rejection. Note that Ofqual regulates qualifications and awarding organisations, not TEFL course providers directly.
- **Sequence matters** — SAPS clearance before DIRCO apostille/authentication; SAQA Individual Verification Letter before DIRCO legalises a SA degree; for non-Convention destinations, DIRCO step precedes destination embassy attestation.
- **Korea E-2 unique requirement** — SA applicants must submit letters from each school proving English-medium instruction from grade 7 through university. Document this in the EPIK / E-2 path notes.
- **Translation language matters** — Vietnamese (Vietnam), Arabic (Saudi for some documents), Simplified Chinese (China), Korean (some Korea documents). Note per destination.
- **Single-source rule** — fees and processing times are `confirmed` only after fetching the primary issuing body's website and finding the figure there. Industry blogs are `alleged`.
- Folder structure: `Documents/`, `TEFL Certificates/`, `Authentication Steps/`
