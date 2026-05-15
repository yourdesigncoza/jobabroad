# Prompt: Engineering — Scam Red Flags

> Run with `/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-engineering-05-scams`

---

/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-engineering-05-scams

**Goal:** Build an engineering-specific reference of scam patterns targeting SA engineers seeking work abroad — covering how engineering scams differ from general work-abroad fraud, specific red flags in engineering recruitment and skills-assessment services, how to verify a legitimate Australian / Irish / UK / NZ / Canadian employer or recruiter, and where to report.

**Seed entities:**
- Inflated "CDR writing service" scams — charging large fees to write a Competency Demonstration Report when the engineer's ECSA-accredited degree qualifies for the cheaper Engineers Australia Accord pathway and needs no CDR
- Fake "fast-track Engineers Australia assessment" intermediaries
- Maritime / oil-rig / mining engineering job-offer scams (subject of an official Australian High Commission Pretoria warning)
- Fake engineering recruiter charging upfront visa or sponsorship fees
- UK Register of Licensed Sponsors — the legitimate employer-verification tool

**Source constraints:** engineersaustralia.org.au (official skills-assessment guidance and any scam warnings), ieagreements.org (IEA qualification checker) and ecsa.co.za (accredited programme lists — for verifying real Accord eligibility), gov.uk (UK Register of Licensed Sponsors and how to verify a sponsor), immigrationadviceauthority.gov.uk (UK regulated adviser register), southafrica.embassy.gov.au (Australian High Commission Pretoria visa scam warnings), immi.homeaffairs.gov.au (fraud and scam warnings), mara.gov.au / OMARA register and scamwatch.gov.au (ACCC Scamwatch), saps.gov.za, actionfraud.police.uk, immigration.govt.nz (immigration scams guidance) and the NZ Immigration Advisers Authority register, canada.ca (fraud prevention), the Canadian College of Immigration and Citizenship Consultants (CICC) public register and the Canadian Anti-Fraud Centre, HelloPeter and SA engineering / emigration Facebook groups (flag as anecdotal — never as confirmed)

**Iterations:** 6

---

## Note schemas — apply to every note created

**SCAM PATTERN note:**
```markdown
---
type: scam_pattern
name:
aliases: []
category: [fake_employer | fake_assessment_agent | inflated_cdr_service | fake_recruiter | upfront_fee | maritime_offshore_offer | qualification_fraud]
target_destination: []
channels: [facebook | whatsapp | linkedin | indeed | email | in_person | zoom_teams]
typical_fee_requested_zar:
reporting_channel_sa:
reporting_channel_destination:
evidence_strength: confirmed | alleged | rumoured
tags: [scam, engineering, fraud, sa-specific]
sources:
  -
---

# Scam Pattern Name

How this scam specifically targets SA engineers — what makes it different from generic work-abroad fraud.

## How It Works
Step-by-step from first contact to money or data loss.

## Red Flags Specific to Engineering
- Flag 1
- Flag 2
- Flag 3

## How to Verify
Specific actionable check for engineering (e.g. "Confirm whether your ECSA-accredited degree qualifies for the Engineers Australia Accord pathway before paying any CDR-writing service" or "Check the employer on the UK Register of Licensed Sponsors at [url]").

## Where to Report
- **In SA:** [SAPS / labour.gov.za / etc.]
- **In destination country:** [Action Fraud / Home Affairs / etc.]

## Reported Instances
Known documented cases (date, source, outcome if known).

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
official_register_url:
how_to_use:
evidence_strength: confirmed
tags: [verification, engineering, scam-protection]
sources:
  -
---

# Verification Method Name

What this check proves and how an engineer performs it in under five minutes.

## Step-by-Step
1.
2.
3.

## Connections
- [[Scam Pattern]] — counters, source: [url]

## Sources
- [Source title](url)
```

**EDGE metadata (record on every direct verifiable connection):**
- `relationship_type`: countered_by | targets | reported_in | verified_via | documented_by | warns_against
- `description`: short label
- `evidence_strength`: confirmed | alleged | rumoured
- `sources`: at least one URL

---

## Runtime rules for vault-builder

- `evidence_strength`: `confirmed` | `alleged` | `rumoured` — distinguish official Engineers Australia / Home Affairs / High Commission warnings from anecdotal group reports
- Every note and every connection must cite at least one source URL
- Never name individual scammers unless formally charged or named in an official government / SAPS / Action Fraud source
- Every verification method must link to a live official URL
- **Lead with the engineering-specific variants** — the inflated-CDR-service scam, fake fast-track assessment intermediaries, and offshore/maritime engineering offers are the highest-value content. Do not duplicate the generic scam content already covered in `wa-shared-scams`.
- The inflated CDR-writing scam preys on engineers not knowing which Engineers Australia pathway they qualify for — tie the verification advice directly to confirming Accord-pathway eligibility. Be precise: Accord eligibility is not automatic for any "ECSA-accredited degree" — it depends on the specific programme being recognised under the relevant Washington / Sydney / Dublin Accord, in the valid accreditation period and after South Africa's signatory date (Washington Accord: 1999). The honest verification step is to check the exact programme and graduation year against the IEA qualification checker / ECSA accredited-programme list before concluding "no CDR needed".
- Engineers Australia's only legitimate fast-track is a paid add-on within its own portal that brings forward assessor assignment — it does NOT expedite or guarantee an outcome. Flag any third party claiming to expedite, fast-track, or guarantee an EA result.
- Date-stamp scam reports and any fee figures — these change.
- Folder structure: `Scam Patterns/`, `Verification Methods/`

<!--
## Canvas export (on-demand only — do not generate unless explicitly requested)
-->
