# Prompt: Teaching — Scam Red Flags

> Run with `/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-teaching-05-scams`

---

/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-teaching-05-scams

**Goal:** Build a teaching-specific reference of scam patterns targeting South African school teachers seeking work abroad — covering how teaching recruitment scams differ from general work-abroad fraud, specific red flags in UK and Australian teacher recruitment, how to verify a legitimate employer or recruiter, and where to report.

**Seed entities:**
- Fake "guaranteed UK placement" agency (upfront placement fee or visa processing fee — legitimate recruiters never charge teachers)
- Fraudulent Certificate of Sponsorship seller (fake CoS offered for sale — real CoS is free, issued directly by the sponsor school)
- "No subject restriction" QTS misrepresentation (scammers claim all SA teachers get free QTS — false for non-shortage subjects)
- UK Register of Licensed Sponsors — Education sector (official Home Office register for verifying sponsor schools)
- SACE document harvesting scam (fake "SACE application portals" or "document assistance" services requesting originals before any employment contract)

**Source constraints:** gov.uk/register-of-licensed-sponsors, gov.uk/guidance/qualified-teacher-status-qts, sace.org.za, actionfraud.police.uk, saps.gov.za, tes.com fraud warnings (tes.com/jobs), Daily Maverick, News24, HelloPeter, SA teacher expat Facebook and WhatsApp groups such as "SA Teachers Abroad" (flag as anecdotal), ecctis.com

**Iterations:** 6

---

## Note schemas

**SCAM PATTERN note:**
```markdown
---
type: scam_pattern
name:
aliases: []
category: [fake_employer | fake_agency | fake_qts_agent | fake_cos_seller | document_harvesting | upfront_placement_fee | qualification_misrepresentation]
target_destination: []
channels: [facebook | whatsapp | linkedin | indeed | email | in_person | zoom_teams]
typical_fee_requested_zar:
reporting_channel_sa:
reporting_channel_destination:
evidence_strength: confirmed | alleged | rumoured
tags: [scam, teaching, fraud, sa-specific]
sources:
  -
---

# Scam Pattern Name

How this scam specifically targets SA teachers — what makes it different from generic work-abroad fraud.

## How It Works
Step-by-step from first contact to money or data loss.

## Red Flags Specific to Teaching
- Flag 1
- Flag 2
- Flag 3

## How to Verify
Specific actionable check for teaching (e.g. "Check if the school appears on the UK Register of Licensed Sponsors — filter by Education sector at gov.uk/register-of-licensed-sponsors").

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
tags: [verification, teaching, scam-protection]
sources:
  -
---

# Verification Method Name

What this check proves and how a teacher performs it in under 5 minutes.

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
- `relationship_type`: countered_by | targets | reported_in | verified_via | documented_by | warns_against
- `description`: short label
- `evidence_strength`: confirmed | alleged | rumoured
- `sources`: at least one URL

---

## Runtime rules

- Date-stamp all costs, thresholds, and occupation-list statuses — these change annually
- Flag any closed or suspended routes explicitly as [CLOSED - do not recommend]
- Never present agent estimates as confirmed figures; source must be a government or regulator URL
- If a source is older than 12 months, flag evidence_strength as alleged unless confirmed by a recent primary source
- Never name individual scammers unless formally charged or named in an official SAPS, DfE, or Action Fraud source
- Every verification method must link to a live official URL
- Focus on teaching-specific variants — do not duplicate generic scam content already in wa-shared-scams
- **Certificate of Sponsorship rule (CRITICAL):** A CoS is assigned free by the licensed sponsor (which may be the school, academy trust, local authority, or other employer) — it is never for sale to candidates. Any entity charging a teacher for a CoS is operating a scam. Include a step-by-step verification: search the named sponsor/employer on gov.uk/register-of-licensed-sponsors filtered to Education sector; if neither the school nor its trust/authority appears, it cannot legally sponsor
- **QTS misrepresentation (CRITICAL):** Confirm the current DfE subject list for the overseas QTS route. If a recruiter claims "all SA teachers get free QTS" without referencing subject or phase restrictions, treat this as a red flag — the DfE Apply for QTS route for SA teachers NOT already in a valid teaching role in England is restricted to shortage subjects (currently Maths, Science, Languages) for ages 11–16
- **SACE document security:** Original SACE certificates, SAPS police clearances, and passports should never be sent to or held by a recruiter at any stage. Submit originals only through official portals or directly to verified government/visa authorities — even after a contract is signed
- **"Placement fee" red flag:** Legitimate UK teacher recruiters source revenue from the hiring school, not the candidate. Any recruiter charging a teacher an upfront placement, "visa processing," or "shortlisting" fee should be treated as a scam; report to Action Fraud (UK) or SAPS (SA)
- Folder structure: `Scam Patterns/`, `Verification Methods/`

<!--
## Canvas export (on-demand)
Generate canvas only when user explicitly requests "generate canvas".
-->
