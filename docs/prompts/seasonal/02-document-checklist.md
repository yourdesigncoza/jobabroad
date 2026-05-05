# Prompt: Seasonal — Document Checklist

> Run with `/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-seasonal-02-documents`

---

/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-seasonal-02-documents

**Goal:** Build a complete, sequenced, source-verified document checklist for a South African university student or young adult applying to the J1 Summer Work Travel programme (USA), the UK Youth Mobility Scheme, or the Canada IEC Working Holiday — covering every document from SA-side preparation through to visa approval, with lead times and known traps.

**Seed entities:**
- DS-2019 Certificate of Eligibility (J1 programme entry document; issued by licensed US sponsor)
- SEVIS I-901 fee registration (US Student and Exchange Visitor Information System)
- SA university enrolment letter (J1 eligibility proof — issued by SA institution, confirming full-time student status)
- UK Youth Mobility Scheme visa application — supporting documents required
- SA Police Clearance Certificate (SAPS) — required for Canada IEC and some YMS-adjacent background checks; not a standard listed UK YMS document requirement (verify per current gov.uk/youth-mobility/documents-you-must-provide)

**Source constraints:** j2visa.state.gov/programs/summer-work-travel, j1online.ie, ciee.org, gov.uk/youth-mobility/documents-you-must-provide, ircc.canada.ca/iec, za.usembassy.gov (J1 visa interview guidance), saps.gov.za (police clearance), home.affairs.gov.za

**Iterations:** 6

---

## Note schemas — apply to every note created

**DOCUMENT note:**
```markdown
---
type: document
name:
aliases: []
stage: [sa_preparation | sa_submission | sponsor_processing | visa_application | destination_arrival]
issued_by: "[[issuing_body]]"
submitted_to: "[[receiving_body]]"
required_for_programmes: [j1_swt | uk_yms | canada_iec | all]
processing_time_official:
processing_time_reported:
cost_zar:
cost_programme_currency:
validity_period:
must_precede: []
evidence_strength: confirmed | alleged | rumoured
tags: [document, seasonal, work-abroad, south-africa]
sources:
  -
---

# Document Name

What this document is, what it proves, and at which stage of the process it is needed.

## How to Obtain
Step-by-step from the official source. Exact URL for application if available.

## Known Delays & Traps
Real-world processing issues specific to SA applicants; note any SA-specific requirements (e.g. apostille via DIRCO, SAPS CRC via police station vs. eSAPS).

## Sequencing Note
Which documents must be in hand before this one can be started; which documents it unblocks.

## Connections
- [[Issuing Body]] — issued_by, source: [url]
- [[Programme]] — required_for, source: [url]

## Sources
- [Source title](url)
```

**FEE note:**
```markdown
---
type: fee
name:
programme: [j1_swt | uk_yms | canada_iec]
amount_usd:
amount_gbp:
amount_cad:
amount_zar_approx:
exchange_rate_date:
paid_to:
paid_when:
refundable: [yes | no | partial]
evidence_strength: confirmed | alleged | rumoured
tags: [fee, seasonal, visa-cost, south-africa]
sources:
  -
---

# Fee Name

What this fee is for and when in the process it must be paid.

## Payment Method
How to pay (online, credit card, bank transfer) and to whom.

## Refund Policy
Whether this fee is refundable if the visa is denied or the programme is cancelled.

## Connections
- [[Programme]] — required_by, source: [url]

## Sources
- [Source title](url)
```

**EDGE metadata:**
- `relationship_type`: issued_by | submitted_to | required_for | precedes | follows | paid_to | unblocks
- `description`: short label
- `date_range`: if applicable
- `evidence_strength`: confirmed | alleged | rumoured
- `sources`: at least one URL

---

## Runtime rules

- `evidence_strength`: `confirmed` | `alleged` | `rumoured`
- **Sequence matters:** The DS-2019 cannot be issued until the sponsor has confirmed a job offer or job-match; the J1 visa cannot be applied for until the DS-2019 is issued; document this chain explicitly
- **SA university enrolment letter must be current** — issued by the student's SA institution, confirming full-time enrolment; prompts should confirm exact format requirements per sponsor (USIT vs CIEE may differ)
- **SEVIS fee is separate from sponsor programme fee** — USD ~$35, paid online at fmjfee.com before the J1 visa interview; document this distinctly
- **J1 visa interview at US Embassy or Consulate in South Africa** — appointment required; confirm current appointment locations (Pretoria and/or Cape Town); lead time varies seasonally; flag 2025–2026 processing times
- **UK YMS documents:** Standard requirements per gov.uk/youth-mobility/documents-you-must-provide are passport, proof of £2,530 funds, TB certificate (if applicable), and translations; criminal clearance certificate is NOT a standard listed requirement — verify current requirement via gov.uk before including; do not assume apostille is required for UK YMS
- **Canada IEC via Recognized Organization** — correct process: applicant gets RO confirmation letter, creates own IEC profile on IRCC portal, waits for Invitation to Apply (ITA), then uploads the RO letter with their work permit application; the RO does NOT submit to IRCC on the applicant's behalf — document these steps precisely
- All fees must be date-stamped with exchange rate date; ZAR conversions are estimates only
- Folder structure: `Documents/`, `Fees/`
