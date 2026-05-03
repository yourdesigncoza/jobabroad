# Prompt: Nursing — Scam Red Flags

> Run with `/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-nursing-05-scams`

---

/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-nursing-05-scams

**Goal:** Build a nursing-specific reference of scam patterns targeting SA nurses seeking work abroad — covering how nursing scams differ from general work-abroad fraud, specific red flags in nursing recruitment, how to verify a legitimate UK/AUS/IRE employer or recruiter, and where to report.

**Seed entities:**
- Fake NHS trust recruitment (cloned NHS trust branding)
- Fake NMC registration agent (charging to "fast-track" NMC applications)
- Unregistered nursing agency (SA-based, no OISC / AHPRA-linked credentials)
- Upfront OSCE / CBT "guarantee" fee scam
- UK Licensed Sponsor Register (legitimate verification tool)

**Source constraints:** nmc.org.uk/scam-warnings, gov.uk (Licensed Sponsor Register), nhsemployers.org fraud guidance, Australian High Commission Pretoria warnings, AHPRA scam warnings, saps.gov.za, actionfraud.police.uk, Daily Maverick, News24, HelloPeter, "Nurses on the Move" and similar SA nursing expat Facebook groups (flag as anecdotal)

**Iterations:** 8

---

## Note schemas

**SCAM PATTERN note:**
```markdown
---
type: scam_pattern
name:
aliases: []
category: [fake_employer | fake_registration_agent | fake_agency | upfront_exam_fee | fake_programme | qualification_fraud]
target_destination: []
channels: [facebook | whatsapp | linkedin | indeed | email | in_person | zoom_teams]
typical_fee_requested_zar:
reporting_channel_sa:
reporting_channel_destination:
evidence_strength: confirmed | alleged | rumoured
tags: [scam, nursing, fraud, sa-specific]
sources:
  -
---

# Scam Pattern Name

How this scam specifically targets SA nurses — what makes it different from generic work-abroad fraud.

## How It Works
Step-by-step from first contact to money/data loss.

## Red Flags Specific to Nursing
- Flag 1
- Flag 2
- Flag 3

## How to Verify
Specific actionable check for nursing (e.g. "Check if the employer appears on the UK Register of Licensed Sponsors — filter by health sector at [url]").

## Where to Report
- **In SA:** [SAPS / labour.gov.za / etc.]
- **In destination country:** [Action Fraud / ACCC / etc.]

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
tags: [verification, nursing, scam-protection]
sources:
  -
---

# Verification Method Name

What this check proves and how a nurse performs it in under 5 minutes.

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
- `relationship_type`: countered_by | targets | reported_in | verified_via | documented_by
- `description`: short label
- `evidence_strength`: confirmed | alleged | rumoured
- `sources`: at least one URL

---

## Runtime rules

- `evidence_strength`: `confirmed` | `alleged` | `rumoured` — distinguish official NMC/NHS warnings from anecdotal group reports
- Never name individual scammers unless formally charged or named in an official NMC / SAPS / Action Fraud source
- Every verification method must link to a live official URL
- Focus on nursing-specific variants — do not duplicate the generic scam content from wa-shared-scams
- Folder structure: `Scam Patterns/`, `Verification Methods/`
