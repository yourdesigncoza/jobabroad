# Prompt: Trades — Realistic Costs

> Run with `/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-trades-03-costs`

---

/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-trades-03-costs

**Goal:** Build a verified, itemised cost breakdown for a South African qualified tradesperson migrating to Australia (Skills in Demand 482), the UK (Skilled Worker via Temporary Shortage List), Canada (FSTP / Express Entry / PNP), or New Zealand (AEWV Green List Tier 2) — covering skills-assessment fees (TRA OSAP / MSA, provincial TEA, EWRB/PGDB), visa fees, document costs (QCTO, SAQA, DIRCO apostille, SAPS PCC, IELTS), travel for practical assessments where required, flights, and first-month relocation costs, presented as low / mid / high scenarios with ZAR conversions and explicit exchange-rate dates.

**Seed entities:**
- TRA fee scale — three distinct programmes with different fees: Migration Skills Assessment (MSA, currently AUD 795 — verify), TSS Skills Assessment Program (used for Subclass 482 nominations, fee per the TRA TSS schedule), and Offshore Skills Assessment Program (OSAP, fee scale by component including documentary, technical interview and practical assessment) — verify all current fees at tradesrecognitionaustralia.gov.au
- Australian Skills in Demand visa application fee — Subclass 482 (AUD primary applicant — confirm current at immi.homeaffairs.gov.au)
- UK Skilled Worker visa fee + Immigration Health Surcharge (IHS) — for TSL-eligible occupations on the Skilled Worker visa (gov.uk/skilled-worker-visa fee tables)
- Canada Express Entry / FSTP application fees (CAD per adult; right of permanent residence fee; provincial nominee program fees) — see canada.ca/en/immigration-refugees-citizenship/services/fees
- TRA practical assessment travel cost — practical-assessment locations vary by Registered Training Organisation (RTO) and trade; current TRA RTO Finder lists locations across Australia, the UK (e.g. Hammersmith / London / Lancashire / Cheshire), the Philippines, India and South Africa (e.g. Cape Town / Pretoria) — flights + accommodation + per-diem must be itemised based on the assigned RTO at the time of assessment

**Source constraints:** tradesrecognitionaustralia.gov.au (MSA, TSS Skills Assessment, OSAP fee schedules + RTO Finder for practical assessment locations), immi.homeaffairs.gov.au (visa fees, current schedule), gov.uk/skilled-worker-visa (fee + IHS calculator), gov.uk/government/publications/immigration-rules (Appendix Skilled Worker; Appendix Temporary Shortage List), gov.uk/government/publications/skilled-worker-visa-temporary-shortage-list, canada.ca/en/immigration-refugees-citizenship/services/fees, tradesecrets.alberta.ca (Alberta TEA fees), skilledtradesbc.ca (BC TEA fees), skilledtradesontario.ca (Ontario TEA fees), saskapprenticeship.ca, immigration.govt.nz (AEWV + residence fees), ewrb.govt.nz (electrician registration fees), pgdb.co.nz (plumber registration fees), lbp.govt.nz, wes.org (ECA fee — where required), qcto.org.za, saqa.org.za (verification fee), dirco.gov.za (apostille — currently a free service; cost any third-party notary, High Court, courier, or document-concierge fees separately), saps.gov.za (PCC fee), ielts.org / oet.com (language test fees), icp.gov.ae, gdrfa.ae, mohre.gov.ae, xe.com (exchange-rate reference at verification date)

**Iterations:** 6

---

## Note schemas — apply to every note created

**COST ITEM note:**
```markdown
---
type: cost_item
name:
category: [skills_assessment | visa_application | health_surcharge | document_verification | apostille | police_clearance | language_test | practical_assessment_travel | post_arrival_licensing | flight | first_month_living | other]
destination: [australia | uk | canada | new_zealand | uae | sa_side]
visa_route:
occupation_code:
assessment_location:
rto_provider:
currency:
amount_destination_currency:
amount_zar_approx:
exchange_rate_date:
fee_effective_date:
verification_date:
per_person_basis: [primary_applicant | per_dependant | flat_fee]
paid_to:
paid_by: [applicant | employer | shared]
one_off_or_recurring: [one_off | annual | monthly]
refundable: [yes | no | partial]
mandatory_or_optional: [mandatory | optional | trade_dependent]
evidence_strength_source_currency: [confirmed | alleged | rumoured]
evidence_strength_zar_estimate: [confirmed | alleged]
evidence_strength: confirmed | alleged | rumoured
tags: [cost, trades, work-abroad, south-africa]
sources:
  -
---

# Cost Item Name

What this cost is for and when in the process it is incurred.

## Amount
- Destination currency (at [exchange rate date]): [amount]
- ZAR equivalent: R[amount]

## Notes
Whether this cost is mandatory vs optional; whether the employer covers any portion (UK CoS fee is paid by the sponsor, for example); whether refundable on visa refusal.

## Connections
- [[Visa Route]] — required_by, source: [url]
- [[Skills Assessment Body]] — paid_to, source: [url]

## Sources
- [Source title](url)
```

