# Prompt: Teaching — Realistic Costs

> Run with `/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-teaching-03-costs`

---

/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-teaching-03-costs

**Goal:** Build a verified, itemised cost reference for a South African school teacher relocating to the UK, Australia, or New Zealand — covering every fee from SA-side documentation through qualification recognition, visa, flight, and first-month relocation costs, presented as low / mid / high scenarios, and noting what employers typically cover.

**Seed entities:**
- SACE Letter of Good Standing (R400 administrative fee; required for UK QTS application and overseas recognition)
- AITSL skills assessment fee (AUD $1,154 single flat rate from 1 July 2025 — verify current fee on aitsl.edu.au/migrate-to-australia/fees; no longer split by primary/secondary)
- UK Skilled Worker Visa fee (government immigration fee; see gov.uk/skilled-worker-visa/how-much-it-costs)
- UK DfE International Relocation Payment [CLOSED - do not recommend for new teachers]: IRP pilot ended; no new applications for teacher starts from 1 June 2025. Only legacy second-payment claims remain open to 30 June 2026. Was £10,000 total for shortage subjects (languages and physics only, not Computing)
- IELTS Academic exam fee (required for AITSL assessment in Australia; not IELTS General)

**Source constraints:** sace.org.za, aitsl.edu.au/migrate-to-australia/apply-for-a-skills-assessment, aitsl.edu.au/migrate-to-australia/fees, gov.uk/skilled-worker-visa/how-much-it-costs, gov.uk/healthcare-immigration-application, gov.uk/guidance/qualified-teacher-status-qts, teachingcouncil.nz, immigration.govt.nz, homeaffairs.gov.au, vfsglobal.com/za, ecctis.com, Numbeo.com for first-month relocation estimates, tes.com and eteach.com job adverts mentioning relocation packages, SA teacher expat Facebook groups (flag as anecdotal)

**Iterations:** 6

---

## Note schemas

**COST ITEM note:**
```markdown
---
type: cost_item
name:
category: [sa_documentation | qualification_recognition | exam | visa | flight | relocation | employer_covered]
destination: [UK | Australia | New Zealand | all]
amount_zar:
amount_destination_currency:
exchange_rate_date:
paid_by: [teacher | employer | shared]
one_off_or_recurring: [one_off | recurring_annual | recurring_other]
evidence_strength: confirmed | alleged | rumoured
tags: [cost, teaching, work-abroad, relocation]
sources:
  -
---

# Cost Item Name

What this cost is for and when in the process it is incurred.

## Amount
- ZAR equivalent (at [exchange rate date]): R[amount]
- Local currency: [amount] [currency]

## Who Pays
Whether the teacher pays this or the employer covers it. Note if DfE relocation payment, school relocation allowance, or equivalent employer package typically includes this item.

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
tags: [cost-scenario, teaching, work-abroad]
sources:
  -
---

# Cost Scenario: [Destination] — [Low / Mid / High]

Summary of assumptions and total cost for this scenario.

## Breakdown
| Category | Amount (ZAR) | Paid by |
|---|---|---|
| SA documentation | | |
| Qualification recognition / skills assessment | | |
| Exam fees (IELTS Academic if applicable) | | |
| Visa fees | | |
| Flights | | |
| First month relocation | | |
| **Total** | | |

## Typical Employer Contribution
What UK schools / Australian state-system schools / NZ schools or recruitment agencies typically cover (cite job adverts or official DfE guidance on relocation payments).

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

- Date-stamp all costs, thresholds, and occupation-list statuses — these change annually
- Flag any closed or suspended routes explicitly as [CLOSED - do not recommend]
- Never present agent estimates as confirmed figures; source must be a government or regulator URL
- If a source is older than 12 months, flag evidence_strength as alleged unless confirmed by a recent primary source
- All ZAR conversions must be dated — exchange rate at time of research
- Distinguish confirmed fees (official fee schedules) from estimated costs (flights, relocation)
- **QTS is free from August 2025:** DfE online QTS application has no fee — any source referencing a DfE QTS fee is outdated; flag accordingly
- **AITSL assessment cost:** Verify current fees on aitsl.edu.au/migrate-to-australia/fees — AITSL now charges a single flat rate (AUD $1,154 from 1 July 2025); the former split between primary and secondary phases no longer applies; this is not covered by employers
- **UK salary context:** From September 2025, minimum qualified teacher salary outside London is £32,916 — note Inner London, Outer London, and Fringe supplements separately, as teachers targeting London schools face higher local salary costs but also higher salary receipts
- **UK relocation payment [CLOSED]:** The DfE International Relocation Payment (IRP) pilot has ended — no new applications accepted for teacher starts from 1 June 2025. Research whether any replacement incentive exists; do not present IRP as available to new applicants
- **IELTS Academic only for AITSL:** IELTS General, PTE, TOEFL, and OET are not accepted — confirm current AITSL English language requirement; note the study exemption option if current
- Always note if a school or employer typically covers a cost — this changes the teacher's actual outlay significantly
- Folder structure: `Cost Items/`, `Cost Scenarios/`

<!--
## Canvas export (on-demand)
Generate canvas only when user explicitly requests "generate canvas".
-->
