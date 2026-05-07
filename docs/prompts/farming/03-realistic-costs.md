# Prompt: Farming — Realistic Costs

> Run with `/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-farming-03-costs`

---

/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-farming-03-costs

**Goal:** Build a verified, itemised cost breakdown for a South African farm worker applying via the UK Seasonal Worker visa, USA H-2A, Canada Agricultural Stream, or Australian skilled-stream agricultural visa — covering government visa fees, IHS / surcharge / SEVIS-equivalent, biometrics, apostille, flights, and first-month living costs, presented as low / mid / high scenarios. Explicitly note where the worker is prohibited from paying recruitment or processing fees (H-2A, UK scheme operator rules) so readers can recognise scam fee requests.

**Seed entities:**
- UK Seasonal Worker visa application fee (~£340 — verify current rate); the Immigration Health Surcharge is **not payable** when applying from outside the UK for a visa of 6 months or less, so most SA Seasonal Worker applicants do not pay IHS — flag this prominently as a frequently-misstated cost
- USA H-2A visa MRV fee (DS-160 application fee) and any associated SEVIS-equivalent or POE inspection fee
- Canada work permit application fee + biometrics fee — IRCC published rates
- Australia subclass 482 / 491 application fee — Department of Home Affairs published rates plus VETASSESS skills-assessment fee
- Flight return SA → UK / USA / Canada / Australia (typical agricultural-job destination cities — Lincoln/Boston UK, Yakima/Salinas USA, Leamington/Niagara Canada, regional Queensland/Victoria AUS)

**Source constraints:** gov.uk/seasonal-worker-visa (visa fee), gov.uk/healthcare-immigration-application/pay (IHS), travel.state.gov/content/travel/en/us-visas/visa-information-resources/fees.html (MRV fee), ceac.state.gov (DS-160), uscis.gov (any I-129 worker-borne portion — should be zero for H-2A), canada.ca/en/immigration-refugees-citizenship/services/fees.html (work permit + biometrics), immi.homeaffairs.gov.au/visas/getting-a-visa/fees-and-charges, vetassess.com.au (skills assessment fee), dirco.gov.za (apostille fee), saps.gov.za (PCC fee), Numbeo.com (Lincoln, Yakima, Leamington, regional QLD cost-of-living estimates — flag as anecdotal)

**Iterations:** 6

---

## Note schemas — apply to every note created

**COST ITEM note:**
```markdown
---
type: cost_item
name:
category: [government_fee | health_surcharge | biometrics | apostille | skills_assessment | flight | first_month_living | other]
visa_route: [uk_seasonal_worker | usa_h2a | canada_agricultural_stream | australia_482 | australia_491 | all]
amount_destination_currency:
amount_zar_approx:
exchange_rate_date:
paid_to:
paid_by: [worker | employer | scheme_operator | shared]
worker_fee_prohibited: [yes | no | not_applicable]
one_off_or_recurring: [one_off | annual | monthly]
refundable: [yes | no | partial]
evidence_strength: confirmed | alleged | rumoured
tags: [cost, farming, work-abroad, south-africa]
sources:
  -
---

# Cost Item Name

What this cost is for and when in the process it is incurred. State explicitly whether the worker pays it or whether it is the employer's responsibility (H-2A) / scheme operator's (UK).

## Amount
- ZAR equivalent (at [exchange rate date]): R[amount]
- Destination currency: [amount] [currency]

## Notes
Whether this cost is mandatory vs optional; whether the employer/host covers any portion (H-2A: employer pays petition fee + return transport; UK Seasonal Worker: scheme operator pays sponsor licence costs but worker pays visa fee + IHS).

## Connections
- [[Visa Route]] — required_by, source: [url]

## Sources
- [Source title](url)
```

