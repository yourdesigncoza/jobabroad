# Prompt: Trades — Scam Red Flags

> Run with `/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-trades-05-scams`

---

/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-trades-05-scams

**Goal:** Build a trades-specific reference of scam patterns targeting South African qualified tradespeople (electricians, plumbers, welders, carpenters, builders, vehicle technicians, fitters, boilermakers) seeking work in Australia, the UK, Canada, New Zealand, or the UAE — covering how trade-targeting scams differ from generic work-abroad fraud, the specific red flags (fake CoS, fake CSCS / JIB / ECS card services, fake "guaranteed PR" pipelines, maritime / FIFO / mining placement scams), and how to verify a legitimate employer or sponsor using the public official registers.

**Seed entities:**
- Fake UK Certificate of Sponsorship (CoS) scam — agency selling fake or non-existent CoS for "guaranteed" UK construction / electrical jobs
- Fake UK competence-card services — CSCS is administered via cscs.uk.com / CITB; ECS is administered by JIB / SJIB; NOCN runs CPCS and similar job-card schemes (NOCN is *not* the issuer of generic CSCS). Pre-arrival "fast-track card" services are a common scam pattern.
- Australian maritime / oil rig / mining FIFO placement scam — Australian High Commission Pretoria has issued public warnings; offers bypass skills-assessment and Standard Business Sponsorship requirements
- Fake Canadian "trades visa pipeline" / "guaranteed PNP nomination" scam — common on Facebook, TikTok and Telegram targeting SA trades; legitimate PNP nominations are issued by provinces, not by recruiters; Canadian immigration consultants must be CICC-licensed (college-ic.ca register)
- Official verification publishers — UK Home Office, IRCC, Home Affairs (AU), Immigration NZ — and the licensed-sponsor / accredited-employer / consultant registers used for verification (gov.uk Register of Licensed Sponsors; immigration.govt.nz Accredited Employers; college-ic.ca CICC; iaa.govt.nz IAA; mara.gov.au OMARA)

**Source constraints:** gov.uk/government/publications/uk-visa-sponsorship-employers (UK Register of Licensed Sponsors — public CSV, weekly), gov.uk/government/news (Home Office scam warnings), assets.publishing.service.gov.uk, cscs.uk.com, citb.co.uk, ecscard.org.uk, jib.org.uk, sjib.org.uk, immi.homeaffairs.gov.au, abf.gov.au (Australian Border Force sanctioned-sponsors register where current), asic.gov.au + abr.business.gov.au (ABN Lookup) for Australian employer verification, mara.gov.au (OMARA registered migration agents), southafrica.embassy.gov.au/pret/visascams.html (Australian High Commission Pretoria official scam warning), canada.ca/en/immigration-refugees-citizenship/services/protect-fraud (IRCC fraud alerts), college-ic.ca (CICC public register of licensed Canadian immigration consultants), official provincial PNP sites — alberta.ca/aaip, welcomebc.ca, ontario.ca/page/oinp, saskatchewan.ca/sinp, immigratemanitoba.com, immigration.govt.nz (Accredited Employer list — searchable), iaa.govt.nz (NZ Licensed Immigration Adviser register), icp.gov.ae, gdrfa.ae, mohre.gov.ae, ner.ae (UAE National Economic Register — trade licence verification), tradesrecognitionaustralia.gov.au (assessing authority for many trade occupations; outcomes cannot be brokered), labour.gov.za (Department of Employment and Labour — Employment Services Act job-fee warnings), gov.za, saps.gov.za, sanews.gov.za, actionfraud.police.uk (UK fraud reporting)

**Iterations:** 6

---

## Note schemas — apply to every note created

