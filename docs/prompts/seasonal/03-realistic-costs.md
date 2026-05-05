# Prompt: Seasonal — Realistic Costs

> Run with `/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-seasonal-03-costs`

---

/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-seasonal-03-costs

**Goal:** Build a verified, itemised cost breakdown for a South African applying to the J1 Summer Work Travel programme (USA), the UK Youth Mobility Scheme, or the Canada IEC Working Holiday — covering sponsor fees, government visa fees, mandatory savings requirements, flights, and first-month living costs, presented as low / mid / high scenarios.

**Seed entities:**
- J1 sponsor programme fee — USIT / CIEE / STS (programme cost including SEVIS, insurance, orientation)
- UK Youth Mobility Scheme visa fee (~£259) and mandatory £2,500 savings requirement
- Canada IEC Recognized Organization fee (SWAP Working Holidays / GO International)
- US Embassy Pretoria J1 visa MRV fee (~USD $160)
- First-month living costs at typical J1 destination (Disney World / Florida resort area)

**Source constraints:** j1online.ie (USIT fee schedule), ciee.org (programme fees), gov.uk/youth-mobility (visa fee + financial requirement), ircc.canada.ca/iec (application fee), swapworkingholidays.org, za.usembassy.gov (MRV fee), fmjfee.com (SEVIS fee), Numbeo.com (Orlando FL, London, Toronto cost of living estimates — flag as anecdotal)

**Iterations:** 6

---

## Note schemas — apply to every note created

**COST ITEM note:**
```markdown
---
type: cost_item
name:
category: [sponsor_programme | government_fee | mandatory_savings | insurance | flight | first_month_living | other]
programme: [j1_swt | uk_yms | canada_iec | all]
amount_zar_approx:
amount_programme_currency:
exchange_rate_date:
paid_to:
paid_by: [applicant | employer | shared]
one_off_or_recurring: [one_off | annual | monthly]
refundable: [yes | no | partial]
evidence_strength: confirmed | alleged | rumoured
tags: [cost, seasonal, work-abroad, south-africa]
sources:
  -
---

# Cost Item Name

What this cost is for and when in the process it is incurred.

## Amount
- ZAR equivalent (at [exchange rate date]): R[amount]
- Programme currency: [amount] [currency]

## Notes
Whether this cost is mandatory vs optional; whether the employer/host covers any portion.

## Connections
- [[Programme]] — required_by, source: [url]

## Sources
- [Source title](url)
```

**COST SCENARIO note:**
```markdown
---
type: cost_scenario
name:
programme:
scenario: [low | mid | high]
total_zar_approx:
assumptions: []
employer_or_host_contribution_zar:
net_out_of_pocket_zar:
evidence_strength: alleged
tags: [cost-scenario, seasonal, work-abroad]
sources:
  -
---

# Cost Scenario: [Programme] — [Low / Mid / High]

Summary of assumptions and total cost for this scenario.

## Breakdown
| Category | Amount (ZAR approx.) | Paid by |
|---|---|---|
| Sponsor/programme fee | | Applicant |
| Government visa fee | | Applicant |
| SEVIS / mandatory savings | | Applicant |
| Insurance | | |
| Flights (return) | | |
| First month living | | |
| **Total before earnings** | | |

## What the Host/Employer Typically Covers
Note if Disney, resort chains, or Canadian employers cover accommodation, meals, or transport — cite actual J1 programme employer documentation if available.

## When You Start Earning
Approximate timeline from departure to first paycheck; typical J1 hourly rate in USD.

## Sources
- [Source title](url)
```

**EDGE metadata:**
- `relationship_type`: required_by | covered_by | part_of_scenario | varies_by | offset_by_earnings
- `description`: short label
- `evidence_strength`: confirmed | alleged | rumoured
- `sources`: at least one URL

---

## Runtime rules

- All ZAR conversions must be dated — exchange rate at time of research (May 2026); flag as estimates
- **Mandatory savings vs. spending money:** UK YMS requires £2,500 in an accessible bank account at the time of application — this is a visa eligibility requirement, not a recommendation; document it as such
- **J1 total outlay estimate:** SEVIS fee (~USD $35) + sponsor programme fee (~USD $500–1,500 depending on agency and job-placement inclusion) + MRV embassy fee (~USD $160) + flights (~ZAR 20,000–30,000 return) + first-month accommodation (typically provided by employer for Disney/resort J1 at a deduction from wages); document each item separately
- **J1 earnings offset:** J1 participants typically earn USD $12–$18/hour for 32–40 hours/week; the cost section must note that earnings may offset part of the outlay — but do not state a fixed timeline; offset depends on hours worked, pay cycle, tax withholding, rent/meal deductions, and start date relative to programme end
- **UK YMS first-month note:** No job offer required before arrival; applicant must fund their own accommodation until employment found; estimate London vs. regional UK first-month costs separately
- Distinguish confirmed fees (from official fee schedules) from estimated costs (flights, accommodation); flag estimates with `evidence_strength: alleged`
- Folder structure: `Cost Items/`, `Cost Scenarios/`
