# Prompt: Nursing — Realistic Costs

> Run with `/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-nursing-03-costs`

---

/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-nursing-03-costs

**Goal:** Build a verified, itemised cost reference for a South African nurse relocating to the UK, Australia, or Ireland — covering every fee from SA-side documentation through registration, visa, flight, and first-month relocation costs, presented as low / mid / high scenarios, and noting what employers typically cover.

**Seed entities:**
- NMC registration fees (UK)
- AHPRA registration fees (Australia)
- Health and Care Worker Visa fee (UK)
- NHS relocation package (what NHS trusts typically offer)
- OET / IELTS exam fees
- SANC certificate fees
- VFS Global submission fees (SA)

**Source constraints:** nmc.org.uk (fee schedule), ahpra.gov.au (fee schedule), gov.uk (visa fee schedule), homeaffairs.gov.au, nhsemployers.org (relocation guidance), oet.com, ielts.org, vfsglobal.com/za, Google Flights ZAR estimates, Numbeo.com for first-month relocation estimates, SA expat Facebook groups for real-world cost reports (flag as anecdotal), NHS job adverts mentioning relocation packages

**Iterations:** 8

---

## Note schemas

**COST ITEM note:**
```markdown
---
type: cost_item
name:
category: [sa_documentation | registration | exam | visa | flight | relocation | employer_covered]
destination: [UK | Australia | Ireland | all]
amount_zar:
amount_destination_currency:
exchange_rate_date:
paid_by: [nurse | employer | shared]
one_off_or_recurring: [one_off | recurring_annual | recurring_other]
evidence_strength: confirmed | alleged | rumoured
tags: [cost, nursing, work-abroad, relocation]
sources:
  -
---

# Cost Item Name

What this cost is for and when in the process it is incurred.

## Amount
- ZAR equivalent (at [exchange rate date]): R[amount]
- Local currency: [amount] [currency]

## Who Pays
Whether the nurse pays this or the employer covers it. Note if NHS/hospital relocation packages typically include this.

## Connections
- [[Document or Visa]] — cost_of, source: [url]

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
tags: [cost-scenario, nursing, work-abroad]
sources:
  -
---

# Cost Scenario: [Destination] — [Low / Mid / High]

Summary of assumptions and total cost for this scenario.

## Breakdown
| Category | Amount (ZAR) | Paid by |
|---|---|---|
| SA documentation | | |
| Registration fees | | |
| Exam fees | | |
| Visa fees | | |
| Flights | | |
| First month relocation | | |
| **Total** | | |

## Typical Employer Contribution
What NHS / Australian hospital / Irish HSE recruitment packages typically cover (cite job adverts or NHS guidance).

## Net Out-of-Pocket

## Sources
- [Source title](url)
```

**EDGE metadata:**
- `relationship_type`: cost_of | covered_by | part_of_scenario | varies_by
- `description`: short label
- `evidence_strength`: confirmed | alleged | rumoured
- `sources`: at least one URL

---

## Runtime rules

- All ZAR conversions must be dated — exchange rate at time of research
- Distinguish confirmed fees (from official fee schedules) from estimated costs (flights, relocation)
- Always note if an NHS trust or equivalent employer typically covers a cost — this changes the nurse's actual outlay significantly
- Folder structure: `Cost Items/`, `Cost Scenarios/`