**SCAM PATTERN note:**
```markdown
---
type: scam_pattern
name:
aliases: []
category: [fake_cos | fake_competence_card | fake_pnp_nomination | fake_employer | fake_skills_assessment | fake_immigration_adviser | upfront_fee | identity_theft | guaranteed_placement | maritime_oil_rig | fifo_mining]
jurisdiction:
regulator:
official_register_name:
required_identifier:
verification_target:
visa_pathway:
target_destination: [australia | uk | canada | new_zealand | uae | generic]
target_trade: [electrician | plumber | welder | carpenter | builder | vehicle_technician | fitter | boilermaker | all_trades]
channels: [facebook | whatsapp | telegram | tiktok | instagram | linkedin | indeed | email | in_person | website | recruitment_agency]
typical_fee_requested_zar:
fee_currency:
fee_recipient:
documents_requested_fraudulently: []
reporting_channel_sa:
reporting_channel_destination:
official_reporting_url:
last_verified_at:
evidence_strength: confirmed | alleged | rumoured
tags: [scam, trades, fraud, south-africa]
sources:
  -
---

# Scam Pattern Name

How this scam specifically targets SA tradespeople — what makes it distinct from generic work-abroad fraud.

## How It Works
Step-by-step from first contact to money or data loss. Use neutral language; do not name individuals unless formally charged in an official source.

## Red Flags Specific to Trades
- Flag 1 (e.g. "guaranteed UK CoS for £R10,000" — real CoS comes from a Licensed Sponsor and the sponsor pays the Immigration Skills Charge, not the worker)
- Flag 2 (e.g. agency offers "fast-track CSCS / JIB / ECS card before arrival" for upfront fee — cards are issued by NOCN / JIB / ECS directly, not via brokers)
- Flag 3 (e.g. claims SA Red Seal "auto-recognised" in Canada — false; provincial Trade Equivalency Assessment is required)
- Flag 4 (e.g. "skip TRA assessment" or "we have an arrangement with TRA" — TRA is the only designated assessor; outcomes cannot be brokered)

## How to Verify
Specific actionable checks:
- UK: search the Licensed Sponsor at gov.uk/government/publications/uk-visa-sponsorship-employers — if the company is not on the weekly CSV, the CoS is not valid
- AU: cross-check the sponsoring employer using the ABF / Department of Home Affairs sponsor / sanctioned-sponsor register where available (abf.gov.au, immi.homeaffairs.gov.au), plus ASIC and ABN Lookup (abr.business.gov.au) for company registration; for migration-agent legitimacy use the OMARA register at mara.gov.au
- NZ: the Accredited Employer list is searchable at immigration.govt.nz — if the employer is not listed, the AEWV cannot be granted
- Canada: PNP nominations are issued by the province (e.g. AAIP, BC PNP, OINP, SINP) — there is no "agent" issuing nominations; verify on the official provincial site
- UAE: verify the employer's MOHRE registration at mohre.gov.ae before transferring any documents

## Where to Report
- **In SA:** SAPS (saps.gov.za); SA Department of Employment and Labour
- **UK:** Action Fraud (actionfraud.police.uk); Home Office immigration enforcement
- **Australia:** Australian High Commission Pretoria (southafrica.embassy.gov.au); Department of Home Affairs visa fraud reporting
- **Canada:** IRCC fraud alerts (canada.ca/en/immigration-refugees-citizenship/services/protect-fraud); local police in destination
- **New Zealand:** Immigration NZ fraud reporting (immigration.govt.nz)

## Reported Instances
Documented cases (date, source, outcome if known). If none confirmed, state "no formally documented cases as at [date]" — do not invent.

## Connections
- [[Verification Method]] — countered_by, source: [url]
- [[Government Body]] — warns_against, source: [url]

## Sources
- [Source title](url)
```

**VERIFICATION METHOD note:**
```markdown
---
type: verification_method
name:
description:
applicable_destinations: [australia | uk | canada | new_zealand | uae | all]
official_register_url:
how_to_use:
takes_minutes:
evidence_strength: confirmed
tags: [verification, trades, scam-protection, south-africa]
sources:
  -
---

# Verification Method Name

What this check proves and how an SA tradesperson performs it in under 5 minutes.

## Step-by-Step
1. Open [official URL].
2. Search for the company / sponsor / nomination reference.
3. Compare to what the recruiter / agent has claimed.

## What a Pass Looks Like
e.g. "Company appears on the weekly UK Licensed Sponsor CSV with the role classification matching the offer; CoS reference number provided is valid format (alphanumeric)."

## What a Fail Looks Like
e.g. "Company is not on the register; CoS reference is missing or in the wrong format; the sponsor type does not match the role."

## Connections
- [[Scam Pattern]] — counters, source: [url]

## Sources
- [Source title](url)
```

