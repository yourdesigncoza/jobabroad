# Prompt: Au Pair — Scam Red Flags

> Run with `/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-au-pair-05-scams`

---

/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-au-pair-05-scams

**Goal:** Build an au-pair-specific reference of scam and abuse patterns targeting South African au-pair candidates in 2025–2026 — covering WhatsApp upfront-fee recruiters, "guaranteed placement" SA-based agents who only forward CVs, "direct host-family" placements that bypass the J-1 sponsor (illegal visa fraud), Netherlands private au-pair arrangements that bypass IND recognition (illegal), fake host families on AuPairWorld / GreatAuPair (catfish profiles), passport-holding on arrival (USA / NL / DE host-family abuse), early-departure forfeiture clauses that trap candidates, mid-placement abuse and the sponsor agency's emergency line, and trafficking risk in unstructured (non-programme) arrangements — with the verification tools (US State Dept sponsor search, IND public register, BA Gütezeichen list, IAPA member directory) an SA candidate can use to confirm a legitimate sponsor in under 5 minutes.

**Seed entities:**
- Fake "guaranteed placement" R5,000–R30,000 SA-based recruiter packages (WhatsApp / Facebook / Instagram operators who only forward CVs to legitimate sponsors)
- "Direct host-family" placement scam (host family contacts SA candidate directly, bypasses J-1 sponsor; candidate travels on B-2 tourist visa and works illegally — visa fraud, deportable)
- Netherlands private au-pair arrangement scam (host family or agency NOT on IND public register; illegal under Dutch immigration law)
- Fake sponsor impersonation (impersonates Cultural Care, AIFS, Au Pair in America, Go Au Pair brand)
- Passport-holding on arrival (host family keeps candidate's passport — illegal in USA/NL/DE/FR; reportable to sponsor emergency line, US State Dept Office of Designation, IND, or local police)
- Catfish host-family profile on AuPairWorld / GreatAuPair (harvests passport copies + personal details, or asks au pair to send "flight booking" money via Western Union / e-wallet)
- Early-departure forfeiture clause exploitation (legitimate programmes have these but unscrupulous arrangements use them to trap candidates in abusive placements)
- Unstructured Gulf-state "au pair" / domestic worker recruitment (Kafala system, NOT au-pair exchange — much higher abuse + trafficking risk; out of legitimate au-pair scope but candidates encounter the offer)

**Source constraints:** ecfr.gov (22 CFR 62.31 — US au-pair programme rules and sponsor obligations including 24h emergency line and rematch duties), j1visa.state.gov (US State Dept J-1 official designated sponsor search + State Dept Office of Designation au-pair complaint route), travel.state.gov (B-visa work-prohibition reference for "B-2 tourist visa + work illegally" scam), travel.state.gov (US Department of State human trafficking + visa fraud reporting), eca.state.gov (Bureau of Educational and Cultural Affairs — designation process + monitoring), ind.nl (Netherlands IND public register of recognised sponsors — use the "Au pair" section of the Au pair and Exchange register), ind.nl/en/contact (IND complaint and abuse reporting), nlarbeidsinspectie.nl (Nederlandse Arbeidsinspectie / Dutch Labour Inspectorate — investigates au-pair exploitation as labour abuse), southafrica.diplo.de (German Mission SA — au-pair visa policy + complaint contact), arbeitsagentur.de + guetegemeinschaft-aupair.de (BA Gütezeichen RAL quality mark — list of vetted German au-pair agencies), iapa.org (International Au Pair Association — vetted-member directory; not a regulator but a useful cross-check), saps.gov.za (SA Police Service trafficking and fraud reporting channels), labour.gov.za (SA Department of Employment and Labour — Employment Services Act, private employment agency registration), safps.org.za (Southern African Fraud Prevention Service), cipc.co.za (SA company verification for SA-based recruiters), za.usembassy.gov (US Embassy SA — visa fraud reporting), state.gov/humantrafficking (US trafficking reporting), polaris-project.org (Polaris Project — US trafficking hotline; relevant for J-1 abuse), netherlandsworldwide.nl (NL Embassy SA fraud + complaint reporting), france-visas.gouv.fr (French visa fraud reporting), culturalcare.com / aupairinamerica.com (Cultural Care + AIFS 24-hour emergency lines for au pairs in-country — tier-2 reference), aupairworld.com (AuPairWorld — note this is a directory, not a sponsor; flag the catfish risk), greataupair.com (GreatAupair — same), HelloPeter, TrustPilot, Reddit r/aupair and r/Auspairs (forum-tier — flag as `alleged`)

**Iterations:** 6

---

## Note schemas

**SCAM PATTERN note:**
```markdown
---
type: scam_pattern
name:
aliases: []
category: [fake_recruiter | guaranteed_placement | direct_host_family_bypass | private_unsponsored_arrangement | sponsor_impersonation | catfish_host_family | passport_holding | early_departure_trap | trafficking_under_au_pair_label | upfront_fee_only]
target_destination: []
channels: [whatsapp | facebook | instagram | tiktok | aupairworld | greataupair | linkedin | email | in_person | sa_recruiter_office]
typical_fee_requested_zar:
typical_age_target:
reporting_channel_sa:
reporting_channel_destination:
evidence_strength: confirmed | alleged | rumoured
tags: [scam, au-pair, fraud, sa-specific]
sources:
  -
---

# Scam Pattern Name

How this scam specifically targets SA au-pair candidates aged 18–26 — what makes it different from generic work-abroad fraud and how it exploits au-pair-specific assumptions (e.g. "I need someone to find me a host family in America" → guaranteed-placement upsell that simply forwards the CV to Cultural Care anyway).

## How It Works
Step-by-step from first contact (often WhatsApp / Instagram DM / Facebook group) to money / passport / data loss.

## Red Flags Specific to Au-Pair Work
- Flag 1
- Flag 2
- Flag 3

## How to Verify
Specific actionable check (e.g. "Search the US State Department designated sponsor list at j1visa.state.gov — if the recruiter is not on that list, they cannot legally place you in the USA." Link to the official register or programme page.

## Where to Report
- **In SA:** [SAPS / labour.gov.za / DIRCO consular fraud / SAFPS]
- **In destination country:** [sponsor agency 24-hour emergency line / US State Dept Office of Designation / IND fraud / Polaris Project / local police]

## Reported Instances
Known documented cases (date, source, outcome if known). Distinguish official warnings (US State Dept, IND advisories) from forum threads.

## Connections
- [[Verification Method]] — countered_by, source: [url]

## Sources
- [Source title](url)
```

**VERIFICATION METHOD note:**
```markdown
---
type: verification_method
name:
description:
applicable_destinations: []
applicable_to_scam: []
official_register_url:
how_to_use:
time_to_perform_minutes:
evidence_strength: confirmed
tags: [verification, au-pair, scam-protection]
sources:
  -
---

# Verification Method Name

What this check proves and how an SA au-pair candidate performs it in under 5 minutes.

## Step-by-Step
1.
2.
3.

## What "Pass" and "Fail" Look Like
What a legitimate result looks like vs. what a scam result looks like.

## Connections
- [[Scam Pattern]] — counters, source: [url]

## Sources
- [Source title](url)
```

**REPORTING CHANNEL note:**
```markdown
---
type: reporting_channel
name:
country:
category: [sa_law_enforcement | sa_labour_regulator | sa_fraud_prevention | destination_sponsor_emergency | destination_immigration | destination_law_enforcement | trafficking_hotline | embassy]
contact_url:
contact_phone:
contact_email:
what_to_report:
typical_response_time:
evidence_strength: confirmed
tags: [reporting-channel, au-pair, scam-protection]
sources:
  -
---

# Channel Name

What this body handles and when an SA au-pair candidate should contact it (before travel = fraud reporting; during placement = abuse + safety; after = post-incident reporting).

## Connections
- [[Scam Pattern]] — reports_to, source: [url]

## Sources
- [Source title](url)
```

**EDGE metadata:**
- `relationship_type`: countered_by | targets | reported_in | verified_via | documented_by | exemplifies | impersonates | bypasses_regulator | reports_to
- `description`: short label
- `evidence_strength`: confirmed | alleged | rumoured
- `sources`: at least one URL

---

## Runtime rules

- `evidence_strength`: `confirmed` | `alleged` | `rumoured` — distinguish official warnings (US State Dept, IND, BAMF, embassies, SAPS, labour.gov.za) from anecdotal forum reports.
- **Never name an individual recruiter or agency as fraudulent unless either (a) named in an official government / embassy / labour-authority warning, or (b) the subject of a published court / regulator action.** Forum complaints alone do not justify naming. Use category-level descriptions instead. The exception: if a sponsor agency has been REMOVED from the US State Dept designated sponsor list, naming that agency and citing the removal is acceptable.
- **The single biggest verification tool for the USA is the State Dept sponsor search.** Surface it prominently: https://j1visa.state.gov/participants/how-to-apply/sponsor-search/ → filter by "Au Pair" category. Any "agency" not on this list cannot legally place an au pair in the USA, full stop. SA-based partners (African Ambassadors, OVC, Easy Services) operate as referral partners to a designated sponsor; they are not themselves the legal sponsor — confirm the underlying designated sponsor on the State Dept list.
- **The single biggest verification tool for the Netherlands is the IND public register.** Surface it prominently: https://ind.nl/en/public-register-recognised-sponsors → use the "Au pair" section of the Au pair and Exchange recognised-sponsor register. Any "agency" not in this register cannot legally apply for a Netherlands au-pair residence permit. Private host-family-to-au-pair arrangements bypassing this register are illegal under Dutch immigration law — the residence permit can be refused or withdrawn and the au pair can be required to leave the Netherlands. Serious abuse and exploitation cases additionally fall under the Dutch Labour Inspectorate (nlarbeidsinspectie.nl) and Dutch police.
- **For Germany the BA Gütezeichen (RAL quality mark) is the safest signal.** Verify at https://www.guetegemeinschaft-aupair.de/ — the list of vetted German au-pair agencies that meet RAL standards. Not all legal German au-pair placements use Gütezeichen agencies (the law does not require it), but choosing one significantly reduces abuse risk.
- **Direct host-family placement bypassing the J-1 sponsor is visa fraud.** The candidate enters on a B-2 tourist visa and works illegally — a deportable offence creating an immigration-violation record that can affect future US (and other) visa applications and admissibility. Surface this prominently because it is one of the most common scam offers ("skip the agency, the host family will pay you direct"). Source: travel.state.gov B-visa work-prohibition guidance.
- **Course-seller upsell scam adapted to au-pair** — under 22 CFR 62.31 designated sponsors are required to provide pre-placement training; this is funded by the sponsor's programme fee (which the host family pays). Different sponsors deliver training differently — some pre-departure online, some on-arrival in the USA (Cultural Care / AIFS run programme academies in the USA). The point is: the au pair does NOT pay separately for sponsor training. Anyone in SA charging R5,000+ for "au-pair training" as a separate pre-departure product is suspect — either the sponsor's training is already included in the programme fee, or it is not legitimate sponsor training at all.
- **WhatsApp / Instagram DM channel** — the dominant scam channel for SA au-pair candidates. Legitimate sponsor agencies (Cultural Care, AIFS, Go Au Pair, AuPairCare, EurAuPair, InterExchange) communicate via their app, email, and (for SA candidates) via their SA partner office (African Ambassadors, OVC). They do NOT recruit candidates via WhatsApp DMs from individual "consultants."
- **Passport-holding on arrival** — illegal in all four primary destinations. If a host family refuses to return the passport, the au pair must contact (a) the sponsor agency's 24-hour emergency line (Cultural Care, AIFS, Au Pair in America publish them in the on-arrival materials), (b) the US State Dept Office of Designation au-pair complaint route, (c) the local police, or (d) Polaris Project trafficking hotline (1-888-373-7888 in USA). For NL: contact IND + local Gemeente. For DE: contact local Ausländerbehörde + Bundesagentur für Arbeit. Cross-reference these channels in the verification methods.
- **Early-departure forfeiture clauses are contractual but exploitable.** USA J-1 standard sponsor contracts typically include forfeiture of the return flight if the au pair leaves before 12 months without sponsor approval — the specific terms are in each sponsor's contract, not in 22 CFR 62.31 itself (which governs sponsor monitoring, training, and programme duties rather than flight-forfeiture clauses). Under 22 CFR 62.31 sponsors are required to support rematch when a placement breaks down; legitimate sponsors work with the au pair to find a new host family rather than enforce forfeiture. If an SA candidate is told "if you complain about the host family you lose your flight home," that signals a sponsor failing in their rematch duty — escalate to the US State Dept Office of Designation.
- **Gulf "au pair" / domestic-worker recruitment is NOT au-pair work.** These offers (UAE, Saudi, Qatar, Kuwait, Bahrain, Oman) are domestic-worker visas under the Kafala system — different legal framework, materially higher abuse and trafficking risk, and not regulated as cultural exchange. Flag offers that use the "au pair" label for Gulf placements as a category-level scam (the term is being misused). Refer SA candidates to the trafficking hotline if they have been approached for these.
- **Mid-placement abuse pattern** — surface the sponsor agency 24-hour emergency line as the first port of call for USA placements (sponsors are required to provide it under 22 CFR 62.31). For Netherlands abuse: IND has an au-pair complaint channel. For Germany: local Bundesagentur für Arbeit office + Ausländerbehörde.
- **Trafficking flag** — if an SA candidate is approached for a placement that involves (a) paying the recruiter > R10,000 upfront, (b) handing over the passport to a recruiter "for safekeeping," (c) signing a contract in a language they don't read, or (d) any placement to a Gulf country marketed as "au pair," this matches IOM trafficking indicators. Refer to SAPS trafficking unit + IOM South Africa.
- **Avoid duplicating wa-shared-scams** — the generic Fake Job Offer Scam pattern lives in the shared vault. This vault focuses on au-pair-specific variants only (the WhatsApp upfront-fee, the direct-host-family bypass, the catfish host-family, the passport-holding, the early-departure-forfeiture-exploit, the Gulf-mislabelled placement).
- **IAPA membership is a secondary trust signal only** — IAPA is an industry body whose members sign an ethical code, but IAPA does NOT grant legal authorisation to operate as a sponsor. Never treat IAPA membership as a substitute for US State Dept J-1 designation, IND recognition, or BA Gütezeichen.
- **Single-source rule for naming** — naming a recruiter or sponsor requires a primary source (US State Dept designation list change, IND register removal, official embassy warning). Forum allegations stay at `alleged` and unnamed.
- Folder structure: `Scam Patterns/`, `Verification Methods/`, `Reporting Channels/`
