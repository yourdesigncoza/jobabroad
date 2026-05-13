# Prompt: TEFL — Realistic Costs

> Run with `/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-tefl-03-costs`

---

/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-tefl-03-costs

**Goal:** Build a verified, itemised cost reference for a South African TEFL teacher relocating to South Korea, Saudi Arabia / UAE, Vietnam, China, or Spain — covering every fee from SA-side documentation through TEFL certification through visa and flight, presented as low / mid / high scenarios per destination, with explicit note of what the employer typically covers vs. what the teacher pays.

**Seed entities:**
- CELTA course fees (~£1,500 in 2025–2026; SA in-person providers in Cape Town and Johannesburg)
- Ofqual Level 5 TEFL Diploma (180 hours; online; lower cost than CELTA, similar visa recognition)
- SAPS Police Clearance Certificate fee and DIRCO Apostille fee
- SAQA evaluation fee (when required by destination)
- Korea E-2 visa application fee and Korean Consulate Pretoria charges
- Vietnam work permit fee (employer-paid) + apostille + translation costs (teacher-paid)
- Saudi MOFA + Saudi Embassy Pretoria attestation fees
- Typical employer-covered benefits: flight reimbursement, housing or housing allowance, health insurance, end-of-contract bonus (Korea / Gulf packages)

