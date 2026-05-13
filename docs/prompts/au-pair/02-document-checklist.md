# Prompt: Au Pair — Document Checklist

> Run with `/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-au-pair-02-documents`

---

/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-au-pair-02-documents

**Goal:** Build a sequenced, source-verified document checklist for a South African au-pair candidate — covering every document from SA-side preparation (passport, SAPS PCC, medical, references, childcare evidence, driver's licence + IDP) through DIRCO apostille through sponsor-agency application package through destination-side embassy/consular submission and arrival registration, with realistic processing times, costs, and the specific traps that delay SA candidates for the USA J-1, Netherlands IND, German Federal Foreign Office, and French Préfecture processes.

**Seed entities:**
- SAPS Criminal Record Check (Police Clearance Certificate — required for every au-pair destination)
- DIRCO Apostille Service (Hague Convention apostille — USA, Netherlands, Germany, France all Convention parties)
- IDP (International Driving Permit) issued by Automobile Association of South Africa (AA) — required for USA J-1 + most European host families
- USA J-1 sponsor application dossier (matching profile, video, host-family reference letters, childcare-experience documentation — 200 hrs minimum + 1 yr early-childhood education for Au Pair Extraordinaire)
- Goethe-Institut A1 German certificate (mandatory at German au-pair visa application — verify current fee at goethe.de)
- Netherlands MVV (Machtiging tot Voorlopig Verblijf) provisional residence permit + post-arrival VVR collection at IND
- French CAPAGO visa appointment (Johannesburg + Cape Town — replaced VFS Global as the France-visa SA service provider in 2023) + post-arrival online validation of VLS-TS via the ANEF portal (administration-etrangers-en-france.interieur.gouv.fr) within 3 months of arrival

**Source constraints:** saps.gov.za (criminal record check application — current fee schedule), dirco.gov.za (apostille service procedure + current channel processing times), home-affairs.gov.za (passport application + renewal turnaround), aaa.co.za and aa.co.za (Automobile Association SA — IDP issuance), j1visa.state.gov (US State Dept J-1 designated sponsor search + DS-2019 documents), travel.state.gov (US non-immigrant visa interview document checklist + DS-160), ice.gov/sevis (SEVIS I-901 fee — $35 for au-pair J-1), za.usembassy.gov (US Embassy Pretoria + Consulates Johannesburg / Cape Town / Durban — visa interview procedure), ind.nl (Netherlands MVV + au-pair residence permit document list), www.government.nl (Dutch government documents required for au pair stay), netherlandsworldwide.nl (NL embassy SA — application process), bamf.de (German residence permit policy), southafrica.diplo.de (German Mission SA — au-pair visa info sheet + visa application checklist), goethe.de (Goethe-Institut Johannesburg / Pretoria — A1 exam registration), arbeitsagentur.de (BA au-pair model contract template), france-visas.gouv.fr (French long-stay visa documents), fr-za.capago.eu (CAPAGO South Africa — French visa appointment provider for SA since 2023), service-public.fr (French service-public au-pair Cerfa convention + visa rules — F13348/F15813), administration-etrangers-en-france.interieur.gouv.fr (ANEF — post-arrival VLS-TS online validation), exteriores.gob.es (Spanish consulate au-pair info — secondary), hcch.net (Apostille Convention status table — confirm all four primary destinations are parties), cambridgeenglish.org / ielts.org / toefl.org (English-language certificates if a sponsor agency requires them on top of native-English assumption — flag if surfaced), iapa.org (International Au Pair Association documents standard), culturalcare.co.za / aupairinamerica.co.za / ovc.co.za (SA-side sponsor partner document checklists — tier-3 reference)

**Iterations:** 6

---

## Note schemas

**DOCUMENT note:**
```markdown
---
type: document
name:
aliases: []
stage: [sa_preparation | sa_authentication | sponsor_dossier | embassy_consular | post_arrival]
issued_by: "[[issuing_body]]"
submitted_to: "[[receiving_body]]"
required_for_destinations: [USA | Netherlands | Germany | France | all]
processing_time_official:
processing_time_reported:
cost_zar:
cost_destination_currency:
validity_period:
apostille_required: [yes | no | destination_dependent]
embassy_attestation_required: [yes | no | destination_dependent]
translation_required: [yes — language | no]
notarisation_required: [yes | no]
must_be_under_X_months_old: [yes — months | no]
evidence_strength: confirmed | alleged | rumoured
tags: [document, au-pair, work-abroad, checklist]
sources:
  -
---

# Document Name

What this document is, what it proves, and at what stage in the au-pair application process it is needed (sponsor agency review, MVV application, visa interview, arrival registration).

## How to Obtain
Step-by-step from the official issuing body. Include the exact URL of the application page and the current fee.

## Known Delays & Traps
Real-world processing issues for SA au-pair candidates. Note documents that must be obtained in sequence (e.g. SAPS PCC before DIRCO apostille; Goethe-Institut A1 certificate before German visa appointment booking; passport with 6+ months validity before any visa application).

## Connections
- [[Issuing Body]] — issued_by, source: [url]
- [[Receiving Body]] — submitted_to, source: [url]

## Sources
- [Source title](url)
```

**AUTHENTICATION STEP note:** (DIRCO apostille; OFII medical; sponsor-agency vetting; embassy interview)
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
sequence_position: [step number — e.g. "Step 2 of 5"]
evidence_strength: confirmed | alleged | rumoured
tags: [authentication, apostille, au-pair, documents]
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

**LANGUAGE CERTIFICATE note:** (Goethe-Institut A1 for Germany; French A1+ for France; English assumed for USA/NL)
```markdown
---
type: language_certificate
name:
language:
level: [A1 | A2 | B1 | B2 | C1]
issuing_body:
required_for_destination:
required_at_stage: [visa_application | sponsor_application | not_required]
official_exam_centre_in_sa: []
cost_zar:
cost_local_currency:
validity_period:
verification_url:
evidence_strength: confirmed | alleged | rumoured
tags: [language-certificate, au-pair, documents]
sources:
  -
---

# Certificate Name

What this certificate is, who recognises it for au-pair purposes, and where in SA an applicant takes the exam.

## Connections
- [[Destination]] — required_for, source: [url]
- [[Visa Route]] — prerequisite_for, source: [url]

## Sources
- [Source title](url)
```

**EDGE metadata:**
- `relationship_type`: issued_by | submitted_to | required_for | precedes | follows | authenticates | translated_into | attested_by | prerequisite_for
- `description`: short label
- `date_range`: if applicable
- `evidence_strength`: confirmed | alleged | rumoured
- `sources`: at least one URL

---

## Runtime rules

- `evidence_strength`: `confirmed` | `alleged` | `rumoured`
- **SAQA is NOT required for au-pair work** — au pair has no qualification recognition step. Some candidates assume SAQA evaluation is needed because they have a childcare diploma; it is NOT a requirement for the au-pair visa. SAQA may be optional if the candidate wants to claim Au Pair Extraordinaire status in the USA (which requires 1 yr early-childhood education), but the standard route does not need it.
- **SACE is NOT required for au-pair work** — au pair is not formal teaching. Mention explicitly because SA candidates with teaching diplomas often ask this.
- **All four primary destinations (USA, Netherlands, Germany, France) are Apostille Convention parties** — confirm against hcch.net status table:
  - USA: party since 15 October 1981
  - Netherlands: party since 8 October 1965
  - Germany: party since 13 February 1966
  - France: party since 24 January 1965
  - South Africa: party since 30 April 1995
  - Therefore the standard SA-side document chain is **SAPS PCC → DIRCO Apostille → sponsor / embassy submission**. No additional embassy attestation needed for these four. Make this anchor explicit — saves SA candidates from being upsold attestation steps they do not need.
- **DIRCO apostille itself is free** — model courier or concierge service fees separately, not as an "apostille fee."
- **SAPS PCC** — verify current official fee at saps.gov.za (recent rate: R190; the older R150 figure is outdated); official processing approximately 15 working days from receipt at SAPS Criminal Record Centre, but real-world backlogs can extend to 8 weeks. Concierge services (~R350–700) reduce courier time but do NOT reduce SAPS turnaround.
- **Driver's licence + IDP** — IDP issued by **AA South Africa (Automobile Association)** is the recognised body; cost ~R380 (verify aa.co.za current rate); valid 1 year; must accompany original SA driver's licence (not replace it).
- **USA J-1 specific document traps:**
  - DS-160 must list the sponsor agency name + SEVIS number from the DS-2019
  - SEVIS I-901 fee of **USD $35** applies to au-pair J-1 (NOT $220 — that figure applies to intern/trainee/teacher J-1 only); verify ice.gov/sevis FAQ
  - MRV interview fee is currently USD $185 (the $160 → $185 increase took effect in 2023); verify za.usembassy.gov current schedule
  - SA Reciprocity Fee: **$0** for J-1 issuance per travel.state.gov reciprocity table for South Africa
  - 200 hrs documented childcare experience is the baseline requirement; **placement with children under 2** additionally requires documented infant-specific childcare hours (sponsors typically require 200+ hrs explicitly with under-2s); 2 references with phone numbers (sponsor will call)
  - For Au Pair Extraordinaire: 1 year early-childhood education proof
  - Psychometric screening administered by Cultural Care / AIFS / Au Pair in America
- **Netherlands IND document traps:**
  - **Never previously held a NL au-pair permit** — single attempt per lifetime
  - **Must be unmarried, have no children, and not be related to the host family** — verify exact wording against ind.nl current page
  - MVV application is done by the IND-recognised sponsor on the candidate's behalf via TEV-procedure; the candidate cannot apply direct
  - On approval, candidate visits NL embassy in Pretoria for the MVV sticker, then collects VVR (residence card) at IND in NL within 14 days of arrival
- **Germany au-pair specific traps:**
  - **A1 German certificate (Goethe-Institut or telc) at visa application** — this is the single largest filter; SA candidates without German must complete A1 first (typically 3–4 months evening classes + exam)
  - SA candidates **do NOT have visa-free entry** to Germany (unlike USA, Canada, Australia, NZ, Japan, South Korea citizens). The au-pair visa must be applied for at the German Mission in SA (Pretoria, Cape Town, Durban, Johannesburg) before travel
  - Signed contract on the BA-template (Bundesagentur für Arbeit) required at visa application
  - Private health, accident, and liability insurance required and listed by name on the visa application
- **France au-pair specific traps:**
  - **Cerfa au-pair convention** (placement contract) signed by host family and au pair pre-departure and submitted with the visa application; per service-public.fr (F13348 / F15813)
  - **Basic French OR secondary education OR professional qualifications** required per service-public.fr; A1 certificate not strictly required at visa stage but commonly expected by families and consulates
  - Long-stay visa via **CAPAGO South Africa** (fr-za.capago.eu — Johannesburg + Cape Town); replaced VFS Global as France's SA visa service provider in 2023
  - Post-arrival: validate VLS-TS online via the **ANEF portal** (administration-etrangers-en-france.interieur.gouv.fr) within 3 months and pay the validation tax (timbre); OFII medical is not a universal current step — verify against france-visas.gouv.fr current procedure
- **Passport validity rule** — USA J-1 typically requires passport valid 6 months beyond the intended period of stay (subject to the State Dept's six-month-club waivers). **Schengen routes (NL, DE, FR)** require passport valid at least 3 months beyond the intended departure date from the Schengen area AND issued within the last 10 years. Verify each requirement against the destination's official source. Home Affairs SA renewal can take 6–8 weeks via standard channel; the smart-ID + passport branches in major cities are typically faster. Build this into the timeline.
- **Sequence matters** (canonical SA-side order):
  1. Apply for / renew passport (6+ months remaining beyond contract end)
  2. Apply for SAPS PCC (6–8 weeks)
  3. Pass IDP application at AA (same day)
  4. (Germany only) Goethe-Institut A1 exam — book 3 months out
  5. Sponsor agency / host family matching
  6. DIRCO apostille on SAPS PCC + any other vetted documents
  7. Visa application at the destination embassy/consulate
- **Single-source rule** — every fee, processing time, and document requirement must be primary-source-verified (SAPS, DIRCO, IND, BAMF/southafrica.diplo.de, US Embassy Pretoria, France-visas portal). Sponsor agency document checklists are tier-2 acceptable. Industry blog checklists are `alleged` until primary-verified.
- Folder structure: `Documents/`, `Authentication Steps/`, `Language Certificates/`
