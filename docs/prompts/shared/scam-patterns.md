# Prompt: Scam Patterns

> Run with `/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-shared-scams`

---

/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-shared-scams

**Goal:** Build a verified, source-cited reference of scam patterns targeting South Africans seeking work abroad — covering how each scam operates, its red flags, the channels it uses, known actor types, how a victim can verify legitimacy against an official source, and where to report it.

**Seed entities:**
- Fake job offer scam
- Upfront visa fee fraud
- Fake recruitment agency
- Identity document fraud
- Advance fee fraud (419-style work-abroad variant)
- Phantom Interview scam (fake Zoom/Teams with stolen company branding)
- LinkedIn recruiter impersonation (cloned profiles of real agency recruiters)
- WhatsApp "Global Group" placement scam (invitation-only, committal fee)

**Source constraints:** saps.gov.za, labour.gov.za, cybercrime.org.za, Australian High Commission Pretoria warnings, UK Home Office scam guidance (gov.uk), Action Fraud UK (actionfraud.police.uk), US FTC/State Dept travel fraud warnings, Daily Maverick, amaBhungane, News24 consumer reporting, HelloPeter (for named company complaints), Consumer Protection Act guidance, SA expat Facebook groups ("South Africans in London / Sydney / Dubai") for emerging scam reports (flag as anecdotal)

**Iterations:** 10

---

## Note schemas

**SCAM PATTERN note:**
```markdown
---
type: scam_pattern
name:
aliases: []
category: [job_offer | visa_fee | identity | advance_fee | fake_programme | qualification_fraud | phantom_interview | impersonation]
target_professions: []
target_destinations: []
channels: [facebook | whatsapp | linkedin | indeed | email | in_person | zoom_teams]
typical_fee_requested_zar:
reporting_channel_sa:
reporting_channel_destination:
evidence_strength: confirmed | alleged | rumoured
tags: [scam, work-abroad, fraud, sa-specific]
sources:
  -
---

# Scam Pattern Name

2–4 sentence description of how this scam operates — neutral, factual tone.

## How It Works
Step-by-step mechanics of the scam from first contact to money/data loss.

## Red Flags
- Flag 1
- Flag 2
- Flag 3

## How to Verify Against Official Sources
Specific actionable check: e.g. "Search the employer name on the UK Register of Licensed Sponsors at [url]"

## Where to Report
- **In SA:** [SAPS Cybercrime unit / labour.gov.za / etc.]
- **In destination country:** [Action Fraud UK / ACCC Australia / etc.]

## Reported Instances
Known documented cases (date, source, outcome if known).

## Connections
- [[Scam Actor Type]] — operates_via, source: [url]
- [[Verification Method]] — countered_by, source: [url]

## Sources
- [Source title](url)
```

**SCAM ACTOR TYPE note:**
```markdown
---
type: scam_actor_type
name:
description:
typical_channels: []
professions_targeted: []
destinations_claimed: []
evidence_strength: confirmed | alleged | rumoured
tags: [scam-actor, fraud, work-abroad]
sources:
  -
---

# Scam Actor Type Name

Summary of who this actor type is and how they present themselves.

## Tactics
Common approaches used by this actor type.

## Connections
- [[Scam Pattern]] — executes, source: [url]

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
tags: [verification, work-abroad, scam-protection]
sources:
  -
---

# Verification Method Name

What this check proves and how to perform it.

## Step-by-Step
1.
2.
3.

## Connections
- [[Scam Pattern]] — counters, source: [url]
- [[Destination]] — maintained_by, source: [url]

## Sources
- [Source title](url)
```

**EDGE metadata:**
- `relationship_type`: executes | countered_by | operates_via | targets | reported_in | documented_by
- `description`: short label
- `evidence_strength`: confirmed | alleged | rumoured
- `sources`: at least one URL

---

## Runtime rules

- `evidence_strength`: `confirmed` | `alleged` | `rumoured` — distinguish official warnings from anecdotal reports
- Never name individual scammers unless formally charged or named in an official source
- Every verification method must link to a live, official URL
- Always populate both `reporting_channel_sa` and `reporting_channel_destination` — this is actionable content
- Folder structure: `Scam Patterns/`, `Scam Actor Types/`, `Verification Methods/`