**Source constraints:** saps.gov.za (fees schedule), dirco.gov.za (legalisation / apostille fees — note the apostille itself is free; courier and concierge service fees are separate line items), saqa.org.za (Individual Verification Letter fee for SA degrees + foreign-qualification evaluation fee), dhet.gov.za and umalusi.org.za (matric / DHET verification routes), epik.go.kr (programme salary scale + entrance/exit allowances), visa.go.kr and hikorea.go.kr (E-2 fee schedule), Embassy of Korea in South Africa (overseas.mofa.go.kr/zaf-en/), mofa.gov.sa, hrsd.gov.sa + qiwa.sa (Saudi MHRSD work-permit fee schedule), khda.gov.ae and adek.gov.ae (UAE school fees + KHDA permit fees), mofa.gov.ae (UAE attestation fees), Vietnam Decree 219/2025/ND-CP via chinhphu.vn (work permit fee schedule per Article + provincial People's Committees), fuwu.most.gov.cn (China MOST Foreigner Work Permit portal — fee schedule), Spain Acción Educativa Exterior (aee.educacionfpydeportes.gob.es) — confirm SA eligibility before quoting Auxiliares stipend, hcch.net (Apostille Convention status), cambridgeenglish.org (CELTA course pricing if published; otherwise use SA centre published rates), Google Flights ZAR estimates (Johannesburg/Cape Town → Seoul / Riyadh / Dubai / Hanoi / Madrid), Numbeo.com for first-month relocation estimates, expat Facebook groups for real-world cost reports (flag as `alleged`)

**Iterations:** 6

---

## Note schemas

**COST ITEM note:**
```markdown
---
type: cost_item
name:
category: [sa_documentation | tefl_certification | exam | visa | attestation | flight | first_month_relocation | employer_covered]
destination: [Korea | Saudi | UAE | Vietnam | China | Spain | all]
amount_zar:
amount_destination_currency:
exchange_rate_date:
paid_by: [teacher | employer | shared]
one_off_or_recurring: [one_off | annual]
evidence_strength: confirmed | alleged | rumoured
tags: [cost, tefl, work-abroad, relocation]
sources:
  -
---

# Cost Item Name

What this cost is for and when in the process it is incurred.

## Amount
- ZAR equivalent (at [exchange rate date]): R[amount]
- Local currency: [amount] [currency]

## Who Pays
Whether the teacher pays this or the employer covers it. Note that Korea EPIK and most Gulf packages typically cover flight + housing; Vietnam centres rarely do; Spain Auxiliares is stipend-only and covers nothing.

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
profile: [degreed_no_celta | degreed_with_celta | celta_plus_experience]
total_zar_outlay:
employer_contribution_zar:
net_out_of_pocket_zar:
months_to_first_salary:
assumptions: []
evidence_strength: alleged
tags: [cost-scenario, tefl, work-abroad]
sources:
  -
---

# Cost Scenario: [Destination] — [Low / Mid / High]

Summary of assumptions and total cost for this scenario.

## Breakdown
| Category | Amount (ZAR) | Paid by |
|---|---|---|
| SA documentation (SAPS, DIRCO, SAQA) | | |
| TEFL certification | | |
| Visa / work permit | | |
| Embassy attestation chain | | |
| Translation / notarisation | | |
| Flight | | |
| First month relocation | | |
| **Total** | | |

## Typical Employer Contribution
What EPIK / Saudi school groups / UAE schools / Vietnamese centres / Spanish Auxiliares programmes cover (cite contract templates or official programme pages).

## Net Out-of-Pocket
Total ZAR a candidate must have available before first salary lands. Highlight that Spain Auxiliares is stipend-only and may require 2–3 months savings buffer.

## Sources
- [Source title](url)
```

**EMPLOYER PACKAGE note:**
```markdown
---
type: employer_package
name:
destination:
typical_monthly_salary_local_currency:
typical_monthly_salary_usd:
housing: [provided_free | allowance | self_arranged]
flight: [paid_on_arrival | reimbursed_on_arrival | reimbursed_end_of_contract | not_covered]
health_insurance: [provided | partial | self_arranged]
end_of_contract_bonus: [yes_one_month | yes_severance | no]
tax_status: [tax_free | local_tax_applies]
source_url:
evidence_strength: confirmed | alleged | rumoured
tags: [employer-package, tefl, salary, benefits]
sources:
  -
---

# Employer Package Name (e.g. EPIK Standard Contract, Saudi Private School Package)

What a typical contract for this destination / programme tier includes.

## Take-Home vs Gross
For Gulf tax-free packages: state the take-home is equal to the gross. For Korea / Vietnam: state local tax rate applied to the gross.

## Connections
- [[Destination]] — applies_in, source: [url]
- [[Programme Operator]] — administered_by, source: [url]

## Sources
- [Source title](url)
```

**EDGE metadata:**
- `relationship_type`: cost_of | covered_by | part_of_scenario | varies_by | applies_in | administered_by
- `description`: short label
- `evidence_strength`: confirmed | alleged | rumoured
- `sources`: at least one URL

---

## Runtime rules

- All ZAR conversions must be dated — exchange rate at time of research (state the source: Reuters, OANDA, xe.com on YYYY-MM-DD).
- Distinguish confirmed fees (from official fee schedules) from estimated costs (flights, relocation, food).
- **Tax-free Gulf comparison** — for Saudi / UAE, show gross take-home with explicit "tax-free in country" note. SARS foreign income exemption cap R1.25M applies for SA tax residents; confirm current threshold against sars.gov.za.
- **Apostille Convention status changes the Saudi cost line** — Saudi acceded 7 Dec 2022; mainland China acceded 7 Nov 2023. For SA documents to these destinations, default to SAQA Individual Verification → DIRCO apostille rather than the older multi-step embassy chain. Cost vault must reflect this (cheaper, faster). Saudi Embassy / Saudi Cultural Mission attestation only where a specific employer or authority requires it on top of apostille.
- **Vietnam Apostille Convention** is not in force for Vietnam until **11 September 2026**. Until then, build the cost scenarios on DIRCO authentication + Vietnamese consular legalisation chain.
- **DIRCO apostille itself is free** — line items must model courier or concierge service fees separately, not invent an "apostille fee."
- **Korea EPIK typical package (Fall 2026 scale)** — verify against epik.go.kr's current pay scale (approximately KRW 2.2–2.8M/month for hireable levels) + entrance allowance KRW 1.8M + exit/contract-completion allowance KRW 1.3M (this is NOT a flight allowance) + housing typically provided. Quote with the exact pay-scale page and date. Treat GEPIK as legacy unless current Gyeonggi office source confirms a separate scale.
- **Vietnam reality** — housing typically NOT covered; teacher pays 6.5M VND – 12M VND/month rent. Build this into low/mid/high scenarios. Work-permit fees vary by province.
- **Spain Auxiliares — confirm SA eligibility first.** If South Africa is not on the current MEFD eligible-countries list, mark Spain as restricted and shift focus to private/paid Spanish-language-assistant programmes (which have a different cost profile — paid by the candidate, not stipend-paying). If SA IS confirmed eligible, stipend levels in 2025–2026 are commonly €800/mo outside Madrid and up to €1,000/mo in Madrid; net out-of-pocket scenario must reflect 2–3 month savings buffer.
- **CELTA SA pricing** — confirm with at least one SA centre (Cape Town, Johannesburg, Stellenbosch) directly. Quote published 2025–2026 rate with date.
- **SAQA Individual Verification Letter** for SA degrees takes ~25 working days minimum; SAQA evaluation of foreign qualifications takes ~90 working days.
- **Single-source rule** — visa fees, programme salary brackets, and authentication charges must be primary-source-verified. Industry blogs (tefl.org, teflinstitute.com) are `alleged` until confirmed.
- **Don't underestimate calendar time** — costs vault should also show the timeline. SAQA SA verification ~5 weeks, DIRCO authentication/apostille 1–4 weeks (channel-dependent), full Korea E-2 cycle ~3 months from CELTA-complete to arrival.
- Folder structure: `Cost Items/`, `Cost Scenarios/`, `Employer Packages/`
