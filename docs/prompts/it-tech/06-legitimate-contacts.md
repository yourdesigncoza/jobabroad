# Prompt: IT / Tech — Legitimate Contacts & Official Links

> Run with `/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-it-tech-06-contacts`

---

/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-it-tech-06-contacts

**Goal:** Build a verified directory of legitimate destination immigration authorities, skills-assessment bodies, ICT-specialist recruiters, official destination embassies, and SA-based tech-pathway support organisations that an SA ICT professional can contact with confidence — with scope, official URLs, contact details, fee model, and any red flags clearly noted. Out of scope: hotels, generic immigration agents not specialised in tech, government bodies unrelated to ICT migration.

**Seed entities:**
- DETE (Department of Enterprise, Tourism and Employment — Ireland — CSEP issuing authority)
- UKVI (UK Visas and Immigration — Skilled Worker route) + Immigration Advice Authority (IAA — UK adviser regulator; replaced OISC on 16 January 2025)
- German Missions in South Africa (southafrica.diplo.de) + Auswärtiges Amt (Federal Foreign Office — primary work-visa issuing authority via consular network; BAMF is the residence-permit / Blue Card and asylum agency, NOT the main visa-issuing body) + Bundesagentur für Arbeit (Federal Employment Agency — labour-market approval for skilled-worker visas where required) + Anabin / ZAB recognition portals
- IRCC (Immigration, Refugees and Citizenship Canada — Express Entry) + CICC (College of Immigration and Citizenship Consultants — Canada paid-consultant regulator)
- ACS (Australian Computer Society — ICT skills assessment) + Department of Home Affairs Australia + MARA / OMARA (migration-agent regulator)
- WES (World Education Services) + the full IRCC designated-ECA list (CES, ICAS, IQAS, ICES, MCC) — Canada ECA
- IITPSA (Institute of Information Technology Professionals South Africa — voluntary SA professional body)

**Source constraints:** enterprise.gov.ie (DETE), irishimmigration.ie (ISD — entry visas + Stamp 4), cro.ie (Irish Companies Registration Office), gov.uk/government/organisations/uk-visas-and-immigration, gov.uk/government/publications/register-of-licensed-sponsors-workers (verify any UK employer), gov.uk/find-an-immigration-adviser (Immigration Advice Authority adviser finder), portal.immigrationadviceauthority.gov.uk (IAA register — replaced OISC on 16 January 2025), bamf.de (residence permits, Blue Card), auswaertiges-amt.de (Federal Foreign Office — primary visa-issuing network), arbeitsagentur.de (Bundesagentur für Arbeit — labour-market approval), anerkennung-in-deutschland.de (recognition portal), anabin.kmk.org (institution + degree equivalence), kmk.org/zab and zab.kmk.org (ZAB Statement of Comparability), make-it-in-germany.com (federal information portal), southafrica.diplo.de (German Embassy Pretoria — official SA-specific contact), canada.ca/en/immigration-refugees-citizenship, ircc.canada.ca/english/contacts/index.asp, canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/documents/education-assessed.html (IRCC designated ECA providers list — WES is one), college-ic.ca (CICC public register for Canadian paid immigration consultants), esdc.gc.ca and jobbank.gc.ca (Canada LMIA + employer verification), wes.org, acs.org.au, immi.homeaffairs.gov.au, mara.gov.au (Migration Agents Registration Authority — verify any Australian migration agent), official destination embassy / consulate sites for UK, Ireland, Canada, Australia in South Africa, iitpsa.org.za, sable-international.com (IAA-registered SA-and-UK immigration consultancy — referral partner; verify the specific adviser on the IAA register), CIPC (cipc.co.za — verify any SA-registered company), HelloPeter, TrustPilot, LinkedIn — flag SA tech expat / r/IWantOut / r/germany Reddit communities as anecdotal reputation signals

**Iterations:** 6

---

## Note schemas

**DESTINATION AUTHORITY note:**
```markdown
---
type: destination_authority
name:
short_name:
country:
function: [immigration | skills_assessment | qualification_recognition | sponsor_register]
profession_relevance: ict
official_url:
overseas_applicant_guidance_url:
sa_specific_guidance_url:
processing_time_official:
processing_time_reported:
contact_email_or_form:
in_scope: [yes — recruiter_or_placement_facing_or_government_ict_migration_authority | no]
evidence_strength: confirmed
tags: [destination-authority, ict, work-abroad, [country_slug]]
sources:
  -
---

# Destination Authority Name

What this body does, why an SA ICT worker contacts it, and where they fit in the pathway.

## SA ICT Applicant Process
Step-by-step from the official overseas-applicant guidance — exact URLs only.

## Contact Details
Email / online form / phone (only if listed officially). Never publish phone numbers that aren't on the official website.

## Real Processing Times
Official vs. reported (flag forum / Reddit reports as anecdotal).

## Connections
- [[Visa Route]] — required_before, source: [url]
- [[Skills-Assessment Body]] — referred_to, source: [url]

## Sources
- [Source title](url)
```

