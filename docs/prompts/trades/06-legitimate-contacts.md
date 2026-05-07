# Prompt: Trades — Legitimate Contacts & Official Links

> Run with `/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-trades-06-contacts`

---

/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-trades-06-contacts

**Goal:** Build a verified directory of official skills-assessment bodies, government visa portals, professional registration bodies, public employer / sponsor registers, and SA-side regulatory and document-concierge contacts that South African qualified tradespeople can legitimately use when planning skilled migration to Australia, the UK, Canada, New Zealand, or the UAE — with scope, fee structure where applicable, and SA-specific notes clearly documented for each.

**Seed entities:**
- Trades Recognition Australia (TRA) — Australian skills-assessment authority for many trade occupations; tradesrecognitionaustralia.gov.au. Note: TRA assessment is *not* a work licence; state/territory trade-licensing bodies issue the actual right to work in licensed trades.
- UK Register of Licensed Sponsors — Home Office public CSV updated weekly; gov.uk/government/publications/uk-visa-sponsorship-employers
- Provincial Canadian trade-equivalency bodies — **Alberta Apprenticeship and Industry Training** (tradesecrets.alberta.ca), **SkilledTradesBC** (skilledtradesbc.ca), **Skilled Trades Ontario** (skilledtradesontario.ca), **Saskatchewan Apprenticeship and Trade Certification Commission** (saskapprenticeship.ca). The SINP is a Saskatchewan immigration body, not a trade-equivalency body — keep separate.
- New Zealand profession-specific boards — Electrical Workers Registration Board (ewrb.govt.nz) and Plumbers, Gasfitters and Drainlayers Board (pgdb.co.nz); Licensed Building Practitioners (lbp.govt.nz / building.govt.nz); NZQA (nzqa.govt.nz) for qualification assessment where relevant
- South African source-document bodies — Quality Council for Trades and Occupations (qcto.org.za), Manufacturing, Engineering and Related Services SETA (merseta.org.za), National Artisan Moderating Body (NAMB) and Indlela for trade-test moderation, South African Qualifications Authority (saqa.org.za), Department of International Relations and Cooperation (dirco.gov.za) for apostille, South African Police Service (saps.gov.za) for PCC

**Source constraints:** tradesrecognitionaustralia.gov.au, immi.homeaffairs.gov.au, abf.gov.au, mara.gov.au (OMARA registered migration agents), state/territory trade-licensing pages (e.g. NSW Fair Trading, Energy Safe Victoria, Queensland Building and Construction Commission, Plumbers Licensing Board WA — verify current URLs), gov.uk/skilled-worker-visa, gov.uk/government/publications/uk-visa-sponsorship-employers, gov.uk/government/publications/skilled-worker-visa-temporary-shortage-list, gov.uk/government/publications/immigration-rules, oisc.gov.uk (Office of the Immigration Services Commissioner — OISC register), cscs.uk.com, citb.co.uk, ecscard.org.uk, jib.org.uk, sjib.org.uk, nocnjobcards.org (NOCN-administered CPCS / NPORS / CISRS card schemes — narrow scope), canada.ca/en/immigration-refugees-citizenship, canada.ca (IRCC employer compliance / ineligible employers list), noc.esdc.gc.ca, red-seal.ca (Canadian Red Seal Program), tradesecrets.alberta.ca, skilledtradesbc.ca, skilledtradesontario.ca, saskapprenticeship.ca (SATCC), provincial compulsory-trades pages per province, college-ic.ca (CICC public register of Canadian immigration consultants), immigration.govt.nz (Accredited Employer search), nzqa.govt.nz, ewrb.govt.nz, pgdb.co.nz, lbp.govt.nz, building.govt.nz, iaa.govt.nz (NZ Immigration Advisers Authority register), icp.gov.ae, gdrfa.ae, mohre.gov.ae, ner.ae (UAE National Economic Register), actvet.gov.ae (Abu Dhabi TVET — Abu Dhabi-scope only, not UAE-wide), qcto.org.za, merseta.org.za, saqa.org.za, dhet.gov.za, umalusi.org.za, namb.dhet.gov.za (NAMB), labour.gov.za, dirco.gov.za, saps.gov.za, home-affairs.gov.za, sable-international.com (for vetted SA-facing migration consultancy reference — flag scope strictly), apostil.co.za (SA document concierge — apostille / SAQA — vetted)

**Iterations:** 6

---

## Note schemas — apply to every note created

**ORGANISATION note:**
```markdown
---
type: organisation
legal_name:
trading_name:
scope: [skills_assessment_body | trade_licensing_authority | professional_registration_body | visa_authority | sa_regulator | document_concierge | migration_consultancy | competence_card_issuer | embassy | other]
is_regulator: [yes | no]
is_intermediary: [yes | no]
can_provide_immigration_advice: [yes | no | not_applicable]
authorised_advice_jurisdictions: []
country_of_operation:
jurisdiction_detail:
service_regions: []
sa_facing: [yes | no]
applicable_destinations: [australia | uk | canada | new_zealand | uae | sa_only | all]
applicable_trades: [electrician | plumber | welder | carpenter | builder | vehicle_technician | fitter | boilermaker | all_trades]
primary_source_url:
official_register_url:
register_number:
licence_number:
registration_status:
contact_url:
phone:
email:
physical_address:
fee_items: []
fee_range_zar:
fee_range_destination_currency:
fee_url:
fee_verified_date:
last_verified_date:
official_warning_url:
scam_warning_notes:
charges_upfront_placement_fees: [yes | no | not_applicable]
sa_cipc_registered: [yes | no | not_applicable | unknown]
evidence_strength: confirmed | alleged | rumoured
tags: [organisation, trades, work-abroad, south-africa]
sources:
  -
---

# Organisation Name

What they do for SA tradespeople, which destinations and which trades they cover, and their fee model where applicable.

## Services for SA Trades
Specific services — skills assessment outcomes, registration, document verification, apostille, language testing, vetted migration consultancy. Be precise about what they DO and DO NOT do.

## Fee Structure
Total programme cost / per-document fee where applicable; what is included vs. what the applicant pays separately; flag whether fees are paid to the regulator (legitimate) or to an intermediary (verify scope).

## SA Community Reputation
HelloPeter / Facebook SA trade-community reputation summary where applicable. If none found, state "No documented complaints found as at [date]."

## Connections
- [[Visa Route]] — supports, source: [url]
- [[Skills Assessment Body]] — administers, source: [url]
- [[Government Body]] — accredited_by, source: [url]

## Sources
- [Source title](url)
```

