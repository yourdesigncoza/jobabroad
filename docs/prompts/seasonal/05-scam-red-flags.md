# Prompt: Seasonal — Scam Red Flags

> Run with `/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-seasonal-05-scams`

---

/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-seasonal-05-scams

**Goal:** Build a seasonal-specific reference of scam patterns targeting South African university students and young adults seeking J1 USA summer jobs, UK seasonal work, or overseas working holiday experiences — covering how seasonal programme scams differ from generic work-abroad fraud, specific red flags, and how to verify a legitimate sponsor or opportunity.

**Seed entities:**
- Fake J1 "placement agency" scam (upfront fee charged for DS-2019 or USA job "guarantee")
- "Guaranteed Disney / resort job" scam (specific USA seasonal employer impersonation)
- Fake UK seasonal recruiter scam (upfront visa fee for YMS "application assistance")
- US Department of State designated J1 sponsor list (official verification tool at j1visa.state.gov/sponsors)
- Australian High Commission Pretoria visa scam warnings (analogous model for SA-targeting seasonal fraud)

**Source constraints:** j1visa.state.gov/sponsors (official J1 designated sponsor list), j1visa.state.gov/programs/summer-work-travel, za.usembassy.gov (scam alerts), gov.uk/youth-mobility, southafrica.embassy.gov.au/pret/visascams.html, saps.gov.za, actionfraud.police.uk, sanews.gov.za (SA consumer protection)

**Iterations:** 6

---

## Note schemas — apply to every note created

**SCAM PATTERN note:**
```markdown
---
type: scam_pattern
name:
aliases: []
category: [fake_sponsor_agency | fake_employer | fake_visa_service | upfront_fee | identity_theft | guaranteed_placement]
target_programme: [j1_swt | uk_yms | canada_iec | generic_seasonal]
target_demographic: []
channels: [facebook | whatsapp | linkedin | indeed | email | in_person | instagram]
typical_fee_requested_zar:
documents_requested_fraudulently: []
reporting_channel_sa:
reporting_channel_usa:
reporting_channel_uk:
evidence_strength: confirmed | alleged | rumoured
tags: [scam, seasonal, fraud, south-africa, j1]
sources:
  -
---

# Scam Pattern Name

How this scam specifically targets SA students/young adults seeking seasonal overseas work — what makes it distinct from generic work-abroad fraud.

## How It Works
Step-by-step from first contact to money or data loss.

## Red Flags Specific to Seasonal Programmes
- Flag 1 (e.g. agency not on US Dept of State designated sponsor list)
- Flag 2 (e.g. claims to personally issue DS-2019 while not on the official designated sponsor list; or demands payment to "guarantee" a visa or specific employer)
- Flag 3 (e.g. guarantees a specific employer placement for a fee)

## How to Verify
Specific actionable check for seasonal programmes:
- J1: "Verify the sponsor agency at j1visa.state.gov/sponsors — if not listed, do not pay"
- UK YMS: "Apply directly at gov.uk/youth-mobility — no third party can submit your visa application for a fee"
- Canada IEC: "Recognized Organizations are listed at ircc.canada.ca/iec — verify your RO is on this list; note that ROs are optional intermediaries and most IEC participation does not require an RO; if an entity claims to be your mandatory IEC representative and demands upfront fees to 'secure your spot', that is a red flag"

## Where to Report
- **In SA:** SAPS (saps.gov.za); SA Dept of Employment and Labour
- **USA:** US Embassy Pretoria (za.usembassy.gov); FTC (reportfraud.ftc.gov)
- **UK:** Action Fraud (actionfraud.police.uk)

## Reported Instances
Known documented cases (date, source, outcome if known). If none confirmed, state explicitly.

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
applicable_programmes: [j1_swt | uk_yms | canada_iec | all]
official_register_url:
how_to_use:
evidence_strength: confirmed
tags: [verification, seasonal, scam-protection, south-africa]
sources:
  -
---

# Verification Method Name

What this check proves and how a SA student performs it in under 5 minutes.

## Step-by-Step
1.
2.
3.

## Connections
- [[Scam Pattern]] — counters, source: [url]

## Sources
- [Source title](url)
```

**EDGE metadata:**
- `relationship_type`: countered_by | targets | reported_in | verified_via | documented_by | impersonates
- `description`: short label
- `evidence_strength`: confirmed | alleged | rumoured
- `sources`: at least one URL

---

## Runtime rules

- `evidence_strength`: `confirmed` | `alleged` | `rumoured` — distinguish official US Embassy / US Dept of State warnings from anecdotal SA community reports
- **Do not duplicate generic scam content from wa-shared-scams** — focus on seasonal-specific variants: fake J1 sponsors, Disney job scams, YMS "fast-track" services
- **Key distinguishing fact for J1:** Only US Department of State designated sponsors can issue a DS-2019; any agency claiming to issue a DS-2019 that is not on the official list at j1visa.state.gov/sponsors is fraudulent; document this verification step prominently
- **UK YMS cannot be "assisted" for a fee:** Any service claiming to submit a YMS application on behalf of an applicant for a fee is either unnecessary or fraudulent — the application is submitted directly at gov.uk; note this clearly
- Never name individual scammers unless formally charged or named in an official government source
- Every verification method must link to a live official URL that SA students can check themselves
- Folder structure: `Scam Patterns/`, `Verification Methods/`
