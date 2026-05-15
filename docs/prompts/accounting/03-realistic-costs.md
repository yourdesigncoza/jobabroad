# Prompt: Accounting — Realistic Costs

> Run with `/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-accounting-03-costs`

---

/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-accounting-03-costs

**Goal:** Quantify, in current 2025–2026 currency with date stamps, the total cost for a South African accountant to relocate to the UK, Australia, Canada, Ireland, or New Zealand — broken down by MRA / designation application fees, visa fees, IHS / health-cover surcharges, document fees (SAQA, WES, SAPS, DIRCO apostille), language-test fees where applicable, flight estimate, and first-month settling-in costs. Produce low / mid / high scenarios per destination.

**Seed entities:**
- ICAEW application fee for SAICA members (icaew.com)
- ICAS reciprocal membership / application fee for SAICA members (icas.com)
- CA ANZ international member application fee via SAICA RMA (charteredaccountantsanz.com)
- CPA Canada RMA fee + provincial registration fee (cpacanada.ca + CPA Ontario / BC / Alberta / Quebec)
- Chartered Accountants Ireland (CAI) reciprocal membership / admission fee for SAICA members (charteredaccountants.ie — CPA Ireland amalgamated into CAI 1 Sept 2024)
- NASBA IQEX examination / application fee for SAICA members (nasba.org/iqex)
- UK Skilled Worker Visa fee + Immigration Health Surcharge 2025–2026 (gov.uk)
- Ireland CSEP €1,000 application fee + supporting costs (enterprise.gov.ie)

**Source constraints:** saica.org.za (current reciprocity/RMA/MRA eligibility), icaew.com (fees for members of other bodies — SAICA), icas.com (ICAS — Scotland reciprocal membership / admission fees), charteredaccountantsanz.com (international application fees), cpacanada.ca (fees page), cpaontario.ca, cpabc.ca, cpaalberta.ca, cpaquebec.ca (provincial registration fees), charteredaccountants.ie (CAI reciprocal membership and subscription fees), nasba.org/iqex (IQEX fee schedule), gov.uk/visa-fees, gov.uk/healthcare-immigration-application (IHS rates), homeaffairs.gov.au (visa charges page), immi.homeaffairs.gov.au/visas/working-in-australia/skill-occupation-list (CSOL for 482/186 eligibility), tpb.gov.au (Australia Tax Practitioners Board registration fees), canada.ca (visa fee schedule), enterprise.gov.ie/en/what-we-do/workplace-and-skills/employment-permits/fees/ (CSEP fees), irishimmigration.ie (Irish entry visa / registration permission fees beyond CSEP), immigration.govt.nz (AEWV fees), wes.ca (ECA fee), saqa.org.za (SAQA verification / foreign qualification evaluation fees), saps.gov.za (PCC fee), dirco.gov.za (apostille / legalisation — verify whether the service is free; record `0` with date-stamped source if so), ielts.org / cambridgeenglish.org / pearsonpte.com (English-test fees where applicable)

**Iterations:** 6

---

## Note schemas

**COST ITEM note:**
```markdown
---
type: cost_item
name:
category: [mra_application | visa_application | health_surcharge | document_apostille | language_test | flight | first_month_settling | provincial_registration | tax_practitioner_registration]
destination_country:
amount_native_currency:
native_currency_code: [GBP | AUD | NZD | CAD | EUR | USD]
amount_zar_estimate:
zar_exchange_rate_used:
rate_date:
applies_to: [primary_applicant | partner | child | all]
refundable: [yes | no | partial]
employer_typically_covers: [yes | no | sometimes]
official_url:
evidence_strength: confirmed | alleged | rumoured
tags: [cost, accounting, work-abroad, [country_code]]
sources:
  -
---

# Cost Item Name

Plain-language explanation: what this cost is, who pays it, when it's payable.

## Source Confirmation
Direct quote of fee from the official body's website, with URL and access date.

## Connections
- [[Document]] — paid_for, source: [url]
- [[Visa Route]] — required_for, source: [url]

## Sources
- [Source title](url)
```

**SCENARIO note:**
```markdown
---
type: cost_scenario
name:
destination_country:
scenario_tier: [low | mid | high]
applicant_profile: [single | partner | family_with_two_children]
total_zar_estimate:
total_native_currency_estimate:
includes: []
excludes: []
exchange_rate_used:
rate_date:
evidence_strength: confirmed | alleged | rumoured
tags: [scenario, accounting, work-abroad, [country_code]]
sources:
  -
---

# Scenario Name

Total breakdown — sum of cost items, by category. Honest about what's included and what an applicant might forget.

## Cost Breakdown
| Category | Native currency | ZAR estimate |
|---|---|---|
| MRA / designation | | |
| Visa fee + IHS | | |
| Documents + apostille | | |
| Language test (if any) | | |
| Flight | | |
| First month | | |
| **Total** | | |

## What's Typically Employer-Paid vs Out of Pocket
What the sponsoring employer usually covers (rare for accountants — most relocate self-funded), what comes out of pocket.

## Connections
- [[Destination]] — applies_to, source: [url]
- [[Visa Route]] — assumes, source: [url]

## Sources
- [Source title](url)
```

**EDGE metadata:**
- `relationship_type`: paid_for | applies_to | assumes | required_for | refunded_when
- `description`: short label
- `date_range`: YYYY-MM
- `evidence_strength`: confirmed | alleged | rumoured
- `sources`: at least one URL

---

## Runtime rules

- `evidence_strength`: `confirmed` | `alleged` | `rumoured` — only `confirmed` when the official body's fee page is fetched and the exact amount confirmed; snippet text is not sufficient.
- **Every cost item MUST carry a date stamp and currency code**. UK fees rise annually; AU/NZ/CA periodic; Ireland EUR-denominated.
- **State the ZAR exchange rate and date used** on every conversion. Use a single rate-date per scenario so totals are reproducible.
- **IHS waiver** applies to NHS Health and Care Worker Visa, NOT to Skilled Worker Visa for accountants — flag this explicitly. Accountants pay full IHS.
- **Visa fee ≠ designation fee ≠ visa health surcharge** — keep these three separate cost items per destination.
- **Family multipliers**: visa + IHS fees scale with dependants (per-person rates from official sources). **Apostille / legalisation costs scale by number and type of documents, not by dependants** — itemise per document.
- **DIRCO apostille/legalisation**: confirm directly from dirco.gov.za. If the service is free, record `0` with date-stamped source URL; only courier, notary, sworn-translator, or High-Court-related costs should be itemised as separate optional lines.
- **Provincial registration is an additional Canadian cost** beyond CPA Canada RMA fee — both required, both must be itemised separately.
- **Tax-agent registration (TPB Australia)** is a separate cost beyond CA ANZ MRA — itemise if tax-agent role is the target.
- **No agency-estimated fees**: Sable, Apostil etc. may add concierge fees; record those as a separate optional line, never as the official body fee.
- Flag any cost where the source page is outdated > 12 months as `evidence_strength: alleged`.
- Folder structure: `Cost Items/`, `Scenarios/`