**COST SCENARIO note:**
```markdown
---
type: cost_scenario
name:
destination: [australia | uk | canada | new_zealand]
trade: [electrician | plumber | welder | carpenter | builder | other]
scenario: [low | mid | high]
total_zar_approx:
assumptions: []
employer_contribution_zar:
net_out_of_pocket_zar:
exchange_rate_date:
evidence_strength: alleged
tags: [cost-scenario, trades, work-abroad]
sources:
  -
---

# Cost Scenario: [Destination] — [Trade] — [Low / Mid / High]

Summary of assumptions and total cost for this scenario.

## Breakdown
| Category | Amount (ZAR approx.) | Paid by |
|---|---|---|
| Skills assessment | | Applicant |
| Practical assessment travel (if AU) | | Applicant |
| Document verification (QCTO, SAQA) | | Applicant |
| DIRCO apostille | | Applicant |
| SAPS PCC | | Applicant |
| Language test (IELTS/OET) | | Applicant |
| Visa application fee | | Applicant |
| Health surcharge (UK IHS) | | Applicant |
| Flights (one-way / return) | | Applicant |
| First-month accommodation | | Applicant |
| Post-arrival licensing (NZ EWRB/PGDB) | | Applicant |
| **Total before first salary** | | |

## What the Employer Typically Covers
UK CoS fee + Immigration Skills Charge are paid by the sponsor; Australian 482 nomination fee is paid by the sponsoring employer. Document which fees are by law the employer's responsibility vs. which the worker can be asked to pay.

## When the First Salary Lands
Realistic timeline from arrival to first paycheck for the trade in the destination.

## Sources
- [Source title](url)
```

**EDGE metadata:**
- `relationship_type`: required_by | covered_by | part_of_scenario | varies_by | offset_by_earnings | mandatory_for | optional_for
- `description`: short label
- `evidence_strength`: confirmed | alleged | rumoured
- `sources`: at least one URL

---

## Runtime rules

- All ZAR conversions must be dated — exchange rate at time of research (May 2026); flag the source-currency amount and the ZAR estimate with separate evidence-strength fields. The ZAR figure is `alleged` even when the source-currency amount is `confirmed`.
- **TRA programmes are distinct.** OSAP excludes TSS/482; MSA excludes 482. SID 482 nominations use the TSS Skills Assessment Program where assessment is required. Itemise fees per programme (MSA, TSS, OSAP) and per component (documentary, technical interview, practical) — do not present a single "TRA fee."
- **TRA practical assessment travel is a hidden cost.** Practical-assessment locations vary by RTO and trade. Current TRA RTO Finder lists locations across Australia, the UK (e.g. Hammersmith / London / Lancashire / Cheshire), the Philippines, India and South Africa (e.g. Cape Town / Pretoria). Flights + accommodation + visitor visa for the assessment destination must be itemised separately based on the assigned RTO at the time of assessment.
- **UK Skilled Worker fee structure has multiple components** — application fee + Immigration Health Surcharge (IHS) + biometrics + (sponsor-paid) Certificate of Sponsorship + (sponsor-paid) Immigration Skills Charge. Document which the worker pays vs. which the employer pays. For TSL-eligible occupations, dependants are not allowed — so do not include dependant fees in UK TSL scenarios.
- **UK TSL expiry constraint:** CoS issuance and visa application timing under a TSL-eligible occupation must occur before **31 December 2026** unless the rules are extended. Note this in every UK cost scenario as a timing risk.
- **UK Skilled Worker settlement** is currently a 5-year ILR pathway. A 10-year "earned settlement" model has been proposed (announced for April 2026, consultation Nov 2025 – Feb 2026) but is not in current Immigration Rules. Treat the 10-year claim as **proposed/unconfirmed** (`evidence_strength: alleged`) until reflected in primary GOV.UK rule pages. Include both scenarios in long-term cost narratives where relevant.
- **Australian SID 482 nomination fee** is paid by the sponsoring employer, not the visa applicant. The applicant pays the visa application charge (per primary applicant + per dependant, where allowed). Document the split clearly.
- **Canada Express Entry fees split** — government fees (per adult) + Right of Permanent Residence Fee + biometrics + WES ECA + PNP application fee (where used) + provincial Trade Equivalency Assessment fee (separate from federal). Document each line.
- **NZ post-arrival licensing for electricians (EWRB) and plumbers (PGDB) is a real cost** — separate from the AEWV / residence visa. Include as a post-arrival line item in NZ scenarios.
- **Distinguish confirmed fees** (from official fee schedules) from **estimated costs** (flights, accommodation, exchange-rate-converted ZAR). Flag estimates with `evidence_strength: alleged`.
- **All fees must be re-checked at the primary source URL on the verification date.** Visa fees and skills-assessment fees are reviewed annually; the TRA fee scale typically updates 1 July; UK fees update with each Statement of Changes; Canada fees update by IRCC notice; NZ updates with each Immigration NZ fee circular.
- **Do not present a single "total cost" number.** Always present low / mid / high scenarios with assumptions stated.
- **No agent-quoted fees** — only fees published by the regulator, the immigration department, or the assessment body. Migration agent fees are out of scope (separately documented, optional).
- All factual claims about fees must be verified at the primary source URL (tradesrecognitionaustralia.gov.au, immi.homeaffairs.gov.au, gov.uk, canada.ca, immigration.govt.nz, ewrb.govt.nz, pgdb.co.nz, qcto.org.za, dirco.gov.za, saps.gov.za). Search snippets alone are not confirmation.
- Folder structure: `Cost Items/`, `Cost Scenarios/`
