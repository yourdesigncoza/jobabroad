# Prompt: Au Pair — Legitimate Contacts & Official Links

> Run with `/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-au-pair-06-contacts`

---

/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-au-pair-06-contacts

**Goal:** Build a verified directory of legitimate au-pair contacts for South African candidates aged 18–26 — covering (a) US State Department designated J-1 au-pair sponsor agencies (~12 currently designated; primary contact path), (b) IND-recognised Netherlands au-pair sponsors (single source of truth = IND public register), (c) Bundesagentur für Arbeit Gütezeichen German au-pair agencies + the Federal Foreign Office (Auswärtiges Amt) Mission in SA, (d) French Consulate + CAPAGO South Africa for VLS-TS jeune au pair + ANEF post-arrival validation, (e) SA-side mandatory services (SAPS, DIRCO, Home Affairs, AA South Africa, Goethe-Institut SA), (f) the International Au Pair Association (IAPA) member directory as an industry-body cross-check (NOT a regulator and NOT IND-recognised — purely an industry ethical-code body), and (g) named SA-based sponsor-partner offices (African Ambassadors, OVC, Au Pair in America SA, Cultural Care SA) — with scope, official URLs, fee model, contact details, and known reputation signals.

**Seed entities:**
- US State Department Bureau of Educational and Cultural Affairs (ECA) — programme oversight + designated sponsor list
- Cultural Care Au Pair (largest J-1 sponsor by volume; SA recruitment partner African Ambassadors based in Cape Town)
- AIFS / Au Pair in America (first-designated J-1 sponsor since 1986; SA office in Johannesburg)
- Go Au Pair, AuPairCare, EurAuPair, InterExchange Au Pair USA, expert AuPair, GreatAuPair-as-sponsor (verify current designations on j1visa.state.gov sponsor search)
- IND (Netherlands Immigration and Naturalisation Service) — public register of recognised au-pair sponsors
- Federal Foreign Office of Germany (Auswärtiges Amt) + German Missions in SA (Pretoria, Cape Town, Durban, Johannesburg)
- Bundesagentur für Arbeit (BA) + Gütegemeinschaft Au-pair e.V. (RAL Gütezeichen quality-mark list of vetted German agencies)
- Goethe-Institut Johannesburg + Pretoria (A1 German exam for German au-pair visa)
- DIRCO Legalisation Service (SA-side apostille)
- SAPS Criminal Record Centre (PCC issuance)
- Department of Home Affairs SA (passport issuance + renewal)
- Automobile Association of South Africa (AA) — International Driving Permit issuance
- OVC (SA's longest-running au-pair placement agency since 1986 — multi-destination)
- IAPA (International Au Pair Association — industry body with a vetted-member ethical code; NOT a regulator, NOT IND-recognised)

**Source constraints:** ecfr.gov (22 CFR 62.31 — au-pair programme rules, sponsor duties), j1visa.state.gov (US State Dept J-1 sponsor search — single source of truth for designated USA au-pair sponsors), eca.state.gov (Bureau of Educational and Cultural Affairs — programme oversight + Office of Designation contact), travel.state.gov, za.usembassy.gov (US Embassy Pretoria + Consulates Cape Town / Johannesburg / Durban), ind.nl (Netherlands IND — public register of recognised sponsors at ind.nl/en/public-register-recognised-sponsors), www.government.nl (Dutch government immigration), netherlandsworldwide.nl (NL Embassy SA), bamf.de (German BAMF), auswaertiges-amt.de (German Federal Foreign Office), southafrica.diplo.de (German Missions in SA — au-pair visa info + appointment booking), arbeitsagentur.de (Bundesagentur für Arbeit au-pair guidelines + model contract), guetegemeinschaft-aupair.de (Gütegemeinschaft Au-pair e.V. — RAL quality mark members), goethe.de (Goethe-Institut Johannesburg + Pretoria — A1 exam), telc.net (telc — A1 certificate alternative), france-visas.gouv.fr (French long-stay visa), service-public.fr (F13348 / F15813 — jeune au pair Cerfa convention + VLS-TS rules + validation tax), legifrance.gouv.fr (French primary legislation), administration-etrangers-en-france.interieur.gouv.fr (ANEF — VLS-TS online post-arrival validation portal), fr-za.capago.eu (CAPAGO South Africa — French visa appointments, replaced VFS Global in 2023), interieur.gouv.fr (French Ministry of Interior), ofii.fr (OFII — verify whether arrival medical applies under current VLS-TS procedure), iapa.org (International Au Pair Association — vetted member directory + ethical code), dirco.gov.za (apostille + legalisation), saps.gov.za (criminal record check), home-affairs.gov.za (passport application + renewal), aa.co.za and aaa.co.za (Automobile Association SA — IDP issuance), labour.gov.za (Department of Employment and Labour — private employment agency registration under Employment Services Act), cipc.co.za (SA company registry verification for SA-based sponsor partners), safps.org.za (Southern African Fraud Prevention Service), culturalcare.com / culturalcare.co.za (Cultural Care Au Pair + SA contact), aupairinamerica.com / aupairinamerica.co.za (AIFS Au Pair in America + SA office), goaupair.com (Go Au Pair), aupaircare.com (AuPairCare), interexchange.org (InterExchange Au Pair USA), expertaupair.com, eurpaupair.com, greataupair.com (GreatAuPair-as-sponsor — verify current designation), africanambassadors.com (African Ambassadors Cape Town — Cultural Care SA partner), ovc.co.za (OVC SA — au-pair placement since 1986), easyservicesgroup.co.za (Easy Services Group — apostille / documents support, NOT sponsor), HelloPeter and TrustPilot (reputation cross-check — flag as `alleged`)

**Iterations:** 6

---

## Note schemas

**SPONSOR AGENCY note:** (USA designated J-1 sponsors; IND-recognised NL sponsors; BA Gütezeichen German agencies; French registered au-pair agencies)
```markdown
---
type: sponsor_agency
name:
short_name:
country_served:
sa_office_or_partner:
official_url:
sa_facing_url:
designation_status: [us_state_dept_j1_designated | ind_recognised_sponsor | ba_guetezeichen_member | iapa_vetted_member | other_regulated]
designation_register_url:
sa_candidates_accepted: [yes | no | conditional]
typical_programme_fee_au_pair: [Free | Amount + currency]
typical_programme_fee_host_family: [Amount + currency]
benefits_included_for_au_pair: [outbound_flight | return_flight | medical_insurance | accident_insurance | program_academy | 24h_emergency_line | rematch_support | end_of_program_certificate | education_allowance]
intake_schedule:
typical_match_time_weeks:
contract_length_months:
sa_office_address:
sa_office_email:
sa_office_phone:
known_reputation: [official_designated | well_documented_in_use | newer | flagged]
evidence_strength: confirmed | alleged | rumoured
tags: [sponsor-agency, au-pair, work-abroad, contact]
sources:
  -
---

# Agency Name

What this agency is, which country it serves, and its current designation/recognition status.

## SA-Specific Application Path
How an SA candidate applies — direct online via the sponsor + local SA office or partner. Cultural Care via African Ambassadors (Cape Town); AIFS via Au Pair in America SA (Johannesburg); OVC across multiple destinations.

## What the Sponsor Pays / Charges
Itemised: programme fee (charged to au pair? to host family? both?), flight (outbound / return), insurance (medical / accident), programme academy, education allowance. State who pays what.

## Verification
How an SA candidate confirms the sponsor's designation is current — link to the relevant register URL (j1visa.state.gov sponsor search; ind.nl/en/public-register-recognised-sponsors; guetegemeinschaft-aupair.de members list).

## Connections
- [[Destination]] — operates_in, source: [url]
- [[Visa Route]] — sponsors, source: [url]
- [[Regulatory Body]] — designated_by, source: [url]

## Sources
- [Source title](url)
```

**REGULATORY BODY note:** (US State Dept ECA, IND, BAMF, Auswärtiges Amt, Bundesagentur für Arbeit, OFII, Préfecture)
```markdown
---
type: government_body
name:
short_name:
country:
category: [federal_department | immigration_service | labour_authority | foreign_ministry | embassy | consulate]
jurisdiction: [National | Provincial | Municipal]
relevant_function_for_au_pair:
sa_office_address:
contact_url:
contact_email:
contact_phone:
sponsor_register_url:
public_register_searchable: [yes | no]
evidence_strength: confirmed | alleged | rumoured
tags: [government, au-pair, contact]
sources:
  -
---

# Body Name

What this body does for the au-pair programme — designation, oversight, residence permit issuance, complaint handling.

## Public Register
Link to the searchable register of designated/recognised sponsors. Explain how an SA candidate uses it.

## Connections
- [[Sponsor Agency]] — designates, source: [url]
- [[Visa Route]] — administers, source: [url]

## Sources
- [Source title](url)
```

**SA-SIDE SERVICE note:** (DIRCO, SAPS, Home Affairs, AA, Goethe-Institut SA, labour.gov.za)
```markdown
---
type: sa_side_service
name:
short_name:
category: [authentication | police_clearance | passport | drivers_licence_or_idp | language_certificate | labour_regulation | fraud_prevention]
official_url:
service_for_au_pair_applicants:
processing_time:
cost_zar:
sa_office_locations: []
evidence_strength: confirmed | alleged | rumoured
tags: [sa-side, au-pair, service, contact]
sources:
  -
---

# Service Name

What this body does for an SA au-pair candidate, where to access the service (online / branch), and current cost / processing time.

## Connections
- [[Document]] — provides, source: [url]
- [[Authentication Step]] — performs, source: [url]

## Sources
- [Source title](url)
```

**SA-SIDE SPONSOR PARTNER note:** (African Ambassadors, OVC, Au Pair in America SA, Cultural Care SA — SA-registered companies that act as referral partners to designated US sponsors)
```markdown
---
type: organisation
legal_name:
trading_name:
cipc_registered: [yes | no | unknown]
cipc_number:
entity_type: [sa_sponsor_partner | sa_documents_concierge | sa_translation_service | sa_idp_issuer]
underlying_designated_sponsor: "[[sponsor_agency_name]]"
destinations_covered: []
fee_model: [free_to_au_pair | placement_fee_charged_to_au_pair | revenue_from_underlying_sponsor]
registered_private_employment_agency: [yes | no | unknown]
labour_gov_za_pea_number:
contact_url:
contact_email:
contact_phone:
sa_office_address:
known_complaints_documented: [yes | no | not_assessed]
evidence_strength: confirmed | alleged | rumoured
tags: [organisation, au-pair-sa-partner, sa-side, contact]
sources:
  -
---

# Organisation Name

What they do for SA au-pair candidates (matching interviews, document support, interview prep, departure logistics), which designated sponsor they partner with, and their fee model.

## Underlying Designated Sponsor
The legally-designated US J-1 sponsor whose programme this SA partner operationalises (e.g. African Ambassadors → Cultural Care; Au Pair in America SA → AIFS).

## Fee Structure
Who pays — au pair, host family, underlying sponsor. Charging an au-pair-seeker a placement fee is regulated by the Employment Services Act in SA (labour.gov.za); flag any partner whose model is unclear.

## Reputation Signals
HelloPeter / TrustPilot / Reddit summary. If none found, state "No documented complaints found as at [date]."

## Connections
- [[Sponsor Agency]] — operates_for, source: [url]
- [[Destination]] — places_au_pairs_in, source: [url]

## Sources
- [Source title](url)
```

**EDGE metadata:**
- `relationship_type`: operates_in | designates | administers | places_au_pairs_in | required_before | provides | performs | sponsors | partners_with | issues_a1_certificate_for | issues_idp_for | regulated_by
- `description`: short label
- `evidence_strength`: confirmed | alleged | rumoured
- `sources`: at least one URL

---

## Runtime rules

- `evidence_strength`: `confirmed` | `alleged` | `rumoured`.
- **Designated J-1 sponsors are the safest contact path for the USA.** Surface the State Dept sponsor search prominently as the trust anchor: https://j1visa.state.gov/participants/how-to-apply/sponsor-search/. Only agencies listed there can legally place an au pair in the USA. SA-based partners (African Ambassadors, Au Pair in America SA, OVC) are referral partners to the underlying designated sponsor — document this relationship explicitly per partner.
- **IND public register is the single source of truth for NL.** Surface https://ind.nl/en/public-register-recognised-sponsors → use the "Au pair" section of the Au pair and Exchange recognised-sponsor register. Any agency not in this register cannot legally apply for an NL au-pair residence permit.
- **BA Gütezeichen is the safety signal for Germany.** Surface https://www.guetegemeinschaft-aupair.de/ members list. Choosing a Gütezeichen agency materially reduces abuse risk versus a non-vetted German placement (BA quality mark requires the agency to meet RAL standards on contract terms, complaint handling, and host-family screening).
- **France au-pair contacts are weaker** — there is no centralised French au-pair sponsor register equivalent to IND's. France-Visas portal + CAPAGO South Africa (fr-za.capago.eu) handle the visa application; post-arrival validation of the VLS-TS is done online via the **ANEF portal** (administration-etrangers-en-france.interieur.gouv.fr) within 3 months of arrival, NOT at OFII (which handled older procedures and may not apply under current VLS-TS rules — verify against france-visas.gouv.fr). IAPA's vetted-member list is the best cross-check for French au-pair agencies.
- **IAPA is an industry body, not a regulator** — useful as a secondary cross-check (vetted members commit to an ethical code) but **never proof of legal authorisation**. Not a substitute for State Dept designation or IND recognition. Document this distinction clearly on the IAPA note.
- **SA-side mandatory services** — DIRCO (apostille on SAPS PCC + other documents), SAPS (PCC), Home Affairs (passport), AA South Africa (IDP), Goethe-Institut Johannesburg/Pretoria (A1 German for German placements). Surface each with its official URL, current fee, and processing time.
- **SA company verification** — for any SA-based sponsor partner, verify on cipc.co.za (CIPC company registry) and check labour.gov.za for private employment agency registration under the Employment Services Act. African Ambassadors (CIPC-registered), Au Pair in America SA (CIPC-registered as AIFS SA partner), OVC (CIPC-registered) are the well-documented SA partners.
- **Cultural Care + AIFS SA-facing presence** — Cultural Care operates SA candidate intake via African Ambassadors (Cape Town head office, regional offices nationwide); AIFS operates Au Pair in America SA directly (Johannesburg office). Both are referral arrangements — the LEGAL sponsor is the US-designated parent (Cultural Care / AIFS). Document this so candidates understand which entity holds their visa sponsorship.
- **Distinguish sponsor agencies (designated, legal) from referral partners (SA-side, optional)** — same model as the TEFL prompts' "programme operators vs recruiters" pattern.
- **No Facebook groups, WhatsApp-only contacts, or Instagram DM "consultants"** — exclude. These are channels for the scam patterns in section 5. Legitimate sponsor agencies have official websites, official email addresses, and (for SA-facing partners) physical office addresses.
- **Confirmed-source list** — j1visa.state.gov sponsor search, ind.nl register, guetegemeinschaft-aupair.de, southafrica.diplo.de, france-visas.gouv.fr, dirco.gov.za, saps.gov.za, home-affairs.gov.za, aa.co.za, goethe.de, iapa.org all go to `confirmed`. Sponsor agency own websites are `confirmed` for their own fee disclosures (US State Dept requires disclosure). HelloPeter, TrustPilot, Reddit are `alleged` until cross-verified.
- **Fee model transparency** — every sponsor agency and SA-side partner must have a `fee_model` line. Au pair pays / host family pays / sponsor pays / shared / no fee. If a partner's fee model is not transparent on their website, flag this as a yellow flag — legitimate sponsors are required by State Dept to disclose fees clearly.
- **24-hour emergency lines** — Cultural Care, AIFS, Go Au Pair, AuPairCare all publish 24-hour emergency contact lines for au pairs in placement. Surface these in the sponsor agency notes; they are the first port of call for in-country abuse or emergency.
- **Treat the OISC / MARA / immigration-advice boundary lightly** — au-pair destinations are USA / NL / DE / FR, not UK / AU / Ireland, so the regulated-immigration-advice constraints from those wikis do not apply directly. Au-pair sponsor agencies are not immigration advisers; they are programme operators designated/recognised by the destination government. Keep the "information not advice" framing per project house style.
- **For SA candidates pre-decision** — direct them to the State Dept sponsor search (USA) and IND public register (NL) as the **legal authorisation** anchors; for those two destinations, an agency not on the register cannot legally place an au pair. For Germany and France there is no equivalent single-source legal register: use the **Gütegemeinschaft Au-pair members list (DE)** and **IAPA vetted-member directory (cross-destination)** as risk-reduction signals — absence from these lists indicates higher risk and warrants further verification, but does not automatically indicate illegitimacy. Document the distinction between "legal authorisation register" (USA / NL) and "industry vetting signal" (DE / FR / cross-destination).
- Folder structure: `Sponsor Agencies/`, `Regulatory Bodies/`, `SA-Side Services/`, `Organisations/`
