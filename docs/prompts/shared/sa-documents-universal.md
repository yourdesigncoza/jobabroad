# Prompt: SA Documents Universal

> Run with `/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-shared-documents`

---

/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-shared-documents

**Goal:** Build a comprehensive, source-verified reference of every document a South African professional must obtain in South Africa before applying to work abroad — covering what it is, who issues it, how long it takes, what it costs (including the fixer economy where relevant), and which destination countries require it.

**Seed entities:**
- SAQA Foreign Qualification Evaluation
- SAPS Police Clearance Certificate
- Apostille (DIRCO)
- South African Passport
- DIRCO Authentication Service
- Unabridged Birth / Marriage / Divorce Certificate (Home Affairs)
- Medical Clearance / Panel Doctor Report (IOM-approved clinics)
- Proof of Funds — bank-stamped 3–6 month statements
- VFS Global SA (visa application submission agent)

**Source constraints:** dirco.gov.za, saqa.org.za, saps.gov.za, dha.gov.za, home-affairs.gov.za, vfsglobal.com/za, official destination government portals (gov.uk, homeaffairs.australia.gov.au, dete.ie, canada.ca), any credible SA legal or immigration firm FAQ citing official sources, SA expat Facebook groups and forums for real processing time data (flag as anecdotal)

**Iterations:** 10

---

## Note schemas

**DOCUMENT note:**
```markdown
---
type: document
name:
aliases: []
issuing_body: "[[issuing_body_name]]"
purpose:
required_by_destinations: []
application_method: [in_person | online | postal]
sa_office_or_url:
processing_time_standard:
processing_time_urgent:
cost_zar:
validity_period:
apostille_required: [yes | no | destination_dependent]
courier_collection_allowed: [yes | no | unknown]
third_party_fixer_availability: [common | rare | none]
evidence_strength: confirmed | alleged | rumoured
tags: [document, work-abroad, sa-documents]
sources:
  -
---

# Document Name

Short factual description (2–4 sentences): what it is, who needs it, what it proves.

## How to Apply
Step-by-step from the official source.

## Destination Requirements
Which countries require this document, in what form, and at what stage of the visa process.

## Real Processing Times
Official time vs. reported real-world time (cite expat forums/groups as anecdotal where used). Note if a fixer or concierge service materially reduces wait time.

## Common Delays & Pitfalls
Known processing backlogs, common rejections, tips from official guidance.

## Connections
- [[Issuing Body]] — issued_by, source: [url]
- [[Destination Requirement]] — required_for, source: [url]

## Sources
- [Source title](url)
```

**ISSUING BODY note:**
```markdown
---
type: issuing_body
name:
short_name:
category: [government_department | statutory_body | professional_body | private_agent]
jurisdiction: South Africa
mandate:
documents_issued: []
contact_url:
evidence_strength: confirmed
tags: [issuing-body, sa-government, work-abroad]
sources:
  -
---

# Issuing Body Name

Summary of mandate and role in the work-abroad documentation chain.

## Documents Issued
- [[Document Name]] — purpose, processing time

## Connections
- [[Document Name]] — issues, source: [url]

## Sources
- [Source title](url)
```

**EDGE metadata:**
- `relationship_type`: issued_by | required_for | authenticates | supersedes | submitted_via | linked_to
- `description`: short label
- `date_range`: if applicable
- `evidence_strength`: confirmed | alleged | rumoured
- `sources`: at least one URL

---

## Runtime rules

- `evidence_strength`: `confirmed` | `alleged` | `rumoured` — flag any cost or processing time that may be outdated
- Date-stamp all fees and processing times — these change frequently
- Document the fixer/concierge economy where it meaningfully shortens wait times — note cost and anecdotal evidence strength
- Every note and every connection must cite at least one official source URL
- Folder structure: `Documents/`, `Issuing Bodies/`
