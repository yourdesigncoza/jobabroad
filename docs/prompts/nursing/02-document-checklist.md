# Prompt: Nursing — Document Checklist

> Run with `/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-nursing-02-documents`

---

/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-nursing-02-documents

**Goal:** Build a complete, sequenced, source-verified document checklist for a South African nurse applying to work in the UK, Australia, and Ireland — covering every document from SA-side preparation through to destination regulator submission, with processing times, costs, and known logistical traps.

**Seed entities:**
- SANC Certificate of Good Standing (Letter of Good Standing / VOGS)
- NMC CCPS (Computer-based Competency Progression System — UK)
- AHPRA Initial Registration (Australia)
- NMBI Registration (Ireland)
- OSCE (Objective Structured Clinical Examination — UK)
- OET / IELTS Academic (language tests for nursing registration)
- CBT (Computer-Based Test — NMC Part 1)

**Source constraints:** nmc.org.uk (registration guidance), ahpra.gov.au (nursing registration), nmbi.ie (overseas applications), sanc.co.za, oet.com, ielts.org, gov.uk (Health and Care Worker Visa requirements), homeaffairs.gov.au, "Nurses on the Move" Facebook group and similar expat forums (flag as anecdotal for processing times), SA nursing agency guidance documents

**Iterations:** 12

---

## Note schemas

**DOCUMENT note:**
```markdown
---
type: document
name:
aliases: []
stage: [sa_preparation | sa_submission | destination_registration | visa_application]
issued_by: "[[issuing_body]]"
submitted_to: "[[receiving_body]]"
required_for_destinations: []
processing_time_official:
processing_time_reported:
cost_zar:
cost_destination_currency:
validity_period:
direct_shipping_required: [yes — body sends direct | no — issued to nurse | destination_dependent]
apostille_required: [yes | no | destination_dependent]
evidence_strength: confirmed | alleged | rumoured
tags: [document, nursing, work-abroad, checklist]
sources:
  -
---

# Document Name

What this document is, what it proves, and at what stage of the process it is needed.

## How to Obtain
Step-by-step from the official source.

## Known Delays & Traps
Real-world processing issues. Note if SANC direct-ships and what that means for sequencing.

## Connections
- [[Issuing Body]] — issued_by, source: [url]
- [[Receiving Body]] — submitted_to, source: [url]

## Sources
- [Source title](url)
```

**EXAM note:**
```markdown
---
type: exam
name:
short_name:
required_by: []
minimum_score:
valid_for_years:
test_centres_sa: []
booking_lead_time:
cost_zar:
cost_gbp:
prep_resources: []
evidence_strength: confirmed | alleged | rumoured
tags: [exam, nursing, language-test, registration]
sources:
  -
---

# Exam Name

What this exam tests, why it is required, and who requires it.

## Minimum Score for Nursing Registration
Score requirements per destination (NMC, AHPRA, NMBI).

## SA Test Centres
Where SA nurses can sit this exam.

## Prep Resources
Official and widely-used preparation materials.

## Connections
- [[Destination Regulator]] — required_by, source: [url]

## Sources
- [Source title](url)
```

**EDGE metadata:**
- `relationship_type`: issued_by | submitted_to | required_for | precedes | follows | direct_ships_to
- `description`: short label
- `date_range`: if applicable
- `evidence_strength`: confirmed | alleged | rumoured
- `sources`: at least one URL

---

## Runtime rules

- `evidence_strength`: `confirmed` | `alleged` | `rumoured`
- Sequence matters — note which documents must be obtained before others can be started
- `direct_shipping_required` on SANC documents is a critical trap — document this precisely
- Always distinguish official processing time from reported real-world time
- Folder structure: `Documents/`, `Exams/`
