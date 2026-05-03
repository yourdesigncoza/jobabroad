# Prompt: SA Regulatory Bodies

> Run with `/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-shared-regulatory-bodies`

---

/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-shared-regulatory-bodies

**Goal:** Build a verified reference of South African professional regulatory bodies relevant to work-abroad pathways — covering what certificate or letter each body issues, the process and cost to obtain it, whether it ships direct to the destination regulator or to the professional, which destination regulators accept it, and any mutual recognition agreements (MRAs) in place.

**Seed entities:**
- SANC (South African Nursing Council)
- SACE (South African Council for Educators)
- SAICA (South African Institute of Chartered Accountants)
- ECSA (Engineering Council of South Africa)
- HPCSA (Health Professions Council of South Africa)
- PSIRA (Private Security Industry Regulatory Authority)

**Source constraints:** sanc.co.za, sace.org.za, saica.co.za, ecsa.co.za, hpcsa.co.za, psira.co.za, official destination regulator sites (nmc.org.uk, ahpra.gov.au, nmbi.ie, aitsl.edu.au, engineersaustralia.org.au, icaew.com, caanz.com, cpacanda.ca), gov.za official gazette for any SA legislation, SA professional forums and expat groups for real processing time data (flag as anecdotal)

**Iterations:** 10

---

## Note schemas

**REGULATORY BODY note:**
```markdown
---
type: regulatory_body
name:
short_name:
profession_regulated:
founding_legislation:
certificate_or_letter_issued:
application_method: [online | in_person | postal]
contact_url:
processing_time_official:
processing_time_reported:
cost_zar:
direct_shipping_required: [yes — ships direct to destination regulator | no — issued to professional | destination_dependent]
evidence_strength: confirmed
tags: [regulatory-body, sa-professional, work-abroad]
sources:
  -
---

# Regulatory Body Name

2–4 sentence summary: profession regulated, SA legal mandate, role in the work-abroad process.

## Certificate / Letter Issued
What the document is called, what it confirms, and what format it takes (letter, certificate, digital).

## How to Apply
Step-by-step process from the official website.

## Shipping & Delivery
Whether the certificate is issued to the professional or sent directly to the destination regulator. This is a critical logistical trap — document exactly.

## Real Processing Times
Official stated time vs. reported real-world time from professional forums. Cite anecdotal sources clearly.

## Destination Acceptance
Which destination regulators accept this body's certification, and under what conditions.

## Mutual Recognition Agreements
Any formal MRAs with destination professional bodies (list destination body, scope, and date of agreement).

## Common Delays & Pitfalls

## Connections
- [[Destination Regulator]] — mra_with | certificate_accepted_by, source: [url]
- [[Profession]] — regulates, source: [url]

## Sources
- [Source title](url)
```

**MUTUAL RECOGNITION AGREEMENT note:**
```markdown
---
type: mutual_recognition_agreement
name:
sa_body: "[[sa_regulatory_body]]"
destination_body: "[[destination_regulatory_body]]"
destination_country:
profession:
scope:
date_signed:
expiry_date:
exemptions_granted:
evidence_strength: confirmed | alleged | rumoured
tags: [mra, work-abroad, professional-recognition]
sources:
  -
---

# MRA: [SA Body] ↔ [Destination Body]

Summary of what the agreement covers and what it exempts the SA professional from (exams, assessments, additional training).

## Scope
What qualifications are covered and any exclusions.

## How to Invoke
Process for an SA professional to use the MRA when applying to the destination regulator.

## Connections
- [[SA Regulatory Body]] — party_to, source: [url]
- [[Destination Regulatory Body]] — party_to, source: [url]

## Sources
- [Source title](url)
```

**EDGE metadata:**
- `relationship_type`: regulates | issues_certificate | mra_with | certificate_accepted_by | party_to | supersedes | ships_direct_to
- `description`: short label
- `date_range`: if applicable
- `evidence_strength`: confirmed | alleged | rumoured
- `sources`: at least one URL

---

## Runtime rules

- `evidence_strength`: `confirmed` | `alleged` | `rumoured`
- `direct_shipping_required` is mandatory — do not leave blank; this affects the professional's entire document coordination plan
- Flag any MRA that has an expiry date or is under review
- Processing times must show both official and real-world figures — they often differ by months
- Folder structure: `Regulatory Bodies/`, `Mutual Recognition Agreements/`
