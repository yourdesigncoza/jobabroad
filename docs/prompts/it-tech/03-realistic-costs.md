# Prompt: IT / Tech — Realistic Costs

> Run with `/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-it-tech-03-costs`

---

/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-it-tech-03-costs

**Goal:** Build a verified, itemised cost reference for a South African ICT professional relocating to Ireland, the UK, Germany, Canada, or Australia — covering every fee from SA-side documentation (PCC, apostille, SAQA), skills assessment / qualification recognition (WES, ACS, ZAB), language test, visa fees, flight, and first-month relocation, presented as low / mid / high scenarios per destination, and noting which costs employers typically cover (relocation allowance, visa sponsorship fee paid by employer, Certificate of Sponsorship costs).

**Seed entities:**
- Ireland CSEP application fee (€1,000 — 90% refunded if refused)
- UK Skilled Worker visa fees + Immigration Health Surcharge (IHS, paid up front for full visa duration)
- Germany Opportunity Card blocked account (€1,091/mo in 2026 — applies ONLY to the Opportunity Card / job-search route; Blue Card / Skilled Worker Visa with a qualifying job offer does not require a blocked account)
- WES ECA fee (C$264 base + delivery + 13% HST where applicable) + courier of SA transcripts; also CES, ICAS, IQAS, ICES (IRCC-designated alternatives with different fee schedules)
- ACS Migration Skills Assessment fees (effective Nov 2025): pathway-specific — Temporary Graduate / RPL ≈ AUD$625; Post-Australian-Study ≈ AUD$1,136; Skills-Based (General) ≈ AUD$1,498; priority processing +AUD$150 (excl. GST) — confirm against acs.org.au/msa/infohub/fees-and-payment.html
- UK Immigration Skills Charge (employer-paid, BY LAW) and CoS fees (employer-paid)
- Australia Skills in Demand visa (subclass 482) application fee — replaced TSS on 7 Dec 2024; Skilling Australians Fund (SAF) levy is employer-paid

**Source constraints:** enterprise.gov.ie (Ireland CSEP fee schedule + ICT permit fees), gov.uk/skilled-worker-visa (UK visa fee tables — including IHS), gov.uk/immigration-skills-charge, gov.uk/certificate-sponsorship (employer-paid CoS), make-it-in-germany.com (German visa fee + blocked-account figure for 2026), auswaertiges-amt.de (German national visa fees), southafrica.diplo.de (German Embassy Pretoria — country-specific VFS / consular service fees), canada.ca/en/immigration-refugees-citizenship (Express Entry fees, RPRF, biometrics), canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/documents/education-assessed.html (IRCC designated ECA organisations + their fee pages — WES is one option), wes.org (ECA fee schedule), ielts.org, celpip.ca, pearsonpte.com (English-test fees for AU/UK/CA), acs.org.au/msa/infohub/fees-and-payment.html (ACS Migration Skills Assessment fee schedule — pathway-specific), immi.homeaffairs.gov.au (482, 186, 189 fee schedules), homeaffairs.gov.au/saf (Skilling Australians Fund levy — employer-paid), saps.gov.za (PCC fee), dirco.gov.za (apostille service — FREE; courier / agent fees separate), saqa.org.za (SA Verifications Service / Individual Verification Letter fee), vfsglobal.com/za (submission centre fee per consulate), Google Flights ZAR estimates for JNB→DUB / LHR / FRA / YYZ / SYD, Numbeo.com for first-month relocation estimates (flag as anecdotal)

**Iterations:** 6

---

## Note schemas

**COST ITEM note:**
```markdown
---
type: cost_item
name:
category: [sa_documentation | skills_assessment | language_test | visa | immigration_surcharge | flight | first_month_relocation | employer_covered]
destination: [Ireland | UK | Germany | Canada | Australia | all]
amount_zar:
amount_destination_currency:
exchange_rate_date:
paid_by: [applicant | employer | shared]
one_off_or_recurring: [one_off | recurring_annual | recurring_other]
refundable_if_refused: [yes — partial | yes — full | no]
evidence_strength: confirmed | alleged | rumoured
tags: [cost, ict, work-abroad, relocation]
sources:
  -
---

# Cost Item Name

What this cost is for and when in the pathway it is incurred. Note the official source URL inline.

## Amount (as of [date])
- ZAR equivalent (at ZAR/[currency] exchange rate on [date]): R[amount]
- Local currency: [amount] [currency]

## Who Pays
Whether the applicant pays this directly or the sponsoring employer typically covers it (cite UK Immigration Skills Charge as employer-only; cite typical Irish multinational relocation packages where available).

## Connections
- [[Document / Visa Route]] — cost_of, source: [url]

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
dependants_count: 0
visa_route: "[[visa_route_name]]"
employer_contribution_zar:
net_out_of_pocket_zar:
includes_blocked_account: [yes | no | n/a]
evidence_strength: alleged
tags: [cost-scenario, ict, work-abroad]
sources:
  -
---

# Cost Scenario: [Destination] — [Low / Mid / High]

Summary of assumptions and total cost in ZAR for an SA ICT professional in this scenario.

## Breakdown
| Category | Amount (ZAR) | Paid by |
|---|---|---|
| SA documentation (PCC, apostille, SAQA) | | |
| Skills assessment (WES / ACS / ZAB) | | |
| Language test | | |
| Visa application + biometrics | | |
| Immigration health surcharge (UK only) | | |
| Germany blocked account (Germany only) | | |
| Flights (JNB → destination) | | |
| First month relocation | | |
| **Total** | | |

## Typical Employer Contribution
What Dublin tech sponsors / UK licensed sponsors / German Blue Card employers / Canadian PNP employers / Australian 482 sponsors typically cover (cite job adverts / federal guidance where available). Note that the UK Immigration Skills Charge is BY LAW employer-only.

## Net Out-of-Pocket
[ZAR figure]

## Sources
- [Source title](url)
```

**EDGE metadata:**
- `relationship_type`: cost_of | covered_by | part_of_scenario | varies_by | employer_pays | refundable
- `description`: short label
- `evidence_strength`: confirmed | alleged | rumoured
- `sources`: at least one URL

---

## Runtime rules

- All ZAR conversions must be dated — exchange rate at time of research
- Distinguish CONFIRMED fees (from official fee schedules: enterprise.gov.ie, gov.uk, immi.homeaffairs.gov.au, canada.ca, make-it-in-germany.com) from ESTIMATED costs (flights, first-month rent — flag evidence_strength: alleged)
- The Germany Opportunity Card blocked-account requirement (€1,091/mo × 12 months = ~€13,092 in 2026) is the single largest line item for the Germany OPPORTUNITY CARD scenario only — Germany Blue Card / Skilled Worker Visa applicants with a qualifying job offer DO NOT need a blocked account; do not include it for those routes
- UK IHS, visa fees, biometrics, flights, and relocation costs change materially with dependants — every COST_SCENARIO must specify dependants_count and the visa_route to which it applies
- UK IHS surcharge is paid up front for the full visa duration — itemise this separately at the current rate
- UK Immigration Skills Charge is BY LAW paid by the employer, NOT the applicant — never include in applicant out-of-pocket
- Always note if an Irish / UK / German / Canadian / Australian employer typically covers a cost — this changes the applicant's actual outlay significantly
- Cite a primary source for every confirmed figure; do not promote a non-primary citation to confirmed
- Folder structure: `Cost Items/`, `Cost Scenarios/`