**GOVERNMENT BODY note:**
```markdown
---
type: government_body
name:
short_name:
category: [visa_authority | skills_assessment_body | professional_registration_body | sa_regulator | embassy | apostille_authority | police_clearance_authority]
jurisdiction: [national | provincial | regional]
country:
relevant_url:
sa_specific_page_url:
applicable_trades: []
evidence_strength: confirmed
tags: [government, trades, work-abroad, south-africa]
sources:
  -
---

# Government Body Name

What this body does and why an SA tradesperson must know about it.

## SA Applicant's Interaction
Exactly what an SA applicant must do with this body (e.g. "Submit OSAP application via tradesrecognitionaustralia.gov.au online portal"; "Verify employer on weekly Licensed Sponsor CSV at gov.uk before signing any contract"; "Apostille SA trade certificate at DIRCO before submitting to TRA").

## Connections
- [[Visa Route]] — administers, source: [url]
- [[Document]] — issues, source: [url]

## Sources
- [Source title](url)
```

**EDGE metadata:**
- `relationship_type`: administers | issues | regulates | accredited_by | recognised_by | partners_with | required_before | warns_against | publishes_register
- `description`: short label
- `evidence_strength`: confirmed | alleged | rumoured
- `sources`: at least one URL

---

## Runtime rules

- `evidence_strength`: `confirmed` | `alleged` | `rumoured`
- **Verify every organisation against its primary register / official URL.** If the organisation cannot be confirmed at its claimed primary source URL, set `evidence_strength: alleged` and state the limitation in the body. No agent or aggregator listing alone counts as confirmation.
- **Distinguish regulators from intermediaries.** TRA, state/territory Australian trade-licensing authorities, EWRB, PGDB, LBP, NZQA, provincial Canadian trade-equivalency bodies (Alberta AIT, SkilledTradesBC, Skilled Trades Ontario, SATCC), IRCC, UKVI, MOHRE, ICP, GDRFA are regulators with statutory authority; migration consultants and document concierges are intermediaries. Be precise about scope: a regulator's outcome cannot be substituted by an intermediary's promise. (Do not include AHPRA — AHPRA is a healthcare regulator, not relevant to trades.)
- **No upfront placement fee from a worker.** Charging an SA tradesperson an upfront placement fee is contrary to SA labour law (Private Employment Agencies regulation under the Basic Conditions of Employment Act). Flag any organisation whose fee model is unclear; document fee models that have been publicly published.
- **Vetted SA migration consultancies in scope:** Sable International (full immigration consulting; OISC-registered for UK; verify current accreditations), Apostil.co.za (document concierge — apostille / SAQA — verify CIPC registration). Other consultancies must be verified individually before recommendation; do not extend vetting to the whole market.
- **UK competence cards — different issuers per scheme:** CSCS is administered via cscs.uk.com / CITB; ECS is administered by JIB / SJIB; NOCN runs CPCS and other NOCN-managed card schemes (CPCS, NPORS, CISRS) — *not* generic CSCS. Document each scheme against its correct administrator; flag third-party card-broker services as outside scope unless they are on the official issuer list.
- **OISC / MARA / IRCC-licensed consultant boundary** — only OISC-registered (UK), MARA-registered (Australia), or IRCC-licensed (Canada) consultants may legally provide application-specific immigration advice in those jurisdictions. The product (and the contacts directory) provides general visa information only; document this boundary clearly in the directory.
- **Apostille routing for SA documents:** DIRCO is the SA apostille authority for documents intended for use abroad. Document the current DIRCO walk-in vs mail-in process and turnaround; many SA tradespeople miss the apostille step and have applications rejected.
- **Date-stamp all fees and contact details** at point of citation; these change. Format: `(verified May 2026 — check [primary URL] for current)`.
- **Embassy / High Commission contacts** — list current SA-facing addresses and visa-application URLs for each in-scope destination only: Australian High Commission Pretoria, UK VFS Pretoria / Cape Town / Durban, Canada VFS Pretoria, NZ visa application centre, and the relevant UAE Embassy / Consulate-General serving SA applicants. Do not include the US Embassy — the US is out of scope for the trades guide. Confirm contact details on the official mission website at point of writing.
- All factual claims about organisations, fees, and contact details must be verified at the primary source URL. Search snippets and aggregator listings alone are not confirmation. If the primary source page is unavailable, set `evidence_strength: alleged` and note the limitation.
- Folder structure: `Organisations/`, `Government Bodies/`