**EDGE metadata:**
- `relationship_type`: countered_by | targets | warns_against | reported_in | verified_via | documented_by | impersonates
- `description`: short label
- `evidence_strength`: confirmed | alleged | rumoured
- `sources`: at least one URL

---

## Runtime rules

- `evidence_strength`: `confirmed` | `alleged` | `rumoured` — distinguish official UK Home Office / Australian High Commission / IRCC / Immigration NZ scam warnings from anecdotal SA community reports.
- **Do not duplicate generic scam content from wa-shared-scams** — focus on trade-specific variants:
  - Fake UK CoS / TSL "guarantees"
  - Fake CSCS / JIB / ECS competence-card services
  - Fake "guaranteed PNP nomination" pipelines
  - Maritime / oil rig / mining FIFO placement scams (specifically warned about by Australian High Commission Pretoria)
  - Fake "TRA assessment skip" claims
- **Key distinguishing fact for the UK:** Only employers on the **UK Register of Licensed Sponsors** (public, weekly CSV at gov.uk) can issue a Certificate of Sponsorship. Confirming the sponsor is on the register proves sponsor status — it does **not** validate a specific CoS reference, occupation/SOC code, or salary. Cross-check the CoS details against the role described, and confirm the sponsor type matches the route. Any agency offering a CoS without a verifiable Licensed Sponsor on the register is fraudulent.
- **UK competence cards — different issuers:** CSCS is administered via cscs.uk.com / CITB; ECS is administered by JIB / SJIB; NOCN runs CPCS and other job-card schemes (NOCN is *not* the issuer of generic CSCS). Pre-arrival "card guarantee" services are at best unnecessary and at worst fraudulent — cards typically require a UK trade-test or recognised qualification mapping, and the worker arranges this directly. Document the correct issuer per card.
- **TRA assessing-authority status:** TRA is the assessing authority for many listed trade occupations in Australia, but for some occupations the assessment is delivered by TRA-approved RTOs and other occupations may use a different assessing authority listed by the Department of Home Affairs. Verify the correct assessor per occupation at point of writing. Outcomes cannot be brokered, fast-tracked, or guaranteed by agents — any such claim is fraudulent.
- **PNP nominations are issued by provinces, not by agents or "consultants".** Document the official provincial nomination process per province; flag "guaranteed nomination" claims as a red flag.
- **NZ Accredited Employer list is searchable.** AEWV cannot be granted without an Accredited Employer; recruiters claiming AEWV without naming an Accredited Employer are a red flag.
- **UAE verification — multi-step:** For UAE mainland private-sector employment, MOHRE work-permit registration is required and verifiable at mohre.gov.ae. Trade-licence existence should also be checked via the **National Economic Register** at ner.ae. Entry permits and residency are issued by **ICP** (icp.gov.ae) federally and **GDRFA** (gdrfa.ae) in Dubai. Absence from MOHRE plus absence from the National Economic Register = no legal recruitment authority — phrase the verification step as a multi-register check.
- **Document the "no upfront placement fee" principle clearly.** Charging an SA jobseeker an upfront placement fee is contrary to SA labour law — specifically the **Employment Services Act 4 of 2014, section 15**, which prohibits fees being charged to work-seekers by private employment agencies. Programme administration fees (TRA, IELTS, government visa fees) are paid to the regulator / department directly — not to a third-party "agent." Frame this distinction precisely; cite labour.gov.za for current Department of Employment and Labour guidance.
- **Never name individual scammers** unless formally charged or named in an official government / police source. Use category names ("operators selling fake CoS"), not personal names.
- **Every verification method must link to a live official URL** that an SA tradesperson can check themselves. If the URL changes, flag for re-verification.
- All factual claims about scam mechanics, registers, and verification methods must be verified at the primary source (gov.uk, immi.homeaffairs.gov.au, southafrica.embassy.gov.au, canada.ca, immigration.govt.nz, mohre.gov.ae). Search snippets alone are not confirmation.
- Folder structure: `Scam Patterns/`, `Verification Methods/`
