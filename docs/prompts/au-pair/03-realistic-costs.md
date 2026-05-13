# Prompt: Au Pair — Realistic Costs

> Run with `/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-au-pair-03-costs`

---

/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-au-pair-03-costs

**Goal:** Build a verified, itemised cost reference for a South African au-pair candidate relocating to the USA (J-1), Netherlands (IND-recognised sponsor), Germany (Auswärtiges Amt + local Ausländerbehörde), or France (VLS-TS jeune au pair) — covering every fee from SA-side documentation (passport, SAPS PCC, DIRCO, IDP, language certificate where needed) through sponsor agency programme fee through visa application and SEVIS fee through flight, presented as low / mid / high scenarios per destination, with explicit note of what the sponsor agency / host family typically covers (flight, insurance, room, board, pocket money) vs. what the au pair pays out-of-pocket before arrival.

**Seed entities:**
- SAPS Criminal Record Check fee + DIRCO apostille fee
- AA South Africa IDP fee (International Driving Permit)
- Goethe-Institut A1 German certificate cost (course + exam, Johannesburg / Pretoria centres)
- USA J-1 SEVIS I-901 fee ($35 for au-pair category) + MRV interview fee ($185) + 2025 Visa Integrity Fee (verify current amount)
- Netherlands MVV + VVR fee schedule + au-pair sponsor agency programme fees
- Germany national D visa fee at German Mission SA + air ticket cost (JNB → FRA / MUC / BER)
- France VLS-TS jeune au pair fee + CAPAGO South Africa service fee + ANEF post-arrival validation tax (timbre)
- USA J-1 au pair stipend (FLSA-derived federal baseline approximately USD $195.75/wk Standard; EduCare approximately 75% of Standard ~USD $146.81/wk with up to USD $1,000 education allowance vs $500 Standard; Au Pair Extraordinaire / premium tiers pay materially higher rates) — verify exact current figures against j1visa.state.gov and individual sponsor disclosure pages
- Typical sponsor agency programme fees for SA candidates (Cultural Care / AIFS / Go Au Pair / AuPairCare / EurAuPair / Au Pair in America)

**Source constraints:** saps.gov.za (PCC fee schedule — current R190 verify), dirco.gov.za (legalisation/apostille — note apostille is free), home-affairs.gov.za / dha.gov.za (passport application fee), aa.co.za (Automobile Association SA — IDP fee), goethe.de (Goethe-Institut Johannesburg / Pretoria A1 exam pricing), telc.net (telc A1 certificate — alternative to Goethe), ecfr.gov (22 CFR 62.31 — US au-pair programme rules), j1visa.state.gov (US J-1 programme fee disclosures + sponsor list), travel.state.gov (MRV interview fee schedule + reciprocity), ice.gov/sevis (SEVIS I-901 fee), za.usembassy.gov (US Embassy SA fee + interview procedure), irs.gov (au pair tax treatment — Publication 519 + au-pair-specific guidance), ind.nl (NL au-pair MVV + residence permit fee schedule — current TEV/residence application fee approximately €423 in 2026; also: au-pair-to-agency intermediary fees are capped by Dutch law at approximately €34 for preparation costs — verify on ind.nl + government.nl), www.government.nl (Dutch immigration fees), netherlandsworldwide.nl (NL embassy fees in SA), auswaertiges-amt.de (German Federal Foreign Office — visa fees), bamf.de (German residence permit policy — secondary), southafrica.diplo.de (German Mission SA — au-pair visa current fee in ZAR), france-visas.gouv.fr (French long-stay visa fee), service-public.fr (French jeune au pair stipend / hours / social contributions / VLS-TS validation tax), fr-za.capago.eu (CAPAGO South Africa service fees for France — replaced VFS Global in 2023), administration-etrangers-en-france.interieur.gouv.fr (ANEF — VLS-TS validation tax / timbre), culturalcare.com / culturalcare.co.za (Cultural Care programme fee schedule), aupairinamerica.com / aupairinamerica.co.za (AIFS programme fees), goaupair.com (Go Au Pair fees), aupaircare.com (AuPairCare fees), interexchange.org, ovc.co.za (OVC SA), africanambassadors.com (African Ambassadors SA — Cultural Care partner), aupairworld.com (NL/DE au-pair listings + typical costs), sars.gov.za (SA tax residency reference for au-pair income), Google Flights / kayak.com / Skyscanner ZAR estimates (Johannesburg / Cape Town → JFK / Newark / Amsterdam / Frankfurt / Munich / Paris CDG), xe.com / oanda.com / reuters.com (FX rate sources for ZAR conversions — quote with date)

**Iterations:** 6

---

## Note schemas

