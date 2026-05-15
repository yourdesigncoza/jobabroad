# Prompt: Engineering — Realistic Costs

> Run with `/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-engineering-03-costs`

---

/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-engineering-03-costs

**Goal:** Build a verified, itemised cost reference for a South African engineer relocating to Australia, Ireland, the UK, New Zealand, or Canada — covering every fee from SA-side documentation through skills assessment, visa, flight, and first-month relocation costs, presented as low / mid / high scenarios, and noting what employers typically cover.

**Seed entities:**
- Engineers Australia Migration Skills Assessment fees (Accord pathway vs CDR pathway, 2025–26 schedule)
- WES Educational Credential Assessment fee (Canada ECA)
- Australia Skills in Demand Visa (Subclass 482) application fee
- UK Skilled Worker Visa fee + Immigration Health Surcharge + maintenance funds
- SAPS Police Clearance Certificate fee
- DIRCO apostille / document legalisation fee
- IELTS Academic / Pearson PTE Academic test fees

**Source constraints:** engineersaustralia.org.au (assessment fees and additional services page — note ex-GST vs incl-GST columns), ecsa.co.za (accredited programme lists) and ieagreements.org (IEA qualification checker for Accord eligibility), wes.org (ECA fee schedule), immi.homeaffairs.gov.au (visa pricing estimator), gov.uk (visa fee schedule and Immigration Health Surcharge), enterprise.gov.ie (employment permit fee) and irishimmigration.ie (Long Stay 'D' visa and Irish Residence Permit fees), immigration.govt.nz (AEWV and residence visa fees) and nzqa.govt.nz (NZ International Qualification Assessment fee), canada.ca (Express Entry, PR application, biometrics and medical fees), ielts.org, pearsonpte.com, saps.gov.za, dirco.gov.za, Google Flights ZAR estimates, Numbeo.com (first-month relocation estimates — flag as estimate, not confirmed fee)

**Iterations:** 6

---

## Note schemas — apply to every note created

**COST ITEM note:**
```markdown
---
type: cost_item
name:
category: [sa_documentation | skills_assessment | language_test | visa | health_surcharge | biometrics | medical_exam | residence_registration | flight | relocation | employer_covered]
destination: [Australia | Ireland | UK | New Zealand | Canada | all]
amount_zar:
amount_destination_currency:
exchange_rate_date:
paid_by: [engineer | employer | shared]
one_off_or_recurring: [one_off | recurring_annual | recurring_other]
evidence_strength: confirmed | alleged | rumoured
tags: [cost, engineering, work-abroad, relocation]
sources:
  -
---

# Cost Item Name

What this cost is for and when in the process it is incurred.

## Amount
- ZAR equivalent (at [exchange rate date]): R[amount]
- Local currency: [amount] [currency]

## Who Pays
Whether the engineer pays this or the employer covers it. Note typical employer relocation/sponsorship contributions.

## Connections
- [[Document, Assessment or Visa]] — cost_of, source: [url]

## Sources
- [Source title](url)
```

**COST SCENARIO note:**
```markdown
---
type: cost_scenario
name:
destination:
scenario: [low | mid | high]
total_zar:
assumptions: []
employer_contribution_zar:
net_out_of_pocket_zar:
evidence_strength: alleged
tags: [cost-scenario, engineering, work-abroad]
sources:
  -
---

# Cost Scenario: [Destination] — [Low / Mid / High]

Summary of assumptions and total cost for this scenario.

## Breakdown
| Category | Amount (ZAR) | Paid by |
|---|---|---|
| SA documentation (PCC, apostille, transcripts) | | |
| Skills assessment (EA / WES / IQA) | | |
| Language test (IELTS / PTE) | | |
| Visa / permit fee | | |
| Health surcharge (where applicable) | | |
| Flights | | |
| First month relocation | | |
| **Total** | | |

## Typical Employer Contribution
What sponsoring employers in this destination typically cover (cite job adverts or official guidance).

## Net Out-of-Pocket

## Sources
- [Source title](url)
```

**EDGE metadata (record on every direct verifiable connection):**
- `relationship_type`: cost_of | covered_by | part_of_scenario | varies_by
- `description`: short label
- `evidence_strength`: confirmed | alleged | rumoured
- `sources`: at least one URL

---

## Runtime rules for vault-builder

- `evidence_strength`: `confirmed` | `alleged` | `rumoured`
- Every note and every connection must cite at least one source URL
- All ZAR conversions must be dated — record the exchange rate date at time of research
- Distinguish confirmed fees (from official fee schedules) from estimated costs (flights, relocation) — never present an estimate as a confirmed figure
- **Separate the SA-side spend** (ECSA documents, SAPS police clearance, DIRCO apostille, IELTS/PTE) **from the destination-side spend** (skills assessment, visa fee, health surcharge, maintenance funds) — the buyer needs both totals distinctly.
- **Engineers Australia fees, 2025–26 financial year — GST matters.** Engineers Australia quotes fees both ex-GST and incl-GST. GST does not normally apply to applicants assessed from outside Australia, so a South African applicant's baseline is usually the **ex-GST** figure: CDR pathway ≈AUD $910, Accord pathway (Washington / Sydney / Dublin) ≈AUD $490, Australian-accredited qualification ≈AUD $305, Fast Track add-on ≈AUD $350. The incl-GST equivalents are ≈AUD $1,001 / $539 / $335.50 / $385. **Record both, label which is which, and instruct the reader to confirm on the Engineers Australia fee page whether GST applies to their application.** Engineers Australia has announced a 3–4% fee increase effective 1 July 2026 — date-stamp every fee and flag the upcoming increase.
- The Accord-vs-CDR fee gap (ex-GST ≈AUD $490 vs $910) is the single highest-value cost insight for SA engineers — make it explicit. Tie it to Accord eligibility, which is not automatic for any "ECSA-accredited degree": it depends on the specific programme's IEA Washington / Sydney / Dublin Accord recognition, qualification category, and graduation year (SA's Washington Accord signatory date is 1999) — verifiable via the IEA qualification checker / ECSA accredited-programme list.
- **Canada PR fees increased effective 30 April 2026** — use the post-30-April-2026 figures and date-stamp them.
- Always note where a sponsoring employer typically covers a cost — this materially changes the engineer's actual outlay.
- Folder structure: `Cost Items/`, `Cost Scenarios/`

<!--
## Canvas export (on-demand only — do not generate unless explicitly requested)
-->
