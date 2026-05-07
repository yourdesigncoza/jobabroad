# Prompt: Hospitality — Realistic Costs

> Run with `/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-hospitality-03-costs`

---

/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-hospitality-03-costs

**Goal:** Build a realistic, dated, ZAR-denominated cost breakdown for South African hospitality workers pursuing each of the four open routes (UAE Employment Visa, UK Skilled Worker senior chef + management, Australia Subclass 482 chef/cook, Canada TFWP LMIA work permit). Cover all SA-side documents, attestation, skills assessments, visa fees, IHS, biometrics, flights, first-month living costs, and what is employer-paid vs worker-paid. Make it possible for a worker to budget upfront cash needed before first salary.

**Seed entities:**
- UAE Employment Visa (employer-paid) + worker out-of-pocket (passport, document concierge, flight, first-month living) — UAE is the lowest-cost route for the worker
- UK Skilled Worker visa fee — £827 standard 3-year + Immigration Health Surcharge (IHS) £1,035/year — high cost; check if hotel chain reimburses
- Australia Subclass 482 visa application charge — AUD $3,210+ (base, primary applicant, 2025–26 schedule) + VETASSESS AUD $1,096 + nomination AUD $330 (employer-paid) + SAF levy AUD $1,200/year (employer-paid)
- Canada TFWP work permit + biometrics — CAD $155 + CAD $85 = CAD $240 (worker pays)
- May 2026 ZAR exchange rates — £1 = R22.60 / USD$1 = R16.65 / CAD$1 = R13.00 / AUD$1 = R10.28 / AED$1 = R4.53

**Source constraints:** gov.uk/skilled-worker-visa, gov.uk/healthcare-surcharge, mohre.gov.ae, u.ae/en/information-and-services/jobs/, immi.homeaffairs.gov.au/visas/getting-a-visa/fees-and-charges, vetassess.com.au/home/our-fees, canada.ca/en/immigration-refugees-citizenship/services/application/application-forms-guides/fee-list.html, dha.gov.za, saps.gov.za/services/applying_clearence_certificate.php, dirco.gov.za, vfsglobal.com, xe.com (FX reference only)

**Iterations:** 6

---

## Note schemas — apply to every note created

**COST_ITEM note:**
```markdown
---
type: cost_item
name:
applies_to_routes: []
amount_destination_currency:
amount_zar:
fx_rate_used:
fx_rate_date:
worker_pays_or_employer_pays: [worker | employer | shared | reimbursable]
when_paid: [pre-application | application | post-arrival | first-month]
fee_source_url:
last_verified_date:
evidence_strength: confirmed | alleged | rumoured
tags: [cost-item, hospitality, south-africa]
sources:
  -
---

# Cost Item Name

2 sentences: what this is, why the worker pays it (or why the employer pays it).

## Amount and Citation
Destination currency + ZAR equivalent + the FX rate used + the URL where the fee is published.

## Date-Stamping
When the figure was last confirmed; when it next changes (e.g. UK fees April annual, AU fees July annual).

## Connections
- [[Visa Route]] — required_for, source: [url]
- [[Document]] — fee_for, source: [url]

## Sources
- [Official fee URL](url)
```

**COST_SCENARIO note:** *(create one per route — UAE, UK senior chef, AU chef low / mid / high, Canada cook)*
```markdown
---
type: cost_scenario
route_name:
profession:
total_zar_estimate:
total_destination_currency_estimate:
breakdown:
  - item:
    amount_zar:
fx_rate_assumptions:
employer_reimbursable_amount:
worker_advance_required:
last_verified_date:
evidence_strength: confirmed | alleged | rumoured
tags: [cost-scenario, hospitality, south-africa]
sources:
  -
---

# Scenario Name

2 sentences: what this scenario covers (e.g. "Senior sous chef applying for UK Skilled Worker via 5-star hotel sponsor, single applicant, no dependants").

## Total Cost Range
Realistic minimum and maximum. State worker advance separately from employer-reimbursed amount.

## Itemised Breakdown
Table of every line item, citing the cost_item note for each.

## What the Employer Pays
Specifically separate worker-paid from employer-paid (UK CoS fee, IHS, AU nomination + SAF, UAE Employment Visa).

## Connections
- [[Visa Route]] — pricing_for, source: [url]

## Sources
- [Source title](url)
```

**EDGE metadata:**
- `relationship_type`: required_for | reimbursed_by_employer | sponsor_pays | included_in_scenario | indexed_annually | currency_dependent
- `description`: short label
- `evidence_strength`: confirmed | alleged | rumoured
- `sources`: at least one URL

---

## Runtime rules

- `evidence_strength`: `confirmed` | `alleged` | `rumoured`
- **State the FX rates used and date** at the top of every cost_scenario note. Use May 2026 rates: £1 = R22.60, USD$1 = R16.65, CAD$1 = R13.00, AUD$1 = R10.28, AED$1 = R4.53. Tell the reader rates move and these are planning estimates
- **UAE worker zero-fee rule** — MOHRE Resolution No. 47 of 2022. Worker pays nothing for the visa, work permit, Emirates ID, or medical test. Employer pays all. Worker out-of-pocket = passport renewal (if needed), document concierge (optional ~R3,000), flight (~R8,000–R12,000), first-month living (Dubai studio sublet ~R10,000–R18,000)
- **UK Skilled Worker visa fee** = £827 for 3-year main applicant outside UK; IHS = £1,035 per year (3 years = £3,105 paid upfront) — check current rates at gov.uk/healthcare-surcharge before publishing. Hotel groups MAY reimburse but are NOT required to. Document worker pre-payment as the realistic scenario
- **UK SOC 5434 going-rate must meet £41,700 general OR £33,400 new-entrant threshold** — if hotel offers below this, the visa cannot be issued. Document the going-rate for SOC 5434 senior chef/sous chef/head chef and flag any role advertised below as ineligible
- **Australia 482 visa application charge** — base AUD $3,210 primary applicant for 2025–26 (verify current at immi.homeaffairs.gov.au visa pricing table); subsequent dependants extra. SAF levy (employer-paid) ~AUD $1,200/year. Nomination fee ~AUD $330 (employer-paid)
- **Australia VETASSESS chef Full Skills Assessment AUD $1,096** offshore (Oct 2025 fee schedule). Trade-occupation assessments differ and are multi-stage
- **Canada work permit + biometrics CAD $240** total. Medical exam CAD $200–300 (panel-physician fee, IRCC does not publish a fixed rate). LMIA fee CAD $1,000 (employer-paid; cannot be passed to worker)
- **Cruise-line "uniform deposit" or "training fee" is a scam pattern** — legitimate cruise lines do not charge workers upfront. Document briefly; full coverage in scams section
- All amounts must include both destination currency AND ZAR with the FX rate used and date
- Folder structure: `Cost Items/`, `Cost Scenarios/`