**ORGANISATION note:**
```markdown
---
type: organisation
legal_name:
trading_name:
cipc_registered: [yes | no | unknown | not_sa]
entity_type: [ict_recruiter | immigration_consultant | document_concierge | skills_assessment_body | professional_association | tech_employer_with_sponsorship]
destinations_covered: []
ict_specialism: [yes | no | partial]
adviser_regulator: [IAA_UK | MARA_Australia | CICC_Canada | provincial_law_society | not_applicable]
adviser_registration_number:
adviser_registration_status: [active | expired | not_applicable]
adviser_verification_url:
initial_consultation_fee: [Amount ZAR | Free]
fee_payer: [applicant_pays | employer_pays | shared | milestone]
contact_url:
in_scope: [yes — ict_recruiter_or_consultant | no]
evidence_strength: confirmed | alleged | rumoured
tags: [organisation, ict-recruiter, work-abroad]
sources:
  -
---

# Organisation Name

What they do for SA ICT workers, which destinations they cover, and their fee model.

## Services for SA ICT Workers
Specific services (CV placement, visa support, skills-assessment guidance). Note if ICT specialism is their primary line or just one of many.

## Fee Structure
Who pays — applicant or employer. Charging the applicant a placement fee may breach SA labour-broker rules and the SA Employment Services Act. Flag any model unclear on this.

## Reputation Signals
HelloPeter / TrustPilot / LinkedIn summary. If none found, state "No documented complaints found as at [date]." Do not summarise individual Reddit posts as authoritative.

## Verification
- IAA (UK — replaced OISC on 16 January 2025): look up at gov.uk/find-an-immigration-adviser
- MARA / OMARA (Australia): look up at mara.gov.au/search-the-register
- CICC (Canada paid consultants): look up at college-ic.ca; for lawyers verify with the relevant provincial / territorial law society
- CIPC (SA): verify entity registration if SA-based at cipc.co.za

## Connections
- [[Destination]] — places_ict_workers_in, source: [url]
- [[Visa Route]] — assists_with, source: [url]

## Sources
- [Source title](url)
```

**SA PROFESSIONAL BODY note:**
```markdown
---
type: sa_professional_body
name:
short_name:
function: [voluntary_professional_body | regulator | recognition_body]
official_url:
relevance_to_overseas_ict_application: [primary | supporting | not_required]
ict_membership_required_in_sa: [no — ict_is_non_regulated_in_sa]
evidence_strength: confirmed
tags: [sa-professional-body, ict, work-abroad]
sources:
  -
---

# Body Name

What this body does in SA and whether overseas authorities require any document from it. Always note: ICT is NON-REGULATED in SA — there is no statutory professional registration requirement; IITPSA membership is voluntary.

## Connections
- [[Destination Authority]] — supplies_letter_to, source: [url]

## Sources
- [Source title](url)
```

**EDGE metadata:**
- `relationship_type`: required_before | accepts_assessment_from | places_ict_workers_in | registered_with | partners_with | assists_with | referred_to
- `description`: short label
- `evidence_strength`: confirmed | alleged | rumoured
- `sources`: at least one URL

---

## Runtime rules

- `evidence_strength`: `confirmed` | `alleged` | `rumoured`
- Note that charging an applicant a placement fee may breach the SA Employment Services Act (s15 — private employment agency / work-seeker fee rules) — flag any recruiter whose model is unclear on this
- Distinguish destination authorities and skills-assessment / ECA bodies (official or designated pathway bodies — some are commercial and charge fees) from recruiters / consultants (optional, commercial)
- Out-of-scope contacts: hotels, hospitality recruiters, non-ICT placement agencies, generic government departments unrelated to ICT migration — do NOT include
- Verify every UK immigration adviser on the IAA register (gov.uk/find-an-immigration-adviser — IAA replaced OISC on 16 January 2025); every Australian migration agent on MARA (mara.gov.au); every Canadian paid consultant on CICC (college-ic.ca) or the relevant provincial law society
- Date-stamp processing times and fees — these change
- Cite primary government / regulator URLs only for any confirmed claim
- Folder structure: `Destination Authorities/`, `Organisations/`, `SA Professional Bodies/`
