# Prompt: Accounting — Document Checklist

> Run with `/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-accounting-02-documents`

---

/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-accounting-02-documents

**Goal:** Build a complete, ordered SA-side → destination-side document checklist for South African accountants applying for overseas work (UK, Australia, Canada, Ireland, NZ), including SAICA Letter of Good Standing, reciprocal-membership / MRA application packs to ICAEW / ICAS / CA ANZ / CPA Canada / Chartered Accountants Ireland (CAI — note CPA Ireland amalgamated into CAI 1 Sept 2024), WES ECA for Canada Express Entry, SAQA evaluations where required, SAPS Police Clearance, DIRCO apostille (Hague Apostille Convention), and destination-specific designation registration documents.

**Seed entities:**
- SAICA Letter of Good Standing (member-services document required by every reciprocity partner)
- ICAEW Members-of-Other-Bodies application pack for SAICA members (icaew.com)
- WES ECA (World Education Services Canada — Express Entry assessment)
- SAPS Police Clearance Certificate + DIRCO apostille chain
- CPA Ontario international applicant / CPA BC international applicant / CPA Alberta international applicant (Canada provincial registration post-RMA)

**Source constraints:** saica.org.za (member services / Letter of Good Standing process; Reciprocity and Affiliations page), icaew.com (members-of-other-bodies SAICA application page), icas.com (ICAS — Scotland; SAICA reciprocity partner), charteredaccountantsanz.com (international member application via RMA), cpacanada.ca (Internationally trained accountants / MRA route), cpaontario.ca, cpabc.ca, cpaalberta.ca, cpaquebec.ca (Canada provincial registration), charteredaccountants.ie (Chartered Accountants Ireland — international / mutual recognition application; CPA Ireland legacy now CAI), nasba.org/saica/, iqab.nasba.org (US IQEX route), frc.org.uk (Recognised Supervisory Bodies / RSB list for UK audit qualification context), wes.ca (Express Entry credential evaluation), saqa.org.za (foreign qualification evaluation, where degree assessment needed), saps.gov.za (Police Clearance Certificate application + fees), dirco.gov.za (apostille and authentication services — verify whether DIRCO apostille has a fee or is free), gov.uk/skilled-worker-visa (UK side document list), gov.uk/legalisation (UK FCDO apostille / legalisation requirements for inbound documents), homeaffairs.gov.au (Skills in Demand 482 document checklist + CSOL — Core Skills Occupation List), immigration.govt.nz (AEWV documents), enterprise.gov.ie (CSEP supporting documents)

**Iterations:** 6

---

## Note schemas

**DOCUMENT note:**
```markdown
---
type: document
name:
short_name:
issuing_body: "[[sa_or_destination_body]]"
required_for: []
sa_or_destination_side: [sa | destination | both]
typical_processing_time_days:
typical_cost_zar:
apostille_required: [yes | no | varies_by_country]
validity_period:
official_url:
evidence_strength: confirmed | alleged | rumoured
tags: [document, accounting, work-abroad, [sa | uk | au | ca | ie | nz]]
sources:
  -
---

# Document Name

Plain-language summary: what this document is, who issues it, why it's needed in the accounting work-abroad flow.

## How to Get It
Step-by-step from SA accountant's perspective — where to apply, what supporting documents are needed, typical wait time.

## Common Pitfalls
What trips applicants up (e.g. SAICA Letter of Good Standing expiring before MRA partner processes it; apostille chain failures).

## Connections
- [[Issuing Body]] — issued_by, source: [url]
- [[MRA Partner Body]] — required_for, source: [url]

## Sources
- [Source title](url)
```

**PROCESS STEP note:**
```markdown
---
type: process_step
name:
sequence_order:
prerequisite_documents: []
output_document: "[[document_name]]"
estimated_duration_days:
destination_country:
official_url:
evidence_strength: confirmed | alleged | rumoured
tags: [process-step, accounting, work-abroad]
sources:
  -
---

# Step Name

What happens at this step, who actions it, how long it takes.

## Connections
- [[Document]] — produces, source: [url]
- [[Document]] — requires, source: [url]

## Sources
- [Source title](url)
```

**GOVERNMENT BODY note:** (use base GOVERNMENT BODY schema — name, short_name, category, jurisdiction, official_url, evidence_strength, tags, sources)

**EDGE metadata:**
- `relationship_type`: issued_by | requires | produces | precedes | apostilled_by | required_for | submitted_to
- `description`: short label
- `date_range`: YYYY–present
- `evidence_strength`: confirmed | alleged | rumoured
- `sources`: at least one URL

---

## Runtime rules

- `evidence_strength`: `confirmed` | `alleged` | `rumoured` — only `confirmed` when the issuing body's own website confirms the document name, fee, and process.
- **Date-stamp every fee** — SAPS PCC fees, DIRCO apostille fees, MRA partner application fees, WES ECA fees all change. Cite the year.
- **Distinguish "designation registration" from "visa application"** — these are two separate documentation streams. SAICA → ICAEW gives a UK CA designation. Skilled Worker Visa is a separate UK Home Office application with its own document set. Do not collapse them.
- **Apostille is destination-and-document-specific**: UK is a Hague Apostille Convention jurisdiction — apostille / legalisation requirements depend on the receiving authority and document type, not a blanket rule. AU / NZ requirements vary by receiving authority. Canada generally uses WES electronic verification for credential assessment rather than apostille; for civil documents check the receiving authority. **Verify per document per receiving authority — do not assume a country-wide rule.**
- **WES ECA is for Express Entry only**, not for CPA Canada designation (CPA Canada uses RMA route, no WES needed). Do not conflate.
- **DIRCO apostille fees**: Confirm directly from dirco.gov.za whether there is a fee or the service is free. If no fee, record `0` with a date-stamped source URL — do not assume.
- **SAICA Letter of Good Standing validity** — typically valid 3–6 months; flag expiry risk when reciprocity-body processing exceeds this window.
- Flag any document or process step where the official source page returns 404, paywalled, or last-updated > 24 months ago as `evidence_strength: alleged`.
- Folder structure: `Documents/`, `Process Steps/`, `Government Bodies/`
