# Prompt: SA Tax & Exchange Control

> Run with `/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-shared-tax-exchange`

---

/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-shared-tax-exchange

**Goal:** Build a clear, source-verified reference of the South African tax and exchange control obligations every SA professional must understand before and during working abroad — covering the 183-day rule, tax residency cessation, SARS emigration tax clearance, SARB foreign investment allowances, and how to keep banking and retirement funds accessible while abroad.

**Seed entities:**
- SARS Tax Clearance Certificate (Emigration / Foreign Investment)
- 183-day tax rule (ordinary residence vs physical presence test)
- Financial Emigration (formal SARB process — note: replaced by tax residency cessation from 2021)
- SARB Single Discretionary Allowance (R1m/year)
- SARB Foreign Capital Allowance (R10m/year)
- SA tax treaties (double taxation agreements — DTA)
- Retirement annuity / pension fund access from abroad

**Source constraints:** sars.gov.za, resbank.co.za (SARB), treasury.gov.za, sa-legislation.up.ac.za (Income Tax Act), FinGlobal (expat tax specialists — cite as expert commentary), Exchange4Free, Rand Rescue, any Big Four SA firm (Deloitte, PwC, KPMG, EY) tax guides citing primary legislation, South African Institute of Tax Professionals (sait.org.za)

**Iterations:** 8

---

## Note schemas

**TAX CONCEPT note:**
```markdown
---
type: tax_concept
name:
aliases: []
governing_legislation:
applicable_to:
threshold_or_trigger:
sa_tax_implication:
destination_interaction:
last_amended:
evidence_strength: confirmed | alleged | rumoured
tags: [tax, sars, work-abroad, exchange-control]
sources:
  -
---

# Tax Concept Name

2–4 sentence plain-language explanation of what this rule is and when it applies to an SA professional working abroad.

## How It Works
Mechanics of the rule — thresholds, timelines, tests applied.

## What the Professional Must Do
Specific steps required (file, apply, notify SARS/SARB, etc.).

## Interaction With Destination Country Tax
How this rule interacts with the destination country's tax rules (double taxation agreement, foreign tax credit, etc.).

## Common Mistakes
Known errors SA professionals make — cite professional commentary.

## Connections
- [[Governing Legislation]] — governed_by, source: [url]
- [[SARS]] — administered_by, source: [url]

## Sources
- [Source title](url)
```

**REGULATION note:**
```markdown
---
type: regulation
name:
short_name:
jurisdiction: South Africa
governing_body: "[[sars_or_sarb]]"
enacted_date:
last_amended:
what_it_regulates:
key_thresholds: []
permitted_without_approval: []
requires_application_or_approval: []
penalty_for_non_compliance:
evidence_strength: confirmed
tags: [regulation, tax, exchange-control, work-abroad]
sources:
  -
---

# Regulation Name

Plain-language summary of what this regulation controls and who it affects.

## Key Thresholds
Annual allowances, time limits, monetary caps.

## What Requires SARS / SARB Approval
What a professional must formally apply for before moving money or ceasing tax residency.

## Penalty for Non-Compliance

## Connections
- [[Governing Body]] — enforced_by, source: [url]

## Sources
- [Source title](url)
```

**FINANCIAL PRODUCT note:**
```markdown
---
type: financial_product
name:
provider_type: [bank | insurer | fund_administrator]
relevant_for_expats: [yes | no]
accessible_from_abroad: [yes | no | conditions_apply]
sa_account_retention: [allowed | restricted | must_close]
repatriation_rules:
evidence_strength: confirmed | alleged | rumoured
tags: [financial-product, banking, work-abroad, expat]
sources:
  -
---

# Financial Product Name

What it is, who offers it, and the key considerations for an SA professional working abroad.

## Accessing from Abroad
Steps and conditions for maintaining or accessing this product while living overseas.

## Repatriation Rules
What applies when bringing funds back to SA.

## Connections
- [[Regulation]] — governed_by, source: [url]

## Sources
- [Source title](url)
```

**EDGE metadata:**
- `relationship_type`: governed_by | administered_by | exempted_under | triggered_by | interacts_with | supersedes
- `description`: short label
- `date_range`: if applicable
- `evidence_strength`: confirmed | alleged | rumoured
- `sources`: at least one URL

---

## Runtime rules

- `evidence_strength`: `confirmed` only for legislative positions; `alleged` for professional commentary not yet tested in court
- Note that "Financial Emigration" as a SARB process was replaced from 1 March 2021 — flag any outdated references
- Every threshold (R1m allowance, 183-day rule, etc.) must be dated — these are changed by annual budget
- Plain-language explanations are required alongside legal citations — this content is for professionals, not tax lawyers
- Folder structure: `Tax Concepts/`, `Regulations/`, `Financial Products/`
