# Prompt: Farming — Scam Red Flags

> Run with `/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-farming-05-scams`

---

/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-farming-05-scams

**Goal:** Build a farming-specific reference of scam patterns targeting South African farm and agricultural workers — covering fake "PALM placement" pitches, fake "NZ RSE" pitches, fake UK Seasonal Worker scheme operators, upfront recruitment-fee fraud (illegal under H-2A and UK scheme operator rules), maritime/fishing-vessel scams (per Australian High Commission Pretoria warnings), and "guaranteed PR through farming" claims. Each pattern must include verification steps that the SA worker can perform independently in under 5 minutes.

**Seed entities:**
- Fake Australia PALM placement scam (most common SA-targeting farming scam — PALM is closed to SA)
- Fake UK Seasonal Worker "agency" charging upfront recruitment fee (only the small set of currently-approved scheme operators can issue CoS — 6 per current GOV.UK farm-worker guidance: AGRI-HR, Concordia (UK) Ltd, Fruitful Jobs, HOPS Labour Solutions Ltd, Pro-Force Limited, RE Recruitment (poultry only))
- Fake H-2A worker-paid recruitment-fee scam (illegal under 20 CFR § 655.135(j)–(k); transportation/subsistence covered separately at § 655.122(h))
- Maritime / offshore fishing-vessel scam targeting SA workers (per Australian High Commission Pretoria warning at southafrica.embassy.gov.au/pret/visascams.html)
- "Guaranteed PR via farm work" pitch (false: UK Seasonal Worker, H-2A, and Canadian Agricultural Stream do not provide PR)

**Source constraints:** palmscheme.gov.au/who-can-apply (PALM eligibility — proves SA exclusion), immigration.govt.nz/new-zealand-visas/apply-for-a-visa/about-visa/recognised-seasonal-employer-rse-limited-visa (RSE eligibility — proves SA exclusion), gov.uk/seasonal-worker-visa (UK route official page), gov.uk/government/publications/seasonal-worker-visa-guidance-for-applicants (4 scheme operator names), uscis.gov/working-in-the-united-states/temporary-workers/h-2a-temporary-agricultural-workers, ecfr.gov/current/title-20/chapter-V/part-655/subpart-B (20 CFR § 655.135 worker-fee prohibition), southafrica.embassy.gov.au/pret/visascams.html (AU High Commission scam alerts), za.usembassy.gov, saps.gov.za, sanews.gov.za, actionfraud.police.uk

**Iterations:** 6

---

## Note schemas — apply to every note created

**SCAM PATTERN note:**
```markdown
---
type: scam_pattern
name:
aliases: []
category: [closed_scheme_pitch | fake_scheme_operator | upfront_recruitment_fee | guaranteed_pr_claim | maritime_offshore | identity_theft | fake_employer]
target_route: [australia_palm | nz_rse | uk_seasonal_worker | usa_h2a | canada_sawp | canada_agricultural_stream | generic_farming]
target_demographic: []
channels: [facebook | whatsapp | telegram | linkedin | indeed | email | in_person | tiktok | instagram]
typical_fee_requested_zar:
typical_fee_requested_destination_currency:
documents_requested_fraudulently: []
reporting_channel_sa:
reporting_channel_uk:
reporting_channel_usa:
reporting_channel_australia:
evidence_strength: confirmed | alleged | rumoured
tags: [scam, farming, fraud, south-africa]
sources:
  -
---

# Scam Pattern Name

How this scam specifically targets SA farm workers — what makes it distinct from generic work-abroad fraud.

## How It Works
Step-by-step from first contact to money or data loss. Quote actual recruiter language patterns where documented.

## Red Flags Specific to Farming
- Flag 1 (e.g. references "Australian PALM" — PALM is closed to SA)
- Flag 2 (e.g. claims to be a UK Seasonal Worker agency but is not one of the 4 Defra-licensed scheme operators)
- Flag 3 (e.g. requests upfront recruitment / "visa processing" fee — illegal under H-2A and UK scheme operator rules)
- Flag 4 (e.g. promises PR via seasonal farm work)

## How to Verify in Under 5 Minutes
Specific actionable check:
- PALM: "Open palmscheme.gov.au/who-can-apply — South Africa is not on the eligible-country list. Stop here."
- UK Seasonal Worker: "Open gov.uk/government/publications/seasonal-worker-visa-guidance-for-applicants (or the current Home Office sponsor publication) and confirm the agency is on the list of approved scheme operators. As of late 2025 there are 5: AGRI-HR, Concordia (UK) Ltd, Fruitful Jobs, HOPS Labour Solutions, Pro-Force. The list changes year-on-year. If not on the official list, do not pay. Cross-check on the Home Office Register of Licensed Sponsors and the GLAA register at gla.gov.uk."
- H-2A: "If anyone is asking you to pay them for the H-2A visa or job placement, that is illegal under 20 CFR § 655.135. Report to US Embassy Pretoria."
- Canada SAWP: "SAWP is for Mexico and Caribbean countries only. South Africans cannot apply. The accessible Canadian route is the Agricultural Stream via LMIA — see canada.ca/en/employment-social-development/services/foreign-workers/agricultural.html"

## Where to Report
- **In SA:** SAPS (saps.gov.za); SA Department of Employment and Labour
- **UK:** Action Fraud (actionfraud.police.uk); UK Visas and Immigration fraud reporting
- **USA:** US Embassy Pretoria (za.usembassy.gov); FTC (reportfraud.ftc.gov); DOL Wage and Hour Division (for H-2A worker-fee violations)
- **Australia:** Department of Home Affairs / Australian Border Watch (visa scam reporting); Scamwatch (ACCC); OMARA (mara.gov.au) for migration-agent misconduct
- **Canada:** Canadian Anti-Fraud Centre

## Reported Instances
Documented cases (date, source, outcome). If none confirmed, state explicitly: "No formally documented case found in public sources as at [date]" — do not invent.

## Connections
- [[Verification Method]] — countered_by, source: [url]
- [[Excluded Scheme]] — exploits, source: [url]

## Sources
- [Source title](url)
```

