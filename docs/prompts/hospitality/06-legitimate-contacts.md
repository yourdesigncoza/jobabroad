# Prompt: Hospitality — Legitimate Contacts & Official Links

> Run with `/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-hospitality-06-contacts`

---

/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-hospitality-06-contacts

**Goal:** Curate the actual contact directory a South African hospitality worker needs to start each route — government bodies, hotel-group recruitment portals, recruitment agencies confirmed to place SA workers, skills-assessment bodies, SA-side support services, embassies and consulates, and reporting channels — with URLs, costs, processing times, and an honest assessment of usefulness for SA hospitality workers specifically.

**Seed entities:**
- UAE MOHRE (Ministry of Human Resources and Emiratisation) + ICP / GDRFA Dubai — official work-permit and Employment Visa issuers
- UK Visas and Immigration (UKVI) + Worker and Temporary Worker Sponsor Register — verify any UK hotel sponsor before applying
- Hotel groups confirmed actively recruiting SA staff — Marriott International (career portal), Hilton (career portal), Jumeirah Group, Emaar Hospitality, Accor, Four Seasons (where confirmed)
- VETASSESS Skills Assessment (Australia) + Department of Home Affairs (visa processing)
- SA-side bodies — DHA (passport), SAPS (PCC), DIRCO (apostille), DEL (Department of Employment and Labour for fraud reporting), CATHSSETA (qualifications), SAQA (foreign credential evaluation)

**Source constraints:** mohre.gov.ae, u.ae, gdrfa.ae, gov.uk/government/publications/register-of-licensed-sponsors-workers, gov.uk/skilled-worker-visa, immi.homeaffairs.gov.au, vetassess.com.au, canada.ca/en/employment-social-development/services/foreign-workers/, ircc.canada.ca, marriott.com/careers, jobs.hilton.com, careers.jumeirah.com, careers.emaar.com, careers.accor.com, careers.fourseasons.com, dha.gov.za, saps.gov.za, dirco.gov.za, labour.gov.za, cathsseta.org.za, saqa.org.za, southafrica.embassy.gov.au/pret/visascams.html, ukinsouthafrica.fcdo.gov.uk, za.usembassy.gov, ahcafrica.gov.ae

**Iterations:** 6

---

## Note schemas — apply to every note created

**ORGANISATION note:**
```markdown
---
type: organisation
name:
type_of_body: [government | hotel-group | recruitment-agency | skills-assessment | sa-side-regulator | embassy | reporting-channel]
country:
scope:
official_url:
contact_method:
fee:
processing_time:
sa_specific_usefulness: [high | medium | low | not-relevant-to-sa]
verification_required: [yes-must-verify | already-on-official-register | self-evident]
last_verified_date:
evidence_strength: confirmed | alleged | rumoured
tags: [organisation, hospitality, south-africa]
sources:
  -
---

# Organisation Name

2–4 sentences: what they do, why they matter for SA hospitality workers, what they actually deliver.

## How to Engage
Application portal URL, contact form, phone, in-person consulate (if relevant). State realistic expectations.

## Cost and Time
What the worker pays them (or zero if employer-paid). Realistic processing range.

## Honest Assessment
Is this contact a high-impact starting point or a low-value diversion? Have any complaints been documented? Has SA placement been confirmed publicly?

## Connections
- [[Visa Route]] — issues / sponsors / regulates, source: [url]

## Sources
- [Official URL](url)
```

**HOTEL_GROUP note:** *(create one per major hotel group with confirmed SA recruitment)*
```markdown
---
type: hotel_group
name:
career_portal_url:
sa_recruitment_confirmed: [yes-publicly | inferred-via-job-postings | unconfirmed]
properties_in_destinations: []
typical_roles_for_sa: []
worker_pays_recruitment_fee: [no-employer-pays | unknown]
notable_complaints_or_warnings:
last_verified_date:
evidence_strength: confirmed | alleged | rumoured
tags: [hotel-group, hospitality, south-africa]
sources:
  -
---

# Hotel Group Name

2 sentences: brand, scale, common destinations.

## SA Recruitment Confirmation
What evidence shows this group recruits SA staff (job postings, public statements, SA media coverage).

## Application Path
Career portal URL + typical application process.

## Connections
- [[Visa Route]] — sponsors_via, source: [url]

## Sources
- [Career portal URL](url)
```

**REPORTING_CHANNEL note:**
```markdown
---
type: reporting_channel
name:
country:
report_type: [recruitment-fraud | visa-fraud | labour-exploitation | sponsor-misconduct | romance-scam | wage-theft]
report_url:
phone_or_email:
expected_response_time:
evidence_strength: confirmed
tags: [reporting-channel, hospitality, south-africa]
sources:
  -
---

# Reporting Channel Name

Plain instruction: when to use this channel, what you can report, what happens after.

## Connections
- [[Scam Pattern]] — report_to, source: [url]

## Sources
- [Official channel URL](url)
```

**EDGE metadata:**
- `relationship_type`: regulates | issues | recruits | sponsors | reports_to | verifies | competes_with | partners_with
- `description`: short label
- `evidence_strength`: confirmed | alleged | rumoured
- `sources`: at least one URL

---

## Runtime rules

- `evidence_strength`: `confirmed` | `alleged` | `rumoured`
- **Honest assessment is mandatory** — for every contact, state plainly whether SA recruitment is confirmed, whether the contact moves the application forward, or whether the contact is mostly informational. Avoid endorsing any single recruitment agency without evidence
- **UAE official channels** — MOHRE (mohre.gov.ae) regulates labour; ICP (u.ae) issues federal visas; GDRFA Dubai (gdrfa.ae) handles Dubai-specific residency. Document the federal vs emirate distinction so readers do not look at the wrong portal
- **UK Worker Sponsor Register** at gov.uk/government/publications/register-of-licensed-sponsors-workers is the authoritative check for any UK hotel claiming sponsor status. CSV file updated weekly. Document how to use it
- **Hotel-group career portals are the primary recruitment route, not third-party agencies** — state this. Marriott, Hilton, Jumeirah, Emaar, Accor, Four Seasons all run direct recruitment portals. Going via an agent is optional, not required, and adds risk if the agent is unverified
- **No SA-side licensed scheme operator structure for hospitality** — unlike farming (Defra-endorsed UK seasonal operators), hospitality has no SA-side official operator list. Recruitment agencies based in SA (Hospitality Jobs Africa, etc.) are commercial recruiters, not regulated operators. Make this distinction clear
- **CATHSSETA** is the SA Sector Education and Training Authority for hospitality — issues NQF-aligned qualifications, useful for downstream skills-assessment evidence (e.g. VETASSESS in Australia). Not a regulator
- **DEL (Department of Employment and Labour)** is the SA-side reporting channel for recruitment-agency fraud and labour-broker complaints. SAPS Cybercrime handles online recruitment fraud. Both should be named
- **Embassies and consulates** — UK High Commission Pretoria + visa centres in JHB/CPT/DBN; AHC Pretoria for Australia; Canadian Embassy Pretoria; UAE Embassy in Pretoria. Name these for visa-related queries and document the distinction (some issue visas, some only handle queries)
- **Maritime / cruise recruitment is separate** — name 1–2 verified cruise-line career portals (Carnival careers, RCL careers) for readers who confused themselves. Do not develop deeply
- All contact information must include URL + the date last verified
- Folder structure: `Government Bodies/`, `Hotel Groups/`, `Recruitment Agencies/`, `Skills Assessment/`, `SA-Side Bodies/`, `Embassies and Consulates/`, `Reporting Channels/`
