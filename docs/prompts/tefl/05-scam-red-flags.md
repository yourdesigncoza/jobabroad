# Prompt: TEFL — Scam Red Flags

> Run with `/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-tefl-05-scams`

---

/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-tefl-05-scams

**Goal:** Build a TEFL-specific reference of scam and fraud patterns targeting South African TEFL applicants in 2025–2026 — covering recruiter fraud, fake "guaranteed placement" course-seller packages, unaccredited TEFL certificates, passport-holding on arrival, mid-contract school closures (China / Vietnam), and the verification tools an SA candidate can use to confirm a legitimate employer, programme, or certificate.

**Seed entities:**
- Fake "guaranteed placement" R20–30k recruitment packages (SA-based agents who only forward CVs)
- Unaccredited TEFL certificate scam (certificates not verifiable against Cambridge / Trinity / Ofqual registers)
- Passport-holding on arrival (low-end Chinese, Vietnamese, Cambodian private academies)
- Mid-contract Chinese private-school closures (chronic since 2021 regulatory reset)
- Fake EPIK / SMOE / JET recruiter (impersonates official programme operator)
- Upfront "visa processing fee" scam targeting Gulf / Vietnam applicants

**Source constraints:** epik.go.kr (official application is FREE — anyone charging is suspect; also use EPIK's published list of official recruiting partners / MOU agencies as the trust anchor), visa.go.kr and hikorea.go.kr (Korean E-2 visa is teacher-paid via consulate, not via recruiter), Embassy of Korea in South Africa (overseas.mofa.go.kr/zaf-en/), aee.educacionfpydeportes.gob.es (Spain Acción Educativa Exterior — verify SA is on the current eligible-countries list before claiming Auxiliares is open to SA candidates), Embassy of Japan in South Africa JET page + jetprogramme.org, cambridgeenglish.org (Cambridge Assessment English — CELTA accreditation verification), trinitycollege.com (Trinity CertTESOL register), register.ofqual.gov.uk (Ofqual Register of Regulated Qualifications — verify by qualification title + awarding organisation + qualification number, not "provider"), southafrica.embassy.gov.au (AU High Commission scam warnings), gov.za / saps.gov.za (SA Police Service reporting channels), labour.gov.za (SA Department of Employment and Labour — private employment agency registration, Employment Services Act), safps.org.za (Southern African Fraud Prevention Service), cipc.co.za (SA company verification), fuwu.most.gov.cn (China MOST Foreigner Work Permit portal — replaces SAFEA for employer verification), gsxt.gov.cn (China National Enterprise Credit Information Publicity System for school/employer existence), mohre.gov.ae (UAE labour authority for employer verification), hrsd.gov.sa + qiwa.sa (Saudi employer/work-permit verification), HelloPeter, TrustPilot, Reddit r/TEFL and r/teachinginkorea (flag as `alleged`), TEFL.org and TEFL Institute blog warnings (flag as `alleged` industry sources)

**Iterations:** 6

---

## Note schemas

**SCAM PATTERN note:**
```markdown
---
type: scam_pattern
name:
aliases: []
category: [fake_recruiter | guaranteed_placement | unaccredited_certificate | passport_holding | mid_contract_closure | upfront_visa_fee | fake_programme_impersonator | qualification_fraud]
target_destination: []
channels: [facebook | whatsapp | linkedin | indeed | email | in_person | zoom_teams | tefl_course_provider_upsell]
typical_fee_requested_zar:
reporting_channel_sa:
reporting_channel_destination:
evidence_strength: confirmed | alleged | rumoured
tags: [scam, tefl, fraud, sa-specific]
sources:
  -
---

# Scam Pattern Name

How this scam specifically targets SA TEFL candidates — what makes it different from generic work-abroad fraud and how it exploits TEFL-specific assumptions (e.g. "I need someone to find me a job in Korea" → guaranteed-placement upsell).

## How It Works
Step-by-step from first contact to money / passport / data loss.

## Red Flags Specific to TEFL
- Flag 1
- Flag 2
- Flag 3

## How to Verify
Specific actionable check for TEFL (e.g. "Apply to EPIK directly at epik.go.kr — no SA agent is needed. Anyone charging a placement fee is selling CV-forwarding."). Link to the official register or programme page.

## Where to Report
- **In SA:** [SAPS / labour.gov.za / DIRCO consular fraud / etc.]
- **In destination country:** [embassy / Action Fraud / local labour authority / etc.]

## Reported Instances
Known documented cases (date, source, outcome if known). Distinguish official warnings from forum threads.

## Connections
- [[Verification Method]] — countered_by, source: [url]

## Sources
- [Source title](url)
```

**VERIFICATION METHOD note:**
```markdown
---
type: verification_method
name:
description:
applicable_destinations: []
applicable_to_scam: []
official_register_url:
how_to_use:
time_to_perform_minutes:
evidence_strength: confirmed
tags: [verification, tefl, scam-protection]
sources:
  -
---

# Verification Method Name

What this check proves and how an SA TEFL candidate performs it in under 5 minutes.

## Step-by-Step
1.
2.
3.

## What "Pass" and "Fail" Look Like
What a legitimate result looks like vs. what a scam result looks like.

## Connections
- [[Scam Pattern]] — counters, source: [url]

## Sources
- [Source title](url)
```

**UNVERIFIABLE TEFL PROVIDER note:** (special schema — unaccredited cert sellers are a major TEFL-specific risk)
```markdown
---
type: unverifiable_tefl_provider
name:
website:
claimed_accreditation:
verifiable_in: [cambridge_celta_register | trinity_register | ofqual_register | none]
known_complaints: []
evidence_strength: alleged
tags: [unverifiable, tefl-certificate, scam-risk]
sources:
  -
---

# Provider Name

Why this provider's certificate may not pass employer / visa verification, and which destinations are most likely to reject it.

## Connections
- [[Scam Pattern: Unaccredited Certificate]] — exemplifies, source: [url]

## Sources
- [Source title](url)
```

**EDGE metadata:**
- `relationship_type`: countered_by | targets | reported_in | verified_via | documented_by | exemplifies | impersonates
- `description`: short label
- `evidence_strength`: confirmed | alleged | rumoured
- `sources`: at least one URL

---

## Runtime rules

- `evidence_strength`: `confirmed` | `alleged` | `rumoured` — distinguish official warnings (EPIK, embassies, SAPS, MOHRE) from anecdotal forum reports.
- **Never name an individual provider or recruiter as fraudulent unless either (a) named in an official government / embassy / labour-authority warning, or (b) the subject of a published court / regulator action.** Forum complaints alone do not justify naming. Use category-level descriptions instead.
- **Apply to EPIK directly is free** — this is a positive verification anchor. EPIK applications go via epik.go.kr (direct submission) or via EPIK's published official recruiting partners / MOU agencies. Any SA-based agent NOT on EPIK's official recruiter list charging a "placement fee" is selling CV-forwarding, not employment. Surface this prominently and link the EPIK recruiter list.
- **Auxiliares de Conversación SA eligibility** — confirm against aee.educacionfpydeportes.gob.es current eligible-countries list. If SA is NOT listed, do not state the programme is "free for SA candidates." If listed, the official Ministry programme is free; SA-side agents charging to "secure" a placement are fraudulent.
- **JET Programme application is free** — applied directly via Embassy of Japan in South Africa + jetprogramme.org. Same anchor.
- **TEFL certificate verifiability** — every verification method note must link to the live issuer's register URL (Cambridge, Trinity, Ofqual). Note that **Vietnam Decree 219/2025/ND-CP** governs work permits (document and qualification requirements); the teacher qualification standard for foreign teachers is set by **MOET Circular 21/2018/TT-BGDDT** and subsequent updates. Quote the right rule when describing what Vietnamese authorities check. Generic / unverifiable TEFL certs carry rejection risk in Vietnam and increasingly in China and the Gulf.
- **Passport-holding flag** — legitimate employers may need the passport briefly to apply for the work permit office; they should never hold it indefinitely. Refusing to return the passport is a serious red flag. Cross-reference local labour-authority reporting channel.
- **Mid-contract closure pattern (China)** — China private-school sector has had chronic mid-contract closures since the 2021 "double reduction" policy. Document the pattern and the mitigation: check the school exists on **fuwu.most.gov.cn** (MOST Foreigner Work Permit portal — supersedes SAFEA), cross-check on **gsxt.gov.cn** (National Enterprise Credit Information Publicity System), and verify local education-bureau school licensing.
- **Course-seller upsell scam** — TEFL course providers are NOT employers. Treat any "course + job guarantee" package as suspect. Course-only is fine; course-plus-guarantee is the red flag.
- **Avoid duplicating wa-shared-scams** — the generic Fake Job Offer Scam pattern lives in the shared vault. This vault focuses on TEFL-specific variants only.
- **Single-source rule for naming** — naming a provider requires a primary source (government warning, court record, regulator action, named in an embassy fraud bulletin). Forum allegations stay at `alleged` and unnamed.
- **Ofqual scope** — Ofqual regulates qualifications and awarding organisations, not TEFL course providers directly. The `unverifiable_tefl_provider` schema's `verifiable_in` field should reflect this: a Cambridge CELTA is verifiable via the Cambridge register; a Trinity CertTESOL via Trinity; an Ofqual-regulated Level 5 diploma via Ofqual with the awarding organisation + qualification number; any other recognised awarding body is `other_recognised_awarding_body`; otherwise `not_applicable`.
- Folder structure: `Scam Patterns/`, `Verification Methods/`, `Unverifiable Providers/`
