# Prompt: Seasonal — Legitimate Contacts & Official Links

> Run with `/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-seasonal-06-contacts`

---

/vault-builder ~/zoot/projects/wiki-builds/work-abroad-web/wa-seasonal-06-contacts

**Goal:** Build a verified directory of official J1 sponsor agencies, government visa portals, and IEC Recognized Organizations that South African students and young adults can contact for seasonal and working holiday programmes — with scope, fee structure, and SA-specific notes clearly documented for each.

**Seed entities:**
- USIT / j1online.ie (primary SA-facing J1 sponsor agency; formerly operated from Ireland; serves SA university market)
- CIEE — Council on International Educational Exchange (US-side J1 designated sponsor)
- STS Travel (Student Travel Schools — J1 sponsor operating in SA)
- SWAP Working Holidays (IEC Recognized Organization — Canada; SA entry point)
- US Embassy Pretoria (official J1 visa interview location for SA applicants; za.usembassy.gov)

**Source constraints:** j1online.ie, ciee.org, ststravelsa.com (or current STS SA website), swapworkingholidays.org, j2visa.state.gov/sponsors (official designated sponsor list), za.usembassy.gov, gov.uk/youth-mobility, ircc.canada.ca/iec, HelloPeter (for SA community trust signals — flag as anecdotal), cipc.co.za (CIPC registration check for SA entities)

**Iterations:** 6

---

## Note schemas — apply to every note created

**SPONSOR AGENCY note:**
```markdown
---
type: sponsor_agency
legal_name:
trading_name:
scope: [j1_sponsor | iec_recognized_org | both]
country_of_operation:
sa_facing: [yes | no]
programmes_offered: [j1_swt | j1_intern | uk_yms_assistance | canada_iec | other]
us_dept_of_state_designated: [yes | no | not_applicable]
ircc_recognized_org: [yes | no | not_applicable]
sa_cipc_registered: [yes | no | unknown]
programme_fee_range_usd:
programme_fee_range_zar:
job_placement_included: [yes | no | optional]
insurance_included: [yes | no]
contact_url:
evidence_strength: confirmed | alleged | rumoured
tags: [sponsor-agency, seasonal, j1, south-africa]
sources:
  -
---

# Sponsor Agency Name

What they do for SA students, which programmes they offer, and their fee model.

## Services for SA Applicants
Specific services (DS-2019 issuance, job matching, pre-departure orientation, arrival support, etc.).

## Fee Structure
Total programme cost; what is included vs. what the applicant pays separately (MRV fee, SEVIS, flights).

## SA Community Reputation
HelloPeter / Facebook SA student travel groups reputation summary. If none found, state "No documented complaints found as at [date]."

## Connections
- [[Programme]] — administers, source: [url]
- [[Destination]] — places_applicants_in, source: [url]

## Sources
- [Source title](url)
```

**GOVERNMENT BODY note:**
```markdown
---
type: government_body
name:
short_name:
category: [visa_authority | programme_administrator | embassy | regulator]
jurisdiction:
relevant_url:
sa_specific_page_url:
evidence_strength: confirmed
tags: [government, seasonal, visa, south-africa]
sources:
  -
---

# Government Body Name

What this body does and why an SA seasonal applicant needs to know about it.

## SA Applicant's Interaction
Exactly what an SA applicant must do with this body (e.g. "Book J1 visa interview appointment at za.usembassy.gov/visas"; "Apply for YMS visa directly at gov.uk/youth-mobility/apply").

## Connections
- [[Programme]] — administers, source: [url]

## Sources
- [Source title](url)
```

**EDGE metadata:**
- `relationship_type`: administers | places_applicants_in | designated_by | recognized_by | partners_with | required_before
- `description`: short label
- `evidence_strength`: confirmed | alleged | rumoured
- `sources`: at least one URL

---

## Runtime rules

- `evidence_strength`: `confirmed` | `alleged` | `rumoured`
- **Verify sponsor designation status:** Every J1 sponsor agency must be cross-checked against the US Dept of State list at j2visa.state.gov/sponsors; if an agency claims to be a J1 sponsor but is not on this list, document that discrepancy explicitly
- **USIT SA status:** USIT historically operated the South African J1 market from j1online.ie; verify whether this is still active for SA students or has been transferred to another agency
- **Distinguish sponsor from recruiter:** A J1 sponsor issues the DS-2019 and is responsible for the programme participant — this is a regulated, legally accountable role; contrast with unregulated "recruitment agencies" which have no legal standing in the J1 programme
- **No placement fee from nurse:** Charging an SA student a placement fee is illegal under SA labour law (Basic Conditions of Employment Act, s. 91) if the fee is for employment introduction — flag any sponsor whose fee model is unclear; note that J1 programme fees are for programme administration, not job placement per se
- **Canada IEC Recognized Organization channel:** Document the Recognized Organization's role precisely — they nominate the applicant to IRCC; the applicant still applies directly to IRCC after being nominated; the RO is not the visa-issuing authority
- Date-stamp all fees and contact details — these change annually
- Folder structure: `Sponsor Agencies/`, `Government Bodies/`