**COST SCENARIO note:**
```markdown
---
type: cost_scenario
name:
visa_route:
scenario: [low | mid | high]
total_zar_approx:
assumptions: []
employer_or_host_contribution_zar:
net_out_of_pocket_zar:
typical_first_paycheck_lag_weeks:
evidence_strength: alleged
tags: [cost-scenario, farming, work-abroad]
sources:
  -
---

# Cost Scenario: [Visa Route] — [Low / Mid / High]

Summary of assumptions and total cost for this scenario.

## Breakdown
| Category | Amount (ZAR approx.) | Paid by |
|---|---|---|
| Government visa fee | | Worker |
| IHS / health surcharge | | Worker |
| Biometrics | | Worker |
| Skills assessment (if AU skilled) | | Worker |
| SAPS PCC + DIRCO apostille | | Worker |
| Flights (one-way or return) | | Worker / Employer |
| First-month living | | Worker |
| **Total before earnings** | | |

## What the Employer / Scheme Operator Typically Covers
H-2A: employer must pay petition + reasonable transport to and from the worker's home country (return). UK Seasonal Worker: scheme operator usually arranges (and may deduct) accommodation; transport varies. Document the actual coverage rules from official sources, not industry rumour.

## When You Start Earning
Approximate timeline from departure to first paycheck — note pay cycle (weekly UK harvests, bi-weekly USA, varies CA/AU); typical hourly rate (UK: National Minimum Wage / Agricultural Wages Order; USA: AEWR by state; Canada: provincial minimum + LMIA-prescribed wage; AUS: Horticulture Award).

## Sources
- [Source title](url)
```

**EDGE metadata:**
- `relationship_type`: required_by | covered_by | prohibited_from_being_paid_by_worker | part_of_scenario | varies_by | offset_by_earnings
- `description`: short label
- `evidence_strength`: confirmed | alleged | rumoured
- `sources`: at least one URL

---

## Runtime rules

- All ZAR conversions must be dated — exchange rate at vault-build time; flag as estimates
- **DIRCO apostille is free** (state legalisation/apostille service has no fee); only courier, agent, notary, and High Court certification costs vary. Do not list DIRCO apostille as a charged government fee
- **Worker-fee prohibition is a critical anti-scam fact** — H-2A regulations prohibit the employer or any agent from charging recruitment / labor-certification / job-placement fees (20 CFR § 655.135(j)–(k)); transportation and subsistence rules are at 20 CFR § 655.122(h); visa/border-crossing reimbursement rules at § 655.122(p). Worker may pay MRV/visa fees upfront but the employer must reimburse so they are not net worker-borne. UK Seasonal Worker scheme operators are subject to similar restrictions under their sponsor licence — verify current Defra / Home Office guidance. Any "recruitment fee" charged to a SA worker for these schemes is a violation and a scam signal
- **UK Seasonal Worker fee stack (2026):** application fee ~£340 (verify current) + **no IHS** when applying from outside UK for ≤ 6 months + maintenance proof £1,270 unless the scheme operator certifies on the CoS. Document each separately and flag the IHS exemption explicitly — many recruiters and blogs incorrectly claim IHS is payable
- **H-2A worker upfront vs net cost:** worker may pay MRV / DS-160 photo / interview transport upfront, but H-2A regulations require the employer to reimburse visa-related fees and pay inbound and return transport plus subsistence; net to the worker should be near zero for these items. Petition fee, return transport (after honouring contract), and worker housing while at the workplace are employer responsibilities. List employer-paid items separately as "should not appear on your invoice"
- **Canada Agricultural Stream worker-borne costs:** work permit application fee (CAD $155 — re-verify), biometrics (CAD $85), medical exam by panel physician (varies). The LMIA processing fee is **exempt for primary-agriculture NOC codes** (per ESDC) — there is no CAD $1,000 LMIA fee in the Agricultural Stream itself. Where another stream's LMIA fee applies, the employer must pay and cannot recover it from the worker
- **Australia skilled-stream cost is materially higher than seasonal routes elsewhere:** subclass 482 nomination + visa fee + skills assessment (VETASSESS AUD ~$1,000+, verify) + medical + biometrics; total commonly AUD $5,000+ before flights. Position this honestly: not a cheap entry route
- **No employer-covered flights guarantee:** H-2A regulation requires employer to pay return transport after the contract is honoured (not before); UK Seasonal Worker varies by operator. Document the actual official rule, not optimistic recruiter claims
- **Distinguish confirmed fees (from official fee schedules) from estimated costs (flights, accommodation)** — flag estimates with `evidence_strength: alleged`
- **Earnings honesty** — first paycheck typically 2–4 weeks after start of work. UK Seasonal Worker route minimum from current Immigration Rules: £12.71/hour and 32 paid hours per week (verify current rate at gov.uk Sponsor a Seasonal Worker guidance) — piece-rate is allowed but cannot result in pay below the minimum across the pay period. H-2A pay is the **highest** of: AEWR, prevailing wage, agreed collective bargaining rate, federal minimum wage, or state minimum wage; document AEWRs by state if covering H-2A in detail
- Folder structure: `Cost Items/`, `Cost Scenarios/`