**COST ITEM note:**
```markdown
---
type: cost_item
name:
category: [sa_documentation | language_certificate | sponsor_programme_fee | visa | sevis | flight | first_month_relocation | sponsor_covered | host_family_covered]
destination: [USA | Netherlands | Germany | France | all]
amount_zar:
amount_destination_currency:
exchange_rate_date:
paid_by: [au_pair | sponsor_agency | host_family | shared]
one_off_or_recurring: [one_off | weekly | monthly | annual]
evidence_strength: confirmed | alleged | rumoured
tags: [cost, au-pair, work-abroad, relocation]
sources:
  -
---

# Cost Item Name

What this cost is for and when in the process it is incurred.

## Amount
- ZAR equivalent (at [exchange rate date]): R[amount]
- Local currency: [amount] [currency]

## Who Pays
Whether the au pair pays this or the sponsor agency / host family covers it. USA J-1 sponsors always pay return flight + accident & health insurance + programme academy; European programmes typically have host families cover insurance + sometimes the inbound flight.

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
profile: [usa_standard_au_pair | usa_educare | usa_extraordinaire | nl_standard | de_with_a1_in_hand | de_starting_from_zero_german | fr_with_french | fr_starting_from_zero_french]
total_zar_outlay:
sponsor_or_host_contribution_zar:
net_out_of_pocket_zar:
weeks_to_first_stipend:
assumptions: []
evidence_strength: alleged
tags: [cost-scenario, au-pair, work-abroad]
sources:
  -
---

# Cost Scenario: [Destination] — [Low / Mid / High]

Summary of assumptions and total cost for this scenario.

## Breakdown
| Category | Amount (ZAR) | Paid by |
|---|---|---|
| Passport application / renewal | | |
| SAPS PCC + DIRCO apostille | | |
| AA IDP | | |
| Goethe-Institut A1 (Germany only) | | |
| Sponsor agency programme fee | | |
| Visa application fee | | |
| SEVIS fee (USA only) | | |
| Flight (one-way / return) | | |
| First-month relocation buffer | | |
| **Total** | | |

## Typical Sponsor / Host Family Contribution
What Cultural Care / AIFS / Au Pair in America / Go Au Pair / EurAuPair / OVC typically cover for an SA candidate (cite sponsor agency programme-disclosure page).

## Net Out-of-Pocket
Total ZAR an SA candidate must have available before first stipend. USA candidates receive the first weekly stipend ~1 week after arrival; European candidates receive first month-end pocket money 30 days after arrival. Build a 2-week buffer.

## Sources
- [Source title](url)
```

**WEEKLY / MONTHLY STIPEND note:** (USA weekly, EU monthly pocket money)
```markdown
---
type: stipend
destination:
programme_tier: [usa_standard | usa_educare | usa_extraordinaire | nl_zakgeld | de_taschengeld | fr_argent_de_poche]
amount_local_currency:
amount_zar:
frequency: [weekly | monthly]
basis: [FLSA_minimum | host_family_negotiated | regulator_minimum | regulator_cap]
includes_room: [yes]
includes_board: [yes]
includes_health_insurance: [yes — sponsor_covered | yes — host_family_covered | partial | self_arranged]
includes_education_allowance: [yes — amount | no]
includes_flight: [yes — outbound | yes — return | yes — both | no]
exchange_rate_date:
evidence_strength: confirmed | alleged | rumoured
tags: [stipend, au-pair, pocket-money, salary]
sources:
  -
---

# Stipend Name (e.g. USA J-1 Standard Au Pair Weekly Stipend)

What a typical au pair receives weekly or monthly in this destination / programme tier.

## Take-Home vs Gross
USA J-1 stipend is FLSA-derived minimum; sponsor and host family cannot pay below it. SA tax residency: SARS foreign-income exemption cap R1.25M applies but au-pair stipend is well below this threshold; confirm against sars.gov.za. Netherlands and Germany pocket money is non-salary, treated as expense allowance, generally not subject to SA tax if SA tax residency suspended for the year.

## Connections
- [[Destination]] — applies_in, source: [url]
- [[Sponsor Agency]] — disbursed_via, source: [url]

## Sources
- [Source title](url)
```

**EDGE metadata:**
- `relationship_type`: cost_of | covered_by | part_of_scenario | varies_by | applies_in | disbursed_via | flsa_governed
- `description`: short label
- `evidence_strength`: confirmed | alleged | rumoured
- `sources`: at least one URL

---

## Runtime rules

