# Prompt: Regulatory Boundary

> Run with `/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-shared-legal-boundary`

---

/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-shared-legal-boundary

**Goal:** Build a clear, source-cited reference of the legal boundary between permitted immigration information services and regulated immigration advice — covering OISC (UK), MARA (Australia), IAA (New Zealand), RCIC (Canada), Ireland, and SA law — so that Jobabroad can operate confidently as an information product without crossing into regulated advice territory, including the specific disclaimer language each regulator expects.

**Seed entities:**
- OISC (Office of the Immigration Services Commissioner — UK)
- MARA (Migration Agents Registration Authority — Australia)
- IAA (Immigration Advisers Authority — New Zealand)
- RCIC / CICC (Regulated Canadian Immigration Consultants — Canada)
- SA Immigration Act 13 of 2002
- Consumer Protection Act 68 of 2008 (SA)
- Ireland — Department of Justice immigration adviser rules

**Source constraints:** oisc.gov.uk, mara.gov.au, iaa.govt.nz, college-ic.ca, gov.za official legislation (justice.gov.za, labour.gov.za), Department of Justice Ireland (justice.ie), UK Legal Services Act guidance, any SA legal firm immigration commentary citing primary legislation, Law Society of SA guidance

**Iterations:** 8

---

## Note schemas

**REGULATION note:**
```markdown
---
type: regulation
name:
short_name:
jurisdiction:
governing_body: "[[regulatory_body_name]]"
enacted_date:
last_amended:
what_it_regulates:
permitted_without_registration: []
prohibited_without_registration: []
standard_disclaimer_required:
penalty_for_breach:
evidence_strength: confirmed
tags: [regulation, immigration-law, work-abroad, compliance]
sources:
  -
---

# Regulation Name

2–4 sentence summary: what it regulates, who it applies to, what the threshold is between permitted and prohibited.

## Permitted (No Registration Required)
Bullet list of activities explicitly permitted for unregistered parties.

## Prohibited (Registration Required)
Bullet list of activities that require registration/accreditation.

## Safe Harbour for Information Products
Specific language from the regulation or official guidance that defines the safe zone for an information-only service.

## Standard Disclaimer
Exact or paraphrased disclaimer text the regulator expects on information-only material. Quote from primary source where possible.

## Penalty for Breach
What happens if the boundary is crossed.

## Connections
- [[Regulatory Body]] — enforced_by, source: [url]

## Sources
- [Source title](url)
```

**REGULATORY BODY note:**
```markdown
---
type: regulatory_body
name:
short_name:
jurisdiction:
category: [immigration_regulator | consumer_protection | legal_services]
what_it_oversees:
registration_requirement:
public_register_url:
evidence_strength: confirmed
tags: [regulatory-body, immigration-regulator, compliance]
sources:
  -
---

# Regulatory Body Name

Summary of mandate, jurisdiction, and what it regulates.

## Who Must Register
Criteria for mandatory registration.

## Public Register
Link to searchable register of registered practitioners.

## Connections
- [[Regulation]] — enforces, source: [url]

## Sources
- [Source title](url)
```

**EDGE metadata:**
- `relationship_type`: enforced_by | governed_by | exempted_from | supersedes | referenced_in
- `description`: short label
- `evidence_strength`: confirmed | alleged | rumoured
- `sources`: at least one URL

---

## Runtime rules

- `evidence_strength`: `confirmed` only — this is compliance-critical; no rumoured or alleged for legal positions
- `standard_disclaimer_required` is mandatory — find the exact or recommended language for each jurisdiction
- Every permitted/prohibited boundary claim must cite primary legislation or official regulator guidance — no secondary commentary alone
- Flag any regulation that has been recently amended or is under review
- Folder structure: `Regulations/`, `Regulatory Bodies/`