**VERIFICATION METHOD note:**
```markdown
---
type: verification_method
name:
description:
applicable_routes: [uk_seasonal_worker | usa_h2a | canada_agricultural_stream | australia_skilled | all]
official_register_url:
how_to_use:
typical_time_to_verify: [< 1 minute | 1–5 minutes | > 5 minutes]
evidence_strength: confirmed
tags: [verification, farming, scam-protection, south-africa]
sources:
  -
---

# Verification Method Name

What this check proves and how a SA farm worker performs it in under 5 minutes.

## Step-by-Step
1.
2.
3.

## What a Pass Looks Like
Concrete description: e.g. "Operator name appears on the GOV.UK Seasonal Worker scheme operator list at [URL] dated [date]."

## What a Fail Looks Like
Concrete description: e.g. "Operator name not found on the official list. Do not engage further."

## Connections
- [[Scam Pattern]] — counters, source: [url]

## Sources
- [Source title](url)
```

**EDGE metadata:**
- `relationship_type`: countered_by | targets | reported_in | verified_via | documented_by | exploits | impersonates
- `description`: short label
- `evidence_strength`: confirmed | alleged | rumoured
- `sources`: at least one URL

---

## Runtime rules

- `evidence_strength`: `confirmed` | `alleged` | `rumoured` — distinguish official embassy / regulator warnings from anecdotal SA community reports
- **PALM scam is the lead scam pattern targeting SA farm workers** — every Pacific Australia Labour Mobility "placement" or "deposit" pitch directed at SA workers is fraudulent because the scheme is restricted to 9 Pacific island countries + Timor-Leste. Cite palmscheme.gov.au/who-can-apply directly. Treat this as the lead scam pattern in the vault. Do not claim it is the "most common" without a sourced statistic
- **NZ RSE scam follows the same pattern** — RSE is Pacific-only; create a parallel scam pattern note
- **UK Seasonal Worker fake operator scam** — only a small set of currently-approved scheme operators exist (5 as of late 2025: AGRI-HR, Concordia (UK) Ltd, Fruitful Jobs, HOPS Labour Solutions, Pro-Force) — Defra-endorsed and GLAA-licensed. The list has changed year-on-year. Cross-check every claimed UK Seasonal Worker recruiter against the official Home Office / Defra publication and the GLAA register at gla.gov.uk. Document the verification step prominently
- **H-2A worker-fee prohibition** — 20 CFR § 655.135(j)–(k) prohibits recruitment / labor-certification / job-placement fees being charged to the worker; transportation/subsistence is § 655.122(h); visa disclosure timing is § 655.122(q). Document each precisely. The new H-2 regulations effective 17 Jan 2025 give USCIS authority to deny petitions where the petitioner has committed prohibited-fee or labour-law violations. **Report H-2A worker-fee/labour violations to the U.S. DOL Wage and Hour Division** (not the embassy)
- **Canada SAWP confusion** — recruiters sometimes pitch "Canadian SAWP" to SA workers because they are familiar with the SAWP brand. SAWP is closed to SA; the Agricultural Stream LMIA route is open. Create a scam pattern note that distinguishes these clearly so the vault helps readers find the legitimate Canadian route, not just reject the scam
- **Maritime / offshore agriculture scam** — the AHC Pretoria visa-scam page is generic visa-scam guidance, not maritime-specific. For maritime/aquaculture-targeted SA scam evidence, prefer Australian Maritime Safety Authority (AMSA) seafarer job-offer scam alerts and consular visa-fraud notices. Document each maritime/aquaculture scam pattern with a source-specific citation; do not over-claim the AHC Pretoria page is maritime-specific
- **"Guaranteed PR via farm work" claim** — UK Seasonal Worker, H-2A, and Canadian Agricultural Stream do not lead to PR. Document this as a scam test: any recruiter promising PR via these routes is misrepresenting. Note honestly that Australian 491 → 191 and Canadian high-wage routes can lead to PR over years of skilled employment, but those are not the routes scammers usually reference
- **No paid agent for direct visa applications** — UK Seasonal Worker visa is applied for directly via gov.uk; H-2A worker side is processed via DS-160 + US Embassy Pretoria; Canadian work permit is applied for via the IRCC portal. Anyone charging a "visa processing fee" to submit these on the worker's behalf is unnecessary at best, fraudulent at worst — document the official application URLs prominently
- **Do not duplicate generic scam content from wa-shared-scams** — focus on farming-specific patterns
- Never name individual scammers unless formally charged or named in an official government source
- Every verification method must link to a live official URL the SA worker can check independently
- Folder structure: `Scam Patterns/`, `Verification Methods/`