- All ZAR conversions must be dated — exchange rate at time of research (state the source: Reuters, OANDA, xe.com on YYYY-MM-DD).
- Distinguish confirmed fees (from official fee schedules) from estimated costs (flights, first-month buffer).
- **USA J-1 income picture is distinct** — the au pair receives a weekly stipend AS WELL AS room + board + sponsor-paid flight + sponsor-paid accident-and-health insurance + a USD $500 minimum education allowance for Standard ($1,000 for EduCare). Compute and quote the comparative net financial position vs. EU routes per the actual stipend and cost-of-living numbers — do not assert universal superiority without the calculation.
- **2025 Visa Integrity Fee (USA)** — added under the One Big Beautiful Bill Act (July 2025). Verify the current amount and effective date against **official US sources only** (travel.state.gov + state.gov + ecfr.gov), treating sponsor websites as secondary commentary. Quote with source URL and retrieval date. Do not invent a figure.
- **SEVIS fee for au-pair J-1 is USD $35** — NOT $220 (the higher figure applies to intern/trainee/teacher J-1 only). Source: ice.gov/sevis FAQ. Many SA candidates encounter the wrong figure on blogs.
- **MRV interview fee** — USD $185 currently (the $160 → $185 increase took effect in 2023). Verify at za.usembassy.gov.
- **SA Reciprocity Fee** — $0 for J-1 issuance per travel.state.gov reciprocity table for South Africa. State explicitly because some sponsor agencies imply there is one.
- **Sponsor agency programme fees for SA candidates** — verify per-agency from their disclosure pages (US State Dept requires sponsors to disclose fees):
  - Cultural Care: confirm current SA-specific fee at culturalcare.co.za
  - AIFS / Au Pair in America: confirm at aupairinamerica.co.za
  - Go Au Pair: confirm at goaupair.com
  - AuPairCare: confirm at aupaircare.com
  - EurAuPair: confirm at eurpaupair.com
  - InterExchange: confirm at interexchange.org
  - Note: typical 2025 figures are USD $1,000–1,800 but they change annually — always quote with retrieval date and source URL.
- **DIRCO apostille itself is free** — model courier and concierge fees separately (~R350–700 per document).
- **SAPS PCC fee** — verify current at saps.gov.za (R190 as of 2024; the older R150 figure is outdated); concierge services R500–1,000 cut courier time only, not SAPS processing time.
- **AA IDP fee** — verify aa.co.za current (~R380 typical).
- **Goethe-Institut A1 cost** — verify Johannesburg / Pretoria centre current pricing. The **A1-level proof** is required at the German au-pair visa application; the candidate can satisfy this via the Goethe A1 exam, telc A1 exam, or other recognised A1 certificate — formal Goethe course attendance is NOT required if the candidate can prove A1 by another route. Self-study + exam-only is a valid lower-cost pathway. Include the exam fee in Germany cost scenarios; treat the course fee as optional.
- **Netherlands au-pair fee** — verify ind.nl current TEV / residence-permit application fee (recent rate approximately €423 in 2026 — confirm against ind.nl tariefs page with retrieval date). Recognised sponsor files; fee is often paid by the sponsor or host family — confirm per-agency. **Dutch law caps au-pair-to-agency intermediary fees at approximately €34** for preparation costs — agencies charging au pairs more than this for placement-related services are violating the cap. Surface this rule.
- **Germany national D visa fee** — verify southafrica.diplo.de current ZAR equivalent (typically €75).
- **France long-stay visa fee** — verify france-visas.gouv.fr (typically €99) + CAPAGO South Africa service fee (fr-za.capago.eu — replaced VFS Global in 2023) + **ANEF VLS-TS validation tax (timbre)** payable within 3 months of arrival in France.
- **Flight pricing** — Johannesburg / Cape Town → JFK or Newark (USA J-1 sponsor typically books and pays); → Amsterdam (NL — sponsor or host family may cover one-way); → Frankfurt / Munich / Berlin (DE — typically au pair pays inbound, host family may reimburse end of programme); → Paris CDG (FR — typically au pair pays). Quote one-way and return ranges with retrieval date.
- **First-month relocation buffer** — even with sponsor-paid flight + room + board, the candidate needs ZAR 3,000–8,000 in pocket for first-week incidentals (US sim card, transit, toiletries, work clothes if needed). Build this into every scenario.
- **Au-pair income tax (USA)** — USA J-1 au-pair stipend is treated as wages and is reportable; the au pair is generally a non-resident alien filing Form 1040-NR and tax obligations may be modest at low stipend levels. Sponsor agencies are NOT mandatorily required to issue W-2s and most do not unless they elect voluntary withholding. Verify against irs.gov au-pair-specific guidance and Publication 519 — do not assert a universal W-2 / 1099 rule. EU pocket money is generally not taxed as employment income in the destination because it is an expense allowance, not wages — but confirm with the destination tax authority. SA tax residency: most au pairs maintain SA residency and the foreign earnings fall well below the R1.25M SARS exemption cap.
- **Don't underestimate calendar time** — costs vault should also show the timeline. SAPS PCC ~8 weeks, DIRCO apostille ~1–4 weeks (channel-dependent), Goethe A1 prep + exam ~3–4 months, sponsor agency matching 2–8 weeks, MVV processing for NL ~6 weeks, German visa appointment 4–8 weeks lead time at Pretoria embassy. Total realistic timeline from "I want to be an au pair" to arrival is **5–9 months**.
- **Single-source rule** — visa fees, SEVIS amounts, sponsor agency programme fees, and stipend rates must be primary-source-verified. Sponsor agency websites are tier-2 acceptable for their own programme fees and stipend amounts (since sponsors are required to disclose). Forum posts and blog round-ups are `alleged`.
- Folder structure: `Cost Items/`, `Cost Scenarios/`, `Stipends/`
